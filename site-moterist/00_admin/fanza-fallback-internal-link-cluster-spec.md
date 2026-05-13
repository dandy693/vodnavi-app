# FANZA Fallback Internal-Link Cluster Spec

## Scope

- Target pages:
  - `1095` `Beginner Guide`
  - `1106` `Registration / Benefits Guide`
  - `994` `Safety / Anxiety Resolution`
  - `954` `Evergreen Sale Hub`
- Phase: local design only
- This document defines internal-link clusters as support navigation, not primary conversion UI
- No production WordPress changes are allowed from this document

## 1. Purpose Of The Fallback Internal-Link Cluster

The fallback internal-link cluster exists to:

- help users who are not ready for the primary CTA
- provide one or two role-based next steps without overwhelming the page
- preserve funnel progression across the four priority pages
- support user recovery when the current page does not fully answer their intent

It does not exist to:

- compete with the official FANZA CTA
- become the main action area
- introduce unrelated lateral exploration

## 2. Target Pages

### 1095 Beginner Guide

- role: beginner entry
- fallback job: split users into benefits, safety, or sale follow-up

### 1106 Registration / Benefits Guide

- role: benefit and signup-value explanation
- fallback job: send uncertain users to reassurance or beginner context

### 994 Safety / Anxiety Resolution

- role: trust and hesitation resolution
- fallback job: send users to benefits or sale after concerns are reduced

### 954 Evergreen Sale Hub

- role: sale-intent conversion hub
- fallback job: send users to context pages only if they still need more confidence

## 3. Difference From The CTA Block

- CTA block:
  - main action
  - official confirmation focus
  - strongest visual emphasis
- fallback internal-link cluster:
  - support navigation only
  - internal next-step focus
  - lower visual priority than the CTA block

## 4. Placement Rules

### Top

- do not place the fallback internal-link cluster at the top by default
- if a top support link is needed, use a single text link only, not a cluster

### Mid

- use only as a support decision point after a core explanation block
- keep the cluster small
- recommended when the user may need a different intent path before the end

### End

- preferred placement
- use it as a next-step suggestion after the final official CTA
- keep it clearly secondary to the CTA block

## 5. Recommended Destinations By Page

### 1095

- primary fallback destinations:
  - `1106`
  - `994`
  - `954`

### 1106

- primary fallback destinations:
  - `994`
  - `1095`
  - `954`

### 994

- primary fallback destinations:
  - `1106`
  - `954`
  - `1095`

### 954

- primary fallback destinations:
  - `1106`
  - `994`
  - `1095`

## 6. Recommended Link Copy By Page

### 1095

- `登録メリットを確認する`
- `安全性や使い方を確認する`
- `現在のセール情報を確認する`

### 1106

- `安全性や使い方も確認しておく`
- `初心者向けガイドから確認する`
- `現在のセール状況を見る`

### 994

- `登録メリットを確認する`
- `現在のセール情報も確認する`
- `初心者向けガイドに戻る`

### 954

- `登録メリットを確認してから選ぶ`
- `安全性や使い方も確認しておく`
- `初心者向けガイドから整理する`

## 7. Desktop / Mobile Display Policy

### Desktop

- keep the cluster visually lighter than the main CTA block
- allow two or three compact options in one row only if spacing remains clear
- use supporting labels, not large button styling

### Mobile

- stack links vertically or in a compact two-line group
- avoid dense three-column link layouts
- place enough spacing between links to prevent accidental taps

## 8. UI Patterns

### Card cluster

- use when the page needs three clearly different next paths
- cards must remain smaller and less emphasized than the CTA block

### Compact text links

- use when only one or two fallback links are needed
- best for top or mid support placement

### Next-step box

- use at the end of the page
- include a short label such as `次に確認したいページ`
- include one-sentence context per link if needed

## 9. Rules To Prevent Role Blurring

### 1095

- keep the cluster framed as "where to go next"
- do not use benefit-heavy wording as the dominant message

### 1106

- keep benefit/value framing primary
- use safety and beginner links only as fallback

### 994

- keep reassurance framing primary
- do not let sale links dominate the cluster

### 954

- keep sale confirmation as the clear main route
- use internal links only for users who still need explanation

## 10. Rules To Avoid Interfering With The Main CTA

- never style internal-link clusters more strongly than the official CTA
- do not place the cluster above the primary CTA block
- do not use the same button treatment as the primary CTA
- limit the cluster to a small number of links
- keep copy shorter and less urgent than the primary CTA copy

## 11. Policy For Noindex Or Pending Pages

- do not send routine fallback traffic to pages under architecture uncertainty
- do not use noindex or pending pages as standard next-step links
- if a page later becomes noindex or pending, remove it from the fallback cluster

## 12. Treatment Of 1018 Pending Source Material

- `1018` is not included in normal fallback internal-link clusters
- keep it out of regular navigation until actress architecture is finalized
- only reconsider it after it becomes either:
  - a defined `Actress Support Page`
  - a defined `Actress Hub Source` destination with stable IA

## 13. Event Idea If Tracked

If tracked, keep it separate from the official CTA event purpose while staying in the same event family.

- event name: `fanza_cta_click`
- recommended properties:
  - `page_type`
  - `page_role`
  - `placement`
  - `cta_id`
  - `link_target`

Example fallback IDs:

- `beginner_guide__end__internal_benefits_next`
- `registration_benefits_guide__end__internal_safety_next`
- `safety_anxiety_resolution__end__internal_sale_next`
- `evergreen_sale_hub__end__internal_beginner_context`

## 14. Pre-Implementation Checklist

1. confirm the internal-link cluster is visually weaker than the main CTA
2. confirm it is not placed at the top as a cluster
3. confirm each page uses role-based destinations only
4. confirm `954` still treats current sale confirmation as the main route
5. confirm `994` does not over-promote sale links before reassurance is complete
6. confirm `1095` and `1106` do not blur into the same role
7. confirm `1018` is excluded from routine fallback navigation
8. confirm pending or noindex pages are not linked as standard next steps
9. confirm desktop and mobile layouts remain compact
10. confirm tracking IDs, if used, remain consistent with `fanza_cta_click`
