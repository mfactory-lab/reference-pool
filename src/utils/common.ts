export function calculatePercentage(base: number, value: number) {
  if (base === 0) {
    return 0
  }
  const percentage = (value / base) * 100
  return percentage?.toFixed(2)
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Efficiently encodes a Uint8Array to a base64 string.
 */
export function base64Encode(bytes: Uint8Array): string {
  let binary = ''
  const len = bytes.length
  const chunkSize = 0x80_00 // 32KB chunks to avoid stack overflow
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCodePoint(...chunk)
  }
  return btoa(binary)
}

/**
 * Extracts the base URL (including the protocol and hostname) from a given URL string.
 * Returns `null` if the input string cannot be parsed as a valid URL.
 */
export function getBaseUrl(url: string): string | null {
  try {
    const { protocol, hostname } = new URL(url.trim())
    return `${protocol}//${hostname}`
  } catch {
    return null
  }
}

export function getZeroCountAfterDecimal(value: number | string): number {
  const str = Number(value).toExponential()
  const match = str.match(/e-(\d+)/)
  return match ? Number.parseInt(match[1]!, 10) : 0
}
