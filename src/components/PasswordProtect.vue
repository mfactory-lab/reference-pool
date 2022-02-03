<template>
  <q-layout v-if="isAuthEnabled && !isAuthenticated">
    <q-page class="window-height window-width row justify-center items-center">
      <div class="column">
        <div class="row justify-center">
          <div :class="$style.logo"> xPOOL </div>
        </div>
        <div class="row">
          <q-card class="q-pa-lg shadow-1">
            <q-card-section>
              <q-form class="q-gutter-md">
                <q-input
                  v-model="password"
                  :class="$style.input"
                  outlined
                  placeholder="Secret Code"
                  type="password"
                >
                  <template #append>
                    <q-btn flat rounded @click="login"> GO </q-btn>
                  </template>
                </q-input>
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-page>
  </q-layout>
</template>

<script lang="ts">
  import { useAuth } from '@/store';
  import { computed, ref } from 'vue';

  export default {
    setup() {
      const password = ref('');
      const authStore = useAuth();
      return {
        password,
        isAuthEnabled: computed(() => authStore.isEnabled),
        isAuthenticated: computed(() => authStore.isAuthenticated),
        login() {
          authStore.login(password.value);
        },
      };
    },
  };
</script>

<style lang="scss" module>
  .input {
    width: 240px;
  }

  .logo {
    font-size: 40px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 1rem;
    color: #aaa;
  }
</style>
