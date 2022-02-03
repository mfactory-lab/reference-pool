<template>
  <q-btn :icon="icon" flat round @click="toggle" />
</template>

<script lang="ts">
  import { evaMoon, evaSun } from '@quasar/extras/eva-icons';
  import { computed } from 'vue';
  import { useDarkTheme } from '@/hooks';

  export default {
    setup() {
      const { toggle, isActive } = useDarkTheme();
      return {
        toggle,
        icon: computed(() => (isActive.value ? evaMoon : evaSun)),
      };
    },
  };
</script>
