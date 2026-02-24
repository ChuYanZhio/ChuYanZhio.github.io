<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vitepress'
import { useAuth } from '../../lib/useAuth'
import { uploadAvatar, deleteOldAvatar } from '../../lib/api/storage'

const router = useRouter()
const { user, profile, isLoggedIn, displayName, avatarUrl, updateProfile, initAuth } = useAuth()

const isClient = ref(false)
const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const message = ref('')
const isError = ref(false)

// 表单数据
const nickname = ref('')
const username = ref('')
const bio = ref('')
const website = ref('')
const avatarUrlInput = ref('')

// 文件上传引用
const fileInput = ref<HTMLInputElement | null>(null)

// 裁切相关
const showCropper = ref(false)
const originalImage = ref<string | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const cropSize = ref(200) // 输出图片尺寸
const quality = ref(0.85) // 压缩质量

// 裁切框状态
const cropBox = ref({
  x: 0,
  y: 0,
  width: 100,
  height: 100
})

// 图片原始尺寸
const imageDimensions = ref({
  width: 0,
  height: 0
})

// 缩放比例
const scale = ref(1)

// 是否正在拖动
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

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

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    message.value = '请选择图片文件'
    isError.value = true
    return
  }

  // 验证文件大小（最大 10MB，裁切时会压缩）
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    message.value = '图片大小不能超过 10MB'
    isError.value = true
    return
  }

  // 读取图片并显示裁切器
  const reader = new FileReader()
  reader.onload = (e) => {
    originalImage.value = e.target?.result as string
    initCropper()
  }
  reader.readAsDataURL(file)
  
  // 清空文件输入
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 初始化裁切器
const initCropper = () => {
  const img = new Image()
  img.onload = () => {
    imageDimensions.value = {
      width: img.width,
      height: img.height
    }
    
    // 计算缩放比例（最大显示 500px）
    const maxDisplay = 500
    scale.value = Math.min(maxDisplay / img.width, maxDisplay / img.height, 1)
    
    // 初始化裁切框（居中，正方形）
    const displayWidth = img.width * scale.value
    const displayHeight = img.height * scale.value
    const cropSide = Math.min(displayWidth, displayHeight) * 0.8
    
    cropBox.value = {
      x: (displayWidth - cropSide) / 2,
      y: (displayHeight - cropSide) / 2,
      width: cropSide,
      height: cropSide
    }
    
    showCropper.value = true
  }
  img.src = originalImage.value!
}

// 获取显示尺寸
const displayDimensions = computed(() => ({
  width: imageDimensions.value.width * scale.value,
  height: imageDimensions.value.height * scale.value
}))

// 鼠标事件处理
const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  const rect = (e.target as HTMLElement).getBoundingClientRect()
  dragStart.value = {
    x: e.clientX - rect.left - cropBox.value.x,
    y: e.clientY - rect.top - cropBox.value.y
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  
  const container = (e.target as HTMLElement).closest('.crop-container')
  if (!container) return
  
  const rect = container.getBoundingClientRect()
  let newX = e.clientX - rect.left - dragStart.value.x
  let newY = e.clientY - rect.top - dragStart.value.y
  
  // 边界限制
  newX = Math.max(0, Math.min(newX, displayDimensions.value.width - cropBox.value.width))
  newY = Math.max(0, Math.min(newY, displayDimensions.value.height - cropBox.value.height))
  
  cropBox.value.x = newX
  cropBox.value.y = newY
}

const handleMouseUp = () => {
  isDragging.value = false
}

// 触摸事件处理
const handleTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0]
  isDragging.value = true
  const rect = (e.target as HTMLElement).getBoundingClientRect()
  dragStart.value = {
    x: touch.clientX - rect.left - cropBox.value.x,
    y: touch.clientY - rect.top - cropBox.value.y
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  
  const touch = e.touches[0]
  const container = (e.target as HTMLElement).closest('.crop-container')
  if (!container) return
  
  const rect = container.getBoundingClientRect()
  let newX = touch.clientX - rect.left - dragStart.value.x
  let newY = touch.clientY - rect.top - dragStart.value.y
  
  // 边界限制
  newX = Math.max(0, Math.min(newX, displayDimensions.value.width - cropBox.value.width))
  newY = Math.max(0, Math.min(newY, displayDimensions.value.height - cropBox.value.height))
  
  cropBox.value.x = newX
  cropBox.value.y = newY
}

const handleTouchEnd = () => {
  isDragging.value = false
}

// 取消裁切
const cancelCrop = () => {
  showCropper.value = false
  originalImage.value = null
}

// 确认裁切并上传
const confirmCrop = async () => {
  if (!originalImage.value || !user.value?.id) return

  uploading.value = true
  message.value = ''

  try {
    // 创建 canvas 进行裁切和压缩
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('无法创建 Canvas')
    }

    // 设置输出尺寸
    canvas.width = cropSize.value
    canvas.height = cropSize.value

    // 加载原图
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = originalImage.value!
    })

    // 计算实际裁切坐标（从显示坐标转换为原图坐标）
    const realX = cropBox.value.x / scale.value
    const realY = cropBox.value.y / scale.value
    const realWidth = cropBox.value.width / scale.value
    const realHeight = cropBox.value.height / scale.value

    // 绘制裁切区域到 canvas
    ctx.drawImage(
      img,
      realX, realY, realWidth, realHeight,
      0, 0, cropSize.value, cropSize.value
    )

    // 转换为 Blob（压缩）
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b)
          else reject(new Error('图片转换失败'))
        },
        'image/jpeg',
        quality.value
      )
    })

    // 检查压缩后大小
    console.log(`压缩后大小: ${(blob.size / 1024).toFixed(2)} KB`)

    // 创建 File 对象
    const file = new File([blob], `avatar_${user.value.id}.jpg`, { type: 'image/jpeg' })

    // 上传
    const result = await uploadAvatar(file, user.value.id)
    
    if (result.url) {
      // 删除旧头像
      if (avatarUrlInput.value) {
        await deleteOldAvatar(avatarUrlInput.value)
      }
      
      avatarUrlInput.value = result.url
      
      // 自动保存头像到数据库
      const saveResult = await updateProfile({
        avatar_url: result.url,
      })
      
      if (saveResult) {
        message.value = '头像上传成功！'
        isError.value = false
        showCropper.value = false
        originalImage.value = null
      } else {
        message.value = '头像已上传，但保存失败，请点击"保存设置"按钮'
        isError.value = true
        showCropper.value = false
        originalImage.value = null
      }
    } else {
      // 显示具体错误信息
      message.value = result.error || '头像上传失败，请重试'
      isError.value = true
      // 不关闭裁切弹窗，让用户可以重试
    }
  } catch (e: any) {
    console.error('裁切上传失败:', e)
    message.value = e.message || '头像处理失败，请重试'
    isError.value = true
  } finally {
    uploading.value = false
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
          <div class="avatar-preview">
            <img :src="avatarUrlInput || avatarUrl" :alt="displayName" class="current-avatar" />
            <div v-if="uploading" class="avatar-loading">
              <span class="loading-spinner"></span>
            </div>
          </div>
          <div class="avatar-actions">
            <input 
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileChange"
              style="display: none"
            />
            <button 
              class="upload-btn" 
              @click="triggerFileInput"
              :disabled="uploading"
            >
              {{ uploading ? '处理中...' : '📷 上传头像' }}
            </button>
            <p class="upload-hint">支持 JPG、PNG 格式，可裁切为正方形头像</p>
            
            <div class="divider">
              <span>或者</span>
            </div>
            
            <label>头像链接</label>
            <input 
              v-model="avatarUrlInput" 
              type="url" 
              placeholder="输入头像图片 URL"
              class="input-field"
            />
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
          :disabled="saving || uploading || (website && !isValidUrl(website))"
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
    
    <!-- 图片裁切弹窗 -->
    <Teleport to="body">
      <div v-if="showCropper" class="cropper-modal" @click.self="cancelCrop">
        <div class="cropper-dialog">
          <div class="cropper-header">
            <h3>裁切头像</h3>
            <button class="close-btn" @click="cancelCrop">&times;</button>
          </div>
          
          <div class="cropper-body">
            <p class="cropper-tip">拖动裁切框选择区域，将裁切为正方形头像</p>
            
            <div 
              class="crop-container"
              :style="{
                width: displayDimensions.width + 'px',
                height: displayDimensions.height + 'px'
              }"
              @mousemove="handleMouseMove"
              @mouseup="handleMouseUp"
              @mouseleave="handleMouseUp"
              @touchmove="handleTouchMove"
              @touchend="handleTouchEnd"
            >
              <img 
                :src="originalImage!" 
                :style="{
                  width: displayDimensions.width + 'px',
                  height: displayDimensions.height + 'px'
                }"
                draggable="false"
              />
              
              <!-- 裁切遮罩 -->
              <div class="crop-overlay"></div>
              
              <!-- 裁切框 -->
              <div 
                class="crop-box"
                :style="{
                  left: cropBox.x + 'px',
                  top: cropBox.y + 'px',
                  width: cropBox.width + 'px',
                  height: cropBox.height + 'px'
                }"
                @mousedown="handleMouseDown"
                @touchstart="handleTouchStart"
              >
                <div class="crop-grid"></div>
                <div class="crop-corner tl"></div>
                <div class="crop-corner tr"></div>
                <div class="crop-corner bl"></div>
                <div class="crop-corner br"></div>
              </div>
            </div>
            
            <div class="cropper-options">
              <div class="option-item">
                <label>输出尺寸</label>
                <select v-model="cropSize">
                  <option :value="100">100 x 100 (小)</option>
                  <option :value="200">200 x 200 (中)</option>
                  <option :value="300">300 x 300 (大)</option>
                </select>
              </div>
              <div class="option-item">
                <label>图片质量</label>
                <select v-model="quality">
                  <option :value="0.6">低 (60%)</option>
                  <option :value="0.75">中 (75%)</option>
                  <option :value="0.85">高 (85%)</option>
                  <option :value="0.95">最高 (95%)</option>
                </select>
              </div>
            </div>
            
            <!-- 裁切弹窗内的错误提示 -->
            <div v-if="message && isError && showCropper" class="crop-error">
              ⚠️ {{ message }}
            </div>
          </div>
          
          <div class="cropper-footer">
            <button class="btn-cancel" @click="cancelCrop">取消</button>
            <button class="btn-confirm" @click="confirmCrop" :disabled="uploading">
              {{ uploading ? '处理中...' : '确认裁切' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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

.avatar-preview {
  position: relative;
  flex-shrink: 0;
}

.current-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--vp-c-brand-1);
}

.avatar-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.avatar-actions {
  flex: 1;
}

.upload-btn {
  padding: 10px 20px;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
}

.upload-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.upload-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin-bottom: 16px;
}

.divider {
  display: flex;
  align-items: center;
  margin: 16px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--vp-c-divider);
}

.divider span {
  padding: 0 12px;
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.avatar-actions label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
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
  transition: all 0.2s;
}

.save-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
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

/* 裁切弹窗样式 */
.cropper-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.cropper-dialog {
  background: var(--vp-c-bg);
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.cropper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.cropper-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--vp-c-text-1);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: var(--vp-c-text-1);
}

.cropper-body {
  padding: 20px;
  overflow-y: auto;
}

.cropper-tip {
  text-align: center;
  color: var(--vp-c-text-2);
  font-size: 14px;
  margin-bottom: 16px;
}

.crop-container {
  position: relative;
  margin: 0 auto;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  user-select: none;
  touch-action: none;
}

.crop-container img {
  display: block;
}

.crop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.crop-box {
  position: absolute;
  border: 2px solid #fff;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  cursor: move;
}

.crop-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px);
  background-size: 33.33% 33.33%;
  pointer-events: none;
}

.crop-corner {
  position: absolute;
  width: 10px;
  height: 10px;
  border: 2px solid #fff;
  background: var(--vp-c-brand-1);
}

.crop-corner.tl { top: -2px; left: -2px; border-right: none; border-bottom: none; }
.crop-corner.tr { top: -2px; right: -2px; border-left: none; border-bottom: none; }
.crop-corner.bl { bottom: -2px; left: -2px; border-right: none; border-top: none; }
.crop-corner.br { bottom: -2px; right: -2px; border-left: none; border-top: none; }

.cropper-options {
  display: flex;
  gap: 20px;
  margin-top: 16px;
  justify-content: center;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-item label {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.option-item select {
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.crop-error {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fef0f0;
  color: #f56c6c;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.cropper-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--vp-c-divider);
}

.btn-cancel,
.btn-confirm {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.btn-cancel:hover {
  background: var(--vp-c-bg);
}

.btn-confirm {
  background: var(--vp-c-brand-1);
  border: none;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .avatar-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .avatar-actions {
    width: 100%;
  }
  
  .upload-btn {
    width: 100%;
  }
  
  .cropper-options {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

<!-- 全局样式：隐藏设置页面的自动标题 -->
<style>
/* 隐藏 VitePress 自动生成的页面标题 */
.vp-doc h1:first-child {
  display: none;
}

/* 当 userSettings 组件存在时，隐藏父容器的标题 */
.user-settings + h1,
.user-settings ~ h1 {
  display: none;
}
</style>
