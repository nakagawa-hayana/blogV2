<script setup lang="ts">
const route = useRoute()
const isList = computed(() => route.path.startsWith('/list'))
const isArticle = computed(() => route.path.startsWith('/article'))
</script>

<template>
  <header class="container-wide flex items-center justify-between pt-7 pb-5">
    <NuxtLink to="/" class="flex items-center gap-2.5">
      <span class="logo-mark" aria-hidden="true" />
      <span class="text-base font-semibold" style="font-family: var(--font-heading)">
        ardririyの足跡
      </span>
    </NuxtLink>
    <nav class="flex items-center gap-5 text-sm">
      <NuxtLink
        v-if="isArticle"
        to="/list"
        class="text-[color:var(--color-acc-ink)] hover:underline"
      >
        ← 一覧へ
      </NuxtLink>
      <NuxtLink
        v-else
        to="/list"
        :class="isList ? 'text-[color:var(--color-acc-ink)] font-medium' : 'text-[color:var(--color-sub)]'"
        class="hover:text-[color:var(--color-acc-ink)]"
      >
        記事
      </NuxtLink>
    </nav>
  </header>
</template>

<style scoped>
.logo-mark {
  display: inline-block;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 30%, var(--color-acc-soft), var(--color-acc));
  box-shadow: 0 3px 10px -6px rgba(194, 110, 140, 0.6);
}
</style>
