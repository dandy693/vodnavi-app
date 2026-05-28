# FANZA Priority Pages Human Review Checklist

## 1. Purpose

This document defines the human review checklist for the four priority FANZA pages before any future WordPress reflection is considered.

Its goals are:

- give a human reviewer a page-by-page approval lens
- keep each page role separate and auditable
- confirm that `HOLD` can move only after explicit manual review
- block stale campaign residue, role drift, or measurement mismatch before any later implementation step

This checklist is for human confirmation. It is not an automatic approval mechanism.

## 2. Target Pages

- `1095` `Beginner Guide`
- `1106` `Registration / Benefits Guide`
- `994` `Safety / Anxiety Resolution`
- `954` `Evergreen Sale Hub`

## 3. Shared Human Review Items

A human reviewer should confirm the following on every page:

1. one page has one dominant role and does not blur into another priority page
2. the strongest CTA still points to the intended official FANZA route
3. fallback internal-link cluster remains clearly secondary to the official CTA
4. FAQ supports the page role and does not introduce a competing route
5. `fanza_cta_click` naming and parameter design stay aligned with the approved measurement spec
6. `1018` `Pending Source Material` is absent from routine routing
7. no stale campaign facts remain where they should not
8. no exaggerated or certainty-based claims remain
9. desktop and mobile layouts still reflect the intended hierarchy
10. rollback readiness has an attached reference

## 4. Shared Decision Logic

### Conditions To Move Toward `GO`

- all required page-role checks pass
- official CTA priority remains intact
- `fanza_cta_click` alignment is confirmed
- `1018` exclusion is reconfirmed
- stale campaign, exaggerated wording, and certainty wording checks pass
- desktop and mobile checks pass
- rollback readiness is documented

### Conditions To Remain `HOLD`

- any required human confirmation is still missing
- CTA destination verification is pending
- hierarchy is documented but not yet manually confirmed
- rollback reference is still incomplete
- one or more non-fatal questions remain open

### Conditions For `NO-GO`

- the page role materially drifts into another priority page
- the primary CTA points to the wrong route
- `fanza_cta_click` parameters are mismatched
- internal-link cluster overpowers the official CTA
- `1018` appears in routine routing
- stale campaign information remains
- exaggerated or certainty-based language remains
- the approved funnel order is broken

## 5. `1095` Human Review Checklist

### Role-Specific Review Focus

The reviewer should confirm that `1095` still functions as:

- `初心者導入`
- `不安低減`
- `登録導線`

The page must not drift into a benefits-first page, a safety-only page, or a sale-hub page.

### Page-Specific Checks

1. the opening explains orientation before asking for action
2. anxiety-lowering content appears before stronger conversion pressure
3. beginner context remains primary over benefit stacking
4. official CTA remains the strongest route
5. internal next-step links support progression but do not dominate
6. FAQ remains lightweight and beginner-relevant

### `1095` Reviewer Prompt

```text
Does this still read like the best first-stop page for a cautious beginner?
If not, keep status at HOLD or move to NO-GO depending on severity.
```

## 6. `1106` Human Review Checklist

### Role-Specific Review Focus

The reviewer should confirm that `1106` still functions as:

- `登録メリット`
- `特典理解`
- `登録導線`

The page must not drift into generic beginner orientation, reassurance-first handling, or sale-hub behavior.

### Page-Specific Checks

1. registration benefits and value understanding are the dominant framing
2. the page explains why a user would proceed, not merely what the service is
3. official CTA remains primary and benefit-aligned
4. beginner recap remains supportive rather than dominant
5. safety routing remains fallback only
6. FAQ supports benefit / usage understanding rather than campaign urgency

### `1106` Reviewer Prompt

```text
Does this page primarily help a user understand registration value and benefits?
If not, keep status at HOLD or move to NO-GO depending on severity.
```

## 7. `994` Human Review Checklist

### Role-Specific Review Focus

The reviewer should confirm that `994` still functions as:

- `安全性`
- `不安解消`
- `登録導線`

The page must not drift into generic beginner onboarding, benefit-heavy comparison, or sale-driven messaging.

### Page-Specific Checks

1. trust and reassurance content appears before the strongest CTA
2. the main CTA appears naturally right after anxiety reduction
3. safety framing stays primary over feature or sale framing
4. internal-link cluster appears only after the main reassurance path
5. FAQ answers realistic hesitation points
6. copy does not overclaim anonymity, safety, or guaranteed comfort

### `994` Reviewer Prompt

```text
Does the page reduce anxiety first and then place the CTA at the right moment?
If not, keep status at HOLD or move to NO-GO depending on severity.
```

## 8. `954` Human Review Checklist

### Role-Specific Review Focus

The reviewer should confirm that `954` still functions as:

- `現在のセール確認`
- `公式確認導線`
- `Evergreen Sale Hub`

The page must not drift into a registration page, a reassurance page, or a seasonal campaign article.

### Page-Specific Checks

1. current sale confirmation remains the dominant route
2. `generic_latest_check_state` is the default review target
3. `active_campaign_state` is not treated as default
4. `active_campaign_state` is allowed only when an active campaign is officially confirmed
5. campaign-specific names, dates, and discount figures do not remain in evergreen body sections
6. official confirmation route remains stronger than internal support links
7. internal-link cluster remains support-only
8. FAQ stays evergreen and does not preserve expired campaign facts

### `954` Reviewer Prompt

```text
Does the page still work correctly as an evergreen current-sale hub even if no named campaign is active?
If not, keep status at HOLD or move to NO-GO depending on severity.
```

## 9. `fanza_cta_click` Human Review Items

A human reviewer should confirm:

1. `event_name` is `fanza_cta_click`
2. `page_type` matches the approved page
3. `page_role` matches the approved role
4. `placement` naming fits the approved CTA position
5. `cta_id` follows the stable ID pattern
6. `link_target` matches the intended destination
7. `954` uses `evergreen_sale_hub__mid__official_current_sale` for the mid official sale CTA

If any of the above fails, the page cannot move to `GO`.

## 10. Internal-Link Cluster Human Review Items

1. cluster is visually and structurally subordinate to the official CTA
2. cluster supports the next step without changing the page role
3. cluster link copy is less forceful than primary CTA copy
4. `1018` is absent
5. cluster does not become the first obvious action

## 11. FAQ Human Review Items

1. FAQ belongs on the page and is not filler
2. FAQ answers role-specific questions
3. FAQ does not create a second dominant funnel
4. FAQ does not preserve stale sale information
5. FAQ does not introduce unsupported certainty claims

## 12. `1018` Exclusion Review

A human reviewer should confirm that `1018`:

1. does not appear in top CTA routes
2. does not appear in fallback internal-link cluster
3. does not appear in FAQ routing
4. does not appear in end-of-page next-step composition
5. does not appear as a routine recommendation

If any of the above fails, result is `NO-GO`.

## 13. Stale Campaign Review

The reviewer should confirm:

1. no expired campaign name remains
2. no expired campaign end date remains
3. no expired discount figure remains outside approved campaign-only handling
4. no stale urgency wording remains
5. `954` evergreen sections remain campaign-neutral

## 14. Exaggeration / Certainty Review

The reviewer should reject copy that:

1. promises guaranteed results
2. claims guaranteed safety or anonymity
3. claims guaranteed savings or lowest-price certainty
4. uses unsupported urgency as fact
5. turns guidance pages into overcommitted sales copy

Presence of these items is `NO-GO`.

## 15. Mobile / Desktop Review

The reviewer should confirm:

1. desktop hierarchy matches the intended funnel
2. mobile order preserves the same primary action logic
3. official CTA remains visible and dominant in both contexts
4. internal-link cluster does not visually overtake the CTA on smaller screens
5. `954` sale-check path remains obvious in both layouts

## 16. Rollback Readiness Review

The reviewer should confirm:

1. a rollback reference exists
2. the rollback owner is identified
3. the revert source is documented
4. page-specific rollback notes are attached where needed

If rollback preparation is missing, keep status at `HOLD`.

## 17. Human Review Recording Fields

```text
review_page_id:
reviewer_name:
secondary_checker:
review_started_at:
review_completed_at:
current_status: HOLD
go_ready: no
hold_reason:
no_go_reason:
notes:
```

## 18. Final `GO` Decision Field

Use the following final decision format:

```text
final_decision:
- GO
- HOLD
- NO-GO

approved_by:
approval_timestamp:
blocking_items_if_not_go:
next_required_action:
```

## 19. Review Order Reminder

Even after review, do not move all four pages together.

Review and later approval progression should still follow:

1. `1095`
2. `1106`
3. `994`
4. `954`

Each page should be judged independently.

## 20. `operation-log.md` Recording Example

```text
### FANZA Human Review Checklist
- 本番WordPressには触れず、4ページ分の human review checklist をローカル文書として作成
- 作成:
- 00_admin/fanza-priority-pages-human-review-checklist.md
- 重要方針:
- 人間確認用であり、自動承認ではない
- 4ページとも現時点では GO 確定にしない
- 1095 から1ページずつ判断する前提
- 954 は generic_latest_check_state をデフォルト確認対象とし、active_campaign_state は公式確認時のみ使用可
- 1018 除外、fanza_cta_click 整合、stale campaign 排除、誇大表現排除を必須確認項目として整理
- 本番WordPress、管理画面保存、SSH、DB、記事本文、taxonomy は未変更
```
