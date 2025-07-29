export default defineNitroConfig({
    experimental: {
      wasm: false
    },
    rollupConfig: {
      external: ['node:fs', 'node:path', 'node:process', 'node:buffer', 'node:util', 'node:url', 'node:net']
    }
  })