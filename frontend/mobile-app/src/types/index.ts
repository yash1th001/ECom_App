export type Purity = "18K" | "22K" | "24K";

export type Product = {
  id: string;
  name: string;
  category: string;
  purity: Purity;
  weight_g: number;                // gross gold weight in grams
  making_charge_percent: number;   // e.g. 8 => 8%
  hallmark_id: string | null;
  coa_id: string | null;
  image_url: string | null;
  description: string | null;
  stock: number;
  rating: number;
  review_count: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
  locked_rate_inr_per_g: number;   // rate for this item's purity at add time
  locked_at: number;               // epoch ms
};

export type OrderStage =
  | "placed"
  | "insured_escrow"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  user_id: string;
  total_inr: number;
  total_weight_g: number;
  stage: OrderStage;
  awb_number: string | null;
  courier: string | null;
  eta: string | null;
  created_at: string;
  items: Array<{
    product_id: string;
    name: string;
    quantity: number;
    locked_rate_inr_per_g: number;
    weight_g: number;
    subtotal_inr: number;
  }>;
};

export type PriceQuote = {
  usd_per_oz: number;
  inr_per_g_24k: number;
  inr_per_g_22k: number;
  inr_per_g_18k: number;
  fetched_at: number;
};