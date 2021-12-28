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

import { useMonitorTransaction } from '@/hooks/index';
import { solToLamports, formatAmount } from '@/utils';
import { depositSol, withdrawStake, withdrawSol } from '@/utils/spl';
import { useQuasar } from 'quasar';
import { ref, computed, watch } from 'vue';
import { useConnection, sendTransaction, useStakePool, useEpochInfo } from '@/store';
import { storeToRefs } from 'pinia';
import { useWallet } from '@/store/modules/wallet';
import { WITHDRAW_SOL_ACTIVE } from '@/config';
import { useDebounce } from '@vueuse/core';
import { loadApyInfo } from '@/store/modules/apy';
import { ValidatorAccount } from '@/utils/spl/utils';

export function useDeposit() {
  const { connection, stakePoolAddress, stakeLimit } = storeToRefs(useConnection());
  const { lamportsPerSignature, stakePool } = storeToRefs(useStakePool());
  const walletStore = useWallet();
  const { wallet, connected } = storeToRefs(walletStore);
  const { monitorTransaction, sending } = useMonitorTransaction();
  const { notify } = useQuasar();
  const loading = ref(false);

  const solStaked = computed(() => stakePool.value?.totalLamports.toNumber() ?? 0);
  const remainingAmount = computed(() => Math.max(0, solToLamports(stakeLimit.value) - solStaked.value));

  return {
    depositFee: computed(() => lamportsPerSignature.value * 2),
    depositing: computed(() => loading.value || sending.value),
    deposit: async (amount = 1) => {
      if (connected.value) {

        try {
          const lamports = solToLamports(amount);

          if (stakeLimit.value > 0 && lamports > remainingAmount.value) {
            throw new Error(`Stake limit is reached. Available to stake ${formatAmount(remainingAmount.value)} SOL`);
          }

          loading.value = true;

          const { instructions, signers } = await depositSol(
            connection.value!,
            stakePoolAddress.value!,
            wallet.value!.publicKey!,
            lamports,
          );

          await monitorTransaction(sendTransaction(
            connection.value!,
            wallet.value!,
            instructions,
            signers,
          ));

          return true;
        } catch (e: any) {
          notify({ message: e.message, type: 'negative' });
          throw e;
        } finally {
          loading.value = false;
        }
      }
      return false;
    },
  };
}

export function useWithdraw() {
  const { connection, stakePoolAddress } = storeToRefs(useConnection());
  const { lamportsPerSignature, stakePool, reserveStakeBalance } = storeToRefs(useStakePool());
  const { wallet, connected } = storeToRefs(useWallet());
  const { epochInfo } = storeToRefs(useEpochInfo());
  const { monitorTransaction, sending } = useMonitorTransaction();
  const { notify } = useQuasar();
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
    setAmount: (val: number) => amount.value = Number(val),
    useReserve: (val = true) => useReserve.value = val,
    withdrawFee: computed(() => lamportsPerSignature.value * (useWithdrawSol.value ? 2 : 3)),
    withdrawing: computed(() => loading.value || sending.value),
    withdraw: async () => {
      if (!connected.value) {
        throw new Error('Wallet not connected');
      }
      if (amount.value <= 0) {
        return false;
      }
      try {
        loading.value = true;

        // Try to use "withdraw sol"
        if (useWithdrawSol.value) {

          console.log('------------------------');
          console.log('|- WITHDRAW SOL');
          console.log('------------------------');

          const { instructions, signers } = await withdrawSol(
            connection.value!,
            stakePoolAddress.value!,
            wallet.value!.publicKey!,
            wallet.value!.publicKey!,
            amount.value,
          );

          await monitorTransaction(sendTransaction(
            connection.value!,
            wallet.value!,
            instructions,
            signers,
          ));

          return true;
        }

        const { instructions, signers } = await withdrawStake(
          connection.value!,
          stakePoolAddress.value!,
          wallet.value!.publicKey!,
          amount.value,
          useReserve.value,
          undefined,
          undefined,
          undefined,
          epochInfo.value?.epoch ? await prepareApyComparator(epochInfo.value.epoch) : undefined,
        );

        await monitorTransaction(sendTransaction(
          connection.value!,
          wallet.value!,
          instructions,
          signers,
        ));

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

        return aApy - bApy;
      };
    }
  } catch (e) {
    console.log('Error:', e);
  }
}
