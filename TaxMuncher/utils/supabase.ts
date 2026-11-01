import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key =
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const isBackendConfigured = Boolean(url && key);
const isServer = Platform.OS === "web" && typeof window === "undefined";
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "prototype-only",
  {
    auth: {
      storage: isServer ? undefined : AsyncStorage,
      persistSession: !isServer,
      autoRefreshToken: !isServer,
      detectSessionInUrl: false,
    },
  },
);
