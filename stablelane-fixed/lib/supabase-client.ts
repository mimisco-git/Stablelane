import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { siteConfig } from "@/lib/site";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  const url = siteConfig.supabase.url;
  const key = siteConfig.supabase.publishableKey;

  if (!url || !key) return null;
  if (!browserClient) {
    browserClient = createClient(url, key);
  }
  return browserClient;
}
