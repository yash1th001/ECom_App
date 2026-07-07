import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { supabaseStorage } from "./secureStorage";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!url || !anon) {
  console.warn("[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY missing. Auth and data calls will fail until you populate .env.");
}

export const supabase = createClient(url, anon, {
  auth: {
    storage: supabaseStorage as unknown as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});