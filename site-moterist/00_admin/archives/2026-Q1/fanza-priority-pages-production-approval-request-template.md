# FANZA Priority Pages Production Approval Request Template

## 1. Purpose

This template defines the page-by-page approval request format that should be prepared before any future production reflection is attempted.

Its goals are:

- keep production approval requests page-scoped
- ensure only approved paste units are proposed for reflection
- preserve traceability between request, review, validation, and final decision
- prevent `954` state misuse, `1018` routing leakage, and measurement drift

This is a request template only. It does not authorize production edits.

## 2. Target Pages

- `1095` `Beginner Guide`
- `1106` `Registration / Benefits Guide`
- `994` `Safety / Anxiety Resolution`
- `954` `Evergreen Sale Hub`

## 3. Request Template By Page

Use one request block per page.

Do not bundle multiple pages into a single approval request.

## 4. Page-Level Request Template

```text
request_date:
page_id:
page_type:
page_role:
request_scope:
requested_by:
reviewer:
approver:
intended_execution_date:
decision: GO | HOLD | NO-GO
notes:
```

## 5. Paste Units To Be Reflected

Use this block to list only the paste units that are intended for the page.

```text
page_id:
paste_units_to_apply:
- 
- 
- 
paste_unit_order_confirmed:
review_reference:
```

## 6. Paste Units Not To Be Reflected

Use this block to make exclusions explicit.

```text
page_id:
paste_units_not_applied:
- 
- 
- 
reason_for_exclusion:
```

## 7. `GO / HOLD / NO-GO` Decision Block

```text
page_id:
decision: GO | HOLD | NO-GO
decision_reason:
blocking_items:
required_followup:
decision_recorded_at:
recorded_by:
```

## 8. Pre-Reflection Check Block

```text
page_id:
precheck_completed:
backup_confirmed:
paste_unit_order_confirmed:
qa_reference_confirmed:
measurement_reference_confirmed:
rollback_source_confirmed:
notes:
```

## 9. Post-Reflection Check Block

This section should exist in the request template so the same sheet can later hold closeout evidence.

```text
page_id:
postcheck_completed:
desktop_check_completed:
mobile_check_completed:
cta_check_completed:
measurement_check_completed:
stale_campaign_check_completed:
notes:
```

## 10. CTA Confirmation Block

```text
page_id:
top_cta_check:
mid_cta_check:
end_cta_check:
cta_copy_role_alignment:
official_cta_priority_check:
fanza_cta_click_alignment:
notes:
```

## 11. Internal-Link Cluster Confirmation Block

```text
page_id:
cluster_present:
cluster_position_check:
cluster_role_alignment_check:
cluster_subordination_check:
1018_exclusion_check:
notes:
```

## 12. FAQ Confirmation Block

```text
page_id:
faq_present:
faq_role_alignment_check:
faq_stability_check:
faq_non_competition_check:
notes:
```

## 13. `fanza_cta_click` Measurement Confirmation Block

```text
page_id:
event_name_check:
page_type_check:
page_role_check:
placement_check:
cta_id_check:
link_target_check:
decision:
notes:
```

Rule:

- if any required measurement field is unresolved, request status cannot be `GO`

## 14. `954` `generic_latest_check_state` Confirmation Block

This is the default `954` approval block.

```text
page_id: 954
state: generic_latest_check_state
default_state_confirmed:
no_named_campaign_outside_module:
no_date_outside_module:
no_discount_outside_module:
evergreen_hero_confirmed:
evergreen_end_confirmed:
cta_label_confirmed:
decision:
notes:
```

## 15. `954` `active_campaign_state` Usage Block

Use this block only if an active campaign is officially confirmed.

```text
page_id: 954
state: active_campaign_state
official_confirmation_source:
campaign_name_confirmed:
campaign_period_confirmed:
campaign_scope_confirmed:
module_only_check:
evergreen_hero_confirmed:
evergreen_end_confirmed:
rollback_ready_check:
usage_allowed: YES | NO
decision:
notes:
```

Rules:

- default request assumption is `generic_latest_check_state`
- `usage_allowed` must be `NO` if official confirmation source is blank

## 16. `1018` Exclusion Confirmation Block

```text
page_id:
cta_layer_check:
inline_reference_check:
internal_link_cluster_check:
faq_check:
end_of_page_check:
decision:
notes:
```

This block is mandatory for all four pages.

## 17. Stale Campaign / Exaggeration Check Block

```text
page_id:
stale_campaign_name_check:
stale_campaign_date_check:
stale_discount_check:
certainty_language_check:
guaranteed_benefit_check:
guaranteed_safety_check:
unsupported_sale_claim_check:
decision:
notes:
```

Rule:

- if any stale campaign residue or exaggerated / certainty-based claim remains, the request must be recordable as `NO-GO`

## 18. Rollback Readiness Confirmation Block

```text
page_id:
pre_edit_backup_confirmed:
restore_point_confirmed:
paste_unit_scope_confirmed:
rollback_owner_confirmed:
rollback_notes:
decision:
```

## 19. Stop Conditions

The request must explicitly support a stop decision if any of the following is true:

1. page-level QA is incomplete
2. `fanza_cta_click` alignment is unresolved
3. `1018` appears in routing
4. stale campaign residue exists
5. exaggerated or unsupported claims exist
6. `954` `active_campaign_state` lacks official confirmation
7. rollback readiness is incomplete

## 20. Identity And Time Fields

Include these fields on every request:

- `requested_by`
- `reviewer`
- `approver`
- `operator`
- `request_created_at`
- `review_started_at`
- `review_completed_at`
- `approval_recorded_at`

## 21. Difference From Approval Log Template

Use the two files differently:

- `fanza-priority-pages-production-approval-request-template.md`
  - prepared before production reflection is attempted
  - records what is being requested and proposed
  - focuses on scope, requested paste units, and approval readiness

- `fanza-priority-pages-approval-log-template.md`
  - records what was reviewed and decided
  - focuses on decision history and evidence after review

## 22. Relation To `operation-log.md`

Use `operation-log.md` for project-level work history only.

Do not use it as the primary page-level approval request sheet.

Recommended split:

- `operation-log.md`
  - what design work was created
  - that production was not touched
  - what the next planning step is

- production approval request template
  - request scope
  - request status
  - page-by-page approval readiness
