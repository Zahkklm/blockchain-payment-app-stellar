import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import inject from '@rollup/plugin-inject'
import path from 'path'

export default defineConfig({
    plugins: [sveltekit()],
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    buffer: true,
                }),
            ],
        },
    },
    build: {
        rollupOptions: {
            plugins: [
                inject({
                    window: path.resolve('src/lib/window.js'),
                }),
            ],
        },
        commonjsOptions: { transformMixedEsModules: true },
    },
    ssr: {
        noExternal: ['@stellar/typescript-wallet-sdk-km', '@albedo-link/intent'],
    },
})
