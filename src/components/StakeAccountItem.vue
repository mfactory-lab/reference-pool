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
import { computed, defineComponent, ref, watchEffect } from 'vue'
import type { StakeActivationData } from '@solana/web3.js'
import type { ProgramAccount } from '@/store'
import { useConnectionStore } from '@/store'
import { formatAmount, lamportsToSol, shortenAddress } from '@/utils'

export default defineComponent({
  props: {
    loading: Boolean,
    onlyDeposit: {
      type: Boolean,
      default: false,
    },
    stakeAccount: {
      type: Object as () => ProgramAccount,
      required: true,
    },
  },
  emits: ['deposit', 'deactivate', 'withdraw'],
  setup(props, { emit }) {
    const connectionStore = useConnectionStore()
    const stakeActivation = ref<StakeActivationData>()
    const stateLoading = ref(true)

    watchEffect(async () => {
      stateLoading.value = true
      stakeActivation.value = await connectionStore.connection!.getStakeActivation(
        props.stakeAccount.pubkey,
      )
      stateLoading.value = false
    })

    return {
      address: computed(() => props.stakeAccount.pubkey.toBase58()),
      voter: computed(
        () => props.stakeAccount.account.data?.parsed?.info?.stake?.delegation?.voter,
      ),
      shortAddress: computed(() => shortenAddress(props.stakeAccount.pubkey.toBase58())),
      amount: computed(() => {
        return formatAmount(lamportsToSol(props.stakeAccount?.account?.lamports ?? 0))
      }),
      lamports: computed(() => props.stakeAccount?.account?.lamports),
      state: computed(() => stakeActivation.value?.state),
      stateColor: computed(() => {
        switch (stakeActivation.value?.state) {
          case 'active':
            return 'positive'
          case 'inactive':
            return 'negative'
          default:
            return 'grey'
        }
      }),
      stateLoading,
      deposit() {
        emit('deposit', props.stakeAccount)
      },
      deactivate(address: string) {
        emit('deactivate', address)
      },
      withdraw(address: string, lamports: number) {
        emit('withdraw', address, lamports)
      },
    }
  },
})
</script>

<template>
  <div class="q-item q-item-type row">
    <div class="col-12 col-sm-6">
      <q-item-label>
        <copy-to-clipboard :text="address" />
        <span class="q-mx-sm">{{ shortAddress }}</span>
        <!-- {{ voter }} -->
        <q-badge :color="stateColor">
          {{ state }}
        </q-badge>
      </q-item-label>
      <q-item-label caption>
        {{ amount }} SOL
      </q-item-label>
    </div>
    <div class="col-12 col-sm-6">
      <q-btn-group rounded unelevated>
        <template v-if="state === 'active'">
          <q-btn color="primary" @click="deposit">
            DEPOSIT
          </q-btn>
          <template v-if="!onlyDeposit">
            <q-btn color="primary-gray" @click="deactivate(address)">
              DEACTIVATE
            </q-btn>
          </template>
        </template>
        <template v-else>
          <q-btn
            :disabled="state === 'deactivating'"
            color="secondary"
            text-color="dark"
            @click="withdraw(address, lamports)"
          >
            WITHDRAW
          </q-btn>
        </template>
      </q-btn-group>
    </div>

    <q-inner-loading :showing="loading || stateLoading">
      <q-spinner color="primary" />
    </q-inner-loading>
  </div>
</template>

<style scoped lang="scss">
  .q-item {
    .q-btn-group {
      margin-left: 1.5rem;
    }
    .q-btn {
      font-size: 0.7rem;
    }
    @media (max-width: $breakpoint-xs-max) {
      text-align: center;
      .q-btn-group {
        margin: 0.5rem 0 0;
      }
    }
    @media (min-width: $breakpoint-xs) {
      .q-btn-group {
        float: right;
      }
    }
  }
</style>
