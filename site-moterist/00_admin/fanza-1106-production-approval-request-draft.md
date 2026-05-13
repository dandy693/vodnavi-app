# FANZA 1106 Production Approval Request Draft

## 1. Purpose

This document is a draft production approval request for page `1106`.

It exists to prepare a page-scoped approval packet for the future reflection of the `1106` `Registration / Benefits Guide` only.

This is a local draft only. It does not authorize WordPress production edits.

## 2. Target Page Information

- `page_id`: `1106`
- `page_type`: `Registration / Benefits Guide`
- `page_role`: `登録メリット・特典理解・登録導線`
- intended dominant role:
  - explain why registration or usage may feel worthwhile
  - help users understand value and changeable conditions
  - move interested users toward official confirmation

Role boundary notes:

- do not let `1095` beginner-entry framing become dominant
- do not let `994` reassurance-first structure replace value-comparison framing
- do not let `954` sale-confirmation framing overtake the page

## 3. Paste Units To Reflect

Planned in-scope paste units:

- `1106-pu01` hero / intro summary
- `1106-pu02` H2 benefits explanation
- `1106-pu03` H2 confirmation-points explanation
- `1106-pu04` mid primary CTA block
- `1106-pu05` H2 official-page confirmation section
- `1106-pu06` end fallback internal-link cluster
- `1106-pu07` benefits FAQ block
- `1106-pu08` end-of-page CTA composition

Approved order assumption:

1. `1106-pu01`
2. `1106-pu02`
3. `1106-pu03`
4. `1106-pu04`
5. `1106-pu05`
6. `1106-pu06`
7. `1106-pu07`
8. `1106-pu08`

## 4. Paste Units Not To Reflect

At this draft stage, no `1106` paste unit is intentionally excluded from the approved `1106` page package.

Explicit exclusions outside scope:

- all `1095` paste units
- all `994` paste units
- all `954` paste units
- any route or content path tied to `1018`

Conditional note:

- if human review finds the FAQ redundant or repetitive, `1106-pu07` may move from in-scope to `HOLD`, but this draft keeps it included

## 5. CTA Targets In Scope

Planned tracked CTA set for `1106`:

- top official CTA
- mid official CTA
- end official CTA
- end internal reassurance fallback CTA to `994`
- inline internal beginner-context CTA to `1095`

Priority rule:

- official FANZA confirmation CTA remains primary
- internal fallback CTAs remain subordinate

## 6. CTA Copy Draft

Top official CTA:

- label:
  - `FANZA公式で登録前の案内を確認する`
- role:
  - official value / registration confirmation for consideration-stage users

Mid official CTA:

- heading:
  - `登録前の案内を公式で確認しておく`
- support text:
  - `メリットだけで判断せず、変わりやすい条件は公式ページで確認しておくと安心です。`
- label:
  - `FANZA公式で登録前の案内を確認する`

End official / next-step composition:

- final official CTA:
  - `FANZA公式で登録前の案内を確認する`
- secondary CTA:
  - `安全性や使い方も確認しておく`
- support text-link CTA:
  - `まず初心者向けガイドから確認する`
- inline sale-support CTA:
  - `現在のセールや特典状況も確認する`

## 7. `fanza_cta_click` Measurement Parameters

Shared event:

- `event_name`: `fanza_cta_click`

Page-level properties:

- `page_type`: `registration_benefits_guide`
- `page_role`: `consideration`

Planned CTA mappings:

### Top Official CTA

- `placement`: `top`
- `cta_id`: `registration_benefits_guide__top__official_registration_benefits`
- `link_target`: `official_fanza`

### Mid Official CTA

- `placement`: `mid`
- `cta_id`: `registration_benefits_guide__mid__official_registration_benefits`
- `link_target`: `official_fanza`

### End Official CTA

- `placement`: `end`
- `cta_id`: `registration_benefits_guide__end__official_registration_benefits`
- `link_target`: `official_fanza`

### End Internal Safety CTA

- `placement`: `end`
- `cta_id`: `registration_benefits_guide__end__internal_safety_next`
- `link_target`: `internal_994`

### Inline Internal Beginner Context CTA

- `placement`: `inline`
- `cta_id`: `registration_benefits_guide__inline__internal_beginner_context`
- `link_target`: `internal_1095`

Measurement rule:

- if any of the above mappings changes without explicit approval, this draft must stay `HOLD`

## 8. Internal-Link Cluster

Planned cluster role:

- support-only next-step routing for users who still need reassurance or orientation

Planned position:

- late body or end section after the main official CTA layer

Planned links:

- `安全性や使い方も確認しておく`
- `初心者向けガイドから確認する`
- `現在のセール状況を見る`

Cluster constraints:

- must stay visually weaker than the official CTA
- must not appear above the main CTA layer
- must not turn the page into a beginner page, reassurance page, or sale page

## 9. FAQ

Planned FAQ scope:

- benefits and pre-registration clarification

Draft questions:

- `登録前に何を確認すべきですか？`
- `メリット情報のうち変わりやすいものは何ですか？`
- `不安が残る場合は次にどこを見ればよいですか？`

FAQ constraint:

- FAQ must support consideration-stage understanding and must not become a second conversion route

## 10. `1018` Pending Source Material Exclusion Confirmation

Draft confirmation status:

- top CTA path: excluded
- mid CTA path: excluded
- end CTA composition: excluded
- fallback internal-link cluster: excluded
- FAQ routing: excluded

Draft statement:

- `1018` is not included in normal routing for `1106` and must remain excluded unless actress architecture is separately approved later

## 11. Stale Campaign Residue Check

Draft status:

- no `954` campaign-state copy is intentionally imported
- no campaign name is planned
- no campaign period is planned
- no discount figure is planned

Required human confirmation before any future production step:

- current `1106` body must be checked to ensure no old campaign-driven or stale sale wording remains in kept regions

## 12. Exaggeration / Certainty Check

Draft pass conditions:

- no `絶対`, `必ず`, `最安` style wording
- no guaranteed benefit language
- no guaranteed registration outcome language
- no guaranteed sale or point outcome language
- no unsupported earnings or performance phrasing

Draft constraint:

- if any such expression remains in the target body region, status becomes `NO-GO`

## 13. Mobile / Desktop Assumptions

Desktop assumptions:

- official CTA remains stronger than fallback routes
- benefits-first explanatory order remains intact
- end composition stays compact

Mobile assumptions:

- official CTA stack remains clear and primary
- benefit explanation still precedes stronger action
- FAQ and final CTA remain clearly separated

Required human confirmation:

- actual desktop and mobile rendering must be checked after any future implementation and before final `GO`

## 14. Rollback Readiness

Draft rollback preparation requirements:

- current `1106` body snapshot reference must be created before any future implementation
- approved paste unit order must be attached to the implementation session
- rollback owner must be named in the live request
- rollback trigger must include:
  - role drift into `1095`
  - role drift into `994`
  - CTA priority inversion
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

- confirm the current public `1106` body has no conflicting legacy copy
- confirm final official CTA target URL mapping
- confirm mobile rendering after actual paste-unit reflection in a future approved session
- confirm desktop rendering after actual paste-unit reflection in a future approved session
- confirm approval log entry shell is filled with named reviewer / approver / operator
- confirm backup reference and rollback owner

## 17. Conditions That Trigger `NO-GO`

- `1106` reads like a beginner-first page instead of a benefits-first page
- reassurance-first or sale-first framing overtakes value-comparison framing
- official CTA is not the strongest route
- internal-link cluster outranks the official CTA
- `1018` appears in routine routing
- `fanza_cta_click` parameters do not match the approved measurement spec
- stale campaign information appears in `1106`
- exaggerated or certainty-based claims remain in the copy

## 18. Human Checks Required Before Any Future Production Reflection

- verify final target page body region mapping
- verify live CTA destinations
- verify visible CTA hierarchy on desktop
- verify visible CTA hierarchy on mobile
- verify the page remains benefits / registration-value first
- verify `1095` beginner orientation does not overtake the page
- verify `994` reassurance framing remains fallback only
- verify `1018` remains excluded from every normal route

## 19. Summary To Transfer Into The Approval Log

Recommended page-level summary:

- `1106` remains a registration-benefits / consideration page
- official registration-benefits CTA remains primary at top, mid, and end
- internal fallback routes to `994 / 1095 / 954` remain support-only
- `1018` is excluded from normal routing
- no intentional stale campaign content is present in the draft
- final status remains `HOLD` until live-body residue, target mapping, and rendering checks are completed

## 20. Suggested `operation-log.md` Summary

Suggested summary line:

- created `1106` production approval request draft with benefits-first role protection, official CTA / `fanza_cta_click` mapping, fallback routing constraints, `1018` exclusion, and provisional `HOLD` status pending human confirmation
