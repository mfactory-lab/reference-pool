<template>
  <q-card class="wallet-balance">
    <q-card-section class="wallet-balance__head">
      <!--      <div class="row items-center">-->
      <!--        <div class="col">-->
      <!--          <q-btn-->
      <!--            class="q-manual-focusable&#45;&#45;focused text-no-wrap"-->
      <!--            rounded-->
      <!--            size="sm"-->
      <!--            unelevated-->
      <!--            @click="dialog = true"-->
      <!--          >-->
      <!--            STAKE ACCOUNTS ({{ stakeAccounts?.length ?? 0 }})-->
      <!--          </q-btn>-->
      <!--        </div>-->
      <!--        <div class="col text-right">-->
      WALLET
      <!--        </div>-->
      <!--      </div>-->
    </q-card-section>
    <q-card-section class="wallet-balance__body">
      <!-- <div class="wallet-balance__title">
        <q-badge>Portfolio</q-badge>
      </div> -->
      <q-list dense separator>
        <q-item >
          <q-item-section class="balance__value">
            <span>{{ formatPrice(solBalance) }}</span>
            <span class="balance__value__usd">${{ formatMoney(solUsd) }}</span>
          </q-item-section>
          <q-item-section side>
            <q-item-label>
              <img alt="" src="@/assets/img/sol-logo.svg" />
              <span>SOL</span>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section class="balance__value">
            {{ formatPrice(tokenBalance) }}
            <span class="balance__value__usd">${{ formatMoney(xsolUsd) }}</span>
          </q-item-section>
          <q-item-section side>
            <q-item-label>
              <token-svg />
              <span>xSOL</span>
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
              @click="dialog = true"
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
              <img alt="" src="@/assets/img/sol-logo.svg" />
              <span>SOL</span>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>

  <q-dialog v-model="dialog">
    <q-card>
      <q-card-section v-if="loadingStakeAccounts" class="flex flex-center">
        <q-spinner size="md" />
      </q-card-section>
      <template v-else>
        <q-card-section>
          <div class="text-h6 text-center">Stake Accounts</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-list
            v-if="stakeAccounts.length > 0"
            separator
            style="width: 400px"
          >
            <stake-account-item
              v-for="acc in stakeAccounts"
              :key="acc.pubkey"
              :stake-account="acc"
              @deactivate="deactivate"
              @withdraw="withdraw"
            />
          </q-list>
          <div v-else class="flex flex-center q-pa-lg">
            Your stake accounts will be shown here.
            <br />
            You don't have any valid stake accounts.
          </div>
        </q-card-section>
      </template>
    </q-card>
  </q-dialog>
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

import { useMonitorTransaction } from '@/hooks'
import { longPriceFormatter } from '@/utils'
import { ref, computed } from 'vue'

import { StakeProgram, PublicKey } from '@solana/web3.js'
import StakeAccountItem from '@/components/StakeAccountItem.vue'
import {
  sendTransaction,
  useConnection,
  useWallet,
  useBalance,
  useStakeAccounts,
  useStakePool,
  useExchangeRates,
} from '@/store'
import { storeToRefs } from 'pinia'
// @ts-ignore
import TokenSvg from '@/components/icons/TokenSvg.vue'

import { formatMoney } from '@/utils/check-number'

export default {
  components: { TokenSvg, StakeAccountItem },
  setup() {
    const { connection } = storeToRefs(useConnection())
    const { wallet } = storeToRefs(useWallet())
    const { solBalance, tokenBalance } = storeToRefs(useBalance())
    const { monitorTransaction, sending } = useMonitorTransaction()
    const stakeAccounts = useStakeAccounts()
    const { solPrice } = storeToRefs(useExchangeRates())
    const { exchangeRate } = storeToRefs(useStakePool())

    const dialog = ref(false)

    return {
      deactivate: async (address: string) => {
        await monitorTransaction(
          sendTransaction(
            connection.value!,
            wallet.value!,
            StakeProgram.deactivate({
              stakePubkey: new PublicKey(address),
              authorizedPubkey: wallet.value!.publicKey!,
            }).instructions,
            []
          )
        )
        dialog.value = false
      },
      withdraw: async (address: string, lamports: number) => {
        await monitorTransaction(
          sendTransaction(
            connection.value!,
            wallet.value!,
            StakeProgram.withdraw({
              stakePubkey: new PublicKey(address),
              authorizedPubkey: wallet.value!.publicKey!,
              toPubkey: wallet.value!.publicKey!,
              lamports: lamports,
            }).instructions,
            []
          )
        )
        await stakeAccounts.load()
        dialog.value = false
      },
      sending,
      dialog,
      tokenBalance,
      solBalance,
      stakeSolBalance: computed(() => stakeAccounts.stakeSolBalance),
      loading: computed(() => stakeAccounts.loading),
      stakeAccounts: computed(() => stakeAccounts.data),
      formatPrice: (v: number) => longPriceFormatter.format(v),
      formatMoney: (v: number) => formatMoney(v),
      solUsd: computed(() => solPrice.value * solBalance.value),
      xsolUsd: computed(() => solPrice.value * tokenBalance.value / exchangeRate.value),
      stackedUsd: computed(() => solPrice.value * stakeAccounts.stakeSolBalance),
    }
  },
}
</script>
