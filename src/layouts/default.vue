<template>
  <q-layout view="lfh Lpr lff">
    <app-header />
    <q-page-container>
      <router-view />
    </q-page-container>
    <app-footer />
    <cookie-modal />
  </q-layout>
</template>

<script lang="ts">
  import AppHeader from '@/components/AppHeader.vue';
  import AppFooter from '@/components/AppFooter.vue';
  import CookieModal from '@/components/CookieModal.vue';

  export default {
    components: { CookieModal, AppHeader, AppFooter },
  };
</script>
