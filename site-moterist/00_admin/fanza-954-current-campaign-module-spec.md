# FANZA 954 Current Campaign Module Spec

## Scope

- Target page: `post_id 954`
- Parent page type: `Evergreen Sale Hub`
- Module name: `current_campaign_module`
- Phase: local design only
- No production WordPress changes are allowed from this document

## Module Purpose

The module exists to hold the only campaign-specific content area inside `954`.

Its job is to:

- show the current campaign status in a replaceable block
- keep time-sensitive facts out of the evergreen body
- provide the strongest sale-intent CTA on the page
- reduce the risk of stale campaign claims remaining live

## Boundary Between Evergreen Body And Campaign Swap Block

### Evergreen body owns

- what this page helps the user confirm
- how to compare FANZA sales safely
- what types of offers may appear
- what to verify before clicking
- links back to `1095 / 1106 / 994`
- general explanation that campaigns can change

### Current campaign module owns

- campaign name
- campaign period
- campaign scope or eligible offer type
- short caution or confirmation note
- campaign-specific CTA label
- last checked note if shown

### Hard boundary rule

- No date-bound campaign facts should appear outside this module.
- If a campaign expires, only the module is replaced or emptied.
- The evergreen body must still read correctly when the current campaign module is temporarily blank or generic.

## Display Items

Required module items:

1. module heading
   - example role: "Current Campaign Check"
2. status label
   - values such as `current`, `check latest`, `limited-time`
3. campaign name
4. campaign period
5. eligible scope summary
   - example role: video, plan, format, or category scope
6. user confirmation note
   - reminder that official FANZA confirmation is required
7. primary CTA
   - current sale confirmation on FANZA official
8. optional last-checked note
   - date only if the team can maintain it consistently

Optional items:

- one short caution note
- one short "who this is for" line

Do not add:

- multiple outdated campaign cards
- long actress link lists
- long promotional copy blocks

## NG Expressions

- fixed claims that a sale is active without fresh confirmation
- wording that implies guaranteed savings
- wording that implies universal eligibility
- wording that keeps expired dates in visible copy
- wording that merges multiple old campaigns into one promotional paragraph
- urgent sales hype that cannot be verified

Examples of NG direction:

- "現在も絶対に開催中"
- "必ず最安"
- "誰でも同じ条件で使える"
- expired campaign names left in headings after the period ends

## CTA Placement

### Inside the module

- one primary CTA only
- place it after campaign facts and confirmation note
- use the strongest visual emphasis on the page here or in the top sale CTA block

### Relationship with page-level CTAs

- top page CTA:
  - can point to the same official sale confirmation destination
  - should be more general than the module CTA
- module CTA:
  - should be the most campaign-specific CTA on the page
- end page CTA:
  - should repeat the official confirmation action in more evergreen wording

## CTA Measurement Parameters

Use the shared measurement model from `00_admin/fanza-cta-measurement-spec.md`.

Required event shape:

- event name: `fanza_cta_click`
- `page_type`: `evergreen_sale_hub`
- `page_role`: `commercial_conversion_hub`
- `placement`: `mid`
- `cta_id`: `evergreen_sale_hub__mid__official_current_sale`
- `link_target`: `official_fanza`

Optional future fields:

- `campaign_block_version`
- `cta_copy_version`
- `device_type`

## Official Confirmation Path

- The module must always include a short note that campaign details can change.
- The CTA must send users to the official FANZA page for the latest confirmation.
- If any detail is uncertain, replace the campaign-specific summary with a generic "check latest campaign information" state rather than guessing.

## Update Checklist

Before a future operator refreshes the module:

1. confirm the current campaign exists on official FANZA
2. confirm the campaign name
3. confirm the campaign period
4. confirm the eligible scope
5. confirm the CTA destination is still correct
6. remove expired campaign wording completely
7. review the confirmation note wording
8. verify the module still reads correctly on desktop and mobile
9. verify tracking identifiers remain unchanged unless intentional

## Rule For Not Leaving Old Campaign Information Behind

- Only one active current-campaign module may be visible at a time.
- Expired campaign names and periods must be removed, not left below the fold.
- Do not keep a visible history of past campaigns inside the public module.
- If the new campaign is not ready, revert the module to a generic latest-check state.
- Do not leave old CTA copy that references a finished event.

## Desktop Display Policy

- present the module as a high-contrast content block inside the mid-page area
- keep campaign facts on one side or in a stacked summary group
- keep CTA visually separated from supporting notes
- preserve scan order: heading, facts, caution, CTA

## Mobile Display Policy

- stack all items vertically
- keep the heading and status label visible first
- keep period and scope short enough to avoid dense wrapping
- place the CTA immediately after the confirmation note
- avoid side-by-side layouts that compress dates or conditions too tightly

## Future Operator Notes

- This module is not the place for long evergreen explanation.
- If campaign facts are unstable, simplify instead of embellishing.
- The safest fallback is a generic official confirmation state, not a speculative campaign summary.
- Do not turn this module into a multi-campaign archive.
- Keep the module compatible with the page still functioning as an evergreen sale hub even when no named campaign is highlighted.
