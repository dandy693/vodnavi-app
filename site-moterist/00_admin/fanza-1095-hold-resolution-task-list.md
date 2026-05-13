# FANZA 1095 Hold Resolution Task List

## 1. Purpose

This document organizes the remaining tasks required to resolve the current `HOLD` state for page `1095`.

Its goals are:

- separate already confirmed items from unresolved blockers
- prioritize the remaining checks needed before any move beyond `HOLD`
- preserve the role of `1095` as a beginner-first page
- clarify what evidence is required for each unresolved task

This file does not authorize WordPress edits, production reflection, or a final `GO`.

## 2. Target Page Information

- `page_id`: `1095`
- `page_type`: `Beginner Guide`
- `page_role`: `初心者導入・不安低減・登録導線`

Role boundary reminder:

- beginner onboarding remains dominant
- anxiety reduction comes before stronger conversion pressure
- official FANZA guidance remains primary
- `1106 / 994 / 954` remain support routes only

## 3. Current Decision

- current status: `HOLD`

## 4. Confirmed Items

The following items are already confirmed at source-level or public-page level:

- public page responded with `200`
- title / `H1` / `H2` structure is consistent with a beginner guide
- internal support routes to `1106 / 994 / 954` are present
- no `1018`-type route was identified in the inspected public HTML

## 5. Items Keeping `HOLD`

The following items still keep the page at `HOLD`:

- `fanza_cta_click` firing not confirmed
- desktop / mobile visual hierarchy not confirmed
- internal-link cluster visual subordination not confirmed
- FAQ live necessity / redundancy not confirmed
- rollback reference / owner / source note not filled
- strong promo wording such as `90%OFFクーポン` creates role-mixing risk
- even if promo wording works as supplementary reassurance, it remains a weakening candidate on `1095`

## 6. Task Priority Order

Recommended priority:

1. confirm whether strong promo wording breaks the `1095` role
2. confirm `fanza_cta_click` firing / mapping behavior
3. confirm desktop visual hierarchy
4. confirm mobile visual hierarchy
5. confirm internal-link cluster visual subordination
6. confirm FAQ live necessity / redundancy
7. fill rollback reference / owner / source note

## 7. Task Methods

### Task 1: Promo wording role-risk review

- compare current visible promo wording with the intended beginner-first role
- determine whether the wording behaves like a `954` sale hook rather than a `1095` support CTA
- classify the wording as one of:
  - weakening candidate on `1095`
  - `954`-owned sale route
  - removal / replacement candidate

### Task 2: `fanza_cta_click` firing review

- verify that actual click behavior matches the approved measurement spec
- verify event, page type, page role, placement, `cta_id`, and target assumptions

### Task 3: Desktop hierarchy review

- verify that desktop presentation keeps the official CTA primary
- verify that support links and promo blocks do not dominate the page

### Task 4: Mobile hierarchy review

- verify that mobile presentation keeps the official CTA visible and primary
- verify that reading order remains beginner-first

### Task 5: Internal-link cluster visual subordination review

- verify that the support cluster is visually weaker than the official CTA
- verify that support routes do not overtake the page purpose

### Task 6: FAQ necessity / redundancy review

- verify that FAQ provides support value
- verify that FAQ is not a redundant repeat of the body

### Task 7: Rollback readiness completion

- record rollback backup reference
- record rollback owner
- record rollback source note

## 8. Evidence Needed Per Task

### Task 1: Promo wording role-risk review

- visible-copy review note
- route-impact note
- role-boundary judgment note
- keep / weaken / shift / remove decision note

### Task 2: `fanza_cta_click` firing review

- measurement verification note
- mapping confirmation note
- unresolved field note if any

### Task 3: Desktop hierarchy review

- desktop rendering note
- CTA prominence note
- support-link subordination note

### Task 4: Mobile hierarchy review

- mobile rendering note
- reading-order note
- visibility / burying-risk note

### Task 5: Internal-link cluster visual subordination review

- cluster placement note
- CTA-vs-cluster prominence note
- route-subordination note

### Task 6: FAQ necessity / redundancy review

- FAQ usefulness note
- FAQ non-redundancy note
- role-boundary note

### Task 7: Rollback readiness completion

- rollback backup reference
- rollback owner
- rollback source note

## 9. GO Conditions Per Task

### Task 1

- promo wording does not overtake beginner-first orientation
- promo wording does not make the page function like `954`
- if it remains on `1095`, it behaves only as subordinate supplementary information

### Task 2

- firing behavior matches the approved `fanza_cta_click` spec
- no mismatch in event / route mapping

### Task 3

- official CTA is visually primary on desktop
- support links remain subordinate

### Task 4

- official CTA is visually primary on mobile
- beginner-first reading order remains intact

### Task 5

- internal-link cluster is clearly weaker than the main CTA
- cluster does not redefine page intent

### Task 6

- FAQ adds support value
- FAQ does not behave like a redundant or competing route

### Task 7

- rollback backup reference is filled
- rollback owner is filled
- rollback source note is filled

## 10. HOLD Conditions Per Task

### Task 1

- promo wording cannot yet be judged safely
- its visible effect on the `1095` role remains uncertain
- wording may already be creating a strong `今すぐセール` feeling, but the actual dominance is not yet fully judged

### Task 2

- firing implementation cannot yet be confirmed
- mapping proof is still incomplete

### Task 3

- desktop hierarchy is not visually checked

### Task 4

- mobile hierarchy is not visually checked

### Task 5

- cluster subordination is not visually checked

### Task 6

- FAQ necessity remains uncertain

### Task 7

- rollback fields remain empty

## 11. NO-GO Conditions Per Task

### Task 1

- promo wording effectively turns `1095` into a sale-first page
- promo wording causes role drift toward `954`
- promo wording gives a strong `今すぐセール` impression before beginner orientation is complete

### Task 2

- `fanza_cta_click` mapping is inconsistent with the approved spec

### Task 3

- desktop layout makes the support or promo route stronger than the official CTA

### Task 4

- mobile layout buries the official CTA or breaks beginner-first order

### Task 5

- cluster overtakes the official CTA

### Task 6

- FAQ introduces unsupported, stale, or role-breaking content

### Task 7

- rollback cannot be described or assigned at all

## 12. Handling Of `90%OFF`-Type Promo Wording

### Condition To Keep It On `1095`

- wording remains clearly subordinate to beginner guidance
- wording behaves as a minor support reference, not the main hook
- wording does not shift the page from orientation into offer-first behavior
- freshness can be defended or independently confirmed
- if it mainly reduces beginner anxiety, it should still be treated as a weakening candidate rather than a stable main message

### Condition To Push It Toward `954`

- wording becomes the stronger intent-matcher for current deals
- wording is effectively a sale-check route rather than beginner guidance
- sale urgency dominates the page's practical reading flow
- the sale message behaves as the star of the page rather than a support note

### Condition To Consider Removal Or Weakening

- wording is stale
- wording visually overpowers the beginner guide intent
- wording creates role confusion with `954`
- wording pushes the user into deal urgency before orientation
- wording cannot be safely justified even as subordinate supplementary information

## 13. Next Action For `fanza_cta_click`

- prepare a dedicated execution-stage measurement verification step
- verify event and route mapping in the next evidence pass
- keep `HOLD` until firing / payload behavior is actually checked

## 14. Next Action For Mobile / Desktop Review

- run a rendered-layout review step
- verify hierarchy separately for desktop and mobile
- specifically judge CTA priority versus support and promo blocks

## 15. Next Action For Rollback Readiness

- assign rollback owner
- record rollback backup reference
- record rollback source note

## 16. Items To Transfer Back Into Sign-Off Draft

- resolved task list items
- remaining blockers
- promo wording risk judgment
- keep / weaken / `954` shift / removal judgment
- measurement review result
- desktop review result
- mobile review result
- cluster review result
- FAQ review result
- rollback readiness result

## 17. Condition To Move Toward WordPress Pre-Reflection Check

The page may move toward the WordPress pre-reflection check only if:

- all `HOLD` tasks above are resolved or explicitly closed
- no `NO-GO` condition is triggered
- `1095` still clearly functions as a beginner guide
- promo wording no longer creates unresolved role-mixing risk

This document does not authorize direct reflection.

## 18. Suggested `operation-log.md` Entry

Suggested summary:

- created `00_admin/fanza-1095-hold-resolution-task-list.md`
- organized the remaining `1095` blockers into prioritized review tasks
- separated confirmed items from unresolved `HOLD` items
- documented how to handle `90%OFF`-type promo wording relative to `954`
- kept `1095` in `HOLD`
- made no WordPress, SSH, DB, article, taxonomy, redirect, slug, noindex, theme, plugin, media, or `.env` changes
