# FANZA Rebuild Inherited Assets

## Purpose

This file organizes what can be inherited from the Day 3-9 work into the FANZA adult affiliate rebuild phase for `moterist.com`.

This phase is limited to local review, log review, policy design, agent design, and audit preparation.
No WordPress production changes are included here.

## Rebuild Context

- WordPress is retained
- Theme remains `THE THOR`
- Existing information architecture, design tone, and monetization path are treated as provisional
- Short-term KPI is first `FANZA` affiliate link click generation
- Image generation may be used later for worldbuilding or abstract visual direction only
- Product, actress, and work thumbnail replacement is out of scope

## Inherit As-Is

### 1. Operational guardrails

- `00_admin/rules.md`
  - Existing compliance direction around overclaim avoidance, affiliate disclosure, and FANZA link handling remains valid
- `00_admin/risk-checklist.md`
  - Pre-publication checks still apply as a base checklist
- `00_admin/operation-log.md`
  - Historical timeline is necessary for audit traceability

### 2. Inventory and classification assets

- `02_site-audit/article-inventory.csv`
- `02_site-audit/article-inventory-from-xml.csv`
- `02_site-audit/article-risk-title-check.csv`
- `02_site-audit/day4-review-target-30.csv`
- `02_site-audit/day4-ai-review-sheet.csv`
- `02_site-audit/day4-final-decision-sheet.csv`
- `02_site-audit/day3-inventory-summary.md`
- `02_site-audit/day4-final-decision-summary.md`

Reusable value:

- Existing URL and post ID inventory
- Post type, status, category, tag, word count, affiliate link count structure
- Prior `keep / rewrite / merge / noindex_then_rewrite` reasoning
- Priority grouping for high-risk and high-value posts

### 3. Core funnel hypothesis

The following role split is still strategically useful, even if the actual pages are later rebuilt more heavily.

- `1095`: beginner entry
- `1106`: registration / benefit explanation
- `994`: safety / anxiety resolution
- `954`: sales and campaign hub

Source files:

- `02_site-audit/day5-summary.md`
- `02_site-audit/day7-core-articles-plan.md`
- `03_content/briefs/day5-core-article-briefs.md`
- `03_content/briefs/day5-sale-hub-brief.md`

Reusable value:

- Funnel ordering from entry to reassurance to monetization
- Internal link role split
- CTA direction that emphasizes confirmation rather than over-pushing

### 4. Consolidation model for legacy thin posts

Source files:

- `03_content/briefs/day5-actress-summary-priority.md`
- `02_site-audit/day4-final-decision-summary.md`

Reusable value:

- Legacy single-work posts should be evaluated as source material, not as permanent destination pages
- Actress summary, genre summary, and sale hub grouping is still useful
- Deletion should remain deferred until destination design, routing policy, and link value are clarified

### 5. Technical operations knowledge that must be retained

Source files:

- `02_site-audit/day8-completion-summary.md`
- `02_site-audit/day9-service-worker-completion-summary.md`
- `02_site-audit/day9-service-worker-production-implementation-summary.md`
- `02_site-audit/day8-day9-combined-completion-summary.md`
- `02_site-audit/day10-candidate-issues-after-service-worker-fix.md`

Reusable value:

- Browser-side `Service Worker / Cache Storage` can invalidate visual verification
- Verification must distinguish:
  - server HTML state
  - normal browser state
  - `serviceWorkers: 'block'` browser state
- `THE THOR` core file direct edits should be avoided
- `MU plugin` is a preferred low-blast-radius intervention point when PWA behavior must later be handled again

### 6. Existing proof that affiliate-oriented content themes already exist

Examples from the inventory:

- beginner guidance
- registration benefits
- safety / privacy concerns
- sales / campaign intent
- actress / genre review clusters

Reusable value:

- The domain already has FANZA-adjacent topical signals
- Rebuild work can start from existing topical clusters instead of discovering everything from zero

## Inherit With Conditions

### 1. Existing "core article" selection

The selected core articles remain useful as audit anchors, but not as fixed final-page decisions.

Reason:

- The new rebuild is effectively zero-based for site architecture, design, and revenue path
- Existing pages may become:
  - retained pillars
  - partial source material
  - redirect candidates later
  - rewritten support pages

### 2. Existing CTA simplification work

Day 8 link-density cleanup is useful as a UX principle, not as a final destination structure.

Keep:

- avoid crowded tail sections
- align CTA text with landing intent
- keep internal links role-based

Do not blindly inherit:

- exact current CTA wording
- exact current article end structure
- assumption that these three posts stay the top conversion path

### 3. Existing safety handling logic

The `1018` style risk review and "safety first" pattern should be inherited as a workflow.
The specific remediation choices should be re-audited under the new FANZA rebuild policy.

## Rebuild From Scratch

### 1. Site positioning

- overall brand/worldview
- homepage narrative
- page hierarchy for FANZA monetization
- primary user journeys

### 2. Visual system

- typography
- color direction
- mood and atmosphere
- component system
- adult-affiliate-appropriate non-explicit art direction

### 3. Revenue path design

- first-click generation flow
- segmentation by user intent
- content-to-offer mapping by FANZA product type
- link placement standard by page type

### 4. Legacy taxonomy assumptions

Current categories and tags are reference data only.
They should not be treated as approved long-term architecture.

### 5. Legacy article-by-article rewrite queue

The previous queue was appropriate for incremental site repair.
The rebuild needs a portfolio-level decision framework first.

## Files Most Relevant For Immediate Next Audit

- `02_site-audit/article-inventory.csv`
- `02_site-audit/article-inventory-from-xml.csv`
- `02_site-audit/day4-final-decision-sheet.csv`
- `02_site-audit/day8-completion-summary.md`
- `02_site-audit/day9-service-worker-completion-summary.md`
- `02_site-audit/day10-candidate-issues-after-service-worker-fix.md`
- `03_content/briefs/day5-core-article-briefs.md`
- `03_content/briefs/day5-sale-hub-brief.md`
- `03_content/briefs/day5-actress-summary-priority.md`

## Known Gaps

- Some Day 9 logs contain inconsistent wording around whether public Service Worker reflection was confirmed at each point in time
- Current production categories, tags, and noindex state should be re-audited from fresh evidence before any later execution phase
- Existing conversion data, if any, is not consolidated in the reviewed markdown files

## Summary

Inherit:

- inventory
- classification logic
- core funnel hypothesis
- legacy consolidation model
- technical verification lessons
- compliance baseline

Rebuild:

- site architecture
- design system
- monetization path
- page-type framework
- execution permissions and agent workflow
