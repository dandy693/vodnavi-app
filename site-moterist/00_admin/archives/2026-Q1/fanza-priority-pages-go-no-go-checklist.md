# FANZA Priority Pages Go / No-Go Checklist

## 1. Purpose

This checklist defines the approval gate for the priority FANZA pages before any future production reflection is considered.

Its goals are:

- turn the approved paste-unit design into a clear approval decision
- define unambiguous `GO / HOLD / NO-GO` outcomes
- prevent role drift, stale campaign information, or unsupported claims from moving forward
- ensure `fanza_cta_click` measurement stays aligned with the design package

This document does not authorize production edits by itself.

## 2. Decision States

### `GO`

- all required approval items pass
- no material role drift, stale campaign residue, or measurement mismatch remains
- the page may proceed to the next local implementation-preparation step

### `HOLD`

- no fatal blocker is present, but one or more items still require clarification, proof, or revision
- the page does not proceed until the missing confirmation is resolved

### `NO-GO`

- one or more fatal blockers are present
- the page must be revised against the design package before any further approval

## 3. Target Pages

- `1095` `Beginner Guide`
- `1106` `Registration / Benefits Guide`
- `994` `Safety / Anxiety Resolution`
- `954` `Evergreen Sale Hub`

## 4. Shared `GO` Conditions

All pages are `GO` only if:

1. the page has one dominant role and does not blur into another priority page
2. the strongest CTA points to the intended official FANZA route
3. fallback internal-link clusters remain clearly subordinate to the official CTA layer
4. FAQ content supports the page role and does not create a second competing route
5. `fanza_cta_click` naming and required parameters remain aligned with the measurement spec
6. no unsupported certainty, guarantee, or outdated sale language remains
7. `1018` `Pending Source Material` is excluded from normal routing
8. mobile and desktop assumptions both remain consistent with the approved structure

## 5. Shared `NO-GO` Conditions

Any page is automatically `NO-GO` if:

1. the page role is materially mixed with another priority page
2. the main CTA points to the wrong destination
3. `fanza_cta_click` parameters do not match the approved event model
4. fallback internal-link clusters visually or structurally overpower the official CTA
5. `1018` appears in standard routing
6. exaggerated or unsupported claims remain in the copy package
7. stale campaign names, dates, or discount figures remain where they should not
8. the approved paste-unit order is broken in a way that changes the intended funnel logic

## 6. Page-Specific `GO` Conditions

### `1095`

1. page reads as beginner-first, not benefits-first
2. top section lowers anxiety before stronger action
3. main CTA is official-first
4. next-step support remains secondary

### `1106`

1. page reads as registration-benefits / value-comparison first
2. official confirmation remains the main action
3. beginner overview duplication from `1095` is not excessive
4. safety routing is fallback only

### `994`

1. page reads as trust / reassurance first
2. main CTA appears immediately after the reassurance block
3. sale guidance remains secondary
4. FAQ supports real hesitation handling

### `954`

1. current sale confirmation is the main route at top, mid, and end
2. default state is `generic_latest_check_state`
3. campaign-specific facts remain inside the dedicated module only
4. hero and end composition remain evergreen

## 7. Page-Specific `NO-GO` Conditions

### `1095`

1. page behaves like a benefits page
2. strong conversion pressure appears before orientation
3. support routes overpower the official CTA

### `1106`

1. page behaves like a beginner intro page
2. benefit claims become guaranteed or unsupported
3. reassurance content overtakes benefits framing

### `994`

1. the main CTA is delayed until after unrelated support content
2. the page behaves like a sale page before trust is restored
3. FAQ becomes filler instead of trust support

### `954`

1. registration becomes the primary outcome
2. page reverts to a seasonal campaign-article structure
3. campaign details appear outside `current_campaign_module`
4. `active_campaign_state` is used without official confirmation

## 8. Paste Unit Approval Items

Each paste unit is approved only if:

1. the unit appears in the intended order
2. the unit role matches the page role
3. its H2 / H3 structure matches the design package
4. its CTA belongs to the correct unit and page
5. its internal links do not introduce off-role routes
6. its FAQ, if any, stays scoped to the intended question set
7. it does not duplicate a different paste unit’s job

Required review focus by page:

- `1095`
  - `1095-pu01` to `1095-pu08`
- `1106`
  - `1106-pu01` to `1106-pu08`
- `994`
  - `994-pu01` to `994-pu08`
- `954`
  - `954-pu01` to `954-pu08`

## 9. CTA Approval Items

1. CTA wording matches the page role
2. official CTA is visually and structurally primary
3. CTA placement follows the approved top / mid / end pattern
4. `994` main CTA is directly after reassurance
5. `954` CTA remains current-sale oriented, not registration oriented
6. CTA copy avoids certainty claims or unsupported urgency

## 10. Internal-Link Cluster Approval Items

1. cluster appears only in support positions
2. cluster never outranks the official CTA layer
3. linked pages are role-appropriate
4. copy is shorter and less forceful than primary CTA copy
5. `1018` is absent

## 11. FAQ Approval Items

1. FAQ exists only where justified by page role
2. `1095` FAQ stays lightweight and beginner-oriented
3. `1106` FAQ stays benefits / confirmation-oriented
4. `994` FAQ supports trust resolution
5. `954` FAQ stays evergreen and does not become a second campaign block

## 12. Measurement Parameter Approval Items

Approval requires full alignment to `fanza_cta_click`.

1. `event_name` = `fanza_cta_click`
2. `page_type` matches the approved page taxonomy
3. `page_role` matches the approved page taxonomy
4. `placement` uses only `top / mid / end / inline`
5. `cta_id` uses the stable approved format
6. `link_target` matches the intended destination
7. `954` module CTA uses `evergreen_sale_hub__mid__official_current_sale`

If any item above fails, status is `NO-GO`.

## 13. `954` `generic_latest_check_state` Approval Items

`GO` requires:

1. this state is used by default
2. no named campaign appears outside the module
3. no campaign period appears outside the module
4. no discount figure appears outside the module
5. module wording uses generic latest-check language
6. the page still reads correctly with no named campaign

Failure on any item above is `NO-GO`.

## 14. `954` `active_campaign_state` Approval Items

`GO` requires:

1. official confirmation exists that the campaign is active
2. campaign name, period, and scope remain inside the module only
3. hero and end composition remain evergreen
4. active emphasis does not turn the page into a campaign article
5. module CTA still points to official confirmation

If official confirmation is missing, result is `NO-GO`, not `HOLD`.

## 15. Stale Campaign Residue Approval Items

1. no expired campaign name remains in evergreen sections
2. no expired date remains in evergreen sections
3. no old discount figure remains outside the active module
4. no old urgency wording remains after reverting to generic state
5. only one current-campaign module is visible

If stale campaign residue remains, result is `NO-GO`.

## 16. `1018` Routing Approval Items

1. `1018` is absent from CTA layers
2. `1018` is absent from fallback internal-link clusters
3. `1018` is absent from FAQ or inline support references
4. `1018` is absent from end-of-page routing

If `1018` appears in routine routing, result is `NO-GO`.

## 17. Exaggeration / Certainty Approval Items

`NO-GO` applies if any of the following remains:

1. guaranteed benefit language
2. guaranteed safety language
3. guaranteed sale availability language
4. outdated current-sale claims
5. unsupported certainty words such as `絶対`, `必ず`, `最安`
6. fixed campaign claims without official confirmation

## 18. Mobile / Desktop Approval Items

`GO` requires:

1. approved module order still holds on mobile
2. approved module order still holds on desktop
3. official CTA remains stronger than fallback routes in both layouts
4. `994` reassurance and CTA remain close together on mobile and desktop
5. `954` module remains readable and subordinate to evergreen structure even when emphasized

If layout assumptions invert CTA priority or break role hierarchy, result is `NO-GO`.

## 19. Work After `GO`

After `GO`, the next permitted step is:

1. continue local implementation preparation only
2. create any missing state-operation or review-order documents
3. prepare a production approval request package if needed later
4. do not edit WordPress production without separate explicit approval

## 20. Additional Checks For `HOLD`

Use `HOLD` when:

1. page role is mostly correct but one support block still needs adjustment
2. CTA copy is structurally correct but final wording needs confirmation
3. measurement mapping is expected to work but not yet fully verified
4. `954` is intended to remain generic but campaign residue review is incomplete
5. desktop / mobile hierarchy looks structurally right but final rendering assumptions need validation

To clear `HOLD`, record:

1. blocking item
2. responsible reference file
3. required revision
4. re-review owner

## 21. Design Files To Revisit On `NO-GO`

If status is `NO-GO`, revisit the relevant file set:

- role / strategy problems:
  - `00_admin/fanza-priority-pages-rewrite-briefs.md`
  - `00_admin/fanza-priority-pages-implementation-package.md`
- section structure problems:
  - `00_admin/fanza-priority-pages-section-rewrite-drafts.md`
  - `00_admin/fanza-priority-pages-paste-units.md`
- CTA problems:
  - `00_admin/fanza-common-cta-block-spec.md`
  - `00_admin/fanza-cta-measurement-spec.md`
- internal-link problems:
  - `00_admin/fanza-fallback-internal-link-cluster-spec.md`
- `954` state or campaign problems:
  - `00_admin/fanza-954-current-campaign-module-spec.md`
  - `00_admin/fanza-954-visual-priority-rules.md`
- QA gating problems:
  - `00_admin/fanza-priority-pages-pre-publish-qa-checklist.md`

## 22. Final Approval Log Format

Record approvals in a short structured block using this format:

```text
approval_date:
page_id:
page_type:
decision: GO | HOLD | NO-GO
review_scope:
blocking_items:
required_revisions:
954_state:
measurement_check:
1018_routing_check:
stale_campaign_check:
reviewer:
notes:
```
