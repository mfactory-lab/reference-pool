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

interface PairData {
  timeClose: string
  quote: {
    close: number
  }
}

/*
 * length is count of intervals
 */
export async function getPairIntervalPrice(
  id = 5426 /* solana */,
  convertTo = 2781 /* usd */,
  count = 30,
) {
  return new Promise<Array<PairData>>((resolve, reject) => {
    const timeEnd = String(Date.now()).slice(0, -3)
    const timeStart = Number(timeEnd) - (count + 1) * 3600 * 24
    fetch(
      `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/historical?id=${id}&convertId=${convertTo}&timeStart=${timeStart}&timeEnd=${timeEnd}&interval=hourly`,
    )
      // fetch(`https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail/chart?id=${id}&range=${range}${convertId}`)
      // fetch(`https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail/chart?id=${id}&interval=daily${convertId}count=31`)
      // https://web-api.coinmarketcap.com/v1.1/cryptocurrency/quotes/historical?aux=search_interval,market_cap&format=chart&id=1,1027,1839,825,5426,2010,3408,52,6636,74&include_global=true&interval=weekly&time_end=1639602000&time_start=2013-04-28
      .then(res => res.json())
      .then(
        (resp) => {
          // console.log('getPairIntervalPrice ====================================== ')
          // console.log('from ===== ', id)
          // console.log('to  ===== ', convertTo)
          // console.log('resp ===== ', resp)
          if (resp.data?.quotes) {
            resolve(resp.data.quotes)
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
