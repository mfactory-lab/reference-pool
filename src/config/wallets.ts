import type { Wallet } from '@solana/wallet-adapter-vue'
import cloverSvg from '~/assets/img/wallets/clover.svg'
import ledgerDarkSvg from '~/assets/img/wallets/ledger.svg'
import mathWalletDarkSvg from '~/assets/img/wallets/mathwallet.svg'

export const walletOpts: Record<string, WalletOpts> = {
  phantom: {
    priority: 20,
    deepLink: 'https://phantom.app/ul/browse/{uri}?ref={ref}',
  },
  solflare: {
    priority: 20,
    deepLink: 'solflare://ul/v1/browse/{uri}?ref={ref}',
  },
  okxWallet: {
    deepLink: 'okx://wallet/dapp/details?dappUrl={host}',
    priority: 5,
  },
  bitget: {
    deepLink: 'https://bkcode.vip?action=dapp&url={uri}',
    priority: 5,
  },
  walletConnect: {
    priority: 10,
  },
  mathWallet: {
    lightIcon: mathWalletDarkSvg,
  },
  ledger: {
    priority: 2,
    lightIcon: ledgerDarkSvg,
  },
  clover: {
    icon: cloverSvg,
  },
  brave: {
    priority: 5,
  },
  backpack: {
    priority: 5,
  },
  coinbase: {
    deepLink: 'https://go.cb-w.com/dapp?cb_url={uri}',
    priority: 5,
  },
  tokenPocket: {
    deepLink: `tpdapp://open?params=${
      JSON.stringify({
        url: '{url}',
        chain: 'Solana',
        source: '{url}',
      })}`,
    priority: 5,
  },
}

export type WalletOpts = {
  priority?: number
  icon?: string
  lightIcon?: string
  darkIcon?: string
  deepLink?: string
}

export type ExtendedWallet = Wallet & WalletOpts
