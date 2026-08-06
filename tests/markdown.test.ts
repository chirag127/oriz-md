import { describe, expect, it } from 'vitest'
import { docStats, extractToc, slugify } from '../src/lib/markdown'

describe('slugify', () => {
  it('lowercases, strips punctuation, hyphenates spaces', () => {
    expect(slugify('Hello, World!')).toBe('hello-world')
  })
  it('collapses repeated spaces and hyphens', () => {
    expect(slugify('  A   B  ')).toBe('a-b')
  })
  it('dedupes with a shared seen map', () => {
    const seen = new Map<string, number>()
    expect(slugify('Intro', seen)).toBe('intro')
    expect(slugify('Intro', seen)).toBe('intro-1')
    expect(slugify('Intro', seen)).toBe('intro-2')
  })
  it('falls back to "section" for empty', () => {
    expect(slugify('!!!')).toBe('section')
  })
})

describe('extractToc', () => {
  it('collects ATX headings with levels + slugs', () => {
    const md = '# Title\n\ntext\n\n## Sub A\n\n### Deep\n\n## Sub B'
    expect(extractToc(md)).toEqual([
      { level: 1, text: 'Title', slug: 'title' },
      { level: 2, text: 'Sub A', slug: 'sub-a' },
      { level: 3, text: 'Deep', slug: 'deep' },
      { level: 2, text: 'Sub B', slug: 'sub-b' },
    ])
  })
  it('ignores headings inside fenced code blocks', () => {
    const md = '# Real\n\n```\n# Not a heading\n```\n\n## After'
    expect(extractToc(md).map((t) => t.text)).toEqual(['Real', 'After'])
  })
  it('handles tilde fences too', () => {
    const md = '~~~\n## nope\n~~~\n# yes'
    expect(extractToc(md).map((t) => t.text)).toEqual(['yes'])
  })
  it('dedupes duplicate heading slugs', () => {
    const md = '# Setup\n\n# Setup'
    expect(extractToc(md).map((t) => t.slug)).toEqual(['setup', 'setup-1'])
  })
  it('strips trailing closing hashes', () => {
    expect(extractToc('## Title ##')[0]).toEqual({ level: 2, text: 'Title', slug: 'title' })
  })
  it('returns empty for headingless doc', () => {
    expect(extractToc('just text\nmore text')).toEqual([])
  })
})

describe('docStats', () => {
  it('counts words, chars, lines', () => {
    const s = docStats('hello world\nfoo')
    expect(s.words).toBe(3)
    expect(s.chars).toBe('hello world\nfoo'.length)
    expect(s.lines).toBe(2)
  })
  it('reading time is at least 1 minute for non-empty', () => {
    expect(docStats('a b c').readingMinutes).toBe(1)
  })
  it('empty doc is all zeros', () => {
    expect(docStats('')).toEqual({ words: 0, chars: 0, lines: 0, readingMinutes: 0 })
  })
  it('scales reading time at ~200 wpm', () => {
    const words = Array.from({ length: 450 }, () => 'w').join(' ')
    expect(docStats(words).readingMinutes).toBe(3)
  })
})
