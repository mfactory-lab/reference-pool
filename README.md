# reference-pool
Abstract

Stake Pools are a new concept that has been introduced to improve the stake distribution across the validator network.
Delegating via stake pool is good for the Solana network:
* Stake is distributed in optimal fashion across validators (some pools also take into account the distribution across ASNs and data centers)
* The pool automatically redistributes the stake each epoch, aiming at maximum rewards
* The delegator receives stake pool tokens which can be used as a DeFi instrument for liquidity mining, lending, etc.

This project can be used as a basis to bootstrap a Solana stake pool quickly and with minimal effort.
For all funds-sensitive operations it uses the [Stake Pool Program](https://github.com/solana-labs/solana-program-library/tree/master/stake-pool) developed by the [Solana Foundation](https://solana.foundation/).

Following tasks must be completed to launch your own stake pool:
* Conceive and implement a strategy for choosing validators to be added to the pool and distributing the stake among these validators
* Develop your own branding (project name, logo, etc.)
* Redesign front end based on your branding
* Create your pool token and add it to the Solana token list

It is also recommended to do the following:
* Write documentation and guides for your users
* Negotiate with DeFi platforms to have your pool token added as an asset to liquidity pools, lending solutions, and other DeFi services
