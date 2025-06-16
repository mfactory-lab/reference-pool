// eslint-disable-next-line unicorn/prefer-node-protocol
import { Buffer } from 'buffer'
import type {
  Connection,

  Transaction } from '@solana/web3.js'
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  StakeProgram,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'

/**
 * Shorten the checksummed version of the input address
 * to have 4 characters at start and end
 */
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export async function getStakeAccountsByWithdrawAuthority(
  connection: Connection,
  withdrawAuthority: PublicKey,
) {
  return await connection.getParsedProgramAccounts(StakeProgram.programId, {
    filters: [
      // {
      //   // only delegated
      //   memcmp: { bytes: bs58.encode(new Uint8Array([2, 0, 0, 0])), offset: 0 },
      // },
      // 44 is Withdrawer authority offset in stake account stake
      { memcmp: { offset: 44, bytes: withdrawAuthority.toBase58() } },
    ],
  })
}

// /**
//  * @internal
//  */
// function createRpcResult<T, U>(result: struct.Struct<T, U>) {
//   return struct.union([
//     struct.type({
//       jsonrpc: struct.literal('2.0'),
//       id: struct.string(),
//       result,
//     }),
//     struct.type({
//       jsonrpc: struct.literal('2.0'),
//       id: struct.string(),
//       error: struct.type({
//         code: struct.unknown(),
//         message: struct.string(),
//         data: struct.optional(struct.any()),
//       }),
//     }),
//   ])
// }

// const UnknownRpcResult = createRpcResult(struct.unknown())

// /**
//  * @internal
//  */
// function jsonRpcResult<T, U>(schema: struct.Struct<T, U>) {
//   return struct.coerce(createRpcResult(schema), UnknownRpcResult, (value) => {
//     return 'error' in value
//       ? value
//       : {
//           ...value,
//           result: struct.create(value.result, schema),
//         }
//   })
// }

// /**
//  * @internal
//  */
// function jsonRpcResultAndContext<T, U>(value: struct.Struct<T, U>) {
//   return jsonRpcResult(
//     struct.type({
//       context: struct.type({
//         slot: struct.number(),
//       }),
//       value,
//     }),
//   )
// }
//
// const AccountInfoResult = struct.type({
//   executable: struct.boolean(),
//   owner: struct.string(),
//   lamports: struct.number(),
//   data: struct.any(),
//   rentEpoch: struct.nullable(struct.number()),
// })

export async function findProgramAddress(seeds: Array<Buffer | Uint8Array>, programId: PublicKey) {
  const [publicKey, nonce] = PublicKey.findProgramAddressSync(seeds, programId)
  return { publicKey, nonce }
}

// export async function createAmmAuthority(programId: PublicKey) {
//   return await findProgramAddress(
// eslint-disable-next-line no-irregular-whitespace
//     [new Uint8Array(Buffer.from('amm authority'.replace('\u00A0', ' '), 'utf8'))],
//     programId,
//   )
// }

// export async function createAssociatedId(
//   infoId: PublicKey,
//   marketAddress: PublicKey,
//   bufferKey: string,
// ) {
//   const { publicKey } = await findProgramAddress(
//     [infoId.toBuffer(), marketAddress.toBuffer(), Buffer.from(bufferKey)],
//     infoId,
//   )
//   return publicKey
// }

export async function findAssociatedTokenAddress(
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey,
) {
  const { publicKey } = await findProgramAddress(
    [walletAddress.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), tokenMintAddress.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )
  return publicKey
}

/**
 * Gets TokenAccountBalance from the associated token account
 */
export async function getTokenBalance(
  connection: Connection,
  walletAddress: PublicKey,
  mint: PublicKey,
): Promise<number | null> {
  try {
    const associatedTokenAcc = await findAssociatedTokenAddress(walletAddress, mint)
    const tBalance = await connection.getTokenAccountBalance(associatedTokenAcc)
    return tBalance.value.uiAmount
  } catch {
    // No token account found
    return null
  }
}

// export async function createProgramAccountIfNotExist(
//   connection: Connection,
//   account: string | undefined | null,
//   owner: PublicKey,
//   programId: PublicKey,
//   lamports: number | null,
//   layout: any,
//   transaction: Transaction,
//   signer: Array<Signer>,
// ) {
//   let publicKey: PublicKey
//
//   if (account) {
//     publicKey = new PublicKey(account)
//   } else {
//     const newAccount = new Keypair()
//
//     publicKey = newAccount.publicKey
//
//     lamports = lamports ?? (await connection.getMinimumBalanceForRentExemption(layout.span))
//
//     transaction.add(
//       SystemProgram.createAccount({
//         fromPubkey: owner,
//         newAccountPubkey: publicKey,
//         lamports,
//         space: layout.span,
//         programId,
//       }),
//     )
//
//     signer.push(newAccount)
//   }
//
//   return publicKey
// }

export async function createAssociatedTokenAccount(
  tokenMintAddress: PublicKey,
  owner: PublicKey,
  transaction: Transaction,
) {
  const associatedTokenAddress = await findAssociatedTokenAddress(owner, tokenMintAddress)

  const keys = [
    {
      pubkey: owner,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: associatedTokenAddress,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: owner,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: tokenMintAddress,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ]

  transaction.add(
    new TransactionInstruction({
      keys,
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
      data: Buffer.from([]),
    }),
  )

  return associatedTokenAddress
}

// export async function createTokenAccount(connection: Connection, wallet: any, mint: string) {
//   const transaction = new Transaction()
//   const signers: Signer[] = []
//   const owner = wallet.publicKey
//   await createAssociatedTokenAccount(new PublicKey(mint), owner, transaction)
//   return await sendTransaction(connection, wallet, transaction.instructions, signers)
// }

export async function getFilteredProgramAccounts(
  connection: Connection,
  programId: PublicKey,
  filters: any,
) {
  return await connection.getParsedProgramAccounts(programId, {
    commitment: connection.commitment,
    filters,
  })
}

// // getMultipleAccounts
// export async function getMultipleAccounts(
//   connection: Connection,
//   publicKeys: PublicKey[],
//   commitment?: Commitment,
// ) {
//   const keys: string[][] = []
//   let tempKeys: string[] = []
//
//   for (const k of publicKeys) {
//     if (tempKeys.length >= 100) {
//       keys.push(tempKeys)
//       tempKeys = []
//     }
//     tempKeys.push(k.toBase58())
//   }
//
//   if (tempKeys.length > 0) {
//     keys.push(tempKeys)
//   }
//
//   const accounts: Array<null | {
//     executable: any
//     owner: PublicKey
//     lamports: any
//     data: Buffer
//   }> = []
//
//   for (const key of keys) {
//     const args = [key, { commitment }]
//
//     // @ts-expect-error ...
//     const unsafeRes = await connection._rpcRequest('getMultipleAccounts', args)
//     const res = struct.create(
//       unsafeRes,
//       jsonRpcResultAndContext(struct.nullable(struct.array(AccountInfoResult))),
//     )
//
//     if ('error' in res) {
//       throw new Error(
//         `failed to get info about accounts ${
//           publicKeys.map(k => k.toBase58()).join(', ')
//         }: ${
//           res.error.message}`,
//       )
//     }
//
//     assert(res.result !== undefined)
//
//     if (res.result.value !== null) {
//       for (const account of res.result.value) {
//         if (account === null) {
//           accounts.push(null)
//           continue
//         }
//         const { executable, owner, lamports, data } = account
//         assert(data[1] === 'base64')
//         accounts.push({
//           executable,
//           owner: new PublicKey(owner),
//           lamports,
//           data: Buffer.from(data[0], 'base64'),
//         })
//       }
//     }
//   }
//
//   return accounts.map((account, idx) => {
//     if (account === null) {
//       return null
//     }
//     return {
//       publicKey: publicKeys[idx],
//       account,
//     }
//   })
// }

// export async function getFilteredTokenAccountsByOwner(
//   connection: Connection,
//   programId: PublicKey,
//   mint: PublicKey,
// ) {
//   // @ts-expect-error ...
//   const resp = await connection._rpcRequest('getTokenAccountsByOwner', [
//     programId.toBase58(),
//     {
//       mint: mint.toBase58(),
//     },
//     {
//       encoding: 'jsonParsed',
//     },
//   ])
//   if (resp.error) {
//     throw new Error(resp.error.message)
//   }
//   return resp.result
// }

// function initUmi() {
//   const connection = ENDPOINTS[0]!.url
//   return createUmi(connection).use(mplTokenMetadata())
// }
//
// export async function getMultipleMetadataByMint(mints: PublicKeyInitData[]) {
//   const umi = initUmi()
//   // @ts-expect-error...
//   const metadataRes = await fetchAllDigitalAsset(umi, mints)
//   return metadataRes
// }
//
// export async function getTokensMetadata(mintAddress: PublicKeyInitData[]) {
//   try {
//     const metadata = await getMultipleMetadataByMint(mintAddress)
//     return metadata
//   } catch (err) {
//     console.log(err)
//   }
// }
