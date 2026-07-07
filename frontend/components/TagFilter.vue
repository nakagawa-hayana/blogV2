<script setup lang="ts">
defineProps<{
  tags: string[]
  active: string | null
}>()

const emit = defineEmits<{
  select: [tag: string | null]
}>()

function onClick(tag: string | null) {
  emit('select', tag)
}
</script>

<template>
  <div class="flex flex-wrap gap-2" role="group" aria-label="タグで絞り込み">
    <button
      type="button"
      class="tag-pill"
      :class="{ 'tag-pill--active': active === null }"
      @click="onClick(null)"
    >
      すべて
    </button>
    <button
      v-for="t in tags"
      :key="t"
      type="button"
      class="tag-pill"
      :class="{ 'tag-pill--active': active === t }"
      @click="onClick(t)"
    >
      {{ t }}
    </button>
  </div>
</template>
