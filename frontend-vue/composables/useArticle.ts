import type { Article } from '~/lib/api'
import { fetchArticle } from '~/lib/api'

export async function useArticle(slug: string) {
  return await useAsyncData<Article>(
    `article:${slug}`,
    () => fetchArticle(slug),
  )
}
