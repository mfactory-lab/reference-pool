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

/*
 * length is count of intervals
 */
export async function getPairIntervalPriceBinance(
  pair = 'SOLUSDT',
  length = 31,
  interval = '1d',
): Promise<Array<Array<number | string>>> {
  return new Promise((resolve, reject) => {
    fetch(
      `https://api.binance.com/api/v3/klines?limit=${length}&symbol=${pair}&interval=${interval}`,
    )
      .then((res) => res.json())
      .then(
        (resp) => {
          console.log('resp ===== ', resp);
          if (resp) {
            resolve(resp);
          } else {
            reject(Error('Promise rejected'));
          }
        },
        (error) => {
          console.error(error);
        },
      );
  });
}

// binance for charts:
// https://www.binance.com/api/v1/aggTrades?limit=80&symbol=SOLUSDT
// https://www.binance.com/api/v3/depth?symbol=SOLUSDT&limit=1000
// https://www.binance.com/bapi/asset/v2/public/asset-service/product/get-product-by-symbol?symbol=SOLUSDT
// https://www.binance.com/bapi/composite/v1/public/marketing/tardingPair/detail?symbol=sol
// https://www.binance.com/bapi/margin/v1/public/isolated-margin/pair/listed
// !!! https://www.binance.com/api/v3/klines?limit=1000&symbol=SOLUSDT&interval=1d
