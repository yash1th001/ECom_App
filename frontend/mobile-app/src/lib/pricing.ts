import type { Product, Purity } from "@/types";

const GST = Number(process.env.EXPO_PUBLIC_GST_PERCENT ?? 3);

export type Breakdown = {
  base: number;           // gold value at locked rate
  making: number;         // making charges
  gst: number;            // GST on (base + making)
  total: number;
};

export function ratePerGramFor(purity: Purity, rate24: number, rate22: number, rate18: number) {
  return purity === "24K" ? rate24 : purity === "22K" ? rate22 : rate18;
}

export function computeBreakdown(product: Product, ratePerG: number, quantity = 1): Breakdown {
  const base = product.weight_g * ratePerG * quantity;
  const making = base * (product.making_charge_percent / 100);
  const gst = (base + making) * (GST / 100);
  return { base, making, gst, total: base + making + gst };
}