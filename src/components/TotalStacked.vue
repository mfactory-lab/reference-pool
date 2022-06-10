<!--
  - This file is part of Solana Reference Stake Pool code.
  -
  - Copyright © 2021, mFactory GmbH
  -
  - Solana Reference Stake Pool is free software: you can redistribute it
  - and/or modify it under the terms of the GNU Affero General Public License
  - as published by the Free Software Foundation, either version 3
  - of the License, or (at your option) any later version.
  -
  - Solana Reference Stake Pool is distributed in the hope that it
  - will be useful, but WITHOUT ANY WARRANTY; without even the implied
  - warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  - See the GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program.
  - If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
  -
  - You can be released from the requirements of the Affero GNU General Public License
  - by purchasing a commercial license. The purchase of such a license is
  - mandatory as soon as you develop commercial activities using the
  - Solana Reference Stake Pool code without disclosing the source code of
  - your own applications.
  -
  - The developer of this program can be contacted at <info@mfactory.ch>.
  -->

<script lang="ts">
import { computed, toRef } from 'vue'
import { formatAmount, lamportsToSol } from '@/utils'
import { useCoinRateStore, useConnectionStore, useStakePoolStore } from '@/store'

export default {
  setup() {
    const coinRateStore = useCoinRateStore()
    const connectionStore = useConnectionStore()
    const stakePoolStore = useStakePoolStore()
    const stakePool = toRef(stakePoolStore, 'stakePool')

    const solStaked = computed(() =>
      lamportsToSol(stakePool.value?.totalLamports.toNumber() ?? 0),
    )
    const usdStacked = computed(() => solStaked.value * coinRateStore.solPrice)

    const maxSolToStake = computed(() => connectionStore.stakeLimit ?? 0)

    return {
      maxSolToStake,
      solStaked,
      usdStacked,
      formatPrice: (v: number) => formatAmount(v, 1),
    }
  },
}
</script>

<template>
  <div class="total-stacked">
    <div class="total-stacked__label">
      Total Staked
    </div>
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

<style lang="scss" scoped>
  .total-stacked {
    position: relative;
    padding-left: 25px;
    z-index: 2;
    margin-top: 2px;

    &__label {
      text-transform: uppercase;
      font-size: 11px;
      color: #ffffff;
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
        width: 33px;
        height: 100%;
        position: absolute;
        left: 0;

        @media (max-width: $breakpoint-xs) {
          background: url(@/assets/img/sol-logo.svg) no-repeat center center;
          background-size: contain;
        }
      }
    }

    &__sol {
      white-space: nowrap;
      color: #fff;
      font-size: 16px;
      line-height: 1;
    }

    &__usd {
      color: $lightGray;
      font-size: 12px;
      line-height: 1;
      margin-top: 1px;
      margin-bottom: 2px;
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
