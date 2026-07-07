import type { PriceQuote } from "@/types";

const URL = process.env.EXPO_PUBLIC_GOLD_API_URL ?? "https://api.gold-api.com/price/XAU";
const USD_INR = Number(process.env.EXPO_PUBLIC_USD_INR ?? 83.5);
const GRAMS_PER_OZ = 31.1035;

// 22K = 22/24 of 24K value; 18K = 18/24.
export async function fetchGoldQuote(): Promise<PriceQuote> {
  const res = await fetch(URL, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`gold api ${res.status}`);
  const j = (await res.json()) as { price?: number };
  const usdPerOz = Number(j.price);
  if (!Number.isFinite(usdPerOz) || usdPerOz <= 0) throw new Error("invalid gold price payload");
  const inrPerG24 = (usdPerOz * USD_INR) / GRAMS_PER_OZ;
  return {
    usd_per_oz: usdPerOz,
    inr_per_g_24k: inrPerG24,
    inr_per_g_22k: inrPerG24 * (22 / 24),
    inr_per_g_18k: inrPerG24 * (18 / 24),
    fetched_at: Date.now(),
  };
}