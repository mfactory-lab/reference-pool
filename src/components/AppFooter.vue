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
import { COPYRIGHT, COPYRIGHT_BY, FOOTER_LINKS, POWERED_BY, POWERED_LINK } from '@/config'

const fLinks = FOOTER_LINKS ? JSON.parse(FOOTER_LINKS) : {}
const footerLinks = Object.keys(fLinks).map(title => ({ title, url: fLinks[title] }))
const year = new Date().getFullYear()
</script>

<template>
  <q-footer :class="$style.footer">
    <div class="container">
      <div class="row q-col-gutter-lg">
        <div class="col justify-between d-flex column">
          <div class="text-caption">
            <span v-if="COPYRIGHT_BY">© Copyright {{ year }} {{ COPYRIGHT_BY }}. All rights reserved.</span>
            <span v-if="COPYRIGHT">{{ COPYRIGHT }}</span>
            <br v-if="POWERED_BY && (COPYRIGHT || COPYRIGHT_BY)">
            <a v-if="POWERED_LINK && POWERED_BY" :href="POWERED_LINK" target="_blank">{{ POWERED_BY }}</a>
            <span v-if="POWERED_BY && !POWERED_LINK">{{ POWERED_BY }}</span>
          </div>
        </div>
        <div class="col col-12 col-md-auto justify-between q-mt-auto d-flex column">
          <div :class="$style.nav" class="row text-caption footer-links">
            <app-footer-link v-for="link in footerLinks" :key="link.title" :url="link.url" :title="link.title" />
          </div>
        </div>
      </div>
    </div>
  </q-footer>
</template>

<style lang="scss" module>
  .footer {
    background-color: $gray !important;
    color: #fff !important;
    padding: 1rem 0 1rem;
    @media (max-width: $breakpoint-sm) {
      text-align: center;
    }

    a {
      color: #fff;
      text-decoration: none;
    }
  }

  .nav {
    justify-content: center;
    text-align: center;

    a {
      margin: 0 0.5em;
    }
  }
</style>

<style lang="scss" scope>
  .contact-title {
    text-align: right;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    padding-right: 93px;
    margin-top: -15px;
    margin-bottom: -10px;

    @media (max-width: $breakpoint-sm) {
      text-align: center;
      margin-bottom: 5px;
      padding-right: 0;
    }
  }

  .footer-links {
    @media (max-width: $breakpoint-sm) {
      margin-top: 10px;
    }
  }
</style>
