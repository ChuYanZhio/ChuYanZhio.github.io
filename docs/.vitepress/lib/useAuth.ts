import { ref, computed } from 'vue'
import { supabase } from './supabase'
import { getCurrentProfile, upsertProfile } from './api/profiles'
import type { User } from '@supabase/supabase-js'
import type { Profile } from './database.types'

// 全局状态
const user = ref<User | null>(null)
const profile = ref<Profile | null>(null)
const loading = ref(true)
const initialized = ref(false)

// 初始化用户状态
const initAuth = async () => {
  if (initialized.value) return
  
  try {
    const result = await supabase.auth.getUser()
    user.value = result?.data?.user || null
    
    if (user.value) {
      profile.value = await getCurrentProfile()
    }
  } catch (e) {
    console.error('[Auth] 初始化失败:', e)
  } finally {
    loading.value = false
    initialized.value = true
  }
  
  // 监听认证状态变化
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('[Auth] 状态变化:', event)
    
    if (event === 'SIGNED_IN' && session?.user) {
      user.value = session.user
      profile.value = await getCurrentProfile()
    } else if (event === 'SIGNED_OUT') {
      user.value = null
      profile.value = null
    }
  })
}

// 登出
const logout = async () => {
  try {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
    window.location.href = '/'
  } catch (e) {
    console.error('[Auth] 登出失败:', e)
  }
}

// 更新用户资料
const updateProfile = async (updates: Partial<Profile>) => {
  if (!user.value) return false
  
  try {
    const result = await upsertProfile(updates)
    if (result) {
      profile.value = result
      return true
    }
    return false
  } catch (e) {
    console.error('[Auth] 更新资料失败:', e)
    return false
  }
}

// 计算属性
const isLoggedIn = computed(() => !!user.value)
const displayName = computed(() => profile.value?.nickname || profile.value?.username || user.value?.email?.split('@')[0] || '用户')
const avatarUrl = computed(() => profile.value?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.value?.id || 'default'}`)

export function useAuth() {
  return {
    user,
    profile,
    loading,
    initialized,
    isLoggedIn,
    displayName,
    avatarUrl,
    initAuth,
    logout,
    updateProfile,
  }
}
