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

import { defineStore } from 'pinia';
import {
  Cluster,
  Commitment,
  Connection,
  PublicKey,
  Signer,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { DEFAULT_COMMITMENT, DEFAULT_ENDPOINT, ENDPOINTS } from '@/config';
import { useStorage } from '@vueuse/core';
import { WalletAdapter } from '@/utils';

export type ExtendedCluster = Cluster | 'localnet';

export interface Endpoint {
  name: ExtendedCluster;
  url: string;
  stakePoolAddress: string;
  stakeLimit?: number;
}

export const useConnectionStore = defineStore({
  id: 'connection',
  state: () => ({
    commitment: DEFAULT_COMMITMENT,
    cluster: useStorage<ExtendedCluster>('cluster', DEFAULT_ENDPOINT.name),
  }),
  getters: {
    endpoint(state) {
      return ENDPOINTS.find((e) => e.name === state.cluster)!;
    },
    connection(state): Connection {
      return new Connection(this.endpoint.url, state.commitment);
    },
    stakePoolAddress(): PublicKey | null {
      return this.endpoint ? new PublicKey(this.endpoint.stakePoolAddress) : null;
    },
    stakeLimit(): number {
      return this.endpoint.stakeLimit ?? 0;
    },
  },
  actions: {
    setCluster(cluster: ExtendedCluster) {
      this.cluster = cluster;
    },
    setCommitment(commitment: Commitment) {
      this.commitment = commitment;
    },
  },
});

/**
 * Send and sign transaction
 */
export async function sendTransaction(
  connection: Connection,
  wallet: WalletAdapter,
  instructions: TransactionInstruction[],
  signers: Signer[],
) {
  if (!wallet?.publicKey) {
    throw new Error('Wallet is not connected');
  }

  let transaction = new Transaction({ feePayer: wallet.publicKey });
  transaction.add(...instructions);
  transaction.recentBlockhash = (await connection.getRecentBlockhash('finalized')).blockhash;

  if (signers.length > 0) {
    transaction.partialSign(...signers);
  }

  transaction = await wallet.signTransaction(transaction);
  const rawTransaction = transaction.serialize();

  // if (simulate) {
  //   const simulation = await connection.simulateTransaction(transaction);
  //   console.log('TX Simulation:', simulation);
  //   return simulation;
  // }

  const result = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: true,
    preflightCommitment: DEFAULT_COMMITMENT,
  });

  console.log('TX(signature): ', result.toString());
  console.log('TX(base64): ', rawTransaction.toString('base64'));

  return result;
}
