# FANZA Priority Pages Pre-Publish QA Checklist

## 1. Purpose

This checklist defines the pre-publish and immediate post-publish QA requirements for the four priority FANZA pages.

Its goals are:

- verify that page roles remain distinct
- verify CTA, internal-link, and FAQ behavior against the approved specs
- prevent stale campaign information or exaggerated claims from going live
- ensure `954` stays evergreen by default and only uses `active_campaign_state` when officially justified
- provide clear go / no-go and rollback criteria before any production editing

## 2. Target Pages

- `1095` `Beginner Guide`
- `1106` `Registration / Benefits Guide`
- `994` `Safety / Anxiety Resolution`
- `954` `Evergreen Sale Hub`

## 3. Shared Cross-Page Checks

1. confirm each page still has one dominant role
2. confirm `1095 / 1106 / 994 / 954` do not read like duplicates of each other
3. confirm the strongest CTA on each page points to the intended official FANZA route
4. confirm fallback internal-link clusters are visually weaker than the official CTA layer
5. confirm `1018` `Pending Source Material` is excluded from normal routing
6. confirm no page includes unsupported urgency, certainty, or guaranteed-benefit wording
7. confirm any time-sensitive information is either officially confirmed or removed
8. confirm the page still matches its approved wireframe and module order

## 4. Page-Specific Checks

### `1095` Beginner Guide

1. confirm the page reads as beginner-first, not benefits-first
2. confirm the top section lowers anxiety before asking for deeper action
3. confirm benefits-heavy explanation has not overtaken the page
4. confirm the next-step logic points primarily to official confirmation, then support pages
5. confirm the ending does not feel like a sales page or campaign page

### `1106` Registration / Benefits Guide

1. confirm the page reads as benefits / registration-value first
2. confirm broad beginner overview content has not been duplicated from `1095`
3. confirm official confirmation remains the main action
4. confirm reassurance content exists only as fallback, not as the main structure
5. confirm the end section does not blur into `994`

### `994` Safety / Anxiety Resolution

1. confirm the page reads as safety / trust first
2. confirm the main CTA appears immediately after the reassurance block
3. confirm sales or benefit language does not appear before trust resolution
4. confirm FAQ content addresses likely hesitation points rather than filler
5. confirm the ending keeps reassurance-to-action flow intact

### `954` Evergreen Sale Hub

1. confirm current sale confirmation is the main route at top, mid, and end
2. confirm hero and evergreen intro remain campaign-neutral
3. confirm campaign-specific facts live only inside `current_campaign_module`
4. confirm registration is not treated as the primary outcome
5. confirm fallback internal-link cluster remains clearly secondary

## 5. CTA Checks

1. confirm each page has the approved top / mid / end CTA pattern
2. confirm the strongest CTA uses page-role-aligned wording
3. confirm CTA wording does not overclaim outcomes or campaign certainty
4. confirm official CTA destinations are distinct from internal fallback routes
5. confirm `994` mid CTA appears directly after reassurance
6. confirm `954` primary CTA wording is about current sale confirmation, not registration
7. confirm end-of-page CTA order matches the approved end composition rules

## 6. Internal-Link Cluster Checks

1. confirm the internal-link cluster is not placed above the main CTA layer
2. confirm the cluster uses support-level styling, not primary button styling
3. confirm the linked destinations are page-role appropriate
4. confirm the cluster does not introduce unrelated routes
5. confirm `954` cluster is subordinate to sale-confirmation CTAs
6. confirm `1018` is not included anywhere in a normal cluster

## 7. FAQ Checks

1. confirm FAQ exists only where it supports the page role
2. confirm `994` FAQ appears before the main reassurance-to-CTA handoff is broken
3. confirm `1095` FAQ stays lightweight and beginner-oriented
4. confirm `1106` FAQ supports benefits understanding and official confirmation
5. confirm `954` FAQ, if present, stays evergreen and does not become a second campaign block
6. confirm FAQ does not introduce unstable factual claims

## 8. Measurement Parameter Checks

Use `fanza_cta_click` as the shared event family.

1. confirm `event_name` is `fanza_cta_click`
2. confirm `page_type` values match the approved taxonomy
3. confirm `page_role` values match the approved taxonomy
4. confirm `placement` values use only `top / mid / end / inline`
5. confirm `cta_id` values use the stable `{page_type}__{placement}__{cta_purpose}` format
6. confirm `link_target` values map correctly to `official_fanza` or the intended internal page
7. confirm visible CTA text changes, if any, do not change `cta_id` unless intentionally approved
8. confirm `954` module CTA uses `evergreen_sale_hub__mid__official_current_sale`

## 9. Mobile Display Checks

1. confirm module order matches the approved mobile sequence
2. confirm primary CTA remains visible without excessive scroll depth
3. confirm fallback internal-link cluster remains compact on mobile
4. confirm no mobile layout makes fallback links feel equal to the main CTA
5. confirm `994` reassurance block and mid CTA stay close together on mobile
6. confirm `954` current-campaign module stays readable and compact on mobile

## 10. Desktop Display Checks

1. confirm visual hierarchy matches the approved desktop sequence
2. confirm CTA block remains stronger than fallback cluster
3. confirm spacing prevents mid-page density from feeling crowded
4. confirm end-of-page composition stays compact and readable
5. confirm `954` current-campaign module is emphasized without taking over the full page
6. confirm two-column support layouts, if used, do not disrupt CTA priority

## 11. `954` `generic_latest_check_state` Checks

1. confirm this is the default state when no active campaign is officially confirmed
2. confirm no named campaign appears in hero, intro, or end sections
3. confirm no discount figure or campaign period appears outside the module
4. confirm module wording uses generic latest-check language
5. confirm CTA label stays:
   - `FANZA公式で現在のセール情報を確認する`
6. confirm the page still reads correctly if no named campaign is present

## 12. `954` `active_campaign_state` Checks

1. confirm state is used only when an active campaign is officially confirmed
2. confirm campaign name, period, and scope appear only inside the module
3. confirm module emphasis increases without turning the page into a seasonal article
4. confirm hero and intro remain evergreen
5. confirm end section does not repeat detailed campaign facts
6. confirm module CTA still points to official confirmation
7. confirm rollback path to `generic_latest_check_state` is clear if the campaign ends

## 13. Stale Campaign Residue Checks

1. confirm no expired campaign name remains in page headings outside the module
2. confirm no expired dates remain in evergreen sections
3. confirm no old discount figures remain in the body
4. confirm no campaign-specific urgency remains after reverting to generic state
5. confirm only one current-campaign module is visible
6. confirm old module wording is fully removed, not hidden lower on the page

## 14. `1018` Routing Checks

1. confirm `1018` is not linked from the main CTA layer
2. confirm `1018` is not present in fallback internal-link clusters
3. confirm `1018` is not introduced in end-of-page routing
4. confirm no inline support text routes users to `1018`
5. confirm actress-architecture uncertainty has not leaked into normal page UX

## 15. Exaggeration / Certainty Checks

1. confirm there is no `絶対`, `必ず`, `最安`, or equivalent certainty wording without official support
2. confirm there is no guaranteed-benefit phrasing
3. confirm there is no guaranteed-safety phrasing
4. confirm there is no stale sale-availability phrasing
5. confirm all official confirmation notes remain factual and compact
6. confirm campaign or benefits wording stays within evergreen-safe bounds

## 16. Pre-Publish Checks

1. confirm the page matches the approved rewrite draft, not an ad hoc rewrite
2. confirm CTA placements match the wireframe and module spec
3. confirm internal-link cluster placement matches the approved support role
4. confirm FAQ placement matches the page role
5. confirm desktop and mobile compositions both pass review
6. confirm measurement IDs and link targets are validated
7. confirm `954` state selection is correct:
   - `generic_latest_check_state` by default
   - `active_campaign_state` only with official confirmation
8. confirm stale campaign residue review is complete
9. confirm `1018` exclusion review is complete
10. confirm go / no-go review has explicit approval before any production editing

## 17. Immediate Post-Publish Checks

1. confirm the published page renders the intended heading hierarchy
2. confirm CTA labels and destinations are correct
3. confirm fallback internal-link cluster appears in the approved position
4. confirm FAQ block placement is correct
5. confirm desktop and mobile renderings match expected hierarchy
6. confirm `954` current-campaign module displays the intended state
7. confirm no stale campaign details appeared due to cache or copy mismatch
8. confirm tracking payloads align with `fanza_cta_click`
9. confirm no unexpected routing to `1018` exists

## 18. Rollback Decision Criteria

Rollback or hold release if any of the following is true:

1. the page role is materially blurred with another priority page
2. the main CTA points to the wrong destination
3. fallback internal links visually or structurally overpower the official CTA
4. `994` loses the reassurance-to-CTA handoff
5. `954` contains campaign-specific facts outside `current_campaign_module`
6. `954` uses `active_campaign_state` without official confirmation
7. expired campaign names, dates, or discount figures remain visible
8. `1018` appears in normal routing
9. measurement IDs no longer match the approved event model
10. exaggerated or unsupported claims are present

## 19. QA Completion Criteria

QA is complete only when:

1. all shared checks pass
2. all page-specific checks pass
3. CTA, internal-link, FAQ, and measurement checks pass
4. desktop and mobile checks both pass
5. `954` state checks pass for the state being used
6. stale campaign residue checks pass
7. `1018` exclusion checks pass
8. exaggeration / certainty checks pass
9. pre-publish review is signed off
10. the page is still only in planning scope unless explicit production approval is separately given
