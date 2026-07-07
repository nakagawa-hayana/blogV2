<script setup lang="ts">
import { formatDateJa, parseTags } from '~/lib/api'
import { ogImageUrl } from '~/lib/og'

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data: article, error } = await useArticle(slug)

watchEffect(() => {
  if (!article.value && !error.value) {
    throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  }
  if (error.value) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load article' })
  }
})

const tags = computed(() => parseTags(article.value?.tags))
const date = computed(() => article.value ? formatDateJa(article.value.updated_at) : '')

const description = computed(() => {
  const c = article.value?.content ?? ''
  return c.replace(/\s+/g, ' ').slice(0, 100)
})

useSiteMeta({
  title: article.value?.title ?? '記事',
  description: description.value,
  path: `/article/${slug.value}`,
  image: article.value ? ogImageUrl(article.value.url_suffix) : undefined,
  type: 'article',
})
</script>

<template>
  <article v-if="article" class="container-narrow pt-6 pb-24">
    <FadeIn>
      <div class="mb-4 flex flex-wrap gap-2">
        <NuxtLink
          v-for="t in tags"
          :key="t"
          :to="`/list?tag=${encodeURIComponent(t)}`"
          class="tag-pill"
        >
          {{ t }}
        </NuxtLink>
      </div>
    </FadeIn>

    <FadeIn :delay="120">
      <h1 class="article-title">
        {{ article.title }}
      </h1>
    </FadeIn>

    <FadeIn :delay="220">
      <div class="date-line meta-mono">{{ date }}</div>
    </FadeIn>

    <FadeIn :delay="320">
      <div class="cover">
        <img
          :src="ogImageUrl(article.url_suffix)"
          :alt="article.title"
          loading="eager"
          decoding="async"
        >
      </div>
    </FadeIn>

    <FadeIn :delay="420">
      <MarkdownRenderer
        :content="article.content"
        :cache-key="article.url_suffix"
      />
    </FadeIn>

    <FadeIn :delay="520">
      <div class="mt-12 flex items-center justify-between">
        <NuxtLink to="/list" class="back-link">
          ← 一覧へ
        </NuxtLink>
        <ShareOnTwitter :title="article.title" :url-suffix="article.url_suffix" />
      </div>
    </FadeIn>
  </article>
</template>

<style scoped>
.article-title {
  font-family: var(--font-heading);
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0.02em;
  margin-top: 4px;
}

.date-line {
  margin-top: 16px;
}

.cover {
  margin: 28px 0 32px;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 20 / 10.5;
  box-shadow: var(--shadow-card);
}
.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.back-link {
  color: var(--color-acc-ink);
  font-size: 13px;
}
.back-link:hover { text-decoration: underline; }
</style>
