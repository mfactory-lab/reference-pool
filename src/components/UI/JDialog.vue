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
const {
  modelValue,
} = defineProps<{
  modelValue: boolean
  className?: string
  title?: string
}>()

const emits = defineEmits(['update:modelValue'])

const { width } = useWindowSize()

const dialog = computed({
  get() {
    return modelValue
  },
  set(val) {
    emits('update:modelValue', val)
  },
})
</script>

<template>
  <client-only>
    <b-modal
      v-model="dialog" :title="title" centered scrollable no-footer
      class="j-dialog" :class="className" :content-class="{ 'modal-slide-up': width <= 650 }"
    >
      <slot />
    </b-modal>
  </client-only>
</template>

<style lang="scss">
.j-dialog {
  overflow: hidden;
  .modal-dialog {
    width: 100%;
    max-width: 600px;

    @media (max-width: $breakpoint-xs) {
      height: 100%;
      max-width: 100%;
      width: 100%;
      margin: 0;
      align-items: flex-end;

      .modal-content {
        max-height: 70%;
        border-radius: 24px 24px 0 0;
        padding: 24px;
      }
    }
  }

  .modal-slide-up {
    transform: translateY(100%);
    opacity: 0;
    transition:
      transform 0.1s ease-out,
      opacity 0.1s ease-out;
  }

  &.show .modal-slide-up {
    transform: translateY(2px);
    opacity: 1;
  }
}
</style>
