import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { secureStorage } from "@/lib/secureStorage";

const KEEP_KEY = "aurum.keepSignedIn";

type State = {
  session: Session | null;
  user: User | null;
  keepSignedIn: boolean;
  initialised: boolean;
  init: () => Promise<void>;
  setKeepSignedIn: (v: boolean) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<State>((set) => ({
  session: null,
  user: null,
  keepSignedIn: true,
  initialised: false,
  init: async () => {
    const keep = (await secureStorage.getItem(KEEP_KEY)) !== "false";
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, user: data.session?.user ?? null, keepSignedIn: keep, initialised: true });
    supabase.auth.onAuthStateChange((_e, s) => {
      set({ session: s, user: s?.user ?? null });
    });
  },
  setKeepSignedIn: async (v) => {
    await secureStorage.setItem(KEEP_KEY, v ? "true" : "false");
    set({ keepSignedIn: v });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));