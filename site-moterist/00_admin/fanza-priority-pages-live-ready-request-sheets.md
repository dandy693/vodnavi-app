# FANZA Priority Pages Live-Ready Request Sheets

## 1. Purpose

This document prepares page-by-page live-ready request sheets for the four priority FANZA pages.

Its goals are:

- convert the current packet drafts into request-ready recording forms
- make the remaining human checks explicit before any future production approval is considered
- keep page role boundaries, measurement rules, and exclusion rules visible at request time
- preserve the rule that no page is `GO` yet

This is a local planning document only. It does not authorize WordPress production edits.

## 2. Definition Of `Live-Ready`

`Live-ready` in this document means:

- the page has request / log / packet drafts prepared
- the page has a stable request structure ready for human review
- the page can be handed to the next approval-preparation step without needing a new template

It does not mean:

- production-ready
- approved for WordPress reflection
- final `GO`

## 3. `Live-Ready` But Not `GO`

Important:

- all four pages remain `HOLD`
- human confirmation is still required
- no page may move to WordPress reflection from this file alone
- `GO` can only happen after the remaining review items are completed and recorded

## 4. Target Pages

- `1095` `Beginner Guide`
- `1106` `Registration / Benefits Guide`
- `994` `Safety / Anxiety Resolution`
- `954` `Evergreen Sale Hub`

## 5. Shared Recording Rules

Use the following shared assumptions across all four sheets:

- current status starts as `HOLD`
- `fanza_cta_click` alignment is mandatory
- `1018` must remain excluded from routine routing
- stale campaign, exaggeration, and certainty issues block `GO`
- desktop and mobile confirmation are still pending until a human check is attached

Shared reviewer fields:

```text
reviewer:
approver:
operator:
secondary_checker:
review_started_at:
review_completed_at:
approval_recorded_at:
```

## 6. `1095` Live-Ready Request Sheet

### Page Information

- `page_id`: `1095`
- `page_type`: `Beginner Guide`
- `page_role`: `初心者導入・不安低減・登録導線`
- current decision: `HOLD`

### Remaining Checks

- confirm live kept-region residue
- confirm final CTA destinations
- confirm desktop hierarchy
- confirm mobile hierarchy
- confirm beginner-first orientation remains dominant
- confirm rollback metadata

### Paste Units To Reflect

- `1095-pu01`
- `1095-pu02`
- `1095-pu03`
- `1095-pu04`
- `1095-pu05`
- `1095-pu06`
- `1095-pu07`
- `1095-pu08`

### CTA Targets In Scope

- top official CTA
- mid official CTA
- end internal benefits CTA
- end internal safety CTA
- inline internal sale-support CTA

### `fanza_cta_click` Confirmation

```text
event_name: fanza_cta_click
page_type: beginner_guide
page_role: entry
cta_id_family_check:
link_target_check:
decision: HOLD
notes:
```

### Internal-Link Cluster Check

```text
cluster_scope: 1095-pu06
role_subordination_check:
1018_exclusion_check:
decision: HOLD
notes:
```

### FAQ Check

```text
faq_scope: 1095-pu07
beginner_relevance_check:
redundancy_check:
decision: HOLD
notes:
```

### `1018` Exclusion Check

```text
cta_layer_check:
cluster_check:
faq_check:
end_of_page_check:
decision: HOLD
notes:
```

### Stale Campaign Absence Check

```text
campaign_name_check:
campaign_date_check:
discount_figure_check:
decision: HOLD
notes:
```

### Exaggeration / Certainty Check

```text
certainty_language_check:
guaranteed_benefit_check:
guaranteed_safety_check:
decision: HOLD
notes:
```

### Mobile / Desktop Check

```text
desktop_hierarchy_check:
mobile_hierarchy_check:
decision: HOLD
notes:
```

### Rollback Readiness Check

```text
backup_reference:
rollback_owner:
rollback_source_note:
decision: HOLD
notes:
```

### Conditions To Move Toward `GO`

- beginner-first role remains dominant
- official CTA remains primary
- `fanza_cta_click` mapping is validated
- `1018` remains excluded
- stale campaign / exaggeration checks pass
- desktop and mobile checks pass
- rollback readiness is documented

### Conditions To Stay `HOLD`

- any human confirmation item is still missing
- final CTA destinations are not yet attached
- hierarchy is designed but not execution-confirmed

### `NO-GO` Conditions

- page behaves like `1106`, `994`, or `954`
- official CTA is not primary
- internal-link cluster overpowers the official CTA
- `1018` appears in routine routing
- stale campaign or certainty wording remains

### Final Review Fields

```text
human_reviewer:
human_approver:
final_decision: HOLD
final_go_ready: no
notes:
```

### Runbook Connection

- future reflection must follow:
  - [fanza-priority-pages-wordpress-implementation-runbook.md](/C:/Users/Tachi/projects/moterist-ai-affiliate/00_admin/fanza-priority-pages-wordpress-implementation-runbook.md)

## 7. `1106` Live-Ready Request Sheet

### Page Information

- `page_id`: `1106`
- `page_type`: `Registration / Benefits Guide`
- `page_role`: `登録メリット・特典理解・登録導線`
- current decision: `HOLD`

### Remaining Checks

- confirm live kept-region residue
- confirm final CTA destinations
- confirm desktop hierarchy
- confirm mobile hierarchy
- confirm benefits-first framing remains dominant
- confirm rollback metadata

### Paste Units To Reflect

- `1106-pu01`
- `1106-pu02`
- `1106-pu03`
- `1106-pu04`
- `1106-pu05`
- `1106-pu06`
- `1106-pu07`
- `1106-pu08`

### CTA Targets In Scope

- top official CTA
- mid official CTA
- end official CTA
- end internal safety CTA
- inline internal beginner-context CTA

### `fanza_cta_click` Confirmation

```text
event_name: fanza_cta_click
page_type: registration_benefits_guide
page_role: consideration
cta_id_family_check:
link_target_check:
decision: HOLD
notes:
```

### Internal-Link Cluster Check

```text
cluster_scope: 1106-pu06
role_subordination_check:
1018_exclusion_check:
decision: HOLD
notes:
```

### FAQ Check

```text
faq_scope: 1106-pu07
benefits_relevance_check:
redundancy_check:
decision: HOLD
notes:
```

### `1018` Exclusion Check

```text
cta_layer_check:
cluster_check:
faq_check:
end_of_page_check:
decision: HOLD
notes:
```

### Stale Campaign Absence Check

```text
campaign_name_check:
campaign_date_check:
discount_figure_check:
decision: HOLD
notes:
```

### Exaggeration / Certainty Check

```text
certainty_language_check:
guaranteed_benefit_check:
guaranteed_registration_check:
decision: HOLD
notes:
```

### Mobile / Desktop Check

```text
desktop_hierarchy_check:
mobile_hierarchy_check:
decision: HOLD
notes:
```

### Rollback Readiness Check

```text
backup_reference:
rollback_owner:
rollback_source_note:
decision: HOLD
notes:
```

### Conditions To Move Toward `GO`

- benefits-first framing remains dominant
- official CTA remains primary
- `fanza_cta_click` mapping is validated
- `1018` remains excluded
- stale campaign / exaggeration checks pass
- desktop and mobile checks pass
- rollback readiness is documented

### Conditions To Stay `HOLD`

- any human confirmation item is still missing
- final CTA destinations are not yet attached
- hierarchy is designed but not execution-confirmed

### `NO-GO` Conditions

- page behaves like `1095`, `994`, or `954`
- reassurance-first or sale-first framing overtakes benefits framing
- official CTA is not primary
- `1018` appears in routine routing
- stale campaign or certainty wording remains

### Final Review Fields

```text
human_reviewer:
human_approver:
final_decision: HOLD
final_go_ready: no
notes:
```

### Runbook Connection

- future reflection must follow:
  - [fanza-priority-pages-wordpress-implementation-runbook.md](/C:/Users/Tachi/projects/moterist-ai-affiliate/00_admin/fanza-priority-pages-wordpress-implementation-runbook.md)

## 8. `994` Live-Ready Request Sheet

### Page Information

- `page_id`: `994`
- `page_type`: `Safety / Anxiety Resolution`
- `page_role`: `安全性・不安解消・登録導線`
- current decision: `HOLD`

### Remaining Checks

- confirm live kept-region residue
- confirm final CTA destinations
- confirm desktop hierarchy
- confirm mobile hierarchy
- confirm reassurance remains dominant
- confirm the main CTA remains immediately after reassurance
- confirm rollback metadata

### Paste Units To Reflect

- `994-pu01`
- `994-pu02`
- `994-pu03`
- `994-pu04`
- `994-pu05`
- `994-pu06`
- `994-pu07`
- `994-pu08`

Critical order rule:

- `994-pu04` must remain directly after `994-pu03`

### CTA Targets In Scope

- top official CTA
- mid official CTA
- end official CTA
- end internal sale CTA
- inline internal benefits-context CTA

### `fanza_cta_click` Confirmation

```text
event_name: fanza_cta_click
page_type: safety_anxiety_resolution
page_role: objection_handling
cta_id_family_check:
link_target_check:
mid_cta_after_reassurance_check:
decision: HOLD
notes:
```

### Internal-Link Cluster Check

```text
cluster_scope: 994-pu06
role_subordination_check:
1018_exclusion_check:
decision: HOLD
notes:
```

### FAQ Check

```text
faq_scope: 994-pu07
reassurance_relevance_check:
redundancy_check:
decision: HOLD
notes:
```

### `1018` Exclusion Check

```text
cta_layer_check:
cluster_check:
faq_check:
end_of_page_check:
decision: HOLD
notes:
```

### Stale Campaign Absence Check

```text
campaign_name_check:
campaign_date_check:
discount_figure_check:
decision: HOLD
notes:
```

### Exaggeration / Certainty Check

```text
certainty_language_check:
guaranteed_safety_check:
guaranteed_use_result_check:
decision: HOLD
notes:
```

### Mobile / Desktop Check

```text
desktop_hierarchy_check:
mobile_hierarchy_check:
mid_cta_proximity_check:
decision: HOLD
notes:
```

### Rollback Readiness Check

```text
backup_reference:
rollback_owner:
rollback_source_note:
decision: HOLD
notes:
```

### Conditions To Move Toward `GO`

- reassurance-first framing remains dominant
- main CTA still appears immediately after reassurance
- official CTA remains primary
- `fanza_cta_click` mapping is validated
- `1018` remains excluded
- stale campaign / exaggeration checks pass
- desktop and mobile checks pass
- rollback readiness is documented

### Conditions To Stay `HOLD`

- any human confirmation item is still missing
- immediate post-reassurance CTA placement is not execution-confirmed
- hierarchy is designed but not execution-confirmed

### `NO-GO` Conditions

- page behaves like `1095`, `1106`, or `954`
- benefits-first or sale-first framing overtakes trust framing
- main CTA is not immediately after reassurance
- `1018` appears in routine routing
- stale campaign or certainty wording remains

### Final Review Fields

```text
human_reviewer:
human_approver:
final_decision: HOLD
final_go_ready: no
notes:
```

### Runbook Connection

- future reflection must follow:
  - [fanza-priority-pages-wordpress-implementation-runbook.md](/C:/Users/Tachi/projects/moterist-ai-affiliate/00_admin/fanza-priority-pages-wordpress-implementation-runbook.md)

## 9. `954` Live-Ready Request Sheet

### Page Information

- `page_id`: `954`
- `page_type`: `Evergreen Sale Hub`
- `page_role`: `現在のセール確認・公式確認導線`
- current decision: `HOLD`

### Remaining Checks

- confirm live kept-region residue
- confirm final CTA destinations
- confirm desktop hierarchy
- confirm mobile hierarchy
- confirm `generic_latest_check_state` remains the default reflected state
- confirm `active_campaign_state` is absent unless official proof is attached
- confirm rollback metadata

### Paste Units To Reflect

Default in-scope units:

- `954-pu01`
- `954-pu02`
- `954-pu03`
- `954-pu04`
- `954-pu06`
- `954-pu07`
- `954-pu08`

Conditional unit:

- `954-pu05`

Conditional rule:

- `954-pu05` may replace `954-pu04` only when official active-campaign confirmation exists

### CTA Targets In Scope

- top official current-sale CTA
- mid official current-sale CTA
- end official current-sale CTA
- end internal benefits-support CTA
- end internal safety-support CTA
- inline internal beginner-context CTA

### `fanza_cta_click` Confirmation

```text
event_name: fanza_cta_click
page_type: evergreen_sale_hub
page_role: commercial_conversion_hub
cta_id_family_check:
link_target_check:
decision: HOLD
notes:
```

### Internal-Link Cluster Check

```text
cluster_scope: 954-pu06
role_subordination_check:
1018_exclusion_check:
decision: HOLD
notes:
```

### FAQ Check

```text
faq_scope: 954-pu07
evergreen_relevance_check:
campaign_archive_avoidance_check:
decision: HOLD
notes:
```

### `1018` Exclusion Check

```text
cta_layer_check:
cluster_check:
faq_check:
end_of_page_check:
decision: HOLD
notes:
```

### Stale Campaign Absence Check

```text
campaign_name_outside_module_check:
campaign_date_outside_module_check:
discount_figure_outside_module_check:
decision: HOLD
notes:
```

### Exaggeration / Certainty Check

```text
certainty_language_check:
guaranteed_sale_active_check:
guaranteed_discount_check:
decision: HOLD
notes:
```

### Mobile / Desktop Check

```text
desktop_hierarchy_check:
mobile_hierarchy_check:
generic_state_visibility_check:
decision: HOLD
notes:
```

### Rollback Readiness Check

```text
backup_reference:
rollback_owner:
rollback_source_note:
decision: HOLD
notes:
```

### `generic_latest_check_state` Check

```text
default_state_check:
no_named_campaign_outside_module_check:
no_date_outside_module_check:
no_discount_outside_module_check:
decision: HOLD
notes:
```

### `active_campaign_state` Usage Permission

```text
active_state_requested:
official_confirmation_source:
campaign_name_check:
campaign_period_check:
campaign_scope_check:
decision: HOLD
notes:
```

Usage rule:

- `active_campaign_state` is usable only if official active-campaign confirmation exists

### Conditions To Move Toward `GO`

- page remains an evergreen sale hub
- current-sale confirmation remains primary at top, mid, and end
- `generic_latest_check_state` remains the default state
- `active_campaign_state` remains absent unless official confirmation exists
- `fanza_cta_click` mapping is validated
- `1018` remains excluded
- stale campaign / exaggeration checks pass
- desktop and mobile checks pass
- rollback readiness is documented

### Conditions To Stay `HOLD`

- any human confirmation item is still missing
- `generic_latest_check_state` is designed but not execution-confirmed
- `active_campaign_state` proof is missing

### `NO-GO` Conditions

- page behaves like `1095`, `1106`, or `994`
- page behaves like a seasonal campaign article
- `generic_latest_check_state` is not the default
- `active_campaign_state` is used without official confirmation
- campaign facts appear outside the module
- `1018` appears in routine routing
- stale campaign or certainty wording remains

### Final Review Fields

```text
human_reviewer:
human_approver:
final_decision: HOLD
final_go_ready: no
notes:
```

### Runbook Connection

- future reflection must follow:
  - [fanza-priority-pages-wordpress-implementation-runbook.md](/C:/Users/Tachi/projects/moterist-ai-affiliate/00_admin/fanza-priority-pages-wordpress-implementation-runbook.md)

## 10. Cross-Page Rules Before Any Final `GO`

- all four pages remain `HOLD` until human review is attached
- all four pages must preserve page-role separation
- all four pages must preserve `fanza_cta_click` alignment
- all four pages must keep `1018` excluded from normal routing
- all four pages must pass stale campaign / exaggeration / certainty checks
- all four pages must pass desktop and mobile confirmation
- all four pages must document rollback readiness

## 11. Suggested `operation-log.md` Summary

Suggested summary line:

- created page-by-page live-ready request sheets for `1095 / 1106 / 994 / 954`, keeping all pages at provisional `HOLD`, preserving `fanza_cta_click` and `1018` as cross-page gating items, and keeping `954` on `generic_latest_check_state` by default with `active_campaign_state` conditional only
