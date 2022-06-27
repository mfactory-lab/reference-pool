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

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: 'production' | 'development' | 'staging'

  readonly VITE_APP_TITLE: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_APP_KEYWORDS: string
  readonly VITE_PASSWORD_PROTECT: string
  readonly VITE_GTAG_ID: string
  readonly VITE_BASE_PATH: string
  readonly VITE_XSOL_NAME: string
  readonly VITE_APP_LOGO: string
  readonly VITE_XSOL_LOGO: string
  readonly VITE_NO_WALLET_ICON: string
  readonly VITE_TELEGRAM_ANNOUNCEMENT_UR: string
  readonly VITE_COPYRIGHT_BY: string
  readonly VITE_COPYRIGHT: string
  readonly VITE_POWERED_BY: string
  readonly VITE_POWERED_LINK: string
  readonly VITE_FOOTER_LINKS: string
  readonly VITE_MAIN_STAKE_POOL_ADDRESS: string
  readonly VITE_TEST_STAKE_POOL_ADDRESS: string
  readonly VITE_DEV_STAKE_POOL_ADDRESS: string
  readonly VITE_MAIN_STAKE_LIMIT: string
  readonly VITE_TEST_STAKE_LIMIT: string
}
