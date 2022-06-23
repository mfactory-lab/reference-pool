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
import { evaClose, evaRefresh } from '@quasar/extras/eva-icons'
import { PublicKey, StakeProgram } from '@solana/web3.js'
import { useAnchorWallet, useWallet } from 'solana-wallets-vue'
import type { ProgramAccount } from '@/store'
import {
  useConnectionStore,
  useStakeAccountStore,
} from '@/store'
import { useDeposit, useMonitorTransaction } from '@/hooks'
import { sendTransaction } from '@/utils'

export default defineComponent({
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
    const stakeAccounts = useStakeAccountStore()
    const { monitorTransaction } = useMonitorTransaction()
    const { depositStake } = useDeposit()

    const dialog = computed(() => stakeAccounts.dialog)
    const loading = computed(() => stakeAccounts.loading)
    const loadingPubkey = ref()

    return {
      dialog,
      loading,
      loadingPubkey,

      accounts: computed(() => {
        if (props.voter) {
          return stakeAccounts.data.filter(
            acc => acc.account.data?.parsed?.info?.stake?.delegation?.voter === props.voter,
          )
        }
        return stakeAccounts.data
      }),

      updateDialog: (v: boolean) => (stakeAccounts.dialog = v),

      deposit: async (stakeAccount: ProgramAccount) => {
        emit('beforeDeposit')
        loadingPubkey.value = stakeAccount.pubkey.toBase58()
        const success = await depositStake(stakeAccount)
        if (success) {
          stakeAccounts.removeAccount(stakeAccount.pubkey.toBase58())
        }
        loadingPubkey.value = null
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
          {
            commitment: 'finalized',
          },
        )
        loadingPubkey.value = null
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
          {
            onSuccess: () => stakeAccounts.removeAccount(address),
          },
        )
        loadingPubkey.value = null
        emit('afterWithdraw')
      },

      refresh() {
        stakeAccounts.load()
      },
      icons: {
        close: evaClose,
        refresh: evaRefresh,
      },
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
            <q-btn rounded unelevated dense size="sm" :icon="icons.refresh" @click="refresh" />
          </div>
          <q-btn
            padding="md"
            color="transparent"
            text-color="primary-gray"
            unelevated
            class="absolute-right"
            :icon="icons.close"
            size="md"
            @click="updateDialog(false)"
          />
        </q-card-section>

        <q-separator />

        <q-card-section class="scroll" style="max-height: 70vh">
          <q-list v-if="accounts.length > 0" separator style="width: 500px">
            <stake-account-item
              v-for="acc in accounts"
              :key="acc.pubkey.toBase58()"
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
