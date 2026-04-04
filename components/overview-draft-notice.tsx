\"use client\";

import { useEffect, useState } from "react";
import { readLocalInvoices } from "@/lib/storage";

export function OverviewDraftNotice() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(readLocalInvoices().length);
  }, []);

  if (!count) return null;

  return (
    <div className="rounded-[20px] border border-[var(--line)] bg-[rgba(201,255,96,.08)] p-4 text-[0.84rem] leading-6 text-[var(--accent)]">
      You currently have {count} locally saved draft {count === 1 ? "invoice" : "invoices"} in this browser.
      The next backend stage will move these into real workspace records.
    </div>
  );
}
