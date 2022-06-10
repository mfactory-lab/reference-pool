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
import { computed } from 'vue'
import { useEpochStore } from '@/store'

const epochStore = useEpochStore()
const epochNumber = computed(() => epochStore.epochNumber)
const epochProgress = computed(() => +epochStore.epochProgress)

const time = computed(() => {
  const timeInMs = epochStore.epochTimeRemaining
  const _h = timeInMs / 1000 / 60 / 60
  const h = Math.floor(_h)
  const m = Math.floor((_h - h) * 60)
  const s = Math.ceil(((_h - h) * 60 - m) * 60)
  return { h, m: m < 10 ? `0${m}` : m, s: s < 10 ? `0${s}` : s }
})
</script>

<template>
  <div class="epoch">
    <q-circular-progress
      show-value
      class="q-mt-xs epoch__progress"
      :value="epochProgress"
      size="106px"
      :thickness="0.2"
      color="natural-gray"
      track-color="primary"
      center-color="white"
    >
      <div class="epoch__label">
        <div class="epoch__label-title">
          Epoch
        </div>
        <div class="epoch__label-number">
          {{ epochNumber }}
        </div>
        <div class="epoch__label-value">
          {{ time.h }}:{{ time.m }}<br>{{ time.s }}
        </div>
      </div>
    </q-circular-progress>
  </div>
</template>

<style scoped lang="scss">
  .epoch {
    @media (max-width: $breakpoint-sm) {
      margin-bottom: 16px;
    }
    &__progress {
      @media (max-width: $breakpoint-sm) {
        width: 95px;
      }
    }
    &__label {
      font-style: normal;
      font-weight: normal;
      text-align: center;

      &-title {
        font-size: 10px;
        line-height: 12px;
        text-transform: uppercase;
        color: $gray;
      }

      &-value {
        font-size: 18px;
        line-height: 100%;
        color: #5a7683;
        font-weight: 500;

        @media (max-width: $breakpoint-sm) {
          font-size: 16px;
        }
      }

      &-number {
        color: #100808;
        font-size: 18px;
        margin-bottom: 3px;
        font-weight: 500;

        @media (max-width: $breakpoint-sm) {
          font-size: 16px;
        }
      }
    }
  }
</style>
