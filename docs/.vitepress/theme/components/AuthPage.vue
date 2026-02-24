<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useData, withBase } from 'vitepress'
import { 
  supabaseLogin, 
  supabaseRegister, 
  supabaseResetPassword,
  type AuthResult 
} from '../../lib/auth'
import { useAuth } from '../../lib/useAuth'

const router = useRouter()
const { frontmatter } = useData()
const { initAuth, isLoggedIn } = useAuth()

// 当前模式：login | register | forgot
const mode = ref<'login' | 'register' | 'forgot'>('login')

// 表单数据
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const verifyCode = ref('')
const imgCode = ref('')

// 状态
const isMounted = ref(false)
const loading = ref(false)
const message = ref('')
const isError = ref(false)

// 生成验证码（包含大小写字母和数字）
const generateImgCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  imgCode.value = result
}

// 验证验证码（大小写不敏感）
const verifyCaptcha = () => {
  return verifyCode.value.toLowerCase() === imgCode.value.toLowerCase()
}

// 验证邮箱格式
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// 跳转到指定路径
const navigateToPath = () => {
  const searchParams = new URL(window.location.href).searchParams
  const toPath = searchParams.get('toPath') || '/'
  router.go(toPath)
}



// 处理登录
const handleLogin = async () => {
  if (!email.value) {
    message.value = '请输入邮箱'
    isError.value = true
    return
  }
  if (!isValidEmail(email.value)) {
    message.value = '邮箱格式不正确'
    isError.value = true
    return
  }
  if (!password.value) {
    message.value = '请输入密码'
    isError.value = true
    return
  }
  if (!verifyCode.value) {
    message.value = '请输入验证码'
    isError.value = true
    return
  }
  if (!verifyCaptcha()) {
    message.value = '验证码错误'
    isError.value = true
    generateImgCode()
    return
  }

  loading.value = true
  message.value = ''
  
  const result = await supabaseLogin(email.value, password.value)
  
  if (result.success) {
    message.value = '登录成功！'
    isError.value = false
    // 登录成功后，Supabase 会自动更新 session，监听器会处理跳转
    setTimeout(() => {
      navigateToPath()
    }, 500)
  } else {
    message.value = result.error || '登录失败'
    isError.value = true
    generateImgCode()
  }
  
  loading.value = false
}

// 处理注册
const handleRegister = async () => {
  if (!email.value) {
    message.value = '请输入邮箱'
    isError.value = true
    return
  }
  if (!isValidEmail(email.value)) {
    message.value = '邮箱格式不正确'
    isError.value = true
    return
  }
  if (!password.value) {
    message.value = '请输入密码'
    isError.value = true
    return
  }
  if (password.value.length < 6) {
    message.value = '密码长度至少6位'
    isError.value = true
    return
  }
  if (!confirmPassword.value) {
    message.value = '请确认密码'
    isError.value = true
    return
  }
  if (password.value !== confirmPassword.value) {
    message.value = '两次输入的密码不一致'
    isError.value = true
    return
  }
  if (!verifyCode.value) {
    message.value = '请输入验证码'
    isError.value = true
    return
  }
  if (!verifyCaptcha()) {
    message.value = '验证码错误'
    isError.value = true
    generateImgCode()
    return
  }

  loading.value = true
  message.value = ''
  
  const result = await supabaseRegister(email.value, password.value, confirmPassword.value)
  
  if (result.success) {
    message.value = result.error || '注册成功！请查收验证邮件。'
    isError.value = false
    // 切换到登录模式
    setTimeout(() => {
      mode.value = 'login'
      password.value = ''
      confirmPassword.value = ''
      verifyCode.value = ''
      generateImgCode()
    }, 2000)
  } else {
    message.value = result.error || '注册失败'
    isError.value = true
    generateImgCode()
  }
  
  loading.value = false
}

// 处理忘记密码
const handleForgotPassword = async () => {
  if (!email.value) {
    message.value = '请输入邮箱'
    isError.value = true
    return
  }
  if (!isValidEmail(email.value)) {
    message.value = '邮箱格式不正确'
    isError.value = true
    return
  }
  if (!verifyCode.value) {
    message.value = '请输入验证码'
    isError.value = true
    return
  }
  if (!verifyCaptcha()) {
    message.value = '验证码错误'
    isError.value = true
    generateImgCode()
    return
  }

  loading.value = true
  message.value = ''
  
  const result = await supabaseResetPassword(email.value)
  
  if (result.success) {
    message.value = result.error || '重置邮件已发送！'
    isError.value = false
  } else {
    message.value = result.error || '发送失败'
    isError.value = true
    generateImgCode()
  }
  
  loading.value = false
}

// 重置表单
const resetForm = () => {
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  verifyCode.value = ''
  message.value = ''
  generateImgCode()
}

// 切换模式
const switchMode = (newMode: 'login' | 'register' | 'forgot') => {
  mode.value = newMode
  resetForm()
}

// 配置
const logo = computed(() => frontmatter.value.logo)
const leftImg = computed(() => frontmatter.value.leftImg)
const name = computed(() => frontmatter.value.name ?? 'VitePress Theme Teek')

// Auth 状态监听器
let authSubscription: { unsubscribe: () => void } | null = null

onMounted(async () => {
  isMounted.value = true
  generateImgCode()
  
  // 初始化认证状态
  await initAuth()
  
  // 如果已登录，跳转
  if (isLoggedIn.value) {
    navigateToPath()
  }
})

onUnmounted(() => {
  // 清理监听器
  if (authSubscription) {
    authSubscription.unsubscribe()
    authSubscription = null
  }
})
</script>

<template>
  <div class="auth-page" aria-label="认证页面">
    <div class="auth-wrapper">
      <!-- 左侧背景图 -->
      <div v-if="leftImg" class="auth-left">
        <img :src="withBase(leftImg)" alt="auth" />
      </div>
      
      <!-- 右侧表单 -->
      <div class="auth-right">
        <!-- 头部 -->
        <div class="auth-header">
          <img v-if="logo" :src="logo" alt="logo" />
          <span class="title">{{ name }}</span>
        </div>
        
        <!-- 标签切换 -->
        <div class="auth-tabs">
          <button 
            :class="['tab', { active: mode === 'login' }]" 
            @click="switchMode('login')"
          >
            登录
          </button>
          <button 
            :class="['tab', { active: mode === 'register' }]" 
            @click="switchMode('register')"
          >
            注册
          </button>
          <button 
            :class="['tab', { active: mode === 'forgot' }]" 
            @click="switchMode('forgot')"
          >
            忘记密码
          </button>
        </div>
        
        <!-- 表单 -->
        <form v-if="isMounted" class="auth-form" @submit.prevent>
          <!-- 邮箱 -->
          <div class="form-item">
            <div class="input-wrapper">
              <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <input
                v-model="email"
                type="email"
                class="input-control"
                placeholder="请输入邮箱"
                @focus="message = ''"
              />
            </div>
          </div>
          
          <!-- 密码 -->
          <div class="form-item" v-if="mode !== 'forgot'">
            <div class="input-wrapper">
              <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              <input
                v-model="password"
                type="password"
                class="input-control"
                placeholder="请输入密码（至少6位）"
                @focus="message = ''"
              />
            </div>
          </div>
          
          <!-- 确认密码 -->
          <div class="form-item" v-if="mode === 'register'">
            <div class="input-wrapper">
              <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              <input
                v-model="confirmPassword"
                type="password"
                class="input-control"
                placeholder="请再次输入密码"
                @focus="message = ''"
              />
            </div>
          </div>
          
          <!-- 验证码 -->
          <div class="form-item">
            <div class="input-wrapper flex-1">
              <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <input
                v-model="verifyCode"
                type="text"
                class="input-control"
                placeholder="请输入验证码"
                @focus="message = ''"
              />
            </div>
            <div class="verify-code" @click="generateImgCode" title="点击刷新">
              {{ imgCode }}
            </div>
          </div>
          
          <!-- 消息提示 -->
          <div v-if="message" :class="['message', { error: isError, success: !isError }]">
            {{ message }}
          </div>
          
          <!-- 提交按钮 -->
          <button
            type="button"
            class="submit-btn"
            :disabled="loading"
            @click="mode === 'login' ? handleLogin() : mode === 'register' ? handleRegister() : handleForgotPassword()"
          >
            {{ loading ? '处理中...' : mode === 'login' ? '登录' : mode === 'register' ? '注册' : '发送重置邮件' }}
          </button>
          
          <!-- 底部链接 -->
          <div class="auth-footer" v-if="mode === 'login'">
            <span>还没有账号？</span>
            <a @click="switchMode('register')">立即注册</a>
            <span class="divider">|</span>
            <a @click="switchMode('forgot')">忘记密码？</a>
          </div>
          <div class="auth-footer" v-else-if="mode === 'register'">
            <span>已有账号？</span>
            <a @click="switchMode('login')">立即登录</a>
          </div>
          <div class="auth-footer" v-else>
            <span>想起密码了？</span>
            <a @click="switchMode('login')">返回登录</a>
          </div>
        </form>
        
        <!-- 加载中提示 -->
        <div v-else class="loading-placeholder">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.auth-wrapper {
  display: flex;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 900px;
  width: 100%;
}

.auth-left {
  flex: 1;
  max-width: 50%;
  background: #f5f7fa;
}

.auth-left img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.auth-right {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.auth-header {
  text-align: center;
  margin-bottom: 24px;
}

.auth-header img {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
}

.auth-header .title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

.auth-tabs {
  display: flex;
  margin-bottom: 24px;
  border-bottom: 2px solid #eee;
}

.auth-tabs .tab {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.auth-tabs .tab.active {
  color: #667eea;
  font-weight: 500;
}

.auth-tabs .tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #667eea;
}

.auth-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  gap: 12px;
}

.input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 0 12px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.input-wrapper:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-wrapper .icon {
  color: #909399;
  margin-right: 8px;
  flex-shrink: 0;
}

.input-control {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 0;
  font-size: 14px;
  background: transparent;
}

.verify-code {
  width: 100px;
  height: 44px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 4px;
  cursor: pointer;
  user-select: none;
  color: #333;
  font-family: 'Courier New', monospace;
  flex-shrink: 0;
}

.verify-code:hover {
  opacity: 0.8;
}

.message {
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.message.error {
  background: #fef0f0;
  color: #f56c6c;
}

.message.success {
  background: #f0f9eb;
  color: #67c23a;
}

.submit-btn {
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.auth-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #909399;
}

.auth-footer a {
  color: #667eea;
  cursor: pointer;
  margin: 0 4px;
}

.auth-footer a:hover {
  text-decoration: underline;
}

.auth-footer .divider {
  margin: 0 8px;
}

.loading-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式 */
@media (max-width: 768px) {
  .auth-left {
    display: none;
  }
  
  .auth-right {
    padding: 24px;
  }
  
  .auth-tabs .tab {
    font-size: 14px;
    padding: 10px;
  }
}
</style>
