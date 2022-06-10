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

<script lang="ts">
import { useLocalStorage } from '@vueuse/core'

export default {
  setup() {
    const isAccepted = useLocalStorage<boolean>('cookie-accepted', false)
    return {
      isAccepted,
      hide: () => {
        isAccepted.value = true
      },
    }
  },
}
</script>

<template>
  <q-dialog :model-value="!isAccepted" persistent position="bottom" @hide="hide">
    <q-card class="q-pa-sm">
      <!--      <q-card-section> -->
      <!--        <div class="text-h6"> -->
      <!--          Data collection policy -->
      <!--        </div> -->
      <!--      </q-card-section> -->
      <q-card-section class="q-pb-none">
        <!--        This site uses cookies from Google to deliver its services and to analyze traffic. -->
        Our third-party tools use cookies, which are necessary for its functioning and required to
        achieve the purposes illustrated in the cookie policy.
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="More info"
          color="info"
          target="_blank"
          type="a"
          href="https://policies.google.com/technologies/cookies"
        />
        <q-btn v-close-popup flat label="Accept" color="info" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
