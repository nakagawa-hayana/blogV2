// Workers-safe replacement for `yoga-layout/load`.
//
// The upstream `yoga-layout/load` calls an Emscripten module that decodes an
// embedded base64 wasm blob and hands the bytes to `WebAssembly.instantiate()`.
// Cloudflare Workers refuse to compile wasm from bytes at runtime, so we
// ship the same bytes as a separate `.wasm` file (Nitro/Wrangler emit it as a
// CompiledWasm binding) and drive Emscripten's `instantiateWasm` hook to use
// `new WebAssembly.Instance(module, imports)` against that pre-compiled module.

// @ts-expect-error – untyped emscripten factory
import loadYogaImpl from './yoga-wasm-factory.js'
// @ts-expect-error – no types for wrapAssembly.js
import wrapAssembly from './yoga-wrap-assembly.js'
// @ts-expect-error – nitro resolves .wasm as a compiled module
import yogaWasm from '../assets/yoga.wasm'

export async function loadYoga(): Promise<any> {
  const mod = yogaWasm as unknown as WebAssembly.Module
  const overrides = {
    instantiateWasm(
      imports: WebAssembly.Imports,
      successCallback: (instance: WebAssembly.Instance, module: WebAssembly.Module) => void,
    ) {
      const instance = new WebAssembly.Instance(mod, imports)
      successCallback(instance, mod)
      return instance.exports
    },
  }
  const impl = await loadYogaImpl(overrides)
  return wrapAssembly(impl)
}
