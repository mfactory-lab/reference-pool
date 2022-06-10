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
import { useApyStore } from '@/store'
import { formatPct } from '@/utils'

export default {
  props: {
    selected: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    const apyStore = useApyStore()
    const apy = toRef(apyStore, 'apy')
    const apyLoading = toRef(apyStore, 'apyLoading')
    return {
      apyLoading,
      apy: computed(() => formatPct.format(apy.value)),
    }
  },
}
</script>

<template>
  <div class="apy" :class="{ 'apy--selected': selected }">
    APY
    <div class="apy__value">
      ≈{{ apy }}
    </div>
    <q-inner-loading :showing="apyLoading" />
  </div>
</template>

<style scoped lang="scss">
  .apy {
    position: absolute;
    color: $gray;
    background-color: $primary;
    display: flex;
    flex-direction: column;
    align-items: center;
    left: calc(50% - 108px);
    border-radius: 50% !important;
    width: 96px;
    height: 96px;
    top: -23px;
    justify-content: center;
    z-index: 1;
    line-height: 14px;
    cursor: pointer;
    transition: color 0.3s, background-color 0.3s;
    &--selected {
      background-color: $gray;
      color: #fff;
    }
    @media (max-width: $breakpoint-xs) {
      border-radius: 50% 50% 0 0 !important;
      height: 60px;
      top: -35px;
    }
    &__value {
      font-size: 22px;
      line-height: 22px;
      font-weight: 500;
      @media (max-width: $breakpoint-xs) {
        font-size: 20px;
        line-height: 20px;
      }
    }
    .q-inner-loading {
      background: none;
    }
  }
</style>
