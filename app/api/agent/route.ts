import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// Server-side Supabase client using service role
function getSupabase(authToken?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

  const client = createClient(url, key, {
    auth: { persistSession: false },
    global: authToken
      ? { headers: { Authorization: `Bearer ${authToken}` } }
      : {},
  });
  return client;
}

// ── Tool definitions ──────────────────────────────────────────────────────────
const tools = [
  {
    name: "create_invoice",
    description: "Create a real invoice in Stablelane with USDC milestone escrow. This actually saves to the database.",
    input_schema: {
      type: "object",
      properties: {
        clientName: { type: "string", description: "Name of the client" },
        clientEmail: { type: "string", description: "Client email address" },
        amount: { type: "string", description: "Total invoice amount in USDC" },
        title: { type: "string", description: "Invoice title or project name" },
        description: { type: "string", description: "Work description" },
        milestones: {
          type: "array",
          description: "Payment milestones. If not specified, create one milestone for full amount.",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              amount: { type: "string" },
              detail: { type: "string" }
            },
            required: ["title", "amount"]
          }
        },
        dueDate: { type: "string", description: "Due date in YYYY-MM-DD format. Default to 30 days from today." }
      },
      required: ["clientName", "amount", "description"]
    }
  },
  {
    name: "list_invoices",
    description: "List all invoices in the workspace with their current status",
    input_schema: {
      type: "object",
      properties: {
        status: { type: "string", description: "Filter by status: Draft, Sent, In escrow, Completed. Leave empty for all." },
        limit: { type: "number", description: "Max invoices to return. Default 5." }
      }
    }
  },
  {
    name: "get_invoice",
    description: "Get full details of a specific invoice including escrow status",
    input_schema: {
      type: "object",
      properties: {
        invoiceId: { type: "string", description: "Invoice ID" }
      },
      required: ["invoiceId"]
    }
  },
  {
    name: "get_workspace_stats",
    description: "Get real workspace stats: total revenue, escrows locked, pending releases, client count",
    input_schema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "list_clients",
    description: "List all clients in the workspace",
    input_schema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max clients to return. Default 10." }
      }
    }
  },
  {
    name: "get_payment_link",
    description: "Generate a payment link for a client to fund an invoice escrow",
    input_schema: {
      type: "object",
      properties: {
        invoiceId: { type: "string", description: "Invoice ID to generate payment link for" }
      },
      required: ["invoiceId"]
    }
  },
  {
    name: "update_invoice_status",
    description: "Update the status of an invoice (e.g. mark as Sent, or update escrow status)",
    input_schema: {
      type: "object",
      properties: {
        invoiceId: { type: "string", description: "Invoice ID" },
        status: { type: "string", description: "New status: Draft, Sent, In escrow, Completed" }
      },
      required: ["invoiceId", "status"]
    }
  }
];

// ── Tool execution ────────────────────────────────────────────────────────────
async function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  supabase: ReturnType<typeof getSupabase>,
  userId: string,
  siteUrl: string
): Promise<string> {
  switch (toolName) {
    case "create_invoice": {
      const amount = String(input.amount || "0");
      const dueDate = String(input.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]);
      const milestones = (input.milestones as Array<{ title: string; amount: string; detail?: string }>) || [
        { title: "Full payment", amount, detail: String(input.description || "") }
      ];

      const payload = {
        owner_id: userId,
        title: String(input.title || `Invoice for ${input.clientName}`),
        client_name: String(input.clientName || ""),
        client_email: String(input.clientEmail || ""),
        amount: parseFloat(amount),
        currency: "USDC",
        payment_mode: "Milestone escrow",
        due_date: dueDate,
        description: String(input.description || ""),
        milestones: milestones.map((m, i) => ({
          id: `m${i + 1}`,
          title: m.title,
          amount: m.amount,
          detail: m.detail || ""
        })),
        splits: [],
        status: "Draft",
        escrow_status: "draft",
        reference: `INV-${Date.now()}`,
      };

      const { data, error } = await supabase
        .from("invoice_drafts")
        .insert(payload)
        .select("id, title, client_name, amount, status")
        .single();

      if (error) return `Failed to create invoice: ${error.message}`;

      return JSON.stringify({
        success: true,
        invoiceId: data.id,
        title: data.title,
        client: data.client_name,
        amount: `${data.amount} USDC`,
        status: data.status,
        paymentLink: `${siteUrl}/pay/${data.id}`,
        dashboardLink: `${siteUrl}/app/invoices/${data.id}`,
        message: `Invoice created successfully. Share the payment link with ${data.client_name} to fund the escrow.`
      });
    }

    case "list_invoices": {
      let query = supabase
        .from("invoice_drafts")
        .select("id, title, client_name, amount, currency, status, escrow_status, created_at")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false })
        .limit(Number(input.limit || 5));

      if (input.status) query = query.eq("status", input.status);

      const { data, error } = await query;
      if (error) return `Failed to list invoices: ${error.message}`;
      if (!data?.length) return "No invoices found.";

      return JSON.stringify({
        count: data.length,
        invoices: data.map(inv => ({
          id: inv.id,
          title: inv.title,
          client: inv.client_name,
          amount: `${inv.amount} ${inv.currency}`,
          status: inv.status,
          escrowStatus: inv.escrow_status,
          link: `${siteUrl}/app/invoices/${inv.id}`
        }))
      });
    }

    case "get_invoice": {
      const { data, error } = await supabase
        .from("invoice_drafts")
        .select("*")
        .eq("id", String(input.invoiceId))
        .eq("owner_id", userId)
        .single();

      if (error || !data) return `Invoice not found: ${input.invoiceId}`;

      return JSON.stringify({
        id: data.id,
        title: data.title,
        client: data.client_name,
        clientEmail: data.client_email,
        amount: `${data.amount} ${data.currency}`,
        status: data.status,
        escrowStatus: data.escrow_status,
        escrowAddress: data.escrow_address,
        milestones: data.milestones,
        paymentLink: `${siteUrl}/pay/${data.id}`,
        fundingTx: data.funding_tx_hash,
        releaseTx: data.release_tx_hash,
      });
    }

    case "get_workspace_stats": {
      const { data: invoices } = await supabase
        .from("invoice_drafts")
        .select("amount, status, escrow_status, currency")
        .eq("owner_id", userId);

      if (!invoices) return "Could not fetch stats.";

      const total = invoices.reduce((s, i) => s + (i.amount || 0), 0);
      const completed = invoices.filter(i => i.status === "Completed").reduce((s, i) => s + (i.amount || 0), 0);
      const inEscrow = invoices.filter(i => i.escrow_status === "funded").reduce((s, i) => s + (i.amount || 0), 0);
      const pending = invoices.filter(i => i.escrow_status === "funded" || i.escrow_status === "release_requested").length;
      const drafts = invoices.filter(i => i.status === "Draft").length;

      const { data: clients } = await supabase
        .from("clients")
        .select("id")
        .eq("owner_id", userId);

      return JSON.stringify({
        totalInvoiceValue: `${total.toFixed(2)} USDC`,
        completedRevenue: `${completed.toFixed(2)} USDC`,
        lockedInEscrow: `${inEscrow.toFixed(2)} USDC`,
        pendingReleases: pending,
        draftInvoices: drafts,
        totalInvoices: invoices.length,
        clientCount: clients?.length || 0,
        chain: "Arc Testnet",
        token: "USDC"
      });
    }

    case "list_clients": {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, email, created_at")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false })
        .limit(Number(input.limit || 10));

      if (error) return `Failed to list clients: ${error.message}`;
      if (!data?.length) return "No clients found.";

      return JSON.stringify({
        count: data.length,
        clients: data.map(c => ({ id: c.id, name: c.name, email: c.email }))
      });
    }

    case "get_payment_link": {
      const { data } = await supabase
        .from("invoice_drafts")
        .select("id, title, client_name, amount, currency")
        .eq("id", String(input.invoiceId))
        .eq("owner_id", userId)
        .single();

      if (!data) return `Invoice not found.`;

      // Update status to Sent
      await supabase
        .from("invoice_drafts")
        .update({ status: "Sent" })
        .eq("id", data.id);

      const paymentLink = `${siteUrl}/pay/${data.id}`;
      return JSON.stringify({
        invoiceId: data.id,
        title: data.title,
        client: data.client_name,
        amount: `${data.amount} ${data.currency}`,
        paymentLink,
        statusUpdated: "Sent",
        instructions: `Share this link with ${data.client_name}: ${paymentLink}. They will connect their wallet and fund the escrow on Arc testnet.`
      });
    }

    case "update_invoice_status": {
      const { error } = await supabase
        .from("invoice_drafts")
        .update({ status: input.status })
        .eq("id", String(input.invoiceId))
        .eq("owner_id", userId);

      if (error) return `Failed to update: ${error.message}`;
      return JSON.stringify({ success: true, invoiceId: input.invoiceId, newStatus: input.status });
    }

    default:
      return `Unknown tool: ${toolName}`;
  }
}

// ── Main agent loop ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { message, history = [], authToken } = await req.json();

    if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: "Agent not configured. Add ANTHROPIC_API_KEY to Vercel environment variables."
      }, { status: 500 });
    }

    // Get authenticated user
    const supabase = getSupabase(authToken);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to use the agent." }, { status: 401 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stablelane.vercel.app";

    const systemPrompt = `You are the Stablelane AI Agent. You autonomously manage stablecoin revenue for freelancers on Arc testnet.

When a user asks you to do something, USE THE TOOLS to actually do it. Do not just describe what you would do.

Rules:
- All amounts are USDC on Arc Testnet (Chain ID 5042002)
- When creating invoices, generate a smart title from context if not given
- Default milestones: split evenly if not specified, or use 50/50 if 2 milestones
- Default due date: 30 days from today if not specified
- After every tool call, give a clear human-readable summary of what happened
- If listing invoices/clients, format the results cleanly
- Payment links always end with /pay/[invoiceId]
- Be concise. One clear sentence per action.

You are talking to: ${user.email || user.id}`;

    let messages: Array<{ role: string; content: unknown }> = [
      ...history,
      { role: "user", content: message }
    ];

    const toolResults: Array<{ tool: string; input: Record<string, unknown>; result: string }> = [];
    let finalResponse = "";

    // Agentic loop - keep going until done or 5 iterations
    for (let i = 0; i < 5; i++) {
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

      // Collect text
      const textBlocks = data.content?.filter((b: { type: string }) => b.type === "text") || [];
      const toolBlocks = data.content?.filter((b: { type: string }) => b.type === "tool_use") || [];

      if (textBlocks.length > 0) {
        finalResponse = textBlocks.map((b: { text: string }) => b.text).join("\n");
      }

      // If no tool calls or end_turn, we're done
      if (toolBlocks.length === 0 || data.stop_reason === "end_turn") break;

      // Add assistant message to history
      messages.push({ role: "assistant", content: data.content });

      // Execute all tool calls
      const toolResultContents = [];
      for (const block of toolBlocks) {
        const result = await executeTool(
          block.name,
          block.input as Record<string, unknown>,
          supabase,
          user.id,
          siteUrl
        );

        toolResults.push({ tool: block.name, input: block.input, result });

        toolResultContents.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result
        });
      }

      // Add tool results to messages for next iteration
      messages.push({ role: "user", content: toolResultContents });
    }

    return NextResponse.json({
      response: finalResponse,
      toolResults,
      executedTools: toolResults.map(t => t.tool),
    });

  } catch (err) {
    console.error("Agent error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Agent failed" },
      { status: 500 }
    );
  }
}
