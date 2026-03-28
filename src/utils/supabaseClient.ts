import { createBrowserClient } from "@supabase/ssr";

function readSupabaseBrowserEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const baseUrl = url?.replace(/\/+$/, "");
  if (!baseUrl || !key) {
    throw new Error("Application configuration error");
  }
  return { url: baseUrl, key };
}

export function createClient() {
  const { url, key } = readSupabaseBrowserEnv();
  return createBrowserClient(url, key);
}

export const supabase = createClient();
