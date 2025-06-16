import type { WalletName } from '@solana/wallet-adapter-base'
import type {
  Transaction,
  TransactionVersion,
  VersionedTransaction,
} from '@solana/web3.js'
import {
  BaseMessageSignerWalletAdapter,
  WalletAccountError,
  WalletConnectionError,
  WalletDisconnectedError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletPublicKeyError,
  WalletReadyState,
  WalletSignTransactionError,
  scopePollingDetectionStrategy,
} from '@solana/wallet-adapter-base'
import { PublicKey } from '@solana/web3.js'

type SolanaGateWallet = {
  publicKey: PublicKey
  connect: () => Promise<PublicKey>
  disconnect: () => Promise<void>
  signTransaction: <T extends Transaction | VersionedTransaction>(
    transaction: T
  ) => Promise<T>
  signAllTransactions: <T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ) => Promise<T[]>
  signMessage: (msg: string) => Promise<Uint8Array>
}

type GateWindow = {
  gatewallet?: {
    solana?: SolanaGateWallet
  }
} & Window

export const GateWalletName = 'Gate Wallet' as WalletName<'Gate Wallet'>

declare const window: GateWindow

export class GateWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = GateWalletName
  url = 'https://www.gate.io/web3'
  icon
    = 'data:image/png;base64,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'

  readonly supportedTransactionVersions: ReadonlySet<TransactionVersion>
    = new Set<TransactionVersion>(['legacy', 0])

  private _connecting: boolean
  private _publicKey: PublicKey | null
  private _wallet: SolanaGateWallet | null
  private _readyState: WalletReadyState
    = typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected

  constructor() {
    super()
    this._connecting = false
    this._publicKey = null
    this._wallet = null

    if (this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window?.gatewallet?.solana) {
          this._readyState = WalletReadyState.Installed
          this.emit('readyStateChange', this._readyState)
          return true
        }
        return false
      })
    }
  }

  get connecting() {
    return this._connecting
  }

  get readyState() {
    return this._readyState
  }

  get publicKey() {
    return this._publicKey
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) {
        return
      }
      if (this._readyState !== WalletReadyState.Installed) {
        throw new WalletNotReadyError()
      }

      this._connecting = true

      const wallet = window.gatewallet!.solana!

      try {
        await wallet.connect()
      } catch (error: any) {
        throw new WalletConnectionError(error?.message, error)
      }

      if (wallet.publicKey.toString() === '11111111111111111111111111111111') {
        throw new WalletAccountError()
      }

      let publicKey: PublicKey
      try {
        publicKey = new PublicKey(wallet.publicKey.toBytes())
      } catch (error: any) {
        throw new WalletPublicKeyError(error?.message, error)
      }

      this._wallet = wallet
      this._publicKey = publicKey

      this.emit('connect', publicKey)
    } catch (error: any) {
      this.emit('error', error)
      throw error
    } finally {
      this._connecting = false
    }
  }

  async disconnect(): Promise<void> {
    const wallet = this._wallet
    if (wallet) {
      this._wallet = null
      this._publicKey = null

      try {
        await wallet.disconnect()
      } catch {
        this.emit('error', new WalletDisconnectedError())
      }
    }

    this.emit('disconnect')
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
  ): Promise<T> {
    try {
      const wallet = this._wallet
      if (!wallet) {
        throw new WalletNotConnectedError()
      }

      try {
        return (await wallet.signTransaction(transaction)) as T
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error)
      }
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }

  override async signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[],
  ): Promise<T[]> {
    try {
      const wallet = this._wallet
      if (!wallet) {
        throw new WalletNotConnectedError()
      }

      try {
        return (await wallet.signAllTransactions(transactions)) as T[]
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error)
      }
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      const wallet = this._wallet
      if (!wallet) {
        throw new WalletNotConnectedError()
      }

      try {
        return wallet.signMessage(new TextDecoder().decode(message))
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error)
      }
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }
}
