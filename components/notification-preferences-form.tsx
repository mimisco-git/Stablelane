"use client";

import { useEffect, useState } from "react";
import { fetchNotificationPreferences, saveNotificationPreferences } from "@/lib/supabase-data";
import { InlineNotice, LoadingState } from "@/components/ui-state";

type Preferences = {
  email_approvals: boolean;
  email_invitations: boolean;
  email_releases: boolean;
  in_app_activity: boolean;
  weekly_summary: boolean;
};

export function NotificationPreferencesForm() {
  const [values, setValues] = useState<Preferences>({
    email_approvals: true,
    email_invitations: true,
    email_releases: true,
    in_app_activity: true,
    weekly_summary: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await fetchNotificationPreferences();
        if (mounted && data) {
          setValues({
            email_approvals: Boolean(data.email_approvals),
            email_invitations: Boolean(data.email_invitations),
            email_releases: Boolean(data.email_releases),
            in_app_activity: Boolean(data.in_app_activity),
            weekly_summary: Boolean(data.weekly_summary),
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  function toggle(key: keyof Preferences) {
    setValues((current) => ({ ...current, [key]: !current[key] }));
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      await saveNotificationPreferences(values);
      setMessage("Notification preferences saved.");
    } catch {
      setMessage("Notification preferences could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState title="Loading notification preferences" detail="Stablelane is reading your saved alert settings." />;
  }

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4">
        <h2 className="mb-1 text-base font-bold tracking-normal">Notification preferences</h2>
        <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
          These settings are now stored in the database, so the workspace can behave more like a real fintech product.
        </p>
      </div>

      <div className="grid gap-3">
        {[
          ["email_approvals", "Email me about approval requests"],
          ["email_invitations", "Email me about workspace invitations"],
          ["email_releases", "Email me about release events"],
          ["in_app_activity", "Show operational activity inside the app"],
          ["weekly_summary", "Enable weekly workspace summary"],
        ].map(([key, label]) => (
          <label
            key={key}
            className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-4"
          >
            <span className="text-[0.9rem] text-[var(--text)]">{label}</span>
            <input
              type="checkbox"
              checked={values[key as keyof Preferences]}
              onChange={() => toggle(key as keyof Preferences)}
            />
          </label>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b] disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save preferences"}
        </button>
      </div>

      {message ? (
        <div className="mt-4">
          <InlineNotice
            title="Notification preferences"
            detail={message}
            tone={message.toLowerCase().includes("could not") ? "warning" : "success"}
          />
        </div>
      ) : null}
    </section>
  );
}
