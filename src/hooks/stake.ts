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

import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useDebounce } from '@vueuse/core';
import { PublicKey } from '@solana/web3.js';
import { depositSol, depositStake, withdrawSol, withdrawStake } from '@solana/spl-stake-pool';
import { ValidatorAccount } from '@solana/spl-stake-pool/src/utils/stake';
import { formatAmount, lamportsToSol, solToLamports } from '@/utils';
import { ProgramAccount } from '@/store';

import {
  loadApyInfo,
  sendTransaction,
  useBalanceStore,
  useConnectionStore,
  useEpochStore,
  useStakePoolStore,
  useWalletStore,
} from '@/store';
import { useMonitorTransaction } from './monitor';

import { WITHDRAW_SOL_ACTIVE } from '@/config';

export function useDeposit() {
  const connectionStore = useConnectionStore();
  const stakePoolStore = useStakePoolStore();

  const walletStore = useWalletStore();
  const { wallet, connected } = storeToRefs(walletStore);
  const { monitorTransaction, sending } = useMonitorTransaction();
  const { nativeBalance, hasTokenAccount } = storeToRefs(useBalanceStore());
  const { notify } = useQuasar();
  const loading = ref(false);
  const stakeSuccessDialog = ref(false);

  const solStaked = computed(() => stakePoolStore.stakePool?.totalLamports.toNumber() ?? 0);
  const remainingAmount = computed(() =>
    Math.max(0, solToLamports(connectionStore.stakeLimit) - solStaked.value),
  );

  return {
    stakeSuccessDialog,
    depositFee: computed(
      () =>
        stakePoolStore.lamportsPerSignature * 2 +
        (!hasTokenAccount.value ? stakePoolStore.minRentBalance : 0),
    ),
    depositing: computed(() => loading.value || sending.value),
    depositStake: async (stakeAccount: ProgramAccount) => {
      try {
        // const stakeActivation = await connection.value!.getStakeActivation(stakeAccount.pubkey);

        const voter = stakeAccount.account.data?.parsed?.info?.stake?.delegation?.voter;
        if (!voter) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error('Wrong stake account state, must be delegated to validator');
        }

        const { rentFee, instructions, signers } = await depositStake(
          connectionStore.connection,
          connectionStore.stakePoolAddress!,
          wallet.value!.publicKey!,
          new PublicKey(voter),
          stakeAccount.pubkey,
        );

        if (nativeBalance.value < rentFee) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error(
            `Insufficient balance, at least ${lamportsToSol(rentFee)} SOL are required.`,
          );
        }

        await monitorTransaction(
          sendTransaction(connectionStore.connection, wallet.value!, instructions, signers),
        );

        return true;
      } catch (e: any) {
        notify({ message: e.message, type: 'negative' });
        throw e;
      } finally {
        loading.value = false;
      }
    },
    depositSol: async (amount = 1) => {
      if (!connected.value) {
        return false;
      }
      try {
        // console.log('stakeLimit', solToLamports(stakeLimit.value));
        // console.log('solStaked', solStaked.value);
        // console.log('StakeRemainingAmount', remainingAmount.value);

        const lamports = solToLamports(amount);

        if (connectionStore.stakeLimit > 0 && lamports > remainingAmount.value) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error(
            `Stake limit is reached. Available to stake ${formatAmount(remainingAmount.value)} SOL`,
          );
        }

        loading.value = true;

        const { rentFee, instructions, signers } = await depositSol(
          connectionStore.connection,
          connectionStore.stakePoolAddress!,
          wallet.value!.publicKey!,
          lamports,
        );

        if (nativeBalance.value < rentFee) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error(
            `Insufficient balance, at least ${lamportsToSol(rentFee)} SOL are required.`,
          );
        }

        await monitorTransaction(
          sendTransaction(connectionStore.connection, wallet.value!, instructions, signers),
          { onSuccess: () => (stakeSuccessDialog.value = true) },
        );

        return true;
      } catch (e: any) {
        notify({ message: e.message, type: 'negative' });
        throw e;
      } finally {
        loading.value = false;
      }
    },
  };
}

export function useWithdraw() {
  const { notify } = useQuasar();
  const { monitorTransaction, sending } = useMonitorTransaction();

  const connectionStore = useConnectionStore();
  const stakePoolStore = useStakePoolStore();

  const { wallet, connected } = storeToRefs(useWalletStore());
  const { epochInfo } = storeToRefs(useEpochStore());

  const stakePool = computed(() => stakePoolStore.stakePool);
  const reserveStakeBalance = computed(() => stakePoolStore.reserveStakeBalance);

  const useReserve = ref(false);
  const useWithdrawSol = ref(true);
  const loading = ref(false);
  const amount = ref(0);

  watch(useDebounce(amount, 50), async (amount) => {
    if (WITHDRAW_SOL_ACTIVE && stakePool.value?.reserveStake) {
      const poolAmount = solToLamports(amount);
      if (reserveStakeBalance.value > poolAmount) {
        useWithdrawSol.value = true;
        return;
      }
    }
    useWithdrawSol.value = false;
  });

  return {
    amount,
    useWithdrawSol,
    setAmount: (val: number) => (amount.value = Number(val)),
    useReserve: (val = true) => (useReserve.value = val),
    // TODO: find a better way
    // withdrawFee: computed(() => lamportsPerSignature.value * (useWithdrawSol.value ? 2 : 3)),
    withdrawFee: computed(() => stakePoolStore.lamportsPerSignature * 3),
    withdrawSolFee: computed(() => stakePoolStore.lamportsPerSignature * 2),
    withdrawing: computed(() => loading.value || sending.value),
    withdraw: async (forceDelayed = false) => {
      if (!connected.value) {
        throw new Error('Wallet not connected');
      }
      if (amount.value <= 0) {
        return false;
      }
      try {
        loading.value = true;

        // Try to use "withdraw sol"
        if (useWithdrawSol.value && !forceDelayed) {
          console.log('------------------------');
          console.log('|- WITHDRAW SOL');
          console.log('------------------------');

          const { instructions, signers } = await withdrawSol(
            connectionStore.connection,
            connectionStore.stakePoolAddress!,
            wallet.value!.publicKey!,
            wallet.value!.publicKey!,
            amount.value,
          );

          await monitorTransaction(
            sendTransaction(connectionStore.connection, wallet.value!, instructions, signers),
          );

          return true;
        }

        const { instructions, signers } = await withdrawStake(
          connectionStore.connection,
          connectionStore.stakePoolAddress!,
          wallet.value!.publicKey!,
          amount.value,
          useReserve.value,
          undefined,
          undefined,
          undefined,
          epochInfo.value?.epoch ? await prepareApyComparator(epochInfo.value.epoch) : undefined,
        );

        await monitorTransaction(
          sendTransaction(connectionStore.connection, wallet.value!, instructions, signers),
        );

        return true;
      } catch (e: any) {
        notify({ message: e.message, type: 'negative' });
        throw e;
      } finally {
        loading.value = false;
      }
    },
  };
}

/**
 * Try to use APY comparator instead of lamport
 * @param {number} epoch
 * @returns {Promise<((a: ValidatorAccount, b: ValidatorAccount) => number) | undefined>}
 */
async function prepareApyComparator(epoch: number) {
  if (!epoch) {
    return;
  }

  try {
    const apyInfo = await loadApyInfo(epoch);
    if (apyInfo.validators.length > 0) {
      const voteApyMap = apyInfo.validators.reduce<{ [key: string]: number }>((res, v) => {
        res[v.vote] = v.apy;
        return res;
      }, {});
      console.log('Use APY Comparator');
      return (a: ValidatorAccount, b: ValidatorAccount) => {
        const aVoteId = a.voteAddress?.toBase58();
        const bVoteId = b.voteAddress?.toBase58();
        if (!aVoteId || !bVoteId) {
          return 0;
        }
        const aApy = parseFloat(String(voteApyMap[aVoteId]));
        const bApy = parseFloat(String(voteApyMap[bVoteId]));
        // console.log(`Compare ${aVoteId} (${aApy}) and ${bVoteId} (${bApy})`);
        // if (isNaN(aApy) || isNaN(bApy)) {
        //   return defaultResult;
        // }
        return aApy - bApy;
      };
    }
  } catch (e) {
    console.log('Error:', e);
  }
}
