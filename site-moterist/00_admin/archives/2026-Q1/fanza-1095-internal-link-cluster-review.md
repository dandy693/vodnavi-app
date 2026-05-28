# FANZA 1095 Internal-Link Cluster Review

## 1. Purpose

This document reviews the internal-link cluster on page `1095` as a support navigation layer, not a primary conversion layer.

Its goals are:

- verify that the cluster routes are appropriate for a `Beginner Guide`
- verify that the cluster does not compete with the main CTA in concept
- identify whether the `954` route is becoming too sale-forward inside `1095`
- record why the page remains `HOLD`

This review is local-only and does not authorize WordPress edits.

## 2. Target Page Information

- `page_id`: `1095`
- `page_type`: `Beginner Guide`
- `page_role`: `初心者導入・不安低減・登録導線`

Role boundary reminder:

- beginner onboarding must remain primary
- internal-link cluster must remain support-only
- `954` must not become the dominant path on this page

## 3. Current Decision

- current status: `HOLD`

## 4. Intended Role Of The Internal-Link Cluster

The intended role on `1095` is:

- provide fallback next steps after core beginner explanation
- split unresolved users toward:
  - `1106` for benefits
  - `994` for safety / anxiety resolution
  - `954` for sale / campaign follow-up only when needed

The cluster is not intended to:

- compete with the official CTA
- become the strongest action area
- make `1095` behave like a sale page

## 5. Link Destinations Confirmed On `1095`

Confirmed from read-only public evidence:

- `1106`
  - `登録前にメリットを確認したい方はこちら`
  - `FANZAの入会メリットを確認する`
- `994`
  - `利用前の不安を整理したい方はこちら`
  - `FANZAの安全な使い方を確認する`
- `954`
  - `開催中のセール・キャンペーン情報を確認する`

Assessment:

- destination set matches the expected fallback cluster scope

## 6. Appropriateness Of Routes To `1106 / 994 / 954`

### `1106`

- appropriate as a follow-up for users who want benefit clarity

### `994`

- appropriate as a follow-up for users with safety or hesitation concerns

### `954`

- conditionally appropriate only as a secondary route
- becomes problematic if sale / campaign motivation overtakes beginner onboarding

Overall assessment:

- destination logic is structurally acceptable
- `954` remains the most sensitive branch because it can shift the page toward sale-led intent

## 7. Confirmation That `1018` Is Not In Routine Routing

Current source-level result:

- no `1018`-type route was identified in the inspected public HTML
- no `saika-kawakita-6` link was observed in the inspected route set

Assessment:

- acceptable at source level
- still not a rendered-layout proof

## 8. Visual Priority Relative To The Main CTA

Current assessment:

- unresolved

What is known:

- the official CTA exists in public output
- internal fallback destinations exist in public output

What remains unknown:

- whether the cluster is visually weaker than the official CTA on desktop
- whether the cluster is visually weaker than the official CTA on mobile
- whether promo blocks amplify the cluster’s practical pull

Decision:

- `HOLD`

## 9. Whether The Cluster Is Too Prominent

Current assessment:

- unresolved

Risk:

- even if the routes are correct, the cluster can still fail if it appears stronger than the main CTA
- `954` can become especially over-attractive when combined with coupon / sale wording

Decision:

- `HOLD`

## 10. Whether It Functions As A Post-Read Support Route

Current assessment:

- structurally yes
- visually unproven

Reason:

- the routes themselves are appropriate for post-read fallback behavior
- rendered prominence and placement were not conclusively verified in this review

Decision:

- `HOLD`

## 11. Whether The `954` Route Makes Sale Intent The Main Story

Current assessment:

- unresolved risk

Reason:

- `954` is supposed to own current sale-check intent
- on `1095`, `954` should remain a fallback path, not the emotional or commercial centerpiece
- when paired with `90%OFFクーポン` wording, the `954` route may become too attractive too early

Decision:

- `HOLD`

## 12. HOLD Items Due To Unproven Rendered Hierarchy

Keep `HOLD` because the following are still unproven:

- desktop cluster-vs-CTA priority
- mobile cluster-vs-CTA priority
- whether `954` feels stronger than `1106 / 994` in practice
- whether promo wording makes the cluster feel more important than intended

## 13. Conditions That Keep `HOLD`

Keep `HOLD` if:

- rendered desktop / mobile hierarchy is not visually confirmed
- cluster subordination is not visually confirmed
- the `954` route still appears capable of becoming the dominant emotional hook
- support routing is structurally fine but practical visual weight is still unknown

## 14. Conditions That Switch To `NO-GO`

Switch to `NO-GO` if any of the following is found:

- internal-link cluster is visually stronger than the main official CTA
- the `954` route becomes the main attraction of the page
- the cluster makes `1095` behave more like `954` than a beginner guide
- `1018` appears in routine routing
- support routes produce visible route overload before beginner orientation is complete

## 15. Recommended Handling

Current recommendation set:

- `そのまま維持`: not recommended yet because rendered hierarchy is unproven
- `弱体化`: recommended if the cluster or `954` branch feels too strong
- `配置変更候補`: recommended if the cluster appears too early or too prominently
- `文言変更候補`: recommended if `954` language sounds too sale-forward inside `1095`

## 16. Items To Transfer Into The Sign-Off Draft

Transfer these findings:

- `1106 / 994 / 954` destination set is structurally valid
- `1018` exclusion is acceptable at source level
- cluster remains conceptually support-only
- visual subordination to the official CTA is still unproven
- the `954` route remains the highest role-mixing risk inside the cluster

## 17. Condition To Proceed To The Next HOLD-Resolution Task

Proceed only if this review framing is accepted:

- route destinations are acceptable in concept
- visual proof is still missing
- the next meaningful task is still execution-stage / rendered hierarchy confirmation, not `GO`

## 18. Suggested `operation-log.md` Entry

Suggested summary:

- created `00_admin/fanza-1095-internal-link-cluster-review.md`
- reviewed the `1095` fallback cluster as support navigation
- confirmed that `1106 / 994 / 954` are structurally appropriate destinations and that `1018` was not identified in source-level routing
- kept `HOLD` because cluster-vs-CTA visual subordination is still unproven and the `954` branch remains the main role-mixing risk
- made no WordPress, SSH, DB, article, taxonomy, redirect, slug, noindex, theme, plugin, media, or `.env` changes
