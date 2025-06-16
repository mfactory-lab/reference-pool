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
import { formatAmount, lamportsToSol, shortenAddress } from '~/utils'

const {
  loading,
  onlyDeposit,
  account,
} = defineProps<{
  loading?: boolean
  onlyDeposit?: boolean
  account: StakeAccountWithState
}>()

const emit = defineEmits(['deposit', 'deactivate', 'withdraw'])

const address = computed(() => account.stakeAccount.pubkey.toBase58())

const shortAddress = computed(() => shortenAddress(account.stakeAccount.pubkey.toBase58()))
const amount = computed(() => {
  return formatAmount(lamportsToSol(account.stakeAccount?.account?.lamports ?? 0))
})
const lamports = computed(() => account.stakeAccount?.account?.lamports)
const state = computed(() =>
  account.stakeAccount.account.data?.parsed?.type === 'delegated'
    ? account.state
    : 'not delegated',
)

const stateColor = computed(() => {
  switch (account.state) {
    case 'active':
      return 'positive'
    case 'inactive':
      return 'negative'
    default:
      return 'grey'
  }
})

// function deposit() {
//   emit('deposit', account.stakeAccount)
// }

function deactivate(address: string) {
  emit('deactivate', address)
}

function withdraw(address: string, lamports: number) {
  emit('withdraw', address, lamports)
}
</script>

<template>
  <div class="stake-acc__item">
    <div class="stake-acc__info">
      <div class="stake-acc__info-address">
        <copy-to-clipboard :text="address" />
        <span>{{ shortAddress }}</span>
        <div class="status-badge" :class="[`status-badge--${stateColor}`]">
          {{ state }}
        </div>
      </div>
      <div class="stake-acc__info-amount">
        {{ amount }} SOL
      </div>
    </div>
    <div class="stake-acc__item__action">
      <template v-if="state === 'active'">
        <template v-if="!onlyDeposit">
          <j-btn
            :loading="loading"
            size="sm"
            variant="primary"
            pill
            @click="deactivate(address)"
          >
            DEACTIVATE
          </j-btn>
        </template>
      </template>
      <template v-else>
        <j-btn
          :loading="loading"
          size="sm"
          pill
          :disabled="state === 'deactivating'"
          variant="secondary"
          @click="withdraw(address, lamports)"
        >
          WITHDRAW
        </j-btn>
      </template>
    </div>
  </div>
</template>

<style lang="scss">
.stake-acc {
  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;

    &-address {
      display: flex;
      align-content: center;
      gap: 4px;

      [class*='tooltip'] {
        display: flex;
        align-items: center;
      }
    }

    &-amount {
      font-size: 14px;
      font-weight: 500;
      line-height: 16px;
      color: $neutral-300;
    }

    .status-badge {
      height: fit-content;
      padding: 2px 6px;
      border-radius: 50px;
      margin-left: 8px;
      font-size: 9px;
      font-weight: 500;
      text-transform: uppercase;
      color: #fff;

      &--positive {
        background-color: $success;
      }

      &--negative {
        background-color: $negative;
      }

      &--grey {
        background-color: $neutral-300;
      }
    }
  }
}
</style>
