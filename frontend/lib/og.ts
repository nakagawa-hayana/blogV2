export function ogImageUrl(slug: string): string {
  return `/og/${encodeURIComponent(slug)}.svg`
}

export function absoluteOgUrl(publishUrl: string, slug: string): string {
  const base = publishUrl.replace(/\/$/, '')
  return `${base}${ogImageUrl(slug)}`
}
