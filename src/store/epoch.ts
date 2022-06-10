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

import { computed, ref, toRef, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Connection, EpochInfo } from '@solana/web3.js'
import { useEmitter } from '@/hooks'
import { useConnectionStore } from '@/store'
import { EPOCH_RELOAD_INTERVAL } from '@/config'

export const EPOCH_UPDATE_EVENT = Symbol('EPOCH_UPDATE_EVENT')

export const useEpochStore = defineStore('epoch', () => {
  const emitter = useEmitter()
  const connectionStore = useConnectionStore()

  const stakePoolAddress = toRef(connectionStore, 'stakePoolAddress')

  const epochInfo = ref<EpochInfo>()
  const epochTimeRemaining = ref(0)
  const epochNumber = ref(0)
  const hourlySlotTime = ref(550)
  const epochTimeTotal = ref(0)

  const epochProgress = computed(() => {
    if (!epochInfo.value) {
      return 100
    }
    return ((100 * epochInfo.value.slotIndex) / epochInfo.value.slotsInEpoch).toFixed(1)
  })

  // Try to load epoch info
  const loadEpochInfo = () =>
    connectionStore.connection.getEpochInfo().then(e => (epochInfo.value = e))

  const loadHourlySlotTime = () =>
    calcHourlySlotTime(connectionStore.connection).then(v => (hourlySlotTime.value = v))

  watch(
    stakePoolAddress,
    () => {
      Promise.all([loadEpochInfo(), loadHourlySlotTime()]).then()
    },
    { immediate: true },
  )

  watch(epochInfo, (e) => {
    epochTimeRemaining.value = e ? (e.slotsInEpoch - e.slotIndex) * hourlySlotTime.value : 0
    epochTimeTotal.value = e ? e.slotsInEpoch * hourlySlotTime.value : 0
    if (e && e.epoch !== epochNumber.value) {
      epochNumber.value = e.epoch
    }
  })

  // Re-sync epoch info
  setInterval(async () => {
    await Promise.all([loadEpochInfo(), loadHourlySlotTime()])
    emitter.emit(EPOCH_UPDATE_EVENT, epochInfo.value)
    console.log('Reload epoch info', epochInfo.value)
  }, EPOCH_RELOAD_INTERVAL)

  // Update timer
  setInterval(async () => {
    const newVal = epochTimeRemaining.value - 1000
    epochTimeRemaining.value = Math.max(newVal, 0)
    // console.log('epochTimeRemaining', epochTimeRemaining.value);
    // console.log('epochProgress', epochProgress.value);
  }, 1000)

  return {
    epochInfo,
    epochNumber,
    epochTimeRemaining,
    epochProgress,
    epochTimeTotal,
    reload: () => loadEpochInfo(),
  }
})

async function calcHourlySlotTime(connection: Connection) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const res = await connection._rpcRequest('getRecentPerformanceSamples', [60])
  const samples: { numSlots: number; samplePeriodSecs: number }[] = res.result ?? []
  const timePerSlotSamples = samples
    .filter(s => s.numSlots !== 0)
    .map(s => s.samplePeriodSecs / s.numSlots)

  const samplesInHour = timePerSlotSamples.length < 60 ? timePerSlotSamples.length : 60
  const avgSlotTime_1h
    = timePerSlotSamples.reduce((sum: number, cur: number) => {
      return sum + cur
    }, 0) / samplesInHour

  return Math.round(1000 * avgSlotTime_1h)
}
