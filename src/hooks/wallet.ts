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
import type { Adapter } from '@solana/wallet-adapter-base'
import type { PublicKey } from '@solana/web3.js'
import { Notify } from 'quasar'
import { useWallet } from 'solana-wallets-vue'
import { shortenAddress } from '~/utils'
import { useEmitter } from './emitter'

export const WALLET_CONNECT_EVENT = Symbol('WALLET_CONNECT_EVENT')
export const WALLET_DISCONNECT_EVENT = Symbol('WALLET_DISCONNECT_EVENT')
export const WALLET_ERROR_EVENT = Symbol('WALLET_ERROR_EVENT')
export const ACCOUNT_CHANGE_EVENT = Symbol('ACCOUNT_CHANGE_EVENT')

const NOTIFICATION_TIMEOUT = 5000

export function initWallet() {
  const { connection } = useConnectionStore()
  const { emit } = useEmitter()
  const { wallet, connected } = useWallet()

  // Map to track cleanup functions for each registered public key
  const cleanup = new Map<string, () => void>()

  function registerAccountChange(pk: PublicKey) {
    const key = String(pk)

    if (cleanup.has(key)) {
      // Listeners already registered for this public key
      return
    }

    // Listen for account changes
    const accountChangeListenerId = connection.onAccountChange(pk, (accountInfo) => {
      console.log('ACCOUNT_CHANGE_EVENT', accountInfo)
      emit(ACCOUNT_CHANGE_EVENT, accountInfo)
    })

    // Listen for logs related to the public key
    const logsListenerId = connection.onLogs(pk, (logs) => {
      console.log('LOGS_EVENT', logs)
    })

    // Store the cleanup function for future reference
    cleanup.set(key, () => {
      connection.removeAccountChangeListener(accountChangeListenerId).then()
      connection.removeOnLogsListener(logsListenerId).then()
      cleanup.delete(key)
    })
  }

  function unregisterAccountChange() {
    for (const [, fn] of cleanup) {
      fn()
    }
    cleanup.clear()
  }

  /**
   * Handles wallet connection events.
   * Displays a notification and emits a connect event.
   * @param adapter WalletAdapter instance
   */
  const handleConnect = (adapter: Adapter) => {
    const pk = adapter.publicKey
    if (!pk) {
      return
    }
    Notify.create({
      message: 'Wallet Update',
      caption: `Connected to wallet ${shortenAddress(String(pk), 7)}`,
      timeout: NOTIFICATION_TIMEOUT,
    })
    emit(WALLET_CONNECT_EVENT, adapter)
  }

  /**
   * Handles wallet disconnection events.
   * Displays a notification and emits a disconnect event.
   * @param adapter WalletAdapter instance
   */
  const handleDisconnect = (adapter: Adapter) => {
    Notify.create({
      message: 'Wallet Update',
      caption: 'Disconnected from wallet',
      timeout: NOTIFICATION_TIMEOUT,
    })
    emit(WALLET_DISCONNECT_EVENT, adapter)
  }

  /**
   * Handles wallet error events.
   * Logs the error to the console.
   * @param error Error object
   */
  const handleError = (error: Error) => {
    if (!error.message) {
      return
    }
    console.error('Wallet Error:', error.message)
    // Notify.create({
    //   type: 'negative',
    //   message: 'Wallet Error',
    //   caption: error.message,
    //   timeout: NOTIFICATION_TIMEOUT,
    // })
    emit(WALLET_ERROR_EVENT, error)
  }

  watch(connected, useDebounceFn((connected) => {
    if (!wallet.value) {
      return
    }
    const { adapter } = wallet.value
    if (connected) {
      handleConnect(adapter)
      if (adapter.publicKey) {
        registerAccountChange(adapter.publicKey)
      }
      adapter.once('disconnect', () => {
        unregisterAccountChange()
        handleDisconnect(adapter)
      })
      adapter.removeAllListeners('error')
      adapter.on('error', handleError)
    }
  }, 500), { immediate: true })
}
