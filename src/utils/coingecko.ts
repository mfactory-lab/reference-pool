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

interface CoinStats {
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  circulating_supply: number
  current_price: number
  fully_diluted_valuation: null
  high_24h: number
  id: string
  image: string
  last_updated: string
  low_24h: number
  market_cap: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  market_cap_rank: number
  // max_supply: null,
  name: string
  price_change_24h: number
  price_change_percentage_24h: number
  price_change_percentage_24h_in_currency: number
  // roi: null,
  symbol: string
  total_supply: number
  total_volume: number
}

export async function getTokenPrice(ids = 'solana', vs_currencies = 'usd') {
  return new Promise<CoinStats>((resolve, reject) => {
    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs_currencies}&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`,
    )
      .then(res => res.json())
      .then(
        (res) => {
          if (res.length > 0) {
            resolve(res[0])
          } else {
            reject(Error('Promise rejected'))
          }
        },
        (error) => {
          console.error(error)
        },
      )
  })
}

// interface CoinStatsSimple {
//   solana: {
//     usd: number,
//     usd_24h_change: number,
//     usd_24h_vol: number,
//   }
// }
// export async function getTokenPrice(ids: string = "solana", vs_currencies: string = "usd", vol24: boolean = true, change24: boolean = true): Promise<CoinStatsSimple> {
//   return new Promise((resolve, reject) => {
//     fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs_currencies}&include_24hr_vol=${vol24}&include_24hr_change=${change24}`)
//       .then((res) => res.json())
//       .then(
//         (resp) => {
//           console.log('resp ===== ', resp)
//           if (resp) {
//             resolve(resp);
//           } else {
//             reject(Error('Promise rejected'));
//           }
//         },
//         (error) => {
//           console.error(error);
//         },
//       );
//   });
// }
