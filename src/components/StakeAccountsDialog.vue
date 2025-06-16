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
import { useAnchorWallet } from '@solana/wallet-adapter-vue'
import { PublicKey, StakeProgram } from '@solana/web3.js'
import type { ProgramAccount } from '~/store'
import { sendTransaction } from '~/utils'

const emit = defineEmits(['beforeDeposit', 'afterDeposit', 'beforeDeactivate', 'afterDeactivate', 'beforeWithdraw', 'afterWithdraw'])

const { width } = useWindowSize()

const connectionStore = useConnectionStore()
const { publicKey } = useClientWallet()
const anchorWallet = import.meta.client ? useAnchorWallet() : ref(null)
const stakeAccounts = useStakeAccountStore()
const { monitorTransaction } = useMonitorTransaction()
const { depositStake } = useDeposit()

const dialog = computed(() => stakeAccounts.dialog)
const loadingPubkey = ref()

const accounts = computed(() => stakeAccounts.accountsFull)

function updateDialog(v: boolean) {
  (stakeAccounts.dialog = v)
}

async function deposit(stakeAccount: ProgramAccount) {
  emit('beforeDeposit')
  loadingPubkey.value = stakeAccount.pubkey.toBase58()
  const success = await depositStake(stakeAccount)
  if (success) {
    stakeAccounts.removeAccount(stakeAccount.pubkey.toBase58())
  }
  loadingPubkey.value = null
  emit('afterDeposit')
}

async function deactivate(address: string) {
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
}

async function withdraw(address: string, lamports: number) {
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
}
</script>

<template>
  <j-dialog v-model="dialog" class-name="stake-accounts-dialog" title="Stake Accounts" @update:model-value="updateDialog">
    <div v-if="accounts.length > 0" :style="{ width: width < 650 ? '100%' : '500px' }">
      <stake-account-item
        v-for="acc in accounts"
        :key="acc.stakeAccount.pubkey.toBase58()"
        :account="acc"
        :loading="acc.stakeAccount.pubkey.toBase58() === loadingPubkey"
        @deactivate="deactivate"
        @withdraw="withdraw"
        @deposit="deposit"
      />
    </div>
    <div v-else class="flex flex-center q-pa-lg">
      Your stake accounts will be shown here.
      <br>
      You don't have any valid stake accounts.
    </div>
  </j-dialog>
</template>

<style lang="scss">
.stake-accounts-dialog {
  .stake-acc__item:not(:last-child) {
    margin-bottom: 10px;
  }
}
</style>
