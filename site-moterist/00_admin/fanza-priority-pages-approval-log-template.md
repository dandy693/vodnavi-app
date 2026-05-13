# FANZA Priority Pages Approval Log Template

## 1. Purpose

This template defines how to record approval history for the four priority FANZA pages across review, validation, and future implementation-preparation checkpoints.

Its goals are:

- keep `GO / HOLD / NO-GO` decisions traceable after the fact
- make it clear who reviewed, who approved, and what was blocked
- preserve page-level and paste-unit-level decision history
- ensure `954` state handling, `1018` exclusion, and `fanza_cta_click` checks are recorded explicitly

This is a template only and does not authorize production edits.

## 2. Target Pages

- `1095` `Beginner Guide`
- `1106` `Registration / Benefits Guide`
- `994` `Safety / Anxiety Resolution`
- `954` `Evergreen Sale Hub`

## 3. Recording Units

Approval history should be recorded at the following units when relevant:

- page level
- paste-unit level
- CTA level
- QA checkpoint level
- measurement confirmation level

## 4. `GO / HOLD / NO-GO` Recording Format

Use the following values only:

- `GO`
- `HOLD`
- `NO-GO`

Required rule:

- every decision record must include a reason
- every `HOLD` or `NO-GO` record must include a next action

## 5. Role Fields

Include these identity fields in all major records:

- `approver`
- `reviewer`
- `operator`
- `secondary_checker` if used

## 6. Timestamp Fields

Include these time fields where relevant:

- `review_started_at`
- `review_completed_at`
- `approval_recorded_at`
- `followup_due_at` for `HOLD`

## 7. Page-Level Approval Template

```text
approval_date:
page_id:
page_type:
page_role:
decision: GO | HOLD | NO-GO
review_scope:
reviewer:
approver:
operator:
review_started_at:
review_completed_at:
approval_recorded_at:
qa_status:
measurement_status:
1018_exclusion_status:
stale_campaign_status:
notes:
next_action:
```

## 8. Paste-Unit Approval Template

```text
approval_date:
page_id:
paste_unit_id:
paste_unit_role:
intended_position:
decision: GO | HOLD | NO-GO
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

## 9. CTA Approval Template

```text
approval_date:
page_id:
cta_scope:
placement:
cta_label:
cta_id:
link_target:
decision: GO | HOLD | NO-GO
reviewer:
approver:
role_alignment_check:
official_cta_priority_check:
copy_safety_check:
measurement_alignment_check:
notes:
next_action:
```

## 10. Internal-Link Cluster Approval Template

```text
approval_date:
page_id:
cluster_scope:
decision: GO | HOLD | NO-GO
reviewer:
approver:
placement_check:
role_alignment_check:
cta_subordination_check:
1018_exclusion_check:
notes:
next_action:
```

## 11. FAQ Approval Template

```text
approval_date:
page_id:
faq_scope:
decision: GO | HOLD | NO-GO
reviewer:
approver:
role_alignment_check:
question_relevance_check:
stability_check:
non_competition_check:
notes:
next_action:
```

## 12. `954` `generic_latest_check_state` Approval Template

This is the default `954` state template.

```text
approval_date:
page_id: 954
state: generic_latest_check_state
decision: GO | HOLD | NO-GO
reviewer:
approver:
default_state_check:
no_named_campaign_outside_module_check:
no_date_outside_module_check:
no_discount_outside_module_check:
cta_label_check:
evergreen_end_section_check:
notes:
next_action:
```

## 13. `954` `active_campaign_state` Approval Template

Use this only if official confirmation exists.

```text
approval_date:
page_id: 954
state: active_campaign_state
decision: GO | HOLD | NO-GO
reviewer:
approver:
official_confirmation_source:
campaign_name_check:
campaign_period_check:
campaign_scope_check:
module_only_check:
evergreen_hero_check:
evergreen_end_section_check:
rollback_ready_check:
notes:
next_action:
```

Rule:

- if official confirmation source is blank, the record must be `NO-GO`

## 14. `fanza_cta_click` Measurement Confirmation Template

```text
approval_date:
page_id:
event_name_check:
page_type_check:
page_role_check:
placement_check:
cta_id_check:
link_target_check:
decision: GO | HOLD | NO-GO
reviewer:
approver:
notes:
next_action:
```

## 15. `1018` Exclusion Confirmation Template

```text
approval_date:
page_id:
decision: GO | HOLD | NO-GO
reviewer:
approver:
cta_layer_check:
inline_reference_check:
internal_link_cluster_check:
faq_check:
end_of_page_check:
notes:
next_action:
```

## 16. Stale Campaign / Exaggeration Check Fields

Include these fields wherever relevant, especially for `954`:

- `stale_campaign_name_check`
- `stale_campaign_date_check`
- `stale_discount_check`
- `certainty_language_check`
- `guaranteed_benefit_check`
- `guaranteed_safety_check`
- `unsupported_sale_claim_check`

## 17. `HOLD` Memo Block

Use this block whenever the decision is `HOLD`:

```text
hold_reason:
blocking_item:
required_confirmation:
required_revision:
responsible_reference_file:
recheck_owner:
followup_due_at:
```

## 18. `NO-GO` Return Block

Use this block whenever the decision is `NO-GO`:

```text
no_go_reason:
failed_condition:
affected_page_or_unit:
return_to_file:
rollback_needed:
rework_owner:
re_review_required:
```

## 19. Final `GO` Decision Log

Use this summary block when a page clears all local gates:

```text
final_go_date:
page_id:
page_type:
decision: GO
review_scope_completed:
paste_units_cleared:
cta_validation_cleared:
internal_link_validation_cleared:
faq_validation_cleared:
measurement_validation_cleared:
954_state:
1018_exclusion_cleared:
stale_campaign_cleared:
approver:
reviewer:
operator:
notes:
```

## 20. Difference From `operation-log.md`

Use the two files differently:

- `fanza-priority-pages-approval-log-template.md`
  - structured per-page / per-unit decision history
  - used for `GO / HOLD / NO-GO` traceability
  - used for approval and validation evidence

- `operation-log.md`
  - broader work diary
  - records what design work was created or updated in the project
  - records that production was not touched during the design phase
