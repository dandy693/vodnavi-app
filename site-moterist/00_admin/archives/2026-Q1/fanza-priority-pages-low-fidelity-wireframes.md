# FANZA Priority Pages Low-Fidelity Wireframes

## Scope

- Target pages: `1095 / 1106 / 994 / 954`
- Phase: local design only
- This file is the integrated low-fidelity wireframe reference aligned to:
  - `fanza-page-level-ui-module-spec.md`
  - `fanza-end-of-page-composition-rules.md`
  - `fanza-common-cta-block-spec.md`
  - `fanza-fallback-internal-link-cluster-spec.md`
  - `fanza-954-current-campaign-module-spec.md`
  - `fanza-954-low-fidelity-wireframe.md`
  - `fanza-954-visual-priority-rules.md`
  - `fanza-cta-measurement-spec.md`
- No production WordPress changes are allowed from this document

## Shared Rules

1. FANZA official CTA stays visually above fallback internal links.
2. `1018` `Pending Source Material` is excluded from normal routing.
3. Top sections stay lower density than mid sections.
4. End sections return to low density and one clear official CTA repeat.
5. `954` uses `generic_latest_check_state` by default.

## 1095 Desktop Wireframe

```text
+----------------------------------------------------------------------------------+
| HERO                                                                             |
| Beginner-oriented headline                                                       |
| Short promise: what FANZA is and what the user can confirm here                  |
| [Top text-link CTA: official latest info]                                        |
+----------------------------------------------------------------------------------+
| INTRO SUMMARY                                                                    |
| Beginner-friendly summary that lowers friction                                   |
+----------------------------------------------------------------------------------+
| COMPARISON / SUPPORT BOX                                                         |
| - what to check first                                                            |
| - benefits / safety / sales as next paths                                        |
+----------------------------------------------------------------------------------+
| CAUTION / SAFETY NOTE                                                            |
| short note that details can change                                               |
+----------------------------------------------------------------------------------+
| MID PRIMARY CTA BLOCK                                                            |
| Heading + support text                                                           |
| [Primary CTA: FANZA公式で最新情報を確認する]                                      |
+----------------------------------------------------------------------------------+
| TEXT LINK CTA                                                                    |
| [安全性や使い方の不安を先に確認する]                                             |
+----------------------------------------------------------------------------------+
| FALLBACK INTERNAL-LINK CLUSTER                                                   |
| [登録メリットを確認する] [安全性や使い方を確認する] [現在のセール情報を確認する] |
+----------------------------------------------------------------------------------+
| END-OF-PAGE COMPOSITION                                                          |
| caution note                                                                     |
| [Final primary CTA]                                                              |
| [Secondary CTA: 登録メリットを先に確認する]                                      |
| compact fallback cluster                                                         |
+----------------------------------------------------------------------------------+
```

## 1095 Mobile Wireframe

```text
+--------------------------------------+
| HERO                                 |
| beginner headline                    |
| short promise                        |
| [top text-link CTA]                  |
+--------------------------------------+
| INTRO SUMMARY                        |
+--------------------------------------+
| SUPPORT BOX                          |
+--------------------------------------+
| CAUTION NOTE                         |
+--------------------------------------+
| MID PRIMARY CTA BLOCK                |
| [Primary CTA]                        |
+--------------------------------------+
| TEXT LINK CTA                        |
+--------------------------------------+
| FALLBACK CLUSTER                     |
| [1106]                               |
| [994]                                |
| [954]                                |
+--------------------------------------+
| END-OF-PAGE COMPOSITION              |
| caution                              |
| [Final primary CTA]                  |
| [Secondary CTA]                      |
| compact fallback links               |
+--------------------------------------+
```

## 1106 Desktop Wireframe

```text
+----------------------------------------------------------------------------------+
| HERO                                                                             |
| Benefits-focused headline                                                        |
| Short promise about registration value and what can be confirmed                 |
| [Top primary CTA: official registration-benefit confirmation]                    |
+----------------------------------------------------------------------------------+
| INTRO SUMMARY                                                                    |
+----------------------------------------------------------------------------------+
| COMPARISON / SUPPORT BOX                                                         |
| benefit points / what to compare / why users consider FANZA                      |
+----------------------------------------------------------------------------------+
| MID PRIMARY CTA BLOCK                                                            |
| [Primary CTA: FANZA公式で登録前の案内を確認する]                                  |
+----------------------------------------------------------------------------------+
| CAUTION / SAFETY NOTE                                                            |
+----------------------------------------------------------------------------------+
| SECONDARY CTA BLOCK                                                              |
| [安全性や使い方も確認しておく]                                                   |
+----------------------------------------------------------------------------------+
| FALLBACK INTERNAL-LINK CLUSTER                                                   |
| [994] [1095] [954]                                                               |
+----------------------------------------------------------------------------------+
| END-OF-PAGE COMPOSITION                                                          |
| caution note                                                                     |
| [Final primary CTA]                                                              |
| [Secondary CTA]                                                                  |
| compact fallback cluster                                                         |
+----------------------------------------------------------------------------------+
```

## 1106 Mobile Wireframe

```text
+--------------------------------------+
| HERO                                 |
| benefits headline                    |
| short promise                        |
| [top primary CTA]                    |
+--------------------------------------+
| INTRO SUMMARY                        |
+--------------------------------------+
| SUPPORT BOX                          |
+--------------------------------------+
| MID PRIMARY CTA BLOCK                |
| [Primary CTA]                        |
+--------------------------------------+
| CAUTION NOTE                         |
+--------------------------------------+
| SECONDARY CTA BLOCK                  |
+--------------------------------------+
| FALLBACK CLUSTER                     |
| [994]                                |
| [1095]                               |
| [954]                                |
+--------------------------------------+
| END-OF-PAGE COMPOSITION              |
| caution                              |
| [Final primary CTA]                  |
| [Secondary CTA]                      |
| compact fallback links               |
+--------------------------------------+
```

## 994 Desktop Wireframe

```text
+----------------------------------------------------------------------------------+
| HERO                                                                             |
| Safety / reassurance headline                                                    |
| Short promise around privacy, safety, and pre-use confirmation                   |
| [Top text-link CTA: official pre-use guidance]                                   |
+----------------------------------------------------------------------------------+
| INTRO SUMMARY                                                                    |
+----------------------------------------------------------------------------------+
| FAQ / REASSURANCE BLOCK                                                          |
| common anxieties and concise answers                                             |
+----------------------------------------------------------------------------------+
| MID PRIMARY CTA BLOCK                                                            |
| placed immediately after reassurance                                             |
| [Primary CTA: FANZA公式で利用前の案内を確認する]                                  |
+----------------------------------------------------------------------------------+
| CAUTION / SAFETY NOTE                                                            |
+----------------------------------------------------------------------------------+
| SECONDARY CTA BLOCK                                                              |
| [開催中のセール情報も確認する]                                                   |
+----------------------------------------------------------------------------------+
| FALLBACK INTERNAL-LINK CLUSTER                                                   |
| [1106] [954] [1095]                                                              |
+----------------------------------------------------------------------------------+
| END-OF-PAGE COMPOSITION                                                          |
| [Final primary CTA]                                                              |
| caution note                                                                     |
| [Secondary CTA]                                                                  |
| compact fallback cluster                                                         |
+----------------------------------------------------------------------------------+
```

## 994 Mobile Wireframe

```text
+--------------------------------------+
| HERO                                 |
| safety headline                      |
| short promise                        |
| [top text-link CTA]                  |
+--------------------------------------+
| INTRO SUMMARY                        |
+--------------------------------------+
| FAQ / REASSURANCE BLOCK              |
+--------------------------------------+
| MID PRIMARY CTA BLOCK                |
| [Primary CTA]                        |
+--------------------------------------+
| CAUTION NOTE                         |
+--------------------------------------+
| SECONDARY CTA BLOCK                  |
+--------------------------------------+
| FALLBACK CLUSTER                     |
| [1106]                               |
| [954]                                |
| [1095]                               |
+--------------------------------------+
| END-OF-PAGE COMPOSITION              |
| [Final primary CTA]                  |
| caution                              |
| [Secondary CTA]                      |
| compact fallback links               |
+--------------------------------------+
```

## 954 Desktop Wireframe

```text
+----------------------------------------------------------------------------------+
| HERO                                                                             |
| Evergreen sale-hub headline                                                      |
| Evergreen promise about confirming current FANZA offers                          |
| [Top primary CTA: FANZA公式で現在のセール情報を確認する]                          |
+----------------------------------------------------------------------------------+
| INTRO SUMMARY                                                                    |
+----------------------------------------------------------------------------------+
| COMPARISON / SUPPORT BOX                                                         |
| how to compare current offers and what can change                                |
+----------------------------------------------------------------------------------+
| CURRENT-CAMPAIGN MODULE                                                          |
| state badge / module heading / status summary                                    |
| campaign fields live here only                                                   |
| [Mid primary CTA: official current-sale confirmation]                            |
+----------------------------------------------------------------------------------+
| CAUTION / SAFETY NOTE                                                            |
+----------------------------------------------------------------------------------+
| FALLBACK INTERNAL-LINK CLUSTER                                                   |
| [1106] [994] [1095]                                                              |
+----------------------------------------------------------------------------------+
| END-OF-PAGE COMPOSITION                                                          |
| generic or active caution note                                                   |
| [Final primary CTA: official current-sale confirmation]                          |
| compact fallback cluster                                                         |
+----------------------------------------------------------------------------------+
```

## 954 Mobile Wireframe

```text
+--------------------------------------+
| HERO                                 |
| sale-hub headline                    |
| evergreen promise                    |
| [top primary CTA]                    |
+--------------------------------------+
| INTRO SUMMARY                        |
+--------------------------------------+
| SUPPORT BOX                          |
+--------------------------------------+
| CURRENT-CAMPAIGN MODULE              |
| state badge                          |
| status summary                       |
| campaign fields                      |
| [Mid primary CTA]                    |
+--------------------------------------+
| CAUTION NOTE                         |
+--------------------------------------+
| FALLBACK CLUSTER                     |
| [1106]                               |
| [994]                                |
| [1095]                               |
+--------------------------------------+
| END-OF-PAGE COMPOSITION              |
| caution                              |
| [Final primary CTA]                  |
| compact fallback links               |
+--------------------------------------+
```

## 954 Generic Latest-Check State

- default state
- no named campaign claim
- no discount rate
- no period outside the module
- mid current-campaign module uses:
  - neutral badge
  - generic "check latest" framing
  - official latest campaign confirmation CTA
- end-of-page composition stays evergreen:
  - generic caution note
  - final official sale CTA
  - compact fallback cluster

## 954 Active Campaign State

- use only when active campaign is officially confirmed
- current-campaign module can show:
  - named campaign
  - active period
  - eligible scope
  - stronger module emphasis
- page still remains an evergreen sale hub:
  - hero stays evergreen
  - campaign details stay inside the module
  - end CTA repeats sale confirmation without becoming a second campaign block

## Top / Mid / End Composition By Page

### 1095

- top:
  - hero
  - intro summary
- mid:
  - support box
  - caution note
  - primary CTA
  - text link CTA
- end:
  - final primary CTA
  - secondary CTA
  - fallback cluster

### 1106

- top:
  - hero
  - intro summary
- mid:
  - support box
  - primary CTA
  - caution note
  - secondary CTA
- end:
  - final primary CTA
  - secondary CTA
  - fallback cluster

### 994

- top:
  - hero
  - intro summary
- mid:
  - FAQ / reassurance
  - primary CTA immediately after reassurance
  - caution note
  - secondary CTA
- end:
  - final primary CTA
  - caution note
  - fallback cluster

### 954

- top:
  - hero
  - intro summary
  - top primary CTA
- mid:
  - support box
  - current-campaign module
  - caution note
- end:
  - final primary CTA
  - fallback cluster

## CTA Placement Summary

- `1095`
  - primary CTA: mid and end
  - secondary CTA: end
  - text link CTA: top or mid support
- `1106`
  - primary CTA: top, mid, end
  - secondary CTA: mid or end
  - text link CTA: small beginner-context support only
- `994`
  - primary CTA: mid immediately after reassurance, plus end repeat
  - secondary CTA: mid or end sale-support branch
  - text link CTA: top low-pressure official guidance
- `954`
  - primary CTA: top, module mid, end
  - secondary CTA: no strong secondary button by default
  - text link CTA: optional support only

## Fallback Internal-Link Cluster Placement

- never above the main CTA layer
- usually after the mid CTA block or in the end composition
- on `954`, always visually subordinate to sale confirmation CTAs
- `1018` is excluded from all clusters

## End-Of-Page Composition Reflection

- `1095`
  - caution note -> final primary CTA -> secondary CTA -> fallback cluster
- `1106`
  - caution note -> final primary CTA -> secondary CTA -> fallback cluster
- `994`
  - final primary CTA -> caution note -> secondary CTA -> fallback cluster
- `954`
  - caution note -> final primary CTA -> fallback cluster

## Tracked CTA List

- `1095`
  - `beginner_guide__top__official_latest_info`
  - `beginner_guide__mid__official_latest_info`
  - `beginner_guide__end__internal_benefits_next`
  - `beginner_guide__end__internal_safety_next`
  - `beginner_guide__inline__internal_sale_next`
- `1106`
  - `registration_benefits_guide__top__official_registration_benefits`
  - `registration_benefits_guide__mid__official_registration_benefits`
  - `registration_benefits_guide__end__official_registration_benefits`
  - `registration_benefits_guide__end__internal_safety_next`
  - `registration_benefits_guide__inline__internal_beginner_context`
- `994`
  - `safety_anxiety_resolution__top__official_pre_use_guidance`
  - `safety_anxiety_resolution__mid__official_pre_use_guidance`
  - `safety_anxiety_resolution__end__official_pre_use_guidance`
  - `safety_anxiety_resolution__end__internal_sale_next`
  - `safety_anxiety_resolution__inline__internal_reassurance_context`
- `954`
  - `evergreen_sale_hub__top__official_current_sale`
  - `evergreen_sale_hub__mid__official_current_sale`
  - `evergreen_sale_hub__end__official_current_sale`
  - `evergreen_sale_hub__end__internal_benefits_next`
  - `evergreen_sale_hub__end__internal_safety_next`
  - `evergreen_sale_hub__inline__internal_beginner_context`

## Difference From `fanza-954-low-fidelity-wireframe.md`

The integrated version takes priority.

Main differences:

- `954` is now aligned explicitly to `page-level-ui-module-spec` ordering
- `954` end section is aligned explicitly to `end-of-page-composition-rules`
- fallback cluster is treated more strictly as subordinate support
- the integrated file also standardizes `1095 / 1106 / 994` in the same framework

## Pre-Implementation Checklist

1. confirm each page keeps a distinct funnel role
2. confirm `1095` lowers friction before stronger conversion routing
3. confirm `1106` remains benefit-led
4. confirm `994` places the CTA immediately after reassurance
5. confirm `954` keeps current sale confirmation as the main route
6. confirm `954` defaults to `generic_latest_check_state`
7. confirm fallback clusters remain visually weaker than official CTAs
8. confirm `1018` is excluded from normal routing
9. confirm desktop and mobile compositions align to the same module order
10. confirm `954` campaign details stay inside the current-campaign module only
