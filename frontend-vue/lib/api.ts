export interface Article {
  id: number
  title: string
  content: string
  url_suffix: string
  tags: string | null
  created_at: string
  updated_at: string
}

export interface ArticleSummary {
  id: number
  title: string
  url_suffix: string
  tags: string | null
  created_at: string
  updated_at: string
}

export function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return []
  return tags
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0)
}

export function formatDateSlash(iso: string): string {
  const normalized = iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z'
  const d = new Date(normalized)
  if (Number.isNaN(d.getTime())) return iso
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

export function formatDateJa(iso: string): string {
  const normalized = iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z'
  const d = new Date(normalized)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function backendUrl(): string {
  const cfg = useRuntimeConfig()
  return cfg.public.backendUrl
}

export async function fetchAllArticles(): Promise<Article[]> {
  const url = `${backendUrl()}/articles/all`
  const data = await $fetch<Article[]>(url)
  return data.map(normalizeContent)
}

export async function fetchArticle(slug: string): Promise<Article> {
  const url = `${backendUrl()}/articles/${slug}`
  const data = await $fetch<Article>(url)
  return normalizeContent(data)
}

function normalizeContent<T extends { content?: string }>(a: T): T {
  if (typeof a.content === 'string') {
    return { ...a, content: a.content.replace(/\\n/g, '\n') }
  }
  return a
}
