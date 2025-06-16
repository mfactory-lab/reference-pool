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

type SolanaOKXWallet = {
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

type OKXWindow = {
  okxwallet?: {
    solana?: SolanaOKXWallet
  }
} & Window

export const OKXWalletName = 'OKX Wallet' as WalletName<'OKX Wallet'>

declare const window: OKXWindow

export class OKXWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = OKXWalletName
  url = 'https://www.okx.com/web3'
  icon
    = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJDSURBVHgB7Zq9jtpAEMfHlhEgQLiioXEkoAGECwoKxMcTRHmC5E3IoyRPkPAEkI7unJYmTgEFTYwA8a3NTKScLnCHN6c9r1e3P2llWQy7M/s1Gv1twCP0ej37dDq9x+Zut1t3t9vZjDEHIiSRSPg4ZpDL5fxkMvn1cDh8m0wmfugfO53OoFQq/crn8wxfY9EymQyrVCqMfHvScZx1p9ls3pFxXBy/bKlUipGPrVbLuQqAfsCliq3zl0H84zwtjQrOw4Mt1W63P5LvBm2d+Xz+YzqdgkqUy+WgWCy+Mc/nc282m4FqLBYL+3g8fjDxenq72WxANZbLJeA13zDX67UDioL5ybXwafMYu64Ltn3bdDweQ5R97fd7GyhBQMipx4POeEDHIu2LfDdBIGGz+hJ9CQ1ABjoA2egAZPM6AgiCAEQhsi/C4jHyPA/6/f5NG3Ks2+3CYDC4aTccDrn6ojG54MnEvG00GoVmWLIRNZ7wTCwDHYBsdACy0QHIhiuRETxlICWpMMhGZHmqS8qH6JLyGegAZKMDkI0uKf8X4SWlaZo+Pp1bRrwlJU8ZKLIvUjKh0WiQ3sRUbNVq9c5Ebew7KEo2m/1p4jJ4qAmDaqDQBzj5XyiAT4VCQezJigAU+IDU+z8vJFnGWeC+bKQV/5VZ71FV6L7PA3gg3tXrdQ+DgLhC+75Wq3no69P3MC0NFQpx2lL04Ql9gHK1bRDjsSBIvScBnDTk1WrlGIZBorIDEYJj+rhdgnQ67VmWRe0zlplXl81vcyEt0rSoYDUAAAAASUVORK5CYII='

  readonly supportedTransactionVersions: ReadonlySet<TransactionVersion>
    = new Set<TransactionVersion>(['legacy', 0])

  private _connecting: boolean
  private _publicKey: PublicKey | null
  private _wallet: SolanaOKXWallet | null
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
        if (window?.okxwallet?.solana) {
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

      const wallet = window.okxwallet!.solana!

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
