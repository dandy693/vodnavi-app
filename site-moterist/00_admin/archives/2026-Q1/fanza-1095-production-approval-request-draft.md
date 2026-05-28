# FANZA 1095 Production Approval Request Draft

## 1. Purpose

This document is a draft production approval request for page `1095`.

It exists to prepare a page-scoped approval packet for the future reflection of the `1095` `Beginner Guide` only.

This is a local draft only. It does not authorize WordPress production edits.

## 2. Target Page Information

- `page_id`: `1095`
- `page_type`: `Beginner Guide`
- `page_role`: `初心者導入・不安低減・登録導線`
- intended dominant role:
  - lower beginner anxiety first
  - explain where to start
  - move users toward official confirmation or the next support page

Role boundary notes:

- do not let `1106` benefits framing become dominant
- do not let `994` reassurance framing replace beginner orientation
- do not let `954` sale-confirmation framing overtake the page

## 3. Paste Units To Reflect

Planned in-scope paste units:

- `1095-pu01` hero / intro summary
- `1095-pu02` H2 first-step orientation
- `1095-pu03` H2 confusion-reduction
- `1095-pu04` mid primary CTA block
- `1095-pu05` H2 official confirmation section
- `1095-pu06` end next-step internal-link cluster
- `1095-pu07` beginner FAQ block
- `1095-pu08` end-of-page CTA composition

Approved order assumption:

1. `1095-pu01`
2. `1095-pu02`
3. `1095-pu03`
4. `1095-pu04`
5. `1095-pu05`
6. `1095-pu06`
7. `1095-pu07`
8. `1095-pu08`

## 4. Paste Units Not To Reflect

At this draft stage, no `1095` paste unit is intentionally excluded from the approved `1095` page package.

Explicit exclusions outside scope:

- all `1106` paste units
- all `994` paste units
- all `954` paste units
- any route or content path tied to `1018`

Conditional note:

- if human review decides the FAQ is redundant, `1095-pu07` may move from in-scope to `HOLD`, but this draft keeps it included

## 5. CTA Targets In Scope

Planned tracked CTA set for `1095`:

- top official CTA
- mid official CTA
- end internal next-step CTA to `1106`
- end internal support CTA to `994`
- inline internal sale-support CTA to `954`

Priority rule:

- official FANZA confirmation CTA remains primary
- internal next-step CTAs remain subordinate

## 6. CTA Copy Draft

Top official CTA:

- label:
  - `FANZA公式で最新情報を確認する`
- role:
  - low-pressure official confirmation for beginners

Mid official CTA:

- heading:
  - `まずはFANZA公式の最新案内を確認する`
- support text:
  - `変わりやすい情報は公式で先に見ておくと、次の判断がしやすくなります。`
- label:
  - `FANZA公式で最新情報を確認する`

End official / next-step composition:

- final official CTA:
  - `FANZA公式で最新情報を確認する`
- secondary CTA:
  - `登録メリットを先に確認する`
- support text-link CTA:
  - `安全性や使い方の不安を先に確認する`
- inline sale-support CTA:
  - `開催中のセール情報を確認したい方はこちら`

## 7. `fanza_cta_click` Measurement Parameters

Shared event:

- `event_name`: `fanza_cta_click`

Page-level properties:

- `page_type`: `beginner_guide`
- `page_role`: `entry`

Planned CTA mappings:

### Top Official CTA

- `placement`: `top`
- `cta_id`: `beginner_guide__top__official_latest_info`
- `link_target`: `official_fanza`

### Mid Official CTA

- `placement`: `mid`
- `cta_id`: `beginner_guide__mid__official_latest_info`
- `link_target`: `official_fanza`

### End Internal Benefits CTA

- `placement`: `end`
- `cta_id`: `beginner_guide__end__internal_benefits_next`
- `link_target`: `internal_1106`

### End Internal Safety CTA

- `placement`: `end`
- `cta_id`: `beginner_guide__end__internal_safety_next`
- `link_target`: `internal_994`

### Inline Internal Sale CTA

- `placement`: `inline`
- `cta_id`: `beginner_guide__inline__internal_sale_next`
- `link_target`: `internal_954`

Measurement rule:

- if any of the above mappings changes without explicit approval, this draft must stay `HOLD`

## 8. Internal-Link Cluster

Planned cluster role:

- support-only next-step routing

Planned position:

- late body or end section after the main official CTA layer

Planned links:

- `登録メリットを確認する`
- `安全性や使い方を確認する`
- `現在のセール情報を確認する`

Cluster constraints:

- must stay visually weaker than the official CTA
- must not appear above the main CTA layer
- must not change the page into a benefits page or sale page

## 9. FAQ

Planned FAQ scope:

- lightweight beginner hesitation handling

Draft questions:

- `FANZAは何から見ればいいですか？`
- `最初に確認しておくべき情報は何ですか？`
- `不安がある場合はどのページを先に見るべきですか？`

FAQ constraint:

- FAQ must support first-step clarity and must not become a second conversion path

## 10. `1018` Pending Source Material Exclusion Confirmation

Draft confirmation status:

- top CTA path: excluded
- mid CTA path: excluded
- end CTA composition: excluded
- fallback internal-link cluster: excluded
- FAQ routing: excluded

Draft statement:

- `1018` is not included in normal routing for `1095` and must remain excluded unless actress architecture is separately approved later

## 11. Stale Campaign Residue Check

Draft status:

- no `954` campaign-state copy is intentionally imported
- no campaign name is planned
- no campaign period is planned
- no discount figure is planned

Required human confirmation before any future production step:

- current `1095` body must be checked to ensure no old sale urgency or stale campaign residue remains

## 12. Exaggeration / Certainty Check

Draft pass conditions:

- no `絶対`, `必ず`, `最安` style wording
- no guaranteed safety language
- no guaranteed benefits language
- no guaranteed sale or registration outcome language
- no unsupported earnings or performance phrasing

Draft constraint:

- if any such expression remains in the target body region, status becomes `NO-GO`

## 13. Mobile / Desktop Assumptions

Desktop assumptions:

- official CTA remains stronger than support routing
- end composition stays compact
- cluster remains secondary

Mobile assumptions:

- primary CTA elements stack vertically
- beginner orientation remains readable before stronger action
- FAQ and end CTA remain clearly separated

Required human confirmation:

- actual desktop and mobile rendering must be checked after any future implementation and before final `GO`

## 14. Rollback Readiness

Draft rollback preparation requirements:

- current `1095` body snapshot reference must be created before any future implementation
- approved paste unit order must be attached to the implementation session
- rollback owner must be named in the live request
- rollback trigger must include:
  - role drift into `1106`
  - misplaced CTA priority
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

- confirm the current public `1095` body has no conflicting legacy copy
- confirm final official CTA target URL mapping
- confirm mobile rendering after actual paste-unit reflection in a future approved session
- confirm desktop rendering after actual paste-unit reflection in a future approved session
- confirm approval log entry shell is filled with named reviewer / approver / operator
- confirm backup reference and rollback owner

## 17. Conditions That Trigger `NO-GO`

- `1095` reads like a benefits-first page instead of a beginner-first page
- strong conversion pressure appears before orientation
- official CTA is not the strongest route
- internal-link cluster outranks the official CTA
- `1018` appears in routine routing
- `fanza_cta_click` parameters do not match the approved measurement spec
- stale campaign information appears in `1095`
- exaggerated or certainty-based claims remain in the copy

## 18. Human Checks Required Before Any Future Production Reflection

- verify final target page body region mapping
- verify live CTA destinations
- verify visible CTA hierarchy on desktop
- verify visible CTA hierarchy on mobile
- verify that the first half of the page lowers anxiety before stronger action
- verify no benefits-heavy `1106` wording overtakes the page
- verify no `994` reassurance block is pasted in a way that changes the page role
- verify `1018` remains excluded from every normal route

## 19. Summary To Transfer Into The Approval Log

Recommended page-level summary:

- `1095` remains a beginner-first entry page
- official latest-info CTA remains primary at top and mid
- internal routes to `1106 / 994 / 954` remain support-only
- `1018` is excluded from normal routing
- no intentional stale campaign content is present in the draft
- final status remains `HOLD` until live-body residue, target mapping, and rendering checks are completed

## 20. Suggested `operation-log.md` Summary

Suggested summary line:

- created `1095` production approval request draft with beginner-first role protection, official CTA / `fanza_cta_click` mapping, fallback routing constraints, `1018` exclusion, and provisional `HOLD` status pending human confirmation
