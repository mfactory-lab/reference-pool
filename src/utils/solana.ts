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

import { Connection, EpochInfo, PublicKey } from '@solana/web3.js'
// @ts-ignore
import bs58 from 'bs58'

export const SOLANA_STAKE_PROGRAM_ID = new PublicKey(
  'Stake11111111111111111111111111111111111111'
)

export async function findStakeAccountsByOwner(
  connection: Connection,
  owner: PublicKey
): Promise<any[]> {
  // LMT, some stake-accounts have lockup.custodian set even if lockup.timestamp=0 & lockup.epoch=0 (Solflare dos that)
  const data = new Uint8Array(32)
  data.set(owner.toBytes(), 0)
  return await connection.getParsedProgramAccounts(SOLANA_STAKE_PROGRAM_ID, {
    filters: [
      {
        memcmp: { bytes: bs58.encode(new Uint8Array([2, 0, 0, 0])), offset: 0 },
      },
      { memcmp: { bytes: bs58.encode(data), offset: 44 } },
    ],
  })
}

export async function getEpochInfo(connection: Connection): Promise<EpochInfo> {
  return await connection.getEpochInfo()
}
