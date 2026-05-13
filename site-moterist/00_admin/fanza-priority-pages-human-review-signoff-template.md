# FANZA Priority Pages Human Review Sign-Off Template

## 1. Purpose

This document defines the sign-off recording template to be used after human review for the four priority FANZA pages.

Its goals are:

- provide a standard recording format after manual review is completed
- preserve `GO / HOLD / NO-GO` outcomes in a consistent structure
- connect review evidence to the later WordPress implementation runbook without authorizing it by default
- keep each page independent so approval can move one page at a time

This template is for human-review recording only. It is not an automatic approval mechanism.

## 2. Target Pages

- `1095` `Beginner Guide`
- `1106` `Registration / Benefits Guide`
- `994` `Safety / Anxiety Resolution`
- `954` `Evergreen Sale Hub`

## 3. Shared Sign-Off Instructions

Use this template only after human review has been performed.

Important:

- do not treat this template as a production execution order
- do not treat this template as automatic approval
- do not move all four pages together
- even if a page becomes `GO`, proceed page-by-page starting from `1095`

Required decision values:

- `GO`
- `HOLD`
- `NO-GO`

## 4. Shared Sign-Off Header

```text
page_id:
page_type:
page_role:
reviewer:
approver:
operator:
secondary_checker:
review_started_at:
review_completed_at:
signoff_recorded_at:
final_decision:
decision_summary:
```

## 5. Shared `GO` Confirmation Items

If a page is signed off as `GO`, all of the following must already be confirmed:

1. page role is still dominant and unblended
2. official CTA remains primary
3. `fanza_cta_click` is aligned
4. internal-link cluster remains secondary
5. FAQ remains role-appropriate
6. `1018` is excluded
7. stale campaign residue is absent
8. exaggerated or certainty-based copy is absent
9. desktop and mobile hierarchy checks passed
10. rollback readiness is attached

## 6. Shared `HOLD` Recording Rule

If a page remains `HOLD`, record:

1. the exact open items
2. whether the blocker is evidence-related or content-logic-related
3. the next required action
4. who needs to act next

Recommended format:

```text
hold_reason:
blocking_items:
- 
- 
next_required_action:
next_owner:
```

## 7. Shared `NO-GO` Recording Rule

If a page becomes `NO-GO`, record:

1. exact rejection reason
2. whether the issue is fatal or structural
3. which design rule was violated
4. what must be fixed before re-review

Recommended format:

```text
no_go_reason:
violated_rule:
required_revision:
recheck_needed: yes
```

## 8. Shared Evidence Reference Fields

Every sign-off record should reference evidence artifacts:

```text
evidence_file_refs:
- 
- 
evidence_note_refs:
- 
- 
```

## 9. Shared Review Result Blocks

### `fanza_cta_click` Result Block

```text
measurement_result:
event_name_check:
page_type_check:
page_role_check:
placement_check:
cta_id_check:
link_target_check:
result:
notes:
```

### Internal-Link Cluster Result Block

```text
internal_link_cluster_result:
cluster_scope:
cta_subordination_check:
role_boundary_check:
1018_exclusion_check:
result:
notes:
```

### FAQ Result Block

```text
faq_result:
faq_scope:
role_alignment_check:
competing_route_check:
stale_fact_check:
result:
notes:
```

### `1018` Exclusion Result Block

```text
pending_source_material_exclusion_result:
cta_route_check:
cluster_check:
faq_check:
end_of_page_check:
result:
notes:
```

### Stale Campaign Result Block

```text
stale_campaign_result:
campaign_name_check:
campaign_date_check:
discount_figure_check:
urgency_phrase_check:
result:
notes:
```

### Expression Result Block

```text
expression_result:
guaranteed_outcome_check:
guaranteed_safety_check:
guaranteed_savings_check:
certainty_phrase_check:
result:
notes:
```

### Layout Result Block

```text
layout_result:
desktop_hierarchy_check:
mobile_hierarchy_check:
cta_prominence_check:
cluster_subordination_check:
role_consistency_check:
result:
notes:
```

### Rollback Result Block

```text
rollback_readiness_result:
backup_reference:
rollback_owner:
rollback_source_note:
rollback_scope_note:
result:
notes:
```

## 10. `1095` Page-Specific Sign-Off Template

```text
page_id: 1095
page_type: beginner_guide
page_role: 初心者導入・不安低減・登録導線

role_integrity_check:
- beginner-first orientation preserved
- anxiety reduction appears before stronger conversion push
- page does not behave like 1106 / 994 / 954

final_decision:
decision_summary:
hold_reason:
no_go_reason:
next_required_action:
```

## 11. `1106` Page-Specific Sign-Off Template

```text
page_id: 1106
page_type: registration_benefits_guide
page_role: 登録メリット・特典理解・登録導線

role_integrity_check:
- benefits-first orientation preserved
- value understanding remains primary
- page does not behave like 1095 / 994 / 954

final_decision:
decision_summary:
hold_reason:
no_go_reason:
next_required_action:
```

## 12. `994` Page-Specific Sign-Off Template

```text
page_id: 994
page_type: safety_anxiety_resolution
page_role: 安全性・不安解消・登録導線

role_integrity_check:
- reassurance-first orientation preserved
- strongest CTA appears naturally after anxiety reduction
- page does not behave like 1095 / 1106 / 954

final_decision:
decision_summary:
hold_reason:
no_go_reason:
next_required_action:
```

## 13. `954` Page-Specific Sign-Off Template

```text
page_id: 954
page_type: evergreen_sale_hub
page_role: 現在のセール確認・公式確認導線

role_integrity_check:
- current sale confirmation remains the dominant route
- page still reads as evergreen, not seasonal
- page does not behave like 1095 / 1106 / 994

generic_latest_check_state_result:
default_state_check:
official_current_sale_route_check:
evergreen_body_neutrality_check:
campaign_detail_exclusion_check:
result:
notes:

active_campaign_state_result:
review_needed:
official_confirmation_check:
active_status_check:
campaign_block_boundary_check:
evergreen_integrity_check:
usage_allowed:
result:
notes:

final_decision:
decision_summary:
hold_reason:
no_go_reason:
next_required_action:
```

## 14. Sign-Off Requirements Before WordPress Runbook

A page may move to the WordPress implementation runbook only if:

1. final decision is explicitly recorded
2. required evidence references are attached
3. `GO` conditions are fully met
4. there is no unresolved `HOLD` blocker
5. there is no `NO-GO` issue

Even then, move one page at a time in this order:

1. `1095`
2. `1106`
3. `994`
4. `954`

## 15. Recommended Sign-Off Footer

```text
runbook_ready:
yes_or_no:

if_no_reason:

next_page_allowed_to_start:

notes_for_operation_log:
```

## 16. `operation-log.md` Recording Example

```text
### FANZA Human Review Sign-Off Template
- 本番WordPressには触れず、4ページ分の human review 後 sign-off recording template をローカル文書として作成
- 作成:
- 00_admin/fanza-priority-pages-human-review-signoff-template.md
- 重要方針:
- 人間確認後の記録用であり、自動承認ではない
- 4ページまとめて GO にせず、1095 から1ページずつ判断する
- 954 は generic_latest_check_state をデフォルト確認対象にし、active_campaign_state は公式確認時のみ使用可
- 1018 除外、fanza_cta_click 整合、stale campaign 排除、誇大表現排除を sign-off 条件として記録できるようにした
- 本番WordPress、管理画面保存、SSH、DB、記事本文、taxonomy は未変更
```
