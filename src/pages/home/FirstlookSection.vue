<template>
  <section class="firstlook-section">
    <div class="container">
      <div class="firstlook__body">
        <div class="lt-sm flex">
          <div class="total-stacked-alter flex justify-center q-mx-auto">
            <total-stacked />
          </div>
        </div>
        <div class="lt-md flex">
          <div class="firstlook__epoch">
            <apy />
            <epoch />
          </div>
        </div>
        <div class="row justify-between">
          <div
            class="col col-12 col-md-5 q-pr-sm firstlook__wallet"
            v-if="connected"
          >
            <wallet-balance />
          </div>

          <div class="col col-12 col-md-7 q-ml-auto">
            <stake-box />
          </div>
        </div>
      </div>
    </div>
  </section>
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

import StakeBox from '@/components/StakeBox/StakeBox.vue'
import WalletBalance from '@/components/WalletBalance.vue'
import { computed } from 'vue'
import { useWallet } from '@/store/modules/wallet'
import TotalStacked from '@/components/TotalStacked.vue'
import Epoch from '@/components/Epoch.vue'
import Apy from '@/components/Apy.vue'

export default {
  components: {
    WalletBalance,
    Epoch,
    Apy,
    StakeBox,
    TotalStacked,
  },
  setup() {
    const wallet = useWallet()

    return {
      connected: computed(() => wallet.connected),
    }
  },
}
</script>
