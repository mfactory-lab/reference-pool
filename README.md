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

## Requirement

- Familiarity with the command line
- For running this application you need to have [NodeJs](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/) package manager

## Getting Started

### GitHub Template

[Create a repo from this template on GitHub](https://github.com/mfactory-lab/reference-pool/generate).

### Clone to local

If you prefer to do it manually with the cleaner git history

```bash
# clone repository
$ git clone https://github.com/mfactory-lab/reference-pool.git

# open folder reference-pool
$ cd reference-pool

# install packages
$ yarn install

# build and serve with vite dev server
$ yarn dev
```

## Community

We have a few channels for contact:

- [Discord](https://discord.com/invite/qR4BA9QXVR) 
- [Twitter](https://twitter.com/JPoolSolana) 
- [Telegram](https://t.me/jpoolsolana) 

## Built With

- [TypeScript](https://www.typescriptlang.org/) - Primary language
- [Vite](https://vitejs.dev/) - An extremely fast frontend tooling
- [Vue](https://vuejs.org/) - Framework
- [VS Code Extensions](./.vscode/extensions.json)
  - [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) - Vue 3 `<script setup>` IDE support
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## How to Contribute

We are delighted that you're helping make this open source project better. 
Here are a few quick guidelines to make this an easier and better process for everyone.

### Reporting a bug

First, **make sure the bug hasn't already been reported** by searching GitHub's issues section.

If no existing issue exists, go ahead and create one. **Please be sure to include all of the following**:

1. A clear, descriptive title (ie. "A bug" is not a good title).
2. Include the error message if have.
3. The browser and OS that you're using.

## License

[GNU AGPL v3](./LICENSE)