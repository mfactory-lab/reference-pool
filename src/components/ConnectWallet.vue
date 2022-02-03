<template>
  <template v-if="connected">
    <q-btn
      class="app-header__wallet-btn"
      :class="$style.btn"
      color="primary"
      text-color="primary-gray"
      rounded
      unelevated
      @click="dialog = true"
    >
      {{ walletShortAddress }}
    </q-btn>
  </template>
  <template v-else>
    <q-btn
      class="app-header__wallet-btn"
      :class="$style.btn"
      color="primary"
      text-color="primary-gray"
      rounded
      :disable="connectionLost"
      @click="connect"
    >
      <div class="row items-center no-wrap">
        <span>CONNECT WALLET</span>
      </div>
    </q-btn>
  </template>

  <q-dialog v-model="dialog">
    <q-card v-if="connected">
      <q-card-section>
        <div class="text-h6 text-center"> Your wallet </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <copy-to-clipboard :text="walletAddress" />
        {{ walletAddress }}
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="q-gutter-md row justify-between">
          <q-btn outline rounded @click="disconnect"> Disconnect </q-btn>
          <q-btn outline rounded @click="ok"> Ok </q-btn>
        </div>
      </q-card-section>
    </q-card>

    <q-card v-else style="width: 300px">
      <q-card-section>
        <div class="text-h6"> Connect to a wallet </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="scroll" style="max-height: 55vh">
        <q-list bordered separator>
          <q-item v-for="p in providers" :key="p.name" v-ripple clickable @click="select(p)">
            <q-item-section>{{ p.name }}</q-item-section>
            <q-item-section avatar>
              <q-avatar>
                <img :src="p.icon" alt="" />
              </q-avatar>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script type="ts">
  import { computed, ref } from 'vue';
  import { storeToRefs } from 'pinia';
  import { WALLET_PROVIDERS, shortenAddress } from '@/utils';
  import { useStakePoolStore, useWalletStore } from '@/store';
  import CopyToClipboard from '@/components/CopyToClipboard.vue';

  export default {
    components: { CopyToClipboard },
    setup() {
      const walletStore = useWalletStore();
      const { connected } = storeToRefs(walletStore);
      const { connectionLost } = storeToRefs(useStakePoolStore())
      const walletAddress = computed(() => walletStore.wallet?.publicKey?.toBase58() ?? '');
      const walletShortAddress = computed(() => shortenAddress(walletStore.wallet?.publicKey?.toBase58() ?? ''));

      const dialog = ref(false);

      return {
        connectionLost,
        walletAddress,
        walletShortAddress,
        dialog,
        connected,
        providers: WALLET_PROVIDERS,
        select(provider) {
          walletStore.select(provider);
          dialog.value = false;
        },
        connect() {
          dialog.value = true;
        },
        disconnect() {
          walletStore.disconnect();
          dialog.value = false;
        },
        ok() {
          dialog.value = false;
        },
      };
    },
  };
</script>

<style lang="scss" module>
  .btn {
    white-space: nowrap;
    flex-wrap: nowrap;

    img {
      height: 0.6em;
      margin-right: 0.2em;
    }
  }
</style>
