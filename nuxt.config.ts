import AutoImport from 'unplugin-auto-import/vite'
import { defineNuxtConfig } from 'nuxt/config'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import ViteComponents from 'unplugin-vue-components/vite'
import { loadEnv } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '')

export default defineNuxtConfig({
  srcDir: 'src/',
  dir: {
    public: '../public',
  },
  ssr: env.NODE_ENV !== 'development',
  css: [
    'assets/styles/app.scss',
    'bootstrap/dist/css/bootstrap.min.css',
  ],
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  imports: {
    autoImport: true,
  },
  vite: {
    plugins: [
      // https://github.com/davidmyersdev/vite-plugin-node-polyfills
      nodePolyfills(),

      AutoImport({
        imports: [
          'vue',
          '@vueuse/core',
          VueRouterAutoImports,
          {
            '@gtm-support/vue-gtm': ['useGtm'],
            '@vueuse/core': ['isClient'],
          },
        ],
        dts: 'types/auto-imports.d.ts',
        dirs: [
          'hooks/**',
          'store/**',
        ],
        vueTemplate: true,
        viteOptimizeDeps: true,
        injectAtEnd: true,
      }),
      // https://github.com/antfu/unplugin-icons
      Icons({
        compiler: 'vue3',
        autoInstall: true,
        // transform(svg) {
        //   return svg.replace(/^<svg /, '<svg fill="currentColor" ')
        // },
        customCollections: {
          app: FileSystemIconLoader('./src/assets/img/icons'),
        },
        // iconCustomizer(collection, icon, props) {
        //   if (collection === 'app') {
        //     props.class = 'app-icon'
        //   }
        // },
      }),
      ViteComponents({
        resolvers: [
          IconsResolver({
            customCollections: ['app'],
          }),
        ],
        dts: true,
      }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "~/assets/styles/variables.scss";`, // global variables
        },
      },
    },
    resolve: {
      alias: {
        buffer: 'buffer',
      },
      dedupe: [
        'react',
        'react-dom',
        'bn.js',
        'bs58',
        'lodash',
        'buffer-layout',
      ],
    },
    optimizeDeps: {
      include: [
        'buffer',
        'lodash-es',
        // 'gsap/ScrollTrigger',
      ],
      // exclude: ['bootstrap-vue-next'],
    },
  },

  plugins: [
    // '~/plugins/gsap.ts',
    // '~/plugins/lotttie.ts',
  ],

  modules: [
    '@bootstrap-vue-next/nuxt',
    '@vueuse/nuxt',
    '@pinia/nuxt',
  ],

  runtimeConfig: {
    public: {
      BASE_PATH: env.NUXT_PUBLIC_BASE_PATH,
      PASSWORD_PROTECT: env.NUXT_PUBLIC_PASSWORD_PROTECT,

      GTM_ID: env.NUXT_PUBLIC_GTM_ID,
      APP_TITLE: env.NUXT_PUBLIC_APP_TITLE,
      APP_URL: env.NUXT_PUBLIC_APP_URL,
      APP_DESCRIPTION: env.NUXT_PUBLIC_APP_DESCRIPTION,
      APP_NAME: env.NUXT_PUBLIC_APP_NAME,

      APP_KEYWORDS: env.NUXT_PUBLIC_APP_KEYWORDS,

      XSOL_NAME: env.NUXT_PUBLIC_XSOL_NAME,

      APP_LOGO: env.NUXT_PUBLIC_APP_LOGO,
      XSOL_LOGO: env.NUXT_PUBLIC_XSOL_LOGO,
      NO_WALLET_ICON: env.NUXT_PUBLIC_NO_WALLET_ICON,

      TELEGRAM_ANNOUNCEMENT_URL: env.NUXT_PUBLIC_TELEGRAM_ANNOUNCEMENT_URL,
      COPYRIGHT_BY: env.NUXT_PUBLIC_COPYRIGHT_BY,
      COPYRIGHT: env.NUXT_PUBLIC_COPYRIGHT,
      POWERED_BY: env.NUXT_PUBLIC_POWERED_BY,
      POWERED_LINK: env.NUXT_PUBLIC_POWERED_LINK,
      FOOTER_LINKS: env.NUXT_PUBLIC_FOOTER_LINKS,
      // # Stake Pool configuration (see Documentation for details)
      MAIN_STAKE_POOL_ADDRESS: env.NUXT_PUBLIC_MAIN_STAKE_POOL_ADDRESS,
      TEST_STAKE_POOL_ADDRESS: env.NUXT_PUBLIC_TEST_STAKE_POOL_ADDRESS,
      DEV_STAKE_POOL_ADDRESS: env.NUXT_PUBLIC_DEV_STAKE_POOL_ADDRESS,
      MAIN_STAKE_LIMIT: env.NUXT_PUBLIC_MAIN_STAKE_LIMIT,
      TEST_STAKE_LIMIT: env.NUXT_PUBLIC_TEST_STAKE_LIMIT,
    },
  },
  // debug: true,
  nitro: {
    logLevel: 'debug',
    // preset: 'node',
    // devErrorHandler: true,
    // prerender: {
    //   failOnError: false,
    // },
  },
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      skipWaiting: true,
      clientsClaim: true,
      globPatterns: ['**/*.{js,css,webp,png,svg,gif,ico,html,json,txt}'],
      maximumFileSizeToCacheInBytes: 5_000_000,
      // runtimeCaching: [
      //   {
      //     urlPattern: /^https:\/\/www\.googletagmanager\.com\/gtm\.js/,
      //     handler: 'CacheFirst',
      //     options: {
      //       cacheName: 'gtm',
      //       expiration: {
      //         maxEntries: 30,
      //         maxAgeSeconds: 60 * 60 * 24 * 365, // 1 год
      //       },
      //       cacheableResponse: {
      //         statuses: [0, 200],
      //       },
      //     },
      //   },
      // ],
    },
    manifest: {
      name: env.NUXT_PUBLIC_APP_NAME ?? 'Reference Pool',
      short_name:
        env.NUXT_PUBLIC_APP_SHORT_NAME
        ?? env.NUXT_PUBLIC_APP_NAME
        ?? 'Reference Pool',
      description: env.NUXT_PUBLIC_APP_DESCRIPTION,
      theme_color: '#ffffff',
      display: 'standalone',
      icons: [
        {
          src: '/img/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/img/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/img/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    includeAssets: [
      '/img/apple-touch-icon.png',
      '/img/favicon.svg',
      '/img/favicon.ico',
      '/img/robots.txt',
    ],
  },

  devServer: {
    port: 3001,
  },

  app: {
    baseURL: env.NUXT_PUBLIC_BASE_URL || '/',

    head: {
      title: env.NUXT_PUBLIC_APP_TITLE ?? 'Reference Pool',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
      meta: [
        { name: 'description', content: env.NUXT_PUBLIC_APP_DESCRIPTION },
        // Open Graph tags (Facebook, Telegram, LinkedIn, etc.)
        { property: 'og:title', content: env.NUXT_PUBLIC_APP_TITLE },
        { property: 'og:description', content: env.NUXT_PUBLIC_APP_DESCRIPTION },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: env.NUXT_PUBLIC_APP_URL },
        {
          property: 'og:image',
          content: `${env.NUXT_PUBLIC_APP_URL}/og-image-1200x630.png`,
        },
      ],
      script: [
        // {
        //   innerHTML: `
        //     (function() {
        //       const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        //       const setting = localStorage.getItem('vueuse-color-scheme') || 'auto'
        //       const isDarkMode = setting === 'dark' || (prefersDark && setting !== 'light')
        //       document.body.classList.toggle('body--dark', isDarkMode)
        //       document.body.classList.toggle('body--light', !isDarkMode)
        //     })();
        //   `,
        //   type: 'text/javascript',
        //   body: true,
        // } as any,
      ],
    },
  },

  compatibilityDate: '2025-03-12',
})
