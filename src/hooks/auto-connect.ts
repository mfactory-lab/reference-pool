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

import type { WalletName } from '@solana/wallet-adapter-base'
import { PhantomWalletName, SolflareWalletName } from 'wallets'
import { OKXWalletName } from 'wallets/adapters/OkxWalletAdapter'

export function useAutoConnect() {
  const route = useRoute()

  const walletName = useLocalStorage('walletName', '')
  const { userAgent, isWebView, isMobileOs } = useMobileDetect()

  const wallet = useClientWallet()
  const webViewWallet = ref<WalletName | null>(null)

  function detectWebViewWallet() {
    const ua = String(userAgent.value).toLowerCase()
    if (ua.includes('phantom')) {
      return PhantomWalletName
      // @ts-expect-error...
    } else if (globalThis.solflare) {
      return SolflareWalletName
    } else if (/okapp/i.test(ua)) {
      return OKXWalletName
    }
    return null
  }

  onMounted(() => {
    if (isWebView.value) {
      webViewWallet.value = detectWebViewWallet()
    }
  })

  watch(() => route.query?.wallet, (w) => {
    if (w) {
      webViewWallet.value = w as WalletName
    }
  }, { immediate: true })

  watch(webViewWallet, async (w) => {
    if (w) {
      await autoConnect()
    }
  }, { immediate: true })

  async function autoConnect() {
    if (webViewWallet.value) {
      wallet?.select(webViewWallet.value)
      await wallet?.connect()
      return
    }

    if (wallet && !isMobileOs.value && walletName.value && walletName.value?.length !== 0) {
      wallet?.select(walletName.value as WalletName)
      await wallet?.connect()
    }
  }

  return {
    autoConnect,
    webViewWallet,
  }
}
