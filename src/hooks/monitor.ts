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

import { useQuasar } from 'quasar'
import { ref, toRef } from 'vue'
import type { Commitment } from '@solana/web3.js'
import { useConnectionStore } from '@/store'
import {
  DEFAULT_CONFIRM_TIMEOUT,
  DEFAULT_MONITOR_COMMITMENT,
  DEFAULT_SEND_TIMEOUT,
  TELEGRAM_ANNOUNCEMENT_URL,
} from '@/config'

interface MonitorTransactionParams {
  onSuccess?: (signature: string) => void
  onError?: (reason: string) => void
  commitment?: Commitment
  sendTimeout?: number
  confirmTimeout?: number
  idx?: string
}

export function useMonitorTransaction() {
  const connectionStore = useConnectionStore()
  const { notify } = useQuasar()

  const cluster = toRef(connectionStore, 'cluster')
  const sending = ref(false)

  async function monitorTransaction(
    signatureOrPromise: Promise<string> | string,
    {
      onSuccess,
      onError,
      idx,
      commitment = DEFAULT_MONITOR_COMMITMENT,
      sendTimeout = DEFAULT_SEND_TIMEOUT,
      confirmTimeout = DEFAULT_CONFIRM_TIMEOUT,
    }: MonitorTransactionParams = {},
  ): Promise<void> {
    idx = idx ?? ''

    let dismiss = notify({
      progress: true,
      type: 'ongoing',
      message: idx ? `Sending transaction "${idx}" ...` : 'Sending transaction...',
      timeout: sendTimeout,
    })

    sending.value = true

    const closeAction = {
      label: 'Close',
      color: 'white',
    }

    let signature = ''
    try {
      signature = String(await signatureOrPromise)
    } catch (e: any) {
      sending.value = false
      dismiss()
      if (!String(e?.message).startsWith('User rejected')) {
        notify({
          message: idx ? `Transaction "${idx}" error` : 'Transaction error',
          caption: e?.message,
          type: 'negative',
          timeout: 0,
          actions: [closeAction],
        })
      }
      return
    }

    // https://solscan.io/tx/{id}
    const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=${cluster.value}`

    const exploreAction = {
      label: 'Explore',
      color: 'white',
      target: '_blank',
      href: explorerUrl,
      onClick: () => false,
    }

    const telegramAction = {
      label: 'Telegram',
      color: 'white',
      target: '_blank',
      href: TELEGRAM_ANNOUNCEMENT_URL,
    }

    try {
      dismiss()

      dismiss = notify({
        // spinner: true,
        progress: true,
        type: 'ongoing',
        message: idx ? `Confirming transaction "${idx}" ...` : 'Confirming transaction...',
        actions: [exploreAction],
        timeout: confirmTimeout,
      })
      const res = await connectionStore.connection.confirmTransaction(signature, commitment)

      dismiss()

      if (res.value.err) {
        // console.error(res.value.err)
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(JSON.stringify(res.value.err))
      }

      dismiss = notify({
        message: idx ? `Transaction "${idx}" confirmed` : 'Transaction confirmed',
        type: 'positive',
        actions: [exploreAction],
      })

      if (onSuccess) {
        onSuccess(signature)
      }
    } catch (e: any) {
      dismiss()
      notify({
        message: idx ? `Transaction "${idx}" error` : 'Transaction error',
        caption: e.message,
        type: 'negative',
        timeout: 0,
        actions: [exploreAction, telegramAction, closeAction],
      })

      if (onError) {
        onError(e)
      }
      console.error(e)
    } finally {
      sending.value = false
    }
  }

  return { monitorTransaction, sending }
}
