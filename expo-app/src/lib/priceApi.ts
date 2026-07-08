import type { PriceQuote } from "@/types";

const URL = process.env.EXPO_PUBLIC_GOLD_API_URL ?? "https://api.gold-api.com/price/XAU";
const DEFAULT_USD_INR = Number(process.env.EXPO_PUBLIC_USD_INR ?? 83.5);
const GRAMS_PER_OZ = 31.1035;
const FX_URL = "https://open.er-api.com/v6/latest/USD";

// Fetches live USD -> INR rate, falls back to env constant
async function fetchUsdInrRate(): Promise<number> {
  try {
    const res = await fetch(FX_URL, { headers: { Accept: "application/json" } });
    if (!res.ok) return DEFAULT_USD_INR;
    const j = (await res.json()) as { rates?: Record<string, number> };
    const inr = j.rates?.INR;
    return typeof inr === "number" && inr > 0 ? inr : DEFAULT_USD_INR;
  } catch (e) {
    return DEFAULT_USD_INR;
  }
}

// 22K = 22/24 of 24K value; 18K = 18/24.
export async function fetchGoldQuote(): Promise<PriceQuote> {
  const [goldRes, usdInr] = await Promise.all([
    fetch(URL, { headers: { Accept: "application/json" } }).catch(() => null),
    fetchUsdInrRate(),
  ]);

  let usdPerOz = 2350; // Fallback gold price if API is down / offline
  if (goldRes && goldRes.ok) {
    try {
      const j = (await goldRes.json()) as { price?: number };
      const price = Number(j.price);
      if (Number.isFinite(price) && price > 0) {
        usdPerOz = price;
      }
    } catch (e) {
      // Use fallback
    }
  }

  const inrPerG24 = (usdPerOz * usdInr) / GRAMS_PER_OZ;
  return {
    usd_per_oz: usdPerOz,
    inr_per_g_24k: inrPerG24,
    inr_per_g_22k: inrPerG24 * (22 / 24),
    inr_per_g_18k: inrPerG24 * (18 / 24),
    fetched_at: Date.now(),
  };
}