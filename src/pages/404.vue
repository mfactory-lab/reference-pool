<template>
  <error-container :code="404" message="Page not found" />
</template>

<script lang="ts">
  import ErrorContainer from '@/components/ErrorContainer.vue';

  export default {
    components: {
      ErrorContainer,
    },
  };
</script>
