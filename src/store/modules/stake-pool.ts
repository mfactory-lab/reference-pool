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

import { defineStore } from 'pinia';
import { computed, reactive, ref, watch } from 'vue';
import { ACCOUNT_CHANGE_EVENT, useConnectionStore } from '@/store';
import { useEmitter } from '@/hooks';

import { StakePool, getStakePoolAccount } from '@solana/spl-stake-pool';
import { divideBnToNumber } from '@solana/spl-stake-pool/src/utils';

import { POOL_CONNECTION_DELAY } from '@/config';
import { StakeProgram } from '@solana/web3.js';

export const useStakePoolStore = defineStore('stake-pool', () => {
  const connectionStore = useConnectionStore();
  const emitter = useEmitter();

  const stakePool = ref<StakePool | null>();
  const minRentBalance = ref<number>(0);
  const reserveStakeBalance = ref<number>(0);
  const lamportsPerSignature = ref<number>(5000); // TODO: getFeeCalculatorForBlockhash

  const fees = reactive({
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
  });

  const exchangeRate = ref(1);

  async function loadReserveStake() {
    if (!stakePool.value) {
      return;
    }
    const reserveStakeAddress = stakePool.value!.reserveStake.toBase58();
    console.log('Loading reserve stake balance from', reserveStakeAddress);
    const reserveStake = await connectionStore.connection.getAccountInfo(
      stakePool.value!.reserveStake,
    );
    reserveStakeBalance.value = reserveStake?.lamports ?? 0;
    console.log('Reserve Stake Balance:', reserveStakeBalance.value);
  }

  async function loadStakePool() {
    try {
      console.log('Loading stake pool info...');
      if (connectionStore.stakePoolAddress) {
        const stakePoolAccount = await getStakePoolAccount(
          connectionStore.connection,
          connectionStore.stakePoolAddress,
        );
        stakePool.value = stakePoolAccount?.account.data as StakePool;
        await loadReserveStake();
      }
    } catch (e: any) {
      console.log('Error:', e);
      stakePool.value = null;
    }
  }

  async function loadMinRentBalance() {
    minRentBalance.value = await connectionStore.connection.getMinimumBalanceForRentExemption(
      StakeProgram.space,
    );
    console.log(`MinimumBalanceForRentExemption:`, minRentBalance.value);
  }

  setInterval(async () => {
    await loadStakePool();
  }, POOL_CONNECTION_DELAY);

  // TODO: don't reload when transaction error
  emitter.on(ACCOUNT_CHANGE_EVENT, loadStakePool);

  watch(
    () => connectionStore.stakePoolAddress,
    () => Promise.all([loadStakePool(), loadMinRentBalance()]),
    { immediate: true },
  );

  // watch(reserveStakeBalance, async (con) => {
  //   const { blockhash } = await con.getRecentBlockhash('max');
  //   fees.txFee = (await con.getFeeCalculatorForBlockhash(blockhash)).value?.lamportsPerSignature ?? 0;
  //   // minRentBalance.value = (await con.getMinimumBalanceForRentExemption(STAKE_STATE_LEN)) + 1;
  // }, { immediate: true });

  watch(stakePool, async (sp) => {
    if (!sp) {
      // TODO: refactory
      exchangeRate.value = 1;
      fees.fee = 0;
      fees.feeNext = 0;
      fees.stakeDepositFee = 0;
      fees.solDepositFee = 0;
      fees.withdrawalFee = 0;
      fees.solWithdrawalFee = 0;
      fees.nextStakeWithdrawalFee = 0;
      fees.nextSolWithdrawalFee = 0;
      fees.nextEpochFee = 0;
      fees.solReferralFee = 0;
      fees.stakeReferralFee = 0;
      return;
    }

    if (sp.poolTokenSupply.isZero() || sp.totalLamports.isZero()) {
      exchangeRate.value = 1;
    } else {
      exchangeRate.value = divideBnToNumber(sp.poolTokenSupply, sp.totalLamports);
    }

    // console.log('CalcLamportsWithdrawAmount:', calcLamportsWithdrawAmount(sp, solToLamports(1)));

    console.log('sp ======================== ', sp);
    console.log('TotalStakeLamports:', sp.totalLamports.toNumber());
    console.log('PoolTokenSupply:', sp.poolTokenSupply.toNumber());
    console.log('ExchangeRate:', exchangeRate.value);
    console.log('Fees:', fees);

    fees.fee = divideBnToNumber(sp.epochFee.numerator, sp.epochFee.denominator);
    fees.stakeDepositFee = divideBnToNumber(
      sp.stakeDepositFee.numerator,
      sp.stakeDepositFee.denominator,
    );
    fees.withdrawalFee = divideBnToNumber(
      sp.stakeWithdrawalFee.numerator,
      sp.stakeWithdrawalFee.denominator,
    );
    fees.solWithdrawalFee = divideBnToNumber(
      sp.solWithdrawalFee.numerator,
      sp.solWithdrawalFee.denominator,
    );
    fees.solDepositFee = divideBnToNumber(sp.solDepositFee.numerator, sp.solDepositFee.denominator);
    if (sp.nextEpochFee != undefined) {
      fees.nextEpochFee = divideBnToNumber(sp.nextEpochFee.numerator, sp.nextEpochFee.denominator);
    }
    if (sp.nextStakeWithdrawalFee != undefined) {
      fees.nextStakeWithdrawalFee = divideBnToNumber(
        sp.stakeWithdrawalFee.numerator,
        sp.stakeWithdrawalFee.denominator,
      );
    }
    if (sp.nextSolWithdrawalFee != undefined) {
      fees.nextSolWithdrawalFee = divideBnToNumber(
        sp.nextSolWithdrawalFee.numerator,
        sp.nextSolWithdrawalFee.denominator,
      );
    }
    if (sp.nextEpochFee != undefined) {
      fees.feeNext = divideBnToNumber(sp.nextEpochFee.numerator, sp.nextEpochFee.denominator);
    }
    fees.solReferralFee = sp.solReferralFee != undefined ? sp.solReferralFee : 0;
    fees.stakeReferralFee = sp.stakeReferralFee != undefined ? sp.stakeReferralFee : 0;
  });

  const stakePoolAddress = computed(() => connectionStore.stakePoolAddress);
  const connectionLost = computed(() => !stakePool.value);

  return {
    fees,
    stakePool,
    exchangeRate,
    minRentBalance,
    reserveStakeBalance,
    lamportsPerSignature,
    stakePoolAddress,
    connectionLost,
    loadReserveStake,
  };
});
