<template>
  <q-item>
    <q-item-section>
      <q-item-label class="items-center">
        <copy-to-clipboard :text="address" />
        <span class="q-mx-sm">{{ shortAddress }}</span>
        <q-badge :color="stateColor">
          {{ state }}
        </q-badge>
      </q-item-label>
      <q-item-label caption>
        {{ amount }} SOL
      </q-item-label>
    </q-item-section>

    <q-item-section side>
      <template v-if="state === 'active'">
        <q-btn
          color="accent"
          rounded
          style="width:120px"
          unelevated
          @click="deactivate(address)"
        >
          DEACTIVATE
        </q-btn>
      </template>
      <template v-else>
        <q-btn
          :disabled="state==='deactivating'"
          color="primary"
          rounded
          style="width:120px"
          unelevated
          @click="withdraw(address, lamports)"
        >
          WITHDRAW
        </q-btn>
      </template>
    </q-item-section>

    <q-inner-loading :showing="loading">
      <q-spinner color="primary" />
    </q-inner-loading>
  </q-item>
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

import { StakeActivationData } from '@solana/web3.js';
import { watchEffect, ref, computed, defineComponent } from 'vue';
import { lamportsToSol, shortenAddress, formatAmount } from '@/utils';
import { StakePoolAccount } from '@/utils/spl';
import CopyToClipboard from '@/components/CopyToClipboard.vue';
import { storeToRefs } from 'pinia';
import { useConnection } from '@/store';

export default defineComponent({
  components: { CopyToClipboard },
  props: {
    stakeAccount: {
      type: Object as () => StakePoolAccount,
      required: true,
    },
  },
  setup(props, { emit }) {
    const { connection } = storeToRefs(useConnection());

    const stakeActivation = ref<StakeActivationData>();
    const loading = ref(true);

    watchEffect(async () => {
      loading.value = true;
      stakeActivation.value = await connection.value!.getStakeActivation(props.stakeAccount.pubkey);
      loading.value = false;
    });

    return {
      address: computed(() => props.stakeAccount.pubkey.toBase58()),
      shortAddress: computed(() => shortenAddress(props.stakeAccount.pubkey.toBase58())),
      amount: computed(() => {
        return formatAmount(lamportsToSol(props.stakeAccount?.account?.lamports ?? 0))
      }),
      lamports: computed(() => props.stakeAccount?.account?.lamports),
      state: computed(() => stakeActivation.value?.state),
      stateColor: computed(() => {
        switch (stakeActivation.value?.state) {
          case 'active':
            return 'positive';
          case 'inactive':
            return 'negative';
          default:
            return 'grey';
        }
      }),
      loading,
      deactivate(address: string) {
        emit('deactivate', address);
      },
      withdraw(address: string, lamports: number) {
        emit('withdraw', address, lamports);
      },
    };
  },
});
</script>
