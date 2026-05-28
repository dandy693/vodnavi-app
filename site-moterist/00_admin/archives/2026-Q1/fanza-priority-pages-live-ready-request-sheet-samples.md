# FANZA Priority Pages Live-Ready Request Sheet Samples

## 1. Purpose

This document provides sample filled examples for the live-ready request sheets prepared for the four priority FANZA pages.

Its goals are:

- show how a reviewer would fill the request sheet before any WordPress reflection
- keep page-role boundaries visible in example form
- provide example wording for `HOLD`, residual checks, and escalation rules
- make it clear that the current state is still pre-approval, not final approval

This is a local planning artifact only.

## 2. Important Notice

`SAMPLE / EXAMPLE ONLY`

- this file is not an actual approval record
- this file does not mean any page is approved
- this file does not authorize WordPress production edits
- all page examples below remain `HOLD` because human confirmation has not been completed yet

## 3. How To Read These Samples

Use these entries as examples for:

- how to record current status
- how to describe missing checks
- how to document `fanza_cta_click`
- how to record `1018` exclusion
- how to document `HOLD`, hypothetical `GO`, and `NO-GO`

If a future real request is created, it must be filled with live review evidence and timestamps rather than copied as-is.

## 4. `1095` `Beginner Guide` Sample Filled Example

### Sample Page Header

```text
sample_flag: SAMPLE / EXAMPLE ONLY
page_id: 1095
page_type: beginner_guide
page_role: 初心者導入・不安低減・登録導線
current_decision: HOLD
```

### Sample `HOLD` Reason

```text
hold_reason:
- beginner-first structure is designed, but human review has not yet confirmed that the page still reads as entry guidance rather than benefits-first content
- final official CTA destination confirmation is pending
- desktop and mobile visual checks are not yet signed off
```

### Sample Remaining Checks To Reach `GO`

```text
remaining_checks_for_go:
- confirm that top and mid CTA remain official-primary
- confirm that internal-link cluster stays secondary to the official CTA
- confirm that beginner anxiety reduction comes before registration push
- confirm fanza_cta_click parameter mapping for all in-scope CTA placements
- confirm rollback reference is attached
```

### Sample Paste Unit / CTA / FAQ Recording

```text
paste_units_in_scope:
- 1095-pu01
- 1095-pu02
- 1095-pu03
- 1095-pu04
- 1095-pu05
- 1095-pu06
- 1095-pu07
- 1095-pu08

cta_in_scope:
- top_official_beginner_cta
- mid_official_beginner_cta
- end_internal_benefits_cta
- end_internal_safety_cta

cta_copy_check:
- top CTA stays beginner-friendly and does not jump straight into benefit maximization
- mid CTA follows anxiety-lowering explanation

faq_check:
- FAQ remains beginner-oriented
- FAQ does not drift into sale-specific or actress-specific content
```

### Sample `fanza_cta_click` Entry

```text
event_name: fanza_cta_click
page_type: beginner_guide
page_role: entry
placement_check:
- top
- mid
- end
cta_id_check:
- 1095_top_beginner_official
- 1095_mid_beginner_official
- 1095_end_internal_benefits
link_target_check: pending human confirmation
decision: HOLD
notes: event structure is aligned in design, but live destination validation is still pending
```

### Sample Internal-Link Cluster Entry

```text
cluster_check:
status: HOLD
scope: 1095-pu06
notes:
- cluster supports next-step reading only
- cluster does not outrank the official CTA
- 1018 is not included
```

### Sample `1018` Exclusion / Stale Campaign / Expression Checks

```text
1018_exclusion_check:
status: HOLD
result: no routine route to 1018 is included in sample structure
remaining_action: human reconfirmation required before approval

stale_campaign_check:
status: HOLD
result: no campaign-specific names, dates, or discount numbers are planned in the beginner page

expression_check:
status: HOLD
result: no certainty language such as "必ず", "絶対", "最安" should remain
```

### Sample Mobile / Desktop / Rollback Entry

```text
desktop_check: HOLD
mobile_check: HOLD
rollback_readiness: HOLD
notes:
- layout intent is documented
- visual validation and rollback attachment still require human sign-off
```

## 5. `1106` `Registration / Benefits Guide` Sample Filled Example

### Sample Page Header

```text
sample_flag: SAMPLE / EXAMPLE ONLY
page_id: 1106
page_type: registration_benefits_guide
page_role: 登録メリット・特典理解・登録導線
current_decision: HOLD
```

### Sample `HOLD` Reason

```text
hold_reason:
- benefit-first structure is prepared, but human review has not yet confirmed that the page avoids drifting back into generic beginner guidance
- final CTA destination validation is pending
- desktop and mobile display checks remain unsigned
```

### Sample Remaining Checks To Reach `GO`

```text
remaining_checks_for_go:
- confirm that the page remains benefits-first rather than anxiety-first
- confirm that registration value and feature understanding stay primary
- confirm fanza_cta_click mapping for top, mid, and end CTA
- confirm that fallback internal links remain secondary
- confirm rollback metadata is attached
```

### Sample Paste Unit / CTA / FAQ Recording

```text
paste_units_in_scope:
- 1106-pu01
- 1106-pu02
- 1106-pu03
- 1106-pu04
- 1106-pu05
- 1106-pu06
- 1106-pu07

cta_in_scope:
- top_official_benefits_cta
- mid_official_benefits_cta
- end_internal_beginner_cta
- end_internal_safety_cta

faq_check:
- FAQ focuses on registration flow, feature expectations, and account-related basics
- FAQ does not drift into sale-hub language
```

### Sample `fanza_cta_click` Entry

```text
event_name: fanza_cta_click
page_type: registration_benefits_guide
page_role: benefits
placement_check:
- top
- mid
- end
cta_id_check:
- 1106_top_benefits_official
- 1106_mid_benefits_official
- 1106_end_internal_beginner
link_target_check: pending human confirmation
decision: HOLD
notes: naming is aligned, but live-click destination review is not complete
```

### Sample Internal-Link Cluster / Exclusion / Expression Checks

```text
cluster_check:
status: HOLD
result:
- supports next-step comparison only
- does not replace the official registration-oriented CTA
- 1018 is excluded

1018_exclusion_check:
status: HOLD
result: no planned route to pending source material

expression_check:
status: HOLD
result: remove any copy that implies guaranteed savings or guaranteed outcome
```

### Sample Mobile / Desktop / Rollback Entry

```text
desktop_check: HOLD
mobile_check: HOLD
rollback_readiness: HOLD
notes:
- module order is stable in planning
- human sign-off is still required
```

## 6. `994` `Safety / Anxiety Resolution` Sample Filled Example

### Sample Page Header

```text
sample_flag: SAMPLE / EXAMPLE ONLY
page_id: 994
page_type: safety_anxiety_resolution
page_role: 安全性・不安解消・登録導線
current_decision: HOLD
```

### Sample `HOLD` Reason

```text
hold_reason:
- reassurance-first structure is drafted, but human review has not yet confirmed that the first CTA appears immediately after anxiety reduction as intended
- final official CTA destination validation is pending
- mobile and desktop checks are not yet signed off
```

### Sample Remaining Checks To Reach `GO`

```text
remaining_checks_for_go:
- confirm that anxiety-resolution content precedes the primary CTA
- confirm that the page does not drift into beginner orientation or benefits-first positioning
- confirm fanza_cta_click mapping for top reassurance CTA, post-reassurance CTA, and end CTA
- confirm that internal-link cluster stays supplementary
- confirm rollback metadata is attached
```

### Sample Paste Unit / CTA / FAQ Recording

```text
paste_units_in_scope:
- 994-pu01
- 994-pu02
- 994-pu03
- 994-pu04
- 994-pu05
- 994-pu06
- 994-pu07

cta_in_scope:
- top_official_reassurance_cta
- post_reassurance_official_cta
- end_internal_beginner_cta
- end_internal_benefits_cta

faq_check:
- FAQ addresses common trust and safety anxieties
- FAQ does not become a campaign-information block
```

### Sample `fanza_cta_click` Entry

```text
event_name: fanza_cta_click
page_type: safety_anxiety_resolution
page_role: reassurance
placement_check:
- top
- post_reassurance
- end
cta_id_check:
- 994_top_safety_official
- 994_mid_post_reassurance_official
- 994_end_internal_beginner
link_target_check: pending human confirmation
decision: HOLD
notes: event family is aligned, but live-link validation remains open
```

### Sample Internal-Link Cluster / Exclusion / Stale Campaign Checks

```text
cluster_check:
status: HOLD
result:
- cluster appears after the main reassurance-to-action path
- cluster does not overpower the official CTA
- 1018 is excluded

1018_exclusion_check:
status: HOLD
result: no routine route to pending source material

stale_campaign_check:
status: HOLD
result: no sale-specific stale facts should remain on the reassurance page
```

### Sample Expression / Mobile / Rollback Entry

```text
expression_check:
status: HOLD
result: remove any copy that guarantees safety, anonymity, or problem-free usage

desktop_check: HOLD
mobile_check: HOLD
rollback_readiness: HOLD
```

## 7. `954` `Evergreen Sale Hub` Sample Filled Example

### Sample Page Header

```text
sample_flag: SAMPLE / EXAMPLE ONLY
page_id: 954
page_type: evergreen_sale_hub
page_role: 現在のセール確認・公式確認導線
current_decision: HOLD
default_state: generic_latest_check_state
```

### Sample `HOLD` Reason

```text
hold_reason:
- evergreen structure is prepared, but human review has not yet confirmed that the page remains evergreen and does not read like a temporary campaign article
- current official confirmation path still requires human sign-off
- desktop and mobile hierarchy checks are still pending
```

### Sample Remaining Checks To Reach `GO`

```text
remaining_checks_for_go:
- confirm that generic_latest_check_state is the default reflected state
- confirm that current sale confirmation remains the main action at top, mid, and end
- confirm that no ended campaign name, date, or discount figure remains in evergreen body sections
- confirm fanza_cta_click mapping for sale-check CTA placements
- confirm rollback metadata is attached
```

### Sample Paste Unit / CTA / FAQ Recording

```text
paste_units_in_scope:
- 954-pu01
- 954-pu02
- 954-pu03
- 954-pu04
- 954-pu05
- 954-pu06
- 954-pu07
- 954-pu08

cta_in_scope:
- top_current_sale_official_cta
- mid_current_sale_official_cta
- end_current_sale_official_cta
- end_internal_beginner_cta
- end_internal_benefits_cta

faq_check:
- FAQ explains how to verify the latest sale safely
- FAQ does not preserve ended campaign details
```

### Sample `fanza_cta_click` Entry

```text
event_name: fanza_cta_click
page_type: evergreen_sale_hub
page_role: sale_check
placement_check:
- top
- mid
- end
cta_id_check:
- 954_top_current_sale_official
- 954_mid_current_sale_official
- 954_end_current_sale_official
link_target_check: pending human confirmation
decision: HOLD
notes: event naming is aligned to the evergreen sale role, but link validation is still pending
```

### Sample Generic / Active State Entry

```text
generic_latest_check_state:
status: HOLD
result:
- default reflected state
- evergreen body remains campaign-neutral
- official confirmation CTA remains primary

active_campaign_state:
status: HOLD
usage_permission: not enabled by default
activation_condition:
- current campaign must be officially confirmed
- campaign status must be active at the time of human review
- campaign-specific details must remain inside the replaceable campaign block only
```

### Sample Official Route / Stale Campaign / Exclusion Checks

```text
official_confirmation_route_check:
status: HOLD
result: official sale confirmation path is included as the main action

stale_campaign_check:
status: HOLD
result:
- no ended campaign name in evergreen body
- no ended campaign date in evergreen body
- no past discount percentage in evergreen body

1018_exclusion_check:
status: HOLD
result: no routine route to pending source material
```

### Sample Expression / Mobile / Rollback Entry

```text
expression_check:
status: HOLD
result: remove any copy that claims guaranteed best sale or permanent discount certainty

desktop_check: HOLD
mobile_check: HOLD
rollback_readiness: HOLD
```

## 8. Sample `HOLD` Continuation Example

```text
sample_hypothetical_hold_continuation:
decision: HOLD
reason:
- human reviewer has not yet confirmed final live CTA destination
- desktop/mobile checks remain unsigned
- rollback reference has not yet been attached
next_step:
- keep packet open
- collect human review evidence
- do not move to WordPress implementation runbook yet
```

## 9. Sample Hypothetical `GO` Progression Example

`SAMPLE / EXAMPLE ONLY`

The following is a hypothetical example of how a page could move toward `GO` later. It is not the current state.

```text
sample_hypothetical_go_progression:
decision_before: HOLD
decision_after_review: still pending
conditions_met_example:
- human reviewer confirmed page role integrity
- fanza_cta_click mappings were validated against the approved CTA list
- 1018 exclusion was reconfirmed
- stale campaign check passed
- mobile/desktop checks passed
- rollback reference was attached
note:
- even after these items are filled, final GO requires explicit approval recording
```

## 10. Sample `NO-GO` Examples

### Example A: Stale Campaign Information Remains

```text
sample_no_go_case: stale_campaign_remaining
decision: NO-GO
reason:
- ended campaign name is still present in evergreen body
- past discount percentage remains visible outside the replaceable campaign block
required_action:
- remove stale campaign facts
- re-run stale campaign check
```

### Example B: `fanza_cta_click` Mismatch

```text
sample_no_go_case: measurement_mismatch
decision: NO-GO
reason:
- cta_id in request sheet does not match planned CTA inventory
- placement naming is inconsistent with event design
required_action:
- correct tracking parameter mapping
- revalidate against measurement spec
```

### Example C: `1018` Leakage Into Routine Routing

```text
sample_no_go_case: 1018_leakage
decision: NO-GO
reason:
- pending source material appears in routine internal-link cluster
- page violates the current routing exclusion rule
required_action:
- remove 1018 from routine routes
- recheck end-of-page composition
```

### Example D: Exaggeration / Certainty Language

```text
sample_no_go_case: certainty_copy
decision: NO-GO
reason:
- copy includes guaranteed or absolute wording
- copy implies certain savings or certain safety outcome
required_action:
- replace certainty wording with neutral phrasing
- rerun expression review
```

## 11. Sample `operation-log.md` Recording Example

```text
### FANZA Live-Ready Request Sheet Samples
- 本番WordPressには触れず、4ページ分の live-ready request sheet 記入例をローカル文書として作成
- 作成:
- 00_admin/fanza-priority-pages-live-ready-request-sheet-samples.md
- 重要方針:
- SAMPLE / EXAMPLE ONLY と明記
- 4ページとも現時点では HOLD
- 954 は generic_latest_check_state をデフォルト例とし、active_campaign_state は公式確認時のみ使用可の例に限定
- 1018 除外、fanza_cta_click 整合、stale campaign 排除、誇大表現排除を横断記入例として整理
- 本番WordPress、管理画面保存、SSH、DB、記事本文、taxonomy は未変更
```
