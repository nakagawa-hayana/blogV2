import { proxyRequest } from 'h3'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const cfg = useRuntimeConfig()
  return proxyRequest(event, `${cfg.backendUrl}/articles/${encodeURIComponent(slug)}`)
})
