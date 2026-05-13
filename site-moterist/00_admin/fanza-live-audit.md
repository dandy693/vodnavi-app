# FANZA Cache-Aware Live Audit

## Audit Metadata

- Audit date: 2026-05-08
- Scope: `1095 / 1106 / 994 / 954 / 1018`
- Methods:
  - Playwright public-page browser review
  - Raw HTML fetch via local Python HTTPS client
  - Service Worker and Cache Storage observation only
- Execution boundary:
  - Read-only only
  - No WordPress admin save
  - No SSH or DB mutation
  - No production changes

## Global Findings

- All five URLs returned `HTTP 200`.
- All five URLs exposed self-referencing canonical.
- All five URLs exposed `robots: max-image-preview:large`.
- No `noindex` was detected in reviewed HTML.
- Service Worker was active at scope `https://moterist.com/`.
- Observed Cache Storage key:
  - `cache-v260506-day9-static-assets-v1`
- No current URL cache match was detected for the five article URLs.
- Raw HTML and browser display matched for:
  - `title`
  - `h1`
  - `canonical`
  - `robots`
- No stale HTML was observed in this audit.
- Future live QA should remain cache-aware.

## Mobile Check

- Quick check at `390x844` found no large horizontal overflow on the five URLs.
- No major layout break was observed in this audit.

## URL Findings

### 1095

- URL: `https://moterist.com/fanza20250329/`
- HTTP status: `200`
- Category: `Helpful information`
- CTA summary:
  - FANZA official latest information confirmation CTA
- CTA text:
  - `FANZA official latest information confirmation CTA`
- Internal links confirmed:
  - `1106`
  - `994`
  - `954`
- Classification:
  - `KEEP`
- Future role:
  - beginner guide
  - beginner pillar
- Notes:
  - Live title is newer than the old inventory title.
  - Link to `954` is now present in live output.

### 1106

- URL: `https://moterist.com/fanza20250331/`
- HTTP status: `200`
- Category: `Helpful information`
- CTA summary:
  - FANZA official registration-before-use confirmation CTA
- CTA text:
  - `FANZA official registration-before-use confirmation CTA`
- Internal links confirmed:
  - `1095`
  - `994`
  - `954`
- Classification:
  - `KEEP`
- Future role:
  - registration guide
  - benefits guide
- Notes:
  - Live title is newer and more practical than the old inventory title.
  - Link to `954` is now present in live output.

### 994

- URL: `https://moterist.com/fanza_otoku250114/`
- HTTP status: `200`
- Category: `Helpful information`
- CTA summary:
  - FANZA official pre-use guidance confirmation CTA
- CTA text:
  - `FANZA official pre-use guidance confirmation CTA`
- Internal links confirmed:
  - `1095`
  - `1106`
  - `954`
- Classification:
  - `KEEP`
- Future role:
  - safety pillar
  - anxiety resolution pillar
- Notes:
  - Live title is newer and more trust-oriented than the old inventory title.
  - Link to `954` is now present in live output.

### 954

- URL: `https://moterist.com/fanzaotoku/`
- HTTP status: `200`
- Category: `Helpful information`
- Current issue:
  - old seasonal sale and campaign article
- CTA and link state:
  - many seasonal campaign FANZA links
  - many actress-related FANZA links
- Classification:
  - `REWRITE`
- Future role:
  - evergreen sale hub
- Notes:
  - Do not delete early because the sale-intent URL has value.
  - Rewrite only after evergreen sale hub requirements are defined.

### 1018

- URL: `https://moterist.com/saika-kawakita-6/`
- HTTP status: `200`
- Category: `Helpful information`
- Tag:
  - `Saika Kawakita`
- Title and H1 summary:
  - safer rewritten Saika Kawakita work review page
- CTA summary:
  - individual FANZA work detail confirmation CTA
- CTA text:
  - `Individual FANZA work detail confirmation CTA`
- Classification:
  - `OPEN_REWRITE_OR_MERGE_SOURCE`
- Future role candidates:
  - standalone support page
  - actress hub source
- Notes:
  - Fresh live audit resolved category and title uncertainty.
  - Do not delete or redirect before actress architecture is decided.

## Classification Summary

- `1095`: `KEEP`
- `1106`: `KEEP`
- `994`: `KEEP`
- `954`: `REWRITE`
- `1018`: `OPEN_REWRITE_OR_MERGE_SOURCE`

## Open Decisions

- Whether `1018` remains a standalone support page or becomes an actress hub source
- Final evergreen sale hub structure for `954`
- Final page-type placement for `1095 / 1106 / 994`

## Do Not Touch Yet

- Do not change slug structure on any of the five URLs.
- Do not change `noindex` on any of the five URLs.
- Do not change redirects on any of the five URLs.
- Do not delete `954` early.
- Do not delete or redirect `1018` before actress architecture is decided.

## Next Recommended Phase

1. Re-score these five URLs against the rebuild page-type framework.
2. Decide actress content architecture before finalizing `1018`.
3. Define evergreen sale hub requirements before rewriting `954`.
