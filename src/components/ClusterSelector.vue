<template>
  <q-btn-dropdown
    class="app-header__cluster-btn"
    :label="filter(cluster)"
    :model-value="false"
    auto-close
    color="white"
    text-color="black"
    rounded
  >
    <q-list>
      <q-item
        v-for="item in items"
        :key="item.name"
        clickable
        @click="select(item)"
      >
        <q-item-section>
          <q-item-label>
            <b>{{ filter(item.name) }}</b>
          </q-item-label>
          {{ item.url }}
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
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

import { storeToRefs } from 'pinia';
import { ENDPOINTS } from '@/config';
import { useConnection, Endpoint } from '@/store';

export default {
  setup() {
    const connectionStore = useConnection();
    const { cluster } = storeToRefs(connectionStore);
    return {
      cluster,
      select: (e: Endpoint) => connectionStore.setCluster(e.name),
      items: ENDPOINTS,
      filter: (name: string) => name.replace('-beta', ''),
    };
  },
};
</script>
