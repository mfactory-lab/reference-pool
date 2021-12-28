<template>
  <q-layout v-if="isAuthEnabled && !isAuthenticated">
    <q-page class="window-height window-width row justify-center items-center">
      <div class="column">
        <div class="row justify-center">
          <div :class="$style.logo">
            JPOOL
          </div>
        </div>
        <div class="row">
          <q-card class="q-pa-lg shadow-1">
            <q-card-section>
              <q-form class="q-gutter-md">
                <q-input
                  v-model="password"
                  :class="$style.input"
                  outlined
                  placeholder="Secret Code"
                  type="password"
                >
                  <template v-slot:append>
                    <q-btn
                      flat
                      rounded
                      @click="login"
                    >
                      GO
                    </q-btn>
                  </template>
                </q-input>
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-page>
  </q-layout>
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

import { useAuth } from '@/store';
import { ref, computed } from 'vue';

export default {
  setup() {
    const password = ref('');
    const authStore = useAuth();
    return {
      password,
      isAuthEnabled: computed(() => authStore.isEnabled),
      isAuthenticated: computed(() => authStore.isAuthenticated),
      login() {
        authStore.login(password.value)
      }
    };
  },
};
</script>

<style lang="scss" module>
.input {
  width: 240px;
}

.logo {
  font-size: 40px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: #aaa;
}
</style>
