# 仙途传说 - 开发环境配置指南

本文档指导你如何在新电脑上克隆项目并进行二次开发。

## 📋 前置要求

- **Node.js** >= 18.0.0（推荐 20.x，注意 v24 不兼容 VitePress）
- **Git**
- **代码编辑器**（推荐 VS Code）

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/ChuYanZhio/ChuYanZhio.github.io.git
cd ChuYanZhio.github.io
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
# 复制模板文件
cp .env.example .env
```

编辑 `.env` 文件，填入以下配置：

```env
# Supabase 配置
VITE_SUPABASE_URL=https://iosjehxxrfnhpxvpgflp.supabase.co
VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key
```

### 4. 启动开发服务器

```bash
npm run docs:dev
```

访问 http://localhost:5173 查看效果。

---

## 🔐 Supabase 配置获取

### 获取 URL 和 Anon Key

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目 `iosjehxxrfnhpxvpgflp`
3. 进入 **Settings** → **API**
4. 复制以下内容：
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

### 配置 URL 重定向（重要！）

部署到 GitHub Pages 后，需要配置重定向 URL：

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. 添加以下 URL：
   ```
   http://localhost:5173
   http://localhost:3000
   https://chuyanzhio.github.io
   ```

### 创建存储桶

项目使用 Supabase Storage 存储用户头像，需要创建 `avatars` 存储桶：

1. Supabase Dashboard → **Storage**
2. 创建名为 `avatars` 的存储桶
3. 设置为 **Public bucket**
4. 配置 RLS 策略允许用户上传自己的头像

或通过 SQL 执行：

```sql
-- 创建存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 允许所有人查看头像
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 允许用户上传自己的头像
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 允许用户更新自己的头像
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 允许用户删除自己的头像
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 📁 项目结构

```
docs/
├── .vitepress/
│   ├── config.ts              # VitePress 主配置
│   ├── teekConfig.ts          # Teek 主题配置
│   ├── lib/
│   │   ├── supabase.ts        # Supabase 客户端
│   │   ├── useAuth.ts         # 认证状态管理
│   │   └── api/
│   │       ├── profile.ts     # 用户资料 API
│   │       └── storage.ts     # 存储上传 API
│   └── theme/
│       ├── index.ts           # 主题入口
│       ├── components/
│       │   ├── NavUser.vue         # 导航栏用户组件
│       │   ├── AuthPage.vue        # 登录/注册页面
│       │   ├── UserSettings.vue    # 用户设置页面
│       │   └── SupabaseComments.vue # 评论区组件
│       └── styles/
├── @home/                     # 首页模板集合
│   ├── game-home-v2.md        # 修仙游戏首页 v2
│   └── teek-original.md       # 原始 Teek 首页
├── index.md                   # 当前首页
├── guide/                     # 游戏指南
│   └── intro.md
└── @pages/
    └── loginPage.md           # 登录页面配置
```

---

## 🎨 首页切换

项目支持多种首页风格，切换方法：

### 方法一：直接替换内容

将 `docs/@home/` 目录下的文件内容复制到 `docs/index.md`：

| 首页风格 | 源文件 | 说明 |
|---------|--------|------|
| 修仙游戏 | `@home/game-home-v2.md` | 仙侠风格，当前使用 |
| Teek 主题 | `@home/teek-original.md` | 原始主题首页 |

### 方法二：使用符号链接（高级）

```bash
# 切换到修仙游戏首页
cd docs
rm index.md
ln -s @home/game-home-v2.md index.md
```

---

## 🗄️ 数据库结构

### profiles 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 用户ID（关联 auth.users） |
| username | text | 用户名 |
| avatar_url | text | 头像URL |
| bio | text | 个人简介 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

### comments 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 评论ID |
| user_id | uuid | 用户ID |
| content | text | 评论内容 |
| page_path | text | 页面路径 |
| created_at | timestamp | 创建时间 |

---

## 🔧 常用命令

```bash
# 开发模式
npm run docs:dev

# 构建生产版本
npm run docs:build

# 预览构建结果
npm run docs:preview
```

---

## 🚢 部署流程

项目使用 GitHub Actions 自动部署到 GitHub Pages：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动触发构建
3. 构建成功后自动部署

### GitHub Secrets 配置

在仓库 **Settings** → **Secrets and variables** → **Actions** 中配置：

| Secret 名称 | 说明 |
|------------|------|
| `VITE_SUPABASE_URL` | Supabase 项目 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon Key |

---

## ⚠️ 注意事项

1. **不要提交 `.env` 文件** - 已在 `.gitignore` 中排除
2. **本地开发时** - 确保环境变量正确配置
3. **首次部署** - 需要在 GitHub 仓库设置中配置 Secrets
4. **域名更换** - 需要更新 Supabase URL Configuration
5. **Node.js 版本** - 不要使用 v24，推荐使用 v20

---

## 🐛 常见问题

### Q: 本地无法连接 Supabase？

检查 `.env` 文件是否正确配置，确保 URL 和 Key 没有多余空格。

### Q: 登录后跳转失败？

在 Supabase Dashboard 的 Authentication → URL Configuration 中添加本地开发地址：
- `http://localhost:5173`
- `http://localhost:3000`

### Q: LockManager 超时错误？

已在 `supabase.ts` 中配置 `lock: false`，如仍有问题，清除浏览器缓存重试。

### Q: 部署后功能异常？

1. 检查 GitHub Secrets 是否配置正确
2. 检查 Supabase URL Configuration 是否包含生产域名
3. 查看浏览器控制台是否有错误信息

### Q: 头像上传失败？

确保已创建 `avatars` 存储桶并配置了正确的 RLS 策略。

### Q: 构建时报错 "Cannot read properties of undefined"?

检查 Node.js 版本，v24 不兼容 VitePress，请使用 v20。

---

## 📞 联系方式

如有问题，请在 GitHub 仓库提交 Issue。
