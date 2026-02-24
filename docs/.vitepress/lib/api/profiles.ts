import { supabase } from '../supabase'
import type { Profile, ProfileInsert } from '../database.types'

// 检查是否在客户端
const isClient = typeof window !== 'undefined'

/**
 * 用户资料 API
 */

// 获取当前用户资料
export const getCurrentProfile = async (): Promise<Profile | null> => {
  if (!isClient) return null
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

// 根据用户名获取资料
export const getProfileByUsername = async (username: string): Promise<Profile | null> => {
  if (!isClient) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

// 创建或更新用户资料
export const upsertProfile = async (profile: ProfileInsert): Promise<Profile | null> => {
  if (!isClient) return null
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      ...profile,
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting profile:', error)
    return null
  }

  return data
}

// 更新用户资料
export const updateProfile = async (updates: ProfileInsert): Promise<Profile | null> => {
  if (!isClient) return null
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return null
  }

  return data
}
