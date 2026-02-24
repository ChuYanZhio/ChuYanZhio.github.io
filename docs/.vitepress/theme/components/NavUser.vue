<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '../../lib/useAuth'
import { useRouter } from 'vitepress'

const router = useRouter()
const { user, profile, loading, isLoggedIn, displayName, avatarUrl, logout, initAuth } = useAuth()

const showDropdown = ref(false)
const isClient = ref(false)

// 切换下拉菜单
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// 点击外部关闭下拉菜单
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.nav-user')) {
    showDropdown.value = false
  }
}

// 跳转到设置页面
const goToSettings = () => {
  showDropdown.value = false
  router.go('/settings')
}

// 跳转到登录页面
const goToLogin = () => {
  router.go('/login')
}

// 登出
const handleLogout = async () => {
  showDropdown.value = false
  await logout()
}

onMounted(() => {
  isClient.value = true
  initAuth()
  document.addEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="nav-user" v-if="isClient">
    <!-- 加载中 -->
    <div v-if="loading" class="nav-user-loading">
      <div class="spinner"></div>
    </div>
    
    <!-- 未登录 -->
    <button v-else-if="!isLoggedIn" class="login-btn" @click="goToLogin">
      <svg class="icon" viewBox="0 0 24 24" width="18" height="18">
        <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
      <span>登录</span>
    </button>
    
    <!-- 已登录 -->
    <div v-else class="user-info" @click="toggleDropdown">
      <img :src="avatarUrl" :alt="displayName" class="avatar" />
      <span class="name">{{ displayName }}</span>
      <svg class="arrow" :class="{ 'arrow-up': showDropdown }" viewBox="0 0 24 24" width="16" height="16">
        <path fill="currentColor" d="M7 10l5 5 5-5z"/>
      </svg>
      
      <!-- 下拉菜单 -->
      <Transition name="dropdown">
        <div v-if="showDropdown" class="dropdown">
          <div class="dropdown-header">
            <img :src="avatarUrl" :alt="displayName" class="dropdown-avatar" />
            <div class="dropdown-user-info">
              <div class="dropdown-name">{{ displayName }}</div>
              <div class="dropdown-email">{{ user?.email }}</div>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-menu">
            <button class="dropdown-item" @click.stop="goToSettings">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
              </svg>
              <span>个人设置</span>
            </button>
            <button class="dropdown-item logout" @click.stop="handleLogout">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.nav-user {
  position: relative;
  display: flex;
  align-items: center;
}

.nav-user-loading {
  width: 80px;
  display: flex;
  justify-content: center;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand-1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.login-btn:hover {
  opacity: 0.9;
}

.login-btn .icon {
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-info:hover {
  background: var(--vp-c-bg-soft);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--vp-c-divider);
}

.name {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow {
  color: var(--vp-c-text-2);
  transition: transform 0.2s;
}

.arrow-up {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 240px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  z-index: 100;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.dropdown-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.dropdown-user-info {
  flex: 1;
  min-width: 0;
}

.dropdown-name {
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 2px;
}

.dropdown-email {
  font-size: 12px;
  color: var(--vp-c-text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-divider {
  height: 1px;
  background: var(--vp-c-divider);
}

.dropdown-menu {
  padding: 8px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--vp-c-bg-soft);
}

.dropdown-item.logout {
  color: var(--vp-c-danger-1);
}

.dropdown-item.logout:hover {
  background: var(--vp-c-danger-soft);
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
