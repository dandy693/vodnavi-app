# FANZA Priority Pages Review / Validation Order

## 1. Purpose

This document defines the review order and validation order for the four priority FANZA pages at the paste-unit level.

Its goals are:

- prevent page-role mixing by reviewing in the right sequence
- make CTA, internal-link, FAQ, and measurement validation repeatable
- ensure `954` defaults to `generic_latest_check_state`
- keep `active_campaign_state` as a conditional validation path only

This is a local design and review-order document only.

## 2. Target Pages

- `1095` `Beginner Guide`
- `1106` `Registration / Benefits Guide`
- `994` `Safety / Anxiety Resolution`
- `954` `Evergreen Sale Hub`

## 3. Review Sequence Principles

1. Review role-defining pages before support or commercial detail pages if they influence route expectations.
2. Review structural blocks before CTA and measurement blocks.
3. Review default-state `954` before any conditional active-state validation.
4. Review route exclusions, including `1018`, after internal-link structure is confirmed.

## 4. Page-Level Review Order

Recommended review order:

1. `1095`
2. `1106`
3. `994`
4. `954`

Reasoning:

- `1095` sets the clean beginner-entry boundary
- `1106` then establishes benefits / consideration without drifting into beginner tone
- `994` is reviewed after both context pages so reassurance routing can be judged correctly
- `954` comes last because it depends on the other three remaining clearly subordinate support routes

## 5. Paste-Unit Review Order By Page

### `1095`

1. `1095-pu01`
2. `1095-pu02`
3. `1095-pu03`
4. `1095-pu04`
5. `1095-pu05`
6. `1095-pu06`
7. `1095-pu07`
8. `1095-pu08`

Review focus:

- first confirm beginner-safe framing
- then confirm official CTA handoff
- then confirm support routing

### `1106`

1. `1106-pu01`
2. `1106-pu02`
3. `1106-pu03`
4. `1106-pu04`
5. `1106-pu05`
6. `1106-pu06`
7. `1106-pu07`
8. `1106-pu08`

Review focus:

- first confirm value / benefits framing
- then confirm official confirmation structure
- then confirm fallback routing does not turn the page into `1095` or `994`

### `994`

1. `994-pu01`
2. `994-pu02`
3. `994-pu03`
4. `994-pu04`
5. `994-pu05`
6. `994-pu07`
7. `994-pu06`
8. `994-pu08`

Review focus:

- first confirm trust-first framing
- then confirm reassurance block
- then confirm the main CTA sits immediately after reassurance
- then confirm FAQ and fallback routes stay secondary

### `954`

1. `954-pu01`
2. `954-pu02`
3. `954-pu03`
4. `954-pu04`
5. `954-pu06`
6. `954-pu07`
7. `954-pu08`
8. `954-pu05` only if active campaign validation is required

Review focus:

- first confirm evergreen structure
- then validate default `generic_latest_check_state`
- only after that, validate `active_campaign_state` as an optional swap path

## 6. Page-Level Validation Order

After review passes, validate in this order:

1. page role integrity
2. paste-unit order integrity
3. CTA integrity
4. internal-link cluster integrity
5. FAQ integrity
6. measurement integrity
7. desktop assumptions
8. mobile assumptions
9. `954` state-specific checks if relevant
10. stale-campaign and `1018` exclusion checks

## 7. CTA Validation Order

Apply this order per page:

1. top CTA
2. mid CTA
3. end CTA
4. inline support CTA if defined
5. CTA copy-to-role alignment
6. CTA destination alignment
7. `fanza_cta_click` parameter alignment

Special rules:

- `994` mid CTA must be validated immediately after the reassurance block
- `954` mid CTA inside the current-campaign module must be validated before the end CTA

## 8. Internal-Link Cluster Validation Order

1. confirm cluster placement is below the primary CTA layer
2. confirm linked destinations are role-appropriate
3. confirm no cluster introduces `1018`
4. confirm copy is weaker than official CTA copy
5. confirm `954` cluster remains subordinate to sale-confirmation intent

## 9. FAQ Validation Order

1. confirm FAQ exists only where justified
2. confirm FAQ question set matches page role
3. confirm FAQ does not introduce unstable factual claims
4. confirm FAQ does not create a competing funnel
5. confirm `954` FAQ remains evergreen and non-campaign-specific

## 10. Measurement Parameter Validation Order

1. validate `event_name`
2. validate `page_type`
3. validate `page_role`
4. validate `placement`
5. validate `cta_id`
6. validate `link_target`
7. validate page-level event consistency with the measurement spec
8. validate `954` module CTA event:
   - `evergreen_sale_hub__mid__official_current_sale`

If any required field is wrong, stop validation and mark for return review.

## 11. Desktop Validation Order

1. validate top module order
2. validate mid module order
3. validate end-of-page composition
4. validate official CTA priority
5. validate fallback cluster subordination
6. validate `954` current-campaign module emphasis against evergreen structure

## 12. Mobile Validation Order

1. validate stacked module order
2. validate visibility of the primary CTA without excessive scroll depth
3. validate reassurance-to-CTA proximity on `994`
4. validate compact fallback cluster behavior
5. validate `954` module readability and priority

## 13. `954` `generic_latest_check_state` Validation Order

This is the default `954` validation path.

1. confirm `954-pu01` to `954-pu03` remain evergreen
2. confirm `954-pu04` is used as the current-campaign module
3. confirm no named campaign appears outside the module
4. confirm no date or discount figure appears outside the module
5. confirm CTA label remains:
   - `FANZA公式で現在のセール情報を確認する`
6. confirm end section remains evergreen

## 14. `954` `active_campaign_state` Validation Order

Validate this path only if there is official proof of an active campaign.

1. confirm official source exists
2. confirm `954-pu05` replaces `954-pu04`, not supplements it
3. confirm campaign name / period / scope remain inside the module only
4. confirm hero and end-of-page remain evergreen
5. confirm no stale or duplicate campaign language remains elsewhere
6. confirm rollback path to `generic_latest_check_state` remains available

If no official proof exists, skip this validation path and keep `954` in `generic_latest_check_state`.

## 15. Stale Campaign Residue Check Order

1. check hero
2. check evergreen intro
3. check comparison guidance section
4. check FAQ
5. check internal-link cluster
6. check end-of-page composition
7. check current-campaign module for duplicate or expired content

If stale campaign content is found outside the active module, return for revision immediately.

## 16. `1018` Exclusion Check Order

1. CTA layers
2. inline support references
3. fallback internal-link clusters
4. FAQ references
5. end-of-page fallback routing

If `1018` appears anywhere in normal routing, return for revision immediately.

## 17. Mapping To `GO / HOLD / NO-GO`

- page-role review:
  - maps to `GO / NO-GO` shared and page-specific conditions
- paste-unit order review:
  - maps to paste-unit approval items
- CTA review:
  - maps to CTA approval items and measurement items
- internal-link review:
  - maps to internal-link approval items and `1018` exclusion
- FAQ review:
  - maps to FAQ approval items
- `954` default-state review:
  - maps to `generic_latest_check_state` approval items
- `954` conditional-state review:
  - maps to `active_campaign_state` approval items
- stale-campaign sweep:
  - maps to stale campaign residue approval items

## 18. Return-For-Revision Criteria

Return the page or paste unit for revision if any of the following is found:

1. page role materially overlaps another priority page
2. CTA order breaks the approved funnel logic
3. `fanza_cta_click` parameters do not match the measurement spec
4. fallback cluster visually or structurally competes with the official CTA
5. FAQ introduces unrelated or unstable information
6. `954` uses `active_campaign_state` without official confirmation
7. stale campaign names, dates, or discount figures remain outside the allowed module
8. `1018` appears in routine routing
9. exaggerated or certainty-based language appears
10. desktop or mobile hierarchy inverts the intended CTA priority

## 19. Validation Completion Criteria

Validation is complete only when:

1. all page-level reviews pass in order
2. all paste-unit reviews pass in order
3. CTA, internal-link, FAQ, and measurement validation pass
4. desktop and mobile validation pass
5. `954` default-state validation passes
6. `954` active-state validation passes only if applicable
7. stale-campaign and `1018` exclusion sweeps pass
8. result is ready to map into the `GO / HOLD / NO-GO` checklist

## 20. Recommended Next-Step WordPress Procedure Granularity

The next WordPress reflection procedure, when separately authorized later, should be documented at this granularity:

1. page-by-page procedure, not site-wide bulk procedure
2. paste-unit-by-paste-unit insertion order
3. per-unit validation checkpoint
4. CTA and measurement verification checkpoint
5. `954` state selection checkpoint before touching the current-campaign module
6. final page-level QA checkpoint

That future procedure should remain operational and stepwise, not full-copy oriented.
