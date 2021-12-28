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

import EventEmitter from 'eventemitter3'
import { PublicKey, Transaction } from '@solana/web3.js'
import { WalletAdapter } from '@/utils'

export class SolongWalletAdapter extends EventEmitter implements WalletAdapter {
  _onProcess: boolean

  autoApprove = true
  connected = false

  constructor() {
    super()
    this._publicKey = null
    this._onProcess = false
    this.connect = this.connect.bind(this)
  }

  _publicKey: PublicKey | null

  get publicKey() {
    return this._publicKey
  }

  async signTransaction(transaction: Transaction) {
    return (window as any).solong.signTransaction(transaction)
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    const result: Transaction[] = []
    for (let i = 0; i < txs.length; i++)
      result.push(await this.signTransaction(txs[i]))
    return result
  }

  connect() {
    if (this._onProcess) {
      return
    }

    if ((window as any).solong === undefined) {
      return
    }

    this._onProcess = true
    ;(window as any).solong
      .selectAccount()
      .then((account: any) => {
        this._publicKey = new PublicKey(account)
        this.emit('connect', this._publicKey)
      })
      .catch(() => {
        this.disconnect()
      })
      .finally(() => {
        this._onProcess = false
      })
  }

  disconnect() {
    if (this._publicKey) {
      this._publicKey = null
      this.emit('disconnect')
    }
  }
}
