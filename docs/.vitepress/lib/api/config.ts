import { supabase } from '../supabase'
import type { SiteConfig } from '../database.types'

/**
 * 网站配置 API
 */

// 获取单个配置
export const getConfig = async (key: string): Promise<Record<string, any> | null> => {
  const { data, error } = await supabase
    .from('site_config')
    .select('value')
    .eq('key', key)
    .single()

  if (error) {
    console.error('Error fetching config:', error)
    return null
  }

  return data?.value || null
}

// 获取所有配置
export const getAllConfigs = async (): Promise<Record<string, any>> => {
  const { data, error } = await supabase
    .from('site_config')
    .select('*')

  if (error) {
    console.error('Error fetching configs:', error)
    return {}
  }

  const configs: Record<string, any> = {}
  data?.forEach(item => {
    configs[item.key] = item.value
  })

  return configs
}

// 更新配置（需要管理员权限）
export const updateConfig = async (key: string, value: Record<string, any>): Promise<boolean> => {
  const { error } = await supabase
    .from('site_config')
    .update({ value })
    .eq('key', key)

  if (error) {
    console.error('Error updating config:', error)
    return false
  }

  return true
}

// 获取网站名称
export const getSiteName = async (): Promise<string> => {
  const value = await getConfig('site_name')
  return value?.name || 'VitePress Theme Teek'
}

// 获取社交链接
export const getSocialLinks = async (): Promise<Record<string, string>> => {
  const value = await getConfig('social_links')
  return value || {}
}

// 获取页脚信息
export const getFooterInfo = async (): Promise<Record<string, string>> => {
  const value = await getConfig('footer_info')
  return value || {}
}
