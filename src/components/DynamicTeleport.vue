<script lang="ts" setup>
const {
  to,
} = defineProps<{
  to: string
  isTeleport?: boolean
}>()

const isElement = ref(false)

const checkElement = () => {
  const el = document.querySelector(to)
  isElement.value = !!el
}

if (import.meta.client) {
  watchEffect(() => {
    checkElement()

    const observer = new MutationObserver(() => checkElement())
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  })
}
</script>

<template>
  <teleport v-if="isTeleport && isElement" :to="to">
    <slot />
  </teleport>
  <template v-else>
    <slot />
  </template>
</template>
