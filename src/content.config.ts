import { defineCollection, z } from 'astro:content'
import { notionBlogLoader, notionAyudaLoader } from './loaders/notion'

const posts = defineCollection({
  loader: notionBlogLoader(),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    excerpt: z.string().optional(),
    featureImage: z.string().optional(),
    publishedAt: z.coerce.date(),
    readingTime: z.number().default(5),
    tag: z.object({ name: z.string(), slug: z.string() }).optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    author: z.string().optional(),
    featured: z.boolean().default(false),
    html: z.string(),
  }),
})

const ayuda = defineCollection({
  loader: notionAyudaLoader(),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    category: z.string(),
    categoryName: z.string(),
    metaDescription: z.string().optional(),
    html: z.string(),
  }),
})

export const collections = { posts, ayuda }
