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
import { computed, defineComponent, toRef } from 'vue'
import {
  useBalanceStore,
  useCoinRateStore,
  useStakeAccountStore,
  useStakePoolStore,
} from '@/store'
import { formatMoney, longPriceFormatter } from '@/utils'
import { XSOL_NAME } from '@/config'

export default defineComponent({
  setup() {
    const stakePoolStore = useStakePoolStore()
    const balanceStore = useBalanceStore()
    const stakeAccountStore = useStakeAccountStore()
    const coinRateStore = useCoinRateStore()

    const solBalance = toRef(balanceStore, 'solBalance')
    const tokenBalance = toRef(balanceStore, 'tokenBalance')
    const stakeSolBalance = toRef(stakeAccountStore, 'stakeSolBalance')
    const dialog = toRef(stakeAccountStore, 'dialog')

    const solUsd = computed(() => coinRateStore.solPrice * solBalance.value)
    const tokenUsd = computed(
      () => (coinRateStore.solPrice * tokenBalance.value) / stakePoolStore.exchangeRate,
    )
    const stackedUsd = computed(() => coinRateStore.solPrice * stakeSolBalance.value)

    return {
      XSOL_NAME,
      solBalance,
      tokenBalance,
      solUsd,
      tokenUsd,
      stackedUsd,
      totalUsd: computed(() => solUsd.value + tokenUsd.value + stackedUsd.value),
      stakeSolBalance: computed(() => stakeSolBalance.value),
      formatPrice: (v: number) => longPriceFormatter.format(v),
      formatMoney: (v: number) => formatMoney(v),
      openDetails() {
        dialog.value = true
      },
    }
  },
})
</script>

<template>
  <q-card class="wallet-balance">
    <q-card-section class="wallet-balance__head">
      <div>${{ formatMoney(totalUsd) }}</div>
      <div>WALLET</div>
    </q-card-section>
    <q-card-section class="wallet-balance__body">
      <q-list dense separator>
        <q-item>
          <q-item-section class="balance__value">
            <span>{{ formatPrice(solBalance) }}</span>
            <span class="balance__value__usd">${{ formatMoney(solUsd) }}</span>
          </q-item-section>
          <q-item-section side>
            <q-item-label>
              <img alt="" src="@/assets/img/sol-logo.svg">
              <span>SOL</span>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section class="balance__value">
            {{ formatPrice(tokenBalance) }}
            <span class="balance__value__usd">${{ formatMoney(tokenUsd) }}</span>
          </q-item-section>
          <q-item-section side>
            <q-item-label>
              <token-svg />
              <span>{{ XSOL_NAME }}</span>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <div class="wallet-balance__staking__title">
        STAKING
      </div>
      <q-list dense separator>
        <q-item>
          <q-item-section side>
            <q-btn
              rounded
              size="sm"
              unelevated
              color="primary"
              text-color="primary-gray"
              dense
              class="q-px-md"
              @click="openDetails"
            >
              Details
            </q-btn>
          </q-item-section>
          <q-item-section class="balance__value">
            {{ formatPrice(stakeSolBalance) }}
            <span class="balance__value__usd">${{ formatMoney(stackedUsd) }}</span>
          </q-item-section>
          <q-item-section side>
            <q-item-label>
              <img alt="" src="@/assets/img/sol-logo.svg">
              <span>SOL</span>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
  <stake-accounts-dialog />
</template>
