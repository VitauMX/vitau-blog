import type { APIRoute } from 'astro'
import { getAllAyudaArticles, ayudaCategories, getAyudaSlug } from '../../lib/ayuda'

export const GET: APIRoute = async () => {
  const articles = await getAllAyudaArticles()

  const categoryUrls = ayudaCategories.map(
    (cat) => `  <url>
    <loc>https://vitau.mx/ayuda/${cat.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
  )

  const articleUrls = articles.map(
    (article) => `  <url>
    <loc>https://vitau.mx/ayuda/${getAyudaSlug(article)}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`,
  )

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vitau.mx/ayuda</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
${[...categoryUrls, ...articleUrls].join('\n')}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
