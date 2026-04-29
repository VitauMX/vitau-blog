/**
 * One-time migration: ayuda markdown files → Notion Ayuda DB
 *
 * Usage:
 *   NOTION_TOKEN=secret_xxx NOTION_AYUDA_DB_ID=xxx pnpm tsx scripts/ayuda-to-notion.ts
 *
 * Idempotent: skips articles whose Slug already exists in Notion.
 */

import { Client, isFullPage } from '@notionhq/client'
import { parse as parseHtml } from 'node-html-parser'
import { marked } from 'marked'
import matter from 'gray-matter'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

const AYUDA_DIR = join(process.cwd(), 'src/content/ayuda')
const TOKEN = process.env.NOTION_TOKEN
const DB_ID = process.env.NOTION_AYUDA_DB_ID

if (!TOKEN || !DB_ID) {
  console.error('NOTION_TOKEN and NOTION_AYUDA_DB_ID must be set')
  process.exit(1)
}

const notion = new Client({ auth: TOKEN })
const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

// ─── Rich text helpers ────────────────────────────────────────────────────────

type RichTextItem = {
  type: 'text'
  text: { content: string; link?: { url: string } }
  annotations?: { bold?: boolean; italic?: boolean; code?: boolean }
}

function nodeToRichText(el: any): RichTextItem[] {
  const items: RichTextItem[] = []
  for (const child of el.childNodes) {
    if (child.nodeType === 3) {
      const text = child.rawText
      if (text) items.push({ type: 'text', text: { content: text } })
      continue
    }
    if (child.nodeType !== 1) continue
    const tag = child.tagName?.toLowerCase()
    if (tag === 'a') {
      const href = child.getAttribute('href') ?? ''
      const validHref = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('/')
        ? href : ''
      const inner = nodeToRichText(child)
      for (const item of inner) {
        items.push({ ...item, text: { ...item.text, link: validHref ? { url: validHref } : undefined } })
      }
    } else if (tag === 'strong' || tag === 'b') {
      for (const item of nodeToRichText(child)) {
        items.push({ ...item, annotations: { ...(item.annotations ?? {}), bold: true } })
      }
    } else if (tag === 'em' || tag === 'i') {
      for (const item of nodeToRichText(child)) {
        items.push({ ...item, annotations: { ...(item.annotations ?? {}), italic: true } })
      }
    } else if (tag === 'code') {
      items.push({ type: 'text', text: { content: child.text }, annotations: { code: true } })
    } else {
      items.push(...nodeToRichText(child))
    }
  }
  return items.filter(i => i.text.content.length > 0)
}

function truncate(items: RichTextItem[], max = 1990): RichTextItem[] {
  const result: RichTextItem[] = []
  let total = 0
  for (const item of items) {
    if (total >= max) break
    const rem = max - total
    if (item.text.content.length <= rem) { result.push(item); total += item.text.content.length }
    else { result.push({ ...item, text: { ...item.text, content: item.text.content.slice(0, rem) } }); break }
  }
  return result
}

// ─── HTML → Notion blocks ─────────────────────────────────────────────────────

type NotionBlock = Record<string, unknown>

function htmlToBlocks(html: string): NotionBlock[] {
  const root = parseHtml(html)
  const blocks: NotionBlock[] = []

  function process(node: any) {
    const tag = node.tagName?.toLowerCase()
    if (!tag) { for (const c of node.childNodes) { if (c.nodeType === 1) process(c) }; return }

    switch (tag) {
      case 'p': {
        const rt = truncate(nodeToRichText(node))
        if (rt.length) blocks.push({ object: 'block', type: 'paragraph', paragraph: { rich_text: rt } })
        break
      }
      case 'h1': case 'h2': {
        const rt = truncate(nodeToRichText(node))
        if (rt.length) blocks.push({ object: 'block', type: 'heading_2', heading_2: { rich_text: rt } })
        break
      }
      case 'h3': {
        const rt = truncate(nodeToRichText(node))
        if (rt.length) blocks.push({ object: 'block', type: 'heading_3', heading_3: { rich_text: rt } })
        break
      }
      case 'ul': {
        for (const li of node.querySelectorAll('li')) {
          const rt = truncate(nodeToRichText(li))
          if (rt.length) blocks.push({ object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: rt } })
        }
        break
      }
      case 'ol': {
        for (const li of node.querySelectorAll('li')) {
          const rt = truncate(nodeToRichText(li))
          if (rt.length) blocks.push({ object: 'block', type: 'numbered_list_item', numbered_list_item: { rich_text: rt } })
        }
        break
      }
      case 'blockquote': {
        const rt = truncate(nodeToRichText(node))
        if (rt.length) blocks.push({ object: 'block', type: 'quote', quote: { rich_text: rt } })
        break
      }
      case 'hr':
        blocks.push({ object: 'block', type: 'divider', divider: {} })
        break
      default:
        for (const c of node.childNodes) { if (c.nodeType === 1) process(c) }
    }
  }

  for (const c of root.childNodes) { if (c.nodeType === 1) process(c) }
  return blocks
}

// ─── Existing slugs ───────────────────────────────────────────────────────────

async function getExistingSlugs(): Promise<Set<string>> {
  const slugs = new Set<string>()
  let cursor: string | undefined
  do {
    await delay(350)
    const res = await notion.dataSources.query({ data_source_id: DB_ID!, page_size: 100, start_cursor: cursor })
    for (const page of res.results) {
      if (!isFullPage(page)) continue
      const p = (page as any).properties['Slug']
      if (p?.type === 'rich_text') {
        const slug = p.rich_text.map((t: any) => t.plain_text).join('')
        if (slug) slugs.add(slug)
      }
    }
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined
  } while (cursor)
  return slugs
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const files = readdirSync(AYUDA_DIR).filter(f => f.endsWith('.md'))
  console.log(`Found ${files.length} markdown files`)

  console.log('Fetching existing slugs from Notion...')
  const existing = await getExistingSlugs()
  console.log(`Notion already has ${existing.size} articles`)

  let created = 0
  let skipped = 0

  for (const file of files) {
    const raw = readFileSync(join(AYUDA_DIR, file), 'utf8')
    const { data, content } = matter(raw)
    const slug = file.replace(/\.md$/, '')

    if (existing.has(slug)) { skipped++; continue }

    const html = await marked(content)
    const blocks = htmlToBlocks(html)

    process.stdout.write(`Creating: ${slug}... `)

    try {
      await delay(350)
      const page = await notion.pages.create({
        parent: { type: 'data_source_id', data_source_id: DB_ID! } as any,
        properties: {
          Name: { title: [{ type: 'text', text: { content: data.title } }] },
          Slug: { rich_text: [{ type: 'text', text: { content: slug } }] },
          Category: { select: { name: data.category } },
          CategoryName: { rich_text: [{ type: 'text', text: { content: data.categoryName } }] },
          Status: { status: { name: 'Listo' } },
        } as any,
        children: blocks.slice(0, 100) as any,
      })

      for (let i = 100; i < blocks.length; i += 100) {
        await delay(350)
        await notion.blocks.children.append({ block_id: page.id, children: blocks.slice(i, i + 100) as any })
      }

      console.log('✓')
      created++
    } catch (err: any) {
      console.log(`✗ ${err.message}`)
    }
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`)
}

main().catch(console.error)
