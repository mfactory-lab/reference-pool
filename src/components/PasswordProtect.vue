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
import { ref } from 'vue'
import { useAuthStore } from '@/store'

const authStore = useAuthStore()
const error = ref(false)
const password = ref('')

function login() {
  if (!authStore.login(password.value)) {
    password.value = ''
    error.value = true
  }
}
</script>

<template>
  <q-layout :class="$style.layout">
    <q-page class="window-height window-width row justify-center items-center">
      <div class="column">
        <div class="row justify-center">
          <div :class="$style.logo">
            <img src="@/assets/img/logo.svg" alt="" height="132">
          </div>
        </div>
        <div class="row">
          <q-card class="q-pa-lg shadow-1">
            <q-card-section>
              <q-form class="q-gutter-md">
                <q-input
                  v-model="password"
                  :class="$style.input"
                  :error="error"
                  placeholder="Secret Code"
                  type="password"
                  outlined
                >
                  <template #append>
                    <q-btn flat rounded @click="login">
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

<style lang="scss" module>
  .input {
    width: 240px;
    input {
      &::placeholder {
        color: #aaa;
      }
    }
  }

  .layout {
    background-color: $blue-grey-1;
  }

  .logo {
    font-size: 40px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 1rem;
    color: #333;
  }
</style>
