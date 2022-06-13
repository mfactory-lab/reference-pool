/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: 'production' | 'development' | 'staging'

  readonly VITE_APP_TITLE: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_APP_KEYWORDS: string
  readonly VITE_PASSWORD_PROTECT: string
  readonly VITE_GTAG_ID: string
}
