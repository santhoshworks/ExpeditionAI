import { post as activeLearningPost } from './active-learning-increases-retention'

export interface BlogPost {
  title: string
  meta_description: string
  slug: string
  author: string
  date: string
  category: string
  featured_image: string
  keywords: string[]
  content: string
}

export const blogPosts: BlogPost[] = [
  activeLearningPost,
]

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug)
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
