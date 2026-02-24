// 数据库表类型定义

export interface Profile {
  id: string
  username: string | null
  nickname: string | null
  avatar_url: string | null
  bio: string | null
  website: string | null
  social_links: Record<string, string>
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  cover_image: string | null
  category: string | null
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  view_count: number
  like_count: number
  comment_count: number
  published_at: string | null
  created_at: string
  updated_at: string
  // 关联数据
  author?: Profile
}

export interface Comment {
  id: string
  post_id: string
  user_id: string | null
  parent_id: string | null
  content: string
  like_count: number
  is_hidden: boolean
  created_at: string
  updated_at: string
  // 关联数据
  author?: Profile
  replies?: Comment[]
}

export interface SiteConfig {
  id: string
  key: string
  value: Record<string, any>
  description: string | null
  created_at: string
  updated_at: string
}

// 创建/更新类型
export type ProfileInsert = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
export type PostInsert = Partial<Omit<Post, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'comment_count'>>
export type CommentInsert = Partial<Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'like_count' | 'is_hidden'>>
export type SiteConfigInsert = Partial<Omit<SiteConfig, 'id' | 'created_at' | 'updated_at'>>
