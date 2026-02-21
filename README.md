## 使用VitePress 构建静态网站
- [主题官网](https://vp.teek.top/)
- 快速构建一个和 Teek 文档类似的项目，可以直接拉取现成的 Teek 文档模板仓库。
```
git clone https://github.com/Kele-Bingtang/vitepress-theme-teek-docs-template.git
```
## 运行vitepress-theme-teek
- 必须先执行 npm install 才能运行 npm run docs:dev，核心原因是 npm run 执行的命令依赖的工具（比如 vitepress）并不是系统全局安装的，而是存放在项目本地的依赖包里，npm install 就是把这些工具下载到项目里的过程。
- 项目里的 package.json 就像一个「购物清单」，里面的 devDependencies（开发依赖）和 dependencies（生产依赖）列出了项目运行需要的所有工具（比如 vitepress、sass 等），但这只是「清单」，并不是已经把工具买回来放在项目里了。
```
克隆下来后切换目录
PS C:\IM\AllDom\CodeBuddyCN\VitePressA\ChuYanZhio.github.io> cd vitepress-theme-teek-docs-template
PS C:\IM\AllDom\CodeBuddyCN\VitePressA\ChuYanZhio.github.io\vitepress-theme-teek-docs-template> npm install
⠙/


执行 npm install
npm install
如果安装速度慢或报错，可以尝试用淘宝镜像加速
npm install --registry=https://registry.npmmirror.com

运行项目
npm run docs:dev
```

- 运行成功
![示例](ls/image.png)


# 后续从GitHub拉取到本地要执行npm install  下载依赖包

---

## 自动部署流程

### 整体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                        本地仓库                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ docs/                                                        │   │
│  │   ├── 01.指南/01.简介/intro.md                               │   │
│  │   │   ↑ 文件包含 frontmatter:                                │   │
│  │   │   ---                                                    │   │
│  │   │   permalink: /guide/intro   ←── 永久链接定义             │   │
│  │   │   ---                                                    │   │
│  │   └── ...                                                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓ git push                             │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    GitHub Actions 自动构建                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 1. pnpm docs:build                                           │   │
│  │    ↓                                                         │   │
│  │ 2. createRewrites() 扫描所有 .md 文件                        │   │
│  │    ↓                                                         │   │
│  │ 3. 生成 rewrites 映射表                                      │   │
│  │    "01.指南/01.简介/intro.md" → "guide/intro.html"           │   │
│  │    ↓                                                         │   │
│  │ 4. 输出到 dist/ 目录                                         │   │
│  │    dist/                                                     │   │
│  │      ├── guide/intro.html   ←── 重写后的路径                 │   │
│  │      ├── reference/config.html                               │   │
│  │      └── ...                                                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓ 自动部署                             │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    GitHub Pages 静态托管                             │
│            https://chuyanzhio.github.io/guide/intro                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 核心机制：createRewrites

配置文件 `docs/.vitepress/config.ts` 中：
```ts
rewrites: createRewrites({ srcDir: "docs" }),
```

**工作原理**：
1. 扫描 `docs/` 下所有 `.md` 文件
2. 读取每个文件的 frontmatter 中的 `permalink` 字段
3. 生成 VitePress 的 `rewrites` 配置映射

**示例映射**：

| 源文件路径 | frontmatter 中的 permalink | 构建后 HTML 路径 |
|-----------|---------------------------|-----------------|
| `01.指南/01.简介/intro.md` | `/guide/intro` | `guide/intro.html` |
| `10.配置/01.配置简介/config.md` | `/reference/config` | `reference/config.html` |

### 如何添加新页面？

**步骤**：

1. **创建 `.md` 文件**，设置 `permalink`：
   ```markdown
   ---
   permalink: /new/page
   ---
   # 新页面内容
   ```

2. **添加导航链接**：在 `config.ts` 的 `nav` 数组中添加：
   ```ts
   nav: [
     { text: "新导航", link: "/new/page" },
   ]
   ```

3. **提交推送**：
   ```bash
   git add .
   git commit -m "添加新页面"
   git push
   ```

GitHub Actions 会自动完成构建和部署，无需手动操作。

### 常见问题

| 问题 | 答案 |
|------|------|
| 需要本地构建吗？ | 不需要，GitHub Actions 自动构建 |
| 需要推送 HTML 吗？ | 不需要，只推送源码（`.md` 文件） |
| 添加导航需要修改工作流吗？ | 不需要，只修改 `config.ts` 和创建 `.md` 文件 |

---

# 日志
- 2026年2月22日 实现在本地运行然后推送到GitHub Pages上使用与本地功能一样，使用GitHub Actions自动化
- 理解永久链接，特别是在这个项目中如何实现的，
