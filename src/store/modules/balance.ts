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

import { defineStore, storeToRefs } from 'pinia';
import { ref, watchEffect, computed } from 'vue';
import { Connection, PublicKey, AccountInfo } from '@solana/web3.js';
import {
  useConnection,
  useWallet,
  useStakePool,
  ACCOUNT_CHANGE_EVENT,
  WALLET_DISCONNECT_EVENT,
} from '@/store';
import { findAssociatedTokenAddress, lamportsToSol } from '@/utils';
import { useEmitter } from '@/hooks';
import { Buffer } from 'buffer';
import { debounce } from 'lodash-es';

export const useBalance = defineStore('balance', () => {
  const { connection } = storeToRefs(useConnection());
  const { wallet, connected } = storeToRefs(useWallet());
  const { stakePool } = storeToRefs(useStakePool());
  const emitter = useEmitter();

  const nativeBalance = ref(0);
  const tokenBalance = ref(0);

  const _onAccountChange = debounce(async function(acc: AccountInfo<Buffer>) {
    nativeBalance.value = acc?.lamports ?? 0;
    _getTokenBalance().then();
  }, 300);

  async function _getTokenBalance() {
    if (wallet.value != null && stakePool.value?.poolMint) {
      tokenBalance.value = await getTokenBalance(
        connection.value!,
        wallet.value!.publicKey!,
        stakePool.value.poolMint,
      ) ?? 0;
    }
  }

  emitter.on(WALLET_DISCONNECT_EVENT, () => {
    nativeBalance.value = 0;
    tokenBalance.value = 0;
  });

  emitter.on(ACCOUNT_CHANGE_EVENT, _onAccountChange);

  watchEffect(async () => {
    if (connected.value && wallet.value?.publicKey) {
      connection.value!.getAccountInfo(wallet.value?.publicKey).then(_onAccountChange);
    }
  });

  const solBalance = computed(() => lamportsToSol(nativeBalance.value));

  return {
    nativeBalance,
    solBalance,
    tokenBalance,
  };
});

/**
 * Gets TokenAccountBalance from the associated token account
 */
export async function getTokenBalance(
  connection: Connection,
  walletAddress: PublicKey,
  mint: PublicKey,
): Promise<number | null> {
  try {
    const associatedTokenAcc = await findAssociatedTokenAddress(
      walletAddress,
      mint,
    );
    const tBalance = await connection.getTokenAccountBalance(associatedTokenAcc);
    return tBalance.value.uiAmount;
  } catch (ex) {
    console.log(ex);
    return 0;
  }
}
