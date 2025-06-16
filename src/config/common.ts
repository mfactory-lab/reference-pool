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

import { getRuntimeConfig } from '~/utils'

const config = getRuntimeConfig()

// apy
export const DEFAULT_APY = 0.07
export const API2_URL = 'https://api2.jpool.one'

// meta
export const SITE_TITLE = config.APP_TITLE
export const SITE_DESCRIPTION = config.APP_DESCRIPTION
export const SITE_KEYWORDS = config.APP_KEYWORDS

// intervals
export const EPOCH_RELOAD_INTERVAL = 60_000
export const RATES_RELOAD_INTERVAL = 300_000
export const POOL_RELOAD_INTERVAL = 30_000
export const VALIDATORS_RELOAD_INTERVAL = 1_800_000

// misc
// export const HOW_TO_STAKE_URL = 'https://www.youtube.com/embed/KXPPGC8iOPM'
export const HOW_TO_STAKE_URL = 'https://www.youtube.com/channel/UCYG4ZRUBMgEPaBT1OrZKC-Q'

export const API_COLLECTOR_URL = 'https://api.thevalidators.io'

export const MIN_REMAINING_BALANCE = 0.001

export const PASSWORD_PROTECT = config.PASSWORD_PROTECT
export const WITHDRAW_SOL_ACTIVE = true

export const XSOL_NAME = config.XSOL_NAME

export const APP_LOGO = config.APP_LOGO
export const XSOL_LOGO = config.XSOL_LOGO
export const NO_WALLET_ICON = config.NO_WALLET_ICON

export const COPYRIGHT = config.COPYRIGHT
export const COPYRIGHT_BY = config.COPYRIGHT_BY
export const POWERED_BY = config.POWERED_BY
export const POWERED_LINK = config.POWERED_LINK
export const FOOTER_LINKS = config.FOOTER_LINKS
