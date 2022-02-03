<template>
  <q-dialog :model-value="!isAccepted" persistent @hide="hide" position="bottom">
    <q-card class="q-pa-sm">
      <!--      <q-card-section>-->
      <!--        <div class="text-h6">-->
      <!--          Data collection policy-->
      <!--        </div>-->
      <!--      </q-card-section>-->
      <q-card-section class="q-pb-none">
        <!--        This site uses cookies from Google to deliver its services and to analyze traffic.-->
        Our third-party tools use cookies, which are necessary for its functioning and required to
        achieve the purposes illustrated in the cookie policy.
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="More info"
          color="info"
          target="_blank"
          type="a"
          href="https://policies.google.com/technologies/cookies"
        />
        <q-btn flat label="Accept" color="info" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
  import { useLocalStorage } from '@vueuse/core';

  export default {
    setup() {
      const isAccepted = useLocalStorage<boolean>('cookie-accepted', false);
      return {
        isAccepted,
        hide: () => {
          isAccepted.value = true;
        },
      };
    },
  };
</script>
