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
              <a href="https://docs.solana.com/staking">https://docs.solana.com/staking</a>
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
              auto-delegation bot as described above. As stakes earn rewards, the pool and pool
              tokens grow proportionally in value. Finally, pool token holders can send SPL tokens
              back to the stake pool to redeem SOL, thereby participating in decentralization with
              much less work required."
            </p>
            <p>
              To put it short: You have all the advantages of direct staking at top efficiency –
              without the fuss of selecting and carefully watching the validator(s) you stake with.
            </p>
            <p>
              Plus, you help improve the Solana network, which increases the value of your SOL!
            </p>
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-item__title">
            What is a xSOL token?
          </div>
          <div class="faq-item__body">
            <p>
              When you delegate your SOL to a Stake Pool, you get xSOL tokens in return. These
              tokens are your proof of a share ownership in the stake pool, and they can be traded
              back for SOL at the end of any epoch.
            </p>
            <p>
              Obviously, you get more SOL than you staked in the first place, including your APY
              accrued over the staking period.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
