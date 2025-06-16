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

<script setup lang="ts">
// eslint-disable-next-line sort-imports
import { /* arrow, */ autoUpdate, flip, offset as Offset, shift, useFloating } from '@floating-ui/vue'
import { onClickOutside } from '@vueuse/core'
import { ref, watchEffect } from 'vue'

const {
  offset = 4,
} = defineProps<{
  offset?: number
  tooltipClass?: string
  contentClass?: string
}>()

const slots = defineSlots()

const attrs = useAttrs()

const { width } = useWindowSize()

const reference = ref(null)
const floating = ref(null)
// const floatingArrow = ref(null)
const isVisible = ref(false)

const { floatingStyles, /* middlewareData,  placement, */ update } = useFloating(reference, floating, {
  middleware: [
    // arrow({ element: floatingArrow }),
    Offset(offset),
    flip(),
    shift(),
  ],
  placement: 'top',
})

const toggleVisible = () => {
  if (width.value > 650) {
    return
  }
  isVisible.value = true
}

watchEffect(() => {
  if (isVisible.value && reference.value && floating.value) {
    autoUpdate(reference.value, floating.value, update)
  }
  if (width.value <= 650) {
    onClickOutside(reference, () => {
      isVisible.value = false
    })
  }
})

// const getArrowSide = () => {
//   if (placement.value.startsWith('top')) { return 'bottom' }
//   if (placement.value.startsWith('bottom')) { return 'top' }
//   if (placement.value.startsWith('left')) { return 'right' }
//   if (placement.value.startsWith('right')) { return 'left' }
//   return 'top'
// }
</script>

<template>
  <div
    ref="reference"
    :class="[$style.tooltip, tooltipClass]"
    v-bind="attrs"
    @mouseenter="isVisible = true"
    @mouseleave="isVisible = false"
    @click="toggleVisible"
  >
    <slot />
  </div>

  <teleport to="body">
    <div
      v-if="isVisible"
      ref="floating"
      class="tooltip-content"
      :class="contentClass"
      :style="{
        ...floatingStyles,
        position: 'absolute',
        transition: 'opacity 0.2s ease',
        opacity: isVisible ? 1 : 0,
        zIndex: 9999,
      }"
    >
      <slot v-if="slots?.content" name="content" />
      <!-- <div
        v-if="isArrow"
        ref="floatingArrow"
        class="tooltip-content__arrow"
        :style="{
          position: 'absolute',
          width: '6px',
          height: '6px',
          transform: 'rotate(45deg)',
          left: middlewareData.arrow?.x != null ? `${middlewareData.arrow.x}px` : '',
          top: middlewareData.arrow?.y != null ? `${middlewareData.arrow.y}px` : '',
          [getArrowSide()]: '-4px',
        }"
      /> -->
    </div>
  </teleport>
</template>

<style module>
.tooltip {
  width: fit-content;
  cursor: help;
}
</style>

<style lang="scss">
$tooltip-bg-color: white !default;
$tooltip-dark-bg-color: $dark-page !default;
$tooltip-padding-y: 12px !default;
$tooltip-padding-x: 12px !default;
$tooltip-border-radius: 12px !default;
$tooltip-border-color: #ebebeb !default;
$tooltip-dark-border-color: $neutral-900 !default;

.tooltip-content {
  background-color: $tooltip-bg-color;
  padding: $tooltip-padding-y $tooltip-padding-x;
  border-radius: $tooltip-border-radius;
  border: 1px solid $tooltip-border-color;
  color: $dark;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  max-width: 300px;

  // &__arrow {
  //   background-color: $tooltip-bg-color;
  // }
}

body.body--dark {
  .tooltip-content {
    background-color: $tooltip-dark-bg-color;
    border-color: $tooltip-dark-border-color;
    color: #fff;
  }
}
</style>
