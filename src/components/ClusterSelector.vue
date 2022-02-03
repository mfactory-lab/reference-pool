<template>
  <q-btn-dropdown
    class="app-header__cluster-btn"
    :label="filter(cluster)"
    :model-value="false"
    auto-close
    color="white"
    text-color="black"
    rounded
  >
    <q-list>
      <q-item v-for="item in items" :key="item.name" clickable @click="select(item)">
        <q-item-section>
          <q-item-label>
            <b>{{ filter(item.name) }}</b>
          </q-item-label>
          {{ item.url }}
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script lang="ts">
  import { watch } from 'vue';
  import { storeToRefs } from 'pinia';
  import { ENDPOINTS } from '@/config';
  import { Endpoint, useConnectionStore, useValidatorStore } from '@/store';

  export default {
    setup() {
      const connectionStore = useConnectionStore();
      const { cluster } = storeToRefs(connectionStore);

      const validatorStore = useValidatorStore();
      watch(cluster, validatorStore.load);

      return {
        cluster,
        select: (e: Endpoint) => connectionStore.setCluster(e.name),
        items: ENDPOINTS,
        filter: (name: string) => name.replace('-beta', ''),
      };
    },
  };
</script>
