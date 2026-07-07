import { supabase } from "./supabase";
import type { CartItem, Order } from "@/types";
import { computeBreakdown } from "./pricing";

export async function placeOrder(items: CartItem[], addressId: string): Promise<Order> {
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

  // TODO: integrate Razorpay/Stripe here and only insert on payment success.
  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: user.user.id,
      total_inr: Math.round(total),
      total_weight_g: totalWeight,
      stage: "placed",
      address_id: addressId,
      items: orderItems,
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