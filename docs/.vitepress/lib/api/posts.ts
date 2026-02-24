import { supabase } from '../supabase'
import type { Post, PostInsert } from '../database.types'

/**
 * 文章 API
 */

// 获取文章列表
export const getPosts = async (options?: {
  status?: 'draft' | 'published' | 'archived'
  category?: string
  tag?: string
  limit?: number
  offset?: number
}): Promise<Post[]> => {
  let query = supabase
    .from('posts')
    .select('*, author:profiles(*)')
    .order('created_at', { ascending: false })

  if (options?.status) {
    query = query.eq('status', options.status)
  }
  if (options?.category) {
    query = query.eq('category', options.category)
  }
  if (options?.tag) {
    query = query.contains('tags', [options.tag])
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching posts:', error)
    return []
  }

  return data || []
}

// 根据 slug 获取文章
export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:profiles(*)')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching post:', error)
    return null
  }

  return data
}

// 根据 ID 获取文章
export const getPostById = async (id: string): Promise<Post | null> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:profiles(*)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching post:', error)
    return null
  }

  return data
}

// 创建文章
export const createPost = async (post: PostInsert): Promise<Post | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      ...post,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating post:', error)
    return null
  }

  return data
}

// 更新文章
export const updatePost = async (id: string, updates: PostInsert): Promise<Post | null> => {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating post:', error)
    return null
  }

  return data
}

// 删除文章
export const deletePost = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting post:', error)
    return false
  }

  return true
}

// 增加浏览量
export const incrementViewCount = async (id: string): Promise<void> => {
  const { error } = await supabase.rpc('increment_view_count', { post_id: id })
  if (error) {
    // 如果 RPC 不存在，使用简单更新
    const { data: post } = await supabase
      .from('posts')
      .select('view_count')
      .eq('id', id)
      .single()
    
    if (post) {
      await supabase
        .from('posts')
        .update({ view_count: post.view_count + 1 })
        .eq('id', id)
    }
  }
}

// 获取所有分类
export const getCategories = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select('category')
    .eq('status', 'published')
    .not('category', 'is', null)

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  const categories = [...new Set(data.map(p => p.category).filter(Boolean))]
  return categories as string[]
}

// 获取所有标签
export const getTags = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select('tags')
    .eq('status', 'published')

  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }

  const tags = new Set<string>()
  data.forEach(p => {
    p.tags?.forEach(tag => tags.add(tag))
  })

  return Array.from(tags)
}
