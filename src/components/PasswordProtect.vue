<script lang="ts" setup>
import logoImg from '~/assets/img/customize/app-logo.svg'
import { APP_LOGO } from '~/config'

const authStore = useAuthStore()
const error = ref(false)
const password = ref('')
const reValidate = ref(false)

function login() {
  if (!authStore.login(password.value)) {
    error.value = true
    reValidate.value = true
    nextTick(() => reValidate.value = false)
  }
}

const logo = computed(() => APP_LOGO || logoImg)

watch(password, () => {
  error.value = false
})
</script>

<template>
  <div :class="$style.container">
    <div :class="$style.logo">
      <img :src="logo" alt="" height="100">
    </div>
    <div :class="$style.form">
      <j-input
        v-model="password" placeholder="Secret Code" type="password" size="sm"
        :force-validation="reValidate"
        :rules="[
          () => {
            return !error || 'Wrong Password'
          },
        ]"
      />
      <j-btn size="sm" @click="login">
        Ok
      </j-btn>
    </div>
  </div>
</template>

<style lang="scss" module>
.container {
  width: 100vw;
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.form {
  display: flex;
  gap: 12px;
}

.logo {
  margin-bottom: 1rem;
  width: 300px;

  img {
    width: 100%;
    height: auto;
    object-fit: contain;
  }
}
</style>
