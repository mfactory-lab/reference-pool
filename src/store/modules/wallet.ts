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

import { useQuasar } from 'quasar';
import { defineStore } from 'pinia';
import { computed, ref, watch, watchEffect } from 'vue';
import Wallet from '@project-serum/sol-wallet-adapter';
import { WalletInfo } from '@/utils';
import { useConnectionStore } from '@/store';
import { useEmitter } from '@/hooks';

// Wallet Events
export const WALLET_CONNECT_EVENT = Symbol();
export const WALLET_DISCONNECT_EVENT = Symbol();
export const ACCOUNT_CHANGE_EVENT = Symbol();

export const useWalletStore = defineStore('wallet', () => {
  const connectionStore = useConnectionStore();
  const { notify } = useQuasar();
  const emitter = useEmitter();

  const connected = ref(false);
  const autoConnect = ref(false);
  const provider = ref<WalletInfo>();

  // const provider = computed(() => WALLET_PROVIDERS.find((p) => p.name === providerId.value));

  const wallet = computed(() => {
    if (!provider.value) {
      return null;
    }
    const endpoint = connectionStore.endpoint?.url;
    const providerUrl = provider.value.url;
    if (!endpoint || !providerUrl) {
      return null;
    }
    if (provider.value.getAdapter !== undefined) {
      return provider.value.getAdapter({ providerUrl, endpoint });
    }
    return new Wallet(providerUrl, endpoint);
  });

  watch(
    wallet,
    (w, _, onInvalidate) => {
      if (w) {
        w.on('connect', () => {
          connected.value = true;
          if (w.publicKey) {
            const walletPublicKey = w.publicKey.toBase58();
            const keyToDisplay =
              walletPublicKey.length > 20
                ? `${walletPublicKey.substring(0, 7)}.....${walletPublicKey.substring(
                    walletPublicKey.length - 7,
                    walletPublicKey.length,
                  )}`
                : walletPublicKey;
            connectionStore.connection.onAccountChange(w.publicKey, (acc) =>
              emitter.emit(ACCOUNT_CHANGE_EVENT, acc),
            );
            connectionStore.connection.onLogs(w.publicKey, (logs) => {
              console.log(logs);
            });
            notify({
              message: 'Wallet update',
              caption: `Connected to wallet ${keyToDisplay}`,
              timeout: 5000,
            });
          }
          emitter.emit(WALLET_CONNECT_EVENT, w);
        });
        w.on('disconnect', () => {
          console.info('Wallet.disconnect');
          connected.value = false;
          notify({
            message: 'Wallet update',
            caption: `Disconnected from wallet`,
            timeout: 5000,
          });
          emitter.emit(WALLET_DISCONNECT_EVENT, w);
        });
      }

      onInvalidate(() => w?.disconnect());
    },
    { immediate: true },
  );

  watchEffect(() => {
    if (wallet.value && autoConnect.value) {
      wallet.value.connect();
      autoConnect.value = false;
    }
  });

  return {
    wallet,
    connected,
    walletPubKey: computed(() => (connected.value ? wallet.value?.publicKey : null)),
    select: (wallet: WalletInfo) => {
      provider.value = wallet;
      autoConnect.value = true;
    },
    disconnect: () => wallet.value?.disconnect(),
  };
});
