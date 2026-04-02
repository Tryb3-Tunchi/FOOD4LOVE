import { createClient } from "@supabase/supabase-js";

const normalizeEnvValue = (value: string | undefined) => {
  if (!value) return value;
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const supabaseUrl = normalizeEnvValue(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = normalizeEnvValue(
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const decodeBase64UrlJson = (input: string) => {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  const json = atob(padded);
  return JSON.parse(json) as unknown;
};

let supabaseConfigError: string | null = null;

try {
  const parts = supabaseAnonKey?.split(".") ?? [];
  if (parts.length === 3) {
    const payload = decodeBase64UrlJson(parts[1]) as { role?: string };
    if (payload?.role === "service_role") {
      supabaseConfigError =
        "Do not use the Supabase service_role key in the browser. Use the anon key (VITE_SUPABASE_ANON_KEY) only.";
    }
  }
} catch {
  if (supabaseAnonKey)
    supabaseConfigError = "Invalid Supabase anon key format.";
}

if (!supabaseUrl || !supabaseAnonKey) {
  supabaseConfigError = "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.";
}

export const isSupabaseConfigured = !supabaseConfigError;
export const supabaseConfigErrorMessage = supabaseConfigError;

export const getSiteUrl = (): string => {
  const envUrl = normalizeEnvValue(import.meta.env.VITE_SITE_URL);
  if (envUrl) return envUrl.replace(/\/$/, "");
  return window.location.origin;
};

export const supabase = createClient(
  supabaseUrl || "http://localhost",
  supabaseAnonKey || "missing-anon-key",
);
