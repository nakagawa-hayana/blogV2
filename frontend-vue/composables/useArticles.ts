import type { Article } from '~/lib/api'
import { fetchAllArticles, parseTags } from '~/lib/api'

export const PER_PAGE = 20

export interface ArticleView {
  items: Article[]
  totalPages: number
  totalCount: number
  allTags: string[]
}

export async function useArticles() {
  const { data, error, refresh, status } = await useAsyncData<Article[]>(
    'all-articles',
    () => fetchAllArticles(),
    { default: () => [] },
  )

  const all = computed<Article[]>(() => data.value ?? [])

  const allTags = computed<string[]>(() => {
    const tagCounts = new Map<string, number>()
    for (const a of all.value) {
      for (const t of parseTags(a.tags)) {
        tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
      }
    }
    return [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([t]) => t)
  })

  function view(tag: string | null, page: number, perPage = PER_PAGE): ArticleView {
    const filtered = tag
      ? all.value.filter(a => parseTags(a.tags).includes(tag))
      : all.value
    const sorted = [...filtered].sort((a, b) => (b.updated_at > a.updated_at ? 1 : -1))
    const totalCount = sorted.length
    const totalPages = Math.max(1, Math.ceil(totalCount / perPage))
    const safePage = Math.min(Math.max(1, page), totalPages)
    const start = (safePage - 1) * perPage
    const items = sorted.slice(start, start + perPage)
    return { items, totalPages, totalCount, allTags: allTags.value }
  }

  return { all, allTags, view, error, refresh, status }
}
