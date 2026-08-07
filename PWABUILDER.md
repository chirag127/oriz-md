# PWABuilder packaging — oriz Markdown

**Live URL:** https://md.oriz.in

## Android
- **Package id:** `in.oriz.md`
- **Signing SHA-256:** `0C:82:DB:11:57:7E:21:8D:62:1E:54:DF:3B:33:D1:29:6E:77:56:80:36:22:C1:99:36:DF:03:D3:6F:0D:30:36`
- Digital Asset Links served at `/.well-known/assetlinks.json` (verifies the TWA).

## Steps
1. Open https://www.pwabuilder.com and enter `https://md.oriz.in`.
2. **Package For Stores → Android** — use the **existing signing key** above, package id `in.oriz.md`.
3. **Windows** — package as-is (MSIX).
4. **iOS** — package as-is.

Manifest, service worker, icons (192/256/384/512 + maskable 512 + SVG) and screenshots (wide + mobile) all ship from `dist/` on build.
