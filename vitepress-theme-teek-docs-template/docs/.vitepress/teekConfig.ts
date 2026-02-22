import { defineTeekConfig } from "vitepress-theme-teek/config";
import { version } from "vitepress-theme-teek/es/version";

export const teekConfig = defineTeekConfig({
  teekHome: false, // 是否开启博客首页
  vpHome: true, // 是否隐藏 VP 首页
  sidebarTrigger: true, // 是否开启侧边栏折叠功能
  author: { name: "Teeker", link: "https://github.com/Kele-Bingtang" },
  footerInfo: {
    theme: {
      name: `Theme By Teek@${version}`,
    },
    copyright: {
      createYear: 2025,
      suffix: "Teek",
    },
  },
  codeBlock: {
    copiedDone: (TkMessage) => TkMessage.success("复制成功！"),
  },
  articleShare: { enabled: true },
  vitePlugins: {
    sidebarOption: {
      initItems: false,
      resolveRule: "rewrites" as const,
    },
  },
  // 启用私密文章功能，对接 Supabase Auth
  private: {
    enabled: true,
    siteLogin: true,
    // 自定义登录验证逻辑：从 Supabase 会话中验证
    doValidate: async () => {
      const sessionStr = localStorage.getItem("supabase_session");
      if (!sessionStr) return false;
      try {
        const session = JSON.parse(sessionStr);
        // 检查会话是否过期
        if (session.expires_at && Date.now() / 1000 > session.expires_at) {
          localStorage.removeItem("supabase_session");
          return false;
        }
        return true;
      } catch {
        return false;
      }
    },
    // 静态备用用户（Supabase 不可用时使用）
    site: [
      { username: "admin", password: "admin123", role: "admin" },
    ],
  },
});
