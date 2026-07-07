export function ogImageUrl(slug: string): string {
  return `/og/${encodeURIComponent(slug)}.png`
}

export function absoluteOgUrl(publishUrl: string, slug: string): string {
  const base = publishUrl.replace(/\/$/, '')
  return `${base}${ogImageUrl(slug)}`
}
