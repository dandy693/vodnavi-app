# FANZA Page Type Design

## Scope

- Target pages: `1095 / 1106 / 994 / 954 / 1018`
- Phase: local read-only design only
- No production WordPress updates are allowed from this document

## Evidence Status

- `Confirmed`
  - `00_admin/fanza-live-audit.md`
  - `00_admin/fanza-live-audit-urls.csv`
  - `00_admin/fanza-url-disposition-plan.csv`
- `Historical`
  - `00_admin/fanza-current-state-audit.md`
  - `02_site-audit/day7-core-articles-plan.md`
  - `02_site-audit/day8-completion-summary.md`
  - `02_site-audit/day8-day9-combined-completion-summary.md`
  - `02_site-audit/day9-service-worker-completion-summary.md`
- `Open`
  - final title / H2 structure for each rebuilt page
  - final analytics implementation method inside WordPress
  - final actress architecture beyond `1018`

## Design Principles

1. Keep one clear next step per page.
2. Separate intent stages: understand, compare benefits, resolve anxiety, confirm sale, narrow by actress.
3. Preserve current live URLs as planning anchors for now. No slug or redirect decisions are executed in this phase.
4. Use confirmation-oriented CTA wording where facts can drift.
5. Treat `954` as the monetization hub and `1018` as architecture-dependent source material until the actress model is fixed.

## Future Page Type Definitions

### 1095

- future page type: `Beginner Guide`
- role: top-of-funnel entry that explains what FANZA is and how to start evaluating it
- reader state: curious but not yet ready to click
- primary next step: move to `1106` or `994`

### 1106

- future page type: `Registration / Benefits Guide`
- role: mid-funnel bridge from understanding to official confirmation click
- reader state: already interested and comparing whether joining is worth it
- primary next step: official FANZA confirmation CTA

### 994

- future page type: `Safety / Anxiety Resolution`
- role: trust page that removes privacy, billing, and usage anxiety before click
- reader state: interested but hesitant
- primary next step: official FANZA confirmation CTA, then `954` if sale intent exists

### 954

- future page type: `Evergreen Sale Hub`
- role: durable commercial hub for users explicitly looking for current deals, campaigns, and offer timing
- reader state: ready to check offers now
- primary next step: official FANZA sale confirmation CTA

### 1018

- future page type: `Pending Source Material`
- conditional outcomes:
  - `Actress Support Page` if standalone intent is proven
  - `Actress Hub Source` if the site expands around actress hubs
- role today: do not treat it as a pillar; treat it as architecture-dependent material

## Funnel Role Map

| post_id | current classification | future page type | role in funnel | primary CTA direction |
| --- | --- | --- | --- | --- |
| `1095` | `KEEP` | `Beginner Guide` | entry | move to `1106` or official overview confirmation |
| `1106` | `KEEP` | `Registration / Benefits Guide` | consideration | official pre-registration confirmation |
| `994` | `KEEP` | `Safety / Anxiety Resolution` | objection handling | official pre-use confirmation |
| `954` | `REWRITE` | `Evergreen Sale Hub` | commercial conversion hub | official current sale confirmation |
| `1018` | `OPEN_REWRITE_OR_MERGE_SOURCE` | `Pending Source Material` | architecture-dependent support | work detail confirmation or future actress hub |

## Page-Level Direction

### 1095

- primary user intent: understand what FANZA is before acting
- secondary user intent: know where to go next without overload
- CTA policy:
  - primary: official latest-information confirmation CTA
  - secondary: internal move to `1106`
- internal link policy:
  - keep: `1106`, `994`, `954`
  - add later: homepage or FANZA top-level navigation hub if created
- rewrite level: moderate structural rebuild later, not emergency
- design needs:
  - clean beginner-oriented information blocks
  - visible path split: benefits, safety, sales
  - low visual noise at page end

### 1106

- primary user intent: decide whether registration or use is worth it
- secondary user intent: compare benefits without overclaiming
- CTA policy:
  - primary: official registration / benefits confirmation CTA
  - secondary: internal move to `994`
- internal link policy:
  - keep: `1095`, `994`, `954`
  - add later: category-level comparison or offer-format guide if created
- rewrite level: moderate
- design needs:
  - benefit cards with compliance-safe language
  - single high-clarity CTA zone
  - concise FAQ for drift-prone claims

### 994

- primary user intent: resolve safety, privacy, and billing anxiety
- secondary user intent: find the next low-risk step
- CTA policy:
  - primary: official pre-use guidance confirmation CTA
  - secondary: move to `954` when explicit sale intent appears
- internal link policy:
  - keep: `1095`, `1106`, `954`
  - add later: FAQ or policy support page if safety cluster expands
- rewrite level: moderate to strong because future FAQ structure will likely expand
- design needs:
  - reassurance layout
  - FAQ / checklist modules
  - stronger distinction between facts and examples

### 954

- primary user intent: check current sale or campaign status
- secondary user intent: jump from generic curiosity into active offer confirmation
- CTA policy:
  - primary: official current sale confirmation CTA
  - secondary: internal move to `1106` or `994` if user still needs context
- internal link policy:
  - keep or restore from live network: `1095`, `1106`, `994`
  - add later: genre hub, actress hub, format guide once they exist
- rewrite level: full
- design needs:
  - modular update area
  - evergreen lead copy
  - dated update blocks that can be swapped without rewriting the full page

### 1018

- primary user intent: confirm whether a specific actress or work is worth checking
- secondary user intent: branch into broader actress exploration
- CTA policy:
  - if standalone: official work detail confirmation CTA
  - if merged: actress hub CTA takes priority and direct work CTA becomes secondary
- internal link policy:
  - keep today: category archive and `河北彩伽` tag/archive evidence only
  - add later: actress hub, neighboring actress support pages, sale hub if relevant
- rewrite level: conditional
- design needs:
  - if standalone, stronger support framing and safer metadata
  - if merged, reuse only salvageable summary content and strip thin-post behavior

## Cross-Page Internal Linking Rules

1. `1095` should feed `1106` and `994` first, then allow `954` as a commercial branch.
2. `1106` should keep `1095` as backfill context and `994` as reassurance backup.
3. `994` should keep `1106` and `954` as next steps after anxiety resolution.
4. `954` should link back into `1095 / 1106 / 994` for users who still need trust or benefit context.
5. `1018` should not become a major node until actress architecture is chosen.

## Tracking Direction

- Minimum shared tracking needs:
  - primary CTA click
  - secondary CTA click
  - internal link click to next funnel stage
  - page-type label in analytics
- Additional priority:
  - distinguish clicks from `954` versus the three pillar pages
  - distinguish `1018` standalone work-detail clicks from future actress-hub clicks

## Open Questions For Design Phase

- Whether a homepage or dedicated FANZA top hub will exist above `1095`
- Whether `1106` should stay independent or become a spoke under a broader onboarding guide
- How much FAQ weight belongs in `994` versus a separate support layer
- Whether the first actress architecture should be tag-driven, page-driven, or mixed
- Whether `954` will show one current campaign block or multiple offer-format blocks
