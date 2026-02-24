import { defineConfig, loadEnv } from "vitepress";
import { teekConfig } from "./teekConfig";

// 加载环境变量
const env = loadEnv("", process.cwd());

const description = "仙途传说 - 十年修仙路，一朝问仙途";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  extends: teekConfig,
  title: "仙途传说",
  description: description,
  cleanUrls: false,
  lastUpdated: true,
  lang: "zh-CN",
  ignoreDeadLinks: true, // 忽略死链接
  vite: {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL || ""),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ""),
    },
  },
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/teek-logo-mini.svg" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:locale", content: "zh-CN" }],
    ["meta", { property: "og:title", content: "仙途传说 | 修仙世界" }],
    ["meta", { property: "og:site_name", content: "仙途传说" }],
    ["meta", { name: "author", content: "仙途传说" }],
    ["meta", { name: "keywords", content: "仙途传说,修仙游戏,仙侠,玄幻" }],
  ],
  themeConfig: {
    logo: "/teek-logo-mini.svg",
    nav: [
      { text: "首页", link: "/" },
      { text: "游戏指南", link: "/guide/intro" },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/ChuYanZhio/ChuYanZhio.github.io" },
],
    search: { provider: "local" },
  },
});
