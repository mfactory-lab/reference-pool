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

import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import type { Cluster, Commitment } from '@solana/web3.js'
import { Connection, PublicKey } from '@solana/web3.js'
import { tokenAuthFetchMiddleware } from '@/utils'
import { DEFAULT_COMMITMENT, DEFAULT_CONFIRM_TIMEOUT, DEFAULT_ENDPOINT, ENDPOINTS } from '@/config'

export type ExtendedCluster = Cluster | 'localnet'

export interface Endpoint {
  id: string
  name: string
  cluster: ExtendedCluster
  url: string
  stakePoolAddress: string
  stakeLimit?: number
  getToken?: () => Promise<string>
}

export const useConnectionStore = defineStore({
  id: 'connection',
  state: () => ({
    commitment: DEFAULT_COMMITMENT,
    confirmTransactionInitialTimeout: DEFAULT_CONFIRM_TIMEOUT,
    rpc: useStorage<string>('rpc', ''),
  }),
  getters: {
    endpoint(state) {
      return ENDPOINTS.find(e => e.id === state.rpc) ?? DEFAULT_ENDPOINT
    },
    connection(state): Connection {
      return new Connection(this.endpoint.url, {
        confirmTransactionInitialTimeout: state.confirmTransactionInitialTimeout,
        commitment: state.commitment,
        fetchMiddleware: this.endpoint.getToken
          ? tokenAuthFetchMiddleware({
            tokenExpiry: 5 * 60 * 1000, // 5 min
            getToken: this.endpoint.getToken,
          })
          : undefined,
      })
    },
    stakePoolAddress(): PublicKey | null {
      return this.endpoint ? new PublicKey(this.endpoint.stakePoolAddress) : null
    },
    stakeLimit(): number {
      return this.endpoint.stakeLimit ?? 0
    },
    cluster(): ExtendedCluster {
      return this.endpoint.cluster
    },
  },
  actions: {
    setRpc(rpc: string) {
      this.rpc = rpc
    },
    setCommitment(commitment: Commitment) {
      this.commitment = commitment
    },
  },
})
