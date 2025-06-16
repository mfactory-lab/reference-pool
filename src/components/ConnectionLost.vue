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
const stakePoolStore = useStakePoolStore()
const connectionLost = computed(() => stakePoolStore.connectionLost)
const forceHidden = ref(true)

const { width } = useWindowSize()

watch(connectionLost, (cl) => {
  forceHidden.value = true
  if (cl) {
    setTimeout(() => (forceHidden.value = false), 3000)
  }
}, { immediate: true })
</script>

<template>
  <dynamic-teleport to="header" :is-teleport="width < 768">
    <div v-if="connectionLost && !forceHidden" class="connection-lost">
      Solana network overloaded. Data currently unavailable.
    </div>
  </dynamic-teleport>
</template>

<style scoped lang="scss">
  .connection-lost {
  position: fixed;
  width: 100%;
  top: 0;
  padding: 6px;
  background: $info;
  color: #fff;
  font-weight: 500;
  font-size: 16px;
  z-index: 10000;
  text-align: center;

  @media (max-width: $breakpoint-xs) {
    position: initial;
    order: -1;
    margin: -10px 0 10px;
  }
}
</style>
