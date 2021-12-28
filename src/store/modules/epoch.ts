/* This file is part of Solana Reference Stake Pool code.
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

import { defineStore, storeToRefs } from 'pinia';
import { ref, watch, computed } from 'vue';
import { useEmitter } from '@/hooks';
import { useConnection } from '@/store';
import { EPOCH_RELOAD_DURATION } from '@/config';
import { EpochInfo } from '@solana/web3.js';

export const EPOCH_UPDATE_EVENT = Symbol();

export const useEpochInfo = defineStore('epoch', () => {
  const emitter = useEmitter();
  const { connection, stakePoolAddress } = storeToRefs(useConnection());
  const epochInfo = ref<EpochInfo>();
  const epochTimeRemaining = ref(0);
  const epochNumber = ref(0);
  const hourlySlotTime = ref(550);

  // Try to load epoch info
  const loadEpochInfo = () => connection.value.getEpochInfo().then(e => epochInfo.value = e);

  const calcHourlySlotTime = async () => {
    // @ts-ignore
    const res = await connection.value._rpcRequest('getRecentPerformanceSamples', [60]);
    const samples: { numSlots: number; samplePeriodSecs: number }[] = res.result ?? [];
    const timePerSlotSamples = samples
    .filter((s) => s.numSlots !== 0)
    .map((s) => s.samplePeriodSecs / s.numSlots);

    const samplesInHour = timePerSlotSamples.length < 60 ? timePerSlotSamples.length : 60;
    const avgSlotTime_1h =
      timePerSlotSamples.reduce((sum: number, cur: number) => {
        return sum + cur;
      }, 0) / samplesInHour;

    hourlySlotTime.value = Math.round(1000 * avgSlotTime_1h);
  };

  watch(stakePoolAddress, async () => {
    await calcHourlySlotTime();
    await loadEpochInfo();
  }, { immediate: true });

  watch(epochInfo, (e) => {
    epochTimeRemaining.value = e ? (e.slotsInEpoch - e.slotIndex) * hourlySlotTime.value : 0;
    if (e && e.epoch !== epochNumber.value) {
      epochNumber.value = e.epoch;
    }
  });

  setInterval(async () => {
    await calcHourlySlotTime();
    await loadEpochInfo();
    emitter.emit(EPOCH_UPDATE_EVENT, epochInfo.value);
  }, EPOCH_RELOAD_DURATION);

  setInterval(async () => {
    const newVal = epochTimeRemaining.value - 1000;
    epochTimeRemaining.value = Math.max(newVal, 0);
  }, 1000);

  return {
    epochInfo,
    epochNumber,
    epochTimeRemaining,
    epochProgress: computed(() => {
      if (!epochInfo.value) {
        return 100;
      }
      return ((100 * epochInfo.value.slotIndex) / epochInfo.value.slotsInEpoch).toFixed(1);
    }),
    reload: () => loadEpochInfo(),
  };
});
