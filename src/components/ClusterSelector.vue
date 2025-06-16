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
import { ENDPOINTS } from '~/config'
import type { Endpoint } from '~/store'

const connectionStore = useConnectionStore()

const wallet = useClientWallet()

const groups = [
  ENDPOINTS.filter(e => e.cluster === 'mainnet-beta'),
  // ENDPOINTS.filter(e => e.cluster !== 'mainnet-beta'),
]
const endpoint = computed(() => connectionStore?.endpoint)
function select(e: Endpoint) {
  if (wallet?.connected && connectionStore?.cluster !== e.cluster) {
    wallet?.disconnect()
    if (wallet?.autoConnect.value) {
      wallet?.connect()
    }
  }
  connectionStore.setRpc(e.id)
}
</script>

<template>
  <BDropdown
    class="app-header__cluster-btn"
    variant="outline"
    offset="2"
  >
    <template #button-content>
      {{ endpoint.name }}
    </template>
    <template v-for="(items, index) in groups" :key="`${index}-cluster-group`">
      <BDropdownItem v-for="item in items" :key="item.id" clickable class="cluster-select-menu__item" @click="select(item)">
        <b>{{ item.name }}</b>
        <br>
        {{ item.url }}
      </BDropdownItem>
      <div v-if="index !== groups.length - 1" class="cluster-separator" />
    </template>
  </BDropdown>
</template>

<style lang="scss">
.app-header__cluster-btn {
  .btn.show {
    border-color: transparent;
  }
  .cluster-select-menu__item {
    display: flex;
    flex-direction: column;
    font-size: 14px;
  }

  .cluster-separator {
    display: block;
    height: 1px;
    width: 100%;
    border: 0;
    background: rgba(0, 0, 0, 0.12);
    margin: 0;
  }

  .dropdown-item:active {
    background-color: lighten($primary, 10%);
  }
}
</style>
