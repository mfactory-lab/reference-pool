<!--
  - This file is part of Solana Reference Stake Pool code.
  -
  - Copyright © 2023, mFactory GmbH
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
import Cookies from 'js-cookie'
import { DOMAIN } from '../index'

const cookieName = 'cookie-accepted'
const isAccepted = ref(Cookies.get(cookieName) === 'true')

function hide() {
  Cookies.set(cookieName, 'true', { domain: DOMAIN, expires: 365 })
  isAccepted.value = true
}
</script>

<template>
  <b-modal :model-value="!isAccepted" no-animation no-close-on-backdrop no-header no-footer centered class="cookie-modal">
    <div class="cookie-modal__text">
      Our third-party tools use cookies, which are necessary for its functioning and required to achieve the purposes illustrated in the cookie policy.
    </div>

    <div class="cookie-modal__buttons">
      <a
        target="_blank"
        href="https://policies.google.com/technologies/cookies"
      >
        More info
      </a>

      <a @click="hide">
        Accept
      </a>
    </div>
  </b-modal>
</template>

<style lang="scss">
.cookie-modal {
  .modal-content {
    padding: 20px;
    border-radius: 8px 8px 0 0;
  }
  .modal-dialog {
    margin: 0 auto;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .modal-body {
    padding: 0;
  }

  &__text {
    font-size: 14px;
    font-weight: 400;
    line-height: normal;
  }

  &__buttons {
    color: $info;
    padding-top: 10px;
    display: flex;
    justify-content: flex-end;
    gap: 24px;

    a {
      color: $info;
      text-decoration: none;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 6px;

      &:hover {
        background-color: rgba($info, 0.1);
      }
    }
  }
}

body.body--dark {
  .cookie-modal__text {
    color: #fff;
  }
}
</style>
