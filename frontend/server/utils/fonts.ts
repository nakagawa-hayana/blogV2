const FONT_SOURCES: Record<string, string> = {
  'zen-maru-gothic-700':
    'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/zenmarugothic/ZenMaruGothic-Bold.ttf',
  'dm-mono-500':
    'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/dmmono/DMMono-Medium.ttf',
}

const fontCache = new Map<string, ArrayBuffer>()

export async function getFont(key: keyof typeof FONT_SOURCES | string): Promise<ArrayBuffer> {
  const cached = fontCache.get(key)
  if (cached) return cached
  const url = FONT_SOURCES[key]
  if (!url) throw new Error(`Unknown font key: ${key}`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch font ${key}: ${res.status}`)
  const buf = await res.arrayBuffer()
  fontCache.set(key, buf)
  return buf
}
