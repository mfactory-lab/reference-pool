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
  progress = 0,
  strokeWidth = 20,
  strokeColor = '#ffd600',
  strokeBg = '#ddd',
  width = 70,
  background = '#fff',
  color = '#111',
} = defineProps<{
  strokeWidth?: number
  strokeColor?: string
  strokeBg?: string
  width?: number | string
  background?: string
  color?: string
  progress?: number
  withProgress?: boolean
}>()

const current = ref(0)
const firstLoad = ref(true)

watch(() => progress, () => {
  if (!firstLoad.value) {
    current.value = progress
    return
  }
  if (progress && firstLoad.value) {
    setTimeout(() => {
      current.value = progress
      firstLoad.value = false
    }, 500)
  }
}, { immediate: true })
</script>

<template>
  <div
    class="j-circular-progress"
    :style="{
      width: `${width}px`,
      height: `${width}px` }"
  >
    <div
      class="progress-data"
      :style="{ '--stroke-width': `${strokeWidth}px`,
                'background': background,
                'color': color }"
    >
      <slot />
      <template v-if="withProgress">
        {{ progress }}
      </template>
    </div>
    <svg
      width="250" height="250" viewBox="0 0 250 250" class="circular-progress"
      :style="{
        '--current': current,
        '--stroke-width': `${strokeWidth}px`,
        '--stroke-color': strokeColor,
        '--stroke-background': strokeBg,
        'width': `${width}px`,
        'height': `${width}px`,
      }"
    >
      <circle class="bg" />
      <circle class="fg" />
    </svg>
  </div>
</template>
