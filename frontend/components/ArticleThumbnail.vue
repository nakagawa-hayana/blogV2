<script setup lang="ts">
import { ogImageUrl } from '~/lib/og'

defineProps<{
  title: string
  slug: string
  alt?: string
}>()
</script>

<template>
  <div class="thumb">
    <img
      :src="ogImageUrl(slug)"
      :alt="alt ?? title"
      loading="lazy"
      decoding="async"
      class="thumb__img"
    >
  </div>
</template>

<style scoped>
.thumb {
  aspect-ratio: 20 / 10.5;
  background: linear-gradient(135deg, var(--color-acc-soft), var(--color-acc2-soft));
  overflow: hidden;
}
.thumb__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
