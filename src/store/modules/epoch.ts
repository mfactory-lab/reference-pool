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

import { computed, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { Connection, EpochInfo } from '@solana/web3.js';
import { useEmitter } from '@/hooks';
import { useConnectionStore } from '@/store';
import { EPOCH_RELOAD_DURATION } from '@/config';
import { useIntervalFn } from '@vueuse/core';

export const EPOCH_UPDATE_EVENT = Symbol();

// interface EpochState {
//   epochInfo: EpochInfo;
//   epochNumber: number;
//   epochTimeRemaining: number;
//   epochProgress: number;
// }

export const useEpochStore = defineStore('epoch', () => {
  const emitter = useEmitter();
  const connectionStore = useConnectionStore();
  const epochInfo = ref<EpochInfo>();
  const epochTimeRemaining = ref(0);
  const epochNumber = ref(0);
  const hourlySlotTime = ref(550);

  const { stakePoolAddress } = storeToRefs(connectionStore);

  const epochProgress = computed(() => {
    if (!epochInfo.value) {
      return 100;
    }
    return ((100 * epochInfo.value.slotIndex) / epochInfo.value.slotsInEpoch).toFixed(1);
  });

  async function loadEpochInfo() {
    epochInfo.value = await connectionStore.connection.getEpochInfo();
  }

  async function loadHourlySlotTime() {
    hourlySlotTime.value = await calcHourlySlotTime(connectionStore.connection);
  }

  watch(stakePoolAddress, () => Promise.all([loadEpochInfo(), loadHourlySlotTime()]), {
    immediate: true,
  });

  watch(epochInfo, (e) => {
    epochTimeRemaining.value = e ? (e.slotsInEpoch - e.slotIndex) * hourlySlotTime.value : 0;
    if (e && e.epoch !== epochNumber.value) {
      epochNumber.value = e.epoch;
    }
  });

  useIntervalFn(async () => {
    await Promise.all([loadEpochInfo(), loadHourlySlotTime()]);
    emitter.emit(EPOCH_UPDATE_EVENT, epochInfo.value);
    console.log('[Epoch] Info', epochInfo.value);
  }, EPOCH_RELOAD_DURATION);

  useIntervalFn(() => {
    const newVal = epochTimeRemaining.value - 1000;
    epochTimeRemaining.value = Math.max(newVal, 0);
    // console.log('[Epoch] epochTimeRemaining', epochTimeRemaining.value);
    // console.log('[Epoch] epochProgress', epochProgress.value);
  }, 1000);

  return {
    epochInfo,
    epochNumber,
    epochTimeRemaining,
    epochProgress,
  };
});

async function calcHourlySlotTime(connection: Connection) {
  // @ts-ignore
  const res = await connection._rpcRequest('getRecentPerformanceSamples', [60]);
  const samples: { numSlots: number; samplePeriodSecs: number }[] = res.result ?? [];
  const timePerSlotSamples = samples
    .filter((s) => s.numSlots !== 0)
    .map((s) => s.samplePeriodSecs / s.numSlots);

  const samplesInHour = timePerSlotSamples.length < 60 ? timePerSlotSamples.length : 60;
  const avgSlotTime_1h =
    timePerSlotSamples.reduce((sum: number, cur: number) => {
      return sum + cur;
    }, 0) / samplesInHour;

  return Math.round(1000 * avgSlotTime_1h);
}
