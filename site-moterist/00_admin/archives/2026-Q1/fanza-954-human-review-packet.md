# FANZA 954 Human Review Packet

## 1. Purpose

This document bundles the `954` review materials into one human-review packet for manual evaluation.

Its goals are:

- give a reviewer one page-scoped packet for `954`
- connect the request draft, approval log draft, approval packet draft, state-specific rules, current-campaign module rules, live-ready sheet, review evidence rule, and sign-off template
- preserve the rule that this page is still under review and not approved yet

This file is for human review only. It does not authorize WordPress production edits.

## 2. Target Page Information

- `page_id`: `954`
- `page_type`: `Evergreen Sale Hub`
- `page_role`: `現在のセール確認・公式確認導線`

Role boundary requirements:

- keep current sale confirmation as the dominant route
- keep the page evergreen and readable year-round
- use official FANZA confirmation as the main action
- do not let `1095` beginner-entry framing dominate
- do not let `1106` benefits-first framing dominate
- do not let `994` reassurance-first framing dominate
- do not let the page revert to a seasonal campaign article

## 3. Current Decision

- current status: `HOLD`

Reason for current status:

- human review has not yet been completed
- live kept-region residue verification is not attached
- final CTA destination verification is not attached
- `generic_latest_check_state` default confirmation is not yet attached
- `active_campaign_state` cannot be used without official active-campaign proof
- desktop and mobile checks are not yet signed off
- rollback reference is not yet attached

## 4. Human Review Focus Items

A human reviewer should inspect the following:

1. `954` still reads as the evergreen current-sale hub
2. current sale confirmation remains the strongest route
3. `generic_latest_check_state` is the default state under review
4. `active_campaign_state` is absent unless official confirmation exists
5. no campaign-specific detail leaks outside the dedicated module
6. internal-link cluster remains support-only
7. FAQ remains evergreen and not archive-like
8. `1018` does not appear in any routine route
9. no stale campaign residue remains
10. no exaggerated or certainty-based claims remain
11. desktop and mobile hierarchy remain consistent
12. rollback readiness is documentable

## 5. Approval Packet Draft Summary

Source:

- [fanza-954-approval-packet-draft.md](/C:/Users/Tachi/projects/moterist-ai-affiliate/00_admin/fanza-954-approval-packet-draft.md)

Summary:

- packet stays `HOLD`
- official FANZA current-sale CTA remains primary
- `954-pu01 / pu02 / pu03 / pu04 / pu06 / pu07 / pu08` remain default packet scope
- `954-pu05` remains conditional only
- `generic_latest_check_state` remains the default packet path
- `active_campaign_state` remains conditional only with official confirmation
- internal routes to `1106 / 994 / 1095` remain support-only
- `1018` remains excluded
- stale campaign and exaggeration checks are defined but not yet human-verified
- desktop / mobile / rollback items remain open

## 6. Production Approval Request Draft Summary

Source:

- [fanza-954-production-approval-request-draft.md](/C:/Users/Tachi/projects/moterist-ai-affiliate/00_admin/fanza-954-production-approval-request-draft.md)

Summary:

- approved default order assumes `954-pu01 / pu02 / pu03 / pu04 / pu06 / pu07 / pu08`
- `954-pu05` is a conditional swap-only module
- top, mid, and end official CTA remain the strongest planned routes
- `generic_latest_check_state` is the default application path
- `active_campaign_state` may replace `954-pu04` only when an active campaign is officially confirmed
- `1018` is excluded from CTA, cluster, FAQ, and end-of-page routing
- stale campaign and exaggeration checks are required before any future production step

## 7. Approval Log Draft Summary

Source:

- [fanza-954-approval-log-draft.md](/C:/Users/Tachi/projects/moterist-ai-affiliate/00_admin/fanza-954-approval-log-draft.md)

Summary:

- page decision remains `HOLD`
- all paste units remain `HOLD` until live review evidence exists
- CTA mappings are structurally aligned but not execution-confirmed
- `fanza_cta_click` values are structurally aligned but not execution-confirmed
- `generic_latest_check_state` confirmation remains open
- `active_campaign_state` eligibility remains blocked until official proof exists
- FAQ and internal-link cluster remain conceptually approved, not live-validated
- rollback readiness remains incomplete

## 8. Live-Ready Request Sheet Transfer Items

Transfer into the live-ready request sheet:

1. current decision `HOLD`
2. remaining checks list
3. default paste units in scope
4. conditional `active_campaign_state` module note
5. CTA targets in scope
6. `fanza_cta_click` placeholders
7. internal-link cluster check fields
8. FAQ check fields
9. `1018` exclusion fields
10. stale campaign fields
11. expression fields
12. mobile / desktop fields
13. rollback fields
14. `generic_latest_check_state` confirmation fields
15. `active_campaign_state` usage-eligibility fields

Primary destination:

- [fanza-priority-pages-live-ready-request-sheets.md](/C:/Users/Tachi/projects/moterist-ai-affiliate/00_admin/fanza-priority-pages-live-ready-request-sheets.md)

## 9. Sign-Off Template Recording Items

After human review, transfer final results into the sign-off structure:

1. reviewer / approver / operator / timestamps
2. final decision `GO / HOLD / NO-GO`
3. decision summary
4. `fanza_cta_click` result block
5. internal-link cluster result block
6. FAQ result block
7. `1018` exclusion result block
8. stale campaign result block
9. expression result block
10. layout result block
11. rollback result block
12. `generic_latest_check_state` result block
13. `active_campaign_state` usage-eligibility result block
14. evidence file references

Primary destination:

- [fanza-priority-pages-human-review-signoff-template.md](/C:/Users/Tachi/projects/moterist-ai-affiliate/00_admin/fanza-priority-pages-human-review-signoff-template.md)

## 10. `fanza_cta_click` Review Items

Human review must confirm:

1. `event_name = fanza_cta_click`
2. `page_type = evergreen_sale_hub`
3. `page_role = commercial_conversion_hub`
4. CTA placements remain within `top / mid / end / inline`
5. CTA IDs remain:
   - `evergreen_sale_hub__top__official_current_sale`
   - `evergreen_sale_hub__mid__official_current_sale`
   - `evergreen_sale_hub__end__official_current_sale`
   - `evergreen_sale_hub__end__internal_benefits_next`
   - `evergreen_sale_hub__end__internal_safety_next`
   - `evergreen_sale_hub__inline__internal_beginner_context`
6. link targets remain:
   - `official_fanza`
   - `internal_1106`
   - `internal_994`
   - `internal_1095`

If any of the above drifts, result cannot move to `GO`.

## 11. Internal-Link Cluster Review Items

Human review must confirm:

1. cluster remains late-body or end support routing
2. cluster is visually and structurally weaker than the official CTA
3. cluster does not make `1106`, `994`, or `1095` the dominant route
4. cluster excludes `1018`
5. cluster copy remains less forceful than primary CTA copy

## 12. FAQ Review Items

Human review must confirm:

1. FAQ remains evergreen and how-to-check oriented
2. FAQ supports current-sale checking only
3. FAQ does not duplicate surrounding sections excessively
4. FAQ does not become a stale campaign archive
5. FAQ does not introduce stale or unsupported claims

## 13. `generic_latest_check_state` Review Items

Human review must confirm:

1. `generic_latest_check_state` is the default state under review
2. no named campaign appears outside the dedicated module
3. no campaign period appears outside the dedicated module
4. no discount figure appears outside the dedicated module
5. the page still reads correctly with no named campaign present
6. current sale confirmation remains the dominant route in this default state

## 14. `active_campaign_state` Usage Eligibility

Human review must confirm:

1. active state is not treated as the default path
2. active state is only considered when an active campaign is officially confirmed
3. active state is not allowed merely because a campaign might exist
4. active state cannot be approved from draft assumptions alone

## 15. Conditions To Use `active_campaign_state`

`active_campaign_state` may be considered only if:

1. an official source confirms the campaign is active
2. the campaign name is confirmed
3. the campaign period is confirmed
4. the campaign scope or applicable condition is confirmed
5. all campaign-specific details stay inside the swap-only module
6. the page still reads as evergreen outside the module

If official confirmation is missing, `active_campaign_state` is not usable.

## 16. Official Confirmation Path

Human review must confirm:

1. official FANZA confirmation remains the main route at top, mid, and end
2. the module reminds users that final confirmation belongs on the official FANZA page
3. campaign-specific emphasis does not replace the official confirmation route
4. internal support links remain secondary to official confirmation

## 17. Rule To Prevent Old Campaign Information From Remaining

Human review must confirm:

1. no expired campaign name remains in evergreen body sections
2. no expired campaign end date remains in evergreen body sections
3. no past discount figure remains in evergreen body sections
4. no stale urgency wording remains after returning to generic state
5. only one current-campaign module is visible

## 18. `1018` Pending Source Material Exclusion

Human review must confirm that `1018` does not appear in:

1. top CTA routes
2. mid CTA routes
3. end CTA composition
4. internal-link cluster
5. FAQ routing
6. routine recommendation positions

If any routine route includes `1018`, result is `NO-GO`.

## 19. Stale Campaign Absence

Human review must confirm:

1. no stale campaign name remains
2. no stale campaign period remains
3. no stale discount figure remains
4. no old campaign urgency wording remains
5. no campaign-specific styling leaks outside the approved module area

## 20. Exaggeration / Certainty Check

Human review must confirm absence of:

1. `絶対`
2. `必ず`
3. `最安`
4. guaranteed best-sale wording
5. guaranteed savings wording
6. guaranteed results or earnings wording

If any such expression remains, result is `NO-GO`.

## 21. Mobile / Desktop Check

Human review must confirm:

1. desktop order preserves evergreen-hub orientation
2. mobile order preserves evergreen-hub orientation
3. official CTA remains primary in both contexts
4. the current-campaign module remains isolated in both contexts
5. cluster remains subordinate in both contexts

## 22. Rollback Readiness Check

Human review must confirm:

1. backup reference exists
2. rollback owner exists
3. rollback source note exists
4. rollback scope is understandable

If these are missing, keep `HOLD`.

## 23. Conditions To Move Toward `GO`

`954` may move toward `GO` only if:

1. page still reads as the evergreen current-sale hub
2. current sale confirmation stays primary
3. `generic_latest_check_state` is confirmed as the default
4. `active_campaign_state` is absent unless official proof exists
5. no campaign detail leaks outside the approved module
6. `fanza_cta_click` mapping is confirmed
7. internal-link cluster remains clearly secondary
8. FAQ remains role-appropriate
9. `1018` is excluded everywhere in routine routing
10. no stale campaign residue remains
11. no exaggerated or certainty wording remains
12. desktop and mobile checks pass
13. rollback readiness is attached

## 24. Conditions To Remain `HOLD`

Keep `954` at `HOLD` if:

1. any review evidence is missing
2. CTA destinations are not yet manually confirmed
3. default-state confirmation is still pending
4. active-state official proof is absent
5. layout checks are still pending
6. rollback details are still pending

## 25. `NO-GO` Conditions

Move `954` to `NO-GO` if:

1. the page behaves like `1095`, `1106`, or `994`
2. the page reads like a seasonal campaign article
3. `generic_latest_check_state` is not the default
4. `active_campaign_state` is used without official confirmation
5. campaign names, dates, or discount figures appear outside the dedicated module
6. official CTA is not the primary route
7. internal-link cluster overpowers the official CTA
8. `1018` appears in routine routing
9. `fanza_cta_click` parameters are mismatched
10. stale campaign residue remains
11. exaggerated or certainty-based claims remain

## 26. Evidence To Record After Human Review

Record the following evidence:

1. reviewer identity
2. review timestamps
3. decision state
4. decision summary
5. `fanza_cta_click` result
6. internal-link cluster result
7. FAQ result
8. `generic_latest_check_state` result
9. `active_campaign_state` eligibility result
10. official confirmation path result
11. stale campaign result
12. expression result
13. layout result
14. rollback readiness result
15. evidence file references

Evidence-recording rule reference:

- [fanza-priority-pages-review-evidence-recording-rule.md](/C:/Users/Tachi/projects/moterist-ai-affiliate/00_admin/fanza-priority-pages-review-evidence-recording-rule.md)

## 27. Condition To Move To WordPress Implementation Runbook

Even after review, do not move directly from this packet to production action unless:

1. final sign-off is explicitly recorded
2. all required evidence is attached
3. final decision is `GO`
4. no `HOLD` blockers remain
5. no `NO-GO` condition is present

Runbook reference:

- [fanza-priority-pages-wordpress-implementation-runbook.md](/C:/Users/Tachi/projects/moterist-ai-affiliate/00_admin/fanza-priority-pages-wordpress-implementation-runbook.md)

## 28. `operation-log.md` Recording Example

```text
### FANZA 954 Human Review Packet
- 本番WordPressには触れず、954 Evergreen Sale Hub の human review packet をローカル文書として作成
- 作成:
- 00_admin/fanza-954-human-review-packet.md
- 重要方針:
- 954 の人間確認用パケットであり、自動承認ではない
- 現時点の判定は HOLD のまま
- 954 は current sale 確認を主導線にし、generic_latest_check_state をデフォルト確認対象にする
- active_campaign_state は公式確認できた開催中キャンペーンがある場合のみ使用可
- 1018 除外、fanza_cta_click 整合、stale campaign 排除、誇大表現排除を必須確認項目として整理
- 本番WordPress、管理画面保存、SSH、DB、記事本文、taxonomy は未変更
```
