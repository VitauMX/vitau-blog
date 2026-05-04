# Vitau Blog

Static site for vitau.mx/blog and vitau.mx/ayuda, built with Astro and deployed to AWS S3 + CloudFront.

## Architecture

### Infrastructure

```
vitau.mx (Next.js)  ─── CloudFront ─┬─ / → Next.js origin (separate project)
                                     ├─ /blog/* → S3 (this project)
                                     └─ /ayuda/* → S3 (this project)
```

- **CloudFront** serves vitau.mx with path-based routing
- `/blog` and `/ayuda` subpaths point to an S3 bucket containing this project's static build output
- The main vitau.mx site is a separate Next.js project

### Content Source

Content lives in **Notion** databases and is fetched at build time via custom Astro content loaders (`src/loaders/notion.ts`):

- `NOTION_BLOG_DB_ID` → blog posts
- `NOTION_AYUDA_DB_ID` → help/support articles
- `NOTION_TOKEN` → Notion integration token

Posts with `Status = "Listo"` are considered published.

### Build Output

Astro generates fully static HTML (`output: 'static'`). Assets go to `blog/_astro/`. Images from Notion are downloaded to `public/blog/images/` at build time.

## Tech Stack

- **Framework:** Astro 5 (static output)
- **Styling:** Tailwind CSS 4 (via @tailwindcss/vite)
- **Content:** Notion API (@notionhq/client)
- **Language:** TypeScript
- **Hosting:** AWS S3 + CloudFront

## Project Structure

```
src/
├── pages/
│   ├── blog/
│   │   ├── index.astro          # /blog — post feed
│   │   ├── [slug].astro         # /blog/:slug — individual post
│   │   ├── [category].astro     # /blog/:category — posts by tag
│   │   └── categorias.astro     # /blog/categorias — all categories
│   ├── ayuda/
│   │   ├── index.astro          # /ayuda — help center home
│   │   └── [slug].astro         # /ayuda/:slug — help article
│   └── 404.astro                # 404 page
├── components/                   # Astro components (Layout, Header, Footer, etc.)
├── loaders/
│   └── notion.ts                # Custom Astro content loaders for Notion
├── lib/
│   ├── content.ts               # Blog post helpers (getAllPosts, getTags, etc.)
│   └── ayuda.ts                 # Ayuda article helpers
├── content.config.ts            # Astro content collections (posts, ayuda)
└── styles/                      # Global styles and tokens
scripts/
├── ghost-to-notion.ts           # Migration script (Ghost → Notion)
└── ayuda-to-notion.ts           # Migration script (ayuda content → Notion)
```

## Key Conventions

- All routes are prefixed with `/blog` or `/ayuda` (CloudFront subpath routing)
- Canonical URLs use `https://vitau.mx/blog/...` or `https://vitau.mx/ayuda/...`
- Content is in Spanish (es-MX locale for dates, labels, etc.)
- Blog posts include structured data (JSON-LD) for Article and BreadcrumbList schemas
- Blog posts include a COFEPRIS medical disclaimer at the bottom
- Posts are filtered by Notion `Status = "Listo"` to be published

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `NOTION_TOKEN` | Notion integration API token |
| `NOTION_BLOG_DB_ID` | Notion database ID for blog posts |
| `NOTION_AYUDA_DB_ID` | Notion database ID for help articles |

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Build static site
npm run preview   # Preview production build locally
npm run check     # Type-check Astro files
```
