import { post as activeLearningPost } from './active-learning-increases-retention'
import { post as memorizeFasterPost } from './how-to-memorize-faster'
import { post as focusWhileStudyingPost } from './how-to-focus-while-studying'
import { post as aiStudyToolsPost } from './ai-study-tools-2025'
import { post as spacedRepetitionPost } from './spaced-repetition-guide'
import { post as productivityHacksPost } from './study-productivity-hacks'
import { post as memoryPalacePost } from './memory-palace-guide'
import { post as studySchedulePost } from './study-schedule-template'

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
  studySchedulePost,
  memoryPalacePost,
  productivityHacksPost,
  spacedRepetitionPost,
  aiStudyToolsPost,
  focusWhileStudyingPost,
  memorizeFasterPost,
  activeLearningPost,
]

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug)
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
