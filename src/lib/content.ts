import { getCollection, getEntry, type CollectionEntry } from 'astro:content'

export type Post = CollectionEntry<'posts'>
export type Tag = CollectionEntry<'tags'>

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

/** All tags */
export async function getAllTags(): Promise<Tag[]> {
  const tags = await getCollection('tags')
  return tags.sort((a, b) => a.data.name.localeCompare(b.data.name, 'es'))
}

/** Posts filtered by tag slug */
export async function getPostsByTag(tagSlug: string): Promise<Post[]> {
  const posts = await getAllPosts()
  return posts.filter((p) => p.data.tag?.slug === tagSlug)
}

/** Slug without file extension, safe for use in URLs */
export function getPostSlug(post: Post): string {
  return post.id.replace(/\.(md|mdx)$/, '')
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
