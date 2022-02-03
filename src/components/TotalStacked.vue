<template>
  <div class="total-stacked">
    <div class="total-stacked__label">Total Staked</div>
    <div class="total-stacked__value">
      <div class="total-stacked__sol">
        {{ formatPrice(solStaked) }} /
        <span v-if="maxSolToStake">
          {{ formatPrice(maxSolToStake) }}
        </span>
      </div>
      <div class="total-stacked__usd"> ≈&nbsp;${{ formatPrice(usdStacked) }} </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { computed } from 'vue';
  import { formatAmount, lamportsToSol } from '@/utils';
  import { useCoinRateStore, useConnectionStore, useStakePoolStore } from '@/store';
  import { storeToRefs } from 'pinia';

  export default {
    setup() {
      const { endpoint } = storeToRefs(useConnectionStore());
      const { stakePool } = storeToRefs(useStakePoolStore());
      const { solPrice } = storeToRefs(useCoinRateStore());
      const solStaked = computed(() =>
        lamportsToSol(stakePool.value?.totalLamports.toNumber() ?? 0),
      );
      const usdStacked = computed(() => solStaked.value * solPrice.value);

      return {
        // reverse limit progress for rounded right part of progress bar
        maxSolToStake: computed(() => endpoint.value?.stakeLimit),
        solStaked,
        usdStacked,
        formatPrice: (v: number) => formatAmount(v, 1),
      };
    },
  };
</script>

<style lang="scss" scoped>
  .total-stacked {
    position: relative;
    padding-left: 25px;
    z-index: 2;
    margin-top: 2px;

    &__label {
      text-transform: uppercase;
      font-size: 11px;
      color: #ffffff;
    }

    &__value {
      padding-right: 15px;
      padding-left: 50px;
      font-weight: 700;
      position: relative;

      @media (min-width: $breakpoint-md) {
        min-width: 150px;
        width: 220px;
      }

      &::before {
        content: '';
        //noinspection CssUnknownTarget
        background: url(@/assets/img/sol-gray-logo.svg) no-repeat center center;
        background-size: contain;
        width: 33px;
        height: 100%;
        position: absolute;
        left: 0;

        @media (max-width: $breakpoint-xs) {
          background: url(@/assets/img/sol-logo.svg) no-repeat center center;
          background-size: contain;
        }
      }
    }

    &__sol {
      white-space: nowrap;
      color: #fff;
      font-size: 16px;
      line-height: 1;
    }

    &__usd {
      color: $lightGray;
      font-size: 12px;
      line-height: 1;
      margin-top: 1px;
      margin-bottom: 2px;
    }
  }

  .total-stacked-alter {
    .total-stacked {
      &__label {
        color: #000;
      }
      &__usd {
        color: #000;
      }
      &__sol {
        color: #000;
      }
    }
  }
</style>
