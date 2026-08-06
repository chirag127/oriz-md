/** Wrap rendered body HTML into a standalone, self-contained HTML document. */
export function exportHtmlDocument(title: string, bodyHtml: string): string {
  const safeTitle = (title || 'Document').replace(/[<>&]/g, (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;',
  )
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${safeTitle}</title>
<style>
:root { color-scheme: light dark; }
body { max-width: 46rem; margin: 3rem auto; padding: 0 1.25rem;
  font: 16px/1.7 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #23272e; background: #fbfcfb; }
h1,h2,h3,h4 { line-height: 1.25; margin-top: 2rem; }
a { color: #4a7c6f; }
code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .9em;
  background: #eef1ef; padding: .15em .35em; border-radius: 4px; }
pre { background: #f2f4f2; padding: 1rem; border-radius: 8px; overflow-x: auto; }
pre code { background: none; padding: 0; }
blockquote { border-left: 3px solid #9db3a6; margin: 1rem 0; padding: .2rem 1rem; color: #4a5a52; }
table { border-collapse: collapse; width: 100%; }
th,td { border: 1px solid #d5ddd8; padding: .5rem .75rem; text-align: left; }
img { max-width: 100%; }
hr { border: none; border-top: 1px solid #d5ddd8; margin: 2rem 0; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`
}
