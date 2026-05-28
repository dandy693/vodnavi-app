# FANZA Priority Pages Approval Log / Request Samples

## 1. Purpose

This file provides `SAMPLE / EXAMPLE` entries for the approval log and production approval request templates.

Important:

- these are examples only
- these are not real approved production records
- these entries must not be mistaken for completed implementation logs

## 2. How To Use Approval Log Vs Production Approval Request

### Production Approval Request Example Use

- prepared before any future production reflection is attempted
- states what page is being proposed
- lists intended paste units
- records requested state, requested scope, and stop conditions

### Approval Log Example Use

- recorded after review / validation has been performed
- states whether the page or unit was `GO`, `HOLD`, or `NO-GO`
- preserves the reason, blocker, and next action

## 3. `1095` `GO` Sample

### Production Approval Request Example

```text
SAMPLE / EXAMPLE
request_date: 2026-05-08
page_id: 1095
page_type: beginner_guide
page_role: entry
request_scope: reflect approved beginner-guide paste units only
requested_by: sample_operator
reviewer: sample_reviewer
approver: sample_approver
intended_execution_date: 2026-05-09
decision: GO
notes: beginner-first structure confirmed; no production action executed yet
```

### Approval Log Example

```text
SAMPLE / EXAMPLE
approval_date: 2026-05-08
page_id: 1095
page_type: beginner_guide
page_role: entry
decision: GO
review_scope: page-level role, CTA, FAQ, measurement, end-of-page routing
reviewer: sample_reviewer
approver: sample_approver
operator: sample_operator
review_started_at: 2026-05-08 10:00
review_completed_at: 2026-05-08 10:25
approval_recorded_at: 2026-05-08 10:30
qa_status: pass
measurement_status: pass
1018_exclusion_status: pass
stale_campaign_status: n/a
notes: beginner-first role preserved; benefits-heavy copy not leading the page
next_action: page may proceed to the next approved local preparation step
```

## 4. `1106` `GO` Sample

```text
SAMPLE / EXAMPLE
approval_date: 2026-05-08
page_id: 1106
page_type: registration_benefits_guide
page_role: consideration
decision: GO
review_scope: benefit-value framing, official CTA priority, fallback routing
reviewer: sample_reviewer
approver: sample_approver
operator: sample_operator
qa_status: pass
measurement_status: pass
1018_exclusion_status: pass
stale_campaign_status: pass
notes: page reads as benefits-first; `994` stays fallback-only
next_action: maintain page-level order for future implementation
```

## 5. `994` `GO` Sample

```text
SAMPLE / EXAMPLE
approval_date: 2026-05-08
page_id: 994
page_type: safety_anxiety_resolution
page_role: objection_handling
decision: GO
review_scope: reassurance block, mid CTA proximity, FAQ relevance
reviewer: sample_reviewer
approver: sample_approver
operator: sample_operator
qa_status: pass
measurement_status: pass
1018_exclusion_status: pass
stale_campaign_status: n/a
notes: main CTA appears directly after reassurance; sale path remains secondary
next_action: retain trust-first order in any later implementation session
```

## 6. `954` `generic_latest_check_state` `GO` Sample

### Production Approval Request Example

```text
SAMPLE / EXAMPLE
request_date: 2026-05-08
page_id: 954
page_type: evergreen_sale_hub
page_role: commercial_conversion_hub
request_scope: evergreen sale hub with default generic latest-check state
requested_by: sample_operator
reviewer: sample_reviewer
approver: sample_approver
decision: GO
notes: default generic state requested; no active campaign claim proposed
```

### Approval Log Example

```text
SAMPLE / EXAMPLE
approval_date: 2026-05-08
page_id: 954
state: generic_latest_check_state
decision: GO
reviewer: sample_reviewer
approver: sample_approver
default_state_check: pass
no_named_campaign_outside_module_check: pass
no_date_outside_module_check: pass
no_discount_outside_module_check: pass
cta_label_check: pass
evergreen_end_section_check: pass
notes: page remains evergreen; current sale confirmation stays primary at top, mid, and end
next_action: retain generic state unless official campaign confirmation exists
```

## 7. `954` `active_campaign_state` `HOLD` Sample

```text
SAMPLE / EXAMPLE
approval_date: 2026-05-08
page_id: 954
state: active_campaign_state
decision: HOLD
reviewer: sample_reviewer
approver: sample_approver
official_confirmation_source:
campaign_name_check: pending
campaign_period_check: pending
campaign_scope_check: pending
module_only_check: pass
evergreen_hero_check: pass
evergreen_end_section_check: pass
rollback_ready_check: pass
notes: active state request submitted, but official campaign proof not attached
next_action: obtain official confirmation or revert request to generic_latest_check_state
```

## 8. `NO-GO` Samples

### Stale Campaign Information Remains

```text
SAMPLE / EXAMPLE
approval_date: 2026-05-08
page_id: 954
decision: NO-GO
no_go_reason: stale campaign residue remains in evergreen intro
failed_condition: old campaign date visible outside current_campaign_module
affected_page_or_unit: 954-pu02
return_to_file: 00_admin/fanza-priority-pages-paste-units.md
rollback_needed: yes
rework_owner: sample_operator
re_review_required: yes
```

### `fanza_cta_click` Mismatch

```text
SAMPLE / EXAMPLE
approval_date: 2026-05-08
page_id: 1106
decision: NO-GO
no_go_reason: measurement mapping mismatch
failed_condition: end CTA cta_id does not match approved taxonomy
affected_page_or_unit: 1106-pu08
return_to_file: 00_admin/fanza-cta-measurement-spec.md
rollback_needed: no
rework_owner: sample_operator
re_review_required: yes
```

### `1018` Appears In Normal Routing

```text
SAMPLE / EXAMPLE
approval_date: 2026-05-08
page_id: 1095
decision: NO-GO
no_go_reason: excluded page entered routine routing
failed_condition: internal-link cluster includes 1018
affected_page_or_unit: 1095-pu06
return_to_file: 00_admin/fanza-fallback-internal-link-cluster-spec.md
rollback_needed: no
rework_owner: sample_operator
re_review_required: yes
```

### Exaggeration / Certainty Language

```text
SAMPLE / EXAMPLE
approval_date: 2026-05-08
page_id: 994
decision: NO-GO
no_go_reason: unsupported certainty wording remains
failed_condition: copy includes guaranteed safety phrasing
affected_page_or_unit: 994-pu03
return_to_file: 00_admin/fanza-priority-pages-section-rewrite-drafts.md
rollback_needed: no
rework_owner: sample_operator
re_review_required: yes
```

## 9. `HOLD` Samples

### Official Campaign Confirmation Pending

```text
SAMPLE / EXAMPLE
hold_reason: official campaign status not yet verified
blocking_item: active_campaign_state request for 954
required_confirmation: official campaign source URL or screenshot
required_revision: keep request in generic_latest_check_state until confirmed
responsible_reference_file: 00_admin/fanza-954-current-campaign-module-spec.md
recheck_owner: sample_reviewer
followup_due_at: 2026-05-09 12:00
```

### CTA Destination Not Confirmed

```text
SAMPLE / EXAMPLE
hold_reason: CTA target needs recheck
blocking_item: official FANZA destination for top CTA
required_confirmation: final target mapping
required_revision: do not promote to GO until link_target is fixed
responsible_reference_file: 00_admin/fanza-cta-measurement-spec.md
recheck_owner: sample_operator
followup_due_at: 2026-05-09 09:00
```

### Mobile Validation Pending

```text
SAMPLE / EXAMPLE
hold_reason: mobile hierarchy not yet checked
blocking_item: fallback cluster spacing on narrow layout
required_confirmation: mobile validation pass
required_revision: confirm CTA remains visually primary on mobile
responsible_reference_file: 00_admin/fanza-priority-pages-pre-publish-qa-checklist.md
recheck_owner: sample_reviewer
followup_due_at: 2026-05-09 15:00
```

## 10. Paste Unit Entry Example

```text
SAMPLE / EXAMPLE
approval_date: 2026-05-08
page_id: 1095
paste_unit_id: 1095-pu04
paste_unit_role: mid primary CTA block
intended_position: after confusion-reduction section
decision: GO
reviewer: sample_reviewer
approver: sample_approver
operator: sample_operator
review_completed_at: 2026-05-08 11:10
replacement_area: existing mid CTA block
kept_area: surrounding orientation copy
role_alignment_check: pass
cta_check: pass
internal_link_check: n/a
faq_check: n/a
notes: official latest-info CTA remains primary
next_action: proceed to end-of-page composition review
```

## 11. CTA Entry Example

```text
SAMPLE / EXAMPLE
approval_date: 2026-05-08
page_id: 1106
cta_scope: mid primary CTA
placement: mid
cta_label: FANZA公式で登録前の案内を確認する
cta_id: registration_benefits_guide__mid__official_registration_benefits
link_target: official_fanza
decision: GO
reviewer: sample_reviewer
approver: sample_approver
role_alignment_check: pass
official_cta_priority_check: pass
copy_safety_check: pass
measurement_alignment_check: pass
notes: benefits-first page role preserved
next_action: validate end CTA
```

## 12. Internal-Link Cluster Entry Example

```text
SAMPLE / EXAMPLE
approval_date: 2026-05-08
page_id: 994
cluster_scope: end fallback internal-link cluster
decision: GO
reviewer: sample_reviewer
approver: sample_approver
placement_check: pass
role_alignment_check: pass
cta_subordination_check: pass
1018_exclusion_check: pass
notes: sale route remains secondary to reassurance flow
next_action: continue to FAQ review
```

## 13. FAQ Entry Example

```text
SAMPLE / EXAMPLE
approval_date: 2026-05-08
page_id: 954
faq_scope: evergreen FAQ block
decision: GO
reviewer: sample_reviewer
approver: sample_approver
role_alignment_check: pass
question_relevance_check: pass
stability_check: pass
non_competition_check: pass
notes: FAQ remains how-to-check oriented, not campaign-specific
next_action: continue to stale-campaign sweep
```

## 14. `fanza_cta_click` Measurement Example

```text
SAMPLE / EXAMPLE
approval_date: 2026-05-08
page_id: 954
event_name_check: pass
page_type_check: pass
page_role_check: pass
placement_check: pass
cta_id_check: pass
link_target_check: pass
decision: GO
reviewer: sample_reviewer
approver: sample_approver
notes: module CTA aligned to evergreen_sale_hub__mid__official_current_sale
next_action: final GO summary may be prepared
```

## 15. Final `GO` Decision Example

```text
SAMPLE / EXAMPLE
final_go_date: 2026-05-08
page_id: 1095
page_type: beginner_guide
decision: GO
review_scope_completed: role / paste units / CTA / cluster / FAQ / measurement
paste_units_cleared: 1095-pu01 to 1095-pu08
cta_validation_cleared: yes
internal_link_validation_cleared: yes
faq_validation_cleared: yes
measurement_validation_cleared: yes
954_state: n/a
1018_exclusion_cleared: yes
stale_campaign_cleared: n/a
approver: sample_approver
reviewer: sample_reviewer
operator: sample_operator
notes: local planning package ready for next approved step
```

## 16. `operation-log.md` Summary Example

Use `operation-log.md` only for a short project-level summary, for example:

```text
SAMPLE / EXAMPLE
### FANZA Approval Log Sample Design
- approval log / production approval request の記入例サンプルを作成
- 対象: 1095 / 1106 / 994 / 954
- GO / HOLD / NO-GO の example を追加
- 本番WordPress、管理画面保存、SSH、DB、記事本文、taxonomy は未変更
- 次に進むべき作業: 954 state 切り替え運用手順を別紙化
```
