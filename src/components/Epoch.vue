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
const { badgeType = 'default' } = defineProps<{
  badgeType?: 'default' | 'mobile' | string
}>()

const epochStore = useEpochStore()
const epochNumber = computed(() => epochStore?.epochNumber)
const epochProgress = computed(() => +epochStore.epochProgress)

function formatTime(time: number | string) {
  return Number(time) >= 10 ? time.toString() : `0${time}`
}

function formatTimeToHMS(time: number) {
  const _h = time / 1000 / 60 / 60
  const h = Math.floor(_h)
  const m = Math.floor((_h - h) * 60)
  const s = Math.ceil(((_h - h) * 60 - m) * 60)
  return { h: formatTime(h), m: formatTime(m), s: formatTime(s) }
}

const time = computed(() => formatTimeToHMS(epochStore.epochTimeRemaining))
</script>

<template>
  <div class="epoch-badge" :class="[`epoch-badge-${badgeType}`]">
    <div v-if="badgeType === 'default'" class="epoch-badge__circle">
      <j-circular-progress :progress="epochProgress" width="106" stroke-color="#1ce4b0" :stroke-width="40">
        <div class="epoch-data">
          <div class="epoch-data__title">
            Epoch
          </div>
          <div class="epoch-data__epoch">
            {{ epochNumber }}
          </div>
          <div class="epoch-data__time">
            <span>{{ time.h }}:{{ time.m }}</span>
            <span>{{ time.s }}</span>
          </div>
        </div>
      </j-circular-progress>
    </div>
    <div v-else class="epoch-badge__linear">
      <b-progress :value="epochProgress" />
    </div>
  </div>
</template>

<style  lang="scss">
 .epoch-badge {
  .epoch-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &__title {
      font-size: 10px;
      line-height: 12px;
      text-transform: uppercase;
      color: $gray;
    }

    &__epoch {
      color: #100808;
      font-size: 18px;
      font-weight: 500;
      line-height: normal;
    }

    &__time {
      width: 40px;
      font-size: 18px;
      line-height: 100%;
      margin-top: 2px;
      color: #5a7683;
      font-weight: 500;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }
}
</style>
