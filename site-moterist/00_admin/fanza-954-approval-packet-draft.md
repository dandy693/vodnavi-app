# FANZA 954 Approval Packet Draft

## 1. Purpose

This document is the approval packet draft for `954`.

It exists to bundle the page-scoped production approval request draft and the page-scoped approval log draft for the future reflection of the `954` `Evergreen Sale Hub`.

This is a local draft only. It does not authorize WordPress production edits.

## 2. Target Page Information

- `page_id`: `954`
- `page_type`: `Evergreen Sale Hub`
- `page_role`: `現在のセール確認・公式確認導線`
- intended dominant role:
  - make current sale confirmation the primary route
  - keep the page evergreen and usable year-round
  - route users to official FANZA confirmation without named-campaign drift

Role protection notes:

- do not let the page become a beginner-first page like `1095`
- do not let the page become a benefits-first page like `1106`
- do not let the page become a reassurance-first page like `994`
- do not let the page revert to a seasonal campaign article

## 3. Packet Components Included

This packet draft bundles the following page-specific components:

- production approval request draft
- approval log draft
- page-specific paste unit scope
- page-specific CTA / measurement mapping
- internal-link cluster constraints
- FAQ constraints
- `generic_latest_check_state` default handling
- `active_campaign_state` gating conditions
- stale campaign and copy-safety conditions
- rollback readiness note

Related source files:

- [fanza-954-production-approval-request-draft.md](/C:/Users/Tachi/projects/moterist-ai-affiliate/00_admin/fanza-954-production-approval-request-draft.md)
- [fanza-954-approval-log-draft.md](/C:/Users/Tachi/projects/moterist-ai-affiliate/00_admin/fanza-954-approval-log-draft.md)

## 4. Production Approval Request Draft Summary

The request draft currently defines:

- `954` as `Evergreen Sale Hub`
- current sale confirmation as the primary route
- `954-pu01 / pu02 / pu03 / pu04 / pu06 / pu07 / pu08` as the default in-scope reflection units
- `954-pu05` as a conditional swap-only unit
- `generic_latest_check_state` as the default application path
- `active_campaign_state` as conditional only with official confirmation
- top / mid / end official CTA mapping
- support-only internal routes to `1106 / 994 / 1095`
- `1018` exclusion
- stale campaign / exaggeration / certainty safeguards
- provisional status `HOLD`

## 5. Approval Log Draft Summary

The approval log draft currently records:

- page-level decision as `HOLD`
- remaining live-body residue checks
- paste-unit-level `HOLD` entries
- CTA-level `HOLD` entries
- `fanza_cta_click` confirmation placeholders
- `generic_latest_check_state` default-state confirmation
- `active_campaign_state` eligibility gate
- official confirmation route checks
- stale campaign removal checks
- `1018` exclusion checks
- mobile / desktop confirmation placeholders
- rollback-readiness placeholders

## 6. Current Decision

- current status: `HOLD`

## 7. `HOLD` Reason

Current `HOLD` basis:

- this is still a local packet draft only
- current live body residue review is not yet attached
- final CTA destination confirmation still requires execution-stage human check
- `generic_latest_check_state` is designed, but live default-state confirmation is not yet attached
- `active_campaign_state` cannot be approved without official active-campaign proof
- desktop and mobile rendering checks still require execution-stage human check
- backup reference and named rollback owner are not yet filled in

## 8. Remaining Checks Required For `GO`

To move from `HOLD` to `GO`, confirm:

- the live `954` body contains no conflicting legacy seasonal or campaign-specific copy
- top, mid, and end official CTA destinations are confirmed
- `generic_latest_check_state` remains the default implementation path
- `active_campaign_state` is absent unless official confirmation is attached
- no campaign name, period, or discount figure appears outside the dedicated module
- `fanza_cta_click` mappings are preserved exactly
- desktop hierarchy keeps official CTA primary
- mobile hierarchy keeps official CTA primary
- `1018` remains absent from every routine route
- no stale campaign or exaggeration language remains
- backup reference and rollback owner are recorded

## 9. `NO-GO` Conditions

This packet becomes `NO-GO` if any of the following is true:

- the page reads like `1095`, `1106`, or `994` instead of `954`
- the page reads like a seasonal campaign article instead of an evergreen sale hub
- `generic_latest_check_state` is not the default state
- `active_campaign_state` is used without official confirmation
- campaign names, dates, or discount figures appear outside the module
- internal-link cluster overpowers the official CTA
- `1018` appears in normal routing
- `fanza_cta_click` fields drift from the approved measurement spec
- stale campaign information remains in visible copy
- exaggerated or certainty-based claims remain in the final body

## 10. Paste Units To Reflect

Default in-scope paste units:

- `954-pu01` hero / intro summary
- `954-pu02` H2 evergreen promise section
- `954-pu03` H2 comparison guidance section
- `954-pu04` `generic_latest_check_state` module
- `954-pu06` related-guidance internal-link cluster
- `954-pu07` evergreen FAQ block
- `954-pu08` end-of-page CTA composition

Conditional paste unit:

- `954-pu05` `active_campaign_state` swap module

Default order assumption:

1. `954-pu01`
2. `954-pu02`
3. `954-pu03`
4. `954-pu04`
5. `954-pu06`
6. `954-pu07`
7. `954-pu08`

Conditional rule:

- `954-pu05` may replace `954-pu04` only when active-state conditions are satisfied

## 11. CTA Targets In Scope

Planned CTA set:

- top official current-sale CTA
- mid official current-sale CTA inside the current-campaign module
- end official current-sale CTA
- end internal benefits-support CTA to `1106`
- end internal safety-support CTA to `994`
- inline internal beginner-context CTA to `1095`

Priority rule:

- official FANZA current-sale confirmation remains primary
- internal fallback CTAs remain subordinate

## 12. `fanza_cta_click` Measurement Parameters

Shared event:

- `event_name`: `fanza_cta_click`

Page-level properties:

- `page_type`: `evergreen_sale_hub`
- `page_role`: `commercial_conversion_hub`

Planned CTA mappings:

- top official CTA
  - `placement`: `top`
  - `cta_id`: `evergreen_sale_hub__top__official_current_sale`
  - `link_target`: `official_fanza`
- mid official CTA
  - `placement`: `mid`
  - `cta_id`: `evergreen_sale_hub__mid__official_current_sale`
  - `link_target`: `official_fanza`
- end official CTA
  - `placement`: `end`
  - `cta_id`: `evergreen_sale_hub__end__official_current_sale`
  - `link_target`: `official_fanza`
- end internal benefits support CTA
  - `placement`: `end`
  - `cta_id`: `evergreen_sale_hub__end__internal_benefits_next`
  - `link_target`: `internal_1106`
- end internal safety support CTA
  - `placement`: `end`
  - `cta_id`: `evergreen_sale_hub__end__internal_safety_next`
  - `link_target`: `internal_994`
- inline internal beginner context CTA
  - `placement`: `inline`
  - `cta_id`: `evergreen_sale_hub__inline__internal_beginner_context`
  - `link_target`: `internal_1095`

Packet rule:

- if any mapping drifts without explicit approval, packet status cannot move to `GO`

## 13. Internal-Link Cluster

Planned cluster role:

- support-only next-step routing for users who still need explanation after sale guidance

Planned position:

- late body or end section after the official CTA layer

Planned links:

- `登録メリットを確認してから選ぶ`
- `安全性や使い方も確認しておく`
- `初心者向けガイドから整理する`

Cluster constraints:

- must stay visually weaker than the official CTA
- must not appear above the current-sale CTA layer
- must not turn the page into a beginner page, benefits page, or reassurance page

## 14. FAQ

Planned FAQ scope:

- evergreen sale-checking guidance only

Draft questions:

- `セール情報でまず何を確認すべきですか？`
- `変わりやすい情報はどれですか？`
- `キャンペーンが不明なときはどう見ればよいですか？`

FAQ constraint:

- FAQ must remain method-focused and must not become a stale campaign archive

## 15. `generic_latest_check_state` Handling

Default packet state:

- included
- treated as the standard packet path

Required packet assumptions:

- no named campaign outside the dedicated module
- no campaign period outside the dedicated module
- no discount figure outside the dedicated module
- default CTA label remains `FANZA公式で現在のセール情報を確認する`
- the page still reads correctly with no named campaign present

## 16. `active_campaign_state` Usage Permission

Current packet status:

- not approved by default
- conditional only

Packet rule:

- `active_campaign_state` is not part of the default `GO` path for `954`

## 17. Conditions To Use `active_campaign_state`

All of the following must be true:

1. a campaign is currently active on official FANZA
2. the campaign name is officially verifiable
3. the campaign period is officially verifiable
4. the scope or applicable condition is officially verifiable
5. the module can be updated without leaving old campaign facts elsewhere on the page
6. the active-state CTA still points to official FANZA
7. the evergreen body remains generic and stable after the swap

If any condition is missing:

- remain in or revert to `generic_latest_check_state`

## 18. Official Confirmation Path

Required official-confirmation elements:

- top official CTA
- mid module CTA
- end official CTA
- short note that campaign details can change

Packet rule:

- the page may explain how to check, but final confirmation must always route to official FANZA

## 19. Confirmation That Old Campaign Information Is Not Left Behind

Required packet boundary:

- campaign name may appear only inside `954-pu05` when active
- campaign period may appear only inside `954-pu05` when active
- discount figures may appear only inside `954-pu05` when active
- hero, comparison guidance, FAQ, and end section must remain evergreen

Hard boundary rule:

- no date-bound campaign facts should appear outside the replaceable module

## 20. Stale Campaign Absence Confirmation

Current draft status:

- no campaign name is planned in evergreen body units
- no campaign period is planned in evergreen body units
- no discount figure is planned in evergreen body units
- no expired campaign wording is intentionally retained

Required human confirmation:

- current `954` body must be checked to ensure no old campaign names, periods, discount claims, or seasonal headings remain in kept regions

## 21. `1018` Pending Source Material Exclusion Confirmation

Current draft status:

- excluded from CTA layer
- excluded from inline support paths
- excluded from internal-link cluster
- excluded from FAQ routing
- excluded from end-of-page routing

Packet rule:

- `1018` is not included in normal routing for `954`

## 22. Exaggeration / Certainty Check

Current draft status:

- no guaranteed sale-active wording is intentionally used
- no guaranteed discount wording is intentionally used
- no guaranteed eligibility wording is intentionally used
- no unsupported performance or earning claim is intentionally used

Automatic `NO-GO` triggers:

- `絶対`, `必ず`, `最安` or equivalent unsupported certainty wording
- guaranteed sale-active claims
- guaranteed discount claims
- campaign-specific certainty without official confirmation

## 23. Mobile / Desktop Assumptions

Desktop assumptions:

- top official CTA remains prominent before support routes
- current-campaign module stays isolated in the mid-page area
- internal-link cluster remains visually secondary

Mobile assumptions:

- the top CTA appears early
- the module follows evergreen orientation content without long detours
- active-state emphasis, if ever used, does not turn into a full-page campaign takeover

Required human confirmation:

- actual desktop and mobile rendering must be checked after any future implementation and before final `GO`

## 24. Rollback Readiness

Current draft status:

- rollback trigger logic is defined
- paste unit order is defined
- backup need is explicitly identified
- default-state fallback path is explicitly identified

Missing for `GO`:

- backup reference
- named rollback owner
- live rollback source note

## 25. Human Checks Required Before Any Future Production Reflection

- verify final target page body region mapping
- verify live CTA destinations
- verify visible CTA hierarchy on desktop
- verify visible CTA hierarchy on mobile
- verify `954` remains current-sale confirmation first at top, mid, and end
- verify `generic_latest_check_state` is the default reflected state
- verify `active_campaign_state` is absent unless official confirmation is attached
- verify no old campaign names, dates, or discount figures remain outside the module
- verify `1018` remains excluded from every normal route

## 26. Conditions To Move Forward

- all `HOLD` blockers above are cleared
- page still reads as an evergreen sale hub after final assembly
- current-sale confirmation remains the strongest route at top, mid, and end
- `generic_latest_check_state` remains the default state
- internal support links stay subordinate
- `fanza_cta_click` mapping is validated
- `1018` remains excluded
- no stale campaign or exaggeration issue remains
- rollback readiness is documented

## 27. Suggested `operation-log.md` Summary

Suggested summary line:

- created `954` approval packet draft by bundling the request draft and approval log draft, preserving `generic_latest_check_state` as default, keeping `active_campaign_state` conditional, enforcing official-route and stale-campaign boundaries, and maintaining provisional `HOLD` status pending human confirmation
