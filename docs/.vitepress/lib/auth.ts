import { supabase } from './supabase'
import type { User } from './supabase'

/**
 * 错误消息转换
 */
const getErrorMessage = (message: string): string => {
  console.log('[Auth] 原始错误消息:', message)
  
  // 精确匹配
  const errorMap: Record<string, string> = {
    'Invalid login credentials': '邮箱或密码错误',
    'Email not confirmed': '邮箱未验证，请查收验证邮件',
    'User already registered': '该邮箱已被注册',
    'Password should be at least 6 characters': '密码长度至少6位',
    'Invalid email': '邮箱格式不正确',
    'Unable to validate email address: invalid format': '邮箱格式不正确',
    'Signups not allowed': '暂不允许注册',
    'For security purposes, you can only request this once every 60 seconds': '请求太频繁，请60秒后重试',
    'Unable to create user': '无法创建用户',
    'User creation failed': '用户创建失败',
  }
  
  // 精确匹配
  if (errorMap[message]) {
    console.log('[Auth] 精确匹配:', errorMap[message])
    return errorMap[message]
  }
  
  // 模糊匹配（包含关键词）
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('email rate limit') || lowerMessage.includes('rate limit exceeded')) {
    return '请求频率超限，每分钟最多发送20封邮件，请稍后重试'
  }
  
  if (lowerMessage.includes('too many requests') || lowerMessage.includes('too many')) {
    return '请求过于频繁，请稍后重试'
  }
  
  if (lowerMessage.includes('invalid login credentials') || lowerMessage.includes('invalid credentials')) {
    return '邮箱或密码错误'
  }
  
  if (lowerMessage.includes('email not confirmed') || lowerMessage.includes('not confirmed')) {
    return '邮箱未验证，请查收验证邮件'
  }
  
  if (lowerMessage.includes('user already registered') || lowerMessage.includes('already registered')) {
    return '该邮箱已被注册'
  }
  
  if (lowerMessage.includes('signups not allowed') || lowerMessage.includes('not allowed')) {
    return '暂不允许注册'
  }
  
  // 返回原始消息
  console.log('[Auth] 未匹配到翻译，返回原消息')
  return message
}

/**
 * 认证结果类型
 */
export interface AuthResult {
  success: boolean
  error?: string
}

/**
 * 用户登录
 */
export const supabaseLogin = async (email: string, password: string): Promise<AuthResult> => {
  console.log('[Auth] 尝试登录:', email)
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.log('[Auth] 登录失败:', error.message)
      return { success: false, error: getErrorMessage(error.message) }
    }
    
    console.log('[Auth] 登录成功')
    return { success: true }
  } catch (err: any) {
    console.log('[Auth] 登录异常:', err.message)
    return { success: false, error: getErrorMessage(err.message) }
  }
}

/**
 * 用户注册
 */
export const supabaseRegister = async (email: string, password: string, confirmPassword: string): Promise<AuthResult> => {
  console.log('[Auth] 尝试注册:', email)
  
  // 验证密码一致性
  if (password !== confirmPassword) {
    return { success: false, error: '两次输入的密码不一致' }
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
      }
    })
    
    if (error) {
      console.log('[Auth] 注册失败:', error.message)
      return { success: false, error: getErrorMessage(error.message) }
    }
    
    console.log('[Auth] 注册成功')
    return { success: true }
  } catch (err: any) {
    console.log('[Auth] 注册异常:', err.message)
    return { success: false, error: getErrorMessage(err.message) }
  }
}

/**
 * 重置密码
 */
export const supabaseResetPassword = async (email: string): Promise<AuthResult> => {
  console.log('[Auth] 尝试重置密码:', email)
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    
    if (error) {
      console.log('[Auth] 重置密码失败:', error.message)
      return { success: false, error: getErrorMessage(error.message) }
    }
    
    console.log('[Auth] 重置密码邮件已发送')
    return { success: true }
  } catch (err: any) {
    console.log('[Auth] 重置密码异常:', err.message)
    return { success: false, error: getErrorMessage(err.message) }
  }
}

/**
 * 获取当前登录用户
 */
export const getCurrentUser = async (): Promise<User | null> => {
  console.log('[Auth] 获取当前用户')
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    console.log('[Auth] 当前用户:', user ? user.email : '未登录')
    return user
  } catch (err: any) {
    console.log('[Auth] 获取用户异常:', err.message)
    return null
  }
}

/**
 * 用户登出
 */
export const supabaseLogout = async (): Promise<AuthResult> => {
  console.log('[Auth] 用户登出')
  
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.log('[Auth] 登出失败:', error.message)
      return { success: false, error: getErrorMessage(error.message) }
    }
    
    console.log('[Auth] 登出成功')
    return { success: true }
  } catch (err: any) {
    console.log('[Auth] 登出异常:', err.message)
    return { success: false, error: getErrorMessage(err.message) }
  }
}
