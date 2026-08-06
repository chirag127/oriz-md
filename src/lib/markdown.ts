/** Pure markdown helpers — no DOM, unit-testable. */

/** GitHub-style slug: lowercase, strip punctuation, spaces→hyphens, dedupe. */
export function slugify(text: string, seen: Map<string, number> = new Map()): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const key = base || 'section'
  const n = seen.get(key) ?? 0
  seen.set(key, n + 1)
  return n === 0 ? key : `${key}-${n}`
}

export interface TocItem {
  level: number
  text: string
  slug: string
}

/**
 * Extract a TOC from markdown source (ATX `#` headings only).
 * Skips headings inside fenced code blocks. Slugs match slugify() dedupe order.
 */
export function extractToc(md: string): TocItem[] {
  const lines = md.split(/\r?\n/)
  const seen = new Map<string, number>()
  const out: TocItem[] = []
  let inFence = false
  let fence = ''
  for (const raw of lines) {
    const line = raw.replace(/\t/g, '    ')
    const fenceMatch = line.match(/^\s{0,3}(`{3,}|~{3,})/)
    if (fenceMatch) {
      const marker = fenceMatch[1][0]
      if (!inFence) {
        inFence = true
        fence = marker
      } else if (marker === fence) {
        inFence = false
        fence = ''
      }
      continue
    }
    if (inFence) continue
    const h = line.match(/^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/)
    if (!h) continue
    const level = h[1].length
    const text = h[2].trim()
    if (!text) continue
    out.push({ level, text, slug: slugify(text, seen) })
  }
  return out
}

export interface DocStats {
  words: number
  chars: number
  lines: number
  readingMinutes: number
}

/** Word/char/line counts + reading time (200 wpm). */
export function docStats(md: string): DocStats {
  const chars = md.length
  const lines = md === '' ? 0 : md.split(/\r?\n/).length
  const words = (md.trim().match(/\S+/g) ?? []).length
  const readingMinutes = Math.max(words === 0 ? 0 : 1, Math.ceil(words / 200))
  return { words, chars, lines, readingMinutes }
}
