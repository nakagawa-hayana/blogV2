import type { Ref } from 'vue'
import type { Article } from '~/lib/api'
import { fetchArticle } from '~/lib/api'

export function useArticle(slug: Ref<string> | string) {
  const slugRef = typeof slug === 'string' ? ref(slug) : slug
  return useAsyncData<Article>(
    `article:${slugRef.value}`,
    () => fetchArticle(slugRef.value),
    { watch: [slugRef] },
  )
}
