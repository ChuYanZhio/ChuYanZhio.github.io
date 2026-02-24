import { supabase } from '../supabase'
import type { Comment, CommentInsert } from '../database.types'

/**
 * 评论 API
 */

// 获取文章评论
export const getCommentsByPostId = async (postId: string): Promise<Comment[]> => {
  console.log('[Comments] 加载评论, postId:', postId)
  
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*, author:profiles(*)')
      .eq('post_id', postId)
      .eq('is_hidden', false)
      .is('parent_id', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Comments] 加载评论失败:', error)
      return []
    }

    // 获取回复
    const commentsWithReplies = await Promise.all(
      (data || []).map(async (comment) => {
        const { data: replies } = await supabase
          .from('comments')
          .select('*, author:profiles(*)')
          .eq('parent_id', comment.id)
          .eq('is_hidden', false)
          .order('created_at', { ascending: true })

        return {
          ...comment,
          replies: replies || [],
        }
      })
    )

    console.log('[Comments] 加载成功, 数量:', commentsWithReplies.length)
    return commentsWithReplies
  } catch (e) {
    console.error('[Comments] 加载评论异常:', e)
    return []
  }
}

// 创建评论
export const createComment = async (comment: CommentInsert): Promise<Comment | null> => {
  console.log('[Comments] 创建评论:', comment)
  
  try {
    const result = await supabase.auth.getUser()
    const user = result?.data?.user
    
    if (!user) {
      console.error('[Comments] 用户未登录')
      throw new Error('请先登录')
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        post_id: comment.post_id,
        content: comment.content,
        parent_id: comment.parent_id || null,
      })
      .select('*, author:profiles(*)')
      .single()

    if (error) {
      console.error('[Comments] 创建评论失败:', error)
      throw new Error(error.message || '评论发布失败')
    }

    console.log('[Comments] 评论创建成功:', data)
    return data
  } catch (e: any) {
    console.error('[Comments] 创建评论异常:', e)
    throw e
  }
}

// 删除评论
export const deleteComment = async (id: string): Promise<boolean> => {
  console.log('[Comments] 删除评论:', id)
  
  try {
    const result = await supabase.auth.getUser()
    const user = result?.data?.user
    if (!user) return false

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('[Comments] 删除评论失败:', error)
      return false
    }

    console.log('[Comments] 评论删除成功')
    return true
  } catch (e) {
    console.error('[Comments] 删除评论异常:', e)
    return false
  }
}

// 点赞评论
export const likeComment = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('like_comment', { comment_id: id })
    
    if (error) {
      // 如果 RPC 不存在，使用简单更新
      const { data: comment } = await supabase
        .from('comments')
        .select('like_count')
        .eq('id', id)
        .single()
      
      if (comment) {
        await supabase
          .from('comments')
          .update({ like_count: comment.like_count + 1 })
          .eq('id', id)
      }
    }

    return true
  } catch (e) {
    console.error('[Comments] 点赞失败:', e)
    return true
  }
}
