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

import BN from 'bn.js'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

const SOL_DECIMALS = Math.log10(LAMPORTS_PER_SOL)

export function lamportsToSol(lamports: number | BN): number {
  if (typeof lamports === 'number') {
    return Math.abs(lamports) / LAMPORTS_PER_SOL
  }

  let signMultiplier = 1
  if (lamports.isNeg()) {
    signMultiplier = -1
  }

  const absLamports = lamports.abs()
  const lamportsString = absLamports.toString(10).padStart(10, '0')
  const splitIndex = lamportsString.length - SOL_DECIMALS
  const solString = `${lamportsString.slice(0, splitIndex)}.${lamportsString.slice(splitIndex)}`
  return signMultiplier * parseFloat(solString)
}

export function lamportsToSolString(lamports: number | BN, maximumFractionDigits = 9): String {
  const sol = lamportsToSol(lamports)
  return `◎ ${new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(sol)}`
}

export function solToLamports(amount: number): number {
  if (isNaN(amount)) {
    return Number(0)
  }
  return new BN(amount.toFixed(SOL_DECIMALS).replace('.', '')).toNumber()
}

export const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const longPriceFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 5,
})

export const feeFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 9,
})

export const formatPct = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const SI_SYMBOL = ['', 'K', 'M', 'G', 'T', 'P', 'E']

const abbreviateNumber = (number: number, precision: number, trimZeros = false) => {
  const tier = (Math.log10(number) / 3) | 0
  let scaled = number
  const suffix = SI_SYMBOL[tier]
  if (tier > 0) {
    const scale = 10 ** (tier * 3)
    scaled = number / scale
  }

  if (isNaN(scaled)) {
    return ''
  }
  const result = trimZeros ? Number(scaled.toFixed(precision)) : scaled.toFixed(precision)
  return result + (typeof suffix === 'string' ? suffix : '')
}

export const formatAmount = (val: number, precision = 5, abbr = true) =>
  abbr ? abbreviateNumber(val, precision) : val.toFixed(precision)

export const formatAndTrimAmount = (val: number, precision = 5, abbr = true) =>
  abbr ? abbreviateNumber(val, precision, true) : Number(val.toFixed(precision))

export function isInt(n: string | number): boolean {
  return Number(n) === n && n % 1 === 0
}

export function isInvalidFloat(n: string | number): boolean {
  return isNaN(Number(n))
}

export function isInvalidTime(n: string, p: string): boolean {
  const num = Number(n)
  if (!isInt(num) || isInvalidFloat(num)) {
    return true
  }
  let max = 12
  if (p === 'Year') {
    max = 20
  } else if (p === 'Epoch') {
    max = 365
  }

  return num < 1 || num > max
}

export function formatMoney(val: string | number): string {
  if (typeof val === 'undefined' || val === null || val === '') {
    return ''
  }

  val = val.toString()

  const decimalSeparator = val.lastIndexOf('.')

  let integerPart = decimalSeparator >= 0 ? val.slice(0, decimalSeparator) : val
  let fractionalPart = decimalSeparator >= 0 ? val.slice(decimalSeparator + 1) : null

  if (fractionalPart) {
    fractionalPart = fractionalPart.slice(0, 2).replace(/[^0-9]+/g, '')
    if (fractionalPart.length === 1) {
      fractionalPart += '0'
    }
  } else if (!fractionalPart) {
    fractionalPart = '00'
  }

  integerPart = integerPart.replace(/[^0-9]+/g, '')
  if (!integerPart) {
    integerPart = '0'
  }

  let formatted = ''
  for (let i = 0; i < integerPart.length; i++) {
    if (i !== 0 && i % 3 === 0) {
      formatted = `${integerPart[integerPart.length - i - 1]},${formatted}`
    } else {
      formatted = integerPart[integerPart.length - i - 1] + formatted
    }
  }

  formatted += `.${fractionalPart}`

  return formatted
}
