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

import axios from 'axios';

export interface SaberLiquidityPoolStats {
  vol24h: number;
  vol24h_usd: number;
  vol7d: number;
  vol7d_usd: number;
  price: number;
  price_usd: number;
  tvl_coin: number;
  tvl_pc: number;
  tvl_usd: number;
}

export interface SaberToken {
  chainId: number;
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  logoURI: string;
  tag: string;
}

export interface SaberPair {
  ammId: string;
  name: string;
  coin: SaberToken;
  pc: SaberToken;
  lp: SaberToken;
  stats: SaberLiquidityPoolStats;
  version: string;
  programId: string;
}

export async function getSaberPairs(): Promise<SaberPair[]> {
  const resp = await axios.post('https://saberqltest.aleph.cloud/', {
    query: `query AllPoolStats{
  pools {
    name
    stats {
      tvl_pc
      tvl_coin
      price
      vol24h
    }
  }
}
`,
  });

  return resp.data.data?.pools;
}
