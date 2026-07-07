<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
  buildHref: (page: number) => string
}>()

const pages = computed(() => {
  const show = 5
  let start = Math.max(1, props.currentPage - Math.floor(show / 2))
  let end = Math.min(props.totalPages, start + show - 1)
  if (end - start + 1 < show) {
    start = Math.max(1, end - show + 1)
  }
  const arr: number[] = []
  for (let i = start; i <= end; i++) arr.push(i)
  return { start, end, list: arr }
})
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="mt-10 flex flex-wrap items-center justify-center gap-2"
    aria-label="ページネーション"
  >
    <NuxtLink
      v-if="currentPage > 1"
      :to="buildHref(currentPage - 1)"
      class="pager-nav"
    >
      ← 前へ
    </NuxtLink>

    <template v-if="pages.start > 1">
      <NuxtLink :to="buildHref(1)" class="pager-num">1</NuxtLink>
      <span v-if="pages.start > 2" class="pager-ellipsis">…</span>
    </template>

    <NuxtLink
      v-for="p in pages.list"
      :key="p"
      :to="buildHref(p)"
      class="pager-num"
      :class="{ 'pager-num--active': p === currentPage }"
    >
      {{ p }}
    </NuxtLink>

    <template v-if="pages.end < totalPages">
      <span v-if="pages.end < totalPages - 1" class="pager-ellipsis">…</span>
      <NuxtLink :to="buildHref(totalPages)" class="pager-num">{{ totalPages }}</NuxtLink>
    </template>

    <NuxtLink
      v-if="currentPage < totalPages"
      :to="buildHref(currentPage + 1)"
      class="pager-nav"
    >
      次へ →
    </NuxtLink>
  </nav>
</template>

<style scoped>
.pager-nav {
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--color-acc-soft);
  color: var(--color-acc-ink);
  font-size: 12px;
  font-weight: 500;
}
.pager-nav:hover { background: var(--color-acc); color: #fff; }
.pager-num {
  width: 34px; height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #fff;
  border: 1px solid var(--color-line);
  color: var(--color-acc-ink);
  font-size: 13px;
  font-family: var(--font-mono);
}
.pager-num:hover { background: var(--color-acc-soft); }
.pager-num--active { background: var(--color-acc); color: #fff; border-color: transparent; }
.pager-ellipsis {
  color: var(--color-sub);
  font-family: var(--font-mono);
}
</style>
