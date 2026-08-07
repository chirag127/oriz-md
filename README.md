# oriz-md — Markdown Studio

- **Live app:** https://md.oriz.in
- **About / info:** https://chirag127.github.io/oriz-md/
- **llms.txt:** https://md.oriz.in/llms.txt

A free, split-screen editor for GitHub-Flavored Markdown. Write on the left, read the rendered preview on the right — in real time.

**100% client-side. No upload, no signup, free.** Every keystroke, render, and export happens in your browser; nothing is sent to a server.

## What it does

- **Live GFM preview** — headings, tables, task lists, autolinks, strikethrough (`marked` + DOMPurify)
- **Syntax highlighting** — highlight.js, lazy-loaded only when your document has code
- **Table of contents** — auto-generated from your headings, with anchor links
- **Export** — download standalone `.html` or `.md`, or **print → PDF**
- **Focus mode** — dims everything but where you're writing
- **AI assist (optional)** — expand an outline, summarize, fix markdown, or generate a TOC via free g4f providers with failover; if AI is down, the editor is untouched
- **Autosave** — persists to `localStorage`
- **Drag & drop** — drop a `.md` file onto the editor to open it
- **PWA** — installable, works offline after first load

## Tech

Astro (static) · React 19 island · Tailwind v4 · `marked` + `DOMPurify` + `highlight.js` · shared `@chirag127/oz-*` packages (oz-ai, oz-file, oz-tokens-base, oz-chrome). AI is keyless g4f via `@chirag127/oz-ai`.

Two surfaces: **Cloudflare Pages** serves the live app (md.oriz.in); **GitHub Pages** serves the separate info page (chirag127.github.io/oriz-md).

## Develop

```bash
npm install --legacy-peer-deps
npm run dev      # local dev server
npm run build    # static build → dist/
npm test         # vitest unit tests
```

Windows note: use **npm**, not pnpm (pnpm skips `@esbuild/win32-x64` and the build crashes).

## License

MIT © 2026 Chirag Singhal
