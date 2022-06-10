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
import { useAnchorWallet } from 'solana-wallets-vue'
import { computed, ref, toRef } from 'vue'
import { PublicKey, StakeProgram } from '@solana/web3.js'
import { depositSol, depositStake } from '@solana/spl-stake-pool/src'
import type { ProgramAccount } from '@/store'
import { useBalanceStore, useConnectionStore, useStakePoolStore } from '@/store'
import { useMonitorTransaction } from '@/hooks'
import { formatAmount, lamportsToSol, sendTransaction, solToLamports } from '@/utils'

export function useDeposit() {
  const { notify } = useQuasar()
  const connectionStore = useConnectionStore()
  const stakePoolStore = useStakePoolStore()
  const balanceStore = useBalanceStore()
  const { monitorTransaction, sending } = useMonitorTransaction()
  const wallet = useAnchorWallet()

  const lamportsPerSignature = toRef(stakePoolStore, 'lamportsPerSignature')
  const stakePool = toRef(stakePoolStore, 'stakePool')
  const minRentBalance = toRef(stakePoolStore, 'minRentBalance')

  const nativeBalance = toRef(balanceStore, 'nativeBalance')
  const hasTokenAccount = toRef(balanceStore, 'hasTokenAccount')

  const loading = ref(false)
  const stakeSuccessDialog = ref(false)

  const solStaked = computed(() => stakePool.value?.totalLamports.toNumber() ?? 0)
  const remainingAmount = computed(() =>
    Math.max(0, solToLamports(connectionStore.stakeLimit) - solStaked.value),
  )

  const depositFee = computed(
    () =>
      lamportsPerSignature.value * 2
      + (wallet.value?.publicKey && !hasTokenAccount.value ? minRentBalance.value : 0),
  )
  const depositing = computed(() => loading.value || sending.value)

  return {
    stakeSuccessDialog,
    depositFee,
    depositing,

    /**
     * @param stakeAccount
     */
    depositStake: async (stakeAccount: ProgramAccount) => {
      try {
        const voter = stakeAccount.account.data?.parsed?.info?.stake?.delegation?.voter
        if (!voter) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error('Wrong stake account state, must be delegated to validator')
        }

        const { rentFee, instructions, signers } = await depositStake(
          connectionStore.connection,
          connectionStore.stakePoolAddress!,
          wallet.value!.publicKey!,
          new PublicKey(voter),
          stakeAccount.pubkey,
        )

        if (nativeBalance.value < rentFee) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error(
            `Insufficient balance, at least ${lamportsToSol(rentFee)} SOL are required.`,
          )
        }

        let success = false

        await monitorTransaction(
          sendTransaction(connectionStore.connection, wallet.value!, instructions, signers),
          {
            onSuccess: () => (success = true),
          },
        )

        return success
      } catch (e: any) {
        notify({ message: e.message, type: 'negative' })
        throw e
      } finally {
        loading.value = false
      }
    },

    /**
     * @param amount
     */
    depositSol: async (amount = 1) => {
      if (!wallet.value?.publicKey) {
        console.log('Wallet is not connected.')
        return false
      }
      try {
        // console.log('stakeLimit', solToLamports(stakeLimit.value));
        // console.log('solStaked', solStaked.value);
        // console.log('StakeRemainingAmount', remainingAmount.value);

        const lamports = solToLamports(amount)

        if (connectionStore.stakeLimit > 0 && lamports > remainingAmount.value) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error(
            `Stake limit is reached. Available to stake ${formatAmount(remainingAmount.value)} SOL`,
          )
        }

        loading.value = true

        const { rentFee, instructions, signers } = await depositSol(
          connectionStore.connection,
          connectionStore.stakePoolAddress!,
          wallet.value.publicKey,
          lamports,
        )

        if (nativeBalance.value < rentFee) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error(
            `Insufficient balance, at least ${lamportsToSol(rentFee)} SOL are required.`,
          )
        }

        await monitorTransaction(
          sendTransaction(connectionStore.connection, wallet.value, instructions, signers),
          { onSuccess: () => (stakeSuccessDialog.value = true) },
        )

        return true
      } catch (e: any) {
        notify({ message: e.message, type: 'negative' })
        throw e
      } finally {
        loading.value = false
      }
    },

    /**
     * @param stakePubkey
     * @param voterKey
     */
    delegateAccount: async (stakePubkey, voterKey) => {
      if (!wallet.value?.publicKey) {
        console.log('Wallet is not connected.')
        return
      }
      try {
        const transaction = StakeProgram.delegate({
          stakePubkey,
          authorizedPubkey: wallet.value.publicKey,
          votePubkey: new PublicKey(voterKey),
        })

        await monitorTransaction(
          sendTransaction(connectionStore.connection, wallet.value, transaction.instructions, []),
        )
      } catch (e: any) {
        notify({ message: e.message, type: 'negative' })
        throw e
      }
    },
  }
}
