<template>
  <section class="firstlook-section">
    <div class="container">
      <div class="firstlook__body">
        <div class="lt-sm flex">
          <div class="total-stacked-alter flex justify-center q-mx-auto">
            <stacked-and-liquidity />
          </div>
        </div>
        <div class="lt-md flex">
          <div class="firstlook__epoch">
            <epoch />
          </div>
        </div>
        <div class="row justify-between relative-position">
          <div class="col col-12 col-md-4 q-pr-md firstlook__wallet" v-if="connected">
            <wallet-balance />
          </div>
          <div v-else class="firstlook__placeholder">
            <img alt="" class="firstlook__placeholder__icon" src="@/assets/img/sol-logo.svg" />
          </div>

          <div class="col col-12 col-md-8 q-pl-md q-ml-auto firstlook__stake-box">
            <stake-box />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
  import { computed } from 'vue';
  import { useWalletStore } from '@/store';
  import StakeBox from '@/components/StakeBox/StakeBox.vue';
  import WalletBalance from '@/components/WalletBalance.vue';
  import StackedAndLiquidity from '@/components/StackedAndLiquidity.vue';
  import Epoch from '@/components/Epoch.vue';

  export default {
    components: {
      WalletBalance,
      Epoch,
      StakeBox,
      StackedAndLiquidity,
    },
    setup() {
      const wallet = useWalletStore();

      return {
        connected: computed(() => wallet.connected),
      };
    },
  };
</script>
