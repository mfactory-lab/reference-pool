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

import { ref, toRef, watch } from 'vue'
import { defineStore } from 'pinia'
import { shortenAddress } from '@/utils'
import { getValidatorsStats } from '@/utils/api'
import { useConnectionStore } from '@/store'

export interface ValidatorData {
  id: string
  fee: number
  apyNum: number
  voter: string
  lamports: number
  totalStake: number
  name: string
  details: string | undefined
  website: string | undefined
  keybaseUsername: string | undefined
  url: string | undefined
  image: string | undefined
}

export const useValidatorStore = defineStore('validators', () => {
  const connectionStore = useConnectionStore()
  const loading = ref(false)
  const data = ref<ValidatorData[]>([])
  const voteIds = ref<string[]>([])

  const stakePoolAddress = toRef(connectionStore, 'stakePoolAddress')

  async function load() {
    if (loading.value) {
      return
    }

    loading.value = true
    const network = connectionStore.cluster.replace('-beta', '')
    const validatorsStats = await getValidatorsStats(network, 'true')

    // console.log('[Validators] validatorsStats', validatorsStats);

    const items: ValidatorData[] = []
    voteIds.value = validatorsStats.map((item) => {
      const pubKey = item.validatorId
      items.push({
        id: pubKey,
        fee: item.fee,
        voter: item.voteId,
        apyNum: item.apy,
        totalStake: Number(item.totalStake),
        name: item.name ?? shortenAddress(pubKey),
        details: item.details,
        website: item.website,
        keybaseUsername: item.keybaseUsername,
        image: item.keybaseUsername
          ? `https://keybase.io/${item.keybaseUsername}/picture`
          : undefined,
        url: `https://www.validators.app/validators/${network}/${pubKey}`,
        lamports: Number(item.jpoolLamports),
      })
      return item.voteId
    })
    // console.log('[Validators] Vote ids', voteIds.value);

    data.value = items
      .sort((a, b) => a.name.localeCompare(b.name))
      .sort((a, b) => b.lamports - a.lamports)

    console.log('[Validators] data', data.value)
    loading.value = false
  }

  watch(stakePoolAddress, load, { immediate: true })

  return {
    loading,
    data,
    voteIds,
    load,
    clear: () => (data.value = []),
  }
})
