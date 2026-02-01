import { post as activeLearningPost } from './active-learning-increases-retention'
import { post as memorizeFasterPost } from './how-to-memorize-faster'
import { post as focusWhileStudyingPost } from './how-to-focus-while-studying'
import { post as aiStudyToolsPost } from './ai-study-tools-2025'
import { post as spacedRepetitionPost } from './spaced-repetition-guide'
import { post as productivityHacksPost } from './study-productivity-hacks'
import { post as memoryPalacePost } from './memory-palace-guide'
import { post as studySchedulePost } from './study-schedule-template'
import { post as thoughtmapVsChatgptPost } from './thoughtmap-vs-chatgpt-for-learning'
import { post as thoughtmapVsQuizletPost } from './thoughtmap-vs-quizlet'
import { post as thoughtmapVsKhanAcademyPost } from './thoughtmap-vs-khan-academy'

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
  thoughtmapVsChatgptPost,
  thoughtmapVsQuizletPost,
  thoughtmapVsKhanAcademyPost,
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

// Get related posts based on category, excluding the current post
export function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPost[] {
  const currentPost = getBlogPostBySlug(currentSlug)
  if (!currentPost) return []

  const sameCategoryPosts = blogPosts
    .filter(post => post.slug !== currentSlug && post.category === currentPost.category)
    .slice(0, limit)

  // If not enough posts in the same category, add posts from other categories
  if (sameCategoryPosts.length < limit) {
    const otherPosts = blogPosts
      .filter(post => post.slug !== currentSlug && post.category !== currentPost.category)
      .slice(0, limit - sameCategoryPosts.length)
    return [...sameCategoryPosts, ...otherPosts]
  }

  return sameCategoryPosts
}
