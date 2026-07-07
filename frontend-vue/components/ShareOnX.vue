<script setup lang="ts">
const props = defineProps<{
  title: string
  urlSuffix: string
}>()

const cfg = useRuntimeConfig()

const shareUrl = computed(() => {
  const base = cfg.public.publishUrl.replace(/\/$/, '')
  const articleUrl = `${base}/article/${props.urlSuffix}`
  const text = `${props.title.trim()} | ${cfg.public.siteName}\n${articleUrl}`
  const u = new URL('https://twitter.com/intent/tweet')
  u.searchParams.set('text', text)
  return u.toString()
})
</script>

<template>
  <a
    :href="shareUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="share-btn"
    aria-label="X (Twitter) で共有する"
  >
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M18.244 2H21l-6.522 7.455L22 22h-6.828l-4.77-6.24L4.8 22H2l7.02-8.02L2 2h6.914l4.32 5.71L18.244 2Zm-1.196 18.4h1.63L7.03 3.51H5.31L17.048 20.4Z" />
    </svg>
    <span>Post</span>
  </a>
</template>

<style scoped>
.share-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--color-ink);
  color: #fff;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.15s ease;
}
.share-btn:hover { background: var(--color-acc-ink); }
</style>
