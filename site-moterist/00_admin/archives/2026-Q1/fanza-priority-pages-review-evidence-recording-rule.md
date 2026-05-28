# FANZA Priority Pages Review Evidence Recording Rule

## 1. Purpose

This document defines the cross-page evidence recording rule for the four priority FANZA pages.

Its goals are:

- clarify what must be preserved as review evidence before any future approval decision
- separate summary-level records from detailed evidence records
- keep `GO / HOLD / NO-GO` decisions explainable after the fact
- ensure that role drift, measurement mismatch, stale campaign residue, and unsupported claims are evidenced rather than assumed

This is an evidence-recording rule only. It is not an automatic approval mechanism.

## 2. Target Pages

- `1095` `Beginner Guide`
- `1106` `Registration / Benefits Guide`
- `994` `Safety / Anxiety Resolution`
- `954` `Evergreen Sale Hub`

## 3. Evidence Items That Must Be Recorded

The following items should be preserved as review evidence:

1. page ID and page type
2. reviewer name and secondary checker name if present
3. review date and time
4. current decision state: `GO`, `HOLD`, or `NO-GO`
5. short decision rationale
6. page-role integrity confirmation
7. CTA confirmation result
8. `fanza_cta_click` confirmation result
9. internal-link cluster confirmation result
10. FAQ confirmation result
11. `1018` exclusion confirmation result
12. stale campaign check result
13. exaggeration / certainty check result
14. mobile / desktop check result
15. rollback readiness result
16. page-specific blockers and next action
17. for `954`, state handling evidence for `generic_latest_check_state` and, where relevant, `active_campaign_state`

## 4. Evidence Items That Do Not Need Standalone Preservation

The following items do not require separate evidence unless they affect a decision:

1. drafting-history commentary already captured in prior planning documents
2. repeated wording notes that do not change `GO / HOLD / NO-GO`
3. reviewer personal working notes with no decision impact
4. duplicate restatements of already-recorded CTA IDs
5. repeated references to unchanged shared policy text

These may remain in working notes but do not need to be elevated to approval evidence.

## 5. Reviewer Recording Rule

Every evidence record should include:

```text
page_id:
page_type:
reviewer:
secondary_checker:
review_started_at:
review_completed_at:
decision:
decision_reason_summary:
```

If a second reviewer is not present, record `secondary_checker: none`.

## 6. Review Timestamp Rule

Use one consistent timestamp format in all evidence records:

```text
YYYY-MM-DD HH:MM JST
```

Minimum required timestamps:

1. review started
2. review completed
3. decision recorded

If review spans multiple sessions, note the final decision session explicitly.

## 7. Decision-Reason Recording Rule

For every `GO / HOLD / NO-GO` decision, record:

1. status
2. one-line summary reason
3. detailed blocking item list if not `GO`
4. next required action

Recommended format:

```text
decision: HOLD
summary_reason: CTA destination confirmation is still pending
blocking_items:
- live destination check pending
- desktop hierarchy sign-off pending
next_required_action:
- attach human verification results
```

## 8. `fanza_cta_click` Evidence Rule

Evidence should record:

1. `event_name`
2. `page_type`
3. `page_role`
4. `placement`
5. `cta_id`
6. `link_target`
7. whether the recorded values match the approved measurement spec

Recommended format:

```text
measurement_check:
event_name: fanza_cta_click
page_type_check:
page_role_check:
placement_check:
cta_id_check:
link_target_check:
result:
notes:
```

If any required value is mismatched, result should be `NO-GO`.

## 9. Internal-Link Cluster Evidence Rule

Evidence should record:

1. which cluster block was checked
2. whether cluster hierarchy stayed secondary to the official CTA
3. whether cluster links stayed within approved role boundaries
4. whether `1018` was excluded

Recommended format:

```text
internal_link_cluster_check:
cluster_scope:
cta_subordination_check:
role_boundary_check:
1018_exclusion_check:
result:
notes:
```

## 10. FAQ Evidence Rule

Evidence should record:

1. whether FAQ is justified on the page
2. whether FAQ remains aligned with the page role
3. whether FAQ introduces a competing route
4. whether FAQ contains stale or unsupported claims

Recommended format:

```text
faq_check:
faq_scope:
role_alignment_check:
competing_route_check:
stale_fact_check:
result:
notes:
```

## 11. `1018` Exclusion Evidence Rule

Evidence must explicitly confirm that `1018` does not appear in:

1. official CTA routes
2. fallback internal-link cluster
3. FAQ routing
4. end-of-page routing
5. routine recommendation positions

Recommended format:

```text
pending_source_material_exclusion_check:
cta_route_check:
cluster_check:
faq_check:
end_of_page_check:
recommendation_check:
result:
notes:
```

If `1018` appears in routine routing, result is `NO-GO`.

## 12. Stale Campaign Evidence Rule

Evidence must explicitly confirm:

1. no expired campaign name remains
2. no expired date remains
3. no expired discount figure remains where not allowed
4. no stale urgency phrasing remains
5. `954` evergreen body stays clean of past campaign residue

Recommended format:

```text
stale_campaign_check:
campaign_name_check:
campaign_date_check:
discount_figure_check:
urgency_phrase_check:
result:
notes:
```

## 13. Exaggeration / Certainty Evidence Rule

Evidence should capture whether copy contains:

1. guaranteed outcome language
2. guaranteed safety language
3. guaranteed savings language
4. unsupported certainty wording
5. overcommitted conversion wording

Recommended format:

```text
expression_check:
guaranteed_outcome_check:
guaranteed_safety_check:
guaranteed_savings_check:
certainty_phrase_check:
result:
notes:
```

If such language remains, result is `NO-GO`.

## 14. Mobile / Desktop Evidence Rule

Evidence should record:

1. desktop hierarchy confirmation
2. mobile hierarchy confirmation
3. CTA prominence confirmation
4. cluster subordination confirmation
5. page-role preservation in both contexts

Recommended format:

```text
layout_check:
desktop_hierarchy_check:
mobile_hierarchy_check:
cta_prominence_check:
cluster_subordination_check:
role_consistency_check:
result:
notes:
```

## 15. Rollback Readiness Evidence Rule

Evidence should record:

1. rollback reference exists
2. rollback owner is identified
3. rollback source note exists
4. rollback scope is understood

Recommended format:

```text
rollback_readiness_check:
backup_reference:
rollback_owner:
rollback_source_note:
rollback_scope_note:
result:
notes:
```

If rollback preparation is incomplete, keep the page at `HOLD`.

## 16. `954` `generic_latest_check_state` Evidence Rule

`954` evidence must treat `generic_latest_check_state` as the default confirmation target.

Evidence should record:

1. default state used for review
2. current sale confirmation remains the main route
3. evergreen body remains campaign-neutral
4. no named campaign details exist outside the replaceable campaign block

Recommended format:

```text
generic_latest_check_state_review:
default_state_check:
official_current_sale_route_check:
evergreen_body_neutrality_check:
campaign_detail_exclusion_check:
result:
notes:
```

## 17. `954` `active_campaign_state` Evidence Rule

`active_campaign_state` should be recorded only when review actually considers its use.

Evidence should record:

1. whether active state review was needed
2. whether official confirmation exists
3. whether campaign is active at review time
4. whether campaign details remain inside the dedicated block only
5. whether the page still reads as evergreen overall

Recommended format:

```text
active_campaign_state_review:
review_needed:
official_confirmation_check:
active_status_check:
campaign_block_boundary_check:
evergreen_integrity_check:
result:
notes:
```

If official confirmation is missing, the active-state evidence result is `NO-GO` for active-state usage.

## 18. Recommended Evidence Naming Rule

Recommended file or record naming pattern:

```text
fanza-{page_id}-{review_stage}-{yyyyMMdd}
```

Examples:

- `fanza-1095-human-review-20260509`
- `fanza-954-pre-approval-check-20260509`
- `fanza-1106-measurement-review-20260509`

Recommended section naming pattern inside documents:

```text
{page_id}-{check_type}-{sequence}
```

Examples:

- `1095-cta-check-01`
- `954-generic-state-check-01`

## 19. Summary Granularity For `operation-log.md`

`operation-log.md` should contain summary-only evidence references:

1. what page was reviewed
2. what review artifact was created or updated
3. current decision state
4. major blockers
5. next required action

It should not contain every line-item check value unless a blocker requires explicit mention.

## 20. Detail Granularity For Approval Packet / Live-Ready Request Sheet

Approval packet and live-ready request sheet should contain detailed evidence:

1. line-item check results
2. CTA ID verification
3. role-boundary verification
4. stale campaign verification
5. expression check outcomes
6. layout confirmation outcomes
7. rollback readiness outcomes

This is where granular evidence should remain attached.

## 21. `HOLD` Conditions Caused By Evidence Gaps

Keep a page at `HOLD` if:

1. reviewer identity is missing
2. timestamps are missing
3. CTA destination evidence is incomplete
4. `fanza_cta_click` mapping evidence is incomplete
5. `1018` exclusion evidence is incomplete
6. mobile or desktop evidence is incomplete
7. rollback readiness evidence is incomplete
8. `954` generic-state evidence is incomplete

## 22. `NO-GO` Conditions Derived From Evidence

Move to `NO-GO` if evidence shows:

1. page role drift into another priority page
2. wrong primary CTA route
3. `fanza_cta_click` mismatch
4. `1018` present in routine routing
5. stale campaign residue remains
6. exaggerated or certainty-based copy remains
7. `954` active state is proposed without official confirmation
8. `954` evergreen body contains campaign details outside the approved block

## 23. Minimum Evidence Set Before Final `GO`

Before final `GO`, the following evidence set should exist for the page under review:

1. reviewer identity and timestamps
2. page-role confirmation
3. CTA confirmation
4. `fanza_cta_click` confirmation
5. internal-link cluster confirmation
6. FAQ confirmation
7. `1018` exclusion confirmation
8. stale campaign confirmation
9. exaggeration / certainty confirmation
10. desktop and mobile confirmation
11. rollback readiness confirmation
12. for `954`, `generic_latest_check_state` confirmation
13. for `954` active-state usage, official-confirmation-based active-state evidence

Even after evidence is complete, do not move all pages together. Continue page-by-page in this order:

1. `1095`
2. `1106`
3. `994`
4. `954`
