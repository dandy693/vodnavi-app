# FANZA 954 Production Approval Request Draft

## 1. Purpose

This document is a draft production approval request for page `954`.

It exists to prepare a page-scoped approval packet for the future reflection of the `954` `Evergreen Sale Hub` only.

This is a local draft only. It does not authorize WordPress production edits.

## 2. Target Page Information

- `page_id`: `954`
- `page_type`: `Evergreen Sale Hub`
- `page_role`: `現在のセール確認・公式確認導線`
- intended dominant role:
  - help users confirm current sale information safely
  - keep the page readable as an evergreen hub year-round
  - route users to official FANZA confirmation as the main action

Role boundary notes:

- do not let `1095` beginner-entry framing become dominant
- do not let `1106` benefits-first framing overtake the page
- do not let `994` reassurance-first framing replace sale-confirmation intent
- do not turn the page back into a named seasonal campaign article

## 3. Paste Units To Reflect

Planned in-scope paste units:

- `954-pu01` hero / intro summary
- `954-pu02` H2 evergreen promise section
- `954-pu03` H2 comparison guidance section
- `954-pu04` `generic_latest_check_state` module
- `954-pu06` related-guidance internal-link cluster
- `954-pu07` evergreen FAQ block
- `954-pu08` end-of-page CTA composition

Conditional in-scope paste unit:

- `954-pu05` `active_campaign_state` swap module

Approved default order assumption:

1. `954-pu01`
2. `954-pu02`
3. `954-pu03`
4. `954-pu04`
5. `954-pu06`
6. `954-pu07`
7. `954-pu08`

Conditional swap rule:

- `954-pu05` may replace `954-pu04` only when a currently active campaign is officially confirmed

## 4. Paste Units Not To Reflect

Default exclusions at this draft stage:

- `954-pu05` is excluded unless active-campaign confirmation requirements are satisfied
- all `1095` paste units
- all `1106` paste units
- all `994` paste units
- any route or content path tied to `1018`

Hard exclusion rule:

- expired campaign detail must not be pasted into evergreen body units

## 5. CTA Targets In Scope

Planned tracked CTA set for `954`:

- top official current-sale CTA
- mid official current-sale CTA inside the current-campaign module
- end official current-sale CTA
- end internal benefits-support CTA to `1106`
- end internal safety-support CTA to `994`
- inline internal beginner-context CTA to `1095`

Priority rule:

- official FANZA current-sale confirmation remains primary
- internal fallback CTAs remain subordinate
- campaign-specific emphasis, if used, stays inside the replaceable module only

## 6. CTA Copy Draft

Top official CTA:

- label:
  - `FANZA公式で現在のセール情報を確認する`
- role:
  - broad official confirmation entry for sale-intent users

Mid official CTA in default module:

- heading:
  - `現在のセール状況を公式で確認する`
- support text:
  - `このページは見方の整理用です。開催状況や条件の最終確認は公式ページで行います。`
- label:
  - `FANZA公式で現在のセール情報を確認する`

Conditional active-state CTA:

- heading:
  - `開催中キャンペーンを公式で確認する`
- support text:
  - `開催状況や対象条件は変わる場合があるため、概要だけを示し、最終確認は公式ページへ誘導します。`
- label:
  - `FANZA公式で開催中キャンペーンを確認する`

End official / next-step composition:

- final official CTA:
  - `FANZA公式で現在のセール情報を確認する`
- secondary CTA:
  - `登録メリットを確認してから選ぶ`
- support text-link CTA:
  - `安全性や使い方も確認しておく`
- support context CTA:
  - `初心者向けガイドから整理する`

## 7. `fanza_cta_click` Measurement Parameters

Shared event:

- `event_name`: `fanza_cta_click`

Page-level properties:

- `page_type`: `evergreen_sale_hub`
- `page_role`: `commercial_conversion_hub`

Planned CTA mappings:

### Top Official Current-Sale CTA

- `placement`: `top`
- `cta_id`: `evergreen_sale_hub__top__official_current_sale`
- `link_target`: `official_fanza`

### Mid Official Current-Sale CTA

- `placement`: `mid`
- `cta_id`: `evergreen_sale_hub__mid__official_current_sale`
- `link_target`: `official_fanza`

### End Official Current-Sale CTA

- `placement`: `end`
- `cta_id`: `evergreen_sale_hub__end__official_current_sale`
- `link_target`: `official_fanza`

### End Internal Benefits Support CTA

- `placement`: `end`
- `cta_id`: `evergreen_sale_hub__end__internal_benefits_next`
- `link_target`: `internal_1106`

### End Internal Safety Support CTA

- `placement`: `end`
- `cta_id`: `evergreen_sale_hub__end__internal_safety_next`
- `link_target`: `internal_994`

### Inline Internal Beginner Context CTA

- `placement`: `inline`
- `cta_id`: `evergreen_sale_hub__inline__internal_beginner_context`
- `link_target`: `internal_1095`

Measurement rule:

- if any of the above mappings changes without explicit approval, this draft must stay `HOLD`

## 8. Internal-Link Cluster

Planned cluster role:

- support-only next-step routing for users who still need context after checking sale guidance

Planned position:

- late body or end section after the main official CTA layer

Planned links:

- `登録メリットを確認してから選ぶ`
- `安全性や使い方も確認しておく`
- `初心者向けガイドから整理する`

Cluster constraints:

- must stay visually weaker than the official CTA
- must not appear above the current-sale CTA layer
- must not turn the page into a beginner page, benefits page, or reassurance page

## 9. FAQ

Planned FAQ scope:

- evergreen sale-checking guidance

Draft questions:

- `セール情報でまず何を確認すべきですか？`
- `変わりやすい情報はどれですか？`
- `キャンペーンが不明なときはどう見ればよいですか？`

FAQ constraint:

- FAQ must stay method-focused and must not become a stale campaign archive

## 10. `generic_latest_check_state` Application Contents

Default application status:

- included
- this is the standard request path for `954`

Planned module contents:

- heading:
  - `現在のセール情報を公式で確認する`
- status:
  - `最新情報を確認`
- summary:
  - `開催中の内容は時期によって変わるため、このブロックでは公式で確認したいポイントをまとめています。`
- support line:
  - `名称や期間がはっきりしない場合は、個別のキャンペーン名よりも最新案内の確認を優先します。`
- caution line:
  - `割引内容や対象条件は変わることがあるため、最終的には公式ページで確認してください。`
- CTA:
  - `FANZA公式で現在のセール情報を確認する`

Default-state rule:

- if campaign certainty is weak or absent, remain in `generic_latest_check_state`

## 11. `active_campaign_state` Usage Permission

Current draft permission:

- not approved by default
- treated as conditional only

Draft status:

- `HOLD` unless official active-campaign confirmation is attached

Usage rule:

- `active_campaign_state` is not the baseline request path for `954`

## 12. Conditions To Use `active_campaign_state`

All of the following must be true:

1. a campaign is currently active on official FANZA
2. the campaign name is officially verifiable
3. the campaign period is officially verifiable
4. the scope or applicable condition is officially verifiable
5. the module can be updated without leaving old campaign facts elsewhere on the page
6. the active-state CTA still points to official FANZA
7. the evergreen body remains generic and stable after the swap

If any condition is missing:

- revert to or stay in `generic_latest_check_state`

## 13. Official Confirmation Path

Required official-confirmation elements:

- top official CTA
- mid module CTA
- end official CTA
- short note that campaign details can change

Draft rule:

- the page may summarize how to check, but the final confirmation route must always be official FANZA

## 14. Confirmation That Old Campaign Information Is Not Left Behind

Draft requirement:

- campaign name must appear only inside `954-pu05` when active
- campaign period must appear only inside `954-pu05` when active
- discount figures must appear only inside `954-pu05` when active
- hero, comparison guidance, FAQ, and end section must remain evergreen

Hard boundary rule:

- no date-bound campaign facts should appear outside the replaceable module

## 15. Stale Campaign Residue Check

Draft status:

- no campaign name is planned in evergreen body units
- no campaign period is planned in evergreen body units
- no discount figure is planned in evergreen body units
- no expired campaign wording is intentionally retained

Required human confirmation before any future production step:

- current `954` body must be checked to ensure no old campaign names, periods, discount claims, or seasonal headings remain in kept regions

## 16. `1018` Pending Source Material Exclusion Confirmation

Draft confirmation status:

- top CTA path: excluded
- mid module path: excluded
- end CTA composition: excluded
- fallback internal-link cluster: excluded
- FAQ routing: excluded

Draft statement:

- `1018` is not included in normal routing for `954` and must remain excluded unless actress architecture is separately approved later

## 17. Exaggeration / Certainty Check

Draft pass conditions:

- no `絶対`, `必ず`, `最安` style wording
- no guaranteed sale-active wording
- no guaranteed discount wording
- no guaranteed eligibility wording
- no unsupported earnings or performance phrasing

Draft constraint:

- if any such expression remains in the target body region, status becomes `NO-GO`

## 18. Mobile / Desktop Assumptions

Desktop assumptions:

- top official CTA remains prominent before support routes
- current-campaign module stays isolated in the mid-page area
- internal-link cluster remains visually secondary

Mobile assumptions:

- the top CTA appears early
- the module follows evergreen orientation content without long detours
- active-state emphasis, if used, does not turn into a full-page campaign takeover

Required human confirmation:

- actual desktop and mobile rendering must be checked after any future implementation and before final `GO`

## 19. Rollback Readiness

Draft rollback preparation requirements:

- current `954` body snapshot reference must be created before any future implementation
- approved paste unit order must be attached to the implementation session
- rollback owner must be named in the live request
- rollback trigger must include:
  - role drift into seasonal campaign-article structure
  - `active_campaign_state` used without official confirmation
  - stale campaign facts remaining outside the module
  - `1018` routing leakage
  - measurement mismatch

Current draft status:

- structurally ready for rollback planning
- not execution-ready until human operator assigns backup reference and owner

## 20. Provisional `GO / HOLD / NO-GO`

Current provisional status:

- `HOLD`

Reason:

- this is a local draft request only
- `generic_latest_check_state` is designed, but live residue review is not yet attached
- `active_campaign_state` requires official confirmation before it can be considered usable
- final CTA destination confirmation and rendering confirmation require human execution-stage review

## 21. Items Requiring `HOLD`

- confirm the current public `954` body has no conflicting seasonal or stale campaign copy
- confirm final official CTA target URL mapping
- confirm whether `active_campaign_state` remains disallowed or is officially justified
- confirm mobile rendering after actual paste-unit reflection in a future approved session
- confirm desktop rendering after actual paste-unit reflection in a future approved session
- confirm approval log entry shell is filled with named reviewer / approver / operator
- confirm backup reference and rollback owner

## 22. Conditions That Trigger `NO-GO`

- `954` reads like a named seasonal campaign article instead of an evergreen sale hub
- `generic_latest_check_state` is not the default state
- `active_campaign_state` is used without official confirmation
- campaign names, dates, or discount figures appear outside the dedicated module
- internal-link cluster outranks the official CTA
- `1018` appears in routine routing
- `fanza_cta_click` parameters do not match the approved measurement spec
- stale campaign information remains visible
- exaggerated or certainty-based claims remain in the copy

## 23. Human Checks Required Before Any Future Production Reflection

- verify final target page body region mapping
- verify live CTA destinations
- verify visible CTA hierarchy on desktop
- verify visible CTA hierarchy on mobile
- verify `954` remains current-sale confirmation first at top, mid, and end
- verify `generic_latest_check_state` is the default reflected state
- verify `active_campaign_state` is absent unless official confirmation is attached
- verify no old campaign names, dates, or discount figures remain outside the module
- verify `1018` remains excluded from every normal route

## 24. Summary To Transfer Into The Approval Log

Recommended page-level summary:

- `954` remains an evergreen sale hub, not a seasonal campaign article
- official current-sale confirmation CTA remains primary at top, mid, and end
- `generic_latest_check_state` is the default request path
- `active_campaign_state` remains conditional on official confirmation only
- internal fallback routes to `1106 / 994 / 1095` remain support-only
- `1018` is excluded from normal routing
- no intentional stale campaign content is present in the draft
- final status remains `HOLD` until live-body residue, target mapping, state eligibility, and rendering checks are completed

## 25. Suggested `operation-log.md` Summary

Suggested summary line:

- created `954` production approval request draft with evergreen-sale-hub role protection, `generic_latest_check_state` default handling, conditional `active_campaign_state` gating, official CTA / `fanza_cta_click` mapping, stale-campaign exclusion rules, `1018` exclusion, and provisional `HOLD` status pending human confirmation
