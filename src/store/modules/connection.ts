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

import { defineStore } from 'pinia';
import {
  Connection,
  Commitment,
  PublicKey,
  TransactionInstruction,
  Signer,
  Transaction,
  Cluster,
} from '@solana/web3.js';
import { ENDPOINTS, DEFAULT_COMMITMENT, DEFAULT_ENDPOINT } from '@/config';
import { ref, computed } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { WalletAdapter } from '@/utils';

export type ExtendedCluster = Cluster | 'localnet'

export interface Endpoint {
  name: ExtendedCluster,
  url: string,
  stakePoolAddress: string,
  stakeLimit?: number,
}

export const useConnection = defineStore('connection', () => {
  const commitment = ref<Commitment>(DEFAULT_COMMITMENT);
  const cluster = useLocalStorage<ExtendedCluster>('cluster', DEFAULT_ENDPOINT.name);
  const endpoint = computed<Endpoint | undefined>(
    () => ENDPOINTS.find((e) => e.name === cluster.value),
  );

  const connection = computed(() => new Connection(endpoint.value!.url, commitment.value));

  const stakePoolAddress = computed(() => endpoint.value ?
    new PublicKey(endpoint.value?.stakePoolAddress) : null);

  return {
    cluster,
    endpoint,
    commitment,
    connection,
    stakePoolAddress,
    stakeLimit: computed(() => endpoint.value?.stakeLimit ?? 0),
    setCluster: (v: ExtendedCluster) => cluster.value = v,
    setCommitment: (v: Commitment) => commitment.value = v,
  };
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

  const result = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: true,
    preflightCommitment: DEFAULT_COMMITMENT,
  });

  return result;
}
