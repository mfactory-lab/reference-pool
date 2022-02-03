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

export interface OrcaPair {
  name: string;
  name2: string;
  account: string;
  mint_account: string;
  lp_mint: string;
  official: boolean;
  liquidity: number;
  price: number;
  volume_7d: number;
  volume_7d_quote: number;
  volume_24h: number;
  volume_24h_quote: number;
  volume_30d: number;
  volume_30d_quote: number;
  apy_24h: number;
  apy_7d: number;
  apy_30d: number;
}

export async function getOrcaPairs(): Promise<OrcaPair[]> {
  return new Promise((resolve, reject) => {
    fetch(`https://api.orca.so/pools`)
      .then((res) => res.json())
      .then(
        (resp) => {
          resolve(resp);
        },
        (error) => {
          console.error(error);
          reject(Error('Promise rejected'));
        },
      );
  });
}

//for APR https://api.orca.so/allpools
