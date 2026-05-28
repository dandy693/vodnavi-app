# FANZA Priority Pages WordPress Implementation Runbook

## 1. Purpose

This runbook defines the page-by-page implementation procedure for the four priority FANZA pages when future WordPress reflection is separately approved.

Its goals are:

- keep implementation incremental and page-scoped
- reflect the approved paste units in the correct order
- require QA completion after each page before moving to the next page
- preserve `954` as an evergreen sale hub with `generic_latest_check_state` as the default

This document is a runbook design only. It does not authorize production edits.

## 2. Target Pages

- `1095` `Beginner Guide`
- `1106` `Registration / Benefits Guide`
- `994` `Safety / Anxiety Resolution`
- `954` `Evergreen Sale Hub`

## 3. Pre-Implementation Preconditions

Before any future implementation session starts:

1. explicit production approval must exist
2. the page must have passed the current `GO / HOLD / NO-GO` checklist
3. the latest paste-unit design must be frozen for that page
4. the latest QA checklist must be available
5. the intended `954` state must be decided:
   - `generic_latest_check_state` by default
   - `active_campaign_state` only with official confirmation
6. the operator must confirm `1018` remains excluded from normal routing

## 4. Backup Policy Before Reflection

Before touching any page in a future approved implementation session:

1. record the page identifier and current public URL
2. create or confirm a current content backup for the page
3. save a pre-edit snapshot of the target article body
4. save the planned paste-unit order for that page
5. record the intended rollback source

Backup rule:

- never begin the next page until the current page has both a pre-edit backup and a post-check record

## 5. Reflection Order

Apply pages in this order, one page at a time:

1. `1095`
2. `1106`
3. `994`
4. `954`

Progression rule:

- do not start the next page until the current page completes:
  - paste-unit reflection
  - page-level QA
  - `GO / HOLD / NO-GO` checkpoint

## 6. Page-Level Paste Procedure

Shared sequence for each page:

1. confirm page ID and target page type
2. confirm allowed paste units for the page
3. confirm which existing body regions will be replaced
4. paste units in approved order only
5. validate CTA placement
6. validate internal-link cluster placement
7. validate FAQ placement
8. validate measurement parameter assumptions
9. run desktop/mobile review
10. run page-specific QA
11. decide `GO / HOLD / NO-GO`

## 7. Paste Unit Reflection Order

### `1095`

1. `1095-pu01`
2. `1095-pu02`
3. `1095-pu03`
4. `1095-pu04`
5. `1095-pu05`
6. `1095-pu06`
7. `1095-pu07`
8. `1095-pu08`

### `1106`

1. `1106-pu01`
2. `1106-pu02`
3. `1106-pu03`
4. `1106-pu04`
5. `1106-pu05`
6. `1106-pu06`
7. `1106-pu07`
8. `1106-pu08`

### `994`

1. `994-pu01`
2. `994-pu02`
3. `994-pu03`
4. `994-pu04`
5. `994-pu05`
6. `994-pu07`
7. `994-pu06`
8. `994-pu08`

### `954`

Default reflection order:

1. `954-pu01`
2. `954-pu02`
3. `954-pu03`
4. `954-pu04`
5. `954-pu06`
6. `954-pu07`
7. `954-pu08`

Conditional reflection:

- `954-pu05` may replace `954-pu04` only if `active_campaign_state` is officially justified

## 8. Areas Allowed To Touch

When future production approval exists, only these body-level areas are in scope:

1. article body paste-unit areas
2. heading structure inside the article body
3. CTA block copy and placement inside the body
4. internal-link cluster inside the body
5. FAQ block inside the body
6. `954` current-campaign module inside the body

## 9. Areas Not Allowed To Touch

Do not change as part of this runbook:

1. taxonomy
2. slug
3. redirect settings
4. noindex settings
5. theme or plugin settings
6. SSH / DB state
7. unrelated pages
8. `1018` routing architecture

## 10. CTA Reflection Procedure

For each page:

1. confirm page-role-aligned CTA copy
2. paste top / mid / end CTA units in approved order
3. confirm official CTA remains visually primary
4. confirm destination logic matches the approved spec
5. confirm `fanza_cta_click` mapping remains intact

Page-specific emphasis:

- `1095`: official latest-info route first
- `1106`: official registration-benefits route first
- `994`: main CTA immediately after reassurance
- `954`: official current-sale route first

## 11. Internal-Link Cluster Reflection Procedure

1. reflect cluster only after the main CTA structure is stable
2. place cluster in support position only
3. confirm linked pages are role-appropriate
4. confirm `1018` is absent
5. confirm cluster copy is weaker than primary CTA copy

## 12. FAQ Reflection Procedure

1. confirm FAQ belongs on the page
2. paste FAQ after the core explanatory path is stable
3. confirm FAQ questions match the page role
4. confirm FAQ does not introduce unstable claims
5. confirm FAQ does not become a second conversion path

## 13. Measurement Parameter Reflection Procedure

For each reflected CTA:

1. confirm `event_name` = `fanza_cta_click`
2. confirm `page_type`
3. confirm `page_role`
4. confirm `placement`
5. confirm `cta_id`
6. confirm `link_target`

Stop condition:

- if any required field cannot be mapped cleanly, do not continue to the next page

## 14. `954` `generic_latest_check_state` Reflection Procedure

This is the default `954` procedure.

1. reflect `954-pu01` to `954-pu03`
2. reflect `954-pu04` as the current-campaign module
3. confirm no campaign name appears outside the module
4. confirm no date or discount figure appears outside the module
5. confirm CTA label remains:
   - `FANZA公式で現在のセール情報を確認する`
6. confirm end-of-page stays evergreen

## 15. `954` `active_campaign_state` Reflection Conditions And Procedure

Use this path only if:

1. official confirmation exists that the campaign is active
2. the campaign name, period, and scope are confirmed
3. rollback-to-generic remains possible immediately

Procedure:

1. reflect `954-pu01` to `954-pu03`
2. replace `954-pu04` with `954-pu05`
3. confirm campaign facts live only inside the swap module
4. confirm hero and end section remain evergreen
5. confirm no stale campaign residue remains elsewhere
6. confirm module CTA still maps to `evergreen_sale_hub__mid__official_current_sale`

If official proof is missing:

- stop and keep `generic_latest_check_state`

## 16. `1018` Exclusion Check

Before marking any page complete:

1. check CTA layers
2. check inline support references
3. check internal-link clusters
4. check FAQ
5. check end-of-page routing

If `1018` appears in routine routing:

- stop reflection for that page

## 17. Post-Reflection Desktop Check

For each page:

1. confirm top / mid / end structure order
2. confirm official CTA remains primary
3. confirm fallback cluster remains secondary
4. confirm FAQ placement is correct
5. confirm no visual hierarchy inversion

## 18. Post-Reflection Mobile Check

For each page:

1. confirm stacked module order
2. confirm primary CTA remains reachable
3. confirm `994` reassurance-to-CTA proximity
4. confirm `954` module readability
5. confirm compact fallback cluster behavior

## 19. `fanza_cta_click` Verification

After page-level reflection and before moving to the next page:

1. verify the expected CTA inventory for the page
2. verify page-level event mapping against the measurement spec
3. verify `954` module CTA uses:
   - `evergreen_sale_hub__mid__official_current_sale`
4. verify no CTA was reflected without a clean `cta_id` decision

## 20. Stale Campaign Residue Check

Run this check especially for `954`:

1. hero
2. evergreen intro
3. comparison guidance section
4. FAQ
5. internal-link cluster
6. end-of-page composition
7. current-campaign module

If stale campaign residue exists anywhere outside the allowed module:

- stop reflection and move to rollback or revision

## 21. Exaggeration / Certainty Check

Stop reflection for the page if any of the following remains:

1. `絶対`
2. `必ず`
3. `最安`
4. guaranteed benefit language
5. guaranteed safety language
6. fixed current-sale claims without official support
7. outdated sale language presented as current

## 22. Connection To `GO / HOLD / NO-GO`

After finishing one page:

1. run the page-level QA checklist
2. run the review / validation order checklist
3. map the result into `GO / HOLD / NO-GO`

Decision use:

- `GO`
  - page is complete enough to move to the next page
- `HOLD`
  - do not move to the next page until the blocking item is resolved
- `NO-GO`
  - revert or revise before any further implementation

## 23. Rollback Procedure

If rollback is required for a page:

1. stop work on later pages
2. identify the last stable pre-edit backup for that page
3. identify which paste units caused the break
4. restore the page to the last stable backup state
5. re-run page-level QA
6. log the rollback reason and impacted paste units

## 24. Work Log Format

Use this structured record per page:

```text
work_date:
page_id:
page_type:
paste_units_applied:
954_state:
cta_check:
internal_link_check:
faq_check:
measurement_check:
desktop_check:
mobile_check:
stale_campaign_check:
1018_check:
decision: GO | HOLD | NO-GO
rollback_needed:
notes:
```

## 25. Stop Conditions For One-Page-At-A-Time Reflection

Do not proceed to the next page if any of the following is true:

1. current page has not reached `GO`
2. current page has unresolved `HOLD`
3. current page is `NO-GO`
4. CTA measurement mapping is unresolved
5. `1018` appears in routing
6. stale campaign residue exists
7. exaggerated or unsupported claims remain
8. desktop or mobile hierarchy still fails review
