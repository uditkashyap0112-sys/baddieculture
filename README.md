# BADDIECULTURE — Shopify Rebuild

Static deployment-ready storefront inspired by the supplied BADDIECULTURE Shopify theme, with the supplied current character builder embedded as a full-screen experience.

## Features
- Original archive-style visual direction with the supplied old-man artwork in the homepage hero.
- Supplied product photography used on storefront cards; character-builder layer PNGs remain untouched.
- Size + color selection before every add-to-cart action.
- Consistent cart UI.
- Product detail modal with fabric/fit/quality details.
- Responsive mobile layout.
- Character builder preserved in `builder/` and opened inside the storefront.
- Builder loadout can hand off to storefront checkout via `postMessage`.
- Checkout collects name, mobile, email, address, city, state, pincode and notes.
- Creator/redeem codes: MIORIMIORI, THAPA15, DIYA15, KENTALORE15, AC15, TANITYA15, ADITI15 — 15% each.
- WhatsApp checkout number: +91 92127 001375.

## Deployment
No Node/npm build is required. Upload this folder to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc.). The root `index.html` is the entry point.
