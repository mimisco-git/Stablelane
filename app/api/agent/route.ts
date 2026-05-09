import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// Tools the agent can call - maps to Stablelane backend capabilities
const tools = [
  {
    name: "create_invoice",
    description: "Create a new USDC invoice with milestone escrow for a client on Arc testnet",
    input_schema: {
      type: "object",
      properties: {
        clientName: { type: "string", description: "Name of the client" },
        amount: { type: "string", description: "Invoice amount in USDC" },
        description: { type: "string", description: "Work description" },
        milestones: {
          type: "array",
          description: "Payment milestones",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              amount: { type: "string" },
              detail: { type: "string" }
            }
          }
        },
        dueDate: { type: "string", description: "Due date in YYYY-MM-DD format" }
      },
      required: ["clientName", "amount", "description"]
    }
  },
  {
    name: "check_escrow_status",
    description: "Check the current status of an escrow or invoice",
    input_schema: {
      type: "object",
      properties: {
        invoiceId: { type: "string", description: "Invoice ID to check" }
      },
      required: ["invoiceId"]
    }
  },
  {
    name: "release_milestone",
    description: "Approve and release a milestone payment from escrow to the freelancer",
    input_schema: {
      type: "object",
      properties: {
        escrowAddress: { type: "string", description: "The escrow contract address" },
        milestoneIndex: { type: "number", description: "Index of milestone to release (0-based)" }
      },
      required: ["escrowAddress", "milestoneIndex"]
    }
  },
  {
    name: "get_workspace_stats",
    description: "Get current workspace statistics: revenue, escrows, pending releases",
    input_schema: {
      type: "object",
      properties: {
        workspaceName: { type: "string", description: "Workspace name to query" }
      }
    }
  },
  {
    name: "send_payment_link",
    description: "Generate and send a payment link to a client for an invoice",
    input_schema: {
      type: "object",
      properties: {
        invoiceId: { type: "string", description: "Invoice ID" },
        clientEmail: { type: "string", description: "Client email to send to" }
      },
      required: ["invoiceId"]
    }
  }
];

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], workspaceContext = {} } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Agent not configured. Add ANTHROPIC_API_KEY to environment." }, { status: 500 });
    }

    const systemPrompt = `You are the Stablelane AI Agent. You help freelancers and agencies manage their stablecoin revenue on Arc testnet.

You can:
- Create invoices with milestone escrow (USDC on Arc)
- Check escrow and invoice status
- Release milestone payments on delivery
- Get workspace revenue stats
- Send payment links to clients

Current workspace context:
${JSON.stringify(workspaceContext, null, 2)}

Important:
- All amounts are in USDC on Arc Testnet (Chain ID 5042002)
- Escrow contracts are deployed on Arc testnet
- Be concise and action-oriented
- When you call a tool, explain what you're doing and why
- After tool results, summarize what happened clearly

You are an autonomous agent. When a user asks you to do something, use the appropriate tool to do it. Don't just describe what you would do - do it.`;

    const messages = [
      ...history,
      { role: "user", content: message }
    ];

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        tools,
        messages
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `Anthropic API error: ${err}` }, { status: 500 });
    }

    const data = await response.json();

    // Extract text and tool calls
    const textBlocks = data.content?.filter((b: { type: string }) => b.type === "text") || [];
    const toolBlocks = data.content?.filter((b: { type: string }) => b.type === "tool_use") || [];

    const agentResponse = textBlocks.map((b: { text: string }) => b.text).join("\n");
    const toolCalls = toolBlocks.map((b: { name: string; input: Record<string, unknown> }) => ({
      tool: b.name,
      input: b.input
    }));

    return NextResponse.json({
      response: agentResponse,
      toolCalls,
      stopReason: data.stop_reason,
      model: data.model
    });

  } catch (err) {
    console.error("Agent error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Agent failed" },
      { status: 500 }
    );
  }
}
