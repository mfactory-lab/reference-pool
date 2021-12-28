<template>
  <div class="total-stacked">
    <div class="total-stacked__label">Total Staked</div>
    <div class="total-stacked__value">
      <div class="total-stacked__sol">
        {{ formatPrice(solStaked) }} /
        <span v-if="maxSolToStake">
          {{ formatPrice(maxSolToStake) }}
        </span>
      </div>
      <div class="total-stacked__usd">
        ≈&nbsp;${{ formatPrice(usdStacked) }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
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

import { computed } from 'vue'
import { lamportsToSol, formatAmount } from '@/utils'
import { useStakePool, useConnection, useExchangeRates } from '@/store'
import { storeToRefs } from 'pinia'

export default {
  setup() {
    const { endpoint } = storeToRefs(useConnection())
    const { stakePool } = storeToRefs(useStakePool())
    const { solPrice } = storeToRefs(useExchangeRates())
    const solStaked = computed(() =>
      lamportsToSol(stakePool.value?.totalLamports.toNumber() ?? 0)
    )
    const usdStacked = computed(() => solStaked.value * solPrice.value)

    return {
      // reverse limit progress for rounded right part of progress bar
      maxSolToStake: computed(() => endpoint.value?.stakeLimit),
      solStaked,
      usdStacked,
      formatPrice: (v: number) => formatAmount(v, 1),
    }
  },
}
</script>

<style lang="scss" scoped>
.total-stacked {
  position: relative;
  padding-left: 1rem;
  z-index: 2;
  margin-top: 5px;
  @media (max-width: $breakpoint-sm) {
    margin-bottom: 10px;
  }

  &__label {
    text-transform: uppercase;
    font-size: 14px;
    color: #ffffff;
    margin-bottom: 4px;
  }

  &__value {
    padding-right: 15px;
    padding-left: 50px;
    font-weight: 700;
    position: relative;

    @media (min-width: $breakpoint-md) {
      min-width: 150px;
      width: 220px;
    }

    &::before {
      content: '';
      //noinspection CssUnknownTarget
      background: url(@/assets/img/sol-gray-logo.svg) no-repeat center center;
      background-size: contain;
      width: 38px;
      height: 100%;
      position: absolute;
      left: 0;

      @media (max-width: $breakpoint-sm) {
        background: url(@/assets/img/sol-logo.svg) no-repeat center center;
      }
    }
  }

  &__sol {
    white-space: nowrap;
    color: #fff;
    font-size: 19px;
    line-height: 1;
  }

  &__usd {
    color: #ffffff;
    font-size: 14px;
    line-height: 1;
    margin-top: 3px;
    margin-bottom: 5px;
  }
}

.total-stacked-alter {
  .total-stacked {
    &__label {
      color: #000;
    }
    &__usd {
      color: #000;
    }
    &__sol {
      color: #000;
    }
  }
}
</style>
