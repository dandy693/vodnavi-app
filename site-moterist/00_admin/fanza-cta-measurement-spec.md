# FANZA CTA Measurement Spec

## Scope

- Target pages: `1095 / 1106 / 994 / 954`
- Phase: planning only
- This document defines naming and event design, not implementation

## Measurement Principles

1. Use one shared event model across all priority pages.
2. Distinguish page type from placement.
3. Distinguish official CTA clicks from internal-link progression clicks.
4. Keep identifiers stable even if CTA copy changes later.

## Common Event Name

- recommended event name: `fanza_cta_click`

## Required Event Properties

### `page_type`

- `beginner_guide`
- `registration_benefits_guide`
- `safety_anxiety_resolution`
- `evergreen_sale_hub`

### `page_role`

- `entry`
- `consideration`
- `objection_handling`
- `commercial_conversion_hub`

### `placement`

- `top`
- `mid`
- `end`
- `inline`

### `cta_id`

Stable ID format:

- `{page_type}__{placement}__{cta_purpose}`

Examples:

- `beginner_guide__mid__official_latest_info`
- `registration_benefits_guide__end__internal_safety_next`
- `evergreen_sale_hub__mid__official_current_sale`

### `link_target`

Target type values:

- `official_fanza`
- `internal_1095`
- `internal_1106`
- `internal_994`
- `internal_954`
- `internal_future_hub`

Optional future fields if analytics stack supports them:

- `campaign_block_version`
- `cta_copy_version`
- `device_type`

## Shared CTA Taxonomy

### Official CTA purposes

- `official_latest_info`
- `official_registration_benefits`
- `official_pre_use_guidance`
- `official_current_sale`

### Internal CTA purposes

- `internal_benefits_next`
- `internal_safety_next`
- `internal_sale_next`
- `internal_beginner_context`
- `internal_reassurance_context`

## Page-Level Event Design

### 1095

- `page_type`: `beginner_guide`
- `page_role`: `entry`
- planned tracked CTAs:
  - top official CTA
    - `placement`: `top`
    - `cta_id`: `beginner_guide__top__official_latest_info`
    - `link_target`: `official_fanza`
  - mid official CTA
    - `placement`: `mid`
    - `cta_id`: `beginner_guide__mid__official_latest_info`
    - `link_target`: `official_fanza`
  - end internal next-step CTA
    - `placement`: `end`
    - `cta_id`: `beginner_guide__end__internal_benefits_next`
    - `link_target`: `internal_1106`
  - secondary internal trust CTA
    - `placement`: `end`
    - `cta_id`: `beginner_guide__end__internal_safety_next`
    - `link_target`: `internal_994`
  - sale branch CTA
    - `placement`: `inline`
    - `cta_id`: `beginner_guide__inline__internal_sale_next`
    - `link_target`: `internal_954`

### 1106

- `page_type`: `registration_benefits_guide`
- `page_role`: `consideration`
- planned tracked CTAs:
  - top official CTA
    - `placement`: `top`
    - `cta_id`: `registration_benefits_guide__top__official_registration_benefits`
    - `link_target`: `official_fanza`
  - mid official CTA
    - `placement`: `mid`
    - `cta_id`: `registration_benefits_guide__mid__official_registration_benefits`
    - `link_target`: `official_fanza`
  - end official CTA
    - `placement`: `end`
    - `cta_id`: `registration_benefits_guide__end__official_registration_benefits`
    - `link_target`: `official_fanza`
  - end reassurance fallback CTA
    - `placement`: `end`
    - `cta_id`: `registration_benefits_guide__end__internal_safety_next`
    - `link_target`: `internal_994`
  - backfill context CTA
    - `placement`: `inline`
    - `cta_id`: `registration_benefits_guide__inline__internal_beginner_context`
    - `link_target`: `internal_1095`

### 994

- `page_type`: `safety_anxiety_resolution`
- `page_role`: `objection_handling`
- planned tracked CTAs:
  - top low-pressure official text CTA
    - `placement`: `top`
    - `cta_id`: `safety_anxiety_resolution__top__official_pre_use_guidance`
    - `link_target`: `official_fanza`
  - mid official CTA
    - `placement`: `mid`
    - `cta_id`: `safety_anxiety_resolution__mid__official_pre_use_guidance`
    - `link_target`: `official_fanza`
  - end official CTA
    - `placement`: `end`
    - `cta_id`: `safety_anxiety_resolution__end__official_pre_use_guidance`
    - `link_target`: `official_fanza`
  - end sale branch CTA
    - `placement`: `end`
    - `cta_id`: `safety_anxiety_resolution__end__internal_sale_next`
    - `link_target`: `internal_954`
  - inline benefit context CTA
    - `placement`: `inline`
    - `cta_id`: `safety_anxiety_resolution__inline__internal_reassurance_context`
    - `link_target`: `internal_1106`

### 954

- `page_type`: `evergreen_sale_hub`
- `page_role`: `commercial_conversion_hub`
- planned tracked CTAs:
  - top official sale CTA
    - `placement`: `top`
    - `cta_id`: `evergreen_sale_hub__top__official_current_sale`
    - `link_target`: `official_fanza`
  - mid campaign-block official CTA
    - `placement`: `mid`
    - `cta_id`: `evergreen_sale_hub__mid__official_current_sale`
    - `link_target`: `official_fanza`
  - end official sale CTA
    - `placement`: `end`
    - `cta_id`: `evergreen_sale_hub__end__official_current_sale`
    - `link_target`: `official_fanza`
  - internal benefits support CTA
    - `placement`: `end`
    - `cta_id`: `evergreen_sale_hub__end__internal_benefits_next`
    - `link_target`: `internal_1106`
  - internal safety support CTA
    - `placement`: `end`
    - `cta_id`: `evergreen_sale_hub__end__internal_safety_next`
    - `link_target`: `internal_994`
  - internal beginner context CTA
    - `placement`: `inline`
    - `cta_id`: `evergreen_sale_hub__inline__internal_beginner_context`
    - `link_target`: `internal_1095`

## Event Table

| page | primary tracked CTA | secondary tracked CTA | key fallback event |
| --- | --- | --- | --- |
| `1095` | `beginner_guide__mid__official_latest_info` | `beginner_guide__end__internal_benefits_next` | `beginner_guide__inline__internal_sale_next` |
| `1106` | `registration_benefits_guide__mid__official_registration_benefits` | `registration_benefits_guide__end__official_registration_benefits` | `registration_benefits_guide__end__internal_safety_next` |
| `994` | `safety_anxiety_resolution__mid__official_pre_use_guidance` | `safety_anxiety_resolution__end__official_pre_use_guidance` | `safety_anxiety_resolution__end__internal_sale_next` |
| `954` | `evergreen_sale_hub__mid__official_current_sale` | `evergreen_sale_hub__top__official_current_sale` | `evergreen_sale_hub__end__internal_benefits_next` |

## Reporting Views Recommended Later

- by `page_type`
- by `placement`
- by `cta_id`
- official versus internal CTA split
- `954` versus non-`954` click contribution

## Open Items

- final analytics tool and event transport method
- whether scroll-depth should be recorded alongside CTA clicks
- whether campaign-block versioning for `954` should be mandatory
