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

<script lang="ts" setup>
import { formatPct } from '~/utils'

const {
  selected,
} = defineProps<{
  selected?: boolean
}>()

const apyStore = useApyStore()
const apy = computed(() => Math.max(Number(apyStore.apy.staking + apyStore.apy.jito) || 0, 0))
const fotmatedApy = computed(() => formatPct.format(apy.value / 100 || 0))
const loading = computed(() => apyStore.loading)
</script>

<template>
  <div class="apy" :class="{ 'apy--selected': selected }">
    APY
    <div class="apy__value">
      ≈{{ fotmatedApy }}
    </div>

    <div v-if="loading" class="spinner">
      <BSpinner
        big
      />
    </div>
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
  font-size: 16px;
  font-weight: 200;
  line-height: 14px;
  cursor: pointer;
  transition:
    color 0.3s,
    background-color 0.3s;
  &--selected {
    background-color: $gray;
    color: #fff;
  }
  @media (max-width: $breakpoint-xs) {
    height: 60px;
    top: -35px;
  }
  &__value {
    font-size: 20px;
    line-height: 22px;
    font-weight: 500;
    @media (max-width: $breakpoint-xs) {
      font-size: 18px;
      line-height: 20px;
    }
  }

  .spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
