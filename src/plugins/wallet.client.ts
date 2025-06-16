/*
 * This file is part of Solana Reference Stake Pool code.
 *
 * Copyright © 2021, mFactory GmbH
 *
 * Solana Reference Stake Pool is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * Solana Reference Stake Pool is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.
 * If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
 *
 * You can be released from the requirements of the Affero GNU General Public License
 * by purchasing a commercial license. The purchase of such a license is
 * mandatory as soon as you develop commercial activities using the
 * Solana Reference Stake Pool code without disclosing the source code of
 * your own applications.
 *
 * The developer of this program can be contacted at <info@mfactory.ch>.
 */

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

import SolanaWalletAdapter from '@solana/wallet-adapter-vue'
import { defineNuxtPlugin } from 'nuxt/app'
import {
  BackpackWalletAdapter,
  BitgetWalletAdapter,
  BybitWalletAdapter,
  CloverWalletAdapter,
  Coin98WalletAdapter,
  CoinbaseWalletAdapter,
  ExodusWalletAdapter,
  // FractalWalletAdapter,
  GateWalletAdapter,
  // KeystoneWalletAdapter,
  LedgerWalletAdapter,
  MagicEdenWalletAdapter,
  MathWalletAdapter,
  // MoongateWalletAdapter2,
  NightlyWalletAdapter,
  NufiWalletAdapter,
  OKXWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TipLinkWalletAdapter,
  TokenPocketWalletAdapter,
  TorusWalletAdapter,
  TrezorWalletAdapter,
  TrustWalletAdapter,
  WalletConnectWalletAdapter,
  XDEFIWalletAdapter,
  // AvanaWalletAdapter,
  // BitpieWalletAdapter,
  // CoinhubWalletAdapter,
  // HuobiWalletAdapter,
  // HyperPayWalletAdapter,
  // KrystalWalletAdapter,
  // LedgerWalletAdapter,
  // NekoWalletAdapter,
  // OntoWalletAdapter,
  // SafePalWalletAdapter,
  // SaifuWalletAdapter,
  // SalmonWalletAdapter,
  // SkyWalletAdapter,
  // SolongWalletAdapter,
  // SpotWalletAdapter,
  // TokenaryWalletAdapter,
} from 'wallets'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) {
    return
  }

  nuxtApp.vueApp.use(SolanaWalletAdapter, {
    wallets: [
      // new MoongateWalletAdapter2({
      //   authMode: 'Ethereum',
      //   position: 'top-right',
      // }),
      // new MoongateWalletAdapter2({
      //   authMode: 'Google',
      //   position: 'top-right',
      // }),
      // new MoongateWalletAdapter2({
      //   authMode: 'Apple',
      //   position: 'top-right',
      // }),
      new TipLinkWalletAdapter({
        clientId: import.meta.env.TIP_WALLET_KEY ?? '',
        title: 'JPool',
        theme: 'system',
      }),
      new WalletConnectWalletAdapter({
        network: WalletAdapterNetwork.Mainnet,
        options: {
          projectId: '119a4be16e4a528159b92cba1d1044aa',
        },
      }),
      new PhantomWalletAdapter(),
      new BackpackWalletAdapter(),
      new OKXWalletAdapter(),
      new TrustWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new ExodusWalletAdapter(),
      new BitgetWalletAdapter(),
      new XDEFIWalletAdapter(),
      new CloverWalletAdapter(),
      new Coin98WalletAdapter(),
      new MathWalletAdapter(),
      new LedgerWalletAdapter(),
      new MagicEdenWalletAdapter(),
      new NufiWalletAdapter(),
      new NightlyWalletAdapter(),
      new TorusWalletAdapter(),
      new TokenPocketWalletAdapter(),
      new TrezorWalletAdapter(),
      new GateWalletAdapter(),
      new BybitWalletAdapter(),
      // new FractalWalletAdapter(),
      // new KeystoneWalletAdapter(),
      // new OntoWalletAdapter(),
      // new BitpieWalletAdapter(),
      // new CoinhubWalletAdapter(),
      // new SafePalWalletAdapter(),
      // new HyperPayWalletAdapter(),
      // new SkyWalletAdapter(),
      // new SaifuWalletAdapter(),
      // new SpotWalletAdapter(),
      // new AvanaWalletAdapter(),
      // new KrystalWalletAdapter(),
      // new HuobiWalletAdapter(),
      // new SalmonWalletAdapter(),
    ],
    autoConnect: false,
  })
})
