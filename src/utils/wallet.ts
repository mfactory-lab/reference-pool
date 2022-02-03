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

import { PublicKey, Transaction } from '@solana/web3.js';
import SolanaWalletAdapter from '@project-serum/sol-wallet-adapter';
import { SlopeWalletAdapter } from '@solana/wallet-adapter-slope';

import solletIcon from '@/assets/img/wallets/sollet.svg';
import solongIcon from '@/assets/img/wallets/solong.png';
import solflareIcon from '@/assets/img/wallets/solflare.svg';
import phantomIcon from '@/assets/img/wallets/phantom.svg';
import mathwalletIcon from '@/assets/img/wallets/mathwallet.svg';

import {
  PhantomWalletAdapter,
  SolflareExtensionWalletAdapter,
  SolongWalletAdapter,
} from '../wallet-adapters';

// shorten the checksummed version of the input address to have 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export interface WalletInfo {
  name: string;
  url: string;
  installUrl?: string;
  icon?: any;
  isExtension?: boolean;
  getAdapter?: ({
    providerUrl,
    endpoint,
  }: {
    providerUrl: string;
    endpoint: string;
  }) => WalletAdapter | undefined;
}

export interface WalletAdapter {
  publicKey: PublicKey | null | undefined;
  autoApprove: boolean;
  connected: boolean;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transaction: Transaction[]) => Promise<Transaction[]>;
  connect: () => any;
  disconnect: () => any;

  on(event: string, fn: () => void): this;
}

export const WALLET_PROVIDERS: WalletInfo[] = [
  {
    name: 'Solflare Web',
    url: 'https://solflare.com/access-wallet',
    icon: solflareIcon,
  },
  {
    name: 'Solflare Extension',
    url: 'https://solflare.com/access-wallet',
    icon: solflareIcon,
    getAdapter(): WalletAdapter | undefined {
      if ((window as any).solflare === undefined) {
        return;
      }
      // return new SolanaWalletAdapter((window as any).solflare, endpoint);
      return new SolflareExtensionWalletAdapter();
    },
  },
  // {
  //   name: 'Solflare Legacy',
  //   url: 'https://legacy.solflare.com/access-wallet',
  //   icon: solflareIcon,
  // },
  {
    name: 'Sollet Web',
    url: 'https://www.sollet.io',
    icon: solletIcon,
  },
  {
    name: 'Sollet Extension',
    url: 'https://www.sollet.io',
    icon: solletIcon,
    installUrl: 'https://chrome.google.com/webstore/detail/sollet/fhmfendgdocmcbmfikdcogofphimnkno',
    getAdapter({ endpoint }: { endpoint: string }): WalletAdapter | undefined {
      if ((window as any).sollet === undefined) {
        return;
      }
      return new SolanaWalletAdapter((window as any).sollet, endpoint);
    },
  },
  {
    name: 'Solong',
    url: 'https://solongwallet.com',
    icon: solongIcon,
    installUrl: 'https://chrome.google.com/webstore/detail/solong/memijejgibaodndkimcclfapfladdchj',
    getAdapter(): WalletAdapter | undefined {
      if ((window as any).solong === undefined) {
        return;
      }
      return new SolongWalletAdapter();
    },
  },
  // {
  //   name: 'Bonfida',
  //   url: 'https://bonfida.com/wallet',
  //   icon: bonfidaIcon,
  // },
  {
    name: 'Phantom',
    url: 'https://phantom.app',
    icon: phantomIcon,
    installUrl:
      'https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa',
    getAdapter() {
      if ((window as any).solana === undefined || !(window as any).solana.isPhantom) {
        return;
      }
      return new PhantomWalletAdapter();
    },
  },
  // {
  //   name: 'Ledger',
  //   url: 'https://www.ledger.com',
  //   getAdapter() {
  //     return new LedgerWalletAdapter();
  //   },
  // },
  // {
  //   name: 'Coin98',
  //   url: 'https://www.coin98.com',
  //   installUrl: 'https://chrome.google.com/webstore/detail/coin98-wallet/aeachknmefphepccionboohckonoeemg',
  //   getAdapter() {
  //     if ((window as any).coin98 === undefined) {
  //       return;
  //     }
  //     return new Coin98WalletAdapter();
  //   },
  // },
  // {
  //   name: 'Blocto',
  //   url: 'https://blocto.portto.io',
  //   getAdapter() {
  //     if ((window as any).solana === undefined ||
  //       !(window as any).solana.isBlocto) {
  //       return;
  //     }
  //     return new BloctoWalletAdapter();
  //   },
  // },
  {
    name: 'Slope',
    url: 'https://slope.finance',
    icon: 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHdpZHRoPSIxMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjQiIGN5PSI2NCIgZmlsbD0iIzZlNjZmYSIgcj0iNjQiLz48ZyBmaWxsPSIjZmZmIj48cGF0aCBkPSJtMzUuMTk2MyA1NC4zOTk4aDE5LjJ2MTkuMmgtMTkuMnoiLz48cGF0aCBkPSJtNzMuNTk3IDU0LjM5OTgtMTkuMiAxOS4ydi0xOS4ybDE5LjItMTkuMnoiIGZpbGwtb3BhY2l0eT0iLjQiLz48cGF0aCBkPSJtNzMuNTk3IDczLjU5OTgtMTkuMiAxOS4ydi0xOS4ybDE5LjItMTkuMnoiIGZpbGwtb3BhY2l0eT0iLjc1Ii8+PHBhdGggZD0ibTczLjYwNCA1NC4zOTk4aDE5LjJ2MTkuMmgtMTkuMnoiLz48cGF0aCBkPSJtNTQuMzk2OCAzNS4yIDE5LjItMTkuMnYxOS4ybC0xOS4yIDE5LjJoLTE5LjJ6IiBmaWxsLW9wYWNpdHk9Ii43NSIvPjxwYXRoIGQ9Im03My41OTE1IDkyLjgtMTkuMiAxOS4ydi0xOS4ybDE5LjItMTkuMmgxOS4yeiIgZmlsbC1vcGFjaXR5PSIuNCIvPjwvZz48L3N2Zz4=',
    // @ts-ignore
    getAdapter() {
      if ((window as any).Slope === undefined) {
        return;
      }
      return new SlopeWalletAdapter();
    },
  },
  {
    name: 'MathWallet',
    url: 'https://mathwallet.org',
    icon: mathwalletIcon,
  },
];
