<script setup lang="ts">
import { renderMarkdown } from '~/lib/markdown'

const props = defineProps<{
  content: string
  cacheKey: string
}>()

const { data: html } = useLazyAsyncData<string>(
  `md:${props.cacheKey}`,
  () => renderMarkdown(props.content),
  { default: () => '', watch: [() => props.cacheKey] },
)
</script>

<template>
  <div
    class="markdown-body prose prose-slate max-w-none"
    v-html="html"
  />
</template>

<style>
.markdown-body {
  color: var(--color-ink);
  font-size: 15px;
  line-height: 1.85;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4 {
  font-family: var(--font-heading);
  color: var(--color-ink);
  letter-spacing: 0.02em;
}

.markdown-body h2 {
  margin-top: 2.4em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--color-line);
}

.markdown-body a {
  color: var(--color-acc-ink);
  border-bottom: 1px solid var(--color-acc-soft);
}
.markdown-body a:hover {
  background: var(--color-acc-soft);
}

.markdown-body code {
  font-family: var(--font-mono);
  font-size: 0.88em;
  background: var(--color-acc-soft);
  color: var(--color-acc-ink);
  padding: 0.15em 0.4em;
  border-radius: 4px;
}

.markdown-body pre {
  padding: 16px 18px;
  border-radius: 12px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.6;
  margin: 1.5em 0;
}

.markdown-body pre code {
  background: transparent;
  color: inherit;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
}

.markdown-body blockquote {
  border-left: 3px solid var(--color-acc);
  background: var(--color-acc-soft);
  margin: 1.5em 0;
  padding: 0.8em 1.2em;
  border-radius: 0 12px 12px 0;
  color: var(--color-ink);
}

.markdown-body img {
  border-radius: 12px;
  max-width: 100%;
  height: auto;
  margin: 1.2em auto;
}

.markdown-body table {
  border-collapse: collapse;
  margin: 1.5em 0;
  width: 100%;
  font-size: 14px;
}
.markdown-body th, .markdown-body td {
  border: 1px solid var(--color-line);
  padding: 8px 12px;
  text-align: left;
}
.markdown-body th {
  background: var(--color-acc-soft);
  color: var(--color-acc-ink);
  font-weight: 700;
}

.markdown-body hr {
  border: 0;
  border-top: 1px solid var(--color-line);
  margin: 2.4em 0;
}

.markdown-body ul, .markdown-body ol {
  padding-left: 1.6em;
  margin: 1em 0;
}
.markdown-body li { margin: 0.4em 0; }
</style>
