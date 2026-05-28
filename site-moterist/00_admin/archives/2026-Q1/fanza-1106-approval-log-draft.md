# FANZA 1106 Approval Log Draft

## 1. Purpose

This document is the page-specific approval log draft for `1106`.

It exists to record the current review status of the `1106` `Registration / Benefits Guide` approval packet before any future production reflection is considered.

This is a local draft only. It does not authorize production edits.

## 2. Target Page Information

- `page_id`: `1106`
- `page_type`: `Registration / Benefits Guide`
- `page_role`: `登録メリット・特典理解・登録導線`
- intended dominant role:
  - benefits / value understanding first
  - clarify changeable conditions before action
  - route interested users toward official confirmation

Role protection notes:

- do not let the page become a beginner-first page like `1095`
- do not let the page become a reassurance-first page like `994`
- do not let sale-confirmation framing from `954` overtake the page

## 3. Current Decision

- current status: `HOLD`

## 4. `HOLD` Reason

Current `HOLD` basis:

- this is still a local draft approval record
- current live body residue review is not yet attached
- final CTA destination confirmation still requires execution-stage human check
- desktop and mobile rendering checks still require execution-stage human check
- backup reference and named rollback owner are not yet filled in

## 5. Remaining Checks Required For `GO`

To move from `HOLD` to `GO`, confirm:

- the live `1106` body contains no conflicting legacy beginner / reassurance / sale-first copy
- top, mid, and end official CTA destinations are confirmed
- end CTA composition behaves as approved
- `fanza_cta_click` mappings are preserved exactly
- desktop hierarchy keeps official CTA primary
- mobile hierarchy keeps official CTA primary
- `1018` remains absent from every routine route
- no stale campaign or exaggeration language remains
- backup reference and rollback owner are recorded

## 6. Paste Unit Confirmation Log

### Page-Level Unit Summary

- `1106-pu01`: `HOLD`
  - role_alignment_check: draft pass
  - blocker: live intro residue not yet reviewed
- `1106-pu02`: `HOLD`
  - role_alignment_check: draft pass
  - blocker: confirm the section remains benefits-first rather than beginner-first
- `1106-pu03`: `HOLD`
  - role_alignment_check: draft pass
  - blocker: confirm changeable-condition explanation does not slip into reassurance-first framing
- `1106-pu04`: `HOLD`
  - role_alignment_check: draft pass
  - blocker: confirm final CTA destination and rendering
- `1106-pu05`: `HOLD`
  - role_alignment_check: draft pass
  - blocker: confirm no stale condition or campaign wording remains nearby
- `1106-pu06`: `HOLD`
  - role_alignment_check: draft pass
  - blocker: confirm cluster remains visually subordinate and excludes `1018`
- `1106-pu07`: `HOLD`
  - role_alignment_check: draft pass
  - blocker: confirm FAQ is needed and does not repeat the body
- `1106-pu08`: `HOLD`
  - role_alignment_check: draft pass
  - blocker: confirm end composition hierarchy on desktop and mobile

### Paste Unit Log Template For Live Use

```text
approval_date:
page_id: 1106
paste_unit_id:
paste_unit_role:
intended_position:
decision: HOLD
reviewer:
approver:
operator:
review_completed_at:
replacement_area:
kept_area:
role_alignment_check:
cta_check:
internal_link_check:
faq_check:
notes:
next_action:
```

## 7. CTA Confirmation Log

### Top Official CTA

- decision: `HOLD`
- `cta_label`: `FANZA公式で登録前の案内を確認する`
- `cta_id`: `registration_benefits_guide__top__official_registration_benefits`
- `link_target`: `official_fanza`
- role_alignment_check: draft pass
- official_cta_priority_check: draft pass
- copy_safety_check: draft pass
- measurement_alignment_check: draft pass
- blocker: final target confirmation still needed

### Mid Official CTA

- decision: `HOLD`
- `cta_label`: `FANZA公式で登録前の案内を確認する`
- `cta_id`: `registration_benefits_guide__mid__official_registration_benefits`
- `link_target`: `official_fanza`
- role_alignment_check: draft pass
- official_cta_priority_check: draft pass
- copy_safety_check: draft pass
- measurement_alignment_check: draft pass
- blocker: final target confirmation and rendered hierarchy check still needed

### End Official CTA

- decision: `HOLD`
- `cta_label`: `FANZA公式で登録前の案内を確認する`
- `cta_id`: `registration_benefits_guide__end__official_registration_benefits`
- `link_target`: `official_fanza`
- role_alignment_check: draft pass
- official_cta_priority_check: pending live hierarchy confirmation
- copy_safety_check: draft pass
- measurement_alignment_check: draft pass

### End Internal Safety CTA

- decision: `HOLD`
- `cta_label`: `安全性や使い方も確認しておく`
- `cta_id`: `registration_benefits_guide__end__internal_safety_next`
- `link_target`: `internal_994`
- role_alignment_check: draft pass
- official_cta_priority_check: pending live hierarchy confirmation
- copy_safety_check: draft pass
- measurement_alignment_check: draft pass

### Inline Internal Beginner Context CTA

- decision: `HOLD`
- `cta_label`: `まず初心者向けガイドから確認する`
- `cta_id`: `registration_benefits_guide__inline__internal_beginner_context`
- `link_target`: `internal_1095`
- role_alignment_check: draft pass
- official_cta_priority_check: draft pass
- copy_safety_check: draft pass
- measurement_alignment_check: draft pass
- caution: must remain context-only and must not make `1095` the dominant route

## 8. `fanza_cta_click` Measurement Confirmation Log

Current draft status: `HOLD`

Confirmed at draft level:

- `event_name`: `fanza_cta_click`
- `page_type`: `registration_benefits_guide`
- `page_role`: `consideration`
- approved placements:
  - `top`
  - `mid`
  - `end`
  - `inline`
- approved `cta_id` family:
  - `registration_benefits_guide__top__official_registration_benefits`
  - `registration_benefits_guide__mid__official_registration_benefits`
  - `registration_benefits_guide__end__official_registration_benefits`
  - `registration_benefits_guide__end__internal_safety_next`
  - `registration_benefits_guide__inline__internal_beginner_context`

Remaining confirmation:

- verify final link target mapping in the implementation context
- verify no accidental `cta_id` drift in the end composition

## 9. Internal-Link Cluster Confirmation Log

Current draft status: `HOLD`

Draft pass points:

- cluster role is support-only
- cluster is planned for the late-body / end section
- destinations are limited to `994 / 1095 / 954`
- cluster is not designed to outrank the official CTA

Remaining confirmation:

- verify visual subordination after actual assembly
- verify `1018` exclusion in the live link set

## 10. FAQ Confirmation Log

Current draft status: `HOLD`

Draft pass points:

- FAQ remains benefits / pre-registration oriented
- questions support comparison and clarification only
- FAQ is not designed as a second conversion route

Remaining confirmation:

- verify FAQ is still needed after body assembly
- verify FAQ does not duplicate surrounding explanation

## 11. `1018` Pending Source Material Exclusion Log

Current draft status: `HOLD`

Draft pass points:

- excluded from CTA layer
- excluded from inline support paths
- excluded from internal-link cluster
- excluded from FAQ routing
- excluded from end-of-page routing

Remaining confirmation:

- verify no incidental `1018` reference is introduced during final packet assembly

## 12. Stale Campaign Absence Log

Current draft status: `HOLD`

Draft pass points:

- no campaign name is planned
- no campaign period is planned
- no discount figure is planned
- no `954` campaign-state module text is imported

Remaining confirmation:

- verify the current `1106` body has no leftover sale urgency, campaign wording, or outdated benefits / points wording in kept regions

## 13. Exaggeration / Certainty Check Log

Current draft status: `HOLD`

Draft pass points:

- no guaranteed-benefit wording is intentionally used
- no guaranteed registration-result wording is intentionally used
- no guaranteed sale-result wording is intentionally used
- no unsupported performance or earning claim is intentionally used

Automatic `NO-GO` triggers:

- `絶対`, `必ず`, `最安` or equivalent unsupported certainty wording
- guaranteed benefit claims
- guaranteed registration or points claims
- stale sale availability claims

## 14. Mobile / Desktop Assumption Log

Current draft status: `HOLD`

Desktop assumptions:

- official CTA remains visually primary
- cluster remains secondary
- benefits-first sequence remains intact

Mobile assumptions:

- official CTA stack remains clear
- value explanation still precedes stronger action
- FAQ and end CTA remain distinct

Remaining confirmation:

- live desktop view check
- live mobile view check

## 15. Rollback Readiness Log

Current draft status: `HOLD`

Draft pass points:

- rollback trigger logic is defined
- paste unit order is defined
- backup need is explicitly identified

Missing for `GO`:

- backup reference
- named rollback owner
- live rollback source note

## 16. Human Checks Still Required

- confirm live body residue for all kept regions
- confirm final CTA destinations
- confirm desktop CTA hierarchy
- confirm mobile CTA hierarchy
- confirm support links do not overtake the page role
- confirm FAQ remains necessary
- confirm no stale sale or old benefit wording remains in kept content

## 17. Conditions To Advance To `GO`

- all `HOLD` blockers above are cleared
- page still reads as benefits-first after final assembly
- official CTA remains the strongest route
- internal support links stay subordinate
- `fanza_cta_click` mapping is validated
- `1018` remains excluded
- no stale campaign or exaggeration issue remains
- rollback readiness is documented

## 18. `NO-GO` Conditions

- the page reads like `1095`, `994`, or `954` instead of `1106`
- reassurance-first or sale-first framing overtakes consideration framing
- official CTA is not primary
- internal-link cluster overpowers the official CTA
- `1018` appears in normal routing
- `fanza_cta_click` fields drift from the approved measurement spec
- stale campaign information remains in visible copy
- exaggerated or certainty-based claims remain in the final body

## 19. Mapping To The Production Approval Request Draft

This approval log draft corresponds to:

- [fanza-1106-production-approval-request-draft.md](/C:/Users/Tachi/projects/moterist-ai-affiliate/00_admin/fanza-1106-production-approval-request-draft.md)

Field mapping summary:

- request paste-unit scope -> sections 6 and 17
- request CTA scope -> sections 7 and 8
- request `1018` exclusion -> section 11
- request stale campaign / copy safety -> sections 12 and 13
- request mobile / desktop assumptions -> section 14
- request rollback readiness -> section 15
- request provisional `HOLD` -> sections 3, 4, and 16

## 20. Suggested `operation-log.md` Summary

Suggested summary line:

- created `1106` page-specific approval log draft with provisional `HOLD`, paste-unit and CTA review entries, `fanza_cta_click` checks, `1018` exclusion checks, stale campaign / exaggeration guards, and explicit human-review blockers

## 21. 2026-05-10 CTA Rollout Preflight From `1095`

- current target:
  - `1106` only
- current decision:
  - `HOLD`

Why `1106` is the next rollout candidate:

- `1095` single-page sign-off is already `GO`
- `1106` is the next lower-risk support-route page before `994` and `954`
- `954` remains intentionally deferred because of higher sale-first / role-mixing risk

Reusable tracking pattern from `1095`:

- event name remains `fanza_cta_click`
- runtime path remains `wp_head`
- click handler remains the preferred minimum implementation model
- network confirmation, UI evidence, rendered-state review, and rollback readiness all remain mandatory

Current `1106` payload direction:

- `page_type: registration_benefits_guide`
- `page_role: consideration`
- preferred first minimum target:
  - `registration_benefits_guide__mid__official_registration_benefits`
- preferred first `link_target`:
  - `official_fanza`

Current rollout caution:

- do not reuse `1095` payload values directly
- do not expand to top / end / inline CTA families in the first `1106` step
- do not let `1095`, `994`, or `954` framing overtake the `1106` benefits-first role

Move beyond this `HOLD` only if:

- one official CTA can be selected uniquely
- page-level payload values are frozen
- non-target-page non-expansion checks are prepared
- rollback capture for the next implementation step is prepared

## 22. 2026-05-10 Live HTML Pre-Implementation Check

- checked public URL:
  - `https://moterist.com/fanza20250331/`
- permalink and `?p=1106` mapping:
  - consistent with existing records

Observed official CTA candidate in live HTML:

- visible label:
  - `FANZA公式ページで登録前の案内を確認する`
- href:
  - `https://al.dmm.co.jp/?lurl=https%3A%2F%2Fvideo.dmm.co.jp%2Fav%2Flist%2F%3Fgenre%3D5002%26dmmref%3Dssis00200%26i3_ref%3Ddetail%26i3_ord%3D5%26i3_pst%3Dinfo_genre&af_id=moterist-001&ch=link_tool&ch_id=link`
- current position:
  - end-of-body list under `次に確認したいページ`

Uniqueness judgment:

- live HTML currently exposes three `al.dmm.co.jp` links:
  - toolbar ranking link
  - promo-strip coupon link
  - the target official CTA
- only the target CTA currently matches all of:
  - `href` includes `al.dmm.co.jp`
  - `href` includes `ch=link_tool`
  - `href` includes `ch_id=link`
  - text equals `FANZA公式ページで登録前の案内を確認する`
- therefore the current candidate is uniquely selectable without capturing the toolbar or promo-strip links

Implementation-readiness implication:

- current live HTML is compatible with a one-CTA minimum test
- the existing preferred first target name:
  - `registration_benefits_guide__mid__official_registration_benefits`
  should be re-labeled operationally if needed, because the observed CTA is currently located in the end-of-body next-page list rather than an obvious mid-body slot

Keep `HOLD` if:

- placement naming is not reconciled with the observed live position
- the official CTA text or href changes before implementation
- a second matching `ch=link_tool / ch_id=link` FANZA link appears in the content body

Switch to `NO-GO` if:

- the selector would capture toolbar or promo-strip links
- role-mixing causes the official CTA to stop being the primary intended route
- the page begins to behave like `1095`, `994`, or `954`

Rollback readiness:

- no implementation was made in this step
- keep `functions.php.bak_fanza_cta_head_20260510_210559` as the current shared known-good reference
- capture a fresh exact backup before any `1106` implementation attempt

## 23. 2026-05-10 CTA Payload And Naming Freeze

Frozen payload for the first `1106` minimum rollout candidate:

- `event_name`:
  - `fanza_cta_click`
- `page_type`:
  - `registration_benefits_guide`
- `page_role`:
  - `consideration`
- `placement`:
  - `end`
- `cta_id`:
  - `registration_benefits_guide__end__official_registration_benefits`
- `link_target`:
  - `official_fanza`

Why `placement` is changed from `mid`:

- the live CTA is currently located in the end-of-body next-page list
- keeping `mid` would create naming drift against the observed runtime position
- `end` is the lowest-risk label for the current live state

Frozen selector direction:

- `href` includes `al.dmm.co.jp`
- `href` includes `ch=link_tool`
- `href` includes `ch_id=link`
- `textContent` exact match:
  - `FANZA公式ページで登録前の案内を確認する`
- if practical at implementation time, prefer additional end-of-body list context so the selector stays scoped to the `次に確認したいページ` block

Explicit exclusion rule:

- do not capture the toolbar ranking link
- do not capture the promo-strip coupon link
- treat `ch=toolbar` as an explicit exclusion class in reasoning and verification

Proceed-to-implementation conditions:

- the live CTA still matches the frozen selector contract
- the frozen `placement / cta_id` remain consistent with the live position
- non-expansion checks include `1095`
- fresh rollback backup capture is prepared

Keep `HOLD` if:

- the CTA moves to a different live position
- the exact text changes
- another same-pattern official FANZA link appears in the content body

Switch to `NO-GO` if:

- selector isolation against toolbar / promo strip is no longer reliable
- `1106` role integrity is no longer preserved
- shared-code rollout cannot prove `1095` isolation

Rollback readiness:

- keep `functions.php.bak_fanza_cta_head_20260510_210559` as the current known-good shared reference
- still capture a fresh exact live backup before any `1106` implementation

## 24. 2026-05-10 `wp_head` Pre-Implementation Final Check

Implementation-path judgment:

- `wp_head` is acceptable as the first implementation path for `1106`
- reason:
  - `1095` already proved public-HTML observability and runtime viability through `wp_head`
  - `wp_footer` is not the preferred first path

Page-scope judgment:

- `is_single(1106)` should be treated as the required first scope boundary
- do not widen beyond `1106` in the first rollout step

Safety judgment against existing `1095`:

- `1095` must remain untouched at behavior level
- first `1106` implementation must be additive and page-scoped only
- post-reflection verification must include explicit `1095` re-check

Frozen selector safety check:

- required conditions:
  - `href` includes `al.dmm.co.jp`
  - `href` includes `ch=link_tool`
  - `href` includes `ch_id=link`
  - `textContent` exact match:
    - `FANZA公式ページで登録前の案内を確認する`
- preferred extra boundary:
  - end-of-body list context under `次に確認したいページ`

Exclusion safety:

- toolbar ranking link remains excluded because it uses `ch=toolbar`
- promo-strip coupon link remains excluded because it uses `ch=toolbar`
- generic `al.dmm.co.jp` capture remains disallowed

Verification method before and after implementation:

- create a fresh exact backup of live `functions.php`
- edit only through the same shared file path already used for `1095`
- syntax-check temp file with `php -l`
- syntax-check reflected `functions.php` with `php -l`
- confirm `1106` output with no-cache `curl`
- confirm `1095` existing literals and behavior remain intact
- confirm `994` and `954` do not expose the new `1106` literals

Proceed only if:

- selector contract still isolates one CTA safely
- `is_single(1106)` scope is kept
- `1095` re-check is included in verification
- fresh rollback backup is captured

Keep `HOLD` if:

- selector safety weakens
- `1095` verification is not included
- backup capture is not ready
- live CTA inventory changes before implementation

Switch to `NO-GO` if:

- toolbar or promo-strip capture becomes possible
- page role drifts away from `Registration / Benefits Guide`
- shared-code change cannot prove `1095` isolation

Rollback readiness:

- current known-good shared reference:
  - `functions.php.bak_fanza_cta_head_20260510_210559`
- execution-time rule:
  - capture a fresh exact live backup before any `1106` code insertion

## 25. 2026-05-10 `wp_head` Minimum Implementation Result

- implementation decision:
  - reflected
- target file:
  - `/home/rvpuxcjb/public_html/moterist.com/wp-content/themes/the-thor-child/functions.php`
- fresh backup:
  - `functions.php.bak_fanza_cta_head_1106_20260510_221743`

Reflected `1106` payload:

- `event_name: fanza_cta_click`
- `page_type: registration_benefits_guide`
- `page_role: consideration`
- `placement: end`
- `cta_id: registration_benefits_guide__end__official_registration_benefits`
- `link_target: official_fanza`
- `transport_type: beacon`

Checks passed:

- temp file `php -l` on `/tmp/functions.php.tmp_1106`
- reflected file `php -l`
- no-cache public HTML on `1106` exposed:
  - `fanza_cta_click`
  - `registration_benefits_guide`
  - `registration_benefits_guide__end__official_registration_benefits`
  - `official_fanza`
- `1095` existing literals remained visible
- `994` did not expose `1106` literals
- `954` did not expose `1106` literals

Current limitation:

- click-time Playwright / Tag Assistant / GA4 confirmation was not closed from this environment in this step

Rollback readiness:

- current restore candidate for this step:
  - `functions.php.bak_fanza_cta_head_1106_20260510_221743`
- older shared known-good reference remains:
  - `functions.php.bak_fanza_cta_head_20260510_210559`
