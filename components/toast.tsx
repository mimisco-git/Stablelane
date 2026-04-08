"use client";

import { useEffect, useState } from "react";

type Toast = {
  id: string;
  message: string;
  type: "ok" | "err" | "info";
};

let addToastFn: ((message: string, type?: Toast["type"]) => void) | null = null;

export function toast(message: string, type: Toast["type"] = "ok") {
  if (addToastFn) addToastFn(message, type);
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToastFn = (message, type = "ok") => {
      const id = `toast_${Date.now()}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };
    return () => { addToastFn = null; };
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2 flex-col gap-2 lg:bottom-8">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[0.88rem] font-semibold shadow-[0_8px_32px_rgba(0,0,0,.5)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 ${
            t.type === "ok"
              ? "border border-[var(--line)] bg-[rgba(10,18,13,.96)] text-[var(--accent)]"
              : t.type === "err"
              ? "border border-white/12 bg-[rgba(10,18,13,.96)] text-red-400"
              : "border border-white/12 bg-[rgba(10,18,13,.96)] text-[var(--text)]"
          }`}
        >
          <span>{t.type === "ok" ? "✓" : t.type === "err" ? "✗" : "ℹ"}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
