<template>
  <div class="apy" :class="{ 'apy--selected': selected }">
    APY
    <div class="apy__value">≈{{ apy }}</div>
    <q-inner-loading :showing="apyLoading" />
  </div>
</template>

<script lang="ts">
  import { computed } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useApyStore } from '@/store';
  import { formatPct } from '@/utils';

  export default {
    props: {
      selected: {
        type: Boolean,
        required: true,
      },
    },
    setup() {
      const { apy, apyLoading } = storeToRefs(useApyStore());
      return {
        apyLoading,
        apy: computed(() => formatPct.format(apy.value)),
      };
    },
  };
</script>

<style scoped lang="scss">
  .apy {
    position: absolute;
    color: $gray;
    background-color: $primary;
    display: flex;
    flex-direction: column;
    align-items: center;
    left: calc(50% - 108px);
    border-radius: 50% !important;
    width: 96px;
    height: 96px;
    top: -23px;
    justify-content: center;
    z-index: 1;
    line-height: 14px;
    cursor: pointer;
    transition: color 0.3s, background-color 0.3s;
    &--selected {
      background-color: $gray;
      color: #fff;
    }
    @media (max-width: $breakpoint-xs) {
      border-radius: 50% 50% 0 0 !important;
      height: 60px;
      top: -35px;
    }
    &__value {
      font-size: 22px;
      line-height: 22px;
      font-weight: 500;
      @media (max-width: $breakpoint-xs) {
        font-size: 20px;
        line-height: 20px;
      }
    }
    .q-inner-loading {
      background: none;
    }
  }
</style>
