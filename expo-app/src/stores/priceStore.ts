import { create } from "zustand";
import type { PriceQuote } from "@/types";
import { fetchGoldQuote } from "@/lib/priceApi";

type State = {
  quote: PriceQuote | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  startPolling: (intervalMs?: number) => () => void;
};

export const usePriceStore = create<State>((set, get) => ({
  quote: null,
  loading: false,
  error: null,
  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const q = await fetchGoldQuote();
      set({ quote: q, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? "Failed to load live rate" });
    }
  },
  startPolling: (intervalMs = 15000) => {
    void get().refresh();
    const t = setInterval(() => void get().refresh(), intervalMs);
    return () => clearInterval(t);
  },
}));