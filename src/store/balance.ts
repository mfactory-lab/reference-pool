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

import type { Buffer } from 'buffer'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import debounce from 'lodash-es/debounce'
import { useWallet } from 'solana-wallets-vue'
import type { AccountInfo, Connection, PublicKey } from '@solana/web3.js'
import { useConnectionStore, useStakePoolStore } from '@/store'
import { findAssociatedTokenAddress, lamportsToSol } from '@/utils'
import { ACCOUNT_CHANGE_EVENT, WALLET_DISCONNECT_EVENT, useEmitter } from '@/hooks'

const ACCOUNT_CHANGE_DEBOUNCE = 300

export const useBalanceStore = defineStore('balance', () => {
  const connectionStore = useConnectionStore()
  const stakePoolStore = useStakePoolStore()
  const { publicKey } = useWallet()
  const emitter = useEmitter()

  const nativeBalance = ref(0)
  const hasTokenAccount = ref<boolean>(false)
  const tokenBalanceLoading = ref<boolean>(false)
  const tokenBalance = ref(0)

  const stakePool = computed(() => stakePoolStore.stakePool)

  const solBalance = computed(() => lamportsToSol(nativeBalance.value))

  async function _getTokenBalance() {
    if (!publicKey.value || !stakePool.value?.poolMint) {
      return
    }
    tokenBalanceLoading.value = true
    const balance = await getTokenBalance(
      connectionStore.connection,
      publicKey.value,
      stakePool.value?.poolMint,
    )
    hasTokenAccount.value = balance !== null
    tokenBalance.value = balance ?? 0
    tokenBalanceLoading.value = false
    console.log('[Balance] JSOL:', tokenBalance.value)
  }

  const _onAccountChange = debounce(async (acc: AccountInfo<Buffer> | null) => {
    nativeBalance.value = acc?.lamports ?? 0
    console.log('[Balance] SOL:', nativeBalance.value)
    _getTokenBalance().then()
  }, ACCOUNT_CHANGE_DEBOUNCE)

  const _onDisconnect = () => {
    tokenBalanceLoading.value = false
    nativeBalance.value = 0
    tokenBalance.value = 0
  }

  emitter.on(ACCOUNT_CHANGE_EVENT, _onAccountChange)
  emitter.on(WALLET_DISCONNECT_EVENT, _onDisconnect)

  watch(
    publicKey,
    (pk) => {
      if (pk) {
        connectionStore.connection.getAccountInfo(pk).then(_onAccountChange)
      }
    },
    { immediate: true },
  )

  return {
    solBalance,
    nativeBalance,

    // tokens
    hasTokenAccount,
    tokenBalanceLoading,
    tokenBalance,
  }
})

/**
 * Gets TokenAccountBalance from the associated token account
 */
export async function getTokenBalance(
  connection: Connection,
  walletAddress: PublicKey,
  mint: PublicKey,
): Promise<number | null> {
  try {
    const associatedTokenAcc = await findAssociatedTokenAddress(walletAddress, mint)
    const tBalance = await connection.getTokenAccountBalance(associatedTokenAcc)
    return tBalance.value.uiAmount
  } catch (ex) {
    // No token account found
    return null
  }
}
