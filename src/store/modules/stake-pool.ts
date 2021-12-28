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

import { defineStore, storeToRefs } from 'pinia';
import { ref, watch, computed } from 'vue';
import { getStakePoolAccount } from '@/utils/spl';
import { useConnection, ACCOUNT_CHANGE_EVENT } from '@/store';
import { StakePool } from '@/utils/spl/schema';
import { divideBnToNumber } from '@/utils/spl/utils';
import { useEmitter } from '@/hooks';
import { POOL_CONNECTION_DELAY } from '@/config';

export const useStakePool = defineStore('stake-pool', () => {
  const emitter = useEmitter();
  const { connection, stakePoolAddress } = storeToRefs(useConnection());
  const stakePool = ref<StakePool | null>(null);
  const minRentBalance = ref(0);
  const reserveStakeBalance = ref(0);
  const lamportsPerSignature = ref(5000);

  const fees = ref({
    fee: 0,
    feeNext: 0,
    stakeDepositFee: 0,
    solDepositFee: 0,
    withdrawalFee: 0,
    solWithdrawalFee: 0,
    nextWithdrawalFee: 0,
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
    const reserveStake = await connection.value.getAccountInfo(stakePool.value!.reserveStake);
    reserveStakeBalance.value = reserveStake?.lamports ?? 0;
  }

  async function loadStakePool() {
    try {
      if (stakePoolAddress.value) {
        const stakePoolAccount = await getStakePoolAccount(connection.value, stakePoolAddress.value);
        stakePool.value = stakePoolAccount?.account.data as StakePool;
        await loadReserveStake();
      }
    } catch (e: any) {
      console.log('Error:', e);
      stakePool.value = null;
    }
  }

  setInterval(async () => {
    await loadStakePool();
  }, POOL_CONNECTION_DELAY);

  emitter.on(ACCOUNT_CHANGE_EVENT, loadStakePool);

  watch(stakePoolAddress, async () => {
    await loadStakePool();
  }, { immediate: true });

  watch(stakePool, async (sp) => {
    if (!sp) {
      exchangeRate.value = 1;
      fees.value.fee = 0;
      fees.value.feeNext = 0;
      fees.value.stakeDepositFee = 0;
      fees.value.solDepositFee = 0;
      fees.value.withdrawalFee = 0;
      fees.value.solWithdrawalFee = 0;
      fees.value.nextWithdrawalFee = 0;
      fees.value.nextSolWithdrawalFee = 0;
      fees.value.nextEpochFee = 0;
      fees.value.solReferralFee = 0;
      fees.value.stakeReferralFee = 0;
      return;
    }

    if (sp.poolTokenSupply.isZero() || sp.totalLamports.isZero()) {
      exchangeRate.value = 1;
    } else {
      exchangeRate.value = divideBnToNumber(sp.poolTokenSupply, sp.totalLamports);
    }

    fees.value.fee = divideBnToNumber(sp.epochFee.numerator, sp.epochFee.denominator);
    fees.value.stakeDepositFee = divideBnToNumber(sp.stakeDepositFee.numerator, sp.stakeDepositFee.denominator);
    fees.value.withdrawalFee = divideBnToNumber(sp.stakeWithdrawalFee.numerator, sp.stakeWithdrawalFee.denominator);
    fees.value.solWithdrawalFee = divideBnToNumber(sp.solWithdrawalFee.numerator, sp.solWithdrawalFee.denominator);
    fees.value.solDepositFee = divideBnToNumber(sp.solDepositFee.numerator, sp.solDepositFee.denominator);
    if (sp.nextEpochFee != undefined) {
      fees.value.nextEpochFee = divideBnToNumber(sp.nextEpochFee.numerator, sp.nextEpochFee.denominator);
    }
    if (sp.nextWithdrawalFee != undefined) {
      fees.value.nextWithdrawalFee = divideBnToNumber(sp.stakeWithdrawalFee.numerator, sp.stakeWithdrawalFee.denominator);
    }
    if (sp.nextSolWithdrawalFee != undefined) {
      fees.value.nextSolWithdrawalFee = divideBnToNumber(sp.nextSolWithdrawalFee.numerator, sp.nextSolWithdrawalFee.denominator);
    }
    if (sp.nextEpochFee != undefined) {
      fees.value.feeNext = divideBnToNumber(sp.nextEpochFee.numerator, sp.nextEpochFee.denominator);
    }
    fees.value.solReferralFee = sp.solReferralFee != undefined ? sp.solReferralFee : 0; 
    fees.value.stakeReferralFee = sp.stakeReferralFee != undefined ? sp.stakeReferralFee : 0; 
  });

  return {
    stakePoolAddress,
    stakePool,
    exchangeRate,
    minRentBalance,
    reserveStakeBalance,
    lamportsPerSignature,
    fees,
    loadReserveStake,
    connectionLost: computed(() => !stakePool.value),
  };
});
