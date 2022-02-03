<template>
  <div v-if="connectionLost && !forceHidden" class="connection-lost">
    Solana network overloaded. Data currently unavailable.
  </div>
</template>

<script lang="ts">
  import { useStakePoolStore } from '@/store';
  import { storeToRefs } from 'pinia';
  import { ref } from 'vue';

  export default {
    setup() {
      const { connectionLost } = storeToRefs(useStakePoolStore());
      const forceHidden = ref(true);

      setTimeout(() => (forceHidden.value = false), 3000);
      return {
        connectionLost,
        forceHidden,
      };
    },
  };
</script>

<style scoped lang="scss">
  .connection-lost {
    position: fixed;
    width: 100%;
    top: 0;
    padding: 20px;
    background: $info;
    color: #fff;
    font-weight: 500;
    font-size: 22px;
    z-index: 10000;
    text-align: center;
  }
</style>
