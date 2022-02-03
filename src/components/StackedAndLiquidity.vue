<template>
  <total-stacked />
  <div class="total-stacked__reserved-balance">
    Available Liquidity: <b>{{ reserveStakeBalance }} SOL</b>
  </div>
</template>

<script lang="ts">
  import { computed } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useStakePoolStore } from '@/store';
  import { lamportsToSol, priceFormatter } from '@/utils';
  import TotalStacked from '@/components/TotalStacked.vue';

  export default {
    components: {
      TotalStacked,
    },
    setup() {
      const stakePoolStore = useStakePoolStore();
      const { reserveStakeBalance } = storeToRefs(stakePoolStore);

      function formatAmount(val: number) {
        return priceFormatter.format(val);
      }
      return {
        reserveStakeBalance: computed(() => formatAmount(lamportsToSol(reserveStakeBalance.value))),
      };
    },
  };
</script>

<style lang="scss" scoped>
  .total-stacked {
    &__reserved-balance {
      padding: 0 0 0 23px;
      font-size: 12px;
      color: #fff;

      @media (max-width: $breakpoint-sm) {
        width: 270px;
      }

      @media (max-width: $breakpoint-xs) {
        width: auto;
      }
    }
  }

  .total-stacked-alter {
    .total-stacked {
      &__reserved-balance {
        color: #000;
      }
    }
  }
</style>
<style lang="scss">
  .total-stacked-alter {
    display: flex;
    flex-direction: column;
    margin-top: -20px;
    margin-bottom: 10px;
    margin-left: auto;
    margin-right: auto;
  }
</style>
