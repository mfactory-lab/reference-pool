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
- [Yarn](https://yarnpkg.com/) package manager

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
$ yarn install

# build and serve with vite dev server
$ yarn dev

# production build
$ yarn build

# preview production build locally
$ yarn preview
```

#### Following parameters can (and some of them should) be configured:

1) /src/config/connection.ts holds pool addresses.
    Configure these variables:

```
MAIN_STAKE_POOL_ADDRESS = [See Stake Pool Address] 
TEST_STAKE_POOL_ADDRESS = <optional: stake pool address on TestNet>
DEV_STAKE_POOL_ADDRESS = <optional: stake pool address on DevNet>
```

You can also set staking limits here (displayed in the top bar):

```
MAIN_STAKE_LIMIT = <maximum allowed stake for MainNet>
TEST_STAKE_LIMIT = <maximum allowed stake for TestNet>
```

2) .env includes website metadata: title, description, keyword.
   These can be configured with following variables:

```
VITE_APP_TITLE = <your app’s meta title>
VITE_APP_DESCRIPTION = <your app’s meta description>
VITE_APP_KEYWORDS = <your app’s meta keywords>
```

3) .env.production
```
VITE_GTAG_ID = <set your global site tag (GTAG) if you need to connect Google Analytics>
```
4) /public/img: replace website favicon with your own logo files keeping the same filenames.

5) /src/components/AppLogo.vue: replace the svg in this file to change the header logo.

6) /src/components/icons/TokenSvg.vue: replace the svg to change the token icon.



7) /src/config/social.ts contains the variable that should point to your Telegram channel:
   ```
   TELEGRAM_ANNOUNCEMENT_URL = <URL of your Telegram channel or group>
   ```
   _This URL is displayed in case of an error, so that the user can contact you for support._ <br><br>

8) ```/src/assets/scss/_variables.scss``` can be changed if you want to play around with the theme colors.

9) ```/src/components/AppFooter.vue``` copyright message that goes into the webpage footer (replace “xxx” with your projectname), as well as a link to your documentation (replace # with an appropriate URL in the \<a href=”#”> tag).

10) ```/src/page/```: the files terms.vue, impressum.vue, and privacy.vue hold the content for the respective pages linked in the page footer.





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
