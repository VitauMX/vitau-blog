# Agents Guidelines

## Project Context

This is a **static Astro site** deployed to S3 behind CloudFront. It powers the `/blog` and `/ayuda` subpaths of vitau.mx. The main site (vitau.mx/) is a separate Next.js project — do not confuse them.

## Architecture Decisions

### Why Astro (not Next.js with the main site)?
- Blog and help center are 100% static content with no interactivity
- Astro produces zero JS by default — optimal for SEO and performance
- Decoupled deploys: blog content updates don't require redeploying the main site

### Why Notion as CMS?
- Editorial team manages content in Notion
- Custom Astro loaders (`src/loaders/notion.ts`) fetch at build time
- No runtime dependency on Notion — the site is fully static after build

### AWS Architecture
- S3 bucket hosts the build output
- CloudFront distribution for vitau.mx routes `/blog/*` and `/ayuda/*` to this S3 origin
- 404 handling depends on CloudFront custom error responses (S3 returns 403 for missing keys, CloudFront maps it to 404.html)

## Coding Standards

- Use `.astro` components for pages and layouts; avoid client-side JS unless absolutely necessary
- TypeScript for all `.ts` files
- Content helpers go in `src/lib/` — keep loaders in `src/loaders/`
- All user-facing text is in Spanish
- Use Tailwind CSS utility classes; global/component styles use `<style>` blocks in Astro files
- Dates formatted with `es-MX` locale via `Intl.DateTimeFormat`

## Content Model

### Blog Posts (Notion → `posts` collection)
Required fields: `Slug`, `Title`, `Status` (= "Listo" to publish)
Optional: `Excerpt`, `FeaturedImage`, `PublishedAt`, `ReadingTime`, `Tags`, `SEOTitle`, `SEODescription`, `Author`, `Featured`

### Ayuda Articles (Notion → `ayuda` collection)
Required fields: `Slug`, `Title`, `Category`, `Status` (= "Listo")
Optional: `CategoryName`, `SEODescription`

## Deployment

Build produces static files. Deploy the `dist/` folder contents to the S3 bucket. CloudFront invalidation may be needed for updated paths.

## Common Tasks

### Adding a new page
1. Create `.astro` file in `src/pages/blog/` or `src/pages/ayuda/`
2. Ensure the route respects the CloudFront subpath structure

### Modifying content schema
1. Update the Notion database properties
2. Update `src/loaders/notion.ts` to read the new property
3. Update `src/content.config.ts` schema (zod)
4. Update helpers in `src/lib/content.ts` or `src/lib/ayuda.ts`

### Handling removed blog posts (404 redirects)
When posts are removed from Notion (or status changed from "Listo"), they won't be generated on next build. Old URLs will 404. The 404 page (`src/pages/404.astro`) shows a contextual message and links back to the blog or help center index. For bulk redirects, configure CloudFront custom error responses or S3 routing rules.
