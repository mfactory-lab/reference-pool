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

import { resolve } from 'path';
import { defineConfig } from 'vite';
import { minifyHtml, injectHtml } from 'vite-plugin-html';
import Vue from '@vitejs/plugin-vue';
// import ViteLegacy from '@vitejs/plugin-legacy';
import ViteVisualizer from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {

  const isDev = mode === 'development';
  const isProd = mode === 'production';
  const isReport = mode === 'report';

  const plugins = [
    injectHtml({
      data: {
        title: 'JPool – Solana Stake Pool',
        description: 'JPool is a Stake Pool on the Solana blockchain ensuring high rewards at low risk level, while also providing a DeFi token.',
        keywords: 'Solana, DeFi, Stake pool, Proof of Stake, Blockchain, SOL',
      },
    }),
    minifyHtml({
      // collapseBooleanAttributes: true,
      // collapseWhitespace: true,
      // minifyCSS: true,
      // minifyJS: true,
      // minifyURLs: true,
      // removeAttributeQuotes: true,
      // removeComments: true,
      // removeEmptyAttributes: true,
      // html5: true,
      // keepClosingSlash: true,
      // removeRedundantAttributes: true,
      // removeScriptTypeAttributes: true,
      // removeStyleLinkTypeAttributes: true,
      // useShortDoctype: true,
    }),
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),
    // ViteComponents({
    //   customComponentResolvers: [resolveQuasar],
    // }
  ];

  const build = {
    manifest: false,
    cssCodeSplit: false, // true,
    polyfillDynamicImport: false,
    brotliSize: false,
    chunkSizeWarningLimit: 2000,
  };

  if (isProd) {
    build.manifest = true;

    // plugins.push(
    //   /**
    //    * DESC:
    //    * provides support for legacy browsers
    //    * that do not support native ESM
    //    */
    //   ViteLegacy({
    //     targets: [
    //       'defaults',
    //       'not IE 11',
    //     ],
    //   }),
    // );
  }

  if (isReport) {
    plugins.push(
      /**
       * DESC:
       * visualize bundle
       */
      ViteVisualizer({
        filename: './dist/report.html',
        open: true,
        brotliSize: true,
      }),
    );
  }

  let optimizeDeps = {};
  if (isDev) {
    /**
     * DESC:
     * dependency pre-bundling
     */
    optimizeDeps = {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'quasar',
        '@vueuse/core',
        '@vueuse/head',
      ],
      exclude: [
        'vue-demi',
      ],
    };
  }

  return {

    build,
    plugins,
    optimizeDeps,

    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/scss/_variables.scss";\n',
        },
      },
    },

    resolve: {
      alias: [
        {
          find: /~(.+)/,
          replacement: resolve('node_modules/$1'),
        },
        {
          find: '@/',
          replacement: `${resolve(__dirname, 'src')}/`,
        },
      ],
    },

    server: {
      fs: {
        strict: true,
      },
    },

    // https://github.com/antfu/vite-ssg
    // ssgOptions: {
    //   script: 'async',
    //   formatting: 'minify',
    // },

    define: {
      'process.env': process.env,
      global: 'window',
    },

  };
});
