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

import EventEmitter from 'eventemitter3';
import { PublicKey, Transaction } from '@solana/web3.js';
import { WalletAdapter } from '@/utils';

type PhantomEvent = 'disconnect' | 'connect'
type PhantomRequestMethod = 'connect' | 'disconnect' | 'signTransaction' | 'signAllTransactions'

interface PhantomProvider {
  publicKey?: PublicKey,
  isConnected?: boolean,
  autoApprove?: boolean,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>,
  connect: () => Promise<void>,
  disconnect: () => Promise<void>,
  on: (event: PhantomEvent, handler: (args: any) => void) => void,
  request: (method: PhantomRequestMethod, params: any) => Promise<any>,
  listeners: (event: PhantomEvent) => (() => void)[]
}

export class PhantomWalletAdapter extends EventEmitter implements WalletAdapter {
  constructor() {
    super();
    this.connect = this.connect.bind(this);
  }

  // noinspection JSMethodCanBeStatic
  private get _provider(): PhantomProvider | undefined {
    if ((window as any)?.solana?.isPhantom) {
      return (window as any).solana;
    }
    return undefined;
  }

  private _handleConnect = (...args: any) => {
    this.emit('connect', ...args);
  };

  private _handleDisconnect = (...args: any) => {
    this.emit('disconnect', ...args);
  };

  get connected() {
    return this._provider?.isConnected || false;
  }

  get autoApprove() {
    return this._provider?.autoApprove || false;
  }

  // eslint-disable-next-line
  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if (!this._provider) {
      return transactions;
    }

    return this._provider.signAllTransactions(transactions);
  }

  get publicKey() {
    return this._provider?.publicKey;
  }

  // eslint-disable-next-line
  async signTransaction(transaction: Transaction) {
    if (!this._provider) {
      return transaction;
    }

    return this._provider.signTransaction(transaction);
  }

  connect() {
    if (!this._provider) {
      return;
    }

    if (!(window as any).solana.isPhantom) {
      return;
    }

    if (this._provider && !this._provider.listeners('connect').length) {
      this._provider?.on('connect', this._handleConnect);
    }
    if (!this._provider.listeners('disconnect').length) {
      this._provider?.on('disconnect', this._handleDisconnect);
    }
    return this._provider?.connect();
  }

  disconnect() {
    if (this._provider) {
      this._provider.disconnect();
    }
  }
}
