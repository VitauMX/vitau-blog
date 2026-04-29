---
title: "feat: Migrate Gatsby blog to Astro 5 monorepo — phase 1 (blog migration)"
type: feat
status: active
date: 2026-04-27
---

# feat: Migrate Gatsby blog to Astro 5 monorepo — phase 1 (blog migration)

## Overview

Replace the current Gatsby 4 blog with an Astro 5 static site inside a `blog/` subdirectory of
this repo (preparing for a future `ayuda/` co-location). Content layer is CMS-agnostic — Astro
Content Collections with local Markdown files by default, with a thin adapter interface that can
be swapped for any headless CMS later. No sitemap generated here — it lives in the main
`vitau.mx` Next.js project. AWS/CloudFront deployment is deferred to phase 2.

## Problem Frame

- Gatsby 4 is effectively unmaintained — last meaningful release was 2023, no Gatsby 5 roadmap
- `gatsby-plugin-offline` serves the offline app shell to browser users, causing a blank screen
  until JS hydrates (bad LCP, bad UX)
- Blog is on a subdomain (`blog.vitau.mx`) instead of the main domain path — subpath placement
  passes domain authority to content, which benefits E-E-A-T recovery (see SEO context)
- No CI/CD pipeline exists — deploys go through the Netlify dashboard
- `ayuda.vitau.mx` is a separate hosted SPA with no relationship to this repo

## Requirements Trace

- R1. Blog generates true static HTML — every page has full content in the initial HTML payload
- R2. Blog configured for deployment at `/blog` base path
- R3. TypeScript throughout the Astro codebase
- R4. Tailwind CSS v4 replaces SCSS
- R5. Content layer is CMS-agnostic — abstracted behind a typed interface, default impl uses local Markdown
- R6. No sitemap generated in this project (owned by main vitau.mx Next.js site)
- R7. Repo structure supports future `ayuda/` co-location
- R8. Schema markup (Pharmacy + Person) added — resolves pending E-E-A-T gap

## Scope Boundaries

- Ghost CMS content, posts, and tags are NOT migrated — Ghost remains the source of truth
- The main `vitau.mx` Next.js app is NOT touched — it stays in its own repo
- DNS management (Route 53 or external) is NOT in scope — only CloudFront and S3
- `ayuda.vitau.mx` source code migration (copying it here) requires access to its current repo —
  Unit 6 assumes access is available

### Deferred to Separate Tasks

- Canonical tag / GSC property update for `vitau.mx/blog` after go-live: separate PR
- Sitemap submission to GSC for new URLs: post-deploy task
- Schema markup for PDPs (product pages) on the main Next.js site: separate repo work

## Context & Research

### Relevant Code and Patterns

- Current pages: `src/pages/index.js`, `src/pages/categorias.js`, `src/pages/404.js`
- Current templates: `src/templates/post/Post.js`, `src/templates/category/Category.js`
- Current components: Layout, Hero, MainHeader, Footer, PostFeed, PostPreview, CategoryPreview, SiteMeta, PostMeta
- Ghost data shape: posts have `title`, `html`, `slug`, `feature_image`, `published_at`, `reading_time`, `excerpt`, `meta_title`, `meta_description`, `primary_tag.{name,slug}`
- Ghost tags have `id`, `name`, `slug`, `feature_image`, `count.posts`
- Ghost API credentials: `GHOST_API_URL` + `GHOST_API_KEY` env vars (carry forward to Astro)

### Institutional Learnings

- SEO context: Google March 2026 Core Update hit Vitau hard. E-E-A-T gaps are the root cause.
  Schema markup (Pharmacy + Person) must be added during this migration, not deferred.
- Vitau has Responsable Sanitario: Jommors Olvera Muñoz, Ced. Prof. 6407754 — include in Person schema
- COFEPRIS license: 19039090963 — include in Pharmacy schema

### External References

- No official Astro Ghost loader exists; `ghostcms-loader` (community) archived Feb 2026
- Astro 5 sitemap + base path bug #13315: sitemap drops base from URLs — requires workaround
- Tailwind v4 with Astro 5: use `@tailwindcss/vite` Vite plugin, NOT `@astrojs/tailwind` (deprecated)
- CloudFront SPA routing: use a CloudFront Function on the `/ayuda/*` behavior only —
  distribution-level custom error responses are global and would break `/blog/*` 404s
- S3 + CloudFront: use OAC (Origin Access Control) + private bucket — static website hosting
  endpoint is not needed and exposes the bucket publicly
- Directory-style URIs (`/blog/`) need a CloudFront Function to append `index.html` —
  S3 REST endpoint (used with OAC) does not resolve index documents automatically

## Key Technical Decisions

- **Astro 5.x, output: 'static', base: '/blog'**: Static output generates a complete HTML file
  per route. `base` config ensures all internal links and asset URLs are prefixed correctly.
  `import.meta.env.BASE_URL` must be used for any manually constructed paths.

- **Custom Ghost Content Layer loader over `getStaticPaths()`**: The Astro 5 Content Layer loader
  runs once at build start and gives type-safe access via `getCollection()`. ~25-line wrapper
  around `@tryghost/content-api`. The build speed benefit is meaningful for 100+ posts.

- **Sitemap generated via custom Astro endpoint** (not `@astrojs/sitemap`): Avoids bug #13315
  where the plugin drops the `/blog` base from all URLs. A manual `src/pages/sitemap.xml.ts`
  endpoint with `getStaticPaths: false` and `export const prerender = true` generates correct URLs.

- **Single S3 bucket, two key prefixes**: `blog/` and `ayuda/` prefixes in one bucket. Simpler
  IAM, single lifecycle policy. CloudFront behaviors route to the same S3 origin with different
  `originPath` settings: `/blog` for the blog behavior, `/ayuda` for the ayuda behavior.

- **One CloudFront distribution, three behaviors**:
  1. `/blog/*` → S3 origin (OAC) + CloudFront Function for `index.html` append
  2. `/ayuda/*` → S3 origin (OAC) + CloudFront Function for SPA rewrite
  3. `/*` default → existing Next.js origin (unchanged)

- **CloudFront Function (not Lambda@Edge) for URI rewriting**: Functions are cheaper (free tier
  covers normal traffic), have sub-millisecond latency, and sufficient for simple URI rewrites.

- **GitHub Actions with path filters**: `on: push: paths: ['blog/**']` and `paths: ['ayuda/**']`
  ensure only the changed app triggers a build + deploy. Both workflows share an `aws-actions/configure-aws-credentials` step using OIDC (no long-lived AWS keys).

## Open Questions

### Resolved During Planning

- **Ghost loader vs getStaticPaths**: Custom Content Layer loader — R3 requires TypeScript and
  the loader gives full type safety without extra effort.
- **Tailwind v3 vs v4**: v4 — no migration overhead since we're starting fresh.
- **Single bucket vs separate buckets**: Single bucket with prefix isolation — simpler ops.
- **SPA routing scope**: CloudFront Function scoped to `/ayuda/*` behavior, not error responses.

### Deferred to Implementation

- **ayuda source repo location**: Unit 6 assumes the source repo is accessible. If not, Unit 6
  is limited to scaffolding the directory structure and Vite config only.
- **CloudFront distribution ID**: Existing AWS infra — implementer must retrieve the distribution
  ID for the main `vitau.mx` distribution before adding behaviors.
- **S3 bucket name**: Naming convention should follow existing AWS account conventions.
- **AWS OIDC provider**: May already exist in the account. Implementer should check before
  creating a new one.

## Output Structure

```
vitau-blog/
├── blog/                        # Astro 5 static blog
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.astro
│   │   │   ├── Hero.astro
│   │   │   ├── MainHeader.astro
│   │   │   ├── Footer.astro
│   │   │   ├── PostFeed.astro
│   │   │   ├── PostPreview.astro
│   │   │   ├── CategoryPreview.astro
│   │   │   └── SchemaOrg.astro       # Pharmacy + Person JSON-LD
│   │   ├── layouts/
│   │   │   └── BaseLayout.astro
│   │   ├── lib/
│   │   │   └── ghost.ts              # Ghost Content Layer loader
│   │   ├── content/
│   │   │   └── config.ts             # Content collections config
│   │   ├── pages/
│   │   │   ├── index.astro           # home
│   │   │   ├── categorias.astro      # categories listing
│   │   │   ├── 404.astro
│   │   │   ├── sitemap.xml.ts        # manual sitemap endpoint
│   │   │   ├── [slug].astro          # post template
│   │   │   └── [category].astro      # category template
│   │   └── styles/
│   │       └── global.css            # @import "tailwindcss"
│   ├── public/
│   │   ├── fonts/
│   │   └── robots.txt
│   ├── astro.config.ts
│   ├── tsconfig.json
│   └── package.json
├── ayuda/                       # React SPA
│   ├── src/                     # (existing source, migrated here)
│   ├── public/
│   ├── vite.config.ts           # base: '/ayuda/'
│   ├── tsconfig.json
│   └── package.json
├── infra/
│   └── cf-functions/
│       ├── blog-index-rewrite.js   # appends index.html for /blog/* dirs
│       └── ayuda-spa-rewrite.js    # rewrites /ayuda/* to /ayuda/index.html
├── .github/
│   └── workflows/
│       ├── deploy-blog.yml
│       └── deploy-ayuda.yml
└── package.json                 # root (optional npm workspaces)
```

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
Request: vitau.mx/blog/semaglutida
                │
                ▼
      CloudFront Distribution
      ┌─────────────────────────────────────────────┐
      │  Behavior match: /blog/*                    │
      │  ┌─────────────────────────────────────┐   │
      │  │ CF Function: blog-index-rewrite       │   │
      │  │ /blog/semaglutida → /blog/semaglutida/│   │
      │  │                     index.html         │   │
      │  └──────────────────┬──────────────────┘   │
      │                     │                       │
      │              S3 Origin (OAC)                │
      │              bucket/blog/semaglutida/        │
      │              index.html  ← full HTML        │
      └─────────────────────────────────────────────┘

Request: vitau.mx/ayuda/tickets/123  (SPA route)
                │
                ▼
      CloudFront Distribution
      ┌─────────────────────────────────────────────┐
      │  Behavior match: /ayuda/*                   │
      │  ┌─────────────────────────────────────┐   │
      │  │ CF Function: ayuda-spa-rewrite        │   │
      │  │ /ayuda/tickets/123 → /ayuda/index.html│   │
      │  └──────────────────┬──────────────────┘   │
      │                     │                       │
      │              S3 Origin (OAC)                │
      │              bucket/ayuda/index.html        │
      └─────────────────────────────────────────────┘

Build pipeline (GitHub Actions):
  push to master (blog/** changed)
    → npm run build (Astro)          # outputs blog/dist/
    → aws s3 sync dist/ s3://bucket/blog/
    → aws cloudfront create-invalidation --paths "/blog/*"
```

## Implementation Units

---

- [ ] **Unit 1: Repo restructure and root workspace**

**Goal:** Create the monorepo directory layout, move Gatsby files to `blog/` (as archive reference), add root package.json with workspaces.

**Requirements:** R10

**Dependencies:** None

**Files:**
- Create: `blog/` directory
- Create: `ayuda/` directory
- Create: `infra/cf-functions/` directory
- Create: `.github/workflows/` directory
- Create: `package.json` (root workspace)
- Archive: current Gatsby files can stay at root until Unit 4 completes — do not delete yet

**Approach:**
- Root `package.json` should declare `workspaces: ["blog", "ayuda"]` for npm workspaces
- No changes to existing Gatsby files at root yet — keep them until the Astro migration is validated
- `.gitignore` at root should cover `blog/dist`, `ayuda/dist`, `node_modules`

**Test scenarios:**
- Test expectation: none — pure scaffolding

**Verification:**
- `ls` shows `blog/`, `ayuda/`, `infra/`, `.github/` directories at repo root

---

- [ ] **Unit 2: Bootstrap Astro 5 in `blog/`**

**Goal:** Initialize a working Astro 5 project with TypeScript, Tailwind v4, static output, and base path `/blog`. Must render a placeholder page correctly.

**Requirements:** R1, R2, R3, R4

**Dependencies:** Unit 1

**Files:**
- Create: `blog/astro.config.ts`
- Create: `blog/tsconfig.json`
- Create: `blog/package.json`
- Create: `blog/src/styles/global.css`
- Create: `blog/src/layouts/BaseLayout.astro`
- Create: `blog/src/pages/index.astro` (placeholder)
- Create: `blog/src/components/MainHeader.astro`
- Create: `blog/src/components/Footer.astro`
- Create: `blog/src/components/Hero.astro`
- Create: `blog/public/robots.txt`
- Create: `blog/public/fonts/` (copy from `static/fonts/`)

**Approach:**
- `astro.config.ts`: `output: 'static'`, `site: 'https://vitau.mx'`, `base: '/blog'`
- Tailwind: use `@tailwindcss/vite` as a Vite plugin in `astro.config.ts` — do NOT install `@astrojs/tailwind`
- `global.css`: only `@import "tailwindcss"` — Tailwind v4 needs no config file
- `BaseLayout.astro`: handles `<head>` with description meta, canonical, OG tags, and schema slot
- `MainHeader.astro` and `Footer.astro`: port the existing JSX to Astro template syntax — all links must use `import.meta.env.BASE_URL` as prefix
- TypeScript strict mode in `tsconfig.json`

**Test scenarios:**
- Happy path: `npm run build` completes without errors
- Happy path: `blog/dist/index.html` contains `<html>` with content (not empty div)
- Edge case: all internal links in the built HTML include `/blog/` prefix
- Edge case: static assets (fonts, images) resolve correctly under `/blog/`

**Verification:**
- `npm run build` in `blog/` exits 0
- `dist/index.html` exists and contains non-empty body content
- No `blog.vitau.mx` references in built output

---

- [ ] **Unit 3: Ghost Content Layer integration**

**Goal:** Write a typed custom Content Layer loader that fetches all posts and tags from Ghost CMS at build time. Expose them via `getCollection('posts')` and `getCollection('tags')`.

**Requirements:** R3, R5

**Dependencies:** Unit 2

**Files:**
- Create: `blog/src/lib/ghost.ts` (loader + Ghost API client)
- Create: `blog/src/content/config.ts` (collection definitions)
- Modify: `blog/package.json` (add `@tryghost/content-api`)

**Approach:**
- Install `@tryghost/content-api` and `@types/tryghost__content-api`
- `ghost.ts` exports a `ghostPostLoader()` and `ghostTagLoader()` function — each returns an
  Astro Content Layer `Loader` object with a `load()` method that calls the Ghost API
- `config.ts` uses `defineCollection({ loader: ghostPostLoader() })` for `posts` and `tags`
- Post schema (Zod): `title`, `html`, `slug`, `feature_image`, `published_at`, `reading_time`,
  `excerpt`, `meta_title`, `meta_description`, `primary_tag` (optional object with name + slug)
- Tag schema (Zod): `id`, `name`, `slug`, `feature_image`, `count` (object with posts)
- Env vars: `GHOST_API_URL` and `GHOST_API_KEY` — fail loudly at build time if missing
- Ghost API `browse` calls: `limit: 'all'` for both posts and tags

**Test scenarios:**
- Happy path: `getCollection('posts')` returns typed array with correct fields
- Happy path: `getCollection('tags')` returns typed array sorted by name
- Error path: missing `GHOST_API_URL` throws a descriptive build error, not a silent undefined
- Edge case: posts with no `primary_tag` are handled (field is optional in schema)
- Edge case: Ghost API pagination — `limit: 'all'` fetches all pages, not just first 15

**Verification:**
- `npm run build` fetches data from Ghost (verify with build logs showing post count)
- TypeScript compiler reports no type errors on collection usage

---

- [ ] **Unit 4: Migrate all pages and templates**

**Goal:** Port index, categorias, post (slug), category, and 404 pages from Gatsby/React to Astro. All pages must render with full content in static HTML — no client-side data fetching.

**Requirements:** R1, R2, R4

**Dependencies:** Unit 3

**Files:**
- Modify: `blog/src/pages/index.astro`
- Create: `blog/src/pages/categorias.astro`
- Create: `blog/src/pages/404.astro`
- Create: `blog/src/pages/[slug].astro` (post template)
- Create: `blog/src/pages/[category].astro` (category template)
- Create: `blog/src/components/PostFeed.astro`
- Create: `blog/src/components/PostPreview.astro`
- Create: `blog/src/components/CategoryPreview.astro`

**Approach:**
- `index.astro`: fetches all posts via `getCollection('posts')`, renders `<PostFeed>`
- `[slug].astro`: `getStaticPaths()` returns one entry per post slug; renders post HTML via
  `<Fragment set:html={post.data.html} />` — this is the Astro equivalent of `dangerouslySetInnerHTML`
- `[category].astro`: `getStaticPaths()` returns one entry per tag; filters posts by `primary_tag.slug`
- `categorias.astro`: renders all tags via `getCollection('tags')`
- `PostPreview.astro` and `CategoryPreview.astro`: pure presentational components — no JS
- Date formatting: `dayjs` can stay as a dev dependency or be replaced with `Intl.DateTimeFormat`
  (no runtime bundle cost in Astro — either is fine)
- All links: use `import.meta.env.BASE_URL` + slug, e.g. `` `${import.meta.env.BASE_URL}/${post.slug}` ``
- Tailwind classes replace SCSS — use the same visual design, not a redesign

**Test scenarios:**
- Happy path: `[slug].astro` — `dist/[slug]/index.html` exists for each Ghost post
- Happy path: post HTML includes actual article body text, not placeholder
- Happy path: `[category].astro` — `dist/[category]/index.html` exists for each Ghost tag
- Edge case: post with no `feature_image` renders without broken `<img>` tag
- Edge case: post with no `primary_tag` renders without crash
- Edge case: category with 0 posts renders an empty feed, not a 500
- Integration: `getStaticPaths()` on `[slug].astro` generates all Ghost post slugs (verify count matches Ghost admin)

**Verification:**
- `find dist -name "index.html" | wc -l` matches expected post + category + static page count
- Each `index.html` in `dist/[slug]/` contains the post title in an `<h1>` tag

---

- [ ] **Unit 5: SEO layer — meta, sitemap, and schema markup**

**Goal:** Add structured metadata, a correct sitemap, and JSON-LD schema (Pharmacy + Person) to every page. This directly addresses the pending E-E-A-T work from the April 2026 SEO analysis.

**Requirements:** R1, R9

**Dependencies:** Unit 4

**Files:**
- Modify: `blog/src/layouts/BaseLayout.astro` (meta tags + schema slot)
- Create: `blog/src/components/SchemaOrg.astro` (JSON-LD output)
- Create: `blog/src/pages/sitemap.xml.ts` (manual sitemap endpoint)

**Approach:**
- `BaseLayout.astro` accepts props: `title`, `description`, `canonicalUrl`, `ogImage` — renders
  the same meta set as the current `SiteMeta`/`PostMeta` components
- Canonical URL: always `https://vitau.mx/blog/[slug]` — the new canonical, not the old subdomain
- `SchemaOrg.astro`: renders a `<script type="application/ld+json">` with an `@graph` containing:
  - `Pharmacy` type: name "Vitau Médical", license COFEPRIS 19039090963, url, address
  - `Person` type: Jommors Olvera Muñoz, jobTitle "Responsable Sanitario", identifier Ced. Prof. 6407754
  - `WebSite` type: name, url, potentialAction (SearchAction)
  - This component is included in `BaseLayout.astro` and renders on every page
- For post pages, add `Article` schema as additional graph node: headline, datePublished, author
  pointing to the Person node above
- `sitemap.xml.ts`: `export const prerender = true`, `export async function GET()` — builds
  XML manually from all posts and tags. URLs use `https://vitau.mx/blog/[slug]` (no base path
  prepend needed — these are canonical absolute URLs). Avoids bug #13315 entirely.

**Test scenarios:**
- Happy path: `dist/sitemap.xml` exists and contains one `<url>` entry per post + category page
- Happy path: sitemap URLs start with `https://vitau.mx/blog/` — not `blog.vitau.mx` or bare `/blog/`
- Happy path: every page's HTML contains `<script type="application/ld+json">` with Pharmacy schema
- Edge case: post page contains both Pharmacy and Article schema nodes in the `@graph`
- Integration: JSON-LD is valid — paste one post's schema into schema.org validator

**Verification:**
- `grep -r "application/ld+json" dist/ | wc -l` equals total page count
- `cat dist/sitemap.xml` shows correct absolute URLs
- No `blog.vitau.mx` domain appears anywhere in `dist/`

---

- [ ] **Unit 6: Set up `ayuda/` with React SPA**

**Goal:** Place the existing ayuda React SPA source into `ayuda/` and configure it for deployment at the `/ayuda` subpath. Build output must work correctly when CloudFront serves it from `/ayuda/*`.

**Requirements:** R2, R10

**Dependencies:** Unit 1

**Files:**
- Create: `ayuda/vite.config.ts` (base: '/ayuda/', build outDir: 'dist')
- Create: `ayuda/package.json`
- Create: `ayuda/tsconfig.json`
- Copy: existing ayuda app source into `ayuda/src/`

**Approach:**
- `base: '/ayuda/'` in Vite config — all asset references in the built HTML will be prefixed
- React Router (or equivalent): configure `basename: '/ayuda'` on the router so client-side
  navigation works correctly under the subpath
- Build output goes to `ayuda/dist/` — the CI job syncs this to `s3://bucket/ayuda/`
- If the ayuda source repo is not accessible, this unit creates the directory structure and
  config files only — the source copy is deferred

**Test scenarios:**
- Happy path: `npm run build` in `ayuda/` exits 0
- Happy path: `ayuda/dist/index.html` references assets at `/ayuda/assets/...`
- Edge case: client-side navigation to `/ayuda/some-route` loads correctly after hard refresh
  (verified via the CloudFront Function in Unit 8)

**Verification:**
- `grep -r '"/assets/' ayuda/dist/index.html | wc -l` equals 0 — all assets prefixed with `/ayuda/`
- `grep '/ayuda/assets/' ayuda/dist/index.html` returns matches

---

- [ ] **Unit 7: S3 bucket and OAC setup**

**Goal:** Create a private S3 bucket for static assets and configure the Origin Access Control policy so CloudFront can read from it. Bucket structure: `blog/` and `ayuda/` key prefixes.

**Requirements:** R6

**Dependencies:** None (can run parallel to Units 2-6)

**Files:**
- Create: `infra/s3-bucket-policy.json` (reference policy template — not Terraform/CDK, just a documented template)
- Create: `infra/README.md` documenting the manual setup steps

**Approach:**
- Bucket name: follow existing AWS account naming convention (ask if unclear)
- Bucket: block all public access — no static website hosting endpoint
- OAC: create an OAC of type S3 in CloudFront console/CLI, associate it with the distribution origin
- Bucket policy: grants `s3:GetObject` to the CloudFront service principal with a condition on
  `AWS:SourceArn` matching the CloudFront distribution ARN
- No lifecycle rules needed initially — posts are not frequently deleted
- Versioning: optional, not required for static hosting

**Test scenarios:**
- Test expectation: none — infrastructure setup, verified by CloudFront behavior in Unit 8

**Verification:**
- `aws s3 cp test.html s3://bucket/blog/test.html` succeeds
- Direct S3 URL returns 403 (bucket is not public)
- CloudFront URL `vitau.mx/blog/test.html` returns 200

---

- [ ] **Unit 8: CloudFront behaviors and CloudFront Functions**

**Goal:** Add `/blog/*` and `/ayuda/*` behaviors to the existing `vitau.mx` CloudFront distribution, each pointing to the S3 origin with the correct OAC. Attach CloudFront Functions for URI rewriting.

**Requirements:** R2, R6

**Dependencies:** Unit 7

**Files:**
- Create: `infra/cf-functions/blog-index-rewrite.js`
- Create: `infra/cf-functions/ayuda-spa-rewrite.js`
- Create: `infra/cloudfront-setup.md` (documents distribution configuration steps)

**Approach:**
- `blog-index-rewrite.js`: Viewer Request function on the `/blog/*` behavior. Appends `index.html`
  to URIs that end with `/` or have no file extension (e.g. `/blog/semaglutida` → `/blog/semaglutida/index.html`).
  Does NOT rewrite URIs that already contain a `.` (assets, XML, txt files).
- `ayuda-spa-rewrite.js`: Viewer Request function on the `/ayuda/*` behavior. For any URI under
  `/ayuda/` without a file extension, rewrites to `/ayuda/index.html`. Allows `/ayuda/assets/*`
  to pass through unchanged.
- CloudFront behavior order: `/blog/*` and `/ayuda/*` are listed BEFORE the `/*` default behavior
  so they take priority over the Next.js origin
- Cache policy for blog: CachingOptimized (managed) — blog is fully static, long TTL is fine
- Cache policy for ayuda: CachingDisabled on `index.html`, CachingOptimized on `assets/` — or
  simply CachingDisabled for the whole behavior during initial rollout, optimize later
- Do NOT use distribution-level custom error responses — they would globally intercept 404s and
  break the blog's real 404 page

**Test scenarios:**
- Happy path: `vitau.mx/blog/` returns the blog index HTML
- Happy path: `vitau.mx/blog/semaglutida` returns the post HTML (not a 404)
- Happy path: `vitau.mx/ayuda/` returns the SPA index
- Happy path: `vitau.mx/ayuda/tickets/123` (SPA route) returns the SPA index (not a 404)
- Happy path: `vitau.mx/` still routes to the Next.js app (default behavior unchanged)
- Edge case: `vitau.mx/blog/sitemap.xml` returns the sitemap (file extension passthrough works)
- Edge case: `vitau.mx/blog/nonexistent-post` returns a proper 404 HTML page, not the SPA shell

**Verification:**
- All test scenarios above pass via `curl -I`
- CloudFront distribution shows 3 behaviors in the console: `/blog/*`, `/ayuda/*`, `/*`

---

- [ ] **Unit 9: GitHub Actions CI/CD pipelines**

**Goal:** Automate blog and ayuda deployments on push to master. Each workflow triggers only when its own app's files change, builds the app, syncs to S3, and invalidates CloudFront.

**Requirements:** R7

**Dependencies:** Units 7, 8

**Files:**
- Create: `.github/workflows/deploy-blog.yml`
- Create: `.github/workflows/deploy-ayuda.yml`

**Approach:**
- Trigger: `on: push: branches: [master]` with `paths: ['blog/**']` (or `ayuda/**`)
- AWS auth: use `aws-actions/configure-aws-credentials` with OIDC — no long-lived access keys
  stored in GitHub secrets. Requires an OIDC provider and IAM role in the AWS account.
- IAM role permissions: `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` on the bucket;
  `cloudfront:CreateInvalidation` on the distribution
- Build step: `cd blog && npm ci && npm run build` (or `ayuda`)
- Sync step: `aws s3 sync blog/dist/ s3://BUCKET/blog/ --delete`
  The `--delete` flag removes stale files — important when Ghost post slugs change.
- Invalidation step: `aws cloudfront create-invalidation --distribution-id DIST_ID --paths "/blog/*"`
- Env vars passed to the build: `GHOST_API_URL` and `GHOST_API_KEY` as GitHub Actions secrets
- `npm ci` is preferred over `npm install` for reproducible builds

**Test scenarios:**
- Happy path: push a change to `blog/src/` triggers the blog workflow and not the ayuda workflow
- Happy path: push a change to `ayuda/src/` triggers the ayuda workflow and not the blog workflow
- Error path: missing `GHOST_API_URL` secret causes the blog build to fail with a clear error,
  not a silent empty deploy
- Integration: after the blog workflow completes, `vitau.mx/blog/` returns updated HTML

**Verification:**
- GitHub Actions tab shows two distinct workflows
- Push to `blog/` does not trigger `deploy-ayuda.yml`
- Workflow run shows S3 sync and CloudFront invalidation steps completing successfully

---

- [ ] **Unit 10: SEO migration — 301 redirects from blog.vitau.mx**

**Goal:** Redirect all existing `blog.vitau.mx/*` URLs to `vitau.mx/blog/*` with 301 to preserve link equity and avoid duplicate content.

**Requirements:** R8

**Dependencies:** Units 8, 9 (new URLs must be live before redirects go active)

**Files:**
- Create: `infra/redirect-setup.md` (documents the redirect configuration options)

**Approach:**
- Option A (preferred if blog.vitau.mx is on Netlify): add a Netlify redirect rule in the
  current Netlify project: `blog.vitau.mx/* → https://vitau.mx/blog/:splat 301`
  This keeps the subdomain alive and redirecting without any AWS changes.
- Option B (if Netlify is removed): create a separate CloudFront distribution for
  `blog.vitau.mx` that serves only HTTP 301 redirects using a CloudFront Function
- The `infra/redirect-setup.md` documents both options with the exact configuration
- After redirects are verified working, update `<link rel="canonical">` in all blog pages
  to point to `vitau.mx/blog/[slug]` (already handled in Unit 5 — just verify no old subdomain appears)
- Submit updated sitemap to Google Search Console for `vitau.mx` property

**Test scenarios:**
- Happy path: `curl -I https://blog.vitau.mx/semaglutida` returns 301 to `https://vitau.mx/blog/semaglutida`
- Happy path: `curl -I https://blog.vitau.mx/` returns 301 to `https://vitau.mx/blog/`
- Edge case: redirect preserves full URL path including query strings (`:splat` in Netlify)

**Verification:**
- `curl -I https://blog.vitau.mx/` shows `Location: https://vitau.mx/blog/`
- No indexed page on `blog.vitau.mx` returns 200 after go-live

---

## System-Wide Impact

- **Interaction graph:** Ghost CMS is called only at build time (no runtime dependency). No webhooks or API calls from the browser. CloudFront caches built HTML — Ghost publish events should trigger a workflow dispatch or webhook to re-run the GitHub Actions build.
- **Error propagation:** Build failures in Ghost loader (API key invalid, rate limit) fail fast at `npm run build` — the S3 sync step never runs. CloudFront serves stale content until a successful deploy.
- **State lifecycle risks:** `aws s3 sync --delete` will remove files for deleted Ghost posts. Ensure this is intentional before first production run.
- **API surface parity:** The blog has no API surface. The ayuda SPA's API endpoints (presumably in the main Next.js app or a separate backend) are unaffected.
- **Integration coverage:** Ghost publish → CloudFront cache update is NOT handled by GitHub Actions path triggers (path triggers only fire on code pushes). A Ghost webhook that dispatches a `workflow_dispatch` event is needed for content updates to be live without a code push. This is a known operational gap — defer to a separate task.
- **Unchanged invariants:** The main `vitau.mx` Next.js app CloudFront default behavior is not modified. The `/blog/*` and `/ayuda/*` behaviors are additive.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| CloudFront Function URI rewrite interacts unexpectedly with Astro's base path | Test with `curl` before DNS cutover; verify `index.html` append doesn't double-append |
| Astro sitemap bug #13315 produces wrong URLs | Manual sitemap endpoint in Unit 5 bypasses the plugin entirely |
| Ghost API rate limiting during build (many posts) | Use `@tryghost/content-api` `browse({limit: 'all'})` — single paginated request, not N requests |
| S3 `--delete` removes posts that are still live in Ghost (slug changed) | Verify Ghost slug changes are intentional; consider removing `--delete` for first production deploy |
| `blog.vitau.mx` Netlify project may be on a team plan with billing implications | Keep the Netlify project alive (free tier) just for the 301 redirect — don't delete it |
| Existing `vitau.mx` CloudFront distribution may have restrictive WAF rules | Verify `/blog/*` and `/ayuda/*` are not blocked by WAF before go-live |
| Ghost webhook for content updates not in scope | Document as known gap — content deploys require a manual `workflow_dispatch` until addressed |

## Documentation / Operational Notes

- After go-live, add a Ghost webhook (Admin → Integrations → Add custom integration) pointing to
  a GitHub Actions `workflow_dispatch` URL to automate content deploys on Ghost publish
- Add `GHOST_API_URL`, `GHOST_API_KEY`, `AWS_ROLE_ARN`, and `CLOUDFRONT_DISTRIBUTION_ID` to
  GitHub Actions secrets before running any deploy workflow
- The `blog.vitau.mx` Netlify project should remain live (free tier) to serve 301 redirects —
  do not delete it even after the AWS setup is complete

## Sources & References

- Related code: `src/templates/post/Post.js`, `src/templates/category/Category.js`
- Related code: `src/components/seo/PostMeta.js`
- Ghost Content API JS SDK: [@tryghost/content-api](https://github.com/tryghost/content-api-sdk)
- Astro Content Layer API: [docs.astro.build/en/reference/content-loader-reference](https://docs.astro.build/en/reference/content-loader-reference/)
- Tailwind v4 + Astro: use `@tailwindcss/vite`, not `@astrojs/tailwind`
- Astro sitemap + base path bug: github.com/withastro/astro/issues/13315
- CloudFront Function for SPA routing: aws-samples/amazon-cloudfront-functions
- S3 OAC pattern: aws.amazon.com/blogs/networking-and-content-delivery/amazon-cloudfront-introduces-origin-access-control
- SEO context: docs/plans/ should cross-reference the April 2026 SEO analysis (stored in project memory)
