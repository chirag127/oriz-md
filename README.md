# oriz-md — Markdown Studio

Live: **https://md.oriz.in**

A calm, split-screen zen editor for GitHub-Flavored Markdown. Write on the left, read on the right.

## What it does

- **Live GFM preview** — headings, tables, task lists, autolinks, strikethrough
- **Syntax highlighting** — highlight.js, lazy-loaded only when your document has code
- **Table of contents** — auto-generated from your headings, with anchor links
- **Export** — download standalone `.html` or `.md`, or **print → PDF** (browser print dialog)
- **Focus mode** — dims everything but the line you're writing
- **AI assist (optional)** — expand an outline, summarize, fix markdown, or generate a TOC via free g4f providers with failover; if AI is down, the editor is untouched
- **Autosave** — your document persists to `localStorage`
- **Drag & drop** — drop a `.md` file onto the editor to open it

## Privacy

**100% client-side. No upload, no signup, no tracking.** Every keystroke, render, and export happens in your browser. Nothing is sent to a server. AI features call third-party inference providers only when you press a button, sending only your document text for that request.

## Develop

```bash
npm install --legacy-peer-deps
npm run dev      # local dev server
npm run build    # static build → dist/
npm test         # vitest unit tests
```

Windows note: use **npm**, not pnpm (pnpm skips `@esbuild/win32-x64` and the build crashes).

## Stack

Astro (static) · React 19 islands · Tailwind v4 · `marked` + `DOMPurify` + `highlight.js` · shared `@chirag127/oz-*` packages (AI, file, tokens, chrome).

## License

MIT © 2026 Chirag Singhal
