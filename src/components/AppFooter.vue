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
import { COPYRIGHT, COPYRIGHT_BY, FOOTER_LINKS, POWERED_BY, POWERED_LINK } from '~/config'

const fLinks: { [key: string]: string } = FOOTER_LINKS as { [key: string]: string }
const footerLinks = fLinks ? Object.keys(fLinks)?.map(title => ({ title, url: fLinks[title] })) : []
const year = new Date().getFullYear()
</script>

<template>
  <footer>
    <div class="container">
      <div class="footer-info">
        <span v-if="COPYRIGHT_BY">© Copyright {{ year }} {{ COPYRIGHT_BY }}. All rights reserved.</span>
        <span v-if="COPYRIGHT">{{ COPYRIGHT }}</span>
        <br v-if="POWERED_BY && (COPYRIGHT || COPYRIGHT_BY)">
        <a v-if="POWERED_LINK && POWERED_BY" :href="String(POWERED_LINK)" target="_blank">{{ POWERED_BY }}</a>
        <span v-if="POWERED_BY && !POWERED_LINK">{{ POWERED_BY }}</span>
      </div>
      <div class="footer-links">
        <app-footer-link v-for="link in footerLinks" :key="link.title" :url="link.url" :title="link.title" />
      </div>
    </div>
  </footer>
</template>

<style lang="scss">
  footer {
  background-color: $gray !important;
  color: #fff !important;
  padding: 1rem 0 1rem;
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.25rem;
  letter-spacing: 0.03333em;

  .container {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;

    @media (max-width: $breakpoint-sm) {
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }
  }

  a {
    color: #fff;
    text-decoration: none;
  }

  .footer-info {
    @media (max-width: $breakpoint-sm) {
      text-align: center;
    }
  }

  .footer-links {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;

    @media (max-width: $breakpoint-xs) {
      justify-content: center;
      gap: 0;

      a {
        margin: 0 8px;
      }
    }
  }
}
</style>
