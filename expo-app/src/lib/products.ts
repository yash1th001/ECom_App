import { supabase } from "./supabase";
import type { Product } from "@/types";

export type ProductFilters = {
  purity?: Product["purity"][];
  category?: string[];
  minWeight?: number;
  maxWeight?: number;
  minMaking?: number;
  maxMaking?: number;
  search?: string;
};

export async function loadProducts(f: ProductFilters = {}): Promise<Product[]> {
  let q = supabase.from("products").select("*").order("created_at", { ascending: false });
  if (f.purity?.length) q = q.in("purity", f.purity);
  if (f.category?.length) q = q.in("category", f.category);
  if (f.minWeight != null) q = q.gte("weight_g", f.minWeight);
  if (f.maxWeight != null) q = q.lte("weight_g", f.maxWeight);
  if (f.minMaking != null) q = q.gte("making_charge_percent", f.minMaking);
  if (f.maxMaking != null) q = q.lte("making_charge_percent", f.maxMaking);
  if (f.search) q = q.ilike("name", `%${f.search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function loadProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Product) ?? null;
}

export async function loadSimilar(product: Product): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", product.category)
    .neq("id", product.id)
    .limit(6);
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function isStorefrontPaused(): Promise<boolean> {
  const { data, error } = await supabase.from("settings").select("storefront_paused").eq("id", 1).maybeSingle();
  if (error) return false;
  return Boolean(data?.storefront_paused);
}