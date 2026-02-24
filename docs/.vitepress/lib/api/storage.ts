import { supabase } from '../supabase'

/**
 * 上传头像到 Supabase Storage
 * @param file 图片文件
 * @param userId 用户ID
 * @returns 上传成功返回 { url: string }，失败返回 { error: string }
 */
export async function uploadAvatar(file: File, userId: string): Promise<{ url?: string; error?: string }> {
  try {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return { error: '请选择图片文件' }
    }

    // 验证文件大小（最大 5MB）
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return { error: '图片大小不能超过 5MB' }
    }

    // 生成文件名：用户ID/时间戳.扩展名
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    console.log('[Storage] 开始上传头像:', fileName, '大小:', (file.size / 1024).toFixed(2), 'KB')

    // 上传文件到 avatars 存储桶
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true, // 覆盖同名文件
      })

    if (error) {
      console.error('[Storage] 上传头像失败:', error)
      
      // 友好的错误提示
      if (error.message.includes('Bucket not found')) {
        return { error: '存储桶未创建，请联系管理员在 Supabase 创建 avatars 存储桶' }
      }
      if (error.message.includes('not allowed') || error.message.includes('permission')) {
        return { error: '没有上传权限，请联系管理员配置 Storage RLS 策略' }
      }
      if (error.message.includes('storage quota')) {
        return { error: '存储空间不足' }
      }
      
      return { error: `上传失败: ${error.message}` }
    }

    console.log('[Storage] 上传成功:', data.path)

    // 获取公开URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path)

    console.log('[Storage] 头像URL:', urlData.publicUrl)

    return { url: urlData.publicUrl }
  } catch (e: any) {
    console.error('[Storage] 上传头像异常:', e)
    return { error: e.message || '上传异常，请重试' }
  }
}

/**
 * 删除旧头像
 * @param avatarUrl 头像URL
 */
export async function deleteOldAvatar(avatarUrl: string): Promise<void> {
  try {
    // 如果是 Supabase Storage 的 URL，才删除
    if (!avatarUrl.includes('/storage/v1/object/public/avatars/')) {
      console.log('[Storage] 非Storage头像，跳过删除')
      return
    }

    // 从 URL 中提取文件路径
    const match = avatarUrl.match(/\/avatars\/(.+)$/)
    if (!match) return

    const filePath = match[1]
    console.log('[Storage] 删除旧头像:', filePath)

    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath])

    if (error) {
      console.error('[Storage] 删除旧头像失败:', error)
    }
  } catch (e) {
    console.error('[Storage] 删除旧头像异常:', e)
  }
}
