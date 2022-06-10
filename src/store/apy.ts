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

import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useLocalStorage } from '@vueuse/core'
import { useEpochStore, useValidatorStore } from '@/store'
import { APY_VALIDATOR_ID, DEFAULT_APY } from '@/config'

interface ApyValidatorInfo {
  id: string
  vote: string
  apy: number
}

interface ApyInfo {
  beginTimestamp: number
  collectionTimestamp: number
  endTimestamp: number
  firstEpoch: number
  isEstimated: boolean
  lastEpoch: number
  validators: ApyValidatorInfo[]
}

export const useApyStore = defineStore('apy', () => {
  const validatorStore = useValidatorStore()
  const epochStore = useEpochStore()

  const apyInfo = useLocalStorage<ApyInfo>('apy', {
    beginTimestamp: 0,
    collectionTimestamp: 0,
    endTimestamp: 0,
    firstEpoch: 0,
    isEstimated: false,
    lastEpoch: 0,
    validators: [],
  })
  const selectedApy = ref()
  const apyLoading = ref(!apyInfo.value?.lastEpoch)

  const voteIds = computed(() => validatorStore.voteIds)
  const epochInfo = computed(() => epochStore.epochInfo)

  watch([epochInfo, voteIds], async ([epochInfo, ids]) => {
    if (!epochInfo?.epoch || ids.length === 0) {
      return
    }

    if (apyInfo.value?.lastEpoch === epochInfo.epoch) {
      console.log('[APY] Skip loading...')
      apyLoading.value = false
      return
    }
    console.log('[APY] Loading apy info...')
    apyLoading.value = true
    try {
      const res = await loadApyInfo('prev10')
      apyInfo.value = {
        ...res,
        validators: res?.validators.filter(v => ids.includes(v.vote)) ?? [],
      }
      // use APY from selected validator
      if (APY_VALIDATOR_ID) {
        const apyValidator = res?.validators.find(v => v.id === APY_VALIDATOR_ID)
        if (apyValidator) {
          selectedApy.value = apyValidator.apy
        }
      }
    } finally {
      apyLoading.value = false
    }
  })

  const apy = computed<number>(() => {
    const validators = apyInfo.value?.validators ?? []
    if (validators.length === 0) {
      return DEFAULT_APY
    }
    if (selectedApy.value) {
      return selectedApy.value
    }
    const sumApy = validators.reduce((sum, v) => sum + v.apy, 0)
    return sumApy / validators.length
  })

  return {
    apyInfo,
    apyLoading,
    apy,
  }
})

export async function loadApyInfo(type: string | number = 'prev3'): Promise<ApyInfo> {
  const res = await axios.get(`https://stakeview.app/apy/${type}.json`)
  return res.data
}
