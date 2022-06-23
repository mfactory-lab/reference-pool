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
import { XSOL_NAME } from '@/config'
</script>

<template>
  <section class="faq-section">
    <div class="container">
      <div class="faq-list">
        <div class="faq-item">
          <div class="faq-item__title">
            What is "staking"?
          </div>
          <div class="faq-item__body">
            <p>
              By staking your SOL tokens, you help secure the network and earn rewards while doing
              so. You can stake by delegating your tokens to validators who process transactions and
              run the Solana network.
            </p>
            <p>
              Read more at
              <a href="https://docs.solana.com/staking" target="blank">https://docs.solana.com/staking</a>
            </p>
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-item__title">
            What is a Stake Pool?
          </div>
          <div class="faq-item__body">
            <p>
              Here's what Solana Docs have to say on Stake Pools: "This on-chain program pools
              together SOL to be staked by a manager, allowing SOL holders to stake and earn rewards
              without managing stakes. Users deposit SOL in exchange for SPL tokens (staking
              derivatives) that represent their ownership in the stake pool. The pool manager stakes
              deposited SOL according to their strategy, perhaps using a variant of an
              auto-delegation bot as described above.
            </p>
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-item__title">
            How do I get my rewards?
          </div>
          <div class="faq-item__body">
            <p>
              Your {{ XSOL_NAME }} represents your share in the pool’s total stake, which grows constantly as
              rewards are accrued. This reflects in the {{ XSOL_NAME }}-SOL exchange rate which will be used to
              calculate the SOL you get back when you unstake. Total {{ XSOL_NAME }} price growth is equal to
              the pool’s APY.
            </p>
            <p>
              Read more at
              <a href="https://docs.solana.com/staking" target="blank">https://docs.solana.com/staking</a>
            </p>
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-item__title">
            Who is a Delegator?
          </div>
          <div class="faq-item__body">
            <p>
              Any user who delegates their SOL to a Validator (either directly or via Stake Pool),
              enabling them to validate new blocks and keep the network alive, becomes a Delegator.
              <br>
              Anyone who has some SOL in their wallet may delegate it – and earn rewards by doing so
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
