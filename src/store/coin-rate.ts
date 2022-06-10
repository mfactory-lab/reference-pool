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

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useIntervalFn, useLocalStorage } from '@vueuse/core'
import { getTokenPrice } from '@/utils/coingecko'
import { RATES_RELOAD_INTERVAL } from '@/config'

export const useCoinRateStore = defineStore('coin-rate', () => {
  const solPrice = useLocalStorage('sol-price', 200)
  const solVol24 = ref(0)
  const solChange24 = ref(0)
  const solChangePercentage24 = ref(0)
  const loading = ref(false)

  async function load() {
    loading.value = true
    const resp = await getTokenPrice()
    solPrice.value = resp.current_price
    solVol24.value = resp.total_volume
    solChange24.value = resp.price_change_24h
    solChangePercentage24.value = resp.price_change_percentage_24h_in_currency
    loading.value = false
    console.log('[CoinRate]', resp)
  }

  useIntervalFn(load, RATES_RELOAD_INTERVAL, { immediateCallback: true })

  return {
    solPrice,
    solVol24,
    solChange24,
    solChangePercentage24,
    loading,
    load,
  }
})
