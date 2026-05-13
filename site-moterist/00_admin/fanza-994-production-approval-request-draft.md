# FANZA 994 Production Approval Request Draft

## 1. Purpose

This document is a draft production approval request for page `994`.

It exists to prepare a page-scoped approval packet for the future reflection of the `994` `Safety / Anxiety Resolution` page only.

This is a local draft only. It does not authorize WordPress production edits.

## 2. Target Page Information

- `page_id`: `994`
- `page_type`: `Safety / Anxiety Resolution`
- `page_role`: `安全性・不安解消・登録導線`
- intended dominant role:
  - reduce hesitation and trust concerns
  - help users understand what to confirm before use
  - move users toward official confirmation immediately after reassurance

Role boundary notes:

- do not let `1095` beginner-entry framing become dominant
- do not let `1106` benefits-first framing replace reassurance-first structure
- do not let `954` sale-confirmation framing overtake the page

## 3. Paste Units To Reflect

Planned in-scope paste units:

- `994-pu01` hero / intro summary
- `994-pu02` H2 concern-surfacing block
- `994-pu03` H2 reassurance block
- `994-pu04` mid primary CTA block
- `994-pu05` H2 official confirmation section
- `994-pu06` end fallback internal-link cluster
- `994-pu07` reassurance FAQ block
- `994-pu08` end-of-page CTA composition

Approved order assumption:

1. `994-pu01`
2. `994-pu02`
3. `994-pu03`
4. `994-pu04`
5. `994-pu05`
6. `994-pu07`
7. `994-pu06`
8. `994-pu08`

Critical order rule:

- `994-pu04` must appear immediately after `994-pu03`

## 4. Paste Units Not To Reflect

At this draft stage, no `994` paste unit is intentionally excluded from the approved `994` page package.

Explicit exclusions outside scope:

- all `1095` paste units
- all `1106` paste units
- all `954` paste units
- any route or content path tied to `1018`

Conditional note:

- if human review finds the FAQ redundant or repetitive, `994-pu07` may move from in-scope to `HOLD`, but this draft keeps it included

## 5. CTA Targets In Scope

Planned tracked CTA set for `994`:

- top low-pressure official text CTA
- mid official CTA
- end official CTA
- end internal sale-support CTA to `954`
- inline internal benefits-context CTA to `1106`

Priority rule:

- official FANZA pre-use confirmation CTA remains primary
- internal fallback CTAs remain subordinate
- sale support remains secondary to trust resolution

## 6. CTA Copy Draft

Top official CTA:

- label:
  - `FANZA公式で利用前の案内を確認する`
- role:
  - low-pressure official confirmation for hesitant users

Mid official CTA:

- heading:
  - `不安が残る前に、利用前の案内を公式で確認する`
- support text:
  - `確認が必要な項目を先に見ておくと、必要以上に迷わず判断できます。`
- label:
  - `FANZA公式で利用前の案内を確認する`

End official / next-step composition:

- final official CTA:
  - `FANZA公式で利用前の案内を確認する`
- secondary CTA:
  - `開催中のセール情報も確認する`
- support text-link CTA:
  - `登録メリットを先に見直す`
- support context CTA:
  - `初心者向けガイドに戻って整理する`

## 7. `fanza_cta_click` Measurement Parameters

Shared event:

- `event_name`: `fanza_cta_click`

Page-level properties:

- `page_type`: `safety_anxiety_resolution`
- `page_role`: `objection_handling`

Planned CTA mappings:

### Top Official CTA

- `placement`: `top`
- `cta_id`: `safety_anxiety_resolution__top__official_pre_use_guidance`
- `link_target`: `official_fanza`

### Mid Official CTA

- `placement`: `mid`
- `cta_id`: `safety_anxiety_resolution__mid__official_pre_use_guidance`
- `link_target`: `official_fanza`

### End Official CTA

- `placement`: `end`
- `cta_id`: `safety_anxiety_resolution__end__official_pre_use_guidance`
- `link_target`: `official_fanza`

### End Internal Sale CTA

- `placement`: `end`
- `cta_id`: `safety_anxiety_resolution__end__internal_sale_next`
- `link_target`: `internal_954`

### Inline Internal Benefits Context CTA

- `placement`: `inline`
- `cta_id`: `safety_anxiety_resolution__inline__internal_reassurance_context`
- `link_target`: `internal_1106`

Measurement rule:

- if any of the above mappings changes without explicit approval, this draft must stay `HOLD`

## 8. Internal-Link Cluster

Planned cluster role:

- support-only next-step routing for users who need more context after reassurance

Planned position:

- late body or end section after the main official CTA layer

Planned links:

- `登録メリットを確認する`
- `現在のセール情報も確認する`
- `初心者向けガイドに戻る`

Cluster constraints:

- must stay visually weaker than the official CTA
- must not appear above the main CTA layer
- must not turn the page into a sale page or beginner page

## 9. FAQ

Planned FAQ scope:

- reassurance and pre-use clarification

Draft questions:

- `利用前に何を確認しておくべきですか？`
- `不安が残る場合はどこを先に見るべきですか？`
- `セール確認はどの段階で見るべきですか？`

FAQ constraint:

- FAQ must support trust resolution and must not become a second conversion route

## 10. `1018` Pending Source Material Exclusion Confirmation

Draft confirmation status:

- top CTA path: excluded
- mid CTA path: excluded
- end CTA composition: excluded
- fallback internal-link cluster: excluded
- FAQ routing: excluded

Draft statement:

- `1018` is not included in normal routing for `994` and must remain excluded unless actress architecture is separately approved later

## 11. Stale Campaign Residue Check

Draft status:

- no `954` campaign-state copy is intentionally imported
- no campaign name is planned
- no campaign period is planned
- no discount figure is planned

Required human confirmation before any future production step:

- current `994` body must be checked to ensure no old sale-driven or stale campaign wording remains in kept regions

## 12. Exaggeration / Certainty Check

Draft pass conditions:

- no `絶対`, `必ず`, `最安` style wording
- no guaranteed safety language
- no guaranteed use-result language
- no guaranteed sale or registration outcome language
- no unsupported earnings or performance phrasing

Draft constraint:

- if any such expression remains in the target body region, status becomes `NO-GO`

## 13. Mobile / Desktop Assumptions

Desktop assumptions:

- reassurance-first explanatory order remains intact
- official CTA remains stronger than fallback routes
- end composition stays compact

Mobile assumptions:

- reassurance block and mid CTA stay close together
- official CTA stack remains clear and primary
- FAQ and final CTA remain clearly separated

Required human confirmation:

- actual desktop and mobile rendering must be checked after any future implementation and before final `GO`

## 14. Rollback Readiness

Draft rollback preparation requirements:

- current `994` body snapshot reference must be created before any future implementation
- approved paste unit order must be attached to the implementation session
- rollback owner must be named in the live request
- rollback trigger must include:
  - role drift into `1095`
  - role drift into `1106`
  - sale-first emphasis before reassurance
  - `1018` routing leakage
  - measurement mismatch

Current draft status:

- structurally ready for rollback planning
- not execution-ready until human operator assigns backup reference and owner

## 15. Provisional `GO / HOLD / NO-GO`

Current provisional status:

- `HOLD`

Reason:

- this is a local draft request only
- live page-level body residue check is not yet attached
- final CTA destination confirmation and rendering confirmation require human execution-stage review

## 16. Items Requiring `HOLD`

- confirm the current public `994` body has no conflicting legacy copy
- confirm final official CTA target URL mapping
- confirm mobile rendering after actual paste-unit reflection in a future approved session
- confirm desktop rendering after actual paste-unit reflection in a future approved session
- confirm approval log entry shell is filled with named reviewer / approver / operator
- confirm backup reference and rollback owner

## 17. Conditions That Trigger `NO-GO`

- `994` reads like a beginner-first page instead of a reassurance-first page
- benefits-first or sale-first framing overtakes trust-reduction framing
- official CTA does not appear immediately after reassurance
- internal-link cluster outranks the official CTA
- `1018` appears in routine routing
- `fanza_cta_click` parameters do not match the approved measurement spec
- stale campaign information appears in `994`
- exaggerated or certainty-based claims remain in the copy

## 18. Human Checks Required Before Any Future Production Reflection

- verify final target page body region mapping
- verify live CTA destinations
- verify visible CTA hierarchy on desktop
- verify visible CTA hierarchy on mobile
- verify the page remains safety / trust first from top through mid CTA
- verify sales support does not overtake reassurance
- verify `1106` benefits framing remains fallback only
- verify `1018` remains excluded from every normal route

## 19. Summary To Transfer Into The Approval Log

Recommended page-level summary:

- `994` remains a safety / anxiety-resolution page
- official pre-use guidance CTA remains primary, with the main handoff immediately after reassurance
- internal routes to `1106 / 954 / 1095` remain support-only
- `1018` is excluded from normal routing
- no intentional stale campaign content is present in the draft
- final status remains `HOLD` until live-body residue, target mapping, and rendering checks are completed

## 20. Suggested `operation-log.md` Summary

Suggested summary line:

- created `994` production approval request draft with reassurance-first role protection, immediate post-reassurance CTA placement, official CTA / `fanza_cta_click` mapping, fallback routing constraints, `1018` exclusion, and provisional `HOLD` status pending human confirmation
