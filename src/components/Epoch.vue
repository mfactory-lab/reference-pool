<template>
  <div class="epoch">
    <q-circular-progress
      show-value
      class="q-mt-xs q-ma-mdepoch__progress"
      :value="epochProgress"
      size="106px"
      :thickness="0.2"
      color="natural-gray"
      track-color="primary"
      center-color="white"
    >
      <div class="epoch__label">
        <div class="epoch__label-title">Epoch</div>
        <div class="epoch__label-number">
          {{ epochNumber }}
        </div>
        <div class="epoch__label-value"> {{ time.h }}:{{ time.m }}<br />{{ time.s }} </div>
      </div>
    </q-circular-progress>
  </div>
</template>

<script lang="ts">
  import { useEpochStore } from '@/store';
  import { storeToRefs } from 'pinia';
  import { computed } from 'vue';

  export default {
    setup() {
      const { epochTimeRemaining, epochProgress, epochNumber } = storeToRefs(useEpochStore());
      return {
        epochNumber,
        epochProgress,
        time: computed(() => {
          const timeInMs = epochTimeRemaining.value;
          const _h = timeInMs / 1000 / 60 / 60;
          const h = Math.floor(_h);
          const m = Math.floor((_h - h) * 60);
          const s = Math.ceil(((_h - h) * 60 - m) * 60);
          return { h, m: m < 10 ? `0${m}` : m, s: s < 10 ? `0${s}` : s };
        }),
      };
    },
  };
</script>

<style scoped lang="scss">
  .epoch {
    &__progress {
      @media (max-width: $breakpoint-sm) {
        width: 95px;
      }
    }
    &__label {
      font-style: normal;
      font-weight: normal;
      text-align: center;

      &-title {
        font-size: 10px;
        line-height: 12px;
        text-transform: uppercase;
        color: #5c5c5c;
      }

      &-value {
        font-size: 18px;
        line-height: 100%;
        color: #5a7683;
        font-weight: 500;

        @media (max-width: $breakpoint-sm) {
          font-size: 16px;
        }
      }

      &-number {
        color: #100808;
        font-size: 18px;
        margin-bottom: 3px;
        font-weight: 500;

        @media (max-width: $breakpoint-sm) {
          font-size: 16px;
        }
      }
    }
  }
</style>
