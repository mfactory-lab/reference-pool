<template>
  <div class="apy" :class="{ 'apy--selected': selected }">
    APY
    <div class="apy__value">≈{{ apy }}</div>
    <q-inner-loading :showing="apyLoading" />
  </div>
</template>

<script lang="ts">
/* This file is part of Solana Reference Stake Pool code.
 *
 * Copyright © 2021, mFactory GmbH
 *
 * Solana Reference Stake Pool is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * Solana Reference Stake Pool is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.
 * If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
 *
 * You can be released from the requirements of the Affero GNU General Public License
 * by purchasing a commercial license. The purchase of such a license is
 * mandatory as soon as you develop commercial activities using the
 * Solana Reference Stake Pool code without disclosing the source code of
 * your own applications.
 *
 * The developer of this program can be contacted at <info@mfactory.ch>.
 */

import { useApy } from '@/store/modules/apy'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { formatPct } from '@/utils'

export default {
  props: {
    selected: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    const { apy, apyLoading } = storeToRefs(useApy())
    return {
      apyLoading,
      apy: computed(() => formatPct.format(apy.value)),
    }
  },
}
</script>

<style scoped lang="scss">
.apy {
  font-size: 19px;
  line-height: 19px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  .q-inner-loading {
    background: none !important;
  }

  &__value {
    font-size: 29px;
    line-height: 29px;
    font-weight: 900;

    @media (max-width: $breakpoint-xs) {
      font-size: 24px;
    }
  }
}
</style>
