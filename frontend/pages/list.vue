<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const currentTag = computed<string | null>(() => {
  const v = route.query.tag
  return typeof v === 'string' && v.length > 0 ? v : null
})
const currentPage = computed<number>(() => {
  const v = route.query.page
  const n = typeof v === 'string' ? parseInt(v, 10) : NaN
  return Number.isFinite(n) && n > 0 ? n : 1
})

const { view, error } = await useArticles()

const current = computed(() => view(currentTag.value, currentPage.value))

function onSelectTag(tag: string | null) {
  const query: Record<string, string> = {}
  if (tag) query.tag = tag
  router.push({ path: '/list', query })
}

function buildHref(page: number): string {
  const q: Record<string, string> = {}
  if (currentTag.value) q.tag = currentTag.value
  if (page > 1) q.page = String(page)
  const qs = new URLSearchParams(q).toString()
  return qs ? `/list?${qs}` : '/list'
}

watchEffect(() => {
  useSiteMeta({
    title: currentTag.value ? `#${currentTag.value} の記事` : '記事一覧',
    description: currentTag.value
      ? `#${currentTag.value} タグの記事一覧です。`
      : '記事一覧',
    path: currentTag.value ? `/list?tag=${encodeURIComponent(currentTag.value)}` : '/list',
  })
})
</script>

<template>
  <section class="container-wide pt-6 pb-16">
    <div class="list-header">
      <FadeIn>
        <h1 class="list-title">
          記事をさがす
        </h1>
      </FadeIn>

      <FadeIn :delay="100" class="list-header__filter">
        <TagFilter
          :tags="current.allTags"
          :active="currentTag"
          @select="onSelectTag"
        />
      </FadeIn>
    </div>

    <FadeIn :delay="180">
      <p class="mt-5 meta-mono">
        {{ current.totalCount }} 件
      </p>
    </FadeIn>

    <div v-if="error" class="error">
      <p>記事の取得に失敗しました。</p>
    </div>

    <div v-else class="mt-6">
      <ArticleGrid :articles="current.items" />

      <Pager
        :current-page="currentPage"
        :total-pages="current.totalPages"
        :build-href="buildHref"
      />
    </div>
  </section>
</template>

<style scoped>
.list-title {
  font-family: var(--font-heading);
  font-size: clamp(26px, 4.5vw, 32px);
  font-weight: 700;
  letter-spacing: 0.02em;
}

.list-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: stretch;
}

.list-header__filter {
  width: 100%;
  max-width: 420px;
}

@media (min-width: 720px) {
  .list-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .list-header__filter {
    width: 320px;
    flex-shrink: 0;
  }
}

.error {
  margin-top: 40px;
  text-align: center;
  color: var(--color-sub);
}
</style>
