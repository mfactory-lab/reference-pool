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

import { bool, option, publicKey, struct, u32, u64, u8, vec } from '@project-serum/borsh';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
// import {Fee} from "@/utils/spl/schema";

export const ACCOUNT_LAYOUT = struct([
  publicKey('mint'),
  publicKey('owner'),
  u64('amount'),
  u32('delegateOption'),
  publicKey('delegate'),
  u8('state'),
  u32('isNativeOption'),
  u64('isNative'),
  u64('delegatedAmount'),
  u32('closeAuthorityOption'),
  publicKey('closeAuthority'),
]);

export const MINT_LAYOUT = struct([
  u32('mintAuthorityOption'),
  publicKey('mintAuthority'),
  u64('supply'),
  u8('decimals'),
  bool('initialized'),
  u32('freezeAuthorityOption'),
  publicKey('freezeAuthority'),
]);

const feeFields = [u64('denominator'), u64('numerator')];

export const STAKE_POOL_LAYOUT = struct([
  // rustEnum(AccountTypeKind, 'accountType'),
  u8('accountType'),
  publicKey('manager'),
  publicKey('staker'),
  publicKey('stakeDepositAuthority'),
  u8('stakeWithdrawBumpSeed'),
  publicKey('validatorList'),
  publicKey('reserveStake'),
  publicKey('poolMint'),
  publicKey('managerFeeAccount'),
  publicKey('tokenProgramId'),
  u64('totalLamports'),
  u64('poolTokenSupply'),
  u64('lastUpdateEpoch'),
  struct([u64('unixTimestamp'), u64('epoch'), publicKey('custodian')], 'lockup'),
  struct(feeFields, 'epochFee'),
  option(struct(feeFields), 'nextEpochFee'),
  option(publicKey(), 'preferredDepositValidatorVoteAddress'),
  option(publicKey(), 'preferredWithdrawValidatorVoteAddress'),
  struct(feeFields, 'stakeDepositFee'),
  struct(feeFields, 'stakeWithdrawalFee'),
  option(struct(feeFields), 'nextWithdrawalFee'),
  u8('stakeReferralFee'),
  option(publicKey(), 'solDepositAuthority'),
  struct(feeFields, 'solDepositFee'),
  u8('solReferralFee'),
  option(publicKey(), 'solWithdrawAuthority'),
  struct(feeFields, 'solWithdrawalFee'),
  option(struct(feeFields), 'nextSolWithdrawalFee'),
  u8('lastEpochPoolTokenSupply'),
  u8('lastEpochTotalLamports'),
]);

export interface ValidatorStakeInfo {
  status: number;
  voteAccountAddress: PublicKey;
  activeStakeLamports: BN;
  transientStakeLamports: BN;
  transientSeedSuffixStart: BN;
  transientSeedSuffixEnd: BN;
  lastUpdateEpoch: BN;
}

export const VALIDATOR_STAKE_INFO_LAYOUT = struct<ValidatorStakeInfo>([
  /// Amount of active stake delegated to this validator
  /// Note that if `last_update_epoch` does not match the current epoch then
  /// this field may not be accurate
  u64('activeStakeLamports'),
  /// Amount of transient stake delegated to this validator
  /// Note that if `last_update_epoch` does not match the current epoch then
  /// this field may not be accurate
  u64('transientStakeLamports'),
  /// Last epoch the active and transient stake lamports fields were updated
  u64('lastUpdateEpoch'),
  /// Start of the validator transient account seed suffixes
  u64('transientSeedSuffixStart'),
  /// End of the validator transient account seed suffixes
  u64('transientSeedSuffixEnd'),
  /// Status of the validator stake account
  // rustEnum([
  //   struct([], 'Active'),
  //   struct([], 'DeactivatingTransient'),
  //   struct([], 'ReadyForRemoval'),
  // ]).replicate('status'),
  u8('status'),
  /// Validator vote account address
  publicKey('voteAccountAddress'),
]);

export interface ValidatorList {
  /// Account type, must be ValidatorList currently
  accountType: number;
  /// Maximum allowable number of validators
  maxValidators: number;
  /// List of stake info for each validator in the pool
  validators: ValidatorStakeInfo[];
}

export const VALIDATOR_LIST_LAYOUT = struct<ValidatorList>([
  // rustEnum([
  //   struct([], 'Uninitialized'),
  //   struct([], 'StakePool'),
  //   struct([], 'ValidatorList'),
  // ]).replicate('accountType'),
  u8('accountType'),
  u32('maxValidators'),
  vec(VALIDATOR_STAKE_INFO_LAYOUT, 'validators'),
]);
