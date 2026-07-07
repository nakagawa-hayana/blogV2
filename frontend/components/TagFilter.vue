<script setup lang="ts">
import type { TagInfo } from '~/composables/useArticles'

const props = defineProps<{
  tags: TagInfo[]
  active: string | null
}>()

const emit = defineEmits<{
  select: [tag: string | null]
}>()

const query = ref('')
const open = ref(false)
const highlight = ref(0)
const rootEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)
const listboxId = useId()

const candidates = computed<TagInfo[]>(() => {
  const q = query.value.trim().toLowerCase()
  const src = props.tags.filter(t => t.name !== props.active)
  if (!q) return src.slice(0, 50)
  return src.filter(t => t.name.toLowerCase().includes(q)).slice(0, 50)
})

watch(candidates, () => {
  highlight.value = 0
})

function openList() {
  open.value = true
}

function closeList() {
  open.value = false
}

function pick(tag: string) {
  emit('select', tag)
  query.value = ''
  closeList()
  nextTick(() => inputEl.value?.blur())
}

function clearActive() {
  emit('select', null)
  query.value = ''
  nextTick(() => inputEl.value?.focus())
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!open.value) openList()
    if (candidates.value.length === 0) return
    highlight.value = (highlight.value + 1) % candidates.value.length
  }
  else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (!open.value) openList()
    if (candidates.value.length === 0) return
    highlight.value = (highlight.value - 1 + candidates.value.length) % candidates.value.length
  }
  else if (e.key === 'Enter') {
    e.preventDefault()
    const pickTag = candidates.value[highlight.value]
    if (pickTag) pick(pickTag.name)
  }
  else if (e.key === 'Escape') {
    if (open.value) {
      e.preventDefault()
      closeList()
    }
    else if (query.value) {
      e.preventDefault()
      query.value = ''
    }
  }
  else if (e.key === 'Backspace') {
    if (query.value === '' && props.active) {
      e.preventDefault()
      clearActive()
    }
  }
}

function onDocumentPointer(e: PointerEvent) {
  const el = rootEl.value
  if (!el) return
  if (!el.contains(e.target as Node)) closeList()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointer)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointer)
})
</script>

<template>
  <div ref="rootEl" class="tag-combo">
    <div class="tag-combo__field" :class="{ 'is-open': open }" @click="inputEl?.focus()">
      <span class="tag-combo__icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>

      <span v-if="active" class="tag-combo__chip">
        <span class="tag-combo__chip-hash">#</span>{{ active }}
        <button
          type="button"
          class="tag-combo__chip-x"
          aria-label="タグを解除"
          @click.stop="clearActive"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </span>

      <input
        ref="inputEl"
        v-model="query"
        type="text"
        role="combobox"
        :aria-expanded="open"
        :aria-controls="listboxId"
        aria-autocomplete="list"
        :placeholder="active ? '別のタグを検索…' : 'タグを検索…'"
        class="tag-combo__input"
        @focus="openList"
        @keydown="onKeydown"
      >
    </div>

    <ul
      v-if="open"
      :id="listboxId"
      role="listbox"
      class="tag-combo__list"
    >
      <li
        v-if="candidates.length === 0"
        class="tag-combo__empty"
      >
        該当するタグはありません
      </li>
      <li
        v-for="(t, i) in candidates"
        :key="t.name"
        role="option"
        :aria-selected="i === highlight"
        class="tag-combo__option"
        :class="{ 'is-active': i === highlight }"
        @pointerenter="highlight = i"
        @pointerdown.prevent="pick(t.name)"
      >
        <span class="tag-combo__option-name">
          <span class="tag-combo__option-hash">#</span>{{ t.name }}
        </span>
        <span class="tag-combo__option-count">{{ t.count }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.tag-combo {
  position: relative;
  max-width: 420px;
}

.tag-combo__field {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: 999px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  cursor: text;
}

.tag-combo__field:hover {
  border-color: var(--color-acc);
}

.tag-combo__field.is-open,
.tag-combo__field:focus-within {
  border-color: var(--color-acc);
  box-shadow: 0 0 0 3px var(--color-acc-soft);
}

.tag-combo__icon {
  display: inline-flex;
  color: var(--color-sub);
  flex-shrink: 0;
}

.tag-combo__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 4px 3px 10px;
  background: var(--color-acc);
  color: #fff;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.tag-combo__chip-hash {
  opacity: 0.8;
  margin-right: 1px;
}

.tag-combo__chip-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  color: #fff;
  transition: background-color 0.15s ease;
}

.tag-combo__chip-x:hover {
  background: rgba(255, 255, 255, 0.28);
}

.tag-combo__input {
  flex: 1 1 auto;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-ink);
  font-size: 14px;
  font-family: var(--font-body);
  padding: 2px 0;
}

.tag-combo__input::placeholder {
  color: var(--color-sub);
}

.tag-combo__list {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 20;
  max-height: 320px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: 16px;
  box-shadow: var(--shadow-card);
  padding: 6px;
  list-style: none;
  margin: 0;
}

.tag-combo__empty {
  padding: 12px 14px;
  color: var(--color-sub);
  font-size: 13px;
  text-align: center;
}

.tag-combo__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.tag-combo__option.is-active {
  background: var(--color-acc-soft);
}

.tag-combo__option-name {
  color: var(--color-ink);
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-combo__option-hash {
  color: var(--color-acc-ink);
  margin-right: 2px;
}

.tag-combo__option-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-sub);
  flex-shrink: 0;
}
</style>
