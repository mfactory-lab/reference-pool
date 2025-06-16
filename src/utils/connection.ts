import type {
  AddressLookupTableAccount,
  BlockhashWithExpiryBlockHeight,
  Commitment,
  ConfirmOptions,
  Connection,
  FetchMiddleware,
  PublicKey,
  SendOptions,
  SignatureResult,
  Signer,
  TransactionInstruction,
  TransactionSignature,
} from '@solana/web3.js'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'
import {
  ComputeBudgetProgram,
  PACKET_DATA_SIZE,
  TransactionExpiredBlockheightExceededError,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import { base64Encode } from './common'

/**
 * Generic Wallet interface to support any wallet implementation.
 */
type Wallet = {
  publicKey: PublicKey | null
  signTransaction: (transaction: VersionedTransaction) => Promise<VersionedTransaction>
  signAllTransactions?: (transactions: VersionedTransaction[]) => Promise<VersionedTransaction[]>
}

/**
 * Sends and signs a single transaction.
 */
export async function sendTransaction(
  connection: Connection,
  wallet: Wallet,
  instructions: TransactionInstruction[],
  signers: Signer[] = [],
  options: {
    priorityFee?: number
    commitment?: Commitment
  } = {},
): Promise<string> {
  const { priorityFee = 0, commitment = 'confirmed' } = options

  if (!wallet.publicKey) {
    throw new WalletNotConnectedError()
  }

  const { blockhash } = await connection.getLatestBlockhash(commitment)

  const txInstructions = priorityFee > 0
    ? [ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee }), ...instructions]
    : instructions

  const messageV0 = new TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: blockhash,
    instructions: txInstructions,
  }).compileToV0Message()
  const transaction = new VersionedTransaction(messageV0)

  // const transaction = new Transaction({
  //   feePayer: wallet.publicKey,
  //   blockhash,
  //   lastValidBlockHeight,
  // }).add(...instructions)

  const signedTransaction = await wallet.signTransaction(transaction)

  if (signers.length > 0) {
    signedTransaction.sign(signers)
  }

  const rawTransaction = signedTransaction.serialize()

  const txId = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: true,
    maxRetries: 3,
  })

  console.log('TX Signature:', txId)
  console.log('TX Raw:', base64Encode(rawTransaction))

  return txId
}

type SendTransactionsParams = {
  commitment?: Commitment
  onSuccess?: (txId: string, idx: number) => Promise<void> | void
  onError?: (error: any, idx: number) => Promise<boolean> | boolean
  blockhash?: BlockhashWithExpiryBlockHeight
  lookupTables?: AddressLookupTableAccount[]
  maxRetries?: number
  stopOnError?: boolean
  priorityFee?: number
  separate?: boolean
}

/**
 * Sends and signs multiple transactions.
 */
export async function sendTransactions(
  connection: Connection,
  wallet: Wallet,
  instructionSets: TransactionInstruction[][],
  signerSets: Signer[][],
  params: SendTransactionsParams = {},
): Promise<string[]> {
  const {
    commitment = 'confirmed',
    maxRetries = 3,
    onSuccess,
    onError,
    stopOnError = false,
    blockhash,
    priorityFee = 0,
    separate = false,
    lookupTables,
  } = params

  if (!wallet.publicKey) {
    throw new WalletNotConnectedError()
  }

  let currentBlockhash = blockhash ?? (await connection.getLatestBlockhash(commitment))

  const transactions = instructionSets
    .map((instructions, i) => {
      if (!instructions?.length) {
        return null
      }

      const txInstructions = priorityFee > 0
        ? [ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee }), ...instructions]
        : instructions

      const messageV0 = new TransactionMessage({
        payerKey: wallet.publicKey!,
        recentBlockhash: currentBlockhash.blockhash,
        instructions: txInstructions,
      }).compileToV0Message(lookupTables)

      const transaction = new VersionedTransaction(messageV0)

      const signers = signerSets[i] ?? []
      if (signers.length > 0) {
        console.log(`Tx #${i} additional signers:`, signers.map(s => s.publicKey.toBase58()))
        transaction.sign(signers)
      }

      console.log(`Tx #${i} size: ${transaction.serialize().length} of ${PACKET_DATA_SIZE} bytes`)

      return transaction
    })
    .filter(Boolean) as VersionedTransaction[]

  const signedTransactions = !separate && wallet.signAllTransactions
    ? await wallet.signAllTransactions(transactions)
    : await Promise.all(transactions.map(tx => wallet.signTransaction(tx)))

  const results: string[] = []

  for (const [i, signedTransaction] of signedTransactions.entries()) {
    const rawTx = signedTransaction.serialize()
    let retryCount = 0
    let succeeded = false

    while (retryCount <= maxRetries && !succeeded) {
      try {
        const txId = await sendAndConfirmRawTransaction(connection, Buffer.from(rawTx), {
          skipPreflight: true,
          commitment,
          blockhash: currentBlockhash,
        })

        console.log(`TX #${i} :: Signature:`, txId)
        // eslint-disable-next-line ts/no-unused-expressions
        onSuccess && (await onSuccess(txId, i))
        results.push(txId)
        succeeded = true
      } catch (error) {
        console.log(`TX #${i} :: Error (attempt ${retryCount + 1}/${maxRetries + 1}):`, error)

        if (error instanceof TransactionExpiredBlockheightExceededError) {
          currentBlockhash = await connection.getLatestBlockhash(commitment)
          console.log('Refreshed blockhash:', currentBlockhash.blockhash)
          retryCount++
          await sleep(500)
          continue
        }

        if (retryCount >= maxRetries) {
          let shouldContinue = false
          if (onError) {
            shouldContinue = await onError(error, i)
          }
          results.push('')
          if (stopOnError && !shouldContinue) {
            return results
          }
          break
        }

        retryCount++
        await sleep(500)
      }
    }
  }

  return results
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Copy of Connection.sendAndConfirmRawTransaction that throws
// a better error if 'confirmTransaction` returns an error status
async function sendAndConfirmRawTransaction(
  connection: Connection,
  rawTransaction: Buffer | Uint8Array,
  options?: ConfirmOptionsWithBlockhash,
): Promise<TransactionSignature> {
  const sendOptions: SendOptions = options
    ? {
        skipPreflight: options.skipPreflight,
        preflightCommitment: options.preflightCommitment || options.commitment,
        maxRetries: options.maxRetries,
        minContextSlot: options.minContextSlot,
      }
    : {}

  let status: SignatureResult

  const startTime = Date.now()
  while (Date.now() - startTime < 60_000) {
    try {
      console.log('Sending raw transaction', rawTransaction.toString('base64'), sendOptions)
      const signature = await connection.sendRawTransaction(
        rawTransaction,
        sendOptions,
      )

      if (options?.blockhash) {
        if (sendOptions.maxRetries === 0) {
          const abortSignal = AbortSignal.timeout(15_000)
          status = (
            await connection.confirmTransaction(
              { abortSignal, signature, ...options.blockhash },
              options && options.commitment,
            )
          ).value
        } else {
          status = (
            await connection.confirmTransaction(
              { signature, ...options.blockhash },
              options?.commitment,
            )
          ).value
        }
      } else {
        status = (
          await connection.confirmTransaction(
            signature,
            options?.commitment,
          )
        ).value
      }

      if (status.err) {
        throw new ConfirmError(
          `Raw transaction ${signature} failed (${JSON.stringify(status)})`,
        )
      }

      return signature
    } catch (error: any) {
      if (error.name === 'TimeoutError') {
        continue
      }
      throw error
    }
  }

  throw new Error('Transaction failed to confirm in 60s')
}

class ConfirmError extends Error {
  constructor(message?: string) {
    super(message)
  }
}

export type ConfirmOptionsWithBlockhash = ConfirmOptions & {
  blockhash?: BlockhashWithExpiryBlockHeight
}

type ITokenStorage = {
  setToken: (token: string) => void
  getToken: () => string | null
  getTimeSinceLastSet: () => number | null
}

export class LocalTokenStorage implements ITokenStorage {
  private tokenKey = 'auth-token'
  private timeKey = 'last-set'

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token)
    localStorage.setItem(this.timeKey, String(Date.now()))
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  getTimeSinceLastSet(): number | null {
    const lastSet = localStorage.getItem(this.timeKey)
    return lastSet ? Date.now() - Number(lastSet) : null
  }
}

type TokenAuthFetchMiddlewareArgs = {
  tokenStorage?: ITokenStorage
  tokenExpiry?: number
  getToken: () => Promise<string>
}

/**
 * Middleware to handle token-based authentication in fetch requests.
 */
export function tokenAuthFetchMiddleware({
  tokenStorage = new LocalTokenStorage(),
  tokenExpiry = 5 * 60 * 1000, // 5 minutes
  getToken,
}: TokenAuthFetchMiddlewareArgs): FetchMiddleware {
  // @ts-expect-error...
  return (url: string, options: any, fetch: (...args: any) => void) => {
    (async () => {
      try {
        const token = tokenStorage.getToken()
        const timeSinceLastSet = tokenStorage.getTimeSinceLastSet()
        const tokenIsValid
          = token && token !== 'undefined' && timeSinceLastSet && timeSinceLastSet < tokenExpiry - 10_000
        if (!tokenIsValid) {
          const newToken = await getToken()
          if (newToken) {
            tokenStorage.setToken(newToken)
          }
        }
      } catch (error: any) {
        console.error(error)
      }
      fetch(url, {
        ...options,
        headers: {
          ...(options || {}).headers,
          Authorization: `Bearer ${tokenStorage.getToken()}`,
        },
      })
    })()
  }
}
