<script setup lang="ts">
import type { Article } from '~/lib/api'

defineProps<{
  articles: Article[]
}>()
</script>

<template>
  <div v-if="articles.length" class="article-grid">
    <FadeIn
      v-for="(a, i) in articles"
      :key="a.url_suffix"
      :delay="Math.min(i * 60, 360)"
    >
      <ArticleCard :article="a" />
    </FadeIn>
  </div>
  <div v-else class="empty">
    <p>該当する記事はありませんでした。</p>
  </div>
</template>

<style scoped>
.article-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;
}
@media (min-width: 640px) {
  .article-grid { grid-template-columns: repeat(2, 1fr); }
}
.empty {
  text-align: center;
  padding: 60px 0;
  color: var(--color-sub);
  font-size: 14px;
}
</style>
