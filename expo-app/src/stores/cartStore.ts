import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { secureStorage } from "@/lib/secureStorage";
import type { CartItem, Product } from "@/types";
import { usePriceStore } from "./priceStore";
import { ratePerGramFor } from "@/lib/pricing";

const LOCK_MS = Number(process.env.EXPO_PUBLIC_PRICE_LOCK_MINUTES ?? 10) * 60 * 1000;

type State = {
  items: CartItem[];
  add: (p: Product, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  relockExpired: () => { requoted: CartItem[]; priceMovedInr: number };
  totalWeight: () => number;
  lockMs: () => number;
};

export const useCartStore = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      lockMs: () => LOCK_MS,
      add: (p, qty = 1) => {
        const q = usePriceStore.getState().quote;
        if (!q) return;
        const rate = ratePerGramFor(p.purity, q.inr_per_g_24k, q.inr_per_g_22k, q.inr_per_g_18k);
        const existing = get().items.find((i) => i.product.id === p.id);
        if (existing) {
          set({ items: get().items.map((i) => i.product.id === p.id ? { ...i, quantity: i.quantity + qty } : i) });
        } else {
          set({ items: [...get().items, { product: p, quantity: qty, locked_rate_inr_per_g: rate, locked_at: Date.now() }] });
        }
      },
      remove: (id) => set({ items: get().items.filter((i) => i.product.id !== id) }),
      setQty: (id, qty) => {
        if (qty <= 0) return get().remove(id);
        set({ items: get().items.map((i) => i.product.id === id ? { ...i, quantity: qty } : i) });
      },
      clear: () => set({ items: [] }),
      relockExpired: () => {
        const q = usePriceStore.getState().quote;
        if (!q) return { requoted: [], priceMovedInr: 0 };
        const now = Date.now();
        let priceMovedInr = 0;
        const requoted: CartItem[] = [];
        const next = get().items.map((it) => {
          if (now - it.locked_at < LOCK_MS) return it;
          const newRate = ratePerGramFor(it.product.purity, q.inr_per_g_24k, q.inr_per_g_22k, q.inr_per_g_18k);
          const delta = (newRate - it.locked_rate_inr_per_g) * it.product.weight_g * it.quantity;
          priceMovedInr += delta;
          const updated: CartItem = { ...it, locked_rate_inr_per_g: newRate, locked_at: now };
          requoted.push(updated);
          return updated;
        });
        if (requoted.length) set({ items: next });
        return { requoted, priceMovedInr };
      },
      totalWeight: () => get().items.reduce((n, i) => n + i.product.weight_g * i.quantity, 0),
    }),
    {
      name: "aurum.cart.v1",
      storage: createJSONStorage(() => ({
        getItem: (k) => secureStorage.getItem(k),
        setItem: (k, v) => secureStorage.setItem(k, v),
        removeItem: (k) => secureStorage.removeItem(k),
      })),
      partialize: (s) => ({ items: s.items }) as any,
    },
  ),
);