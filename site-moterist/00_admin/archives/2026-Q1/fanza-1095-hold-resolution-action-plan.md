# FANZA 1095 Hold Resolution Action Plan

## 1. Purpose

This document defines the execution order for the remaining `HOLD` resolution tasks for page `1095`.

Its goals are:

- convert unresolved blockers into a concrete action order
- prioritize checks that can invalidate the page role early
- preserve the role of `1095` as beginner onboarding, anxiety reduction, and registration guidance
- prepare clean re-entry into the sign-off draft after each task

This file does not authorize WordPress edits, production reflection, or a final `GO`.

## 2. Target Page Information

- `page_id`: `1095`
- `page_type`: `Beginner Guide`
- `page_role`: `初心者導入・不安低減・登録導線`

Role boundary reminder:

- beginner-first orientation remains dominant
- anxiety reduction comes before stronger conversion pressure
- official FANZA guidance remains primary
- `1106 / 994 / 954` remain support routes only

## 3. Current Decision

- current status: `HOLD`

## 4. Action-Order Logic

The action order is based on risk concentration:

1. first resolve whether the page is drifting toward a sale-first role
2. then resolve layout and route hierarchy
3. then resolve support-module validity
4. then resolve measurement confirmation
5. finally complete rollback documentation

This order minimizes wasted review effort if an early role-mixing or `NO-GO` issue is found.

## 5. Priority 1: Promo Wording Review

Target:

- `90%OFFクーポン`
- other strong coupon / sale-push wording
- promo blocks that may behave like `954`

Why first:

- this is the most direct role-mixing risk with `954`
- if the page reads like a sale hub, later checks lose value

## 6. Priority 2: Desktop / Mobile Visual Hierarchy Review

Target:

- whether official CTA remains primary
- whether beginner-first order is preserved
- whether promo / support blocks visually overtake the page purpose

Why second:

- even valid copy can fail if layout hierarchy is wrong

## 7. Priority 3: Internal-Link Cluster Visual Subordination Review

Target:

- whether support links remain subordinate to the official CTA
- whether cluster links push the page toward `1106 / 994 / 954`

Why third:

- route priority must be checked after layout-level hierarchy is understood

## 8. Priority 4: FAQ Live Necessity / Redundancy Review

Target:

- whether FAQ adds support value
- whether FAQ duplicates the body
- whether FAQ creates a competing route

Why fourth:

- FAQ is lower risk than promo wording or core CTA hierarchy, but still affects clarity and role purity

## 9. Priority 5: `fanza_cta_click` Firing Review

Target:

- event firing
- field mapping
- placement-to-`cta_id` alignment
- route-to-`link_target` alignment

Why fifth:

- route and hierarchy should be judged before measurement implementation is closed
- this task cannot unlock `GO` by itself if earlier role issues remain

## 10. Priority 6: Rollback Backup Reference / Owner / Source Note Recording

Target:

- `rollback_backup_reference`
- `rollback_owner`
- `rollback_source_note`

Why sixth:

- rollback readiness is required before any move beyond `HOLD`
- it should be completed after the review knows what state is being protected

## 11. Execution Method Per Task

### Task 1: Promo wording review

- inspect the visible promotional wording already identified
- compare it to the approved beginner-first role
- decide whether the wording remains subordinate, should shift toward `954`, or should be weakened / removed later

### Task 2: Desktop / mobile hierarchy review

- inspect rendered desktop and mobile layouts
- compare CTA prominence, promo presence, and support-link order
- verify that the official route remains primary

### Task 3: Internal-link cluster review

- inspect the cluster in the rendered page context
- verify that it remains weaker than the official CTA
- verify that its routes remain support-only

### Task 4: FAQ review

- inspect the FAQ section in context
- determine whether it is useful, redundant, or route-distorting

### Task 5: `fanza_cta_click` review

- verify actual behavior against the measurement spec
- compare event, `page_type`, `page_role`, placement, `cta_id`, and `link_target`

### Task 6: Rollback readiness completion

- record rollback reference
- assign rollback owner
- record rollback source note

## 12. Evidence To Retain Per Task

### Task 1

- promo wording review note
- role-risk note
- keep / move / weaken decision note

### Task 2

- desktop rendering note
- mobile rendering note
- CTA prominence note

### Task 3

- cluster subordination note
- support-route note
- role-boundary note

### Task 4

- FAQ usefulness note
- FAQ redundancy note
- FAQ role-boundary note

### Task 5

- measurement verification note
- field-alignment note
- unresolved mapping note

### Task 6

- rollback backup reference
- rollback owner
- rollback source note

## 13. GO Conditions Per Task

### Task 1

- promo wording does not overtake beginner-first positioning
- promo wording does not turn the page into a sale-first route

### Task 2

- official CTA remains primary on desktop and mobile
- beginner-first reading order remains intact

### Task 3

- internal-link cluster is clearly subordinate
- support routes do not redefine the page

### Task 4

- FAQ adds support value
- FAQ does not behave as redundant or competitive routing

### Task 5

- actual `fanza_cta_click` behavior matches the approved measurement spec

### Task 6

- rollback reference, owner, and source note are all filled

## 14. HOLD Conditions Per Task

### Task 1

- role impact of promo wording remains unclear

### Task 2

- rendered hierarchy cannot yet be conclusively judged

### Task 3

- cluster subordination cannot yet be conclusively judged

### Task 4

- FAQ necessity remains unclear

### Task 5

- firing / payload behavior remains unverified

### Task 6

- rollback fields remain incomplete

## 15. NO-GO Conditions Per Task

### Task 1

- promo wording makes `1095` behave like `954`
- sale urgency overtakes beginner orientation

### Task 2

- layout makes support or promo routes stronger than the official CTA

### Task 3

- cluster overtakes the official CTA

### Task 4

- FAQ introduces stale, unsupported, or role-breaking content

### Task 5

- `fanza_cta_click` mapping is inconsistent with the approved spec

### Task 6

- rollback readiness cannot be defined at all

## 16. Items To Transfer Back Into The Sign-Off Draft

- promo wording decision
- desktop hierarchy result
- mobile hierarchy result
- cluster subordination result
- FAQ necessity / redundancy result
- `fanza_cta_click` verification result
- rollback readiness result
- updated `GO / HOLD / NO-GO` rationale

## 17. Condition To Move Toward WordPress Pre-Reflection Check

Move toward the WordPress pre-reflection check only if:

- all six priority tasks are completed
- no `NO-GO` condition is triggered
- `1095` still clearly functions as a beginner guide
- promo wording no longer creates unresolved role-mixing risk
- measurement behavior is confirmed
- desktop / mobile hierarchy is confirmed
- rollback readiness is complete

This action plan does not authorize production reflection.

## 18. Suggested `operation-log.md` Entry

Suggested summary:

- created `00_admin/fanza-1095-hold-resolution-action-plan.md`
- converted the remaining `HOLD` blockers for `1095` into an execution order
- placed promo wording risk first because it may cause role drift toward `954`
- kept `1095` in `HOLD`
- made no WordPress, SSH, DB, article, taxonomy, redirect, slug, noindex, theme, plugin, media, or `.env` changes
