import type { Loader } from 'astro/loaders'
import { Client, isFullBlock, isFullPage } from '@notionhq/client'
import { createHash } from 'crypto'
import { mkdirSync, existsSync, writeFileSync } from 'fs'
import { join, extname } from 'path'

type AnyBlock = { type: string; has_children?: boolean; id: string; [key: string]: unknown }
type AnyPage = { id: string; last_edited_time: string; properties: Record<string, unknown> }

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

// ─── HTML helpers ─────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function rtToHtml(rt: unknown[]): string {
  return rt.map((item: any) => {
    let t = esc(decodeHtmlEntities(item.plain_text ?? ''))
    const a = item.annotations ?? {}
    if (a.code) t = `<code>${t}</code>`
    if (a.bold) t = `<strong>${t}</strong>`
    if (a.italic) t = `<em>${t}</em>`
    if (a.strikethrough) t = `<s>${t}</s>`
    if (item.href) t = `<a href="${esc(item.href)}">${t}</a>`
    return t
  }).join('')
}

// ─── Image download ───────────────────────────────────────────────────────────

async function downloadImage(url: string, dir: string): Promise<string> {
  const stableKey = url.split('?')[0]
  const hash = createHash('sha256').update(stableKey).digest('hex').slice(0, 16)
  const ext = extname(new URL(stableKey).pathname) || '.jpg'
  const filename = `${hash}${ext}`
  const dest = join(dir, filename)

  if (!existsSync(dest)) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Image download failed: ${url} (${res.status})`)
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
  }

  return `/blog/images/${filename}`
}

function isNotionHostedImage(url: string): boolean {
  return url.includes('prod-files-secure') || url.includes('secure.notion-static')
}

// ─── Block fetching ───────────────────────────────────────────────────────────

async function fetchBlocks(notion: Client, blockId: string): Promise<AnyBlock[]> {
  const blocks: AnyBlock[] = []
  let cursor: string | undefined
  do {
    await delay(350)
    const res = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    })
    for (const b of res.results) {
      if (isFullBlock(b)) blocks.push(b as unknown as AnyBlock)
    }
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined
  } while (cursor)
  return blocks
}

// ─── Blocks → HTML ────────────────────────────────────────────────────────────

async function blocksToHtml(blocks: AnyBlock[], imgDir: string): Promise<string> {
  const parts: string[] = []
  let i = 0

  while (i < blocks.length) {
    const b = blocks[i]

    if (b.type === 'bulleted_list_item' || b.type === 'numbered_list_item') {
      const tag = b.type === 'bulleted_list_item' ? 'ul' : 'ol'
      const items: string[] = []
      while (i < blocks.length && blocks[i].type === b.type) {
        const bi = blocks[i] as any
        const richText = bi.type === 'bulleted_list_item'
          ? bi.bulleted_list_item?.rich_text ?? []
          : bi.numbered_list_item?.rich_text ?? []
        items.push(`<li>${rtToHtml(richText)}</li>`)
        i++
      }
      parts.push(`<${tag}>${items.join('')}</${tag}>`)
      continue
    }

    switch (b.type) {
      case 'paragraph': {
        const html = rtToHtml((b as any).paragraph?.rich_text ?? [])
        if (html) parts.push(`<p>${html}</p>`)
        break
      }
      case 'heading_1':
      case 'heading_2':
        parts.push(`<h2>${rtToHtml((b as any)[b.type]?.rich_text ?? [])}</h2>`)
        break
      case 'heading_3':
        parts.push(`<h3>${rtToHtml((b as any).heading_3?.rich_text ?? [])}</h3>`)
        break
      case 'quote':
        parts.push(`<blockquote><p>${rtToHtml((b as any).quote?.rich_text ?? [])}</p></blockquote>`)
        break
      case 'code': {
        const code = (b as any).code
        const lang = code?.language ?? 'text'
        parts.push(`<pre><code class="language-${esc(lang)}">${rtToHtml(code?.rich_text ?? [])}</code></pre>`)
        break
      }
      case 'callout':
        parts.push(`<aside class="callout"><p>${rtToHtml((b as any).callout?.rich_text ?? [])}</p></aside>`)
        break
      case 'divider':
        parts.push('<hr>')
        break
      case 'image': {
        const img = (b as any).image
        let src: string = img?.type === 'external' ? img.external?.url : img?.file?.url
        if (!src) break
        if (img.type === 'file' && isNotionHostedImage(src)) {
          try { src = await downloadImage(src, imgDir) } catch { /* keep original */ }
        }
        const caption = (img.caption ?? []).length
          ? `<figcaption>${rtToHtml(img.caption)}</figcaption>`
          : ''
        parts.push(`<figure><img src="${esc(src)}" loading="lazy">${caption}</figure>`)
        break
      }
      case 'video': {
        const vid = (b as any).video
        const url: string = vid?.type === 'external' ? vid.external?.url : vid?.file?.url
        if (!url) break
        const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
        if (ytMatch) {
          parts.push(`<figure class="video-embed"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}" frameborder="0" allowfullscreen loading="lazy"></iframe></figure>`)
        } else {
          parts.push(`<p><a href="${esc(url)}">${esc(url)}</a></p>`)
        }
        break
      }
      case 'bookmark': {
        const url = (b as any).bookmark?.url as string | undefined
        if (url) parts.push(`<p><a href="${esc(url)}">${esc(url)}</a></p>`)
        break
      }
    }
    i++
  }

  return parts.join('\n')
}

// ─── Property helpers ─────────────────────────────────────────────────────────

function propTitle(page: AnyPage): string {
  for (const p of Object.values(page.properties) as any[]) {
    if (p?.type === 'title') return (p.title ?? []).map((t: any) => t.plain_text).join('')
  }
  return ''
}

function propText(page: AnyPage, name: string): string {
  const p = (page.properties[name] as any)
  if (p?.type === 'rich_text') return (p.rich_text ?? []).map((t: any) => t.plain_text).join('')
  return ''
}

function propDate(page: AnyPage, name: string): Date | undefined {
  const p = (page.properties[name] as any)
  if (p?.type === 'date' && p.date?.start) return new Date(p.date.start)
  return undefined
}

function propNumber(page: AnyPage, name: string): number | undefined {
  const p = (page.properties[name] as any)
  if (p?.type === 'number') return p.number ?? undefined
  return undefined
}

function propCheckbox(page: AnyPage, name: string): boolean {
  const p = (page.properties[name] as any)
  return p?.type === 'checkbox' ? Boolean(p.checkbox) : false
}

function propMultiSelect(page: AnyPage, name: string): string[] {
  const p = (page.properties[name] as any)
  return p?.type === 'multi_select' ? (p.multi_select ?? []).map((s: any) => s.name as string) : []
}

function propSelect(page: AnyPage, name: string): string {
  const p = (page.properties[name] as any)
  if (p?.type === 'select' && p.select?.name) return p.select.name as string
  return ''
}

function propFile(page: AnyPage, name: string): string | undefined {
  const p = (page.properties[name] as any)
  if (p?.type !== 'files' || !p.files?.length) return undefined
  const f = p.files[0]
  if (f.type === 'file') return f.file?.url
  if (f.type === 'external') return f.external?.url
  return undefined
}

// ─── Shared: query all published pages ───────────────────────────────────────

async function queryPublished(notion: Client, dbId: string): Promise<AnyPage[]> {
  const pages: AnyPage[] = []
  let cursor: string | undefined
  do {
    await delay(350)
    const res = await notion.dataSources.query({
      data_source_id: dbId,
      filter: { property: 'Status', status: { equals: 'Listo' } },
      start_cursor: cursor,
      page_size: 100,
    })
    for (const p of res.results) {
      if (isFullPage(p)) pages.push(p as unknown as AnyPage)
    }
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined
  } while (cursor)
  return pages
}

// ─── Blog posts loader ────────────────────────────────────────────────────────

export function notionBlogLoader(): Loader {
  return {
    name: 'notion-blog',
    load: async ({ store, logger, generateDigest }) => {
      const token = process.env.NOTION_TOKEN
      const dbId = process.env.NOTION_BLOG_DB_ID
      if (!token || !dbId) {
        logger.warn('NOTION_TOKEN or NOTION_BLOG_DB_ID not set — blog collection empty')
        return
      }

      const notion = new Client({ auth: token })
      const imgDir = join(process.cwd(), 'public/blog/images')
      mkdirSync(imgDir, { recursive: true })

      const pages = await queryPublished(notion, dbId)
      logger.info(`Notion: ${pages.length} published posts`)

      const seen = new Set<string>()

      for (const page of pages) {
        const slug = propText(page, 'Slug')
        if (!slug) { logger.warn(`Post ${page.id}: no Slug, skipping`); continue }
        seen.add(slug)

        const digest = generateDigest(page.last_edited_time)
        if (store.get(slug)?.digest === digest) continue

        const blocks = await fetchBlocks(notion, page.id)
        const html = await blocksToHtml(blocks, imgDir)

        const tagNames = propMultiSelect(page, 'Tags')
        const tag = tagNames[0]
          ? {
              name: tagNames[0],
              slug: tagNames[0].toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
            }
          : undefined

        let featureImage = propFile(page, 'FeaturedImage')
        if (featureImage && isNotionHostedImage(featureImage)) {
          try { featureImage = await downloadImage(featureImage, imgDir) } catch { /* keep */ }
        }

        store.set({
          id: slug,
          data: {
            slug,
            title: propTitle(page),
            excerpt: propText(page, 'Excerpt') || undefined,
            featureImage,
            publishedAt: propDate(page, 'PublishedAt') ?? new Date(),
            readingTime: propNumber(page, 'ReadingTime') ?? 5,
            tag,
            metaTitle: propText(page, 'SEOTitle') || undefined,
            metaDescription: propText(page, 'SEODescription') || undefined,
            author: propText(page, 'Author') || undefined,
            featured: propCheckbox(page, 'Featured'),
            html,
          },
          digest,
        })
      }

      for (const key of store.keys()) {
        if (!seen.has(key)) store.delete(key)
      }
    },
  }
}

// ─── Ayuda loader ─────────────────────────────────────────────────────────────

export function notionAyudaLoader(): Loader {
  return {
    name: 'notion-ayuda',
    load: async ({ store, logger, generateDigest }) => {
      const token = process.env.NOTION_TOKEN
      const dbId = process.env.NOTION_AYUDA_DB_ID
      if (!token || !dbId) {
        logger.warn('NOTION_TOKEN or NOTION_AYUDA_DB_ID not set — ayuda collection empty')
        return
      }

      const notion = new Client({ auth: token })
      const imgDir = join(process.cwd(), 'public/blog/images')
      mkdirSync(imgDir, { recursive: true })

      const pages = await queryPublished(notion, dbId)
      logger.info(`Notion: ${pages.length} published ayuda articles`)

      const seen = new Set<string>()

      for (const page of pages) {
        const slug = propText(page, 'Slug')
        if (!slug) { logger.warn(`Ayuda ${page.id}: no Slug, skipping`); continue }
        seen.add(slug)

        const digest = generateDigest(page.last_edited_time)
        if (store.get(slug)?.digest === digest) continue

        const blocks = await fetchBlocks(notion, page.id)
        const html = await blocksToHtml(blocks, imgDir)

        store.set({
          id: slug,
          data: {
            slug,
            title: propTitle(page),
            category: propText(page, 'Category') || propSelect(page, 'Category'),
            categoryName: propText(page, 'CategoryName'),
            metaDescription: propText(page, 'SEODescription') || undefined,
            html,
          },
          digest,
        })
      }

      for (const key of store.keys()) {
        if (!seen.has(key)) store.delete(key)
      }
    },
  }
}
