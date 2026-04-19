export type Profile = {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  is_admin: boolean
  is_banned: boolean
  created_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string
  post_count: number
  created_at: string
}

export type Post = {
  id: string
  title: string
  content: string | null
  user_id: string
  category_id: string
  upvotes: number
  comment_count: number
  is_deleted: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
  categories?: Category
  user_vote?: number | null
}

export type Comment = {
  id: string
  content: string
  user_id: string
  post_id: string
  parent_id: string | null
  upvotes: number
  is_deleted: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
  replies?: Comment[]
  user_vote?: number | null
}

export type PostVote = {
  id: string
  user_id: string
  post_id: string
  vote_type: 1 | -1
  created_at: string
}
