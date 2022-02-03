<template>
  <q-page>
    <connection-lost />
    <firstlook-section />
    <faq-section />
  </q-page>
</template>

<script type="ts">
  import ConnectionLost from '@/components/ConnectionLost.vue'
    import FirstlookSection from './home/FirstlookSection.vue'
    import FaqSection from './home/FaqSection.vue'

    export default {
      components: {
        FaqSection,
        FirstlookSection,
        ConnectionLost,
      },
    }
</script>
