# FANZA Current State Audit

## Audit Metadata

- Audit date: 2026-05-08
- Auditor: Codex
- Scope: `1095 / 1106 / 994 / 954 / 1018`
- Evidence type: local repository files and historical logs only
- Phase: FANZA rebuild current-state audit

## Source Classification

- Confirmed from local repository:
  - `02_site-audit/article-inventory-from-xml.csv`
  - `02_site-audit/day4-final-decision-sheet.csv`
  - `02_site-audit/day6-post-1018-completion-summary.md`
  - `02_site-audit/day7-post-1095-completion-summary.md`
  - `02_site-audit/day7-post-1106-completion-summary.md`
  - `02_site-audit/day7-post-994-completion-summary.md`
  - `02_site-audit/day7-core-articles-internal-link-production-result.md`
  - `02_site-audit/day8-core-articles-cta-link-density-fix-proposal.md`
  - `02_site-audit/day8-completion-summary.md`
  - `02_site-audit/day9-service-worker-completion-summary.md`
  - `02_site-audit/day9-service-worker-production-implementation-summary.md`
- Historical from prior logs:
  - Day 6-9 production-update and verification summaries
  - Day 4 classification and Day 5 briefs
- Requires fresh confirmation:
  - current production category / tag state for `1018`
  - current public CTA destinations for all 5 URLs
  - current `noindex` state from fresh production evidence
  - current Service Worker side effects in a live browser session

## Site-Wide Baseline

### Environment

- CMS: WordPress
- Theme: `THE THOR`
- Child theme status: not confirmed in this audit
- PWA / Service Worker notes:
  - Day 8-9 logs show historical cache-related verification risk
  - future production checks must compare normal browser and Service Worker-blocked states
- Known technical caveats:
  - `1095` historically had cache-related verification ambiguity
  - Day 9 logs should be treated as historical proof, not fresh confirmation

### Business Objective Check

- Primary monetization focus: FANZA affiliate click generation
- Short-term KPI: first intentional FANZA link clicks
- Primary page types expected:
  - beginner pillar
  - safety pillar
  - signup / benefits page
  - sale hub
  - actress / genre hubs

## Article Audit

### 1095

- post_id: `1095`
- title: `【初心者向け】FANZAってどんなサイト？アダルトコンテンツ以外の魅力も紹介！`
- slug: `fanza20250329`
- url: `https://moterist.com/fanza20250329/`
- status: `publish`
- category: `お役立ち情報`
- tag: none in reviewed inventory
- current role:
  - historical beginner-entry article
  - prior logs treat it as one of the three core FANZA assets
- existing CTA:
  - historical logs indicate CTA exists and was checked
  - CTA wording later became a design-review target because destination granularity may not match wording
- internal link state:
  - links to `1106` and `994` were historically added
  - link to `954` remained future work at the Day 7 internal-link stage
- past handling in logs:
  - Day 4: `keep`
  - Day 5: core beginner asset
  - Day 7: rewritten and published
  - Day 8-9: used as a verification target in cache-related checks
- FANZA monetization relevance:
  - high
  - strongest top-of-funnel fit among reviewed posts
- conversion-path reuse potential:
  - high
  - good candidate to route users toward `1106`, `994`, and sale or recommendation pages
- reasons to keep:
  - existing FANZA topic match
  - likely URL and internal-link value
  - strong beginner-intent role
- reasons to rebuild:
  - current slug is date-like and not ideal as long-term IA, though no change is allowed now
  - CTA wording and page structure were optimized for the prior repair phase, not the new zero-based rebuild
- reasons not to rush delete / noindex:
  - prior logs treat it as a core asset, not a liability
  - likely retains both topical and internal-link value
- provisional decision: `KEEP`
- next review checks:
  - confirm current CTA destination and wording alignment
  - confirm whether `954` should remain a direct linked next step
  - confirm present noindex and cache behavior from fresh evidence

### 1106

- post_id: `1106`
- title: `FANZAに入会するメリットとは？無料コンテンツからお得な特典まで徹底解説`
- slug: `fanza20250331`
- url: `https://moterist.com/fanza20250331/`
- status: `publish`
- category: `お役立ち情報`
- tag: none in reviewed inventory
- current role:
  - historical signup / benefit explanation page
  - mid-funnel article close to conversion intent
- existing CTA:
  - historical logs confirm CTA exists and was reviewed
  - Day 8 cleanup reduced end-of-article density and adjusted CTA wording
- internal link state:
  - historical links to `1095` and `994`
  - historical link to `954` was intentionally not added in the Day 7 internal-link pass
- past handling in logs:
  - Day 4: `keep`
  - Day 5: core mid-funnel asset
  - Day 7: rewritten and published
  - Day 8: CTA density reduced
  - Day 9: verification target for Service Worker issue
- FANZA monetization relevance:
  - high
  - closest of the five to click-generation intent
- conversion-path reuse potential:
  - high
  - usable as a bridge from beginner understanding to official-page click
- reasons to keep:
  - direct FANZA intent match
  - prior optimization already shaped it toward conversion support
- reasons to rebuild:
  - end-of-article flow may still need rework under the new page-type framework
  - current URL naming and article framing look campaign-date-era rather than durable architecture
- reasons not to rush delete / noindex:
  - historical logs show no safety issue
  - likely useful live FANZA intent asset
- provisional decision: `KEEP`
- next review checks:
  - confirm current CTA destination is still appropriate for the promise made
  - re-evaluate if this remains a standalone page or becomes a spoke under a broader pillar
  - fresh mobile UX check after future architecture decisions

### 994

- post_id: `994`
- title: `FANZAの安全な使い方と注意点：初心者が押さえておきたいポイント`
- slug: `fanza_otoku250114`
- url: `https://moterist.com/fanza_otoku250114/`
- status: `publish`
- category: `お役立ち情報`
- tag: none in reviewed inventory
- current role:
  - historical safety / reassurance page
  - anxiety-resolution support for beginner and conversion-adjacent users
- existing CTA:
  - historical logs confirm CTA exists and was reviewed
  - Day 8 cleanup reduced end-of-article density and narrowed wording
- internal link state:
  - historical links to `1095` and `1106`
  - historical link to `954` planned but not yet inserted in the Day 7 internal-link result
- past handling in logs:
  - Day 4: `keep`
  - Day 5: core trust asset
  - Day 7: rewritten and published
  - Day 8: CTA density reduced
  - Day 9: verification target for Service Worker issue
- FANZA monetization relevance:
  - high
  - indirect but important for trust-building before clicks
- conversion-path reuse potential:
  - high
  - useful for safety objections and privacy concerns
- reasons to keep:
  - differentiates the site from pure promotional pages
  - fits reassurance stage well
- reasons to rebuild:
  - current slug implies `otoku` and a date-like suffix, which may not fit the future IA
  - may need broader FAQ and privacy structure once the rebuild page system is decided
- reasons not to rush delete / noindex:
  - no historical evidence of direct policy risk after rewrite
  - likely useful for trust, SEO, and internal navigation
- provisional decision: `KEEP`
- next review checks:
  - validate whether the present URL and title still match the future safety-pillar role
  - confirm current CTA destination is still context-appropriate
  - confirm fresh live noindex and meta state

### 954

- post_id: `954`
- title: `FANZA動画の超豪華キャンペーンがスタート！歳末＆新春をもっと楽しく過ごそう`
- slug: `fanzaotoku`
- url: `https://moterist.com/fanzaotoku/`
- status: `publish`
- category: `お役立ち情報`
- tag: none in reviewed inventory
- current role:
  - historical seasonal sale article
  - intended future sale hub
- existing CTA:
  - likely present based on affiliate-link count and use as a sale-intent page
  - current exact CTA state is not confirmed in the reviewed files
- internal link state:
  - planned destination from `1095 / 1106 / 994`
  - not yet confirmed as actually linked from those pages in the reviewed Day 7 production-result log
- past handling in logs:
  - Day 4: `rewrite`
  - Day 5: designated as evergreen sale-hub candidate
  - later docs keep referring to it as the sale-hub destination rather than a finished rebuilt asset
- FANZA monetization relevance:
  - high
  - closest thematic fit for sale / campaign click intent
- conversion-path reuse potential:
  - high, but only after content is rebuilt away from seasonal language
- reasons to keep:
  - slug is cleaner than the date-like URLs among the other four
  - strong sale-intent relevance
- reasons to rebuild:
  - current title is season-bound and likely stale
  - current article concept is not evergreen enough for the intended role
- reasons not to rush delete / noindex:
  - retains strong thematic and possible URL value for sale intent
  - likely better reused as a durable sale hub than retired immediately
- provisional decision: `REWRITE`
- next review checks:
  - inspect current live article freshness and CTA structure
  - confirm whether the existing slug should be preserved as the long-term sale hub URL
  - define how this page links back to beginner, benefits, and safety assets

### 1018

- post_id: `1018`
- title:
  - inventory snapshot: `こんな女子高生にせまられたら全てを捨てて駆け落ちしちゃうかも！？`
  - Day 6 completion logs indicate this title was historically replaced with safer wording
- slug: `saika-kawakita-6`
- url: `https://moterist.com/saika-kawakita-6/`
- status: `publish`
- category:
  - inventory snapshot: `美少女`
  - Day 6 completion logs: changed from `美少女` to `お役立ち情報`
  - present live state: `Open`
- tag:
  - inventory snapshot: `河北彩伽`
  - Day 6 completion logs indicate tag was kept
- current role:
  - legacy actress-specific page
  - historically treated as a safety-risk article requiring remediation
- existing CTA:
  - Day 6 logs indicate CTA links were present and checked
  - affiliate-link density is high relative to short content length
- internal link state:
  - future merge target into a `河北彩伽` summary page was noted
  - no strong evidence in the reviewed files that it became a mature internal-link node
- past handling in logs:
  - Day 4: `noindex_then_rewrite`
  - Day 5: top safety priority
  - Day 6: rewritten historically, category changed historically, public verification recorded
- FANZA monetization relevance:
  - medium
  - direct FANZA adjacency exists, but page role is weaker than pillar or sale pages
- conversion-path reuse potential:
  - limited as a standalone page
  - stronger as source material for an actress hub
- reasons to keep:
  - actress / work cluster source material
  - possible residual URL or internal-link value
- reasons to rebuild:
  - historically high compliance risk
  - thin content profile
  - likely poor long-term fit as a standalone monetization page
- reasons not to rush delete / noindex:
  - current live state is not freshly confirmed in this audit
  - user instruction explicitly avoids immediate deletion or noindex changes
  - safer to re-audit first, then decide disposition with evidence
- provisional decision: `PENDING`
- next review checks:
  - fresh confirmation of current live title, category, tags, and noindex state
  - whether it should become `MERGE` into an actress hub or `REWRITE` as support content
  - whether any residual risk language still exists outside the main body

## Category, Tag, And URL Structure Notes

- `1095 / 1106 / 994 / 954` are historically under `お役立ち情報`
- `1018` has evidence conflict between old inventory and Day 6 completion logs
- current tag usage appears sparse on the core FANZA pages and single-tagged on `1018`
- URL structure is mixed:
  - `fanza20250329`
  - `fanza20250331`
  - `fanza_otoku250114`
  - `fanzaotoku`
  - `saika-kawakita-6`
- conclusion:
  - present URLs should be treated as inherited assets, not approved final architecture
  - no slug changes should be planned until URL value is audited more deeply

## Service Worker / Cache Storage Notes

- Day 8-9 logs show that historical verification of `1095 / 1106 / 994` was affected by cache behavior
- any future live QA on those pages must record:
  - normal browser result
  - Service Worker-blocked result
  - whether stale HTML risk is observed
- do not use historical visual confirmation alone as proof of current state

## Provisional Classification Summary

- `1095`: `KEEP`
- `1106`: `KEEP`
- `994`: `KEEP`
- `954`: `REWRITE`
- `1018`: `PENDING`

## Immediate Non-Actions

- do not delete any of the five URLs
- do not change noindex on any of the five URLs
- do not alter category or tag assignments based on this audit alone
- do not alter slugs based on date-like naming alone

## Recommended Next Actions

1. Perform a fresh live audit of the five URLs using the cache-aware verification protocol
2. Confirm current category / tag / noindex state, especially for `1018`
3. Re-score `1095 / 1106 / 994 / 954` against the future page-type framework before any rewrite execution phase
