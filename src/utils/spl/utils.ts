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
  LAMPORTS_PER_SOL,
  PublicKey,
  Connection,
  TransactionInstruction,
  Keypair,
  StakeProgram,
  SystemProgram,
} from '@solana/web3.js';
import { MintInfo, Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import BN from 'bn.js';
import { WithdrawAccount, STAKE_STATE_LEN } from './index';
import { Buffer } from 'buffer';
import { lamportsToSol, ACCOUNT_LAYOUT, VALIDATOR_LIST_LAYOUT, ValidatorList } from '@/utils';
import { StakePool, TokenAccount } from '@/utils/spl/schema';

import { STAKE_PROGRAM_ID } from '@/config';
import { StakePoolProgram } from '@/utils/spl/stakepool-program';

// @ts-ignore
BN.prototype.divCeil = function divCeil(num) {
  // @ts-ignore
  const dm = this.divmod(num);
  // Fast case - exact division
  if (dm.mod.isZero()) return dm.div;
  // Round up
  return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
};

export function solToLamports(amount: number): number {
  if (isNaN(amount)) return Number(0);
  return Number(amount * LAMPORTS_PER_SOL);
}

/**
 * Generates the withdraw authority program address for the stake pool
 */
export async function findDepositAuthorityProgramAddress(
  programId: PublicKey,
  stakePoolAddress: PublicKey,
) {
  const [publicKey] = await PublicKey.findProgramAddress([
      stakePoolAddress.toBuffer(),
      Buffer.from('deposit'),
    ],
    programId,
  );
  return publicKey;
}

/**
 * Generates the withdraw authority program address for the stake pool
 */
export async function findWithdrawAuthorityProgramAddress(
  programId: PublicKey,
  stakePoolAddress: PublicKey,
) {
  const [publicKey] = await PublicKey.findProgramAddress([
      stakePoolAddress.toBuffer(),
      Buffer.from('withdraw'),
    ],
    programId,
  );
  return publicKey;
}

/**
 * Generates the stake program address for a validator's vote account
 */
export async function findStakeProgramAddress(
  programId: PublicKey,
  voteAccountAddress: PublicKey,
  stakePoolAddress: PublicKey,
) {
  const [publicKey] = await PublicKey.findProgramAddress([
      voteAccountAddress.toBuffer(),
      stakePoolAddress.toBuffer(),
    ],
    programId,
  );
  return publicKey;
}

const TRANSIENT_STAKE_SEED_PREFIX = Buffer.from('transient');

/**
 * Generates the stake program address for a validator's vote account
 */
export async function findTransientStakeProgramAddress(
  programId: PublicKey,
  voteAccountAddress: PublicKey,
  stakePoolAddress: PublicKey,
  seed: BN,
) {
  const [publicKey] = await PublicKey.findProgramAddress([
      TRANSIENT_STAKE_SEED_PREFIX,
      voteAccountAddress.toBuffer(),
      stakePoolAddress.toBuffer(),
      new Uint8Array(seed.toArray('le', 8)),
    ],
    programId,
  );
  return publicKey;
}

export async function getTokenMint(
  connection: Connection,
  tokenMintPubkey: PublicKey,
): Promise<MintInfo | undefined> {
  // @ts-ignore
  const token = new Token(connection, tokenMintPubkey, TOKEN_PROGRAM_ID, null);
  return token.getMintInfo();
}

const FAILED_TO_FIND_ACCOUNT = 'Failed to find account';
const INVALID_ACCOUNT_OWNER = 'Invalid account owner';

/**
 * Retrieve the associated account or create one if not found.
 * This account may then be used as a `transfer()` or `approve()` destination
 */
export async function addAssociatedTokenAccount(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey,
  instructions: TransactionInstruction[],
) {
  const associatedAddress = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    owner,
  );

  // This is the optimum logic, considering TX fee, client-side computation,
  // RPC roundtrips and guaranteed idempotent.
  // Sadly we can't do this atomically;
  try {
    const account = await connection.getAccountInfo(associatedAddress);
    if (!account) {
      // noinspection ExceptionCaughtLocallyJS
      throw new Error(FAILED_TO_FIND_ACCOUNT);
    }
  } catch (err: any) {
    // INVALID_ACCOUNT_OWNER can be possible if the associatedAddress has
    // already been received some lamports (= became system accounts).
    // Assuming program derived addressing is safe, this is the only case
    // for the INVALID_ACCOUNT_OWNER in this code-path
    if (
      err.message === FAILED_TO_FIND_ACCOUNT ||
      err.message === INVALID_ACCOUNT_OWNER
    ) {
      // as this isn't atomic, it's possible others can create associated
      // accounts meanwhile
      try {
        instructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mint,
            associatedAddress,
            owner,
            owner,
          ),
        );
      } catch (err) {
        console.warn(err);
        // ignore all errors; for now there is no API compatible way to
        // selectively ignore the expected instruction error if the
        // associated account is existing already.
      }
      // Now this should always succeed
      // await connection.getAccountInfo(associatedAddress);
    } else {
      throw err;
    }
    console.warn(err);
  }

  return associatedAddress;
}

export async function getTokenAccount(
  connection: Connection,
  tokenAccountAddress: PublicKey,
  expectedTokenMint: PublicKey,
) {
  try {
    const account = await connection.getAccountInfo(tokenAccountAddress);
    if (!account) {
      // noinspection ExceptionCaughtLocallyJS
      throw new Error(`Invalid account ${tokenAccountAddress.toBase58()}`);
    }

    const tokenAccount = ACCOUNT_LAYOUT.decode(account.data) as TokenAccount;
    if (tokenAccount.mint?.toBase58() != expectedTokenMint.toBase58()) {
      // noinspection ExceptionCaughtLocallyJS
      throw new Error(`Invalid token mint for ${tokenAccountAddress}, expected mint is ${expectedTokenMint}`);
    }
    return tokenAccount;

  } catch (error) {
    console.log(error);
  }
}

export async function getStakeAccountsByWithdrawAuthority(
  connection: Connection,
  withdrawAuthority: PublicKey,
) {
  return await connection.getParsedProgramAccounts(STAKE_PROGRAM_ID, {
    filters: [
      // {
      //   // only delegated
      //   memcmp: { bytes: bs58.encode(new Uint8Array([2, 0, 0, 0])), offset: 0 },
      // },
      // 44 is Withdrawer authority offset in stake account stake
      { memcmp: { offset: 44, bytes: withdrawAuthority.toBase58() } },
    ],
  });
}

export interface ValidatorAccount {
  type: 'preferred' | 'active' | 'transient' | 'reserve';
  voteAddress?: PublicKey | undefined;
  stakeAddress: PublicKey;
  lamports: number;
}

export async function prepareWithdrawAccounts(
  connection: Connection,
  stakePool: StakePool,
  stakePoolAddress: PublicKey,
  amount: number,
  compareFn?: (a: ValidatorAccount, b: ValidatorAccount) => number
): Promise<WithdrawAccount[]> {

  const validatorListAcc = await connection.getAccountInfo(stakePool.validatorList);
  const validatorList = VALIDATOR_LIST_LAYOUT.decode(validatorListAcc!.data) as ValidatorList;

  if (!validatorList?.validators || validatorList?.validators.length == 0) {
    throw new Error('No accounts found');
  }

  let accounts = [] as Array<ValidatorAccount>;

  // Prepare accounts
  for (const validator of validatorList.validators) {
    if (validator.status !== 0) {
      // is not active status
      continue;
    }

    const stakeAccountAddress = await findStakeProgramAddress(
      StakePoolProgram.programId,
      validator.voteAccountAddress,
      stakePoolAddress,
    );

    if (!validator.activeStakeLamports.isZero()) {
      const isPreferred = stakePool.preferredWithdrawValidatorVoteAddress
        && stakePool.preferredWithdrawValidatorVoteAddress!.toBase58() == validator.voteAccountAddress.toBase58();
      accounts.push({
        type: isPreferred ? 'preferred' : 'active',
        voteAddress: validator.voteAccountAddress,
        stakeAddress: stakeAccountAddress,
        lamports: validator.activeStakeLamports.toNumber(),
      });
    }
    const transientStakeAccountAddress = await findTransientStakeProgramAddress(
      StakePoolProgram.programId,
      validator.voteAccountAddress,
      stakePoolAddress,
      validator.transientSeedSuffixStart,
    );
    if (!validator.transientStakeLamports.isZero()) {
      accounts.push({
        type: 'transient',
        voteAddress: validator.voteAccountAddress,
        stakeAddress: transientStakeAccountAddress,
        lamports: validator.transientStakeLamports.toNumber(),
      });
    }
  }

  // Sort from highest to lowest balance
  accounts = accounts.sort(compareFn ? compareFn : (a, b) => b.lamports - a.lamports);

  if (stakePool.reserveStake) {
    const reserveStake = await connection.getAccountInfo(stakePool.reserveStake);
    if (reserveStake && reserveStake.lamports > 0) {
      accounts.push({
        type: 'reserve',
        stakeAddress: stakePool.reserveStake,
        lamports: reserveStake?.lamports,
      });
    }
  }

  // Prepare the list of accounts to withdraw from
  const withdrawFrom: WithdrawAccount[] = [];
  let remainingAmount = amount;

  for (const type of ['preferred', 'active', 'transient', 'reserve']) {
    const filteredAccounts = accounts.filter(a => a.type == type);
    // Max 5 accounts for type to prevent an error: "Transaction too large"
    // TODO: fix
    const maxAccountsByType = 5;
    let i = 0;
    for (const { stakeAddress, voteAddress, lamports } of filteredAccounts) {
      if (i >= maxAccountsByType) {
        break;
      }

      const availableForWithdrawal_1 =
        Math.floor(calcPoolTokensForDeposit(stakePool, lamports));

      const availableForWithdrawal = divideBnToNumber(
        new BN(availableForWithdrawal_1).mul(stakePool.stakeWithdrawalFee.denominator),
        stakePool.stakeWithdrawalFee.denominator.sub(stakePool.stakeWithdrawalFee.numerator),
      );

      const poolAmount = Math.min(availableForWithdrawal, remainingAmount);

      if (poolAmount <= 0) {
        continue;
      }

      // Those accounts will be withdrawn completely with `claim` instruction
      withdrawFrom.push({ stakeAddress, voteAddress, poolAmount });
      remainingAmount -= poolAmount;
      if (remainingAmount == 0) {
        break;
      }
      i++;
    }
    if (remainingAmount == 0) {
      break;
    }
  }

  // Not enough stake to withdraw the specified amount
  if (remainingAmount > 0) {
    throw new Error(`No stake accounts found in this pool with enough balance to withdraw
    ${lamportsToSol(amount)} pool tokens.`);
  }

  return withdrawFrom;
}

/**
 * Calculate the pool tokens that should be minted for a deposit of `stakeLamports`
 */
export function calcPoolTokensForDeposit(stakePool: StakePool, stakeLamports: number): number {
  if (stakePool.poolTokenSupply.isZero() || stakePool.totalLamports.isZero()) {
    return stakeLamports;
  }
  return divideBnToNumber(
    new BN(stakeLamports).mul(stakePool.poolTokenSupply),
    stakePool.totalLamports,
  );
}

/**
 * Calculate lamports amount on withdrawal
 */
export function calcLamportsWithdrawAmount(stakePool: StakePool, poolTokens: number): number {
  const numerator = new BN(poolTokens).mul(stakePool.totalLamports);
  const denominator = stakePool.poolTokenSupply;
  if (numerator.lt(denominator)) {
    return 0;
  }
  return divideBnToNumber(numerator, denominator);
}

export function divideBnToNumber(numerator: BN, denominator: BN): number {
  if (denominator.isZero()) {
    return 0;
  }
  const quotient = numerator.div(denominator).toNumber();
  const rem = numerator.umod(denominator);
  const gcd = rem.gcd(denominator);
  return quotient + rem.div(gcd).toNumber() / denominator.div(gcd).toNumber();
}

export function getTokenMultiplierFromDecimals(decimals: number): BN {
  return new BN(10).pow(new BN(decimals));
}

/// Convert the UI representation of a token amount (using the decimals field defined in its mint)
/// to the raw amount
export function uiAmountToAmount(amount: number, decimals: number) {
  return getTokenMultiplierFromDecimals(decimals).toNumber() * amount;
}

/// Convert a raw amount to its UI representation (using the decimals field defined in its mint)
export function amountToUiAmount(amount: BN | number, decimals: number) {
  return divideBnToNumber(new BN(amount), getTokenMultiplierFromDecimals(decimals));
}

export function newStakeAccount(
  feePayer: PublicKey,
  instructions: TransactionInstruction[],
  lamports: number,
): Keypair {
  // Account for tokens not specified, creating one
  const stakeReceiverKeypair = Keypair.generate();

  instructions.push(
    // Creating new account
    SystemProgram.createAccount({
      fromPubkey: feePayer,
      newAccountPubkey: stakeReceiverKeypair.publicKey,
      lamports,
      space: STAKE_STATE_LEN,
      programId: StakeProgram.programId,
    }),
  );

  return stakeReceiverKeypair;
}
