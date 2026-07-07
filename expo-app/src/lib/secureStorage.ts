import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// SecureStore is unavailable on web; fall back to localStorage there so `expo start --web` still runs.
const isWeb = Platform.OS === "web";

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) return typeof window === "undefined" ? null : window.localStorage.getItem(key);
    try { return await SecureStore.getItemAsync(key); } catch { return null; }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) { if (typeof window !== "undefined") window.localStorage.setItem(key, value); return; }
    try { await SecureStore.setItemAsync(key, value); } catch {}
  },
  async removeItem(key: string): Promise<void> {
    if (isWeb) { if (typeof window !== "undefined") window.localStorage.removeItem(key); return; }
    try { await SecureStore.deleteItemAsync(key); } catch {}
  },
};

// Supabase auth storage adapter (matches its Storage interface exactly).
export const supabaseStorage = {
  getItem: (key: string) => secureStorage.getItem(key),
  setItem: (key: string, value: string) => secureStorage.setItem(key, value),
  removeItem: (key: string) => secureStorage.removeItem(key),
};