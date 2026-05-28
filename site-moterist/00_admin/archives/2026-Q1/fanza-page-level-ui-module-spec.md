# FANZA Page-Level UI Module Spec

## 1. Purpose

This specification defines the page-level UI module composition for the four priority FANZA pages.

Its goals are:

- keep page structure consistent where consistency helps
- preserve distinct roles for `1095 / 1106 / 994 / 954`
- control CTA density and internal-link density
- make desktop and mobile composition predictable before visual design or implementation
- keep `954` sale-oriented without turning the full page into a campaign article

## 2. Target Pages

- `1095` `Beginner Guide`
- `1106` `Registration / Benefits Guide`
- `994` `Safety / Anxiety Resolution`
- `954` `Evergreen Sale Hub`

## 3. Common UI Module List

### `hero`

- top-of-page framing block
- includes the page promise and highest-level intent cue

### `intro_summary`

- short explanation of what the page helps the user do
- lowers friction before deeper content

### `primary_cta_block`

- highest-priority action block
- usually points to official FANZA confirmation

### `secondary_cta_block`

- smaller supporting CTA
- used when one fallback action is strategically useful

### `text_link_cta`

- low-pressure CTA
- used for lightweight support or early reassurance

### `fallback_internal_link_cluster`

- support navigation
- never treated as the page’s main action

### `comparison_support_box`

- short box used to compare options, decision criteria, or next-step paths

### `caution_safety_note`

- note that reminds users to confirm changing details officially

### `current_campaign_module`

- only for `954`
- the only time-sensitive campaign block

### `faq_block`

- used where the page must answer likely objections or questions

### `end_of_page_cta_composition`

- final CTA area
- combines official CTA repeat plus limited fallback links

## 4. Recommended Module Order By Page

### 1095 Beginner Guide

Recommended order:

1. `hero`
2. `intro_summary`
3. `comparison_support_box`
4. `caution_safety_note`
5. `primary_cta_block`
6. `text_link_cta`
7. `fallback_internal_link_cluster`
8. `end_of_page_cta_composition`

Direction:

- reduce beginner anxiety first
- then move users toward registration-benefit or official confirmation paths

### 1106 Registration / Benefits Guide

Recommended order:

1. `hero`
2. `intro_summary`
3. `comparison_support_box`
4. `primary_cta_block`
5. `caution_safety_note`
6. `secondary_cta_block`
7. `fallback_internal_link_cluster`
8. `end_of_page_cta_composition`

Direction:

- make benefit understanding the core experience
- keep safety and beginner context as support only

### 994 Safety / Anxiety Resolution

Recommended order:

1. `hero`
2. `intro_summary`
3. `faq_block`
4. `primary_cta_block`
5. `caution_safety_note`
6. `secondary_cta_block`
7. `fallback_internal_link_cluster`
8. `end_of_page_cta_composition`

Direction:

- place the main CTA immediately after the anxiety-resolution block
- do not delay the reassurance-to-action handoff

### 954 Evergreen Sale Hub

Recommended order:

1. `hero`
2. `intro_summary`
3. `primary_cta_block`
4. `comparison_support_box`
5. `current_campaign_module`
6. `caution_safety_note`
7. `fallback_internal_link_cluster`
8. `end_of_page_cta_composition`

Direction:

- keep current sale confirmation as the main route
- keep `current_campaign_module` in `generic_latest_check_state` by default

## 5. Desktop Display Policy

- keep modules visually separated by clear spacing and hierarchy
- allow two-column or multi-card layout only in support modules, not in core CTA hierarchy
- keep the primary CTA block visibly stronger than secondary CTA and fallback links
- allow `954` current-campaign module to become a strong mid-page block, but not a page takeover

## 6. Mobile Display Policy

- stack modules vertically in the same semantic order as desktop
- reduce side-by-side density
- keep the first primary CTA reachable without excessive scroll depth
- keep `994` reassurance and CTA close together
- keep `954` current-campaign module compact enough that the CTA remains visible within the module flow

## 7. Coexistence Rules For CTA Block And Internal-Link Cluster

- CTA block is always the primary action layer
- fallback internal-link cluster is always the support layer
- do not place the cluster above the main CTA block
- do not style the cluster with the same button weight as the CTA block
- at page end, show the CTA first and the cluster second

## 8. Placement Rules To Prevent Role Blurring

### 1095

- avoid leading with benefits-heavy persuasion
- use beginner-orientation modules before stronger conversion modules

### 1106

- keep benefit/value explanation ahead of reassurance or beginner backfill
- do not let the page feel like a duplicate of `1095`

### 994

- keep FAQ or reassurance modules before the main CTA
- do not let sale or signup modules overtake the trust role

### 954

- keep sale confirmation first
- do not allow support links to become the visual headline

## 9. `954`-Only Current-Campaign Module Placement Rules

- `current_campaign_module` appears only on `954`
- place it after evergreen orientation and comparison content
- default state is `generic_latest_check_state`
- active state is used only when an active campaign is officially confirmed
- never move campaign-specific details into `hero`, `intro_summary`, or `end_of_page_cta_composition`

## 10. Information Density Rules For Top / Mid / End

### Top

- low to moderate density
- communicate page promise and first action clearly
- avoid crowding hero with multiple support links

### Mid

- highest useful information density
- hold the main explanatory block and the main CTA handoff
- on `954`, the campaign module belongs here

### End

- low density again
- one official CTA repeat
- limited fallback internal-link cluster
- no new major content themes

## 11. Modules To Measure

- `primary_cta_block`
- `secondary_cta_block`
- `text_link_cta` when it acts as a meaningful branch
- `fallback_internal_link_cluster` if tracked as internal progression
- `current_campaign_module` CTA on `954`
- `end_of_page_cta_composition` official CTA

## 12. Modules Not To Measure

- `hero` display itself
- static `intro_summary`
- passive `caution_safety_note`
- non-interactive `comparison_support_box`
- FAQ open state unless explicitly needed later

## 13. Pre-Implementation Checklist

1. confirm each page has a clearly different primary role
2. confirm `1095` lowers anxiety before stronger conversion routing
3. confirm `1106` stays focused on benefits and signup value
4. confirm `994` places the main CTA immediately after reassurance
5. confirm `954` uses current sale confirmation as the main route
6. confirm `954` uses `generic_latest_check_state` as the default module state
7. confirm fallback internal-link clusters remain visually secondary
8. confirm `1018` is excluded from normal page-level routing
9. confirm desktop and mobile module order stay logically aligned
10. confirm no campaign-specific remnants can leak from `current_campaign_module` into evergreen modules
