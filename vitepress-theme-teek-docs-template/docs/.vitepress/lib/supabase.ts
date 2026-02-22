import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient as SupabaseClientType } from "@supabase/supabase-js";

// 单例模式，避免重复创建客户端
let supabaseInstance: SupabaseClientType | null = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Missing Supabase environment variables, using fallback");
      return null;
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

// 延迟获取实例
export const supabase = {
  get auth() {
    return getSupabase()?.auth ?? null;
  },
  get from() {
    return getSupabase()?.from.bind(getSupabase()!) ?? null;
  },
};

// 类型导出
export type SupabaseClient = SupabaseClientType;
