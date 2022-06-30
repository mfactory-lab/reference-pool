# Reference Stake Pool (Solana Blockchain)

## Abstract

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

## Prototype Stake Pool

A fully functioning prototype stake pool is running at https://mfactory-lab.github.io/reference-pool/#/

## Requirements

- Familiarity with the command line
- [NodeJs](https://nodejs.org/en/)
- [Pnpm](https://pnpm.io/) package manager

## Getting Started


### Create your Solana stake pool.

Please make sure you have thoroughly studied the Solana Foundation’s official documentation on stake pools at https://spl.solana.com/stake-pool/quickstart. If you run into any problems while performing the commands listed in this section, please contact the Foundation for support.

Create a new stake pool with this command:

```bash
./setup-stake-pool.sh
```

After the stake pool has been created, you will have the following keys saved:

keys/stake-pool.json
keys/validator-list.json
keys/mint.json
keys/reserve.json

#### Stake Pool Address

To view the address of the stake pool you just created:

```bash
solana address -k ./keys/stake-pool.json
```

You will need this address in order to configure the frontend app.

The stake pool can be created on TestNet or DevNet as well.

### Create a backend for your stake pool:

You can use the default python Solana Bot which can be installed on your server and launched via cron job:
https://github.com/solana-labs/solana-program-library/tree/master/stake-pool/py/bot

Upon request we are also able to create a unique, tailored strategy for your stake pool.

### Create the Frontend App

#### GitHub Template

[Create a repo from this template on GitHub](https://github.com/mfactory-lab/reference-pool/generate).

#### Clone to local

If you prefer to do it manually with cleaner git history:

```bash
# clone repository
$ git clone https://github.com/mfactory-lab/reference-pool.git

# open folder reference-pool
$ cd reference-pool

# install packages
$ pnpm install

# build and serve with vite dev server
$ pnpm dev

# production build
$ pnpm build

# preview production build locally
$ pnpm preview
```

#### Docker Production Build

First, build the ref-pool image by opening the terminal in the project's root directory.

```bash
docker build . -t refpool:latest
```

Run the image and specify port mapping with the `-p` flag.

```bash
docker run --rm -it -p 8080:80 refpool:latest
```

### Configure the Frontend App

Many parameters and visual features can (and some of them should) be configured.

#### Important Stake Pool variables

File: ```.env```

Variables to set:
```
VITE_MAIN_STAKE_POOL_ADDRESS = [See Stake Pool Address] (required)
VITE_TEST_STAKE_POOL_ADDRESS = <optional: stake pool address on TestNet>
VITE_DEV_STAKE_POOL_ADDRESS = <optional: stake pool address on DevNet>
```

You can also set staking limits here (if set, these are displayed in the top bar):

```
VITE_MAIN_STAKE_LIMIT = <maximum allowed stake for MainNet>
VITE_TEST_STAKE_LIMIT = <maximum allowed stake for TestNet>
```

#### Frontend design configuration

##### Web App metadata
File: ```.env```

Variables to set:
```
VITE_APP_TITLE = <your app’s meta title>
VITE_APP_DESCRIPTION = <your app’s meta description>
VITE_APP_KEYWORDS = <your app’s meta keywords>
```

##### Various logo images

If you prefer to use remotely stored images, set the variables below to corresponding URLs.
If left empty, internal SVG images in default locations (see below) will be used.

File: ```.env```

Variables to set:
```
VITE_APP_LOGO = <URL of your header logo file>
VITE_XSOL_LOGO = <URL of your token logo file>
VITE_NO_WALLET_ICON = <URL of your graphics file to replace the large SOL logo>
```

If using internal images:

Folder: ```/public/img```

Replace website favicon files with your own logo files (do not change filenames).

File: ```/src/assets/img/customize/app-logo.svg```

Replace the svg in this file to change your header logo.

File: ```/src/assets/img/customize/xsol.svg```

Replace the svg to change the token icon.

File: ```/src/assets/img/customize/no-wallet-icon.svg```

Replace the large SOL logo (displayed as long as no wallet is connected).

##### Text, links, and color theme

File: ```.env```

URL pointing to your Telegram channel (_displayed in case of an error, so that the user can contact you for support_):
```
TELEGRAM_ANNOUNCEMENT_URL = <URL of your Telegram channel or group>
```

Footer text and links:
```
VITE_COPYRIGHT_BY = <replace “xxx” with your project name>
VITE_COPYRIGHT = <replace the whole line>
```
_Leave both variables empty if no copyright message is needed._

```
VITE_POWERED_BY = <if left empty, the POWERED_BY line is not displayed>
VITE_POWERED_LINK = <URL; if left empty, the POWERED_BY line will not have a link>
```
_Links in the footer can point to internal or external pages.
If the first symbol of a URL is "/", it is considered an internal URL, otherwise external._

```
VITE_FOOTER_LINKS = <list of links in the following format: { "link1 name": "link1 url", "link2 name": "link2 url", ... }>
```

Folder: ```/src/pages/```

The files ```terms.vue```, ```impressum.vue```, and ```privacy.vue``` hold the content for the respective pages linked in the page footer.

File: ```/src/components/customize/FaqSection.vue```

You can change the FAQ contents by editing the html code in this file. If you don’t want a FAQ section, replace this file’s whole content with:
```
<template>
  <section class="custom-section">
    <div class="container" />
  </section>
</template>
```

File: ```/src/components/customize/CustomSection.vue```

Any content you want to add past the FAQ section (or replacing it if you removed the FAQ section) can be added to this file.

File: ```.env.production```

Variable to set:
```
VITE_GTAG_ID = <set your global site tag (GTAG) if you need to connect Google Analytics>
```

File: ```/src/assets/scss/_variables.scss```

Change this one if you want to play around with the theme colors.

## Community

You can contact us via following channels:

- [Discord](https://discord.gg/RpUHMkVCxN)
- [Twitter](https://twitter.com/JPoolSolana)
- [Telegram](https://t.me/+87EmXvpxuRhkYzMy)

## Built With

- [TypeScript](https://www.typescriptlang.org/): primary language
- [Vite](https://vitejs.dev/): an extremely fast frontend tooling
- [Vue](https://vuejs.org/): framework
- [VS Code Extensions](./.vscode/extensions.json)
- [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar): Vue 3 `<script setup>` IDE support
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## How to Contribute

We are delighted that you want to help improve this open source project.
Here are a few quick guidelines to make the process easy and efficient for everyone involved.

### Reporting a Bug

First, **make sure the bug hasn't already been reported** by searching GitHub's issues section.

If no such issue exists, go ahead and create one. **Please be sure to include all of the following**:

1. A clear, descriptive title (i.e. "A bug" is not a good title).
2. The error message if applicable.
3. Your OS and browser information.

## License

[GNU AGPL v3](./LICENSE)



