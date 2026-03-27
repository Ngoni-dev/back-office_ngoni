/**
 * URL PNG drapeau (flagcdn.com) à partir du code ISO 3166-1 alpha-2.
 * Préféré aux emoji Unicode, souvent affichés comme lettres « BF », « CI » sur Windows.
 *
 * @see https://flagcdn.com/
 */
export function flagCdnUrl(code: string | null | undefined): string | null {
  if (!code || typeof code !== 'string') return null
  const cc = code.trim().toUpperCase()
  if (cc.length !== 2 || !/^[A-Z]{2}$/.test(cc)) return null
  return `https://flagcdn.com/w40/${cc.toLowerCase()}.png`
}

/** @deprecated Préférer flagCdnUrl + <img> pour un rendu fiable sur tous les OS */
export function isoCodeToFlagEmoji(code: string | null | undefined): string {
  if (!code || typeof code !== 'string') return ''
  const cc = code.trim().toUpperCase()
  if (cc.length !== 2 || !/^[A-Z]{2}$/.test(cc)) return ''
  const base = 0x1f1e6
  return String.fromCodePoint(...[...cc].map(c => base + (c.charCodeAt(0) - 65)))
}
