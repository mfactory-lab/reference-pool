/*
 * This file is part of Solana Reference Stake Pool code.
 *
 * Copyright © 2021, mFactory GmbH
 *
 * Solana Reference Stake Pool is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * Solana Reference Stake Pool is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.
 * If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
 *
 * You can be released from the requirements of the Affero GNU General Public License
 * by purchasing a commercial license. The purchase of such a license is
 * mandatory as soon as you develop commercial activities using the
 * Solana Reference Stake Pool code without disclosing the source code of
 * your own applications.
 *
 * The developer of this program can be contacted at <info@mfactory.ch>.
 */

import type { BuildOptions, DepOptimizationOptions, PluginOption } from 'vite'
import { resolve } from 'node:path'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import { unheadVueComposablesImports } from '@unhead/vue'
import vue from '@vitejs/plugin-vue'
import visualizer from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig, loadEnv } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import Layouts from 'vite-plugin-vue-layouts'

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  const isProd = mode === 'production'
  const isReport = mode === 'report'

  const plugins: (PluginOption | PluginOption[])[] = [
    vue({
      include: [/\.vue$/, /\.md$/],
      template: { transformAssetUrls },
      // reactivityTransform: true,
    }),

    // https://github.com/posva/unplugin-vue-router
    VueRouter({
      extensions: ['.vue', '.md'],
      dts: 'types/typed-router.d.ts',
    }),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        'vue',
        '@vueuse/core',
        'vue-router',
        unheadVueComposablesImports,
        VueRouterAutoImports,
        {
          '@gtm-support/vue-gtm': ['useGtm'],
        },
      ],
      packagePresets: ['quasar'],
      dts: 'types/auto-imports.d.ts',
      dirs: [
        'src/hooks/**',
        'src/store/**',
      ],
      // ignore: [
      //   'useId',
      // ],
      vueTemplate: true,
      viteOptimizeDeps: true,
      injectAtEnd: true,
    }),

    quasar(),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts({
      importMode(name) {
        return name === 'home' ? 'sync' : 'async'
      },
    }),

    // https://github.com/davidmyersdev/vite-plugin-node-polyfills
    nodePolyfills(),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      extensions: ['vue', 'md'],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      dts: 'types/components.d.ts',
    }),
  ]

  const build: BuildOptions = {
    manifest: isProd,
    // sourcemap: false,
    // brotliSize: false,
    // cssCodeSplit: false,
    // polyfillDynamicImport: false,
    // assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      // plugins: [inject({ Buffer: ['buffer', 'Buffer'] })],
      // treeshake: true,
      // output: {
      //   manualChunks(id) {
      //     if (id.includes('/node_modules/')) {
      //       return 'vendors';
      //     }
      //   },
      // },
    },
  }

  if (isReport) {
    plugins.push(
      visualizer({
        filename: './dist/report.html',
        open: true,
        brotliSize: true,
      }),
    )
  }

  const optimizeDeps: DepOptimizationOptions = {
    include: [
      'vue',
      '@quasar/extras/eva-icons',
      'bn.js',
      'lodash-es',
    ],
    exclude: ['vue-demi'],
    esbuildOptions: {
      target: 'esnext',
    },
  }

  return {
    base: process.env.VITE_BASE_PATH,

    build,
    plugins,
    optimizeDeps,

    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "~/assets/scss/global.scss";`,
        },
      },
    },

    resolve: {
      // browser: true,
      // preferBuiltins: false,
      // dedupe: [
      //   'bn.js',
      //   'bs58',
      //   'lodash',
      //   'buffer',
      //   'buffer-layout',
      //   'eventemitter3',
      //   '@solana/web3.js',
      //   'buffer-layout',
      // ],
      dedupe: [
        'bn.js',
        'bs58',
        'lodash',
        'buffer-layout',
      ],
      alias: {
        'lodash': 'lodash-es',
        '~/': `${resolve(__dirname, 'src')}/`,
      },
    },

    define: {
      // 'process.env': process.env,
      // global: 'globalThis',
    },
  }
})
