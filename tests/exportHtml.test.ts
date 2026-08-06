import { describe, expect, it } from 'vitest'
import { exportHtmlDocument } from '../src/lib/exportHtml'

describe('exportHtmlDocument', () => {
  it('wraps body in a full standalone document with the title', () => {
    const out = exportHtmlDocument('My Doc', '<h1>Hi</h1>')
    expect(out).toContain('<!doctype html>')
    expect(out).toContain('<title>My Doc</title>')
    expect(out).toContain('<h1>Hi</h1>')
    expect(out).toContain('<style>')
  })
  it('escapes angle brackets in the title', () => {
    const out = exportHtmlDocument('<script>', '')
    expect(out).toContain('<title>&lt;script&gt;</title>')
    expect(out).not.toContain('<title><script></title>')
  })
  it('defaults empty title to "Document"', () => {
    expect(exportHtmlDocument('', 'x')).toContain('<title>Document</title>')
  })
})
