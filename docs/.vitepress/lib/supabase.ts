/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient, User, Session } from '@supabase/supabase-js'

// 检查是否在客户端
const isClient = typeof window !== 'undefined'

// Supabase 配置 - 从环境变量获取
const supabaseUrl = isClient ? (import.meta.env.VITE_SUPABASE_URL || '') : ''
const supabaseAnonKey = isClient ? (import.meta.env.VITE_SUPABASE_ANON_KEY || '') : ''

// 创建 Supabase 客户端（仅客户端）
let supabaseInstance: SupabaseClient | null = null

const getSupabase = (): SupabaseClient | null => {
  if (!isClient || !supabaseUrl || !supabaseAnonKey) {
    return null
  }
  
  if (!supabaseInstance) {
    console.log('[Supabase] 创建客户端实例...')
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'x-client-info': 'vitepress-theme'
        }
      },
      // 禁用锁机制，避免 LockManager 超时问题
      lock: false
    })
    console.log('[Supabase] 客户端实例创建成功')
  }
  return supabaseInstance
}

// 创建安全的空响应
const createEmptyResponse = () => Promise.resolve({ data: null, error: null })

// 导出代理对象，安全地在服务端和客户端使用
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!isClient) {
      // 服务端返回空函数
      return createEmptyResponse
    }
    
    const instance = getSupabase()
    if (!instance) {
      // 配置未设置时返回空函数
      console.warn('[Supabase] 客户端未初始化，跳过:', prop)
      return createEmptyResponse
    }
    
    return instance[prop as keyof SupabaseClient]
  }
})

// 导出类型
export type { User, Session }
