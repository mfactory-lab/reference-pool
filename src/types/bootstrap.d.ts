import 'bootstrap-vue-next'

declare module 'node_modules/bootstrap-vue-next/dist/src/types/ColorTypes' {
  // eslint-disable-next-line ts/consistent-type-definitions
  export interface BaseColorVariant {
    ['dark-gray']: unknown
    gray: unknown
  }
}
