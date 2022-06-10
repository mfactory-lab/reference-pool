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
import { computed, defineComponent, ref } from 'vue'
import { evaClose } from '@quasar/extras/eva-icons'
import { PublicKey, StakeProgram } from '@solana/web3.js'
import { useAnchorWallet, useWallet } from 'solana-wallets-vue'
import type { ProgramAccount } from '@/store'
import {
  useConnectionStore,
  useStakeAccountStore,
} from '@/store'
import { useDeposit, useMonitorTransaction } from '@/hooks'
import StakeAccountItem from '@/components/StakeAccountItem.vue'
import { sendTransaction } from '@/utils'

export default defineComponent({
  components: { StakeAccountItem },
  props: {
    voter: {
      type: String,
      required: false,
    },
  },
  emits: [
    'beforeDeposit',
    'afterDeposit',
    'beforeDeactivate',
    'afterDeactivate',
    'beforeWithdraw',
    'afterWithdraw',
  ],
  setup(props, { emit }) {
    const connectionStore = useConnectionStore()
    const { publicKey } = useWallet()
    const anchorWallet = useAnchorWallet()
    const stakeAccountStore = useStakeAccountStore()
    const { monitorTransaction } = useMonitorTransaction()
    const { depositStake } = useDeposit()

    const dialog = computed(() => stakeAccountStore.dialog)
    const loading = computed(() => stakeAccountStore.loading)
    const loadingPubkey = ref()

    return {
      dialog,
      loading,
      loadingPubkey,

      accounts: computed(() => {
        if (props.voter) {
          return stakeAccountStore.data.filter(
            acc => acc.account.data?.parsed?.info?.stake?.delegation?.voter === props.voter,
          )
        }
        return stakeAccountStore.data
      }),

      updateDialog: (v: boolean) => (stakeAccountStore.dialog = v),

      deposit: async (stakeAccount: ProgramAccount) => {
        emit('beforeDeposit')
        loadingPubkey.value = stakeAccount.pubkey.toBase58()
        await depositStake(stakeAccount)
        loadingPubkey.value = null
        await stakeAccountStore.load()
        emit('afterDeposit')
      },

      deactivate: async (address: string) => {
        emit('beforeDeactivate')
        loadingPubkey.value = address
        await monitorTransaction(
          sendTransaction(
            connectionStore.connection,
            anchorWallet.value!,
            StakeProgram.deactivate({
              stakePubkey: new PublicKey(address),
              authorizedPubkey: publicKey.value!,
            }).instructions,
            [],
          ),
        )
        loadingPubkey.value = null
        await stakeAccountStore.load()
        emit('afterDeactivate')
      },

      withdraw: async (address: string, lamports: number) => {
        emit('beforeWithdraw')
        loadingPubkey.value = address
        await monitorTransaction(
          sendTransaction(
            connectionStore.connection,
            anchorWallet.value!,
            StakeProgram.withdraw({
              stakePubkey: new PublicKey(address),
              authorizedPubkey: publicKey.value!,
              toPubkey: publicKey.value!,
              lamports,
              // custodianPubkey: wallet.value!.publicKey!,
            }).instructions,
            [],
          ),
        )
        loadingPubkey.value = null
        await stakeAccountStore.load()
        emit('afterWithdraw')
      },
      evaClose,
    }
  },
})
</script>

<template>
  <q-dialog v-model="dialog" @update:model-value="updateDialog">
    <q-card>
      <q-card-section v-if="loading" class="flex flex-center">
        <q-spinner size="md" />
      </q-card-section>

      <template v-else>
        <q-card-section class="relative-position">
          <div class="text-h6 text-center">
            Stake Accounts
          </div>
          <q-btn
            padding="md"
            color="transparent"
            text-color="primary-gray"
            unelevated
            class="absolute-right"
            :icon="evaClose"
            size="md"
            @click="updateDialog(false)"
          />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-list v-if="accounts.length > 0" separator style="width: 500px">
            <StakeAccountItem
              v-for="acc in accounts"
              :key="acc.pubkey"
              :stake-account="acc"
              :loading="acc.pubkey.toBase58() === loadingPubkey"
              @deactivate="deactivate"
              @withdraw="withdraw"
              @deposit="deposit"
            />
          </q-list>
          <div v-else class="flex flex-center q-pa-lg">
            Your stake accounts will be shown here.
            <br>
            You don't have any valid stake accounts.
          </div>
        </q-card-section>
      </template>
    </q-card>
  </q-dialog>
</template>
