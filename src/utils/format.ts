import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import BN from 'bn.js'

const SOL_DECIMALS = Math.log10(LAMPORTS_PER_SOL)

export function divideBnToNumber(numerator: BN, denominator: BN): number {
  if (denominator.isZero()) {
    return 0
  }
  const quotient = numerator.div(denominator).toNumber()
  const rem = numerator.umod(denominator)
  const gcd = rem.gcd(denominator)
  return quotient + rem.div(gcd).toNumber() / denominator.div(gcd).toNumber()
}

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
  return signMultiplier * Number.parseFloat(solString)
}

export function lamportsToSolString(lamports: number | BN, maximumFractionDigits = SOL_DECIMALS): string {
  const sol = lamportsToSol(lamports)
  return `◎ ${new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(sol)}`
}

// export const solToLamports = (amount: string | number | BN): number => {
//   const val = new BN(amount, 10)
//   return val.mul(new BN(LAMPORTS_PER_SOL, 10)).toNumber()
// }

export function solToLamports(amount: number): number {
  if (Number.isNaN(amount)) {
    return Number(0)
  }
  return new BN(Number(amount).toFixed(SOL_DECIMALS).replace('.', '')).toNumber()
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

function abbreviateNumber(number: number, precision: number, trimZeros = false) {
  const tier = Math.trunc(Math.log10(number) / 3)
  let scaled = number
  const suffix = SI_SYMBOL[tier]
  if (tier > 0) {
    const scale = 10 ** (tier * 3)
    scaled = number / scale
  }

  if (Number.isNaN(scaled)) {
    return ''
  }
  const result = trimZeros ? Number(scaled.toFixed(precision)) : scaled.toFixed(precision)
  return result + (suffix ?? '')
}

export function formatAmount(val: number, precision = 5, abbr = true) {
  return abbr ? abbreviateNumber(val, precision) : val.toFixed(precision)
}

export function formatAndTrimAmount(val: number, precision = 5, abbr = true) {
  return abbr ? abbreviateNumber(val, precision, true) : Number(val.toFixed(precision))
}

export function isInt(n: string | number): boolean {
  return Number(n) === n && n % 1 === 0
}

export function isInvalidFloat(n: string | number): boolean {
  return Number.isNaN(Number(n))
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

export function formatMoney(val: string | number, integer = false): string {
  if (val === undefined || val === null || val === '') {
    return ''
  }

  val = val.toString()

  const decimalSeparator = val.lastIndexOf('.')

  let integerPart = decimalSeparator === -1 ? val : val.slice(0, decimalSeparator)

  let fractionalPart = decimalSeparator === -1 ? null : val.slice(decimalSeparator + 1)

  // round integer value
  if (integer && fractionalPart && (+`0.${fractionalPart}` >= 0.5)) {
    integerPart = `${+integerPart + 1}`
  }

  if (fractionalPart) {
    fractionalPart = fractionalPart.slice(0, 2).replaceAll(/\D+/g, '')
    if (fractionalPart.length === 1) {
      fractionalPart += '0'
    }
  } else if (!fractionalPart) {
    fractionalPart = '00'
  }

  integerPart = integerPart.replaceAll(/\D+/g, '')
  if (!integerPart) {
    integerPart = '0'
  }

  let formatted = ''
  for (let i = 0; i < integerPart.length; i++) {
    formatted = i !== 0 && i % 3 === 0 ? `${integerPart[integerPart.length - i - 1]},${formatted}` : integerPart[integerPart.length - i - 1] + formatted
  }

  return integer ? formatted : `${formatted}.${fractionalPart}`
}

/**
 * Function to allow only numbers and a single decimal point to be inputted.
 *
 * @param {any} e - event parameter
 */
export function onlyNumber(e: any) {
  const keyCode = e.keyCode ?? e.which
  if ((keyCode < 48 || keyCode > 57) && keyCode !== 46) {
    e.preventDefault()
  }
  if (keyCode === 46 && String(e.target.value).includes('.')) {
    e.preventDefault()
  }
}

export function getSolPriceFormatter(n = 5) {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: n,
    maximumFractionDigits: n,
  })
}

export function solFormatter(val: number, text = ' SOL', maxDigits?: number) {
  if (val === 0) {
    return `0${text}`
  }
  const decimals = maxDigits ?? Math.max(13 - `${val}`.length, 5)
  const solPriceFormatter = getSolPriceFormatter(decimals)
  return `${val < 0 ? '-' : ''}${solPriceFormatter.format(lamportsToSol(val))}${text}`
}

export function formatAmountPrice(val: number | bigint) {
  return priceFormatter.format(val)
}

export function capitalize(s: string) {
  if (!s[0]) {
    return s
  }
  return s[0].toUpperCase() + s.slice(1)
}

export function formatPrice(price: number | string, minDigits = 0, maxDigits = 10) {
  const longPriceFormatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  })
  return longPriceFormatter.format(Number(price))
}

export function parseFormattedPrice(formattedPrice: string): number {
  return Number.parseFloat(formattedPrice.replaceAll(',', ''))
}

export function truncateNumber(num: number) {
  if (num === 0) {
    return '0'
  }

  const strNum = num.toString()
  const decimalIndex = strNum.indexOf('.')

  if (decimalIndex === -1) {
    return num.toFixed(2)
  }

  const integerPart = strNum.slice(0, decimalIndex)
  if (Number.parseInt(integerPart) > 0) {
    return num.toFixed(2)
  }

  let i = decimalIndex + 1
  while (i < strNum.length && strNum[i] === '0') {
    i++
  }

  return strNum.slice(0, i + 1)
}

export function padNumber(number: number) {
  return number < 10 ? `0${number}` : number
}

export function getNumberWithZeros(count: number) {
  return 10 ** count
}

export function dateToUtc(date: Date) {
  const newDate = new Date(date)
  const day = newDate.getUTCDate()
  const month = newDate.getUTCMonth() + 1
  const year = newDate.getUTCFullYear()
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function formatReward(val: number) {
  if (!val) {
    return '0'
  }
  if (val < 100_000) {
    return '<0.0001'
  }
  return formatAmount(lamportsToSol(val))
}

export function getMonthsForLocale(localeName = 'en-US', monthFormat?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow' | undefined) {
  const format = new Intl
    .DateTimeFormat(localeName, { month: monthFormat ?? 'short' }).format
  return [...Array.from({ length: 12 }).keys()]
    .map(m => format(new Date(Date.UTC(2021, (m) % 12))))
}

// format number with decimals 99.9842 => 99.98
export function truncatePercent(value: number, dec = 2): string {
  const [intPart, decimalPart = ''] = value.toString().split('.')
  return decimalPart.length > dec
    ? `${intPart}.${decimalPart.slice(0, dec)}`
    : `${value}`
}
