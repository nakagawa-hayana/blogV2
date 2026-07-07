import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import type { Root as MdRoot, Text as MdText } from 'mdast'
import type { Root as HRoot, Element as HElement } from 'hast'
import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'
import githubDark from 'shiki/themes/github-dark.mjs'
import langTypescript from 'shiki/langs/typescript.mjs'
import langTsx from 'shiki/langs/tsx.mjs'
import langJson from 'shiki/langs/json.mjs'
import langBash from 'shiki/langs/bash.mjs'
import langShell from 'shiki/langs/shell.mjs'
import langPython from 'shiki/langs/python.mjs'
import langRust from 'shiki/langs/rust.mjs'
import langC from 'shiki/langs/c.mjs'
import langCpp from 'shiki/langs/cpp.mjs'
import langYaml from 'shiki/langs/yaml.mjs'
import langToml from 'shiki/langs/toml.mjs'
import langDiff from 'shiki/langs/diff.mjs'

const WIKI_LINK_RE = /!\[\[([^\]]+)\]\]/g

function remarkWikiLink() {
  return (tree: MdRoot) => {
    visit(tree, 'text', (node: MdText, index, parent) => {
      if (!parent || typeof index !== 'number') return
      const value = node.value
      if (!WIKI_LINK_RE.test(value)) return
      WIKI_LINK_RE.lastIndex = 0
      const newNodes: MdRoot['children'] = []
      let last = 0
      let m: RegExpExecArray | null
      while ((m = WIKI_LINK_RE.exec(value)) !== null) {
        if (m.index > last) {
          newNodes.push({ type: 'text', value: value.slice(last, m.index) })
        }
        const name = m[1]
        newNodes.push({
          type: 'image',
          url: `./images/${name}`,
          alt: name,
        })
        last = WIKI_LINK_RE.lastIndex
      }
      if (last < value.length) {
        newNodes.push({ type: 'text', value: value.slice(last) })
      }
      ;(parent as any).children.splice(index, 1, ...newNodes)
      return index + newNodes.length
    })
  }
}

function rehypeExternalLinks() {
  return (tree: HRoot) => {
    visit(tree, 'element', (node: HElement) => {
      if (node.tagName !== 'a') return
      const href = node.properties?.href
      if (typeof href !== 'string') return
      try {
        const url = new URL(href)
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          node.properties = {
            ...node.properties,
            target: '_blank',
            rel: 'noopener noreferrer',
          }
        }
      } catch {}
    })
  }
}

let highlighterPromise: Promise<HighlighterCore> | null = null
function loadHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [githubDark],
      langs: [
        langTypescript, langTsx, langJson,
        langBash, langShell, langPython, langRust,
        langC, langCpp, langYaml, langToml, langDiff,
      ],
      engine: createOnigurumaEngine(import('shiki/wasm')),
    })
  }
  return highlighterPromise
}

function extractCodeLanguage(node: HElement): string | null {
  const classes = node.properties?.className
  const arr = Array.isArray(classes) ? classes : []
  for (const c of arr) {
    if (typeof c === 'string' && c.startsWith('language-')) {
      return c.slice('language-'.length)
    }
  }
  return null
}

function extractText(node: any): string {
  if (node.type === 'text') return String(node.value ?? '')
  if (Array.isArray(node.children)) return node.children.map(extractText).join('')
  return ''
}

async function highlightCodeBlocks(tree: HRoot): Promise<void> {
  const targets: { node: HElement; lang: string; code: string }[] = []
  visit(tree, 'element', (node: HElement) => {
    if (node.tagName !== 'pre') return
    const child = node.children.find(c => (c as any).type === 'element') as HElement | undefined
    if (!child || child.tagName !== 'code') return
    const lang = extractCodeLanguage(child)
    if (!lang) return
    const code = extractText(child).replace(/\n$/, '')
    targets.push({ node, lang, code })
  })
  if (targets.length === 0) return
  const shiki = await loadHighlighter()
  for (const { node, lang, code } of targets) {
    const supported = shiki.getLoadedLanguages().includes(lang as any)
    const html = shiki.codeToHtml(code, {
      lang: supported ? lang : 'text',
      theme: 'github-dark',
    })
    ;(node as any).type = 'raw'
    ;(node as any).value = html
    ;(node as any).children = []
    ;(node as any).tagName = undefined
  }
}

export async function renderMarkdown(content: string): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkWikiLink)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeKatex)
    .use(rehypeExternalLinks)

  const mdast = processor.parse(content)
  const hast = await processor.run(mdast) as HRoot
  await highlightCodeBlocks(hast)
  const html = unified()
    .use(rehypeStringify, { allowDangerousHtml: true })
    .stringify(hast)
  return String(html)
}
