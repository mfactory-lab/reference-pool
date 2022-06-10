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

import type {
  Blockhash,
  Commitment,
  Connection,
  FetchMiddleware,
  Keypair,
  SendOptions,
  Signer,
  TransactionInstruction,
} from '@solana/web3.js'
import {
  Transaction,
} from '@solana/web3.js'
import type { AnchorWallet } from 'solana-wallets-vue'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'
import { DEFAULT_COMMITMENT } from '@/config'

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Send and sign transaction
 */
export async function sendTransaction(
  connection: Connection,
  wallet: AnchorWallet,
  instructions: TransactionInstruction[],
  signers: Signer[],
) {
  if (!wallet?.publicKey) {
    throw new Error('Wallet is not connected')
  }

  let transaction = new Transaction({ feePayer: wallet.publicKey })
  transaction.add(...instructions)
  transaction.recentBlockhash = (await connection.getRecentBlockhash('finalized')).blockhash

  if (signers.length > 0) {
    transaction.partialSign(...signers)
  }

  transaction = await wallet.signTransaction(transaction)
  const rawTransaction = transaction.serialize()

  // if (simulate) {
  //   const simulation = await connection.simulateTransaction(transaction);
  //   console.log('TX Simulation:', simulation);
  //   return simulation;
  // }

  const result = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: true,
    preflightCommitment: DEFAULT_COMMITMENT,
  })

  console.log('TX(signature): ', result.toString())
  console.log('TX(base64): ', rawTransaction.toString('base64'))

  return result
}

interface SendTransactionsParams {
  commitment?: Commitment
  onSuccess?: (txId: string, idx: number) => Promise<void>
  onError?: (reason: string, idx: number) => Promise<boolean>
  blockhash?: Blockhash
  maxRetries?: number
  stopOnError?: boolean
}

/**
 * Send and sign multiple transactions
 */
export const sendTransactions = async (
  connection: Connection,
  wallet: AnchorWallet,
  instructionSet: TransactionInstruction[][],
  signersSet: Keypair[][],
  {
    commitment = 'singleGossip',
    maxRetries = 3,
    onSuccess,
    onError,
    stopOnError,
    blockhash,
  }: SendTransactionsParams = {},
) => {
  if (!wallet.publicKey) {
    throw new WalletNotConnectedError()
  }

  const transactions: Transaction[] = []

  if (!blockhash) {
    blockhash = (await connection.getRecentBlockhash(commitment)).blockhash
  }

  for (let i = 0; i < instructionSet.length; i++) {
    const instructions = instructionSet[i] ?? []
    if (instructions.length === 0) {
      continue
    }
    const transaction = new Transaction({ feePayer: wallet.publicKey })
    transaction.add(...instructions)
    transaction.recentBlockhash = blockhash
    const signers = signersSet[i] ?? []
    if (signers.length > 0) {
      transaction.partialSign(...signers)
    }
    transactions.push(transaction)
  }

  const signedTransactions = await wallet.signAllTransactions(transactions)
  const pendingTransactions: Promise<string>[] = []

  let i = 0
  for (const signedTransaction of signedTransactions) {
    const rawTransaction = signedTransaction.serialize()

    const pendingTransaction = connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      maxRetries,
    } as SendOptions)

    // pendingTransaction
    //   .then((txId) => {
    //     console.log(`TX(#${i}) Signature:`, txId);
    //     console.log(`TX(#${i}) Base64: `, rawTransaction.toString('base64'));
    //     successCallback(txId, i);
    //   })
    //   .catch((reason) => {
    //     console.log(`TX(#${i}) Error:`, reason);
    //     console.log(`TX(#${i}) Base64: `, rawTransaction.toString('base64'));
    //     failCallback(reason, i);
    //   });

    try {
      const txId = await pendingTransaction
      console.log(`TX(#${i}) Signature:`, txId)
      console.log(`TX(#${i}) Base64: `, rawTransaction.toString('base64'))
      if (onSuccess) {
        await onSuccess(txId, i)
      }
    } catch (e: any) {
      console.log(`TX(#${i}) Error:`, e)
      console.log(`TX(#${i}) Base64: `, rawTransaction.toString('base64'))
      if (onError) {
        await onError(e, i)
      }
      if (stopOnError) {
        return await Promise.all(pendingTransactions)
      }
    }

    pendingTransactions.push(pendingTransaction)
    i++
  }

  return await Promise.all(pendingTransactions)
}

interface ITokenStorage {
  setToken(token: string): void

  getToken(): string | null

  getTimeSinceLastSet(): number | null
}

const storage = localStorage // typeof localStorage !== 'undefined' ? localStorage : require('localstorage-memory');

export class LocalTokenStorage implements ITokenStorage {
  setToken(token: string): void {
    storage.setItem('auth-token', token)
    storage.setItem('last-set', String(new Date().valueOf()))
  }

  getTimeSinceLastSet(): number | null {
    if (storage.getItem('last-set')) {
      return new Date().valueOf() - Number(storage.getItem('last-set'))
    }
    return null
  }

  getToken(): string | null {
    return storage.getItem('auth-token')
  }
}

export interface ITokenAuthFetchMiddlewareArgs {
  /**
   * An api endpoint to get a new token. Default /api/get-token
   */
  getTokenUrl?: string
  /**
   * Optionally override the default storage mechanism of localStorage
   */
  tokenStorage?: ITokenStorage
  /**
   * Number of milliseconds until token expiry. Default 5 minutes
   */
  tokenExpiry?: number

  /**
   * Logic to get an authorization token
   */
  getToken: () => Promise<string>
}

export function tokenAuthFetchMiddleware({
  tokenStorage = new LocalTokenStorage(),
  tokenExpiry = 5 * 60 * 1000, // 5 minutes
  getToken,
}: ITokenAuthFetchMiddlewareArgs): FetchMiddleware {
  return (url: string, options: any, fetch: Function) => {
    (async () => {
      try {
        const token = tokenStorage.getToken()
        const timeSinceLastSet = tokenStorage.getTimeSinceLastSet()
        const tokenIsValid
          = token && token !== 'undefined' && timeSinceLastSet && timeSinceLastSet < tokenExpiry
        if (!tokenIsValid) {
          tokenStorage.setToken(await getToken())
        }
      } catch (e: any) {
        console.error(e)
      }
      fetch(url, {
        ...(options || {}),
        headers: {
          ...(options || {}).headers,
          Authorization: `Bearer ${tokenStorage.getToken()}`,
        },
      })
    })()
  }
}
