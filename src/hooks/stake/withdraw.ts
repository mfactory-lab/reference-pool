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

import { useQuasar } from 'quasar'
import { computed, ref, toRef, watch } from 'vue'
import { useAnchorWallet, useWallet } from 'solana-wallets-vue'
import { withdrawSol, withdrawStake } from '@solana/spl-stake-pool/src'
import type { ValidatorAccount } from '@solana/spl-stake-pool/src/utils'
import { useDebounce } from '@vueuse/core'
import type { Keypair } from '@solana/web3.js'
import { StakeProgram } from '@solana/web3.js'
import { WITHDRAW_SOL_ACTIVE } from '@/config'
import { useMonitorTransaction } from '@/hooks'
import { sendTransaction, sendTransactions, solToLamports } from '@/utils'
import {
  loadApyInfo,
  useConnectionStore,
  useEpochStore,
  useStakeAccountStore,
  useStakePoolStore,
} from '@/store'

export function useWithdraw() {
  const connectionStore = useConnectionStore()
  const stakePoolStore = useStakePoolStore()
  const stakeAccountStore = useStakeAccountStore()
  const epochStore = useEpochStore()

  const { notify } = useQuasar()
  const { monitorTransaction, sending } = useMonitorTransaction()

  const { wallet, connected } = useWallet()
  const anchorWallet = useAnchorWallet()

  const lamportsPerSignature = toRef(stakePoolStore, 'lamportsPerSignature')
  const stakePool = toRef(stakePoolStore, 'stakePool')
  const reserveStakeBalance = toRef(stakePoolStore, 'reserveStakeBalance')
  const epochInfo = toRef(epochStore, 'epochInfo')

  const useReserve = ref(false)
  const useWithdrawSol = ref(true)
  const loading = ref(false)
  const amount = ref(0)

  watch(useDebounce(amount, 100), async (amount) => {
    if (WITHDRAW_SOL_ACTIVE && stakePool.value?.reserveStake) {
      const poolAmount = solToLamports(amount)
      if (reserveStakeBalance.value > poolAmount) {
        useWithdrawSol.value = true
        return
      }
    }
    useWithdrawSol.value = false
  })

  return {
    amount,
    useWithdrawSol,
    setAmount: (val: number) => (amount.value = Number(val)),
    useReserve: (val = true) => (useReserve.value = val),
    // TODO: find a better way
    // withdrawFee: computed(() => lamportsPerSignature.value * (useWithdrawSol.value ? 2 : 3)),
    withdrawFee: computed(() => lamportsPerSignature.value * 3),
    withdrawSolFee: computed(() => lamportsPerSignature.value * 2),
    withdrawing: computed(() => loading.value || sending.value),
    withdraw: async (forceDelayed = false) => {
      if (!connected.value) {
        throw new Error('Wallet not connected')
      }
      if (amount.value <= 0) {
        return false
      }
      try {
        loading.value = true

        // Try to use "withdraw sol"
        if (useWithdrawSol.value && !forceDelayed) {
          console.log('------------------------')
          console.log('|- WITHDRAW SOL')
          console.log('------------------------')

          const { instructions, signers } = await withdrawSol(
            connectionStore.connection,
            connectionStore.stakePoolAddress!,
            wallet.value!.publicKey!,
            wallet.value!.publicKey!,
            amount.value,
          )

          await monitorTransaction(
            sendTransaction(connectionStore.connection, anchorWallet.value!, instructions, signers),
          )

          return true
        }

        const { instructions: withdrawInstructions, signers } = await withdrawStake(
          connectionStore.connection,
          connectionStore.stakePoolAddress!,
          wallet.value!.publicKey!,
          amount.value,
          useReserve.value,
          undefined,
          undefined,
          undefined,
          epochInfo.value?.epoch ? await prepareApyComparator(epochInfo.value.epoch) : undefined,
        )

        const instructions = [...withdrawInstructions]
        // signers[1] is stakeKeypair
        const stakePubKey = signers[1]?.publicKey
        // if (stakePubKey) {
        //   const deactivateInstructions = StakeProgram.deactivate({
        //     stakePubkey: stakePubKey,
        //     authorizedPubkey: wallet.value!.publicKey!,
        //   }).instructions;
        //   instructions.push(...deactivateInstructions);
        // }

        // await monitorTransaction(
        //   sendTransaction(connectionStore.connection, anchorWallet.value!, instructions, signers),
        //   {
        //     commitment: 'finalized',
        //     onSuccess: () => {
        //       stakeAccountStore.load({
        //         // delay: 0,
        //       });
        //     },
        //   },
        // );

        const deactivateInstructions = StakeProgram.deactivate({
          stakePubkey: stakePubKey!,
          authorizedPubkey: wallet.value!.publicKey!,
        }).instructions

        const txLabels = ['Unstake', 'Deactivate']

        await sendTransactions(
          connectionStore.connection,
          anchorWallet.value!,
          [instructions, deactivateInstructions],
          [signers as Keypair[], []],
          {
            stopOnError: true,
            onSuccess: async (txId: string, idx: number) =>
              monitorTransaction(txId, {
                idx: txLabels[idx],
                onError(e) {
                  throw e
                },
              }),
          },
        )

        // reload stake accounts
        stakeAccountStore.load()

        return true
      } catch (e: any) {
        notify({ message: e.message, type: 'negative' })
        // throw e
      } finally {
        loading.value = false
      }
    },
  }
}

/**
 * Try to use APY comparator instead of lamport
 * @param {number} epoch
 * @returns {Promise<((a: ValidatorAccount, b: ValidatorAccount) => number) | undefined>}
 */
async function prepareApyComparator(epoch: number) {
  if (!epoch) {
    return
  }

  try {
    const apyInfo = await loadApyInfo(epoch)
    if (apyInfo.validators.length > 0) {
      const voteApyMap = apyInfo.validators.reduce<Record<string, number>>((res, v) => {
        res[v.vote] = v.apy
        return res
      }, {})
      console.log('Use APY Comparator')
      return (a: ValidatorAccount, b: ValidatorAccount) => {
        const aVoteId = a.voteAddress?.toBase58()
        const bVoteId = b.voteAddress?.toBase58()
        if (!aVoteId || !bVoteId) {
          return 0
        }
        const aApy = parseFloat(String(voteApyMap[aVoteId]))
        const bApy = parseFloat(String(voteApyMap[bVoteId]))
        // console.log(`Compare ${aVoteId} (${aApy}) and ${bVoteId} (${bApy})`);
        // if (isNaN(aApy) || isNaN(bApy)) {
        //   return defaultResult;
        // }
        return aApy - bApy
      }
    }
  } catch (e) {
    console.log('Error:', e)
  }
}
