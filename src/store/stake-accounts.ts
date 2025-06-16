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

import type { AccountInfo, ParsedAccountData, PublicKey } from '@solana/web3.js'
import { StakeProgram } from '@solana/web3.js'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { getFilteredProgramAccounts, lamportsToSol } from '~/utils'

export type ProgramAccount = {
  pubkey: PublicKey
  account: AccountInfo<ParsedAccountData>
}

export type StakeAccountWithState = {
  stakeAccount: ProgramAccount
  state: string
}

export const useStakeAccountStore = defineStore('stake-accounts', () => {
  const connectionStore = useConnectionStore()
  const { publicKey } = useClientWallet()
  const data = ref<ProgramAccount[]>([])
  const accountsFull = ref<StakeAccountWithState[]>([])
  const loading = ref<boolean>(false)
  const dialog = ref<boolean>(false)

  const epochStore = useEpochStore()
  const epoch = computed(() => epochStore.epochNumber)

  // filter by voter
  const voter = ref<string | null>()

  function removeAccount(address: string) {
    data.value = data.value.filter(acc => acc.pubkey.toBase58() !== address)
  }

  async function load() {
    if (!publicKey.value || !import.meta.client) {
      console.log('[Stake accounts] Skip loading...')
      return
    }

    // stake user info account
    const filters = [
      {
        // 12 is Staker authority offset in stake account stake
        memcmp: {
          offset: 12 + 32,
          bytes: publicKey.value.toBase58(),
          // bytes: '2n5KTrz1b5MLkPATsosHJhc9JsRtnMxAEq1mWHZiHsZR',
        },
      },
      { dataSize: 200 },
      // {
      //   memcmp: {
      //     offset: 44,
      //     bytes: publicKey!.toBase58(),
      //   },
      // },
      // {
      //   dataSize: USER_STAKE_INFO_ACCOUNT_LAYOUT.span,
      // },
    ]

    data.value = await getFilteredProgramAccounts(
      connectionStore.connection,
      StakeProgram.programId,
      filters,
    ) as any
  }

  const updateAccounts = async () => {
    const source = data.value
    const newData: any = []
    accountsFull.value = source.map((item: any) => {
      // if used accountsFull then acc = item.stakeAccount
      const acc = item
      let state = ''
      try {
        const newDataIndex = -1
        const stakeNewData = newDataIndex >= 0
          ? newData[newDataIndex]
          : acc.account

        if (!stakeNewData.state && epoch.value > 0) {
          const delegation = stakeNewData.data.parsed?.info.stake?.delegation
          if (delegation) {
            const activation = +delegation.activationEpoch
            const deactivation = +delegation.deactivationEpoch
            // state: 'active' | 'inactive' | 'activating' | 'deactivating';
            if (activation < epoch.value && deactivation > 99_999) {
              stakeNewData.state = 'active'
            } else if (activation === epoch.value && deactivation > 99_999) {
              stakeNewData.state = 'activating'
            } else if (activation < epoch.value && deactivation === epoch.value) {
              stakeNewData.state = 'deactivating'
            } else if ((activation < epoch.value && deactivation < epoch.value) || (activation === epoch.value && deactivation === epoch.value)) {
              stakeNewData.state = 'inactive'
            }
          }
        }
        state = stakeNewData.state
      } catch (error) {
        console.log('getStakeActivation error ===', error)
      }
      return {
        stakeAccount: acc,
        state,
      }
    })
  }

  watch(data, () => updateAccounts(), { immediate: true })

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
    accountsFull,
    stakeSolBalance,
    data: computed(() => (voter.value ? voterAccounts(voter.value) : data.value)),
    voterStake,
    removeAccount,
    load,
  }
})
