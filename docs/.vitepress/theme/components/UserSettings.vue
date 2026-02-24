<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vitepress'
import { useAuth } from '../../lib/useAuth'

const router = useRouter()
const { user, profile, isLoggedIn, displayName, avatarUrl, updateProfile, initAuth } = useAuth()

const isClient = ref(false)
const loading = ref(false)
const saving = ref(false)
const message = ref('')
const isError = ref(false)

// 表单数据
const nickname = ref('')
const username = ref('')
const bio = ref('')
const website = ref('')
const avatarUrlInput = ref('')

// 加载用户数据
const loadProfile = () => {
  if (profile.value) {
    nickname.value = profile.value.nickname || ''
    username.value = profile.value.username || ''
    bio.value = profile.value.bio || ''
    website.value = profile.value.website || ''
    avatarUrlInput.value = profile.value.avatar_url || ''
  }
}

// 保存设置
const handleSave = async () => {
  saving.value = true
  message.value = ''
  
  try {
    const success = await updateProfile({
      nickname: nickname.value || null,
      username: username.value || null,
      bio: bio.value || null,
      website: website.value || null,
      avatar_url: avatarUrlInput.value || null,
    })
    
    if (success) {
      message.value = '保存成功！'
      isError.value = false
    } else {
      message.value = '保存失败，请重试'
      isError.value = true
    }
  } catch (e) {
    message.value = '保存失败，请重试'
    isError.value = true
  } finally {
    saving.value = false
  }
}

// 验证网站 URL
const isValidUrl = (url: string) => {
  if (!url) return true
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

onMounted(async () => {
  isClient.value = true
  await initAuth()
  
  // 未登录跳转到登录页
  if (!isLoggedIn.value) {
    router.go('/login?toPath=/settings')
    return
  }
  
  loadProfile()
})
</script>

<template>
  <div class="user-settings" v-if="isClient">
    <div class="settings-container" v-if="isLoggedIn">
      <!-- 头部 -->
      <div class="settings-header">
        <h1>个人设置</h1>
        <p>管理你的个人信息和偏好设置</p>
      </div>
      
      <!-- 头像区域 -->
      <div class="settings-section">
        <div class="section-title">头像</div>
        <div class="avatar-section">
          <img :src="avatarUrlInput || avatarUrl" :alt="displayName" class="current-avatar" />
          <div class="avatar-input">
            <label>头像链接</label>
            <input 
              v-model="avatarUrlInput" 
              type="url" 
              placeholder="输入头像图片 URL"
              class="input-field"
            />
            <p class="input-hint">推荐使用正方形图片，支持 JPG、PNG 格式</p>
          </div>
        </div>
      </div>
      
      <!-- 基本信息 -->
      <div class="settings-section">
        <div class="section-title">基本信息</div>
        
        <div class="form-group">
          <label>昵称</label>
          <input 
            v-model="nickname" 
            type="text" 
            placeholder="输入你的昵称"
            class="input-field"
            maxlength="20"
          />
          <p class="input-hint">昵称会显示在你的评论和个人主页</p>
        </div>
        
        <div class="form-group">
          <label>用户名</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="输入用户名（英文字母、数字、下划线）"
            class="input-field"
            maxlength="20"
            pattern="[a-zA-Z0-9_]+"
          />
          <p class="input-hint">用户名用于个人主页地址</p>
        </div>
        
        <div class="form-group">
          <label>个人简介</label>
          <textarea 
            v-model="bio" 
            placeholder="介绍一下自己吧..."
            class="input-field textarea"
            rows="3"
            maxlength="200"
          ></textarea>
          <p class="input-hint">{{ bio.length }}/200 字符</p>
        </div>
        
        <div class="form-group">
          <label>个人网站</label>
          <input 
            v-model="website" 
            type="url" 
            placeholder="https://example.com"
            class="input-field"
            :class="{ 'input-error': website && !isValidUrl(website) }"
          />
          <p class="input-hint" v-if="website && !isValidUrl(website)" style="color: var(--vp-c-danger-1)">
            请输入有效的网址
          </p>
        </div>
      </div>
      
      <!-- 账户信息 -->
      <div class="settings-section">
        <div class="section-title">账户信息</div>
        <div class="account-info">
          <div class="info-item">
            <span class="info-label">邮箱地址</span>
            <span class="info-value">{{ user?.email }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">注册时间</span>
            <span class="info-value">{{ new Date(user?.created_at || '').toLocaleDateString('zh-CN') }}</span>
          </div>
        </div>
      </div>
      
      <!-- 消息提示 -->
      <div v-if="message" :class="['message', { 'message-error': isError, 'message-success': !isError }]">
        {{ message }}
      </div>
      
      <!-- 保存按钮 -->
      <div class="actions">
        <button 
          class="save-btn" 
          @click="handleSave"
          :disabled="saving || (website && !isValidUrl(website))"
        >
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
      </div>
    </div>
    
    <!-- 未登录提示 -->
    <div v-else class="not-logged-in">
      <p>请先登录后访问设置页面</p>
      <a href="/login" class="login-link">去登录</a>
    </div>
  </div>
</template>

<style scoped>
.user-settings {
  max-width: 720px;
  margin: 0 auto;
  padding: 40px 20px;
}

.settings-header {
  margin-bottom: 32px;
}

.settings-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.settings-header p {
  color: var(--vp-c-text-2);
}

.settings-section {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.avatar-section {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.current-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--vp-c-brand-1);
  flex-shrink: 0;
}

.avatar-input {
  flex: 1;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.input-field {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-size: 14px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px rgba(33, 82, 255, 0.1);
}

.input-field.input-error {
  border-color: var(--vp-c-danger-1);
}

.input-field.textarea {
  resize: vertical;
  min-height: 80px;
}

.input-hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin-top: 6px;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.info-value {
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-weight: 500;
}

.message {
  padding: 14px 18px;
  border-radius: 8px;
  margin-bottom: 24px;
  text-align: center;
  font-size: 14px;
}

.message-success {
  background: #f0f9eb;
  color: #67c23a;
}

.message-error {
  background: #fef0f0;
  color: #f56c6c;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.save-btn {
  padding: 12px 32px;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.save-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.not-logged-in {
  text-align: center;
  padding: 60px 20px;
}

.not-logged-in p {
  color: var(--vp-c-text-2);
  margin-bottom: 20px;
}

.login-link {
  display: inline-block;
  padding: 12px 32px;
  background: var(--vp-c-brand-1);
  color: white;
  border-radius: 8px;
  text-decoration: none;
}

@media (max-width: 640px) {
  .avatar-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .avatar-input {
    width: 100%;
  }
}
</style>
