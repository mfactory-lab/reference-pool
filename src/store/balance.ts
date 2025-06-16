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

// eslint-disable-next-line unicorn/prefer-node-protocol
import type { Buffer } from 'buffer'
import type { AccountInfo } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import debounce from 'lodash-es/debounce'
import { defineStore } from 'pinia'
import { getTokenBalance, lamportsToSol } from '~/utils'

const ACCOUNT_CHANGE_DEBOUNCE = 500

export const useBalanceStore = defineStore('balance', () => {
  const connectionStore = useConnectionStore()
  const stakePoolStore = useStakePoolStore()
  const wallet = useClientWallet()
  const emitter = useEmitter()

  const nativeBalance = ref(0)
  const hasTokenAccount = ref<boolean>(false)
  const tokenBalanceLoading = ref<boolean>(false)
  const tokenBalance = ref(0)

  const stakePool = computed(() => stakePoolStore.stakePool)

  const solBalance = computed(() => lamportsToSol(nativeBalance.value))

  async function _getTokenBalance() {
    if (!wallet?.publicKey.value || !stakePool.value?.poolMint) {
      return
    }
    tokenBalanceLoading.value = true
    const balance = await getTokenBalance(
      connectionStore.connection,
      wallet?.publicKey.value,
      new PublicKey(stakePool.value?.poolMint),
    )
    hasTokenAccount.value = balance !== null
    tokenBalance.value = balance ?? 0
    tokenBalanceLoading.value = false
    console.log('[Balance] JSOL:', tokenBalance.value)
  }

  const _onAccountChange = debounce(async (acc: AccountInfo<Buffer> | null) => {
    nativeBalance.value = acc?.lamports ?? 0
    console.log('[Balance] SOL:', nativeBalance.value)
    await _getTokenBalance()
  }, ACCOUNT_CHANGE_DEBOUNCE)

  const _onDisconnect = () => {
    tokenBalanceLoading.value = false
    nativeBalance.value = 0
    tokenBalance.value = 0
  }

  if (import.meta.client) {
    emitter.on(ACCOUNT_CHANGE_EVENT, _onAccountChange)
    emitter.on(WALLET_DISCONNECT_EVENT, _onDisconnect)

    watch(
      () => wallet?.publicKey.value,
      (pk) => {
        if (pk) {
          connectionStore.connection.getAccountInfo(pk).then(_onAccountChange)
          tokenBalanceLoading.value = true
        }
      },
      { immediate: true },
    )
  }

  return {
    solBalance,
    nativeBalance,

    // tokens
    hasTokenAccount,
    tokenBalanceLoading,
    tokenBalance,
  }
})
