import { getCollection, getEntry, type CollectionEntry } from 'astro:content'

export type Post = CollectionEntry<'posts'>

export type Tag = {
  id: string
  name: string
  slug: string
  postCount: number
}

/** All posts sorted newest first */
export async function getAllPosts(): Promise<Post[]> {
  const posts = await getCollection('posts')
  return posts.sort(
    (a, b) =>
      new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime(),
  )
}

/** Single post by slug */
export async function getPost(slug: string): Promise<Post | undefined> {
  return getEntry('posts', slug)
}

/** Tags derived from published posts */
export async function getAllTags(): Promise<Tag[]> {
  const posts = await getAllPosts()
  const map = new Map<string, Tag>()
  for (const post of posts) {
    if (post.data.tag) {
      const { name, slug } = post.data.tag
      const existing = map.get(slug)
      if (existing) {
        existing.postCount++
      } else {
        map.set(slug, { id: slug, name, slug, postCount: 1 })
      }
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

/** Posts filtered by tag slug */
export async function getPostsByTag(tagSlug: string): Promise<Post[]> {
  const posts = await getAllPosts()
  return posts.filter((p) => p.data.tag?.slug === tagSlug)
}

/** Slug for use in URLs */
export function getPostSlug(post: Post): string {
  return post.data.slug
}

/** Format a date in Spanish */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

/** Reading time label */
export function readingTimeLabel(minutes: number): string {
  return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
}
