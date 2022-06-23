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
import { computed, defineComponent } from 'vue'
import { useStakePoolStore } from '@/store'
import { formatPct } from '@/utils'

export default defineComponent({
  setup() {
    const stakePool = useStakePoolStore()
    const stakePoolAddress = computed(() => stakePool.stakePoolAddress?.toBase58() ?? '')
    const fees = computed(() => stakePool.fees)

    return {
      stakePoolAddress,
      fees,
      formatPct(v: number) {
        return formatPct.format(v)
      },
    }
  },
})
</script>

<template>
  <q-page>
    <div class="container q-pb-xl">
      <div class="page-title">
        Stake Pool Info
      </div>
      <div class="container q-pb-xl">
        Stake Pool: <b :style="{ wordBreak: 'break-all' }">{{ stakePoolAddress }}</b> <copy-to-clipboard :text="stakePoolAddress" />

        <br>
        <br>

        <p>
          Epoch Fee: <b>{{ formatPct(fees.fee) }}</b> of epoch rewards
        </p>
        <p>
          Epoch Fee, starting next epoch: <b>{{ formatPct(fees.feeNext) }}</b> of epoch rewards
        </p>
        <p>
          Withdrawal: <b>{{ formatPct(fees.withdrawalFee) }}</b> of withdrawal amount
        </p>
        <p>
          Withdrawal, starting next epoch: <b>{{ formatPct(fees.nextStakeWithdrawalFee) }}</b> of
          withdrawal amount
        </p>
        <p>
          Instant Withdrawal: <b>{{ formatPct(fees.solWithdrawalFee) }}</b> of withdrawal amount
        </p>
        <p>
          Instant Withdrawal, starting next epoch:
          <b>{{ formatPct(fees.nextSolWithdrawalFee) }}</b> of withdrawal amount
        </p>
        <p>
          Stake Deposit Fee: <b>{{ formatPct(fees.stakeDepositFee) }}</b>
        </p>
        <p>
          SOL Deposit Fee: <b>{{ formatPct(fees.solDepositFee) }}</b> of deposit amount
        </p>
        <p>
          SOL Deposit Referral Fee: <b>{{ formatPct(fees.solReferralFee) }}</b>
        </p>
        <p>
          Stake Deposit Referral Fee: <b>{{ formatPct(fees.stakeReferralFee) }}</b>
        </p>
      </div>
    </div>
  </q-page>
</template>
