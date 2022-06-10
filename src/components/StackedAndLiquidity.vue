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
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useStakePoolStore } from '@/store'
import { lamportsToSol, priceFormatter } from '@/utils'
import TotalStacked from '@/components/TotalStacked.vue'

export default {
  components: {
    TotalStacked,
  },
  setup() {
    const stakePoolStore = useStakePoolStore()
    const { reserveStakeBalance } = storeToRefs(stakePoolStore)

    function formatAmount(val: number) {
      return priceFormatter.format(val)
    }
    return {
      reserveStakeBalance: computed(() => formatAmount(lamportsToSol(reserveStakeBalance.value))),
    }
  },
}
</script>

<template>
  <TotalStacked />
  <div class="total-stacked__reserved-balance">
    Available Liquidity: <b>{{ reserveStakeBalance }} SOL</b>
  </div>
</template>

<style lang="scss" scoped>
  .total-stacked {
    &__reserved-balance {
      padding: 0 0 0 23px;
      font-size: 12px;
      color: #fff;

      @media (max-width: $breakpoint-sm) {
        width: 270px;
      }

      @media (max-width: $breakpoint-xs) {
        width: auto;
      }
    }
  }

  .total-stacked-alter {
    .total-stacked {
      &__reserved-balance {
        color: #000;
      }
    }
  }
</style>

<style lang="scss">
  .total-stacked-alter {
    display: flex;
    flex-direction: column;
    margin-top: -20px;
    margin-bottom: 10px;
    margin-left: auto;
    margin-right: auto;
  }
</style>
