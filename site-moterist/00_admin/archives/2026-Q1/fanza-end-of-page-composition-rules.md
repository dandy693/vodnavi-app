# FANZA End-Of-Page Composition Rules

## 1. Purpose

These rules define how the final section of each priority page should be composed.

The goals are:

- keep the official FANZA CTA as the last and strongest decision point
- prevent page endings from becoming crowded
- preserve each page's funnel role at the final step
- keep support navigation available without weakening the main conversion route

## 2. Target Pages

- `1095` `Beginner Guide`
- `1106` `Registration / Benefits Guide`
- `994` `Safety / Anxiety Resolution`
- `954` `Evergreen Sale Hub`

## 3. End-Of-Page Modules

### `final_primary_cta`

- final official confirmation CTA
- highest-priority element in the end section

### `secondary_cta`

- optional supporting CTA
- used only when one additional guided route is strategically useful

### `fallback_internal_link_cluster`

- small support navigation group
- must remain visually weaker than the official CTA

### `faq_block`

- used only if final objections remain unresolved
- should not overtake the final CTA zone

### `safety_caution_note`

- short note that reminds users to confirm details officially

### `official_confirmation_link`

- text-level confirmation path
- used as a lightweight alternative where needed

## 4. Recommended End Structure By Page

### 1095 Beginner Guide

Recommended end order:

1. `safety_caution_note`
2. `final_primary_cta`
3. `secondary_cta`
4. `fallback_internal_link_cluster`

End intent:

- guide the beginner toward the next safe action
- keep the route from beginner understanding to registration/support clear

### 1106 Registration / Benefits Guide

Recommended end order:

1. `safety_caution_note`
2. `final_primary_cta`
3. `secondary_cta`
4. `fallback_internal_link_cluster`

End intent:

- finish with official registration-benefit confirmation
- keep reassurance as the fallback, not the main action

### 994 Safety / Anxiety Resolution

Recommended end order:

1. `final_primary_cta`
2. `safety_caution_note`
3. `secondary_cta`
4. `fallback_internal_link_cluster`

End intent:

- preserve the reassurance-to-action flow
- do not bury the post-reassurance CTA under extra support content

### 954 Evergreen Sale Hub

Recommended end order:

1. `safety_caution_note`
2. `final_primary_cta`
3. `fallback_internal_link_cluster`

End intent:

- end with current sale confirmation as the last action
- keep internal links supportive only

## 5. Order Of CTA And Internal-Link Cluster

- official CTA comes first
- secondary CTA comes second if used
- fallback internal-link cluster comes after the CTA layer
- do not place the fallback cluster above the final primary CTA

## 6. Rules To Keep The FANZA Official CTA First

- the final official CTA must be the visually strongest element at page end
- no internal link may use equal or stronger button treatment
- the official CTA should have the clearest heading and shortest action path
- any caution note must support the CTA, not distract from it

## 7. FAQ Before CTA Or CTA Before FAQ

### Put FAQ before CTA when

- the page still carries unresolved objection-handling work
- the CTA would feel premature without one last answer block

### Put CTA before FAQ when

- the page has already resolved the main objection
- the user is likely ready to act at the end

Recommended application:

- `1095`: FAQ is usually not needed in the final section
- `1106`: FAQ should stay earlier unless a specific final objection remains
- `994`: CTA should come immediately after reassurance, not after a late FAQ
- `954`: FAQ should stay outside the end CTA zone unless it directly supports sale confirmation

## 8. Desktop / Mobile Display Policy

### Desktop

- allow a clear vertical stack:
  - caution note
  - official CTA
  - optional secondary CTA
  - fallback links
- keep spacing generous between CTA and fallback links

### Mobile

- stack all end modules vertically
- keep the final primary CTA fully visible without a dense preamble
- keep fallback links compact and clearly subordinate

## 9. `954` Generic Latest-Check State End Structure

Recommended order:

1. generic caution note
2. final official sale-confirmation CTA
3. compact fallback internal-link cluster

Rules:

- use evergreen wording
- no named campaign reference
- no outdated discount or period reference

## 10. `954` Active Campaign State End Structure

Recommended order:

1. short caution note
2. final official current-sale CTA
3. compact fallback internal-link cluster

Rules:

- the end CTA may feel stronger than in generic state
- still keep the page ending evergreen enough that it does not become a second campaign block
- do not repeat detailed campaign facts here if they already live in the current-campaign module

## 11. End Rules To Prevent Role Blurring

### 1095

- keep the final secondary route focused on the user's next learning step
- do not end like a benefits-heavy sales page

### 1106

- keep the final action anchored in benefit confirmation and registration value
- do not end like a beginner intro page

### 994

- keep reassurance-to-action intact
- do not allow sale framing to overtake the safety role

## 12. Rule For Excluding `1018`

- `1018` `Pending Source Material` must not appear in standard end-of-page routing
- do not include it in final fallback clusters until actress architecture is finalized

## 13. End CTAs To Measure

- final official CTA on all four pages
- secondary CTA where it acts as a true alternative route
- `954` final official sale CTA in both generic and active states

## 14. Support Links Not To Measure By Default

- low-priority helper text links
- non-critical fallback links
- passive official confirmation text references that are not the main CTA

## 15. Pre-Implementation Checklist

1. confirm the final official CTA is the strongest end element
2. confirm fallback internal-link cluster appears after the CTA layer
3. confirm `954` ends with current sale confirmation as the last action
4. confirm `1095` keeps beginner-next-step logic at page end
5. confirm `1106` keeps registration-benefit logic at page end
6. confirm `994` keeps post-reassurance CTA priority intact
7. confirm no end section routes to `1018`
8. confirm desktop and mobile endings stay compact
9. confirm FAQ is not inserted after the CTA unless clearly justified
10. confirm no stale campaign details appear in `954` end sections
