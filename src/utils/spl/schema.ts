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

import { PublicKey, Struct, Enum } from '@solana/web3.js';
import BN from 'bn.js';

export class Fee extends Struct {
  denominator: BN;
  numerator: BN;
}

export class Lockup extends Struct {
  unixTimestamp: number;
  epoch: number;
  custodian: PublicKey;
}

export class AccountType extends Enum {
}

export class AccountTypeEnum extends Struct {
}

export enum AccountTypeKind {
  Uninitialized = 'Uninitialized',
  StakePool = 'StakePool',
  ValidatorList = 'ValidatorList',
}

export class StakePool extends Struct {
  accountType: AccountType;
  manager: PublicKey;
  staker: PublicKey;
  stakeDepositAuthority: PublicKey;
  stakeWithdrawBumpSeed: number;
  validatorList: PublicKey;
  reserveStake: PublicKey;
  poolMint: PublicKey;
  managerFeeAccount: PublicKey;
  tokenProgramId: PublicKey;
  totalLamports: BN;
  poolTokenSupply: BN;
  lastUpdateEpoch: BN;
  lockup: Lockup;
  epochFee: Fee;
  nextEpochFee?: Fee | undefined;
  preferredDepositValidatorVoteAddress?: PublicKey | undefined;
  preferredWithdrawValidatorVoteAddress?: PublicKey | undefined;
  stakeDepositFee: Fee;
  stakeWithdrawalFee: Fee;
  nextWithdrawalFee?: Fee | undefined;
  stakeReferralFee: number;
  solDepositAuthority?: PublicKey | undefined;
  solDepositFee: Fee;
  solReferralFee: number;
  solWithdrawAuthority?: PublicKey | undefined;
  solWithdrawalFee: Fee;
  nextSolWithdrawalFee?: Fee | undefined;
  lastEpochPoolTokenSupply: BN;
  lastEpochTotalLamports: BN
}

export class ValidatorList extends Struct {
  accountType: AccountType;
  maxValidators: number;
  validators: [ValidatorStakeInfo];
}

export class ValidatorStakeInfo extends Struct {
  status: StakeStatus;
  voteAccountAddress: PublicKey;
  stakeLamports: BN;
  lastUpdateEpoch: BN;
}

export class TokenAccount extends Struct {
  mint: PublicKey;
  owner: PublicKey;
  amount: BN;
  delegate?: PublicKey | undefined;
  state: number;
  delegatedAmount?: BN | undefined;
  closeAuthority?: PublicKey | undefined;
}

export class StakeStatus extends Enum {
}

export class StakeStatusEnum extends Struct {
}

export enum StakeStatusKind {
  Active = 'Active',
  DeactivatingTransient = 'DeactivatingTransient',
  ReadyForRemoval = 'ReadyForRemoval',
}

export function addStakePoolSchema(schema: Map<any, any>): void {
  /**
   * Borsh requires something called a Schema,
   * which is a Map (key-value pairs) that tell borsh how to deserialise the raw data
   * This function adds a new schema to an existing schema object.
   */
  schema.set(PublicKey, {
    kind: 'struct',
    fields: [['_bn', 'u256']],
  });

  schema.set(Fee, {
    kind: 'struct',
    fields: [
      ['denominator', 'u64'],
      ['numerator', 'u64'],
    ],
  });

  schema.set(AccountType, {
    kind: 'enum',
    field: 'enum',
    values: [
      // if the account has not been initialized, the enum will be 0
      [AccountTypeKind.Uninitialized, AccountTypeEnum],
      [AccountTypeKind.StakePool, AccountTypeEnum],
      [AccountTypeKind.ValidatorList, AccountTypeEnum],
    ],
  });

  schema.set(AccountTypeEnum, { kind: 'struct', fields: [] });

  schema.set(Lockup, {
    kind: 'struct',
    fields: [
      ['unixTimestamp', 'u64'],
      ['epoch', 'u64'],
      ['custodian', PublicKey],
    ],
  });

  schema.set(StakePool, {
    kind: 'struct',
    fields: [
      ['accountType', AccountType],
      ['manager', PublicKey],
      ['staker', PublicKey],
      ['stakeDepositAuthority', PublicKey],
      ['stakeWithdrawBumpSeed', 'u8'],
      ['validatorList', PublicKey],
      ['reserveStake', PublicKey],
      ['poolMint', PublicKey],
      ['managerFeeAccount', PublicKey],
      ['tokenProgramId', PublicKey],
      ['totalLamports', 'u64'],
      ['poolTokenSupply', 'u64'],
      ['lastUpdateEpoch', 'u64'],
      ['lockup', Lockup],
      ['epochFee', Fee],
      ['nextEpochFee', { kind: 'option-rs', type: Fee }],
      [
        'preferredDepositValidatorVoteAddress',
        { kind: 'option-rs', type: PublicKey },
      ],
      [
        'preferredWithdrawValidatorVoteAddress',
        { kind: 'option-rs', type: PublicKey },
      ],
      ['stakeDepositFee', Fee],
      ['stakeWithdrawalFee', Fee],
      ['nextWithdrawalFee', { kind: 'option-rs', type: Fee }],
      ['stakeReferralFee', 'u8'],
      ['solDepositAuthority', { kind: 'option-rs', type: PublicKey }],
      ['solDepositFee', Fee],
      ['solReferralFee', 'u8'],
      ['solWithdrawAuthority', { kind: 'option-rs', type: PublicKey }],
      ['solWithdrawalFee', Fee],
      ['nextSolWithdrawalFee', { kind: 'option-rs', type: Fee }],
      ['lastEpochPoolTokenSupply', 'u64'],
      ['lastEpochTotalLamports', 'u64']
    ],
  });

  schema.set(ValidatorList, {
    kind: 'struct',
    fields: [
      ['accountType', AccountType],
      ['maxValidators', 'u32'],
      ['validators', [ValidatorStakeInfo]],
    ],
  });

  schema.set(StakeStatus, {
    kind: 'enum',
    field: 'enum',
    values: [
      [StakeStatusKind.Active, StakeStatusEnum],
      [StakeStatusKind.DeactivatingTransient, StakeStatusEnum],
      [StakeStatusKind.ReadyForRemoval, StakeStatusEnum],
    ],
  });

  schema.set(StakeStatusEnum, { kind: 'struct', fields: [] });

  schema.set(ValidatorStakeInfo, {
    kind: 'struct',
    fields: [
      ['status', StakeStatus],
      ['voteAccountAddress', PublicKey],
      ['stakeLamports', 'u64'],
      ['lastUpdateEpoch', 'u64'],
    ],
  });
}
