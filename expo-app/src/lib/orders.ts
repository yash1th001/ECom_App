import { supabase } from "./supabase";
import type { CartItem, Order } from "@/types";
import { computeBreakdown } from "./pricing";

// Simulates Stripe / Razorpay transaction processing
export async function processMockPayment(amountInr: number, method: "stripe" | "razorpay"): Promise<{ success: boolean; transactionId: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionId: `${method.toUpperCase()}_TX_${Math.random().toString(36).substring(2, 11).toUpperCase()}`
      });
    }, 1500);
  });
}

export async function placeOrder(items: CartItem[], addressId: string, paymentRef?: string): Promise<Order> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not signed in.");

  let total = 0;
  let totalWeight = 0;
  const orderItems = items.map((it) => {
    const b = computeBreakdown(it.product, it.locked_rate_inr_per_g, it.quantity);
    total += b.total;
    totalWeight += it.product.weight_g * it.quantity;
    return {
      product_id: it.product.id,
      name: it.product.name,
      quantity: it.quantity,
      locked_rate_inr_per_g: it.locked_rate_inr_per_g,
      weight_g: it.product.weight_g * it.quantity,
      subtotal_inr: b.total,
    };
  });

  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: user.user.id,
      total_inr: Math.round(total),
      total_weight_g: totalWeight,
      stage: "placed",
      address_id: addressId,
      items: orderItems,
      // Store mock payment reference in the metadata/json or order tracking details
      courier: "Processing Escrow",
      awb_number: paymentRef ?? "MOCK_PAYMENT_PENDING",
      eta: "Pending Escrow Insurance"
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Order;
}


export async function loadOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function loadOrder(id: string): Promise<Order | null> {
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Order) ?? null;
}
