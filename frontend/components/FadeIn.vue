<script setup lang="ts">
const props = withDefaults(defineProps<{
  delay?: number
  duration?: number
}>(), {
  delay: 0,
  duration: 600,
})

const visible = ref(false)

onMounted(() => {
  const timer = window.setTimeout(() => {
    visible.value = true
  }, props.delay)
  onBeforeUnmount(() => window.clearTimeout(timer))
})
</script>

<template>
  <div
    class="fade-in"
    :class="{ 'fade-in--visible': visible }"
    :style="{ transitionDuration: `${duration}ms` }"
  >
    <slot />
  </div>
</template>

<style scoped>
.fade-in {
  opacity: 0;
  transform: translateY(6px);
  transition-property: opacity, transform;
  transition-timing-function: ease-out;
}

.fade-in--visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
