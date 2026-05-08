import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  console.warn(
    "[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. " +
      "Auth and persistence will fall back to localStorage. See .env.example.",
  );
}

export const supabase = createClient(url ?? "https://placeholder.supabase.co", anonKey ?? "placeholder");

// ── Database row types ────────────────────────────────────────────────────────

export interface DbProfile {
  id: string;           // = auth.users.id
  email: string;
  full_name: string | null;
  ynab_token: string | null;
  ynab_budget_id: string | null;
  plaid_access_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbBasket {
  id: string;
  user_id: string;
  lines: string;        // JSON
  subtotal: number;
  savings: number;
  budget: number;
  strategy: string;
  created_at: string;
  updated_at: string;
}

export interface DbOrder {
  id: string;
  user_id: string;
  basket_snapshot: string;  // JSON
  total: number;
  savings: number;
  budget: number;
  item_count: number;
  junk_count: number;
  healthy_swaps: number;
  strategy: string;
  ynab_transaction_id: string | null;
  created_at: string;
}

export interface DbPreferences {
  id: string;
  user_id: string;
  data: string;   // JSON of Preferences
  updated_at: string;
}
