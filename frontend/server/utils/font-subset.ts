// @ts-expect-error – nitro resolves wasm as module
import hbSubsetWasm from 'harfbuzzjs/hb-subset.wasm'

interface HbExports {
  memory: WebAssembly.Memory
  malloc(size: number): number
  free(ptr: number): void
  hb_blob_create(data: number, length: number, mode: number, userData: number, destroy: number): number
  hb_blob_destroy(blob: number): void
  hb_blob_get_data(blob: number, length: number): number
  hb_blob_get_length(blob: number): number
  hb_face_create(blob: number, index: number): number
  hb_face_destroy(face: number): void
  hb_face_reference_blob(face: number): number
  hb_set_add(set: number, codepoint: number): void
  hb_set_clear(set: number): void
  hb_set_invert(set: number): void
  hb_subset_input_create_or_fail(): number
  hb_subset_input_destroy(input: number): void
  hb_subset_input_set(input: number, setType: number): number
  hb_subset_input_unicode_set(input: number): number
  hb_subset_or_fail(face: number, input: number): number
}

let hbPromise: Promise<HbExports> | null = null

async function loadHb(): Promise<HbExports> {
  if (hbPromise) return hbPromise
  hbPromise = (async () => {
    const mod = (hbSubsetWasm as any) instanceof WebAssembly.Module
      ? (hbSubsetWasm as WebAssembly.Module)
      : await WebAssembly.compile(hbSubsetWasm as any)
    const instance = await WebAssembly.instantiate(mod, {})
    return instance.exports as unknown as HbExports
  })()
  return hbPromise
}

export async function subsetTtf(originalFont: ArrayBuffer, text: string): Promise<Uint8Array> {
  const hb = await loadHb()

  const input = hb.hb_subset_input_create_or_fail()
  if (input === 0) throw new Error('hb_subset_input_create_or_fail returned zero')

  const fontBuffer = hb.malloc(originalFont.byteLength)
  new Uint8Array(hb.memory.buffer).set(new Uint8Array(originalFont), fontBuffer)

  const blob = hb.hb_blob_create(fontBuffer, originalFont.byteLength, 2, 0, 0)
  const face = hb.hb_face_create(blob, 0)
  hb.hb_blob_destroy(blob)

  const layoutFeatures = hb.hb_subset_input_set(input, 6)
  hb.hb_set_clear(layoutFeatures)
  hb.hb_set_invert(layoutFeatures)

  const inputUnicodes = hb.hb_subset_input_unicode_set(input)
  for (const c of text) {
    const cp = c.codePointAt(0)
    if (typeof cp === 'number') hb.hb_set_add(inputUnicodes, cp)
  }

  const subset = hb.hb_subset_or_fail(face, input)
  hb.hb_subset_input_destroy(input)
  if (subset === 0) {
    hb.hb_face_destroy(face)
    hb.free(fontBuffer)
    throw new Error('hb_subset_or_fail returned zero')
  }

  const result = hb.hb_face_reference_blob(subset)
  const offset = hb.hb_blob_get_data(result, 0)
  const length = hb.hb_blob_get_length(result)
  const out = new Uint8Array(new Uint8Array(hb.memory.buffer).slice(offset, offset + length))

  hb.hb_blob_destroy(result)
  hb.hb_face_destroy(subset)
  hb.hb_face_destroy(face)
  hb.free(fontBuffer)

  return out
}

const subsetCache = new Map<string, Uint8Array>()

export async function getSubsettedFont(fullFont: ArrayBuffer, text: string): Promise<Uint8Array> {
  const uniq = Array.from(new Set(text.split(''))).sort().join('')
  const cached = subsetCache.get(uniq)
  if (cached) return cached
  const sub = await subsetTtf(fullFont, uniq)
  if (subsetCache.size > 32) {
    const firstKey = subsetCache.keys().next().value
    if (firstKey !== undefined) subsetCache.delete(firstKey)
  }
  subsetCache.set(uniq, sub)
  return sub
}
