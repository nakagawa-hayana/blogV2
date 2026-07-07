import { fetchAllArticles } from '../../lib/api'

function toIsoDate(s: string): string {
  const normalized = s.includes('T') ? s : s.replace(' ', 'T') + 'Z'
  const d = new Date(normalized)
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
  const base = cfg.public.publishUrl.replace(/\/$/, '')
  const now = new Date().toISOString()

  const urls: { loc: string; lastmod: string }[] = [
    { loc: `${base}/`, lastmod: now },
    { loc: `${base}/list`, lastmod: now },
  ]

  try {
    const articles = await fetchAllArticles()
    for (const a of articles) {
      urls.push({
        loc: `${base}/article/${a.url_suffix}`,
        lastmod: toIsoDate(a.updated_at),
      })
    }
  } catch (e) {
    console.error('[sitemap] fetch failed', e)
  }

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(u => `  <url><loc>${esc(u.loc)}</loc><lastmod>${u.lastmod}</lastmod></url>`)
      .join('\n') +
    `\n</urlset>\n`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return body
})
