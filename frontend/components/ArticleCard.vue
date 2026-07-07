<script setup lang="ts">
import type { Article } from '~/lib/api'
import { formatDateSlash, parseTags } from '~/lib/api'

const props = defineProps<{
  article: Article
}>()

const tags = computed(() => parseTags(props.article.tags))
const date = computed(() => formatDateSlash(props.article.updated_at))
</script>

<template>
  <NuxtLink :to="`/article/${article.url_suffix}`" class="card block">
    <ArticleThumbnail :title="article.title" :slug="article.url_suffix" />
    <div class="p-5">
      <div class="mb-2 flex flex-wrap gap-1.5">
        <span v-for="t in tags.slice(0, 3)" :key="t" class="card-tag">
          {{ t }}
        </span>
      </div>
      <h3 class="card-title">
        {{ article.title }}
      </h3>
      <p class="card-date meta-mono">
        {{ date }}
      </p>
    </div>
  </NuxtLink>
</template>

<style scoped>
.card-tag {
  display: inline-flex;
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--color-acc-soft);
  color: var(--color-acc-ink);
  font-size: 11px;
  font-weight: 500;
}
.card-title {
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  color: var(--color-ink);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 3em;
}
.card-date { margin-top: 10px; }
</style>
