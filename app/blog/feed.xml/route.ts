import { getAllBlogPosts } from '@/content/blog'
import { SITE_CONFIG } from '@/lib/config'

export async function GET() {
  const posts = getAllBlogPosts()
  const baseUrl = SITE_CONFIG.url

  // Escape XML special characters
  const escapeXml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  // Convert date string to RFC 822 format for RSS
  const toRfc822Date = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toUTCString()
  }

  const items = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <description>${escapeXml(post.meta_description)}</description>
      <pubDate>${toRfc822Date(post.date)}</pubDate>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <category>${escapeXml(post.category)}</category>
      <author>${escapeXml(post.author)}</author>
    </item>`
    )
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_CONFIG.name)} Blog</title>
    <description>${escapeXml(SITE_CONFIG.description)}</description>
    <link>${baseUrl}/blog</link>
    <atom:link href="${baseUrl}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Next.js</generator>${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
