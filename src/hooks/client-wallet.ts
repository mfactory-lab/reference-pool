import { useWallet } from '@solana/wallet-adapter-vue'
import { computed, ref } from 'vue'

export function useClientWallet(): ReturnType<typeof useWallet> {
  if (import.meta.client) {
    return useWallet()
  }

  const emptyFn = async () => {
    return undefined
  }

  const connected = ref(false)
  const connecting = ref(false)
  const disconnecting = ref(false)
  const publicKey = ref(null)
  const wallet = ref(null)
  const wallets = ref([])

  return {
    autoConnect: ref(false),
    cluster: ref('mainnet-beta'),
    connected,
    connecting,
    disconnecting,
    publicKey,
    wallet,
    wallets,

    connect: emptyFn,
    disconnect: emptyFn,
    select: () => { },
    sendTransaction: emptyFn,
    signTransaction: computed(() => emptyFn),
    signAllTransactions: computed(() => emptyFn),
    signMessage: computed(() => emptyFn),

    ready: computed(() => false),
    readyState: ref('NotReady'),
  } as unknown as ReturnType<typeof useWallet>
}
