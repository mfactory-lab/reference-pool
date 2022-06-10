/*
 * This file is part of Solana Reference Stake Pool code.
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

import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { computed, ref, toRef, watch } from 'vue'
import type { PublicKey } from '@solana/web3.js'
import { StakeProgram } from '@solana/web3.js'
import { getStakePoolAccount } from '@solana/spl-stake-pool'
import type { StakePool } from '@solana/spl-stake-pool/src/layouts'
import { divideBnToNumber } from '@solana/spl-stake-pool/src/utils'
import { useIntervalFn } from '@vueuse/core'
import { useConnectionStore } from '@/store'
import { ACCOUNT_CHANGE_EVENT, useEmitter } from '@/hooks'
import { POOL_RELOAD_INTERVAL } from '@/config'

export interface StakePoolStore {
  stakePool: Ref<StakePool | undefined>
  exchangeRate: Ref<number>
  minRentBalance: Ref<number>
  reserveStakeBalance: Ref<number>
  lamportsPerSignature: Ref<number>
  fees: any
  stakePoolAddress: Ref<PublicKey | null>
  connectionLost: Ref<boolean>
  loadReserveStake(): void
}

export const useStakePoolStore = defineStore('stake-pool', (): StakePoolStore => {
  const connectionStore = useConnectionStore()
  const emitter = useEmitter()

  const stakePool = ref<StakePool>()
  const minRentBalance = ref(0)
  const reserveStakeBalance = ref(0)
  const lamportsPerSignature = ref(5000) // TODO: getFeeCalculatorForBlockhash
  const exchangeRate = ref(1)
  const fees = ref({
    fee: 0,
    feeNext: 0,
    stakeDepositFee: 0,
    solDepositFee: 0,
    withdrawalFee: 0,
    solWithdrawalFee: 0,
    nextStakeWithdrawalFee: 0,
    nextSolWithdrawalFee: 0,
    nextEpochFee: 0,
    solReferralFee: 0,
    stakeReferralFee: 0,
  })

  const stakePoolAddress = toRef(connectionStore, 'stakePoolAddress')
  const connectionLost = computed(() => !stakePool.value)

  async function loadReserveStake() {
    if (!stakePool.value) {
      return
    }
    const reserveStakeAddress = stakePool.value!.reserveStake.toBase58()
    console.log('Loading reserve stake balance from', reserveStakeAddress)
    const reserveStake = await connectionStore.connection.getAccountInfo(
      stakePool.value!.reserveStake,
    )
    reserveStakeBalance.value = reserveStake?.lamports ?? 0
    console.log('Reserve Stake Balance:', reserveStakeBalance.value)
  }

  async function loadStakePool() {
    if (!stakePoolAddress.value) {
      stakePool.value = undefined
      return
    }
    try {
      console.log('[StakePool] Load:', stakePoolAddress.value?.toBase58())
      const stakePoolAccount = await getStakePoolAccount(
        connectionStore.connection,
        stakePoolAddress.value,
      )
      stakePool.value = stakePoolAccount?.account.data as StakePool
      console.log('[StakePool] Result:', stakePool.value)
      await loadReserveStake()
    } catch (e: any) {
      console.error('[StakePool] Error:', e)
      stakePool.value = undefined
    }
  }

  async function loadMinRentBalance() {
    minRentBalance.value = await connectionStore.connection.getMinimumBalanceForRentExemption(
      StakeProgram.space,
    )
    // console.log(`MinimumBalanceForRentExemption:`, minRentBalance.value);
  }

  // TODO: don't reload when transaction error
  emitter.on(ACCOUNT_CHANGE_EVENT, loadStakePool)

  useIntervalFn(loadStakePool, POOL_RELOAD_INTERVAL)

  watch(
    stakePoolAddress,
    () => {
      return Promise.all([loadStakePool(), loadMinRentBalance()])
    },
    {
      immediate: true,
    },
  )

  // watch(reserveStakeBalance, async (con) => {
  //   const { blockhash } = await con.getRecentBlockhash('max');
  //   fees.txFee = (await con.getFeeCalculatorForBlockhash(blockhash)).value?.lamportsPerSignature ?? 0;
  //   // minRentBalance.value = (await con.getMinimumBalanceForRentExemption(STAKE_STATE_LEN)) + 1;
  // }, { immediate: true });

  watch(stakePool, async (sp) => {
    if (!sp) {
      // TODO: refactory
      exchangeRate.value = 1
      fees.value.fee = 0
      fees.value.feeNext = 0
      fees.value.stakeDepositFee = 0
      fees.value.solDepositFee = 0
      fees.value.withdrawalFee = 0
      fees.value.solWithdrawalFee = 0
      fees.value.nextStakeWithdrawalFee = 0
      fees.value.nextSolWithdrawalFee = 0
      fees.value.nextEpochFee = 0
      fees.value.solReferralFee = 0
      fees.value.stakeReferralFee = 0
      return
    }

    if (sp.poolTokenSupply.isZero() || sp.totalLamports.isZero()) {
      exchangeRate.value = 1
    } else {
      exchangeRate.value = divideBnToNumber(sp.poolTokenSupply, sp.totalLamports)
    }

    // console.log('CalcLamportsWithdrawAmount:', calcLamportsWithdrawAmount(sp, solToLamports(1)));

    // console.log('sp ======================== ', sp);
    console.log('TotalStakeLamports:', sp.totalLamports.toNumber())
    console.log('PoolTokenSupply:', sp.poolTokenSupply.toNumber())
    console.log('ExchangeRate:', exchangeRate.value)
    // console.log('Fees:', fees.value);

    fees.value.fee = divideBnToNumber(sp.epochFee.numerator, sp.epochFee.denominator)
    fees.value.stakeDepositFee = divideBnToNumber(
      sp.stakeDepositFee.numerator,
      sp.stakeDepositFee.denominator,
    )
    fees.value.withdrawalFee = divideBnToNumber(
      sp.stakeWithdrawalFee.numerator,
      sp.stakeWithdrawalFee.denominator,
    )
    fees.value.solWithdrawalFee = divideBnToNumber(
      sp.solWithdrawalFee.numerator,
      sp.solWithdrawalFee.denominator,
    )
    fees.value.solDepositFee = divideBnToNumber(
      sp.solDepositFee.numerator,
      sp.solDepositFee.denominator,
    )
    if (sp.nextEpochFee?.numerator) {
      fees.value.nextEpochFee = divideBnToNumber(
        sp.nextEpochFee.numerator,
        sp.nextEpochFee.denominator,
      )
    }
    if (sp.nextStakeWithdrawalFee?.numerator) {
      fees.value.nextStakeWithdrawalFee = divideBnToNumber(
        sp.nextStakeWithdrawalFee.numerator,
        sp.nextStakeWithdrawalFee.denominator,
      )
    }
    if (sp.nextSolWithdrawalFee?.numerator) {
      fees.value.nextSolWithdrawalFee = divideBnToNumber(
        sp.nextSolWithdrawalFee.numerator,
        sp.nextSolWithdrawalFee.denominator,
      )
    }
    if (sp.nextEpochFee) {
      fees.value.feeNext = divideBnToNumber(sp.nextEpochFee.numerator, sp.nextEpochFee.denominator)
    }
    fees.value.solReferralFee = sp.solReferralFee ?? 0
    fees.value.stakeReferralFee = sp.stakeReferralFee ?? 0
  })

  return {
    stakePool,
    exchangeRate,
    minRentBalance,
    reserveStakeBalance,
    lamportsPerSignature,
    stakePoolAddress,
    connectionLost,
    fees,
    loadReserveStake,
  }
})
