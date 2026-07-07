import { Resvg, initWasm } from '@resvg/resvg-wasm'
// @ts-expect-error – nitro resolves wasm as module
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm'

let initPromise: Promise<void> | null = null

async function ensureInit(): Promise<void> {
  if (initPromise) return initPromise
  initPromise = (async () => {
    try {
      await initWasm(resvgWasm as WebAssembly.Module)
    } catch (e) {
      const msg = String((e as Error).message || e)
      if (!/already initialized/i.test(msg)) throw e
    }
  })()
  return initPromise
}

export async function svgToPng(svg: string, width = 1200): Promise<Uint8Array> {
  await ensureInit()
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: false },
  })
  const png = resvg.render().asPng()
  return png
}
