import type { APIRoute } from 'astro'
import { getAllPosts, getPostSlug } from '../../lib/content'

export const GET: APIRoute = async () => {
  const posts = await getAllPosts()

  const urls = posts.map((post) => {
    const slug = getPostSlug(post)
    const lastmod = new Date(post.data.publishedAt).toISOString().split('T')[0]
    return `  <url>
    <loc>https://vitau.mx/blog/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vitau.mx/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${urls.join('\n')}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
