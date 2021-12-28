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

import { ref, watch, computed } from 'vue';
import { storeToRefs, defineStore } from 'pinia';
import { useValidators, useEpochInfo } from '@/store';
import axios from 'axios';
import { useLocalStorage } from '@vueuse/core';
import { DEFAULT_APY, APY_VALIDATOR_ID } from '@/config';

interface ApyValidatorInfo {
  id: string,
  vote: string,
  apy: number
}

interface ApyInfo {
  beginTimestamp: number;
  collectionTimestamp: number;
  endTimestamp: number;
  firstEpoch: number;
  isEstimated: boolean;
  lastEpoch: number;
  validators: ApyValidatorInfo[];
}

export const useApy = defineStore('apy', () => {
  const { voteIds } = storeToRefs(useValidators());
  const { epochInfo } = storeToRefs(useEpochInfo());
  const apyInfo = useLocalStorage<ApyInfo>('apy', {
    beginTimestamp: 0,
    collectionTimestamp: 0,
    endTimestamp: 0,
    firstEpoch: 0,
    isEstimated: false,
    lastEpoch: 0,
    validators: [],
  });
  const selectedApy = ref();
  const loading = ref(!apyInfo.value?.lastEpoch);

  watch([epochInfo, voteIds], async ([epochInfo, ids]) => {
    if (epochInfo?.epoch && ids.length > 0) {
      if (apyInfo.value?.lastEpoch == epochInfo.epoch) {
        loading.value = false;
        return;
      }
      loading.value = true;
      try {
        const res = await loadApyInfo('prev10');
        apyInfo.value = {
          ...res,
          validators: res?.validators.filter(v => ids.includes(v.vote)) ?? [],
        };
        // use APY from selected validator
        if (APY_VALIDATOR_ID) {
          const apyValidator = res?.validators.find(v => v.id == APY_VALIDATOR_ID);
          if (apyValidator) {
            selectedApy.value = apyValidator.apy;
          }
        }
      } finally {
        loading.value = false;
      }
    }
  });

  return {
    apyInfo,
    apyLoading: computed(() => loading.value),
    apy: computed(() => {
      const validators = apyInfo.value?.validators ?? [];
      if (validators.length == 0) {
        return DEFAULT_APY;
      }
      if (selectedApy.value) {
        return selectedApy.value;
      }
      const sumApy = validators.reduce((sum, v) => sum + v.apy, 0);
      return sumApy / validators.length;
    }),
  };
});

export async function loadApyInfo(type: string | number = 'prev3'): Promise<ApyInfo> {
  const res = await axios.get(`https://stakeview.app/apy/${type}.json`);
  return res.data;
}
