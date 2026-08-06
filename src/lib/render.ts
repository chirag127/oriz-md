/**
 * Browser-side markdown → sanitized HTML pipeline.
 * marked (GFM) → heading slugs/anchors → DOMPurify sanitize.
 * highlight.js is lazy-loaded on first render that contains code.
 */
import DOMPurify from 'dompurify'
import { Marked } from 'marked'
import { slugify } from './markdown'

type Hljs = typeof import('highlight.js').default
let hljsPromise: Promise<Hljs> | null = null

/** Lazy-load highlight.js core (common languages) once. */
export function loadHighlighter(): Promise<Hljs> {
  if (!hljsPromise) {
    hljsPromise = import('highlight.js').then((m) => m.default)
  }
  return hljsPromise
}

function buildMarked(hljs: Hljs | null): Marked {
  const seen = new Map<string, number>()
  const marked = new Marked({ gfm: true, breaks: false })
  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens)
        const plain = text.replace(/<[^>]+>/g, '')
        const slug = slugify(plain, seen)
        return `<h${depth} id="${slug}"><a class="md-anchor" href="#${slug}" aria-label="Link to ${plain}">#</a>${text}</h${depth}>\n`
      },
      code({ text, lang }) {
        if (hljs) {
          const language = lang && hljs.getLanguage(lang) ? lang : ''
          try {
            const html = language
              ? hljs.highlight(text, { language }).value
              : hljs.highlightAuto(text).value
            return `<pre><code class="hljs${language ? ` language-${language}` : ''}">${html}</code></pre>\n`
          } catch {
            /* fall through to plain */
          }
        }
        const escaped = text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        return `<pre><code class="${lang ? `language-${lang}` : ''}">${escaped}</code></pre>\n`
      },
    },
  })
  return marked
}

let purifyHooked = false
function hookPurify(): void {
  if (purifyHooked || typeof window === 'undefined') return
  purifyHooked = true
  // external links open safely
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('href')?.startsWith('http')) {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  })
}

/**
 * Render markdown to sanitized HTML. Pass an hljs instance to enable syntax
 * highlighting; omit for a fast, highlight-free first render.
 */
export function renderMarkdown(md: string, hljs: Hljs | null = null): string {
  hookPurify()
  const raw = buildMarked(hljs).parse(md, { async: false }) as string
  return DOMPurify.sanitize(raw, {
    ADD_ATTR: ['target', 'rel', 'id', 'class', 'align'],
    ADD_TAGS: ['input'], // GFM task-list checkboxes
    FORBID_ATTR: ['style', 'onerror', 'onload'],
  })
}
