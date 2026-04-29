import { defineCollection, z } from 'astro:content'

const tagSchema = z.object({
  name: z.string(),
  slug: z.string(),
  featureImage: z.string().optional(),
  postCount: z.number().default(0),
})

const postSchema = z.object({
  title: z.string(),
  excerpt: z.string().optional(),
  featureImage: z.string().optional(),
  publishedAt: z.coerce.date(),
  readingTime: z.number().default(1),
  tag: z
    .object({
      name: z.string(),
      slug: z.string(),
    })
    .optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

export type PostFrontmatter = z.infer<typeof postSchema>
export type TagFrontmatter = z.infer<typeof tagSchema>

const ayudaSchema = z.object({
  title: z.string(),
  category: z.string(),
  categoryName: z.string(),
})

export const collections = {
  posts: defineCollection({
    type: 'content',
    schema: postSchema,
  }),
  tags: defineCollection({
    type: 'data',
    schema: tagSchema,
  }),
  ayuda: defineCollection({
    type: 'content',
    schema: ayudaSchema,
  }),
}
