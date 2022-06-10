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
import { useWallet } from 'solana-wallets-vue'
import { watch } from 'vue'
import { useEmitter } from '@/hooks/emitter'
import { useConnectionStore } from '@/store'
import { shortenAddress } from '@/utils'

export const WALLET_CONNECT_EVENT = Symbol('WALLET_CONNECT_EVENT')
export const WALLET_DISCONNECT_EVENT = Symbol('WALLET_DISCONNECT_EVENT')
export const ACCOUNT_CHANGE_EVENT = Symbol('ACCOUNT_CHANGE_EVENT')

const noticeTimeout = 5000

export function initWallet() {
  const { connection } = useConnectionStore()
  const { emit } = useEmitter()
  const { notify } = useQuasar()
  const { wallet } = useWallet()

  watch(
    wallet,
    (w) => {
      if (!w) {
        return
      }

      const onConnect = () => {
        const publicKey = w.publicKey!
        connection.onAccountChange(publicKey, (acc) => {
          emit(ACCOUNT_CHANGE_EVENT, acc)
        })
        connection.onLogs(publicKey, (logs) => {
          console.log(logs)
        })
        notify({
          message: 'Wallet update',
          caption: `Connected to wallet ${shortenAddress(publicKey.toBase58(), 7)}`,
          timeout: noticeTimeout,
        })
        emit(WALLET_CONNECT_EVENT, w)
      }

      const onDisconnect = () => {
        notify({
          message: 'Wallet update',
          caption: 'Disconnected from wallet',
          timeout: noticeTimeout,
        })
        emit(WALLET_DISCONNECT_EVENT, w)
      }

      const onError = (e) => {
        if (!e?.message) {
          return
        }
        notify({
          type: 'negative',
          message: 'Wallet update',
          caption: e.message,
          timeout: noticeTimeout,
        })
      }

      w.once('connect', onConnect)
      w.once('disconnect', onDisconnect)

      w.removeAllListeners('error')
      w.on('error', onError)
    },
    { immediate: true },
  )
}
