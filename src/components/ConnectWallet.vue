<!--
  - This file is part of Solana Reference Stake Pool code.
  -
  - Copyright © 2021, mFactory GmbH
  -
  - Solana Reference Stake Pool is free software: you can redistribute it
  - and/or modify it under the terms of the GNU Affero General Public License
  - as published by the Free Software Foundation, either version 3
  - of the License, or (at your option) any later version.
  -
  - Solana Reference Stake Pool is distributed in the hope that it
  - will be useful, but WITHOUT ANY WARRANTY; without even the implied
  - warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  - See the GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program.
  - If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
  -
  - You can be released from the requirements of the Affero GNU General Public License
  - by purchasing a commercial license. The purchase of such a license is
  - mandatory as soon as you develop commercial activities using the
  - Solana Reference Stake Pool code without disclosing the source code of
  - your own applications.
  -
  - The developer of this program can be contacted at <info@mfactory.ch>.
  -->

<script setup lang="ts">
import type { Wallet } from '@solana/wallet-adapter-vue'
import { WalletReadyState } from '@solana/wallet-adapter-base'

import camelCase from 'lodash-es/camelCase'
import type { ExtendedWallet } from '~/config/wallets'
import { walletOpts } from '~/config/wallets'
import { shortenAddress } from '~/utils'

defineProps<{
  className?: string
  withIcon?: boolean
}>()

const recommended = new Set(['Solflare', 'Phantom'])

const { width } = useWindowSize()

const { webViewWallet } = useAutoConnect()
const { isWebView, isMobileOs } = useMobileDetect()
const isMobile = computed(() => isMobileOs.value && !isWebView.value)

const balanceStore = useBalanceStore()

const wallet = useClientWallet()

const dialog = ref(false)
const connectingTimer = ref<any>(0)

const isConnecting = computed(() => !!wallet?.connecting.value)

function isActiveWallet(w: Wallet) {
  return w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable
}

function isMobileRelevant(w: ExtendedWallet) {
  return isMobile.value && (w.deepLink || w.adapter.name === 'WalletConnect')
}

function cancelTimer() {
  if (connectingTimer.value > 0) {
    clearTimeout(connectingTimer.value)
  }
}

async function select(w: Wallet) {
  cancelTimer()
  await wallet?.select(w.adapter.name)
  dialog.value = false
  connectingTimer.value = setTimeout(() => {
    if (wallet && wallet?.connecting) {
      wallet.connecting.value = false
    }
  }, 10_000)
  await wallet?.connect()
}

const walletAddress = computed(() => wallet?.publicKey.value?.toBase58() ?? '')
const walletShortAddress = computed(() => shortenAddress(walletAddress.value, 5))
const wallets = computed<ExtendedWallet[]>(() =>
  [...wallet?.wallets.value as ExtendedWallet[]]
    ?.map((w) => {
      const key = camelCase(w.adapter.name)
      if (walletOpts[key]?.icon) {
        w.adapter.icon = walletOpts[key].icon
      }
      // if (!isDark.value && walletOpts[key]?.lightIcon) {
      //   w.adapter.icon = walletOpts[key].lightIcon
      // }
      // if (isDark.value && walletOpts[key]?.darkIcon) {
      //   w.adapter.icon = walletOpts[key].darkIcon
      // }
      // only show deep links on mobile
      if (isMobile.value && walletOpts[key]?.deepLink) {
        w.deepLink = walletOpts[key].deepLink
          .replace('{uri}', encodeURIComponent(`${location.href}?wallet=${w.adapter.name}`))
          .replace('{ref}', encodeURIComponent(location.origin))
          .replace('{host}', location.host)
      }
      return w
    })
    .sort((a, b) => {
      const aPriority = walletOpts[camelCase(a.adapter.name)]?.priority ?? 1
      const bPriority = walletOpts[camelCase(b.adapter.name)]?.priority ?? 1
      return (
        bPriority
        - aPriority
        + ((isActiveWallet(b) ? 1 : 0) - (isActiveWallet(a) ? 1 : 0))
      )
    }),
)

const computedWallets = computed(() => {
  return wallets.value?.reduce((acc: { installed: ExtendedWallet[], others: ExtendedWallet[] }, w) => {
    const isWebViewMatch = !webViewWallet.value || w.adapter.name === webViewWallet.value

    const isInstalled = recommended.has(w.adapter.name)
      || w.readyState === WalletReadyState.Installed
      || (isMobile.value && w.deepLink)

    if (isWebViewMatch && (isMobile.value ? isMobileRelevant(w) : true)) {
      if (isInstalled) {
        acc.installed.push(w)
      } else {
        acc.others.push(w)
      }
    }
    return acc
  }, { installed: [], others: [] })
})

watch(() => wallet?.publicKey.value, (pubkey) => {
  if (pubkey) {
    cancelTimer()

    let hasTriggered = false
    let stopWatcher: (() => void) | null = null

    const debouncedHandler = useDebounceFn(() => {
      if (balanceStore.tokenBalance !== null && balanceStore.solBalance !== null && !hasTriggered) {
        hasTriggered = true

        if (stopWatcher) {
          stopWatcher()
        }
      }
    }, 300)

    stopWatcher = watch(
      [() => balanceStore.tokenBalance, () => balanceStore.solBalance],
      debouncedHandler,
      { flush: 'post' },
    )
  }
}, { immediate: true })

function show() {
  dialog.value = true
}

function disconnect() {
  wallet?.disconnect()
  dialog.value = false
}
</script>

<template>
  <j-btn
    :class="className"
    :loading="isConnecting"
    size="sm"
    pill
    variant="primary"
    class="connect-wallet"
    @click="show"
  >
    <span v-if="wallet?.publicKey.value">{{ walletShortAddress }}</span>
    <span v-else>Connect wallet</span>
  </j-btn>

  <j-dialog
    v-if="wallet?.publicKey.value"
    v-model="dialog"
    :title="!wallet?.publicKey.value ? 'Connect wallet' : 'Disconnect Wallet'"
    class-name="connect-wallet-dialog"
  >
    <div class="disconnect-wrapper">
      <div class="wallet-address">
        <template v-if="width > 650">
          {{ wallet?.publicKey.value }}
        </template>
        <template v-else>
          {{ shortenAddress(String(wallet?.publicKey.value), 15) }}
        </template>
        <copy-to-clipboard :value="wallet?.publicKey.value" />
      </div>
      <div class="disconnect-actions">
        <j-btn pill variant="primary" @click="disconnect">
          Disconnect
        </j-btn>
        <j-btn pill variant="primary" @click="dialog = false">
          ok
        </j-btn>
      </div>
    </div>
  </j-dialog>

  <j-dialog
    v-else
    v-model="dialog"
    :title="!wallet?.publicKey.value ? 'Connect wallet' : 'Disconnect Wallet'"
    class-name="connect-wallet-dialog"
  >
    <div class="wallets-wrapper">
      <span class="wallets-wrapper__title">Recommended wallets</span>

      <div v-if="computedWallets?.installed" class="wallets">
        <div v-for="w in computedWallets.installed" :key="w.adapter.name" class="wattet-item" @click="select(w)">
          <img :src="w.adapter.icon" alt="wallet icon">
          {{ w.adapter.name }}
        </div>
      </div>

      <j-accordion title="More wallets">
        <div v-if="computedWallets?.others" class="wallets">
          <div v-for="w in computedWallets.others" :key="w.adapter.name" class="wattet-item" @click="select(w)">
            <img :src="w.adapter.icon" alt="wallet icon">
            {{ w.adapter.name }}
          </div>
        </div>
      </j-accordion>
    </div>
  </j-dialog>
</template>

<style lang="scss" scoped>
.connect-wallet {
  white-space: nowrap;
  margin-left: -30px;
  padding-left: 40px;
  text-transform: uppercase;
  height: 38px;
  color: #455a64;
  font-size: 14px;
  height: 38px;
  font-weight: 400;

  @media (max-width: $breakpoint-sm) {
    margin-left: 0;
    padding-left: 16px;
  }
}

.connect-wallet-dialog {
  z-index: 9999 !important;
  .modal-dialog {
    width: 100%;
    width: fit-content;
  }

  .disconnect-wrapper {
    display: flex;
    flex-direction: column;

    .wallet-address {
      display: flex;
      align-items: center;
      gap: 12px;

      @media (max-width: $breakpoint-xs) {
        font-size: 14px;
      }
    }

    .disconnect-actions {
      display: flex;
      justify-content: space-between;
      padding-top: 24px;
    }
  }

  .wallets-wrapper {
    display: flex;
    flex-direction: column;

    & > .wallets {
      border-bottom: 1px solid $graySuperLight;
      padding-bottom: 24px;
    }

    &__title {
      font-size: 16px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px;
      padding-bottom: 24px;
      color: $neutral-600;
    }

    .wallets {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .wattet-item {
      padding: 12px;
      border-radius: 12px;
      background-color: $graySuperLight;
      flex-basis: calc(50% - 6px);
      font-size: 16px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      border: 1px solid transparent;

      @media (max-width: $breakpoint-xs) {
        font-size: 14px;
      }

      &:hover {
        border-color: $neutral-200;
      }

      img {
        width: 44px;
        height: 44px;
        object-fit: contain;

        @media (max-width: $breakpoint-xs) {
          width: 32px;
          height: 32px;
        }
      }
    }

    .j-accordion {
      border: none;
    }

    .accordion-button {
      color: $neutral-600;
      font-size: 16px;
      font-weight: 500;
      line-height: 20px;
      padding: 24px 0;

      svg path {
        stroke: $neutral-300;
      }
    }

    .accordion-body {
      padding-bottom: 0;
    }
  }
}
</style>
