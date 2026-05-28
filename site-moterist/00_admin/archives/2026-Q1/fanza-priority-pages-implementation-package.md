# FANZA Priority Pages Implementation Package

## 1. Purpose

This package defines the implementation-ready scope for the four priority FANZA pages before any actual rewrite or WordPress editing begins.

Its goals are:

- convert the existing page-role, CTA, wireframe, and outline specs into page-specific work units
- make it clear what implementers should change and should not change
- preserve distinct roles for `1095 / 1106 / 994 / 954`
- keep `954` evergreen by default while allowing a controlled active campaign mode
- prepare the next phase of rewrite drafting without writing the final body copy yet

## 2. Target Pages

- `1095` `Beginner Guide`
- `1106` `Registration / Benefits Guide`
- `994` `Safety / Anxiety Resolution`
- `954` `Evergreen Sale Hub`

## 3. Implementation Priority

1. `954` `Evergreen Sale Hub`
2. `994` `Safety / Anxiety Resolution`
3. `1106` `Registration / Benefits Guide`
4. `1095` `Beginner Guide`

Priority logic:

- `954` has the largest architectural rewrite and the strictest evergreen/campaign boundary
- `994` must preserve reassurance-to-CTA timing, so structure matters more than copy volume
- `1106` depends on clear benefit framing but has lower structural risk than `954`
- `1095` is important as the entry page, but its rewrite complexity is lower than the others

## 4. Page-Level Change Scope

### `1095`

- rewrite scope: `moderate`
- core job:
  - reposition as the safest beginner entry page
  - reduce friction before routing users to the next best page or official confirmation

### `1106`

- rewrite scope: `moderate`
- core job:
  - focus the page on registration value, benefits, and pre-action confirmation

### `994`

- rewrite scope: `moderate_to_strong`
- core job:
  - make anxiety resolution and trust restoration the main path
  - place the main CTA immediately after reassurance

### `954`

- rewrite scope: `full`
- core job:
  - convert the page into an evergreen sale hub
  - isolate time-sensitive campaign facts inside `current_campaign_module`

## 5. Page-Level Areas To Touch

### `1095 Beginner Guide`

- page title / H1 direction
- intro summary
- beginner orientation block
- caution / confirmation note
- mid official CTA block
- end-of-page CTA composition
- fallback internal-link cluster to `1106 / 994 / 954`
- short beginner FAQ block if needed

### `1106 Registration / Benefits Guide`

- page title / H1 direction
- benefit comparison or support box
- official confirmation CTA blocks
- reassurance fallback CTA
- end-of-page composition
- fallback internal-link cluster to `994 / 1095 / 954`
- short FAQ focused on changing details and confirmation points

### `994 Safety / Anxiety Resolution`

- page title / H1 direction
- FAQ / reassurance section order
- main CTA placement immediately after reassurance
- caution / safety note
- secondary sale-support CTA
- end-of-page composition
- fallback internal-link cluster to `1106 / 954 / 1095`

### `954 Evergreen Sale Hub`

- page title / H1 direction
- evergreen intro summary
- comparison / support box explaining how to check offers
- `current_campaign_module`
- top / mid / end official sale CTA flow
- caution note wording
- end-of-page composition
- fallback internal-link cluster to `1106 / 994 / 1095`

## 6. Page-Level Areas Not To Touch

### All Four Pages

- WordPress production content during this phase
- taxonomy settings
- slug
- redirect settings
- noindex settings
- theme or plugin behavior
- actress-architecture routing for `1018`
- media uploads
- adult visual assets

### `1095 / 1106 / 994`

- do not turn these pages into campaign pages
- do not add campaign-period claims as a core message

### `954`

- do not move campaign-specific facts into the evergreen body
- do not add actress-support routing into standard navigation
- do not make registration the primary action

## 7. Body Rewrite Cautions

### Shared

- keep one dominant search intent per page
- keep official confirmation language factual and current-check oriented
- avoid claim language that can drift over time
- keep internal links supportive, not equal to the official CTA
- do not write final body copy yet in this phase

### `1095`

- do not front-load benefits-heavy persuasion
- keep the first screens calm and beginner-safe

### `1106`

- do not duplicate `1095` as a broad beginner overview
- keep the value explanation concrete but non-absolute

### `994`

- do not delay the main CTA until after long support content
- keep reassurance before monetization

### `954`

- do not reintroduce seasonal article framing
- do not place campaign names, dates, or discount figures outside `current_campaign_module`

## 8. CTA Reflection Rules

### Shared

- use `fanza_cta_click` naming and the existing `page_type / page_role / placement / cta_id / link_target` structure
- keep one strongest official CTA per main conversion moment
- keep fallback routes visually weaker than the official CTA

### `1095`

- top:
  - low-pressure official text-link CTA
- mid:
  - main official latest-info CTA
- end:
  - final official CTA
  - secondary CTA to `1106`

### `1106`

- top:
  - official registration-benefits CTA
- mid:
  - strongest official CTA repeat
- end:
  - final official CTA
  - secondary reassurance CTA to `994`

### `994`

- top:
  - low-pressure official text-link CTA
- mid:
  - primary CTA immediately after reassurance
- end:
  - final official CTA
  - optional secondary CTA to `954`

### `954`

- top:
  - official current-sale CTA
- mid:
  - official current-sale CTA inside `current_campaign_module`
- end:
  - final official current-sale CTA
- default state:
  - `generic_latest_check_state`

## 9. Fallback Internal-Link Cluster Reflection Rules

### Shared

- treat internal-link clusters as support only
- do not place a full cluster above the main CTA layer
- place the cluster after the final CTA or in clearly subordinate mid-page support positions
- do not route to `1018`

### Destination Priority By Page

- `1095`:
  - `1106`, `994`, `954`
- `1106`:
  - `994`, `1095`, `954`
- `994`:
  - `1106`, `954`, `1095`
- `954`:
  - `1106`, `994`, `1095`

## 10. FAQ Reflection Rules

### Shared

- FAQ should resolve likely hesitation, not add a new topic cluster
- FAQ should stay short and evergreen
- FAQ must not become a second CTA zone

### `1095`

- use short beginner-orientation questions only

### `1106`

- use FAQ to support value comparison and what must be officially confirmed

### `994`

- FAQ is core and should come before the main mid CTA
- use it to answer the highest-likelihood trust objections

### `954`

- FAQ is optional and should only support how to confirm current sale information
- do not let FAQ become another campaign-detail block

## 11. `954` Current-Campaign Module Reflection Rules

- use the module only on `954`
- keep all time-sensitive campaign facts inside this block only
- include:
  - status label
  - module heading
  - campaign summary
  - official confirmation note
  - module-level CTA
- keep the module replaceable without requiring the evergreen body to change
- if facts are uncertain, use generic latest-check content instead of speculative detail

## 12. `954` Generic / Active State Handling

### Default

- `generic_latest_check_state`
- no named campaign claim
- no active period shown outside the module
- neutral urgency

### Conditional State

- `active_campaign_state`
- use only when the campaign is officially confirmed as active
- campaign-specific name, period, and scope remain inside the module only
- stronger visual emphasis is allowed inside the module
- hero, intro, and end composition remain evergreen

### Return Rule

- when an active campaign ends, return to generic state immediately
- remove campaign-specific names, dates, and discount references
- confirm no stale campaign language remains in any evergreen section

## 13. Measurement Reflection Rules

### Shared Event Model

- event name:
  - `fanza_cta_click`
- required parameters:
  - `page_type`
  - `page_role`
  - `placement`
  - `cta_id`
  - `link_target`

### Page Role Mapping

- `1095`:
  - `page_type`: `beginner_guide`
  - `page_role`: `entry`
- `1106`:
  - `page_type`: `registration_benefits_guide`
  - `page_role`: `consideration`
- `994`:
  - `page_type`: `safety_anxiety_resolution`
  - `page_role`: `objection_handling`
- `954`:
  - `page_type`: `evergreen_sale_hub`
  - `page_role`: `commercial_conversion_hub`

### Implementation Rule

- keep `cta_id` stable even if visible CTA text changes later
- distinguish official CTA clicks from internal next-step clicks
- track top, mid, end, and inline placements only where the existing spec already defines them

## 14. Pre-Implementation Checklist

1. confirm the work remains local design/planning only
2. confirm no WordPress production editing is included
3. confirm each page still has one dominant role
4. confirm `1095` remains beginner-first
5. confirm `1106` remains benefits-first
6. confirm `994` remains reassurance-first with immediate CTA handoff
7. confirm `954` remains sale-confirmation-first
8. confirm `954` defaults to `generic_latest_check_state`
9. confirm `active_campaign_state` is conditional on official confirmation only
10. confirm `1018` is excluded from normal routing
11. confirm CTA naming aligns with `fanza_cta_click`
12. confirm fallback internal-link clusters remain subordinate

## 15. Post-Implementation Checklist

1. confirm page structure matches the approved outline and module order
2. confirm CTA placements match the page-specific wireframe
3. confirm internal-link cluster placement does not outrank the CTA layer
4. confirm end-of-page composition follows the approved order
5. confirm FAQ remains scoped to the page role
6. confirm `954` campaign details appear only inside `current_campaign_module`
7. confirm `954` still reads correctly in generic state
8. confirm tracked CTA IDs match the measurement spec
9. confirm `1018` is not added into standard routing
10. confirm no unsupported urgency language was introduced

## 16. Rollback Review Items

If a future implementation needs rollback review, confirm:

1. which page sections changed
2. whether CTA IDs or link targets changed
3. whether page role drift occurred
4. whether `954` campaign-specific content leaked outside the module
5. whether the page became more seasonal, more promotional, or more confusing than intended
6. whether fallback internal links became too visually strong
7. whether any newly introduced FAQ or support block broke the intended funnel order

## 17. Separate Checks Required Before Production Reflection

- final article draft review against the rewrite brief
- official fact confirmation for any time-sensitive or policy-sensitive claims
- analytics implementation feasibility review
- final CTA destination review
- final internal-link target review
- desktop/mobile QA against the approved wireframe
- cache-aware live QA plan for public rendering checks
- explicit go/no-go decision before any WordPress editing

## 18. Granularity For The Next Rewrite-Draft Phase

The next phase should not jump straight to publish-ready copy.

Recommended drafting units:

### Per Page

- H1 draft options
- section-by-section bullet draft
- CTA copy variants
- FAQ question list plus answer bullets
- internal-link placement notes
- caution-note wording options

### For `954`

- one draft set for `generic_latest_check_state`
- one conditional draft set for `active_campaign_state`
- separate draft notes for:
  - evergreen intro
  - comparison guidance
  - `current_campaign_module`
  - end-of-page official confirmation CTA

### Delivery Standard

- each section should be drafted as structured bullets or short paragraph intents first
- each page draft should state:
  - section purpose
  - claim-sensitivity level
  - CTA to attach
  - internal link to attach if any
- do not draft `1018` into any routine route package at this stage
