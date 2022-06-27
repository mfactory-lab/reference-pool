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

// apy
export const DEFAULT_APY = 0.07
// export const APY_VALIDATOR_ID = '8BYmtxKY1LuvjesaMi1nkXcj6ghuq48iiGKq2jNpnrNY'
export const APY_VALIDATOR_ID = ''

// intervals
export const EPOCH_RELOAD_INTERVAL = 60000
export const RATES_RELOAD_INTERVAL = 300000
export const POOL_RELOAD_INTERVAL = 30000
export const VALIDATORS_RELOAD_INTERVAL = 1800000

// misc
// export const HOW_TO_STAKE_URL = 'https://www.youtube.com/embed/KXPPGC8iOPM'
export const HOW_TO_STAKE_URL = 'https://www.youtube.com/channel/UCYG4ZRUBMgEPaBT1OrZKC-Q'

export const PASSWORD_PROTECT = import.meta.env.VITE_PASSWORD_PROTECT
export const WITHDRAW_SOL_ACTIVE = true

export const XSOL_NAME = import.meta.env.VITE_XSOL_NAME

export const APP_LOGO = import.meta.env.VITE_APP_LOGO
export const XSOL_LOGO = import.meta.env.VITE_XSOL_LOGO
export const NO_WALLET_ICON = import.meta.env.VITE_NO_WALLET_ICON

export const COPYRIGHT = import.meta.env.VITE_COPYRIGHT
export const COPYRIGHT_BY = import.meta.env.VITE_COPYRIGHT_BY
export const POWERED_BY = import.meta.env.VITE_POWERED_BY
export const POWERED_LINK = import.meta.env.VITE_POWERED_LINK
export const FOOTER_LINKS = import.meta.env.VITE_FOOTER_LINKS
