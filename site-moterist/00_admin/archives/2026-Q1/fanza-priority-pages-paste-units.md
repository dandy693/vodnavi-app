# FANZA Priority Pages Paste Units

## 1. Purpose

This document breaks the approved section rewrite drafts into paste-sized implementation units for local planning.

Its goals are:

- give implementers a practical paste order before any WordPress work begins
- separate H2 / H3 / body summary / CTA / internal-link / FAQ elements into manageable blocks
- reduce the risk of page-role drift during future implementation
- make `954` state handling explicit at the block level

This is not final article copy and not a production edit instruction.

## 2. Target Pages

- `1095` `Beginner Guide`
- `1106` `Registration / Benefits Guide`
- `994` `Safety / Anxiety Resolution`
- `954` `Evergreen Sale Hub`

## 3. Shared Paste Unit Rules

1. One paste unit should represent one clear structural block.
2. CTA paste units should stay separate from fallback internal-link units where possible.
3. FAQ paste units should stay separate from core explanatory units.
4. `1018` must not appear in any routine internal-link unit.
5. `954` defaults to `generic_latest_check_state`.
6. `954` `active_campaign_state` is a swap-only unit and must not be used without official confirmation.

## 4. Page-Level Paste Unit List

### `1095`

- `1095-pu01` hero / intro summary
- `1095-pu02` H2 first-step orientation
- `1095-pu03` H2 confusion-reduction
- `1095-pu04` mid primary CTA block
- `1095-pu05` H2 official confirmation section
- `1095-pu06` end next-step internal-link cluster
- `1095-pu07` beginner FAQ block
- `1095-pu08` end-of-page CTA composition

### `1106`

- `1106-pu01` hero / intro summary
- `1106-pu02` H2 benefits explanation
- `1106-pu03` H2 confirmation-points explanation
- `1106-pu04` mid primary CTA block
- `1106-pu05` H2 official-page confirmation section
- `1106-pu06` end fallback internal-link cluster
- `1106-pu07` benefits FAQ block
- `1106-pu08` end-of-page CTA composition

### `994`

- `994-pu01` hero / intro summary
- `994-pu02` H2 concern-surfacing block
- `994-pu03` H2 reassurance block
- `994-pu04` mid primary CTA block
- `994-pu05` H2 official confirmation section
- `994-pu06` end fallback internal-link cluster
- `994-pu07` reassurance FAQ block
- `994-pu08` end-of-page CTA composition

### `954`

- `954-pu01` hero / intro summary
- `954-pu02` H2 evergreen promise section
- `954-pu03` H2 comparison guidance section
- `954-pu04` `generic_latest_check_state` module
- `954-pu05` `active_campaign_state` swap module
- `954-pu06` related-guidance internal-link cluster
- `954-pu07` evergreen FAQ block
- `954-pu08` end-of-page CTA composition

## 5. Paste Unit Details

## `1095` Beginner Guide

### `1095-pu01` Hero / Intro Summary

- role:
  - beginner-safe entry
  - explain what the page helps the reader do
- intended placement:
  - top of page
- H2 / H3:
  - none
- body summary:
  - explain where first-time users should start
  - reduce pressure to register or decide immediately
- CTA:
  - top text-link:
    - `FANZA公式で最新情報を確認する`
- internal links:
  - none
- FAQ:
  - none
- replace assumption:
  - existing intro / lead area
- keep assumption:
  - any neutral beginner-entry framing that still fits the role

### `1095-pu02` H2 First-Step Orientation

- role:
  - establish basic orientation
- intended placement:
  - early body after intro
- H2:
  - `FANZAで最初に知っておきたいこと`
- H3:
  - `どんな人向けのサービスか`
  - `最初に確認するポイント`
- body summary:
  - high-level explanation only
  - no unstable detail overload
- CTA:
  - none
- internal links:
  - none
- FAQ:
  - none
- replace assumption:
  - existing broad overview section
- keep assumption:
  - concise neutral service explanation if it remains evergreen

### `1095-pu03` H2 Confusion-Reduction

- role:
  - reduce uncertainty and route readers by intent
- intended placement:
  - mid-early body
- H2:
  - `初心者が迷いやすいポイント`
- H3:
  - `何から見ればいいか`
  - `不安なときに確認するページ`
- body summary:
  - explain a simple next-step sequence
  - route hesitant users toward `994`
- CTA:
  - none
- internal links:
  - optional inline support to `994`
- FAQ:
  - none
- replace assumption:
  - scattered confusion / guidance paragraphs
- keep assumption:
  - useful beginner hesitation examples if concise

### `1095-pu04` Mid Primary CTA Block

- role:
  - main official handoff
- intended placement:
  - directly after confusion-reduction block
- H2 / H3:
  - none
- body summary:
  - short support text only
- CTA:
  - heading:
    - `まずはFANZA公式の最新案内を確認する`
  - label:
    - `FANZA公式で最新情報を確認する`
  - measurement:
    - `event_name`: `fanza_cta_click`
    - `page_type`: `beginner_guide`
    - `page_role`: `entry`
    - `placement`: `mid`
    - `cta_id`: `beginner_guide__mid__official_latest_info`
    - `link_target`: `official_fanza`
- internal links:
  - none
- FAQ:
  - none
- replace assumption:
  - existing mid CTA or insert new block
- keep assumption:
  - official-confirmation emphasis

### `1095-pu05` H2 Official Confirmation Section

- role:
  - explain why official confirmation matters
- intended placement:
  - after mid CTA
- H2:
  - `次に進む前に確認したい公式情報`
- body summary:
  - highlight changeable details
- CTA:
  - none
- internal links:
  - none
- FAQ:
  - none
- replace assumption:
  - unstable feature / conditions explanation
- keep assumption:
  - concise caution wording

### `1095-pu06` End Next-Step Internal-Link Cluster

- role:
  - support-level next-step routing
- intended placement:
  - late body or end section
- H2:
  - `次に確認したいページ`
- body summary:
  - present support paths only
- CTA:
  - none
- internal links:
  - `登録メリットを確認する`
  - `安全性や使い方を確認する`
  - `現在のセール情報を確認する`
- FAQ:
  - none
- replace assumption:
  - crowded end links
- keep assumption:
  - role-appropriate links to `1106 / 994 / 954`

### `1095-pu07` Beginner FAQ Block

- role:
  - answer first-step hesitation
- intended placement:
  - late body before final CTA composition
- H2:
  - `よくある疑問`
- FAQ:
  - `FANZAは何から見ればいいですか？`
  - `最初に確認しておくべき情報は何ですか？`
  - `不安がある場合はどのページを先に見るべきですか？`
- replace assumption:
  - generic filler FAQ
- keep assumption:
  - concise beginner Q&A if still useful

### `1095-pu08` End-Of-Page CTA Composition

- role:
  - final action plus one clear fallback
- intended placement:
  - page end
- CTA:
  - final official CTA:
    - `FANZA公式で最新情報を確認する`
  - secondary CTA:
    - `登録メリットを先に確認する`
  - measurement:
    - official:
      - `beginner_guide__mid__official_latest_info` as core tracked CTA family
    - secondary:
      - `beginner_guide__end__internal_benefits_next`
- internal links:
  - compact fallback cluster only
- replace assumption:
  - existing crowded closing section
- keep assumption:
  - concise caution note

## `1106` Registration / Benefits Guide

### `1106-pu01` Hero / Intro Summary

- role:
  - set benefits / value intent
- intended placement:
  - top of page
- H2 / H3:
  - none
- body summary:
  - explain that this page helps users compare the value of registration or use
- CTA:
  - top primary:
    - `FANZA公式で登録前の案内を確認する`
  - measurement:
    - `registration_benefits_guide__top__official_registration_benefits`
- replace assumption:
  - current lead section
- keep assumption:
  - benefit-intent framing if still evergreen

### `1106-pu02` H2 Benefits Explanation

- role:
  - explain perceived value without overclaiming
- intended placement:
  - early body
- H2:
  - `登録前に理解しておきたいメリット`
- H3:
  - `どんな価値を感じやすいか`
  - `比較して見たいポイント`
- body summary:
  - keep the page in consideration mode
- replace assumption:
  - generic benefit list
- keep assumption:
  - neutral value points

### `1106-pu03` H2 Confirmation-Points Explanation

- role:
  - explain what must be officially checked
- intended placement:
  - mid body before CTA
- H2:
  - `登録前に確認しておきたいこと`
- H3:
  - `変わりやすい情報`
  - `公式確認が必要な項目`
- body summary:
  - clarify that terms and benefits may change
- replace assumption:
  - unstable claims section
- keep assumption:
  - concise caution wording

### `1106-pu04` Mid Primary CTA Block

- role:
  - strongest official confirmation handoff
- intended placement:
  - after benefits + confirmation sections
- CTA:
  - heading:
    - `登録前の案内を公式で確認しておく`
  - label:
    - `FANZA公式で登録前の案内を確認する`
  - measurement:
    - `event_name`: `fanza_cta_click`
    - `page_type`: `registration_benefits_guide`
    - `page_role`: `consideration`
    - `placement`: `mid`
    - `cta_id`: `registration_benefits_guide__mid__official_registration_benefits`
    - `link_target`: `official_fanza`
- replace assumption:
  - existing CTA or insert new block
- keep assumption:
  - official confirmation route

### `1106-pu05` H2 Official-Page Confirmation Section

- role:
  - reinforce direct official verification
- intended placement:
  - after mid CTA
- H2:
  - `公式ページで確認したい案内`
- body summary:
  - practical confirmation reminders
- replace assumption:
  - duplicated beginner explanation or excessive promo copy
- keep assumption:
  - concise verification guidance

### `1106-pu06` End Fallback Internal-Link Cluster

- role:
  - route uncertain users without changing page role
- intended placement:
  - late body / end
- H2:
  - `不安が残る場合の次ページ`
- internal links:
  - `安全性や使い方も確認しておく`
  - `初心者向けガイドから確認する`
  - `現在のセール状況を見る`
- replace assumption:
  - excessive end branches
- keep assumption:
  - links to `994 / 1095 / 954`

### `1106-pu07` Benefits FAQ Block

- role:
  - answer confirmation-oriented questions
- intended placement:
  - late body
- FAQ:
  - `登録前に何を確認すべきですか？`
  - `メリット情報のうち変わりやすいものは何ですか？`
  - `不安が残る場合は次にどこを見ればよいですか？`
- replace assumption:
  - generic FAQ
- keep assumption:
  - useful compact Q&A

### `1106-pu08` End-Of-Page CTA Composition

- role:
  - final benefits-confirmation action
- intended placement:
  - page end
- CTA:
  - final official:
    - `FANZA公式で登録前の案内を確認する`
  - secondary:
    - `安全性や使い方も確認しておく`
  - measurement:
    - official:
      - `registration_benefits_guide__end__official_registration_benefits`
    - secondary:
      - `registration_benefits_guide__end__internal_safety_next`
- internal links:
  - compact fallback cluster
- replace assumption:
  - current closing section
- keep assumption:
  - short caution note

## `994` Safety / Anxiety Resolution

### `994-pu01` Hero / Intro Summary

- role:
  - normalize hesitation and set trust-first intent
- intended placement:
  - top of page
- CTA:
  - top text-link:
    - `FANZA公式で利用前の案内を確認する`
  - measurement:
    - `safety_anxiety_resolution__top__official_pre_use_guidance`
- replace assumption:
  - current lead section
- keep assumption:
  - trust-oriented framing

### `994-pu02` H2 Concern-Surfacing Block

- role:
  - identify likely anxiety points
- intended placement:
  - early body
- H2:
  - `利用前に不安になりやすい点`
- H3:
  - `プライバシー面で気になること`
  - `利用前に確認したい基本事項`
- body summary:
  - acknowledge common concerns without amplifying them
- replace assumption:
  - scattered concern paragraphs
- keep assumption:
  - neutral trust concerns

### `994-pu03` H2 Reassurance Block

- role:
  - resolve hesitation before action
- intended placement:
  - directly before mid CTA
- H2:
  - `不安を減らすために確認したいこと`
- H3:
  - `公式案内で確認すべき項目`
  - `迷ったときの判断基準`
- body summary:
  - answer concerns clearly and calmly
- replace assumption:
  - promotional reassurance copy
- keep assumption:
  - concise fact-versus-confirmation guidance

### `994-pu04` Mid Primary CTA Block

- role:
  - immediate post-reassurance action
- intended placement:
  - immediately after `994-pu03`
- CTA:
  - heading:
    - `不安が残る前に、利用前の案内を公式で確認する`
  - label:
    - `FANZA公式で利用前の案内を確認する`
  - measurement:
    - `event_name`: `fanza_cta_click`
    - `page_type`: `safety_anxiety_resolution`
    - `page_role`: `objection_handling`
    - `placement`: `mid`
    - `cta_id`: `safety_anxiety_resolution__mid__official_pre_use_guidance`
    - `link_target`: `official_fanza`
- replace assumption:
  - delayed CTA placement
- keep assumption:
  - official guidance direction

### `994-pu05` H2 Official Confirmation Section

- role:
  - reinforce what to confirm before action
- intended placement:
  - after the mid CTA
- H2:
  - `利用前に公式で確認したい案内`
- body summary:
  - summarize official confirmation points
- replace assumption:
  - long explanatory tail
- keep assumption:
  - compact caution guidance

### `994-pu06` End Fallback Internal-Link Cluster

- role:
  - support paths after trust handoff
- intended placement:
  - late body / end
- H2:
  - `次に確認したい関連ページ`
- internal links:
  - `登録メリットを確認する`
  - `現在のセール情報も確認する`
  - `初心者向けガイドに戻る`
- replace assumption:
  - scattered bottom links
- keep assumption:
  - links to `1106 / 954 / 1095`

### `994-pu07` Reassurance FAQ Block

- role:
  - answer real trust objections
- intended placement:
  - before end CTA composition if not already integrated
- FAQ:
  - `利用前に何を確認しておくべきですか？`
  - `不安が残る場合はどこを先に見るべきですか？`
  - `セール確認はどの段階で見るべきですか？`
- replace assumption:
  - filler FAQ or sales FAQ
- keep assumption:
  - trust-oriented Q&A only

### `994-pu08` End-Of-Page CTA Composition

- role:
  - preserve reassurance-to-action flow at page end
- intended placement:
  - page end
- CTA:
  - final official:
    - `FANZA公式で利用前の案内を確認する`
  - secondary:
    - `開催中のセール情報も確認する`
  - measurement:
    - official:
      - `safety_anxiety_resolution__end__official_pre_use_guidance`
    - secondary:
      - `safety_anxiety_resolution__end__internal_sale_next`
- internal links:
  - compact fallback cluster
- replace assumption:
  - existing closing blocks
- keep assumption:
  - concise caution note

## `954` Evergreen Sale Hub

### `954-pu01` Hero / Intro Summary

- role:
  - evergreen sale-intent framing
- intended placement:
  - top of page
- CTA:
  - top primary:
    - `FANZA公式で現在のセール情報を確認する`
  - measurement:
    - `evergreen_sale_hub__top__official_current_sale`
- replace assumption:
  - current lead section
- keep assumption:
  - sale-intent URL value

### `954-pu02` H2 Evergreen Promise Section

- role:
  - explain what this evergreen page helps the user confirm
- intended placement:
  - early body
- H2:
  - `このページで確認できること`
- H3:
  - `変わりやすい情報`
  - `先に知っておきたい見方`
- body summary:
  - explain what changes over time and why official confirmation matters
- replace assumption:
  - season-bound intro copy
- keep assumption:
  - evergreen sale-intent framing

### `954-pu03` H2 Comparison Guidance Section

- role:
  - teach readers how to interpret current offers
- intended placement:
  - mid body before campaign module
- H2:
  - `セールや特典を確認するときの見方`
- H3:
  - `比較したいポイント`
  - `公式確認が必要な項目`
- body summary:
  - stay evergreen and method-focused
- replace assumption:
  - old campaign-specific explanation
- keep assumption:
  - useful comparison guidance if evergreen

### `954-pu04` `generic_latest_check_state` Module

- role:
  - default current-campaign module
- intended placement:
  - mid page after comparison guidance
- H2:
  - `現在のキャンペーン確認`
- module content:
  - heading:
    - `現在のセール情報を公式で確認する`
  - status:
    - `最新情報を確認`
  - summary:
    - `開催中の内容は時期によって変わるため、このブロックでは公式で確認したいポイントをまとめています。`
  - support:
    - `名称や期間がはっきりしない場合は、個別のキャンペーン名よりも最新案内の確認を優先します。`
  - caution:
    - `割引内容や対象条件は変わることがあるため、最終的には公式ページで確認してください。`
  - CTA:
    - `FANZA公式で現在のセール情報を確認する`
  - measurement:
    - `event_name`: `fanza_cta_click`
    - `page_type`: `evergreen_sale_hub`
    - `page_role`: `commercial_conversion_hub`
    - `placement`: `mid`
    - `cta_id`: `evergreen_sale_hub__mid__official_current_sale`
    - `link_target`: `official_fanza`
- replace assumption:
  - any existing seasonal module or dated campaign block
- keep assumption:
  - no dated content outside this unit

### `954-pu05` `active_campaign_state` Swap Module

- role:
  - conditional replacement for `954-pu04`
- intended placement:
  - same location as `954-pu04`
- use condition:
  - only when active campaign status is officially confirmed
- module content:
  - heading:
    - `開催中キャンペーンを公式で確認する`
  - status:
    - `開催中`
  - summary template:
    - `現在は「{campaign_name}」が案内されている可能性があります。期間や対象条件は必ず公式ページで確認してください。`
  - detail template:
    - `対象範囲や適用条件は変わる場合があるため、このブロックでは概要だけを示し、最終確認は公式へ誘導します。`
  - caution:
    - `終了日や割引率を含む詳細は変動するため、本文側へ固定的に残さないでください。`
  - CTA:
    - `FANZA公式で開催中キャンペーンを確認する`
  - measurement:
    - same core event family as `954-pu04`
- replace assumption:
  - `954-pu04` only
- keep assumption:
  - hero / intro / end remain evergreen

### `954-pu06` Related-Guidance Internal-Link Cluster

- role:
  - support readers who still need context
- intended placement:
  - late support section or end support area
- H2:
  - `関連ページで確認したいこと`
- internal links:
  - `登録メリットを確認してから選ぶ`
  - `安全性や使い方も確認しておく`
  - `初心者向けガイドから整理する`
- replace assumption:
  - actress-heavy clutter or unrelated support links
- keep assumption:
  - links to `1106 / 994 / 1095`

### `954-pu07` Evergreen FAQ Block

- role:
  - answer how-to-check questions, not campaign specifics
- intended placement:
  - late body before final CTA
- FAQ:
  - `セール情報でまず何を確認すべきですか？`
  - `変わりやすい情報はどれですか？`
  - `キャンペーンが不明なときはどう見ればよいですか？`
- replace assumption:
  - stale campaign FAQ
- keep assumption:
  - evergreen how-to-check Q&A only

### `954-pu08` End-Of-Page CTA Composition

- role:
  - final official sale-confirmation action
- intended placement:
  - page end
- CTA:
  - final official:
    - `FANZA公式で現在のセール情報を確認する`
  - measurement:
    - `evergreen_sale_hub__end__official_current_sale`
- internal links:
  - compact fallback cluster only
- replace assumption:
  - crowded closing sales section
- keep assumption:
  - concise evergreen caution note

## 6. CTA Copy Drafts

- `1095`
  - `FANZA公式で最新情報を確認する`
  - `登録メリットを先に確認する`
- `1106`
  - `FANZA公式で登録前の案内を確認する`
  - `安全性や使い方も確認しておく`
- `994`
  - `FANZA公式で利用前の案内を確認する`
  - `開催中のセール情報も確認する`
- `954`
  - `FANZA公式で現在のセール情報を確認する`
  - `FANZA公式で開催中キャンペーンを確認する`

## 7. Internal-Link Cluster Copy Drafts

- `1095`
  - `登録メリットを確認する`
  - `安全性や使い方を確認する`
  - `現在のセール情報を確認する`
- `1106`
  - `安全性や使い方も確認しておく`
  - `初心者向けガイドから確認する`
  - `現在のセール状況を見る`
- `994`
  - `登録メリットを確認する`
  - `現在のセール情報も確認する`
  - `初心者向けガイドに戻る`
- `954`
  - `登録メリットを確認してから選ぶ`
  - `安全性や使い方も確認しておく`
  - `初心者向けガイドから整理する`

## 8. FAQ Copy Drafts

- `1095`
  - `FANZAは何から見ればいいですか？`
  - `最初に確認しておくべき情報は何ですか？`
  - `不安がある場合はどのページを先に見るべきですか？`
- `1106`
  - `登録前に何を確認すべきですか？`
  - `メリット情報のうち変わりやすいものは何ですか？`
  - `不安が残る場合は次にどこを見ればよいですか？`
- `994`
  - `利用前に何を確認しておくべきですか？`
  - `不安が残る場合はどこを先に見るべきですか？`
  - `セール確認はどの段階で見るべきですか？`
- `954`
  - `セール情報でまず何を確認すべきですか？`
  - `変わりやすい情報はどれですか？`
  - `キャンペーンが不明なときはどう見ればよいですか？`

## 9. Measurement Parameter Summary

- shared event:
  - `fanza_cta_click`
- required fields:
  - `page_type`
  - `page_role`
  - `placement`
  - `cta_id`
  - `link_target`
- unit-specific core events:
  - `1095-pu04`: `beginner_guide__mid__official_latest_info`
  - `1106-pu04`: `registration_benefits_guide__mid__official_registration_benefits`
  - `994-pu04`: `safety_anxiety_resolution__mid__official_pre_use_guidance`
  - `954-pu04` / `954-pu05`: `evergreen_sale_hub__mid__official_current_sale`

## 10. Pre-Paste Checks

1. confirm the target page role matches the intended paste unit
2. confirm the unit is being inserted in the approved order
3. confirm no unit introduces `1018`
4. confirm CTA wording matches the approved page role
5. confirm `954` state selection is correct before choosing `954-pu04` or `954-pu05`
6. confirm no stale campaign facts remain outside `954-pu05`
7. confirm each unit remains concise enough to paste and review independently

## 11. Post-Paste Checks

1. confirm the inserted unit sits in the intended position
2. confirm headings and CTA order remain correct
3. confirm fallback links remain support-level only
4. confirm FAQ remains scoped to the page role
5. confirm no duplicated or conflicting units remain after replacement
6. confirm page-level flow still matches the approved rewrite draft

## 12. QA Checklist Mapping

- page-role validation:
  - `fanza-priority-pages-pre-publish-qa-checklist.md`
  - sections `3` and `4`
- CTA validation:
  - sections `5` and `8`
- internal-link validation:
  - section `6`
- FAQ validation:
  - section `7`
- mobile / desktop validation:
  - sections `9` and `10`
- `954` state validation:
  - sections `11`, `12`, and `13`
- `1018` exclusion:
  - section `14`
- exaggeration / certainty review:
  - section `15`
- publish / rollback readiness:
  - sections `16` to `19`
