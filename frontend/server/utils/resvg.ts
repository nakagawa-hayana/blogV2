import { Resvg, initWasm } from '@resvg/resvg-wasm'
// @ts-expect-error – nitro resolves wasm as module
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm'

let initPromise: Promise<void> | null = null

async function ensureInit(): Promise<void> {
  if (initPromise) return initPromise
  initPromise = (async () => {
    const origInstantiate = WebAssembly.instantiate
    ;(WebAssembly as any).instantiate = function (source: any, imports: any) {
      if (source instanceof WebAssembly.Module) {
        return Promise.resolve(new WebAssembly.Instance(source, imports))
      }
      return origInstantiate.call(WebAssembly, source, imports)
    }
    try {
      const mod = (resvgWasm as any) instanceof WebAssembly.Module
        ? (resvgWasm as WebAssembly.Module)
        : await WebAssembly.compile(resvgWasm as any)
      await initWasm(mod)
    }
    catch (e) {
      const msg = String((e as Error).message || e)
      if (!/already initialized/i.test(msg)) throw e
    }
    finally {
      ;(WebAssembly as any).instantiate = origInstantiate
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
