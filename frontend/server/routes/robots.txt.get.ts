export default defineEventHandler((event) => {
  const cfg = useRuntimeConfig()
  const base = cfg.public.publishUrl.replace(/\/$/, '')
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`
})
