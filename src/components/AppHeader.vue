<template>
  <q-header :class="!$q.dark.isActive ? 'bg-white text-dark' : null" class="app-header">
    <div class="container">
      <q-toolbar>
        <router-link class="app-header__logo" to="/">
          <app-logo />
        </router-link>
        <div class="xs-hide">
          <stacked-and-liquidity />
        </div>
        <q-space />
        <div class="app-header__epoch">
          <epoch />
        </div>
        <q-space />
        <div class="text-right">
          <div class="q-gutter-sm justify-end flex wrap">
            <cluster-selector />
            <connect-wallet />
          </div>
        </div>
      </q-toolbar>
    </div>
  </q-header>
</template>

<script lang="ts">
  import AppLogo from '@/components/AppLogo.vue';
  import ClusterSelector from '@/components/ClusterSelector.vue';
  import StackedAndLiquidity from '@/components/StackedAndLiquidity.vue';
  import ConnectWallet from '@/components/ConnectWallet.vue';
  import Epoch from '@/components/Epoch.vue';

  export default {
    components: {
      Epoch,
      AppLogo,
      ClusterSelector,
      StackedAndLiquidity,
      ConnectWallet,
    },
  };
</script>
