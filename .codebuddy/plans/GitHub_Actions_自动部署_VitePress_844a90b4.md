---
name: GitHub Actions 自动部署 VitePress
overview: 配置 GitHub Actions 自动部署 VitePress 项目到 GitHub Pages，包括修改 VitePress 配置和创建 CI/CD 工作流文件
todos:
  - id: modify-config
    content: 修改 VitePress 配置文件，添加 base 路径并更新 sitemap 域名
    status: completed
  - id: create-workflow
    content: 创建 .github/workflows/deploy.yml 工作流文件
    status: completed
  - id: push-configure
    content: 提交代码并推送至 GitHub，配置 Pages 使用 GitHub Actions
    status: completed
    dependencies:
      - modify-config
      - create-workflow
---

## 用户需求

将本地已成功运行的 VitePress 项目（使用 vitepress-theme-teek 主题）通过 GitHub Actions 自动部署到 GitHub Pages，实现与本地一致的访问效果。

## 核心任务

- 配置 VitePress 的 base 路径和 sitemap 域名
- 创建 GitHub Actions 工作流文件实现自动化部署
- 确保部署后静态资源路径正确、页面可正常访问

## 技术方案

### 部署架构

```
本地开发 → git push → GitHub Actions 触发 → pnpm install → pnpm docs:build → 上传构建产物 → 部署到 GitHub Pages
```

### 关键配置说明

| 配置项 | 值 | 说明 |
| --- | --- | --- |
| base | `/` | 用户主页仓库，根路径部署 |
| 输出目录 | `docs/.vitepress/dist/` | VitePress 默认构建输出 |
| 包管理器 | pnpm | 项目使用 pnpm-lock.yaml |
| Node 版本 | 20 | VitePress 推荐版本 |


### 实施要点

1. **修改 VitePress 配置**：添加 `base: '/'`，更新 `sitemap.hostname` 为实际域名
2. **创建 GitHub Actions 工作流**：在项目根目录创建 `.github/workflows/deploy.yml`
3. **GitHub Pages 设置**：将 Source 改为 GitHub Actions

## 目录结构

```
ChuYanZhio.github.io/
├── .github/
│   └── workflows/
│       └── deploy.yml              # [NEW] GitHub Actions 自动部署工作流
├── vitepress-theme-teek-docs-template/
│   ├── docs/
│   │   └── .vitepress/
│   │       └── config.ts           # [MODIFY] 添加 base 配置，修改 sitemap.hostname
│   ├── package.json
│   └── pnpm-lock.yaml
└── README.md
```