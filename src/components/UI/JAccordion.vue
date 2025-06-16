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
import arrowDown from '~/assets/img/icons/accordion-arrow-down.svg?raw'
import arrowUp from '~/assets/img/icons/accordion-arrow-up.svg?raw'

const {
  flush = true,
  icon = arrowDown,
  activeIcon = arrowUp,
} = defineProps<{
  flush?: boolean // true - disabled default border
  visible?: boolean // true - default open accordion item
  title?: string
  icon?: string
  activeIcon?: string
}>()

const slot = useSlots()
const show = ref(false)

const accordionIcon = computed(() => show.value ? activeIcon : icon)
</script>

<template>
  <b-accordion
    :flush="flush"
    class="j-accordion"
  >
    <b-accordion-item
      v-model="show"
      :visible="visible"
    >
      <template #title>
        <slot v-if="slot?.title" name="title" />
        <template v-else>
          {{ title }}
        </template>
        <i v-html="accordionIcon" />
      </template>
      <slot />
    </b-accordion-item>
  </b-accordion>
</template>

<style lang="scss">
.j-accordion {
  border-bottom: 1px solid $neutral-200;

  .accordion-item {
    background-color: transparent;
  }
  .accordion-header {
    margin: 0;
  }
  .accordion-body {
    padding: 0 0 24px;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }
  .accordion-button {
    cursor: pointer;
    color: $black;
    font-size: 24px;
    font-style: normal;
    font-weight: 500;
    line-height: 24px;
    padding: 32px 0;
    background-color: transparent;

    &:focus {
      box-shadow: none;
    }

    &::after {
      display: none;
    }

    &:not(.collapsed) {
      color: $black;
      background-color: transparent;
      box-shadow: none;
    }
    i {
      display: flex;
      align-items: center;
      margin-left: auto;

      svg {
        width: 100%;
        height: auto;
      }
    }
  }

  .collapsing {
    transition: $transition-base;
  }
}
</style>
