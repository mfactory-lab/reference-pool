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

<script>
export default {
  props: {
    code: {
      type: Number,
      default: 500,
    },
    message: {
      type: String,
      default: 'An unexpected error occurred',
    },
  },
}
</script>

<template>
  <div class="container">
    <slot>
      <div style="font-size: 20vh">
        {{ code }}
      </div>
      <div>
        {{ message }}
      </div>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
  .container {
    color: $grey-6;

    /* text-shadow: 0 0 10px blue; */
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    position: absolute;

    /* background: linear-gradient(270deg, #005c97, #add2f7); */
  }
</style>
