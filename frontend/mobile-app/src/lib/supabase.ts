import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { supabaseStorage, secureStorage } from "./secureStorage";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

const isPlaceholder = !url || url.includes("YOUR-PROJECT") || !anon || anon === "YOUR-ANON-KEY";

// Mock Database Initial Seeding
const SEED_REFERRAL_CODES = [
  { code: "AURUM-2026", active: true, note: "Seed invite" },
  { code: "FOUNDER-01", active: true, note: "Founding member" }
];

const SEED_SETTINGS = [
  { id: 1, storefront_paused: false }
];

const SEED_PRODUCTS = [
  {
    id: "prod-1",
    name: "Sovereign 24K Bullion Bar",
    category: "Coins",
    purity: "24K",
    weight_g: 100,
    making_charge_percent: 2.5,
    hallmark_id: "BIS-916-A1",
    coa_id: "COA-24-00871",
    image_url: "https://images.unsplash.com/photo-1610375461369-d613b564f4c4?w=800",
    description: "Investment-grade 100 g fine gold bar. Fully insured escrow.",
    stock: 25,
    rating: 4.8,
    review_count: 12,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: "prod-2",
    name: "Rajwadi 22K Chain",
    category: "Chains",
    purity: "22K",
    weight_g: 42,
    making_charge_percent: 9,
    hallmark_id: "BIS-916-B7",
    coa_id: "COA-22-01204",
    image_url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
    description: "Traditional Rajwadi weave, handcrafted in Jaipur.",
    stock: 8,
    rating: 4.7,
    review_count: 6,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: "prod-3",
    name: "Meenakari 22K Bangle Pair",
    category: "Bracelets",
    purity: "22K",
    weight_g: 58,
    making_charge_percent: 12,
    hallmark_id: "BIS-916-C2",
    coa_id: "COA-22-01331",
    image_url: "https://images.unsplash.com/photo-1602751584553-b93cb6d5a2a3?w=800",
    description: "Kundan meenakari on 22K base; sold as a pair.",
    stock: 5,
    rating: 4.9,
    review_count: 8,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "prod-4",
    name: "Solitaire 18K Ring",
    category: "Rings",
    purity: "18K",
    weight_g: 6.8,
    making_charge_percent: 15,
    hallmark_id: "BIS-750-D9",
    coa_id: "COA-18-00442",
    image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
    description: "18K white gold band with certified 0.42ct centre stone.",
    stock: 12,
    rating: 4.6,
    review_count: 4,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "prod-5",
    name: "Peacock 22K Pendant",
    category: "Pendants",
    purity: "22K",
    weight_g: 14,
    making_charge_percent: 11,
    hallmark_id: "BIS-916-E4",
    coa_id: "COA-22-01502",
    image_url: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800",
    description: "Filigree peacock motif with ruby accents.",
    stock: 9,
    rating: 4.7,
    review_count: 10,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: "prod-6",
    name: "Antique 22K Jhumka",
    category: "Earrings",
    purity: "22K",
    weight_g: 22,
    making_charge_percent: 13,
    hallmark_id: "BIS-916-F1",
    coa_id: "COA-22-01610",
    image_url: "https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=800",
    description: "Temple-style jhumkas with pearl drops.",
    stock: 6,
    rating: 4.5,
    review_count: 3,
    created_at: new Date().toISOString()
  }
];

class MockQueryBuilder {
  table: string;
  filters: any[] = [];
  insertData: any = null;
  updateData: any = null;
  upsertData: any = null;
  isSingle = false;
  isMaybeSingle = false;
  limitCount: number | null = null;
  orderCol: string | null = null;
  orderAsc = true;

  constructor(table: string) {
    this.table = table;
  }

  select(cols?: string) { return this; }
  eq(col: string, val: any) { this.filters.push({ type: "eq", col, val }); return this; }
  neq(col: string, val: any) { this.filters.push({ type: "neq", col, val }); return this; }
  in(col: string, vals: any[]) { this.filters.push({ type: "in", col, vals }); return this; }
  ilike(col: string, val: string) { this.filters.push({ type: "ilike", col, val }); return this; }
  gte(col: string, val: any) { this.filters.push({ type: "gte", col, val }); return this; }
  lte(col: string, val: any) { this.filters.push({ type: "lte", col, val }); return this; }
  limit(n: number) { this.limitCount = n; return this; }
  order(col: string, options?: { ascending?: boolean }) {
    this.orderCol = col;
    this.orderAsc = options?.ascending ?? true;
    return this;
  }
  single() { this.isSingle = true; return this; }
  maybeSingle() { this.isMaybeSingle = true; return this; }
  insert(data: any) { this.insertData = data; return this; }
  update(data: any) { this.updateData = data; return this; }
  upsert(data: any) { this.upsertData = data; return this; }

  async execute() {
    // Read table list
    const key = `aurum.db.${this.table}`;
    let items: any[] = [];
    const cached = await secureStorage.getItem(key);
    if (cached) {
      items = JSON.parse(cached);
    } else {
      if (this.table === "products") items = SEED_PRODUCTS;
      else if (this.table === "referral_codes") items = SEED_REFERRAL_CODES;
      else if (this.table === "settings") items = SEED_SETTINGS;
      await secureStorage.setItem(key, JSON.stringify(items));
    }

    // Handles writes
    if (this.insertData) {
      const isArray = Array.isArray(this.insertData);
      const dataToInsert = isArray ? this.insertData : [this.insertData];
      const inserted = dataToInsert.map((d: any) => ({
        id: d.id ?? Math.random().toString(36).substring(2, 11),
        created_at: new Date().toISOString(),
        ...d
      }));
      items.push(...inserted);
      await secureStorage.setItem(key, JSON.stringify(items));
      return { data: isArray ? inserted : inserted[0], error: null };
    }

    if (this.updateData) {
      let updatedCount = 0;
      let lastUpdated: any = null;
      items = items.map((item) => {
        let match = true;
        for (const f of this.filters) {
          if (f.type === "eq" && item[f.col] !== f.val) match = false;
        }
        if (match) {
          updatedCount++;
          const next = { ...item, ...this.updateData };
          lastUpdated = next;
          return next;
        }
        return item;
      });
      await secureStorage.setItem(key, JSON.stringify(items));
      return { data: this.isSingle ? lastUpdated : items, error: null };
    }

    if (this.upsertData) {
      const isArray = Array.isArray(this.upsertData);
      const dataToUpsert = isArray ? this.upsertData : [this.upsertData];
      const upserted: any[] = [];
      for (const d of dataToUpsert) {
        const idx = items.findIndex((x) => x.id === d.id);
        if (idx >= 0) {
          items[idx] = { ...items[idx], ...d };
          upserted.push(items[idx]);
        } else {
          const fresh = {
            id: d.id ?? Math.random().toString(36).substring(2, 11),
            created_at: new Date().toISOString(),
            ...d
          };
          items.push(fresh);
          upserted.push(fresh);
        }
      }
      await secureStorage.setItem(key, JSON.stringify(items));
      return { data: isArray ? upserted : upserted[0], error: null };
    }

    // Handles filters
    let result = [...items];
    for (const f of this.filters) {
      if (f.type === "eq") {
        result = result.filter((x) => x[f.col] === f.val);
      } else if (f.type === "neq") {
        result = result.filter((x) => x[f.col] !== f.val);
      } else if (f.type === "in") {
        result = result.filter((x) => f.vals.includes(x[f.col]));
      } else if (f.type === "ilike") {
        const queryStr = String(f.val).replace(/%/g, "").toLowerCase();
        result = result.filter((x) => String(x[f.col]).toLowerCase().includes(queryStr));
      } else if (f.type === "gte") {
        result = result.filter((x) => Number(x[f.col]) >= Number(f.val));
      } else if (f.type === "lte") {
        result = result.filter((x) => Number(x[f.col]) <= Number(f.val));
      }
    }

    if (this.orderCol) {
      const col = this.orderCol;
      const asc = this.orderAsc;
      result.sort((a, b) => {
        const valA = a[col];
        const valB = b[col];
        if (valA < valB) return asc ? -1 : 1;
        if (valA > valB) return asc ? 1 : -1;
        return 0;
      });
    }

    if (this.limitCount != null) {
      result = result.slice(0, this.limitCount);
    }

    if (this.isSingle) {
      return { data: result.length ? result[0] : null, error: result.length ? null : new Error("Not found") };
    }
    if (this.isMaybeSingle) {
      return { data: result.length ? result[0] : null, error: null };
    }

    return { data: result, error: null };
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

class MockSupabaseClient {
  private authChangeListeners: Array<(event: string, session: any) => void> = [];
  private currentSession: any = null;

  constructor() {
    void this.loadSession();
  }

  private async loadSession() {
    const cached = await secureStorage.getItem("aurum.mockSession");
    if (cached) {
      this.currentSession = JSON.parse(cached);
      this.notifyListeners("SIGNED_IN", this.currentSession);
    }
  }

  private notifyListeners(event: string, session: any) {
    this.authChangeListeners.forEach((cb) => cb(event, session));
  }

  auth = {
    getSession: async () => {
      return { data: { session: this.currentSession }, error: null };
    },
    getUser: async () => {
      return { data: { user: this.currentSession?.user ?? null }, error: null };
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      this.authChangeListeners.push(callback);
      if (this.currentSession) {
        callback("SIGNED_IN", this.currentSession);
      }
      return { data: { subscription: { unsubscribe: () => {
        this.authChangeListeners = this.authChangeListeners.filter((cb) => cb !== callback);
      } } } };
    },
    signInWithPassword: async ({ email, password }: any) => {
      const key = "aurum.mockUsers";
      const cached = await secureStorage.getItem(key);
      const users = cached ? JSON.parse(cached) : [];
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (!user) throw new Error("Invalid email or password");

      this.currentSession = {
        user: { id: user.id, email: user.email, user_metadata: { full_name: user.full_name, referral_code: user.referral_code } },
        access_token: "mock-token-" + Math.random()
      };
      await secureStorage.setItem("aurum.mockSession", JSON.stringify(this.currentSession));
      this.notifyListeners("SIGNED_IN", this.currentSession);
      return { data: this.currentSession, error: null };
    },
    signInWithOtp: async ({ email, phone }: any) => {
      const id = email || phone;
      console.log(`[Mock OTP] Generated code 123456 for: ${id}`);
      return { data: {}, error: null };
    },
    verifyOtp: async ({ email, phone, token }: any) => {
      const id = email || phone;
      if (token !== "123456" && token.trim() !== "123456") {
        throw new Error("Invalid verification code (mock expects '123456')");
      }
      // Create user if not existing
      const key = "aurum.mockUsers";
      const cached = await secureStorage.getItem(key);
      const users = cached ? JSON.parse(cached) : [];
      let user = users.find((u: any) => u.email === id || u.phone === id);
      if (!user) {
        user = {
          id: "usr-" + Math.random().toString(36).substring(2, 11),
          email: email || `${phone}@mock.phone`,
          phone: phone || "",
          full_name: "Valued Customer",
          referral_code: "AURUM-2026",
          created_at: new Date().toISOString()
        };
        users.push(user);
        await secureStorage.setItem(key, JSON.stringify(users));

        // Create profile
        const pKey = "aurum.db.profiles";
        const pCached = await secureStorage.getItem(pKey);
        const profiles = pCached ? JSON.parse(pCached) : [];
        profiles.push({
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          referral_code: user.referral_code,
          kyc_verified: false,
          created_at: user.created_at
        });
        await secureStorage.setItem(pKey, JSON.stringify(profiles));
      }

      this.currentSession = {
        user: { id: user.id, email: user.email, user_metadata: { full_name: user.full_name, referral_code: user.referral_code } },
        access_token: "mock-token-" + Math.random()
      };
      await secureStorage.setItem("aurum.mockSession", JSON.stringify(this.currentSession));
      this.notifyListeners("SIGNED_IN", this.currentSession);
      return { data: this.currentSession, error: null };
    },
    signUp: async ({ email, password, options }: any) => {
      const key = "aurum.mockUsers";
      const cached = await secureStorage.getItem(key);
      const users = cached ? JSON.parse(cached) : [];
      if (users.some((u: any) => u.email === email)) {
        throw new Error("Email already registered");
      }
      const user = {
        id: "usr-" + Math.random().toString(36).substring(2, 11),
        email,
        password,
        full_name: options?.data?.full_name ?? "",
        referral_code: options?.data?.referral_code ?? "",
        created_at: new Date().toISOString()
      };
      users.push(user);
      await secureStorage.setItem(key, JSON.stringify(users));
      return { data: { user }, error: null };
    },
    signOut: async () => {
      this.currentSession = null;
      await secureStorage.removeItem("aurum.mockSession");
      this.notifyListeners("SIGNED_OUT", null);
      return { error: null };
    }
  };

  from(table: string) {
    return new MockQueryBuilder(table);
  }

  channel(name: string) {
    const ch = {
      name,
      on: (event: string, filter: any, callback: (payload: any) => void) => {
        // Mock realtime channel
        // Periodically trigger a stage update for order detailed screen to make it alive
        if (name.startsWith("order:")) {
          const orderId = name.split(":")[1];
          const triggerUpdate = async () => {
            const orderKey = "aurum.db.orders";
            const cached = await secureStorage.getItem(orderKey);
            if (cached) {
              const orders = JSON.parse(cached);
              const idx = orders.findIndex((o: any) => o.id === orderId);
              if (idx >= 0) {
                const stages: Array<any> = ["placed", "insured_escrow", "dispatched", "delivered"];
                const currIdx = stages.indexOf(orders[idx].stage);
                if (currIdx >= 0 && currIdx < stages.length - 1) {
                  const nextStage = stages[currIdx + 1];
                  orders[idx] = {
                    ...orders[idx],
                    stage: nextStage,
                    awb_number: nextStage === "dispatched" ? "BD92837482" : orders[idx].awb_number,
                    courier: nextStage === "dispatched" ? "Blue Dart" : orders[idx].courier,
                    eta: nextStage === "dispatched" ? "Tomorrow, 5:00 PM" : orders[idx].eta
                  };
                  await secureStorage.setItem(orderKey, JSON.stringify(orders));
                  callback({ new: orders[idx] });
                }
              }
            }
          };
          // Schedule simulated update every 12 seconds
          (ch as any).interval = setInterval(triggerUpdate, 12000);
        }
        return ch;
      },
      subscribe: () => {
        return ch;
      }
    };
    return ch;
  }

  removeChannel(ch: any) {
    if (ch && ch.interval) {
      clearInterval(ch.interval);
    }
    return Promise.resolve();
  }
}

if (isPlaceholder) {
  console.log("[Supabase] Running in Mock/Offline Development Mode.");
}

export const supabase = isPlaceholder
  ? (new MockSupabaseClient() as any)
  : createClient(url, anon, {
      auth: {
        storage: supabaseStorage as unknown as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });