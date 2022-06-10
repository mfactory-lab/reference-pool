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

import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { AccountInfo, ParsedAccountData, PublicKey } from '@solana/web3.js'
import { StakeProgram } from '@solana/web3.js'
import { useWallet } from 'solana-wallets-vue'
import { useConnectionStore } from '@/store'
import { getFilteredProgramAccounts, lamportsToSol, sleep } from '@/utils'

export interface ProgramAccount {
  pubkey: PublicKey
  account: AccountInfo<ParsedAccountData>
}

export const useStakeAccountStore = defineStore('stake-accounts', () => {
  const connectionStore = useConnectionStore()
  const { publicKey } = useWallet()
  const data = ref<ProgramAccount[]>([])
  const loading = ref<boolean>(false)
  const dialog = ref<boolean>(false)

  // filter by voter
  const voter = ref<string | null>()

  function removeAccount(address: string) {
    data.value = data.value.filter(acc => acc.pubkey.toBase58() !== address)
  }

  async function load({ delay }: { delay?: number } = {}) {
    if (loading.value || !publicKey.value) {
      console.log('[Stake accounts] Skip loading...')
      return
    }

    loading.value = true
    console.log('[Stake accounts] Loading...')

    const filters = [
      {
        // 12 is Staker authority offset in stake account stake
        memcmp: {
          offset: 12,
          bytes: publicKey.value.toBase58(),
        },
      },
      { dataSize: 200 },
      // {
      //   memcmp: {
      //     offset: 44,
      //     bytes: wallet.publicKey!.toBase58(),
      //   },
      // },
      // {
      //   dataSize: USER_STAKE_INFO_ACCOUNT_LAYOUT.span,
      // },
    ]

    if (delay) {
      await sleep(delay)
    }

    try {
      data.value = await getFilteredProgramAccounts(
        connectionStore.connection,
        StakeProgram.programId,
        filters,
      ) as any
      console.log('[Stake accounts] Data:', data.value)
      // console.log(data.value.map((acc) => acc.pubkey.toBase58()).join('\n'));
    } catch (e: any) {
      console.log('[Stake accounts] Error:', e.message)
    } finally {
      loading.value = false
    }
  }

  watch(
    publicKey,
    () => {
      load()
    },
    { immediate: true },
  )

  // TODO: refactory
  watch(dialog, (d) => {
    if (!d) {
      voter.value = null
    }
  })

  const calcStakeBalance = (accounts: ProgramAccount[]) => {
    const lamports = accounts.reduce((total, acc) => {
      total += acc.account.lamports
      return total
    }, 0)
    return lamportsToSol(lamports)
  }

  function voterAccounts(voter: string) {
    return data.value.filter(
      acc => acc.account.data?.parsed?.info?.stake?.delegation?.voter === voter,
    )
  }

  const stakeSolBalance = computed(() => calcStakeBalance(data.value))

  const voterStake = (voter: string) => computed(() => calcStakeBalance(voterAccounts(voter)))

  return {
    loading,
    dialog,
    voter,
    stakeSolBalance,
    data: computed(() => (voter.value ? voterAccounts(voter.value) : data.value)),
    voterStake,
    removeAccount,
    load,
  }
})
