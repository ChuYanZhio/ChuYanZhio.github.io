<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getSupabase } from "../../lib/supabase";

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMsg = ref("");
const isRegister = ref(false);
const session = ref<any>(null);
const isReady = ref(false);

onMounted(async () => {
  const supabase = getSupabase();
  if (!supabase) {
    errorMsg.value = "Supabase 配置未加载，请检查环境变量";
    isReady.value = true;
    return;
  }

  try {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();
    session.value = currentSession;

    // 监听认证状态变化
    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession;
    });
  } catch (err: any) {
    console.error("Session check error:", err);
  } finally {
    isReady.value = true;
  }
});

const handleSubmit = async () => {
  const supabase = getSupabase();
  if (!supabase) {
    errorMsg.value = "Supabase 未配置";
    return;
  }

  loading.value = true;
  errorMsg.value = "";

  try {
    if (isRegister.value) {
      // 检查注册频率限制
      const clientIp = "client-side"; // 客户端无法获取真实IP，使用标识
      const { data: canRegister, error: checkError } = await supabase.rpc(
        "check_registration_rate_limit",
        { p_ip: clientIp, p_email: email.value }
      );

      if (checkError) {
        console.warn("Rate limit check failed:", checkError);
      }

      if (canRegister === false) {
        throw new Error("注册过于频繁，请1分钟后再试");
      }

      // 执行注册
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      });

      if (error) throw error;

      // 记录注册尝试
      await supabase.rpc("log_registration_attempt", {
        p_ip: clientIp,
        p_email: email.value,
        p_user_agent: navigator.userAgent,
      });

      alert("注册成功！请检查邮箱验证。");
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });
      if (error) throw error;
      localStorage.setItem("supabase_session", JSON.stringify(data.session));
      window.location.reload();
    }
  } catch (err: any) {
    errorMsg.value = err.message || "操作失败，请重试";
  } finally {
    loading.value = false;
  }
};

const handleLogout = async () => {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem("supabase_session");
  window.location.reload();
};
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img src="/teek-logo-large.png" alt="Logo" class="logo" />
        <h2>{{ isRegister ? "注册账户" : "用户登录" }}</h2>
      </div>

      <!-- 加载中 -->
      <div v-if="!isReady" class="loading">
        <p>加载中...</p>
      </div>

      <!-- 已登录状态 -->
      <div v-else-if="session" class="logged-in">
        <p>欢迎，{{ session.user?.email }}</p>
        <button @click="handleLogout" class="btn logout-btn">退出登录</button>
      </div>

      <!-- 未登录状态 -->
      <form v-else @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="请输入邮箱"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="请输入密码"
            required
            minlength="6"
          />
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button type="submit" :disabled="loading" class="btn submit-btn">
          {{ loading ? "处理中..." : isRegister ? "注册" : "登录" }}
        </button>

        <p class="switch-mode" @click="isRegister = !isRegister">
          {{ isRegister ? "已有账户？点击登录" : "没有账户？点击注册" }}
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.login-header h2 {
  color: #333;
  font-size: 24px;
  margin: 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.logout-btn {
  background: #ff6b6b;
  color: white;
  margin-top: 10px;
}

.logout-btn:hover {
  background: #ee5a5a;
}

.error-msg {
  color: #ff6b6b;
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
}

.switch-mode {
  text-align: center;
  margin-top: 20px;
  color: #667eea;
  cursor: pointer;
  font-size: 14px;
}

.switch-mode:hover {
  text-decoration: underline;
}

.logged-in,
.loading {
  text-align: center;
}

.logged-in p,
.loading p {
  color: #333;
  font-size: 16px;
  margin-bottom: 16px;
}
</style>
