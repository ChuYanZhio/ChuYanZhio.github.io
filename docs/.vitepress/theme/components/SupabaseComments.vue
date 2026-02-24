<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useData } from 'vitepress'
import { getCommentsByPostId, createComment, deleteComment } from '../../lib/api'
import { useAuth } from '../../lib/useAuth'
import type { Comment, Profile } from '../../lib/database.types'

const { page } = useData()
const { user, profile, isLoggedIn, displayName, avatarUrl, initAuth } = useAuth()

const comments = ref<Comment[]>([])
const isClient = ref(false)
const loading = ref(false)
const submitting = ref(false)
const newComment = ref('')
const replyTo = ref<Comment | null>(null)

// 获取当前页面路径作为 post_id 的替代
const getPostKey = () => {
  return page.value.filePath || window.location.pathname
}

// 加载评论
const loadComments = async () => {
  loading.value = true
  try {
    const postKey = getPostKey()
    comments.value = await getCommentsByPostId(postKey)
  } catch (e) {
    console.error('Failed to load comments:', e)
  } finally {
    loading.value = false
  }
}

// 提交评论
const submitComment = async () => {
  if (!newComment.value.trim()) return
  
  submitting.value = true
  try {
    const postKey = getPostKey()
    await createComment({
      post_id: postKey,
      content: newComment.value.trim(),
      parent_id: replyTo.value?.id || null,
    })
    newComment.value = ''
    replyTo.value = null
    await loadComments()
  } catch (e: any) {
    console.error('Failed to submit comment:', e)
    alert(e?.message || '评论发布失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 回复评论
const setReplyTo = (comment: Comment) => {
  replyTo.value = comment
}

// 删除评论
const handleDelete = async (id: string) => {
  if (!confirm('确定要删除这条评论吗？')) return
  await deleteComment(id)
  await loadComments()
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 获取头像 URL
const getAvatarUrl = (url: string | null | undefined) => {
  return url || `https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous`
}

// 获取显示名称
const getDisplayName = (p: Profile | null | undefined) => {
  return p?.nickname || p?.username || '匿名用户'
}

onMounted(async () => {
  isClient.value = true
  await initAuth()
  await loadComments()
})
</script>

<template>
  <div class="supabase-comments" v-if="isClient">
    <h3 class="comments-title">
      评论 <span class="count">{{ comments.length }}</span>
    </h3>

    <!-- 评论输入框 -->
    <div class="comment-input" v-if="isLoggedIn">
      <div class="avatar">
        <img :src="avatarUrl" :alt="displayName" />
      </div>
      <div class="input-wrapper">
        <textarea 
          v-model="newComment" 
          placeholder="写下你的评论..." 
          rows="3"
          :disabled="submitting"
        ></textarea>
        <div class="actions">
          <button 
            class="submit-btn" 
            @click="submitComment" 
            :disabled="!newComment.trim() || submitting"
          >
            {{ submitting ? '发送中...' : '发送评论' }}
          </button>
        </div>
      </div>
    </div>
    
    <div class="login-tip" v-else>
      <p>请先 <a href="/login">登录</a> 后参与评论</p>
    </div>

    <!-- 评论列表 -->
    <div class="comments-list" v-if="comments.length > 0">
      <div class="comment-item" v-for="comment in comments" :key="comment.id">
        <div class="avatar">
          <img :src="getAvatarUrl(comment.author?.avatar_url)" :alt="getDisplayName(comment.author)" />
        </div>
        <div class="comment-body">
          <div class="comment-header">
            <span class="author">{{ getDisplayName(comment.author) }}</span>
            <span class="time">{{ formatDate(comment.created_at) }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
          <div class="comment-actions">
            <button class="action-btn" @click="setReplyTo(comment)">回复</button>
            <button 
              class="action-btn delete" 
              v-if="user?.id === comment.user_id" 
              @click="handleDelete(comment.id)"
            >
              删除
            </button>
          </div>
          
          <!-- 回复列表 -->
          <div class="replies" v-if="comment.replies && comment.replies.length > 0">
            <div class="reply-item" v-for="reply in comment.replies" :key="reply.id">
              <div class="avatar small">
                <img :src="getAvatarUrl(reply.author?.avatar_url)" :alt="getDisplayName(reply.author)" />
              </div>
              <div class="reply-body">
                <span class="author">{{ getDisplayName(reply.author) }}</span>
                <span class="content">{{ reply.content }}</span>
                <span class="time">{{ formatDate(reply.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="no-comments" v-else-if="!loading">
      <p>暂无评论，快来抢沙发吧！</p>
    </div>

    <div class="loading" v-if="loading">
      <span>加载中...</span>
    </div>
  </div>
</template>

<style scoped>
.supabase-comments {
  margin-top: 40px;
  padding: 20px 0;
}

.comments-title {
  font-size: 1.2em;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.comments-title .count {
  background: var(--vp-c-brand-1);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
}

.comment-input {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar.small {
  width: 28px;
  height: 28px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.input-wrapper {
  flex: 1;
}

.input-wrapper textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.input-wrapper textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.actions {
  margin-top: 8px;
  text-align: right;
}

.submit-btn {
  padding: 8px 20px;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-tip {
  text-align: center;
  padding: 20px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  margin-bottom: 20px;
}

.login-tip a {
  color: var(--vp-c-brand-1);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-body {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-header .author {
  font-weight: 500;
}

.comment-header .time {
  font-size: 0.85em;
  color: var(--vp-c-text-2);
}

.comment-content {
  line-height: 1.6;
}

.comment-actions {
  margin-top: 8px;
  display: flex;
  gap: 12px;
}

.action-btn {
  background: none;
  border: none;
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 0.85em;
  padding: 0;
}

.action-btn:hover {
  color: var(--vp-c-brand-1);
}

.action-btn.delete:hover {
  color: var(--vp-c-danger-1);
}

.replies {
  margin-top: 12px;
  padding-left: 12px;
  border-left: 2px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.reply-body {
  font-size: 0.9em;
}

.reply-body .author {
  font-weight: 500;
  margin-right: 8px;
}

.reply-body .time {
  color: var(--vp-c-text-3);
  font-size: 0.85em;
  margin-left: 8px;
}

.no-comments {
  text-align: center;
  padding: 40px;
  color: var(--vp-c-text-2);
}

.loading {
  text-align: center;
  padding: 20px;
  color: var(--vp-c-text-2);
}
</style>
