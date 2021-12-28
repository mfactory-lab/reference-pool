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

import {
  Transaction,
  Connection,
  Signer,
  Commitment,
  PublicKey,
  AccountInfo,
  SystemProgram,
  TransactionInstruction,
  Keypair,
} from '@solana/web3.js';

// import { initializeAccount } from '@project-serum/serum/lib/token-instructions'
import * as struct from 'superstruct';
import assert from 'assert';

import { ACCOUNT_LAYOUT, RENT_PROGRAM_ID, SYSTEM_PROGRAM_ID, MINT_LAYOUT, TOKENS } from '@/utils';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { initializeAccount } from '@project-serum/serum/lib/token-instructions';

/**
 * The level of commitment desired when querying state
 * <pre>
 *   'processed': Query the most recent block which has reached 1 confirmation by the connected node
 *   'confirmed': Query the most recent block which has reached 1 confirmation by the cluster
 *   'finalized': Query the most recent block which has been finalized by the cluster
 * </pre>
 */
export const commitment: Commitment = 'confirmed';

/**
 * @internal
 */
function createRpcResult<T, U>(result: struct.Struct<T, U>) {
  return struct.union([
    struct.type({
      jsonrpc: struct.literal('2.0'),
      id: struct.string(),
      result,
    }),
    struct.type({
      jsonrpc: struct.literal('2.0'),
      id: struct.string(),
      error: struct.type({
        code: struct.unknown(),
        message: struct.string(),
        data: struct.optional(struct.any()),
      }),
    }),
  ]);
}

const UnknownRpcResult = createRpcResult(struct.unknown());

/**
 * @internal
 */
function jsonRpcResult<T, U>(schema: struct.Struct<T, U>) {
  return struct.coerce(createRpcResult(schema), UnknownRpcResult, (value) => {
    if ('error' in value) {
      return value;
    } else {
      return {
        ...value,
        result: struct.create(value.result, schema),
      };
    }
  });
}

/**
 * @internal
 */
function jsonRpcResultAndContext<T, U>(value: struct.Struct<T, U>) {
  return jsonRpcResult(
    struct.type({
      context: struct.type({
        slot: struct.number(),
      }),
      value,
    }),
  );
}

const AccountInfoResult = struct.type({
  executable: struct.boolean(),
  owner: struct.string(),
  lamports: struct.number(),
  data: struct.any(),
  rentEpoch: struct.nullable(struct.number()),
});

export async function findProgramAddress(
  seeds: Array<Buffer | Uint8Array>,
  programId: PublicKey,
) {
  const [publicKey, nonce] = await PublicKey.findProgramAddress(
    seeds,
    programId,
  );
  return { publicKey, nonce };
}

export async function createAmmAuthority(programId: PublicKey) {
  return await findProgramAddress(
    [
      new Uint8Array(
        Buffer.from('amm authority'.replace('\u00A0', ' '), 'utf-8'),
      ),
    ],
    programId,
  );
}

export async function createAssociatedId(
  infoId: PublicKey,
  marketAddress: PublicKey,
  bufferKey: string,
) {
  const { publicKey } = await findProgramAddress(
    [infoId.toBuffer(), marketAddress.toBuffer(), Buffer.from(bufferKey)],
    infoId,
  );
  return publicKey;
}

export async function findAssociatedTokenAddress(
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey,
) {
  const { publicKey } = await findProgramAddress(
    [
      walletAddress.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      tokenMintAddress.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  return publicKey;
}

export async function createTokenAccountIfNotExist(
  connection: Connection,
  account: string | undefined | null,
  owner: PublicKey,
  mintAddress: string,
  lamports: number | null,
  transaction: Transaction,
  signer: Array<Signer>,
) {
  let publicKey;

  if (account) {
    publicKey = new PublicKey(account);
  } else {
    publicKey = await createProgramAccountIfNotExist(
      connection,
      account,
      owner,
      TOKEN_PROGRAM_ID,
      lamports,
      ACCOUNT_LAYOUT,
      transaction,
      signer,
    );

    transaction.add(
      initializeAccount({
        account: publicKey,
        mint: new PublicKey(mintAddress),
        owner,
      }),
    );
  }

  return publicKey;
}

export async function createAssociatedTokenAccountIfNotExist(
  account: string | undefined | null,
  owner: PublicKey,
  mint: PublicKey,
  transaction: Transaction,
) {
  let publicKey;
  if (account) {
    publicKey = new PublicKey(account);
  }

  const ata = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, owner, true);

  if (
    (!publicKey || !ata.equals(publicKey)) &&
    mint.toBase58() !== TOKENS.WSOL.mintAddress
  ) {
    transaction.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        ata,
        owner,
        owner,
      ),
    );
  }

  return ata;
}

export async function createProgramAccountIfNotExist(
  connection: Connection,
  account: string | undefined | null,
  owner: PublicKey,
  programId: PublicKey,
  lamports: number | null,
  layout: any,
  transaction: Transaction,
  signer: Array<Signer>,
) {
  let publicKey;

  if (account) {
    publicKey = new PublicKey(account);
  } else {
    const newAccount = new Keypair();
    // eslint-disable-next-line prefer-destructuring
    publicKey = newAccount.publicKey;

    lamports =
      lamports ??
      (await connection.getMinimumBalanceForRentExemption(layout.span));

    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: owner,
        newAccountPubkey: publicKey,
        lamports,
        space: layout.span,
        programId,
      }),
    );

    signer.push(newAccount);
  }

  return publicKey;
}

export async function createAssociatedTokenAccount(
  tokenMintAddress: PublicKey,
  owner: PublicKey,
  transaction: Transaction,
) {
  const associatedTokenAddress = await findAssociatedTokenAddress(
    owner,
    tokenMintAddress,
  );

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
      pubkey: SYSTEM_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: RENT_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
  ];

  transaction.add(
    new TransactionInstruction({
      keys,
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
      data: Buffer.from([]),
    }),
  );

  return associatedTokenAddress;
}

export async function createTokenAccount(
  connection: Connection,
  wallet: any,
  mint: string,
) {
  const transaction = new Transaction();
  const signers: Signer[] = [];
  const owner = wallet.publicKey;
  await createAssociatedTokenAccount(new PublicKey(mint), owner, transaction);
  return await sendTransaction(connection, wallet, transaction, signers);
}

export async function getFilteredProgramAccounts(
  connection: Connection,
  programId: PublicKey,
  filters: any,
) {
  return await connection.getParsedProgramAccounts(programId, {
    commitment: connection.commitment,
    filters,
  });
}

// getMultipleAccounts
export async function getMultipleAccounts(
  connection: Connection,
  publicKeys: PublicKey[],
  commitment?: Commitment,
): Promise<Array<null | { publicKey: PublicKey, account: AccountInfo<Buffer> }>> {
  const keys: string[][] = [];
  let tempKeys: string[] = [];

  publicKeys.forEach((k) => {
    if (tempKeys.length >= 100) {
      keys.push(tempKeys);
      tempKeys = [];
    }
    tempKeys.push(k.toBase58());
  });

  if (tempKeys.length > 0) {
    keys.push(tempKeys);
  }

  const accounts: Array<null | {
    executable: any,
    owner: PublicKey,
    lamports: any,
    data: Buffer
  }> = [];

  for (const key of keys) {
    const args = [key, { commitment }];

    // @ts-ignore
    const unsafeRes = await connection._rpcRequest('getMultipleAccounts', args);
    const res = struct.create(
      unsafeRes,
      jsonRpcResultAndContext(struct.nullable(struct.array(AccountInfoResult))),
    );

    if ('error' in res) {
      throw new Error(
        'failed to get info about accounts ' +
        publicKeys.map((k) => k.toBase58()).join(', ') +
        ': ' +
        res.error.message,
      );
    }

    assert(typeof res.result !== 'undefined');

    if (res.result.value !== null) {
      for (const account of res.result.value) {
        if (account === null) {
          accounts.push(null);
          continue;
        }
        const { executable, owner, lamports, data } = account;
        assert(data[1] === 'base64');
        accounts.push({
          executable,
          owner: new PublicKey(owner),
          lamports,
          data: Buffer.from(data[0], 'base64'),
        });
      }
    }
  }

  return accounts.map((account, idx) => {
    if (account === null) {
      return null;
    }
    return {
      publicKey: publicKeys[idx],
      account,
    };
  });
}

export function mergeTransactions(transactions: (Transaction | undefined)[]) {
  const transaction = new Transaction();
  transactions
    .filter((t): t is Transaction => t !== undefined)
    .forEach((t) => {
      transaction.add(t);
    });
  return transaction;
}

function throwIfNull<T>(value: T | null, message = 'account not found'): T {
  if (value === null) {
    throw new Error(message);
  }
  return value;
}

export async function getMintDecimals(
  connection: Connection,
  mint: PublicKey,
): Promise<number> {
  const { data } = throwIfNull(
    await connection.getAccountInfo(mint),
    'mint not found',
  );
  const { decimals } = MINT_LAYOUT.decode(data);
  return decimals;
}

export async function getFilteredTokenAccountsByOwner(
  connection: Connection,
  programId: PublicKey,
  mint: PublicKey,
) {
  // @ts-ignore
  const resp = await connection._rpcRequest('getTokenAccountsByOwner', [
    programId.toBase58(),
    {
      mint: mint.toBase58(),
    },
    {
      encoding: 'jsonParsed',
    },
  ]);
  if (resp.error) {
    throw new Error(resp.error.message);
  }
  return resp.result;
}

async function covertToProgramWalletTransaction(
  connection: Connection,
  wallet: any,
  transaction: Transaction,
  signers: Array<Signer> = [],
) {
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash(commitment)
  ).blockhash;
  transaction.feePayer = wallet.publicKey;
  if (signers.length > 0) {
    transaction = await wallet.convertToProgramWalletTransaction(transaction);
    transaction.partialSign(...signers);
  }
  return transaction;
}

// transaction
export async function signTransaction(
  connection: Connection,
  wallet: any,
  transaction: Transaction,
  signers: Array<Signer> = [],
) {
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash()
  ).blockhash;
  transaction.setSigners(wallet.publicKey, ...signers.map((s) => s.publicKey));
  if (signers.length > 0) {
    transaction.partialSign(...signers);
  }
  return await wallet.signTransaction(transaction);
}

export async function sendSignedTransaction(
  connection: Connection,
  signedTransaction: Transaction,
): Promise<string> {
  const rawTransaction = signedTransaction.serialize();
  return await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: true,
    preflightCommitment: commitment,
  });
}

export async function sendTransaction(
  connection: Connection,
  wallet: any,
  transaction: Transaction,
  signers: Array<Signer> = [],
) {
  if (wallet.isProgramWallet) {
    const programWalletTransaction = await covertToProgramWalletTransaction(
      connection,
      wallet,
      transaction,
      signers,
    );
    return await wallet.signAndSendTransaction(programWalletTransaction);
  }
  const signedTransaction = await signTransaction(
    connection,
    wallet,
    transaction,
    signers,
  );
  return await sendSignedTransaction(connection, signedTransaction);
}
