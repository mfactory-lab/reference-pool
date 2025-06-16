<!--
  - This file is part of Solana Reference Stake Pool code.
  -
  - Copyright © 2021, mFactory GmbH
  -
  - Solana Reference Stake Pool is free software: you can redistribute it
  - and/or modify it under the terms of the GNU Affero General Public License
  - as published by the Free Software Foundation, either version 3
  - of the License, or (at your option) any later version.
  -
  - Solana Reference Stake Pool is distributed in the hope that it
  - will be useful, but WITHOUT ANY WARRANTY; without even the implied
  - warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  - See the GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program.
  - If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
  -
  - You can be released from the requirements of the Affero GNU General Public License
  - by purchasing a commercial license. The purchase of such a license is
  - mandatory as soon as you develop commercial activities using the
  - Solana Reference Stake Pool code without disclosing the source code of
  - your own applications.
  -
  - The developer of this program can be contacted at <info@mfactory.ch>.
  -->

<script lang="ts" setup>
import type { BFormInputProps, Size } from 'bootstrap-vue-next'
import { onlyNumber } from '~/utils'

const {
  rules = [],
  size = 'lg',
  lazyRules = false,
  onlyNumbers = false,
  modelValue,
  resetValidation = false,
  forceValidation = false,
  ...props
} = defineProps<{
  size?: Size
  placeholder?: string
  rules?: Array<(val: string | number) => true | string>
  lazyRules?: boolean
  onlyNumbers?: boolean
  modelValue?: string | number
  resetValidation?: boolean
  inputLabel?: string
  forceValidation?: boolean
} & BFormInputProps>()

const emit = defineEmits(['update:modelValue'])
const slots = defineSlots()

const value = ref(modelValue)
const errorMessage = ref<string | null>(null)

const computedClasses = computed(() => {
  const classes: string[] = []
  if (errorMessage.value) {
    classes.push('j-input--error')
  }
  return classes.join(' ')
})

function validate() {
  if (!value.value) {
    errorMessage.value = null
    return
  }
  for (const rule of rules) {
    const result = rule(value.value)
    if (result !== true) {
      errorMessage.value = result as string
      return false
    }
  }
  errorMessage.value = null
}

function handleBlur() {
  if (lazyRules) {
    validate()
  }
}

watch(value, () => {
  emit('update:modelValue', value.value)
})

watch(() => modelValue, (val) => {
  value.value = val
})

watch(() => resetValidation, (val) => {
  if (val) {
    errorMessage.value = null
  }
})

watch(() => forceValidation, (val) => {
  if (val) {
    validate()
  }
})
</script>

<template>
  <div class="j-input">
    <div v-if="slots?.label" class="j-input__label">
      <slot name="label" />
    </div>
    <b-input-group
      :class="computedClasses"
      :size="size"
    >
      <div class="input-wrapper">
        <div v-if="inputLabel" class="input-wrapper__label">
          {{ inputLabel }}
        </div>
        <b-form-input
          v-bind="props"
          v-model="value"
          :placeholder="placeholder"
          :type="type"
          autocomplete="off"
          :state="null"
          @keypress="onlyNumbers && onlyNumber($event)"
          @blur="handleBlur"
          @keyup="!lazyRules && validate()"
        />
      </div>
      <template v-if="slots.prepend" #prepend>
        <div class="j-input__prepend">
          <slot name="prepend" />
        </div>
      </template>
      <template v-if="slots.append" #append>
        <div class="j-input__append">
          <slot name="append" />
        </div>
      </template>

      <transition name="fade-bottom">
        <div v-if="errorMessage" class="validate-label">
          {{ errorMessage }}
        </div>
      </transition>
    </b-input-group>

    <div v-if="slots.description" class="j-input__desc" :class="{ hide: errorMessage }">
      <slot name="description" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* Transition class for Vue */
.fade-bottom-enter-active,
.fade-bottom-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-bottom-enter-from,
.fade-bottom-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-bottom-enter-to,
.fade-bottom-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
