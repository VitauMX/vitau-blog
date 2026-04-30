/**
 * One-time migration: Ghost export → Notion Blog Posts DB
 *
 * Usage:
 *   NOTION_TOKEN=secret_xxx NOTION_BLOG_DB_ID=xxx pnpm tsx scripts/ghost-to-notion.ts
 *
 * Idempotent: skips posts whose Slug already exists in Notion.
 * Rate-limited: 350ms between API requests.
 */

import { Client, isFullPage } from '@notionhq/client'
import { parse as parseHtml, type HTMLElement } from 'node-html-parser'
import { readFileSync } from 'fs'
import { join } from 'path'

// ─── Config ──────────────────────────────────────────────────────────────────

const GHOST_EXPORT = join(process.cwd(), 'vitau-blog.ghost.2026-04-29-20-09-38.json')
const TOKEN = process.env.NOTION_TOKEN
const DB_ID = process.env.NOTION_BLOG_DB_ID

if (!TOKEN || !DB_ID) {
  console.error('NOTION_TOKEN and NOTION_BLOG_DB_ID must be set')
  process.exit(1)
}

const notion = new Client({ auth: TOKEN })
const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

// ─── Tag consolidation (73 Ghost tags → ~10 canonical) ───────────────────────

const TAG_MAP: Record<string, string> = {
  // Dermatología
  'Piel': 'Dermatología',
  'Dermatología': 'Dermatología',
  // Pediatría
  'Lactancia': 'Pediatría',
  'Mamá': 'Pediatría',
  'Pediatría': 'Pediatría',
  'Niños': 'Pediatría',
  // Bienestar Mental
  'Mental Health': 'Bienestar Mental',
  'Psicologia': 'Bienestar Mental',
  'Mindfulness': 'Bienestar Mental',
  'Estrés': 'Bienestar Mental',
  'Relax': 'Bienestar Mental',
  'Respira': 'Bienestar Mental',
  'TDAH': 'Bienestar Mental',
  'Cerebro': 'Bienestar Mental',
  'Brain': 'Bienestar Mental',
  'Mind': 'Bienestar Mental',
  'Salud Mental': 'Bienestar Mental',
  // Diabetes
  'Diabetes': 'Diabetes',
  'Type 2 Diabetes': 'Diabetes',
  'DM': 'Diabetes',
  'Diabetes Mellitus': 'Diabetes',
  'Sindrome Metabolico': 'Diabetes',
  'Obesidad': 'Diabetes',
  'Sobrepeso': 'Diabetes',
  'Glucosa': 'Diabetes',
  'Glucose': 'Diabetes',
  'Azúcar': 'Diabetes',
  'Metabolismo': 'Diabetes',
  // Nutrición
  'Nutrición': 'Nutrición',
  'Alimentos': 'Nutrición',
  'Dieta': 'Nutrición',
  'Food': 'Nutrición',
  'Café': 'Nutrición',
  // Ejercicio
  'Caminar': 'Ejercicio',
  'Ejercicio': 'Ejercicio',
  'NuevoYo': 'Ejercicio',
  // Prevención
  'Prevención': 'Prevención',
  'Seguridad': 'Prevención',
  // Suplementos
  'Suplementos': 'Suplementos',
  // Cuidado Personal
  'Perros': 'Cuidado Personal',
  'Mascotas': 'Cuidado Personal',
  // Salud (catch-all)
  'Salud': 'Salud',
  'COVID-19': 'Salud',
  'covid': 'Salud',
  'Resfriado': 'Salud',
  'Invierno': 'Salud',
  'Flu': 'Salud',
  'Influenza': 'Salud',
  'Gripe': 'Salud',
  'Amor': 'Salud',
  'Corazón': 'Salud',
  'Sleep': 'Salud',
  'Sueño': 'Salud',
  'Dormir': 'Salud',
  'Medicina': 'Salud',
  'Apego': 'Salud',
  'Tratamiento': 'Salud',
  'Tiroides': 'Salud',
  'Parkinson': 'Salud',
  'Geriatría': 'Salud',
  'Neuro': 'Salud',
  'Enfermedades': 'Salud',
  'Datos': 'Salud',
  'Mujer': 'Salud',
  'Donación': 'Salud',
  'Dia Mundial de': 'Salud',
  'Cancer': 'Salud',
  'Breast Cancer': 'Salud',
  'Health Matters': 'Salud',
  'vaccine': 'Salud',
  'health': 'Salud',
  'Autoinmune': 'Salud',
  // Ignored
  'Getting Started': '',
}

// ─── HTML → Notion blocks ─────────────────────────────────────────────────────

type RichTextItem = {
  type: 'text'
  text: { content: string; link?: { url: string } }
  annotations?: { bold?: boolean; italic?: boolean; code?: boolean; strikethrough?: boolean }
}

function nodeToRichText(el: HTMLElement): RichTextItem[] {
  const items: RichTextItem[] = []

  for (const child of el.childNodes) {
    if (child.nodeType === 3) {
      // Text node
      const text = child.rawText
      if (text) items.push({ type: 'text', text: { content: text } })
      continue
    }

    if (child.nodeType !== 1) continue
    const node = child as HTMLElement
    const tag = node.tagName?.toLowerCase()

    if (tag === 'a') {
      const href = node.getAttribute('href') ?? ''
      const validHref = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('/')
        ? href.replace(/__GHOST_URL__/g, 'https://blog-admin.vitau.mx')
        : ''
      const innerItems = nodeToRichText(node)
      for (const item of innerItems) {
        items.push({
          ...item,
          text: { ...item.text, link: validHref ? { url: validHref } : undefined },
        })
      }
    } else if (tag === 'strong' || tag === 'b') {
      const innerItems = nodeToRichText(node)
      for (const item of innerItems) {
        items.push({ ...item, annotations: { ...(item.annotations ?? {}), bold: true } })
      }
    } else if (tag === 'em' || tag === 'i') {
      const innerItems = nodeToRichText(node)
      for (const item of innerItems) {
        items.push({ ...item, annotations: { ...(item.annotations ?? {}), italic: true } })
      }
    } else if (tag === 'code') {
      const text = node.text
      items.push({ type: 'text', text: { content: text }, annotations: { code: true } })
    } else if (tag === 's' || tag === 'del' || tag === 'strike') {
      const innerItems = nodeToRichText(node)
      for (const item of innerItems) {
        items.push({ ...item, annotations: { ...(item.annotations ?? {}), strikethrough: true } })
      }
    } else if (tag === 'br') {
      items.push({ type: 'text', text: { content: '\n' } })
    } else {
      items.push(...nodeToRichText(node))
    }
  }

  return items.filter(item => item.text.content.length > 0)
}

function truncateRichText(items: RichTextItem[], maxLen = 1990): RichTextItem[] {
  // Notion rich text has a 2000-char limit per block
  const result: RichTextItem[] = []
  let total = 0
  for (const item of items) {
    if (total >= maxLen) break
    const remaining = maxLen - total
    if (item.text.content.length <= remaining) {
      result.push(item)
      total += item.text.content.length
    } else {
      result.push({ ...item, text: { ...item.text, content: item.text.content.slice(0, remaining) } })
      break
    }
  }
  return result
}

type NotionBlock = Record<string, unknown>

function htmlToBlocks(html: string): NotionBlock[] {
  const root = parseHtml(html)
  const blocks: NotionBlock[] = []

  function processNode(node: HTMLElement) {
    const tag = node.tagName?.toLowerCase()

    if (!tag) {
      // Root or text node
      for (const child of node.childNodes) {
        if (child.nodeType === 1) processNode(child as HTMLElement)
      }
      return
    }

    switch (tag) {
      case 'p': {
        const rt = truncateRichText(nodeToRichText(node))
        if (rt.length > 0) {
          blocks.push({ object: 'block', type: 'paragraph', paragraph: { rich_text: rt } })
        }
        break
      }
      case 'h1':
      case 'h2': {
        const rt = truncateRichText(nodeToRichText(node))
        if (rt.length > 0) {
          blocks.push({ object: 'block', type: 'heading_2', heading_2: { rich_text: rt } })
        }
        break
      }
      case 'h3': {
        const rt = truncateRichText(nodeToRichText(node))
        if (rt.length > 0) {
          blocks.push({ object: 'block', type: 'heading_3', heading_3: { rich_text: rt } })
        }
        break
      }
      case 'ul': {
        for (const li of node.querySelectorAll('li')) {
          const rt = truncateRichText(nodeToRichText(li))
          if (rt.length > 0) {
            blocks.push({ object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: rt } })
          }
        }
        break
      }
      case 'ol': {
        for (const li of node.querySelectorAll('li')) {
          const rt = truncateRichText(nodeToRichText(li))
          if (rt.length > 0) {
            blocks.push({ object: 'block', type: 'numbered_list_item', numbered_list_item: { rich_text: rt } })
          }
        }
        break
      }
      case 'blockquote': {
        const rt = truncateRichText(nodeToRichText(node))
        if (rt.length > 0) {
          blocks.push({ object: 'block', type: 'quote', quote: { rich_text: rt } })
        }
        break
      }
      case 'hr': {
        blocks.push({ object: 'block', type: 'divider', divider: {} })
        break
      }
      case 'pre': {
        const codeNode = node.querySelector('code')
        const text = (codeNode ?? node).text.slice(0, 1990)
        const lang = codeNode?.getAttribute('class')?.replace('language-', '') ?? 'plain text'
        blocks.push({
          object: 'block',
          type: 'code',
          code: {
            rich_text: [{ type: 'text', text: { content: text } }],
            language: lang,
          },
        })
        break
      }
      case 'figure': {
        const img = node.querySelector('img')
        if (img) {
          const src = img.getAttribute('src') ?? img.getAttribute('data-src') ?? ''
          if (src) {
            blocks.push({
              object: 'block',
              type: 'image',
              image: { type: 'external', external: { url: src } },
            })
          }
        }
        break
      }
      case 'img': {
        const src = node.getAttribute('src') ?? ''
        if (src) {
          blocks.push({
            object: 'block',
            type: 'image',
            image: { type: 'external', external: { url: src } },
          })
        }
        break
      }
      default: {
        // For divs, sections, etc. — recurse into children
        for (const child of node.childNodes) {
          if (child.nodeType === 1) processNode(child as HTMLElement)
        }
        break
      }
    }
  }

  for (const child of root.childNodes) {
    if (child.nodeType === 1) processNode(child as HTMLElement)
  }

  return blocks
}

// ─── Notion page creation ─────────────────────────────────────────────────────

async function getExistingSlugs(): Promise<Set<string>> {
  const slugs = new Set<string>()
  let cursor: string | undefined
  do {
    await delay(350)
    const res = await notion.dataSources.query({
      data_source_id: DB_ID!,
      page_size: 100,
      start_cursor: cursor,
    })
    for (const page of res.results) {
      if (!isFullPage(page)) continue
      const slugProp = (page as any).properties['Slug']
      if (slugProp?.type === 'rich_text') {
        const slug = slugProp.rich_text.map((t: any) => t.plain_text).join('')
        if (slug) slugs.add(slug)
      }
    }
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined
  } while (cursor)
  return slugs
}

async function createPost(post: GhostPost, tags: string[]): Promise<void> {
  const html = (post.html ?? '').replace(/__GHOST_URL__/g, 'https://blog-admin.vitau.mx')
  const blocks = htmlToBlocks(html)

  const properties: Record<string, unknown> = {
    Name: { title: [{ type: 'text', text: { content: post.title } }] },
    Slug: { rich_text: [{ type: 'text', text: { content: post.slug } }] },
    Status: { status: { name: 'Listo' } },
    PublishedAt: { date: { start: post.published_at } },
    Tags: { multi_select: tags.map(name => ({ name })) },
  }

  if (post.custom_excerpt) {
    properties['Excerpt'] = {
      rich_text: [{ type: 'text', text: { content: post.custom_excerpt.slice(0, 200) } }],
    }
  }

  if (post.feature_image) {
    const featureImageUrl = post.feature_image.replace(/__GHOST_URL__/g, 'https://blog-admin.vitau.mx')
    properties['FeaturedImage'] = {
      files: [{ type: 'external', name: 'cover', external: { url: featureImageUrl } }],
    }
  }

  // Notion allows max 100 children per create; append the rest separately
  const firstBatch = blocks.slice(0, 100)

  await delay(350)
  const page = await notion.pages.create({
    parent: { type: 'data_source_id', data_source_id: DB_ID! } as any,
    properties: properties as any,
    children: firstBatch as any,
  })

  // Append remaining blocks in batches of 100
  const remaining = blocks.slice(100)
  for (let i = 0; i < remaining.length; i += 100) {
    await delay(350)
    await notion.blocks.children.append({
      block_id: page.id,
      children: remaining.slice(i, i + 100) as any,
    })
  }
}

// ─── Ghost types ──────────────────────────────────────────────────────────────

interface GhostPost {
  id: string
  title: string
  slug: string
  html: string
  feature_image: string | null
  custom_excerpt: string | null
  status: string
  published_at: string
  featured: boolean
}

interface GhostTag {
  id: string
  name: string
  slug: string
}

interface GhostPostTag {
  post_id: string
  tag_id: string
  sort_order: number
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Reading Ghost export...')
  const data = JSON.parse(readFileSync(GHOST_EXPORT, 'utf8'))
  const db = data.db[0].data

  const allPosts: GhostPost[] = db.posts.filter((p: GhostPost) => p.status === 'published')
  const allTags: GhostTag[] = db.tags
  const postsTags: GhostPostTag[] = db.posts_tags

  const tagById = new Map(allTags.map((t: GhostTag) => [t.id, t.name]))
  const tagsByPostId = new Map<string, string[]>()
  for (const pt of postsTags) {
    const tagName = tagById.get(pt.tag_id)
    if (!tagName) continue
    const canonical = TAG_MAP[tagName]
    if (!canonical) continue  // empty string = skip tag
    const existing = tagsByPostId.get(pt.post_id) ?? []
    if (!existing.includes(canonical)) existing.push(canonical)
    tagsByPostId.set(pt.post_id, existing)
  }

  console.log(`Found ${allPosts.length} published posts`)
  console.log('Fetching existing slugs from Notion...')
  const existingSlugs = await getExistingSlugs()
  console.log(`Notion already has ${existingSlugs.size} posts`)

  let created = 0
  let skipped = 0

  for (const post of allPosts) {
    if (existingSlugs.has(post.slug)) {
      skipped++
      continue
    }

    const tags = tagsByPostId.get(post.id) ?? ['Salud']
    process.stdout.write(`Creating: ${post.slug}... `)

    try {
      await createPost(post, tags)
      console.log('✓')
      created++
    } catch (err: any) {
      console.log(`✗ ${err.message}`)
      // Don't abort — keep going
    }
  }

  console.log(`\nDone. Created: ${created}, Skipped (already existed): ${skipped}`)
}

main().catch(console.error)
