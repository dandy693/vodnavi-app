# FANZA Common CTA Block Spec

## Scope

- Target pages:
  - `1095` `Beginner Guide`
  - `1106` `Registration / Benefits Guide`
  - `994` `Safety / Anxiety Resolution`
  - `954` `Evergreen Sale Hub`
- Phase: local design only
- This document defines a shared CTA block system with page-specific wording rules
- No production WordPress changes are allowed from this document

## 1. Purpose Of The Common CTA Block

The common CTA block exists to:

- give the site one reusable CTA structure across the four priority pages
- keep the visual system consistent while preserving page-role differences
- separate official confirmation CTAs from support and internal progression CTAs
- reduce CTA clutter at page endings
- keep measurement naming stable across pages

## 2. Target Pages

### 1095 Beginner Guide

- role: beginner introduction
- CTA goal: move from curiosity to first confirmation or next-step learning

### 1106 Registration / Benefits Guide

- role: benefit and signup-value explanation
- CTA goal: confirm benefits and move high-intent users toward official action

### 994 Safety / Anxiety Resolution

- role: hesitation removal and trust-building
- CTA goal: present a CTA immediately after anxiety resolution

### 954 Evergreen Sale Hub

- role: commercial sale-intent hub
- CTA goal: confirm current sales on FANZA official, not registration first

## 3. CTA Types

### Primary CTA

- strongest visual emphasis
- one main action per block
- usually points to official FANZA confirmation

### Secondary CTA

- lower emphasis than primary
- used for the main fallback route
- usually points to one internal next-step page

### Text Link CTA

- low-pressure inline or small-note CTA
- used when a full button would be too aggressive

### Comparison / Support CTA

- used to move users into a contextual support page
- examples:
  - beginner context
  - safety support
  - benefit comparison

## 4. Recommended CTA Copy By Page

### 1095

- primary CTA:
  - `FANZA公式で最新情報を確認する`
- secondary CTA:
  - `登録メリットを先に確認する`
- text link CTA:
  - `安全性や使い方の不安を先に確認する`
- support CTA:
  - `開催中のセール情報を確認したい方はこちら`

### 1106

- primary CTA:
  - `FANZA公式で登録前の案内を確認する`
- secondary CTA:
  - `安全性や使い方も確認しておく`
- text link CTA:
  - `まず初心者向けガイドから確認する`
- support CTA:
  - `現在のセールや特典状況も確認する`

### 994

- primary CTA:
  - `FANZA公式で利用前の案内を確認する`
- secondary CTA:
  - `開催中のセール情報も確認する`
- text link CTA:
  - `登録メリットを先に見直す`
- support CTA:
  - `初心者向けガイドに戻って整理する`

### 954

- primary CTA:
  - `FANZA公式で現在のセール情報を確認する`
- secondary CTA:
  - `登録メリットを確認してから選ぶ`
- text link CTA:
  - `安全性や使い方も確認しておく`
- support CTA:
  - `初心者向けガイドから確認し直す`

## 5. Placement Rules

### Top

- use only when user intent may already be actionable
- keep wording broad and evergreen
- recommended on:
  - `1095`
  - `1106`
  - `954`
- for `994`, use a low-pressure text-link style instead of a heavy button

### Mid

- this is the main conversion point for all four pages
- place it immediately after the page's main explanatory or reassurance section
- for `994`, place it right after the anxiety-resolution block
- for `954`, place it inside the current-campaign module

### End

- repeat one official CTA
- include only a limited fallback path
- do not stack many parallel options

## 6. Desktop / Mobile Display Policy

### Desktop

- allow a clear hierarchy between primary and secondary CTA
- primary CTA may sit above secondary and support links
- supporting note and official-confirmation note may sit below the button

### Mobile

- stack all CTA elements vertically
- primary CTA first
- supporting note second
- secondary CTA after a short spacing break
- avoid multi-column CTA layouts

## 7. Elements Included In The CTA Block

Required shared elements:

- heading
- support text
- button label
- short caution note
- official confirmation guidance

### Heading

- short and intent-specific
- must reflect page role

### Support text

- one to two short lines
- explains why the user should click now

### Button label

- direct action phrasing
- should match page intent, not generic copy

### Caution note

- reminds users that details can change
- especially important on `1106`, `994`, and `954`

### Official confirmation guidance

- must be present whenever the main CTA points to FANZA official
- should be brief and factual

## 8. CTA Measurement Parameters

Use the existing shared event model.

- `event_name`: `fanza_cta_click`
- `page_type`:
  - `beginner_guide`
  - `registration_benefits_guide`
  - `safety_anxiety_resolution`
  - `evergreen_sale_hub`
- `page_role`:
  - `entry`
  - `consideration`
  - `objection_handling`
  - `commercial_conversion_hub`
- `placement`:
  - `top`
  - `mid`
  - `end`
  - `inline`
- `cta_id`:
  - stable by page and purpose
- `link_target`:
  - `official_fanza`
  - internal page target IDs

Example primary CTA IDs:

- `beginner_guide__mid__official_latest_info`
- `registration_benefits_guide__mid__official_registration_benefits`
- `safety_anxiety_resolution__mid__official_pre_use_guidance`
- `evergreen_sale_hub__mid__official_current_sale`

## 9. NG Expressions

- claims of guaranteed benefit
- claims of guaranteed safety
- claims of guaranteed current sale status without confirmation
- vague button text like `詳しくはこちら` as the primary CTA
- identical CTA copy reused across pages without role adjustment
- aggressive urgency language that is not supported by official confirmation

## 10. Rules To Prevent Page Roles From Blurring Together

### 1095

- keep the CTA framing at beginner-entry level
- do not turn it into a benefits page

### 1106

- focus on merits, value, and pre-registration comparison
- do not re-explain the whole beginner overview

### 994

- keep the CTA immediately after reassurance
- do not let the page feel like a sale page first

### 954

- keep the primary CTA sale-oriented
- do not make registration the main outcome

## 11. Future A/B Test Opportunities

- primary button label variants while keeping `cta_id` stable
- heading tone variants
- support text length variants
- top CTA shown versus hidden on `1095` and `1106`
- `994` reassurance note length before the mid CTA
- `954` generic-state CTA copy versus active-campaign CTA copy

## 12. Pre-Implementation Checklist

1. confirm each page has one dominant CTA purpose
2. confirm the CTA wording reflects the page role
3. confirm top, mid, and end placements are not overused
4. confirm official-confirmation note is present where needed
5. confirm `954` uses sale confirmation as the primary CTA
6. confirm `994` shows the main CTA immediately after anxiety resolution
7. confirm `1095` and `1106` wording does not overlap too heavily
8. confirm `cta_id` values align with `fanza_cta_click` naming
9. confirm fallback links are limited and role-based
10. confirm desktop and mobile stacking rules are preserved
