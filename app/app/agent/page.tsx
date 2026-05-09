"use client";

import { useState, useRef, useEffect } from "react";
import { AppHeader } from "@/components/app-header";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type ToolResult = { tool: string; input: Record<string, unknown>; result: string };

type Message = {
  role: "user" | "agent";
  content: string;
  toolResults?: ToolResult[];
  timestamp: Date;
};

const SUGGESTED_PROMPTS = [
  "Create an invoice for $2,400 for Atlas Commerce, 3 milestones: Design ($800), Development ($1,200), Launch ($400)",
  "Show me all my active invoices",
  "What are my workspace stats?",
  "List my clients",
  "Get the payment link for my latest invoice",
];

function renderValue(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v).slice(0, 60);
}

function ToolResultCard({ result }: { result: ToolResult }) {
  let parsed: Record<string, unknown> | null = null;
  try { parsed = JSON.parse(result.result); } catch { /* raw string */ }

  const toolLabel: Record<string, string> = {
    create_invoice: "Invoice created",
    list_invoices: "Invoices loaded",
    get_invoice: "Invoice details",
    get_workspace_stats: "Workspace stats",
    list_clients: "Clients loaded",
    get_payment_link: "Payment link ready",
    update_invoice_status: "Status updated",
  };

  return (
    <div className="rounded-[14px] border border-[rgba(201,255,96,.2)] bg-[rgba(201,255,96,.04)] p-3 text-[0.78rem]">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[var(--accent)]">⚡</span>
        <span className="font-bold text-[var(--accent)]">{toolLabel[result.tool] || result.tool}</span>
      </div>
      {parsed ? (
        <div className="grid gap-1">
          {Object.entries(parsed)
            .filter(([k]) => !["success", "instructions"].includes(k))
            .slice(0, 6)
            .map(([k, v]) => {
              const sv = renderValue(v);
              const isUrl = typeof v === "string" && v.startsWith("http");
              return (
                <div key={k} className="flex items-start justify-between gap-4">
                  <span className="shrink-0 text-[var(--muted)] capitalize">{k.replace(/([A-Z])/g, " $1").trim()}</span>
                  <span className="text-right font-semibold text-[var(--text)] break-all">
                    {isUrl
                      ? <a href={sv} target="_blank" rel="noreferrer" className="text-[var(--accent)] underline underline-offset-2">{sv.length > 40 ? sv.slice(0, 40) + "..." : sv}</a>
                      : sv}
                  </span>
                </div>
              );
            })}
          {parsed.instructions ? (
            <div className="mt-1 rounded-[10px] bg-white/4 px-3 py-2 text-[var(--muted)] italic">
              {String(parsed.instructions)}
            </div>
          ) : null}
        </div>
      ) : (
        <span className="text-[var(--muted)]">{result.result}</span>
      )}
    </div>
  );
}

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content: "I'm your Stablelane AI Agent. I can create real invoices, load your workspace data, generate payment links, and more, all saved directly to your account.\n\nWhat would you like me to do?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput("");
    setLoading(true);

    const userMessage: Message = { role: "user", content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);

    // Build history
    const history = messages.slice(1).map(m => ({
      role: m.role === "agent" ? "assistant" : "user",
      content: m.content
    }));

    // Get auth token
    let authToken: string | undefined;
    try {
      const supabase = createSupabaseBrowserClient();
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        authToken = data.session?.access_token;
      }
    } catch { /* no token */ }

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history, authToken })
      });

      const data = await res.json();

      if (data.error) {
        setMessages(prev => [...prev, {
          role: "agent",
          content: `Error: ${data.error}`,
          timestamp: new Date()
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: "agent",
          content: data.response || "Done.",
          toolResults: data.toolResults,
          timestamp: new Date()
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: "agent",
        content: "Connection error. Try again.",
        timestamp: new Date()
      }]);
    }

    setLoading(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <AppHeader />
      <div className="mx-auto w-[min(calc(100%-36px),1280px)] py-8">
        <div className="mb-6">
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[rgba(201,255,96,.15)] text-[var(--accent)]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L10 6L14 6.5L11 9.5L11.5 14L8 12L4.5 14L5 9.5L2 6.5L6 6L8 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="font-[family-name:var(--font-cormorant)] text-[1.8rem] tracking-[-0.04em]">Stablelane Agent</h1>
            <div className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
              Arc testnet · Live
            </div>
          </div>
          <p className="text-[0.84rem] text-[var(--muted)]">
            Autonomous AI that creates invoices, loads workspace data, and generates payment links, in real time.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="flex flex-col overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--surface)]" style={{ height: "72vh" }}>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-[0.7rem] font-bold ${msg.role === "agent" ? "bg-[rgba(201,255,96,.15)] text-[var(--accent)]" : "bg-white/8 text-[var(--muted)]"}`}>
                    {msg.role === "agent" ? "AI" : "You"}
                  </div>
                  <div className={`max-w-[82%] flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div className={`rounded-[18px] px-4 py-3 text-[0.88rem] leading-6 whitespace-pre-wrap ${msg.role === "user" ? "bg-[var(--accent)] text-[#08100b] font-medium" : "bg-white/5 border border-white/8 text-[var(--text)]"}`}>
                      {msg.content}
                    </div>
                    {msg.toolResults && msg.toolResults.length > 0 && (
                      <div className="w-full flex flex-col gap-2">
                        {msg.toolResults.map((tr, j) => (
                          <ToolResultCard key={j} result={tr} />
                        ))}
                      </div>
                    )}
                    <div className="text-[0.68rem] text-[var(--muted)]">{msg.timestamp.toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-[rgba(201,255,96,.15)] flex items-center justify-center text-[0.7rem] font-bold text-[var(--accent)]">AI</div>
                  <div className="rounded-[18px] bg-white/5 border border-white/8 px-4 py-3">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => <div key={i} className="h-2 w-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-[var(--line)] p-4">
              <div className="flex gap-3 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tell the agent what to do... (Enter to send)"
                  rows={2}
                  className="flex-1 resize-none rounded-[16px] border border-white/8 bg-white/4 px-4 py-3 text-[0.88rem] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/30 transition"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="shrink-0 h-11 w-11 rounded-[14px] bg-[var(--accent)] flex items-center justify-center text-[#08100b] font-bold transition hover:-translate-y-px disabled:opacity-40"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M14 8L2 8M14 8L9 3M14 8L9 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="mb-3 text-[0.74rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Try asking</div>
              <div className="grid gap-2">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button key={i} onClick={() => sendMessage(prompt)} disabled={loading}
                    className="rounded-[14px] border border-white/8 bg-white/3 px-3 py-2.5 text-left text-[0.8rem] text-[var(--muted)] transition hover:bg-white/6 hover:text-[var(--text)] disabled:opacity-40">
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="mb-3 text-[0.74rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">What it actually does</div>
              <div className="grid gap-2">
                {[
                  { icon: "📄", label: "Creates real invoices", desc: "Saved to your Supabase" },
                  { icon: "🔗", label: "Generates payment links", desc: "Live /pay/[id] URLs" },
                  { icon: "📊", label: "Reads live stats", desc: "From your real data" },
                  { icon: "👥", label: "Lists your clients", desc: "From your workspace" },
                  { icon: "🔄", label: "Updates statuses", desc: "Draft → Sent → Escrow" },
                ].map((cap, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-[12px] bg-white/3 px-3 py-2">
                    <span>{cap.icon}</span>
                    <div>
                      <div className="text-[0.82rem] font-semibold">{cap.label}</div>
                      <div className="text-[0.72rem] text-[var(--muted)]">{cap.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="mb-2 text-[0.74rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Stack</div>
              <div className="grid gap-1.5 text-[0.78rem]">
                <div className="flex justify-between"><span className="text-[var(--muted)]">Model</span><span className="font-semibold">Claude Haiku 4.5</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted)]">Loop</span><span className="font-semibold">Agentic · up to 5 steps</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted)]">Database</span><span className="font-semibold">Supabase · real writes</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted)]">Chain</span><span className="font-semibold">Arc Testnet</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
