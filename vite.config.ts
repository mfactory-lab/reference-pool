/* This file is part of Solana Reference Stake Pool code.
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

import { resolve } from 'path'
import type { BuildOptions, DepOptimizationOptions } from 'vite'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import Vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const isProd = mode === 'production'

  // TODO: fix
  const base = isProd ? '/reference-pool/' : '/'

  const plugins = [
    createHtmlPlugin({
      minify: true,
      entry: 'src/main.ts',
      inject: {
        data: {
          title: 'xPool – Solana Stake Pool',
          description:
            'xPool is a Stake Pool on the Solana blockchain ensuring high rewards at low risk level, while also providing a DeFi token.',
          keywords: 'Solana, DeFi, Stake pool, Proof of Stake, Blockchain, SOL',
        },
      },
    }),
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),
  ]

  const build: BuildOptions = {
    manifest: false,
    cssCodeSplit: false, // true,
    sourcemap: false,
    polyfillDynamicImport: false,
    brotliSize: false,
    chunkSizeWarningLimit: 2000, // 550
    assetsInlineLimit: 4096,
    minify: 'terser',
    terserOptions: {
      compress: {
        // drop_console: true,
        drop_debugger: true,
      },
    },
  }

  if (isProd) {
    build.manifest = true
  }

  let optimizeDeps: DepOptimizationOptions = {}

  if (isDev) {
    optimizeDeps = {
      include: ['quasar', 'lodash', '@vue/runtime-core', '@vueuse/core', '@vueuse/head'],
      exclude: ['vue-demi'],
    }
  }

  return {
    base,

    build,
    plugins,
    optimizeDeps,

    css: {
      preprocessorOptions: {
        scss: {
          charset: false,
          additionalData: '@import "@/assets/scss/_variables.scss";\n',
        },
        // TODO https://github.com/vitejs/vite/issues/5833
        charset: false,
      },
    },

    resolve: {
      alias: [
        {
          find: /~(.+)/,
          replacement: resolve('node_modules/$1'),
        },
        { find: '@', replacement: resolve(__dirname, './src') },
      ],
    },

    server: {
      fs: {
        strict: true,
      },
    },

    // support node libraries
    define: {
      'process.env': process.env,
      'global': 'window',
    },
  }
})
