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
import solLogo from '~/assets/img/sol-logo.svg'
import { XSOL_NAME } from '~/config'
import { formatMoney, longPriceFormatter } from '~/utils'

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

const totalUsd = computed(() => solUsd.value + tokenUsd.value + stackedUsd.value)

const formatPrice = (v: number) => longPriceFormatter.format(v)

function openDetails() {
  dialog.value = true
}
</script>

<template>
  <div class="card wallet-balance">
    <div class="wallet-balance__head">
      <div>${{ formatMoney(totalUsd) }}</div>
      <div>WALLET</div>
    </div>
    <div class="wallet-balance__body">
      <div class="balance__item">
        <div class="balance__value">
          <span>{{ formatPrice(solBalance) }}</span>
          <span class="balance__value__usd">${{ formatMoney(solUsd) }}</span>
        </div>
        <div class="balance__token">
          <img alt="" :src="solLogo">
          <span>SOL</span>
        </div>
      </div>
      <div class="balance__item">
        <div class="balance__value">
          {{ formatPrice(tokenBalance) }}
          <span class="balance__value__usd">${{ formatMoney(tokenUsd) }}</span>
        </div>
        <div class="balance__token">
          <token-svg />
          <span>{{ XSOL_NAME }}</span>
        </div>
      </div>
      <div class="wallet-balance__staking__title">
        STAKING
      </div>
      <div class="balance__item">
        <j-btn
          pill
          size="sm"
          variant="primary"
          class="dialog-btn"
          @click="openDetails"
        >
          Details
        </j-btn>
        <div class="balance__value">
          {{ formatPrice(stakeSolBalance) }}
          <span class="balance__value__usd">${{ formatMoney(stackedUsd) }}</span>
        </div>
        <div class="balance__token">
          <img alt="" :src="solLogo">
          <span>SOL</span>
        </div>
      </div>
    </div>
  </div>
  <stake-accounts-dialog />
</template>
