import { lookup } from 'dns/promises'
import { isIP } from 'net'

/**
 * fetch() for URLs we do not control.
 *
 * The link checker fetches URLs pulled from press items, client websites and
 * scraped blog bodies. Plain `fetch(url, { redirect: 'follow' })` on such a URL
 * is an SSRF primitive: a host the admin legitimately linked can 302 to
 * http://169.254.169.254/ (cloud metadata) or http://localhost:6379 (Redis),
 * and the returned status code leaks whether the internal service exists.
 *
 * This resolves the hostname and refuses private address space, then follows
 * redirects manually so every hop is re-validated rather than only the first.
 */

const BLOCKED_V4 = [
  { net: '0.0.0.0', bits: 8 },       // "this network"
  { net: '10.0.0.0', bits: 8 },      // RFC1918
  { net: '100.64.0.0', bits: 10 },   // CGNAT
  { net: '127.0.0.0', bits: 8 },     // loopback
  { net: '169.254.0.0', bits: 16 },  // link-local, incl. cloud metadata
  { net: '172.16.0.0', bits: 12 },   // RFC1918
  { net: '192.0.0.0', bits: 24 },    // IETF protocol assignments
  { net: '192.168.0.0', bits: 16 },  // RFC1918
  { net: '198.18.0.0', bits: 15 },   // benchmarking
  { net: '224.0.0.0', bits: 4 },     // multicast
  { net: '240.0.0.0', bits: 4 },     // reserved
]

function v4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0
}

function isPrivateV4(ip: string): boolean {
  const value = v4ToInt(ip)
  return BLOCKED_V4.some(({ net, bits }) => {
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0
    return (value & mask) === (v4ToInt(net) & mask)
  })
}

function isPrivateV6(ip: string): boolean {
  const addr = ip.toLowerCase().split('%')[0]
  if (addr === '::1' || addr === '::') return true
  // IPv4-mapped (::ffff:10.0.0.1) — validate the embedded v4 address
  const mapped = addr.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return isPrivateV4(mapped[1])
  // fc00::/7 unique-local, fe80::/10 link-local
  return /^f[cd]/.test(addr) || /^fe[89ab]/.test(addr)
}

export function isPrivateAddress(ip: string): boolean {
  const version = isIP(ip)
  if (version === 4) return isPrivateV4(ip)
  if (version === 6) return isPrivateV6(ip)
  return true // unparseable — refuse
}

async function assertPublicHost(hostname: string): Promise<void> {
  // A literal IP in the URL never reaches DNS, so check it directly.
  if (isIP(hostname)) {
    if (isPrivateAddress(hostname)) throw new Error(`Refusing request to private address ${hostname}`)
    return
  }

  const results = await lookup(hostname, { all: true })
  if (results.length === 0) throw new Error(`Could not resolve ${hostname}`)
  for (const { address } of results) {
    if (isPrivateAddress(address)) {
      throw new Error(`Refusing request to ${hostname} — resolves to private address ${address}`)
    }
  }
}

export interface SafeFetchOptions {
  method?: string
  timeoutMs?: number
  maxRedirects?: number
}

export async function safeFetch(
  rawUrl: string,
  { method = 'HEAD', timeoutMs = 5000, maxRedirects = 5 }: SafeFetchOptions = {},
): Promise<Response> {
  let current = rawUrl

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const url = new URL(current)
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error(`Unsupported protocol: ${url.protocol}`)
    }

    // Re-validated on every hop — validating only the first would let the
    // destination redirect us inward.
    await assertPublicHost(url.hostname)

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    let res: Response
    try {
      res = await fetch(url, { method, signal: controller.signal, redirect: 'manual' })
    } finally {
      clearTimeout(timer)
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location')
      if (!location) return res
      current = new URL(location, url).toString()
      continue
    }

    return res
  }

  throw new Error('Too many redirects')
}
