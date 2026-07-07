import { proxyRequest } from 'h3'

export default defineEventHandler((event) => {
  const cfg = useRuntimeConfig()
  return proxyRequest(event, `${cfg.backendUrl}/articles/all`)
})
