import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { downloadBlob, onDropZone, printToPdf, readAsText } from '@chirag127/oz-file'
import { docStats, extractToc } from '../lib/markdown'
import { loadHighlighter, renderMarkdown } from '../lib/render'
import { exportHtmlDocument } from '../lib/exportHtml'
import { SAMPLE_DOC } from '../lib/sample'

const STORAGE_KEY = 'oriz-md:doc'
type View = 'split' | 'editor' | 'preview'
type AiTask = 'expand' | 'summarize' | 'fix' | 'toc'

const AI_PROMPTS: Record<AiTask, { system: string; label: string }> = {
  expand: {
    label: 'Expand outline',
    system:
      'You are a writing assistant. Expand the given markdown outline into a well-structured first draft. Keep valid GitHub-Flavored Markdown. Return only markdown, no commentary.',
  },
  summarize: {
    label: 'Summarize',
    system:
      'Summarize the following markdown document into a concise bulleted summary in markdown. Return only markdown.',
  },
  fix: {
    label: 'Fix markdown',
    system:
      'Fix any broken or inconsistent markdown syntax in the following document (headings, lists, tables, code fences, links). Preserve meaning. Return only the corrected markdown.',
  },
  toc: {
    label: 'Generate TOC',
    system:
      'Generate a markdown table of contents (nested bullet list of links) for the following document, based on its headings. Return only the markdown list.',
  },
}

export default function Studio() {
  const [doc, setDoc] = useState('')
  const [html, setHtml] = useState('')
  const [view, setView] = useState<View>('split')
  const [focus, setFocus] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiBusy, setAiBusy] = useState(false)
  const [aiOut, setAiOut] = useState('')
  const [aiErr, setAiErr] = useState(false)
  const [aiStatus, setAiStatus] = useState('')
  const [dragging, setDragging] = useState(false)
  const [saved, setSaved] = useState(false)

  const editorRef = useRef<HTMLTextAreaElement>(null)
  const paneRef = useRef<HTMLDivElement>(null)
  const hljsRef = useRef<Awaited<ReturnType<typeof loadHighlighter>> | null>(null)
  const renderTimer = useRef<number | undefined>(undefined)
  const saveTimer = useRef<number | undefined>(undefined)
  const abortRef = useRef<AbortController | null>(null)

  // hydrate once
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    setDoc(stored ?? SAMPLE_DOC)
  }, [])

  const doRender = useCallback((md: string) => {
    setHtml(renderMarkdown(md, hljsRef.current))
  }, [])

  // lazy-load highlighter when a code fence appears; re-render after
  useEffect(() => {
    if (hljsRef.current || !/```|~~~/.test(doc)) return
    let alive = true
    loadHighlighter().then((h) => {
      if (!alive) return
      hljsRef.current = h
      doRender(doc)
    })
    return () => {
      alive = false
    }
  }, [doc, doRender])

  // debounced render + autosave
  useEffect(() => {
    window.clearTimeout(renderTimer.current)
    renderTimer.current = window.setTimeout(() => doRender(doc), 120)
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, doc)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 1200)
    }, 500)
    return () => {
      window.clearTimeout(renderTimer.current)
      window.clearTimeout(saveTimer.current)
    }
  }, [doc, doRender])

  // drag-drop .md files onto editor pane
  useEffect(() => {
    const el = paneRef.current
    if (!el) return
    const teardown = onDropZone(el, async (files) => {
      setDragging(false)
      const f = files[0]
      if (f) setDoc(await readAsText(f))
    })
    const on = () => setDragging(true)
    const off = () => setDragging(false)
    el.addEventListener('dragover', on)
    el.addEventListener('dragleave', off)
    el.addEventListener('drop', off)
    return () => {
      teardown()
      el.removeEventListener('dragover', on)
      el.removeEventListener('dragleave', off)
      el.removeEventListener('drop', off)
    }
  }, [])

  const stats = useMemo(() => docStats(doc), [doc])
  const toc = useMemo(() => extractToc(doc), [doc])

  const insertTab = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab') return
    e.preventDefault()
    const ta = e.currentTarget
    const { selectionStart: s, selectionEnd: en } = ta
    const next = `${doc.slice(0, s)}  ${doc.slice(en)}`
    setDoc(next)
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = s + 2
    })
  }

  const exportHtml = () => {
    const title = doc.match(/^#\s+(.+)$/m)?.[1]?.trim() || 'document'
    const out = exportHtmlDocument(title, renderMarkdown(doc, hljsRef.current))
    downloadBlob(new Blob([out], { type: 'text/html' }), `${slugName(title)}.html`)
  }
  const exportMd = () => {
    const title = doc.match(/^#\s+(.+)$/m)?.[1]?.trim() || 'document'
    downloadBlob(new Blob([doc], { type: 'text/markdown' }), `${slugName(title)}.md`)
  }

  const runAi = async (task: AiTask) => {
    if (aiBusy) return
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setAiBusy(true)
    setAiErr(false)
    setAiOut('')
    setAiStatus('thinking…')
    try {
      const { complete } = await import('@chirag127/oz-ai')
      const input = doc.trim() || SAMPLE_DOC
      const text = await complete(input, {
        system: AI_PROMPTS[task].system,
        signal: ac.signal,
      })
      setAiOut(text.trim())
      setAiStatus('done — review then Insert')
    } catch {
      setAiErr(true)
      setAiStatus('AI unavailable (all providers down). Core tools still work.')
    } finally {
      setAiBusy(false)
    }
  }

  const insertAi = () => {
    if (!aiOut) return
    setDoc((d) => `${d.replace(/\s*$/, '')}\n\n${aiOut}\n`)
    setAiOut('')
    setAiStatus('inserted')
  }

  const clearDoc = () => {
    if (doc.trim() && !confirm('Clear the document? This cannot be undone.')) return
    setDoc('')
    editorRef.current?.focus()
  }

  return (
    <div className="md-studio" data-focus={focus} id="studio">
      <div className="md-toolbar" role="toolbar" aria-label="Editor actions">
        <div className="md-btngroup" role="group" aria-label="View">
          {(['split', 'editor', 'preview'] as View[]).map((v) => (
            <button
              key={v}
              className="md-btn"
              aria-pressed={view === v}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <button className="md-btn" aria-pressed={focus} onClick={() => setFocus((f) => !f)}>
          focus
        </button>
        <button
          className="md-btn"
          aria-pressed={tocOpen}
          onClick={() => {
            setTocOpen((o) => !o)
            setAiOpen(false)
          }}
        >
          toc
        </button>
        <button
          className="md-btn"
          aria-pressed={aiOpen}
          onClick={() => {
            setAiOpen((o) => !o)
            setTocOpen(false)
          }}
        >
          ai
        </button>
        <div className="md-toolbar__spacer" />
        <span className="md-toolbar__stat" aria-live="polite">
          <b>{stats.words}</b> words · <b>{stats.chars}</b> chars · ~<b>{stats.readingMinutes}</b> min
          {saved ? ' · saved' : ''}
        </span>
        <button className="md-btn" onClick={exportMd}>
          .md
        </button>
        <button className="md-btn" onClick={exportHtml}>
          .html
        </button>
        <button className="md-btn" onClick={() => printToPdf()}>
          print → pdf
        </button>
        <button className="md-btn" onClick={clearDoc}>
          clear
        </button>
      </div>

      <div className="md-panes" data-view={view}>
        <div className="md-pane md-pane--editor" ref={paneRef} data-drag={dragging}>
          <span className="md-pane__label">write</span>
          <textarea
            ref={editorRef}
            className="md-editor"
            value={doc}
            spellCheck
            onChange={(e) => setDoc(e.target.value)}
            onKeyDown={insertTab}
            placeholder="# Start writing…&#10;&#10;Drop a .md file here, or just type. GitHub-Flavored Markdown supported."
            aria-label="Markdown source"
          />
          <div className="md-drop-hint">drop .md to open</div>
        </div>

        <div className="md-seam" aria-hidden="true" />

        <div className="md-pane md-pane--preview">
          <span className="md-pane__label">read</span>
          <div className="md-preview-scroll">
            {html ? (
              <article
                className="md-prose"
                // sanitized by DOMPurify in renderMarkdown
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <p className="md-preview-empty">Preview appears here as you type.</p>
            )}
          </div>

          <nav className="md-toc" data-open={tocOpen} aria-label="Table of contents" aria-hidden={!tocOpen}>
            <p className="md-toc__title">Contents</p>
            {toc.length === 0 ? (
              <p className="md-toc__empty">No headings yet. Add `#` headings.</p>
            ) : (
              <ul>
                {toc.map((t) => (
                  <li key={t.slug}>
                    <a className={`md-toc__l${Math.min(t.level, 3)}`} href={`#${t.slug}`}>
                      {t.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </nav>

          <aside className="md-ai" data-open={aiOpen} aria-label="AI assistant" aria-hidden={!aiOpen}>
            <p className="md-ai__title">AI assist · optional</p>
            <p className="md-ai__hint">
              Runs on free g4f providers with failover. If they're all down, your document is
              untouched.
            </p>
            <div className="md-ai__actions">
              {(Object.keys(AI_PROMPTS) as AiTask[]).map((t) => (
                <button key={t} className="md-btn" disabled={aiBusy} onClick={() => runAi(t)}>
                  {AI_PROMPTS[t].label}
                </button>
              ))}
            </div>
            <div className="md-ai__status" data-err={aiErr} aria-live="polite">
              {aiBusy && <span className="md-spin" aria-hidden="true" />}
              {aiStatus}
            </div>
            {aiOut && (
              <>
                <div className="md-ai__out">{aiOut}</div>
                <button className="md-btn" onClick={insertAi}>
                  Insert into document
                </button>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

function slugName(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-|-$/g, '') || 'document'
  )
}
