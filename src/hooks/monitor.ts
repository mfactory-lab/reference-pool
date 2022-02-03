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
import { ref } from 'vue';
import { useConnectionStore } from '@/store';

const CONFIRM_TIMEOUT = 30000;

export function useMonitorTransaction() {
  const connectionStore = useConnectionStore();
  const { notify } = useQuasar();
  const sending = ref(false);

  async function monitorTransaction(
    signatureOrPromise: Promise<string> | string,
    {
      onSuccess,
      onError,
    }: {
      onSuccess?: (signature: string) => void;
      onError?: (signature: string) => void;
    } = {},
  ): Promise<void> {
    let dismiss = notify({
      progress: true,
      type: 'ongoing',
      message: 'Sending transaction...',
      timeout: 15000,
    });

    sending.value = true;

    let signature = '';
    try {
      signature = String(await signatureOrPromise);
    } catch (e: any) {
      notify({ caption: e.message, type: 'negative', timeout: 5000 });
      sending.value = false;
      return dismiss();
    }

    // https://solscan.io/tx/{id}
    const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=${connectionStore.cluster}`;

    const exploreAction = {
      label: 'Explore',
      color: 'white',
      target: '_blank',
      type: 'a',
      href: explorerUrl,
    };

    const closeAction = {
      label: 'Close',
      color: 'white',
      type: 'a',
    };

    try {
      dismiss();

      dismiss = notify({
        // spinner: true,
        progress: true,
        type: 'ongoing',
        message: 'Confirming transaction...',
        actions: [exploreAction],
        timeout: CONFIRM_TIMEOUT,
      });
      const res = await connectionStore.connection.confirmTransaction(signature);

      dismiss();

      if (res.value.err) {
        console.error(res.value.err);
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(JSON.stringify(res.value.err));
      }

      dismiss = notify({
        message: 'Transaction confirmed',
        type: 'positive',
        actions: [exploreAction],
      });

      if (onSuccess) {
        onSuccess(signature);
      }
    } catch (e: any) {
      dismiss();
      notify({
        message: 'Transaction error',
        caption: e.message,
        type: 'negative',
        timeout: 0,
        actions: [exploreAction, closeAction],
      });

      if (onError) {
        onError(e);
      }
      console.error(e);
    } finally {
      sending.value = false;
    }
  }

  return { monitorTransaction, sending };
}
