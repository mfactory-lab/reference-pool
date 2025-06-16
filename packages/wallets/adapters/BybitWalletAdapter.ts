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

type SolanaBybitWallet = {
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

type BybitWindow = {
  bybitWallet?: {
    solana?: SolanaBybitWallet
  }
} & Window

export const BybitWalletName = 'Bybit Wallet' as WalletName<'Bybit Wallet'>

declare const window: BybitWindow

export class BybitWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = BybitWalletName
  url = 'https://www.bybit.com/web3/home'
  icon
    = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHZpZXdCb3g9IjAgMCA4OCA4OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAgMTguN0MwIDguMzcyMjcgOC4zNzIyOCAwIDE4LjcgMEg2OS4zQzc5LjYyNzcgMCA4OCA4LjM3MjI4IDg4IDE4LjdWNjkuM0M4OCA3OS42Mjc3IDc5LjYyNzcgODggNjkuMyA4OEgxOC43QzguMzcyMjcgODggMCA3OS42Mjc3IDAgNjkuM1YxOC43WiIgZmlsbD0iIzQwNDM0NyIvPgo8cGF0aCBkPSJNNy41NzYxNyAyNi44MDY3QzYuNzg1MTYgMjQuMDc4NyA4LjQ3NzUgMjEuMjUzMSAxMS4yNTU5IDIwLjY2M0w1Ny42MDg3IDEwLjgxNzNDNTkuODA5IDEwLjM1IDYyLjA0NDMgMTEuNDQ0MyA2My4wMjQ3IDEzLjQ2ODlMODMuODQ0MyA1Ni40NjU3TDI1LjE3NzYgODcuNTEwMUw3LjU3NjE3IDI2LjgwNjdaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMzEyXzE3NTM0KSIvPgo8cGF0aCBkPSJNOC4xODI0MiAzMC4xNjE4QzcuMzUwNDkgMjcuMjgzOCA5LjI3OTI1IDI0LjM0MTMgMTIuMjUwMiAyMy45NTU5TDczLjY4NjUgMTUuOTg4MUM3Ni4yMzkxIDE1LjY1NzEgNzguNjExMSAxNy4zNjE4IDc5LjExMTEgMTkuODg2N0w4OC4wMDAzIDY0Ljc3NzFMMjQuNjg5MiA4Ny4yNjY1TDguMTgyNDIgMzAuMTYxOFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0wIDM0LjIyMjJDMCAyOC44MjIxIDQuMzc3NjYgMjQuNDQ0NSA5Ljc3Nzc4IDI0LjQ0NDVINjguNDQ0NEM3OS4yNDQ3IDI0LjQ0NDUgODggMzMuMTk5OCA4OCA0NFY2OC40NDQ1Qzg4IDc5LjI0NDcgNzkuMjQ0NyA4OCA2OC40NDQ0IDg4SDE5LjU1NTZDOC43NTUzMiA4OCAwIDc5LjI0NDcgMCA2OC40NDQ1VjM0LjIyMjJaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNNTguMjIwMSA2MS4xOTU5VjQyLjg3NTVINjEuNzkzN1Y2MS4xOTU5SDU4LjIyMDFaIiBmaWxsPSIjRjdBNjAwIi8+CjxwYXRoIGQ9Ik0xNy40Mzk1IDY2LjY2MzdIOS43Nzc5NVY0OC4zNDM0SDE3LjEzMTNDMjAuNzA0OSA0OC4zNDM0IDIyLjc4NzQgNTAuMzUwNSAyMi43ODc0IDUzLjQ4OTNDMjIuNzg3NCA1NS41MjE1IDIxLjQ1MDQgNTYuODM0NSAyMC41MjU3IDU3LjI3MjFDMjEuNjMxNSA1Ny43ODY5IDIzLjA0NTYgNTguOTQzOCAyMy4wNDU2IDYxLjM4ODVDMjMuMDQ1NiA2NC44MTA4IDIwLjcwNDkgNjYuNjYzNyAxNy40Mzk1IDY2LjY2MzdaTTE2Ljg0ODEgNTEuNTM0M0gxMy4zNTE2VjU1Ljc1NDhIMTYuODQ4MUMxOC4zNjQyIDU1Ljc1NDggMTkuMjEzOCA1NC45MDY0IDE5LjIxMzggNTMuNjQ1NUMxOS4yMTM4IDUyLjM4MjYgMTguMzY2MiA1MS41MzQzIDE2Ljg0ODEgNTEuNTM0M1pNMTcuMDc5MyA1OC45NzA4SDEzLjM1MTZWNjMuNDcyOEgxNy4wNzkzQzE4LjY5OTQgNjMuNDcyOCAxOS40NyA2Mi40NDMyIDE5LjQ3IDYxLjIwOTJDMTkuNDcyIDU5Ljk3MzMgMTguNjk5NCA1OC45NzA4IDE3LjA3OTMgNTguOTcwOFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0zMi44OTI1IDU5LjE1MDFWNjYuNjYzN0gyOS4zNDM5VjU5LjE1MDFMMjMuODQxOSA0OC4zNDM0SDI3LjcyMzhMMzEuMTQzMiA1NS43Mjc4TDM0LjUxMDcgNDguMzQzNEgzOC4zOTI2TDMyLjg5MjUgNTkuMTUwMVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik00OC41NjMzIDY2LjY2MzdINDAuOTAxN1Y0OC4zNDM0SDQ4LjI1NTFDNTEuODI4NyA0OC4zNDM0IDUzLjkxMTIgNTAuMzUwNSA1My45MTEyIDUzLjQ4OTNDNTMuOTExMiA1NS41MjE1IDUyLjU3NDIgNTYuODM0NSA1MS42NDk1IDU3LjI3MjFDNTIuNzU1MyA1Ny43ODY5IDU0LjE2OTMgNTguOTQzOCA1NC4xNjkzIDYxLjM4ODVDNTQuMTY3NCA2NC44MTA4IDUxLjgyNjggNjYuNjYzNyA0OC41NjMzIDY2LjY2MzdaTTQ3Ljk3MTkgNTEuNTM0M0g0NC40NzUzVjU1Ljc1NDhINDcuOTcxOUM0OS40ODggNTUuNzU0OCA1MC4zMzc2IDU0LjkwNjQgNTAuMzM3NiA1My42NDU1QzUwLjMzNTcgNTIuMzgyNiA0OS40ODggNTEuNTM0MyA0Ny45NzE5IDUxLjUzNDNaTTQ4LjIwMzEgNTguOTcwOEg0NC40NzUzVjYzLjQ3MjhINDguMjAzMUM0OS44MjMyIDYzLjQ3MjggNTAuNTkzOCA2Mi40NDMyIDUwLjU5MzggNjEuMjA5MkM1MC41OTM4IDU5Ljk3MzQgNDkuODIxMyA1OC45NzA4IDQ4LjIwMzEgNTguOTcwOFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik03My40MzkgNTEuNTM0M1Y2Ni42NjM3SDY5Ljg2NTRWNTEuNTM0M0g2NS4wODM5VjQ4LjM0MzRINzguMjIyNFY1MS41MzQzSDczLjQzOVoiIGZpbGw9IndoaXRlIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMzEyXzE3NTM0IiB4MT0iNy4zMzMwOCIgeTE9IjI1LjU5NCIgeDI9Ijg0LjYzODEiIHkyPSIyMS43MjE2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGRkQ3NDgiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRjdBNjAwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg=='

  readonly supportedTransactionVersions: ReadonlySet<TransactionVersion>
    = new Set<TransactionVersion>(['legacy', 0])

  private _connecting: boolean
  private _publicKey: PublicKey | null
  private _wallet: SolanaBybitWallet | null
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
        if (window?.bybitWallet?.solana) {
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

      const wallet = window.bybitWallet!.solana!

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
