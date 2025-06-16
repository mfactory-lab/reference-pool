/*
 * This file is part of Solana Reference Stake Pool code.
 *
 * Copyright © 2023, mFactory GmbH
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

import type { Cluster, Commitment } from '@solana/web3.js'
import { Connection, PublicKey } from '@solana/web3.js'
import { defineStore } from 'pinia'
import {
  DEFAULT_COMMITMENT,
  DEFAULT_CONFIRM_TIMEOUT,
  DEFAULT_ENDPOINT,
  ENDPOINTS,
} from '~/config'
import { tokenAuthFetchMiddleware } from '~/utils'

export type ExtendedCluster = Cluster | 'localnet'

export type Endpoint = {
  id: string
  name: string
  cluster: ExtendedCluster
  url: string
  stakePoolAddress: string
  stakeLimit?: number
  wsEndpoint?: string
  getToken?: () => Promise<string>
}

export const useConnectionStore = defineStore('connection', () => {
  const state = reactive({
    commitment: DEFAULT_COMMITMENT,
    confirmTransactionInitialTimeout: DEFAULT_CONFIRM_TIMEOUT,
  })

  const rpc = useLocalStorage<string>('rpc', '')

  const endpoint = computed(() => {
    return ENDPOINTS.find(e => e.id === rpc.value) ?? DEFAULT_ENDPOINT
  })

  const connection = computed<Connection>(() => {
    return new Connection(endpoint.value?.url, {
      confirmTransactionInitialTimeout: state.confirmTransactionInitialTimeout,
      wsEndpoint: endpoint.value?.wsEndpoint,
      commitment: state.commitment,
      fetchMiddleware: endpoint.value?.getToken
        ? tokenAuthFetchMiddleware({
            tokenExpiry: 5 * 60 * 1000, // 5 min
            getToken: endpoint.value?.getToken,
          })
        : undefined,
    })
  })

  const stakePoolAddress = computed<PublicKey | null>(() => {
    try {
      return endpoint.value?.stakePoolAddress
        ? new PublicKey(endpoint.value.stakePoolAddress)
        : null
    } catch {
      return null
    }
  })

  const stakeLimit = computed<number>(() => {
    return endpoint.value?.stakeLimit ?? 0
  })

  const cluster = computed<ExtendedCluster>(() => {
    return endpoint.value?.cluster
  })

  const network = computed<string>(() => {
    const cluster = endpoint.value?.cluster
    return cluster === 'mainnet-beta' ? 'mainnet' : cluster
  })

  function setRpc(_rpc: string) {
    rpc.value = _rpc
  }

  function setCommitment(commitment: Commitment) {
    state.commitment = commitment
  }

  return {
    cluster,
    network,
    endpoint,
    stakeLimit,
    connection,
    stakePoolAddress,

    setRpc,
    setCommitment,
  }
})
