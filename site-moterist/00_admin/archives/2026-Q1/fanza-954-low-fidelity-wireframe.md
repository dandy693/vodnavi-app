# FANZA 954 Low-Fidelity Wireframe

## Scope

- Target page: `post_id 954`
- Page type: `Evergreen Sale Hub`
- Phase: local design only
- Default module state: `generic_latest_check_state`
- Alternate module state: `active_campaign_state`
- No production WordPress changes are allowed from this document

## Core State Rule

1. `generic_latest_check_state` is the default.
2. `active_campaign_state` is used only when a current campaign is officially confirmed.
3. Expired campaign names, end dates, and old discount details must never remain in the evergreen body.
4. All date-bound campaign information belongs only inside the replaceable current-campaign module.

## Evergreen Body And Replaceable Block Boundary

### Evergreen body owns

- page purpose
- how to check current FANZA offers
- offer type explanations
- comparison guidance
- links to `1095 / 1106 / 994`
- evergreen official-confirmation framing

### Replaceable current-campaign module owns

- campaign status
- campaign name
- campaign period
- eligible scope summary
- caution note
- campaign-specific CTA wording
- optional last-checked note

### Screen-level boundary rule

- The current-campaign module appears as one visually separated mid-page block.
- No campaign dates or named campaign details should appear above or below that module.
- If the module returns to generic state, the page still reads as a complete sale hub.

## Desktop Wireframe

```text
+----------------------------------------------------------------------------------+
| Header / Breadcrumb                                                              |
+----------------------------------------------------------------------------------+
| HERO                                                                             |
| [H1: Evergreen Sale Hub]                                                         |
| Short evergreen lead explaining this page helps confirm current FANZA offers     |
| [Top CTA: official current-sale confirmation]                                    |
+----------------------------------------------------------------------------------+
| HOW TO USE THIS PAGE                                                             |
| - what changes over time                                                         |
| - why official confirmation matters                                              |
| - what users should compare before clicking                                      |
+----------------------------------------------------------------------------------+
| OFFER TYPE OVERVIEW                                                              |
| [Card] sale type A   [Card] sale type B   [Card] plan / format guidance          |
+----------------------------------------------------------------------------------+
| CURRENT-CAMPAIGN MODULE                                                          |
| +------------------------------------------------------------------------------+ |
| | State badge                                                                  | |
| | Module heading                                                               | |
| | Campaign status summary                                                      | |
| | Campaign name / period / eligible scope                                      | |
| | Confirmation note                                                            | |
| | [Mid CTA: official current-sale confirmation]                                | |
| | Optional last-checked note                                                   | |
| +------------------------------------------------------------------------------+ |
+----------------------------------------------------------------------------------+
| RELATED GUIDANCE                                                                 |
| [1095 Beginner] [1106 Benefits] [994 Safety]                                     |
+----------------------------------------------------------------------------------+
| FINAL CONVERSION BLOCK                                                           |
| Short evergreen close                                                            |
| [End CTA: official current-sale confirmation]                                    |
| [Fallback links: 1106 / 994]                                                     |
+----------------------------------------------------------------------------------+
```

## Mobile Wireframe

```text
+--------------------------------------+
| Header / Breadcrumb                  |
+--------------------------------------+
| HERO                                 |
| H1                                   |
| evergreen lead                       |
| [Top CTA]                            |
+--------------------------------------+
| HOW TO USE THIS PAGE                 |
| evergreen guidance                   |
+--------------------------------------+
| OFFER TYPE OVERVIEW                  |
| [Card]                               |
| [Card]                               |
| [Card]                               |
+--------------------------------------+
| CURRENT-CAMPAIGN MODULE              |
| [State badge]                        |
| Module heading                       |
| Campaign status summary              |
| Campaign name                        |
| Campaign period                      |
| Eligible scope                       |
| Confirmation note                    |
| [Mid CTA]                            |
| Optional last-checked note           |
+--------------------------------------+
| RELATED GUIDANCE                     |
| [1095]                               |
| [1106]                               |
| [994]                                |
+--------------------------------------+
| FINAL CONVERSION BLOCK               |
| evergreen close                      |
| [End CTA]                            |
| [Fallback 1106] [Fallback 994]       |
+--------------------------------------+
```

## Generic Latest-Check State

### Use condition

- default state
- use when no campaign has been freshly confirmed
- use when a prior campaign has ended and the next one is not ready

### Module content

- state badge: `check latest`
- module heading: current campaign check
- summary: explain that current campaign conditions may change
- no named campaign claim
- no discount percentage
- no end date
- CTA wording: confirm the latest campaign information on FANZA official

### Wireframe emphasis

- keep the module visually important but less urgent than an active campaign block
- use neutral wording and neutral status styling

## Active Campaign State

### Use condition

- use only when the campaign is currently confirmed through official FANZA information

### Module content

- state badge: `current` or `limited-time`
- module heading: current campaign check
- named campaign summary
- campaign period
- eligible scope summary
- confirmation note
- CTA wording tied to the current campaign check
- optional last-checked note

### Wireframe emphasis

- stronger status emphasis than the generic state
- still keep one CTA only
- do not add extra promotional sub-blocks just because a campaign is live

## Current-Campaign Module Position

- place it after the evergreen offer-type overview
- keep it before related guidance links
- treat it as the only campaign-specific screen block on the page
- do not place named campaign snippets in the hero or footer

## CTA Placement

### Top CTA

- location: hero
- role: general official sale confirmation
- wording style: evergreen and broad

### Mid CTA

- location: inside current-campaign module
- role: strongest campaign-intent CTA
- wording style:
  - generic state: latest campaign confirmation
  - active state: current campaign confirmation

### End CTA

- location: final conversion block
- role: final official confirmation
- wording style: evergreen and broad

## CTA Measurement Parameters

Use the shared event model.

### Top CTA

- event name: `fanza_cta_click`
- `page_type`: `evergreen_sale_hub`
- `page_role`: `commercial_conversion_hub`
- `placement`: `top`
- `cta_id`: `evergreen_sale_hub__top__official_current_sale`
- `link_target`: `official_fanza`

### Mid CTA

- event name: `fanza_cta_click`
- `page_type`: `evergreen_sale_hub`
- `page_role`: `commercial_conversion_hub`
- `placement`: `mid`
- `cta_id`: `evergreen_sale_hub__mid__official_current_sale`
- `link_target`: `official_fanza`
- optional future field: `campaign_block_version`

### End CTA

- event name: `fanza_cta_click`
- `page_type`: `evergreen_sale_hub`
- `page_role`: `commercial_conversion_hub`
- `placement`: `end`
- `cta_id`: `evergreen_sale_hub__end__official_current_sale`
- `link_target`: `official_fanza`

## Screen-Level Safeguards Against Leaving Old Campaign Information

- keep all named campaign details inside one boxed module
- use one module heading that does not contain the campaign name
- separate the module with a clear border or background block
- avoid repeating campaign dates in hero, cards, or final CTA area
- when a campaign ends, the operator only edits the module, not the evergreen sections

## Switching Procedure For Operations

### Generic to active

1. confirm the active campaign on official FANZA
2. update only the current-campaign module fields
3. keep evergreen body unchanged
4. verify mid CTA wording and destination
5. verify no campaign details leaked into hero or end block

### Active to generic

1. remove the expired campaign name
2. remove the expired period
3. remove any campaign-specific discount reference
4. reset the module to generic latest-check wording
5. verify the page still reads correctly without named campaign content

## Next Handoff Notes

- if visual design starts, prepare two module variants only:
  - generic latest-check
  - active campaign
- do not create a third expired-campaign display state
- if campaign history is needed later, keep it outside the public evergreen page
