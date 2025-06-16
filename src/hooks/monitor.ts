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

import type { Commitment, TransactionInstruction } from '@solana/web3.js'
import { Transaction } from '@solana/web3.js'
// import { Notify } from 'quasar'
import {
  DEFAULT_CONFIRM_TIMEOUT,
  // DEFAULT_MONITOR_COMMITMENT,
  DEFAULT_SEND_TIMEOUT,
  TELEGRAM_ANNOUNCEMENT_URL,
} from '~/config'
import { useConnectionStore } from '~/store'

type MonitorTransactionParams = {
  onSuccess?: (signature: string) => void
  onError?: (reason: string) => void
  commitment?: Commitment
  sendTimeout?: number
  confirmTimeout?: number
  idx?: string
}

/**
 * Estimate the size of a created account based on the program ID of the instruction.
 * @param instruction The instruction to estimate the size for.
 * @returns The estimated size of the created account in bytes.
 */
async function estimateAccountSize(instruction: TransactionInstruction): Promise<number> {
  // Logic for various instructions, for example:
  // - If this is an instruction to create a token account, return 165 bytes.
  // - If this is an instruction to create metadata, return 512 bytes.
  const createAccountSizeMap: { [programId: string]: number } = {
    TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: 165, // Token account
    TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb: 165, // Token account
    metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s: 512, // NFT metadata account
  }

  return createAccountSizeMap[instruction.programId.toBase58()] || 0
}

export function useMonitorTransaction() {
  const connectionStore = useConnectionStore()
  const { publicKey } = useClientWallet()

  const Toast = useToast()

  const cluster = toRef(connectionStore, 'cluster')
  const sending = ref(false)

  async function hasSufficientBalance(
    instructions: TransactionInstruction[],
  ) {
    try {
      const balanceLamports = await connectionStore.connection.getBalance(publicKey.value!)

      const transaction = new Transaction().add(...instructions)
      transaction.feePayer = publicKey.value!

      const { blockhash } = await connectionStore.connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash

      const message = transaction.compileMessage()
      const transactionFee = await connectionStore.connection.getFeeForMessage(message)

      let totalCostLamports = transactionFee.value ?? 0

      for (const instruction of instructions) {
        for (const accountMeta of instruction.keys) {
          if (accountMeta.isWritable && accountMeta.isSigner) {
            const accountInfo = await connectionStore.connection.getAccountInfo(accountMeta.pubkey)
            if (!accountInfo) {
              const requiredSize = await estimateAccountSize(instruction)
              const rentExemptBalance = await connectionStore.connection.getMinimumBalanceForRentExemption(requiredSize)
              totalCostLamports += rentExemptBalance
            }
          }
        }
      }

      const passes = Number(balanceLamports) >= Number(totalCostLamports)
      if (!passes) {
        throw new Error('Not enough funds for transaction')
      }
    } catch (error) {
      Toast.create({
        message: String(error),
        variant: 'danger',
      })
    }
  }

  async function monitorTransaction(
    signatureOrPromise: Promise<string> | string,
    {
      onSuccess,
      onError,
      idx,
      commitment, // = 'confirmed',
      sendTimeout = DEFAULT_SEND_TIMEOUT,
      confirmTimeout = DEFAULT_CONFIRM_TIMEOUT,
    }: MonitorTransactionParams = {},
  ): Promise<void> {
    idx = idx ?? ''

    // const dismiss = Notify.create({
    //   progress: true,
    //   type: 'ongoing',
    //   message: idx ? `Sending transaction "${idx}" ...` : 'Sending transaction...',
    //   timeout: sendTimeout,
    // })

    let toast = Toast.create({
      value: sendTimeout,
      variant: 'info',
      message: idx ? `Sending transaction "${idx}" ...` : 'Sending transaction...',
      progressProps: {
        variant: 'gray',
      },
    })

    sending.value = true

    let signature = ''
    try {
      signature = String(await signatureOrPromise)
    } catch (error: any) {
      sending.value = false
      toast.dismiss()
      if (error?.message && !String(error?.message).startsWith('User rejected')) {
        Toast.create({
          variant: 'danger',
          message: error?.message,
          title: idx ? `Transaction "${idx}" error` : 'Transaction error',
        })
      }
      return
    }

    // https://solscan.io/tx/{id}
    const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=${cluster.value}`

    const exploreAction = {
      label: 'Explore',
      target: '_blank',
      href: explorerUrl,
    }

    const telegramAction = {
      label: 'Telegram',
      target: '_blank',
      href: String(TELEGRAM_ANNOUNCEMENT_URL),
    }

    try {
      // dismiss()
      toast.dismiss()

      // dismiss = Notify.create({
      //   // spinner: true,
      //   progress: true,
      //   type: 'ongoing',
      //   message: idx ? `Confirming transaction "${idx}" ...` : 'Confirming transaction...',
      //   actions: [exploreAction],
      //   timeout: confirmTimeout,
      // })

      toast = Toast.create({
        variant: 'info',
        message: idx ? `Confirming transaction "${idx}" ...` : 'Confirming transaction...',
        value: confirmTimeout,
        progressProps: {
          variant: 'gray',
        },
        actions: [exploreAction],
      })

      const latestBlockHash = await connectionStore.connection.getLatestBlockhash()
      const res = await connectionStore.connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature,
      }, commitment)

      toast.dismiss()

      if (res.value.err) {
        throw new Error(JSON.stringify(res.value.err))
      }

      Toast.create({
        value: 0,
        variant: 'success',
        message: idx ? `Transaction "${idx}" confirmed` : 'Transaction confirmed',
        actions: [exploreAction],
      })

      if (onSuccess) {
        onSuccess(signature)
      }
    } catch (error: any) {
      toast.dismiss()

      let message = error.message
      if (message.includes('block height exceeded')) {
        message = `<span>${message}</span><br><strong>Change fee</strong>`
      }

      Toast.create({
        title: idx ? `Transaction "${idx}" error` : 'Transaction error',
        message,
        actions: [exploreAction, telegramAction],
        value: 0,
        variant: 'danger',
      })

      if (onError) {
        onError(error)
      }
      console.error(error)
    } finally {
      sending.value = false
    }
  }

  return {
    monitorTransaction,
    hasSufficientBalance,

    sending }
}
