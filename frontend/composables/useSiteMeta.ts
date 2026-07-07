export interface SiteMetaInput {
  title: string
  description?: string
  path: string
  image?: string
  type?: 'website' | 'article'
}

export function useSiteMeta(input: SiteMetaInput) {
  const cfg = useRuntimeConfig()
  const siteName = cfg.public.siteName
  const publishUrl = cfg.public.publishUrl.replace(/\/$/, '')
  const description = input.description ?? cfg.public.siteDescription
  const url = `${publishUrl}${input.path}`
  const image = input.image ?? `${publishUrl}/og/default.png`
  const type = input.type ?? 'website'
  const fullTitle = input.path === '/' ? siteName : `${input.title} | ${siteName}`

  useHead({
    title: fullTitle,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:site_name', content: siteName },
      { property: 'og:locale', content: 'ja_JP' },
      { property: 'og:type', content: type },
      { property: 'og:image', content: image },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: image },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
    ],
    link: [
      { rel: 'canonical', href: url },
    ],
  })
}
