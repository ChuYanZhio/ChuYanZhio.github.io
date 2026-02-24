import { defineTeekConfig } from "vitepress-theme-teek/config";
import { version } from "vitepress-theme-teek/es/version";

export const teekConfig = defineTeekConfig({
  teekHome: false,
  vpHome: true,
  sidebarTrigger: true,
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
    },
  },
  // 配置私密功能，使用 Supabase 认证
  private: {
    enabled: false, // 设为 true 启用全站登录保护
    siteLogin: false, // 设为 true 启用站点级登录
    // 自定义登录逻辑 - 使用 Supabase
    doLogin: (loginInfo, _type, _nativeLogin) => {
      const { username, password } = loginInfo
      
      // 使用邮箱和密码登录 Supabase
      import('./lib/auth').then(async ({ supabaseLogin }) => {
        const success = await supabaseLogin(username, password)
        if (success) {
          const searchParams = new URL(window.location.href).searchParams
          const toPath = searchParams.get('toPath') || '/'
          window.location.href = toPath
        } else {
          alert('登录失败，请检查邮箱和密码')
        }
      })
      
      return undefined // 返回 undefined 表示自定义处理
    },
    doValidate: (_type, _frontmatter, nativeValidate) => {
      return nativeValidate()
    },
  },
});
