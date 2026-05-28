# FANZA 1095 Execution-Stage Evidence Collection Plan

## 1. Purpose

This document defines the evidence collection plan for page `1095` before any move beyond the current `HOLD`.

Its goals are:

- specify what evidence must be collected and in what order
- separate evidence planning from evidence execution
- preserve the role of `1095` as a beginner-first page
- prepare clean transfer into the sign-off draft after evidence exists
- prevent premature interpretation of planning completeness as approval readiness

This file does not authorize WordPress edits, production reflection, or final approval.

## 2. Target Page Information

- `page_id`: `1095`
- `page_type`: `Beginner Guide`
- `page_role`: `初心者導入・不安低減・登録導線`

Role boundary reminder:

- beginner onboarding remains the dominant framing
- anxiety reduction comes before stronger conversion prompts
- official FANZA route remains primary
- `1106` benefit framing must not overtake the page
- `994` reassurance framing must not replace beginner onboarding
- `954` sale-check framing must not become the main route

## 3. Current Decision

- current status: `HOLD`

## 4. Evidence Scope To Collect

Collect evidence for the following only:

- `fanza_cta_click` mapping
- internal-link cluster live hierarchy
- FAQ live necessity / redundancy
- `1018` Pending Source Material exclusion from normal routing
- stale campaign absence in visible copy
- exaggeration / over-certainty absence in visible copy
- mobile rendering
- desktop rendering
- rollback backup reference
- rollback owner
- rollback source note

## 5. Evidence Collection Order

Recommended sequence:

1. confirm page-scope identifiers and destination mapping references
2. capture `fanza_cta_click` evidence plan output
3. capture CTA-vs-cluster visual hierarchy evidence plan output
4. capture FAQ necessity / redundancy review notes
5. capture `1018` route exclusion evidence
6. capture stale campaign visible-copy review evidence
7. capture exaggeration / over-certainty visible-copy review evidence
8. capture mobile display evidence
9. capture desktop display evidence
10. record rollback backup reference
11. record rollback owner
12. record rollback source note
13. transfer summarized outcomes into the sign-off draft

## 6. How To Confirm `fanza_cta_click`

Planned confirmation method:

- compare expected event structure against the `1095` CTA set in the measurement spec
- verify that each relevant CTA is mapped to the intended placement
- verify that each `cta_id` matches the page role and module location
- verify that each `link_target` matches the approved route intention

Items to check:

- `event_name = fanza_cta_click`
- `page_type = beginner_guide`
- `page_role = entry`
- placements:
  - `top`
  - `mid`
  - `end`
  - `inline`
- expected CTA IDs:
  - `beginner_guide__top__official_latest_info`
  - `beginner_guide__mid__official_latest_info`
  - `beginner_guide__end__internal_benefits_next`
  - `beginner_guide__end__internal_safety_next`
  - `beginner_guide__inline__internal_sale_next`

## 7. How To Confirm Internal-Link Cluster Live Hierarchy

Planned confirmation method:

- review intended placement against CTA priority rules
- verify that internal-link cluster remains support-only
- verify that the cluster does not overtake the official CTA in emphasis
- verify that cluster destinations do not redefine the page role

Items to check:

- official CTA remains dominant
- support cluster remains lower priority
- cluster does not turn the page into a `1106 / 994 / 954` route
- end-of-page order remains CTA first, support links later

## 8. How To Confirm FAQ Live Necessity / Redundancy

Planned confirmation method:

- compare FAQ intent with the beginner hesitation it is supposed to resolve
- verify that the FAQ is not restating the body without added value
- verify that the FAQ does not create a competing conversion path

Items to check:

- FAQ remains beginner-oriented
- FAQ answers first-step hesitation
- FAQ adds support value beyond repeated body copy
- FAQ does not introduce unsupported or stale statements

## 9. How To Confirm `1018` Exclusion From Normal Routing

Planned confirmation method:

- review intended CTA routes
- review internal-link cluster destinations
- review FAQ routes
- review end-of-page support routes

Items to check:

- `1018` absent from CTA routes
- `1018` absent from cluster routes
- `1018` absent from FAQ routes
- `1018` absent from end-of-page support routes

## 10. How To Confirm No Stale Campaign Info In Visible Copy

Planned confirmation method:

- review planned visible copy areas against stale campaign exclusion rules
- verify absence of ended campaign names, dates, discount figures, and seasonal urgency residue

Items to check:

- no ended campaign names
- no ended campaign dates
- no outdated discount figures
- no seasonal urgency phrasing that distorts `1095`
- no `954`-style sale-state leakage into the page role

## 11. How To Confirm No Exaggeration / No Over-Certainty In Visible Copy

Planned confirmation method:

- review all intended visible copy blocks for claims that overstate outcomes, safety, savings, or certainty
- apply the stricter reading standard when wording could be interpreted as guaranteed

Items to check:

- no exaggerated outcome language
- no deterministic earnings-style language
- no guaranteed safety wording
- no benefit overstatement beyond supportable framing

## 12. How To Confirm Mobile Display

Planned confirmation method:

- review module order in the intended mobile reading path
- verify CTA visibility and hierarchy
- verify that FAQ and support links do not bury the primary route

Items to check:

- top CTA remains visible
- reading order remains beginner-first
- internal-link cluster stays secondary
- FAQ remains assistive, not dominant
- spacing remains understandable

## 13. How To Confirm Desktop Display

Planned confirmation method:

- review module balance in the intended desktop layout
- verify that CTA remains visually primary over support elements
- verify end-of-page composition clarity

Items to check:

- primary CTA remains visually dominant
- cluster remains subordinate
- module balance preserves beginner orientation
- end-of-page CTA composition remains clear

## 14. How To Record Rollback Backup Reference

Planned recording method:

- record one traceable backup source reference for `1095`
- use a single stable identifier that can be copied into sign-off

Field to record:

```text
rollback_backup_reference:
```

## 15. How To Record Rollback Owner

Planned recording method:

- record the responsible owner or role for rollback execution

Field to record:

```text
rollback_owner:
```

## 16. How To Record Rollback Source Note

Planned recording method:

- state what safe source state rollback returns to
- state why that source is acceptable

Field to record:

```text
rollback_source_note:
```

## 17. Recommended Naming Rule For Evidence Files Or Record Names

Recommended pattern:

- `fanza-1095-evidence-<topic>-yyyymmdd.md`
- `fanza-1095-evidence-<topic>-note-yyyymmdd.md`
- `fanza-1095-evidence-<topic>-capture-yyyymmdd.ext`

Recommended topic tokens:

- `measurement`
- `cluster-hierarchy`
- `faq-necessity`
- `exclude-1018`
- `no-stale-campaign`
- `no-exaggeration`
- `mobile`
- `desktop`
- `rollback`

## 18. Items To Transfer Into Sign-Off Draft

Transfer the following into [fanza-1095-human-review-signoff-draft.md](/C:/Users/Tachi/projects/moterist-ai-affiliate/00_admin/fanza-1095-human-review-signoff-draft.md):

- evidence references
- evidence note references
- measurement result summary
- internal-link cluster result summary
- FAQ result summary
- `1018` exclusion result summary
- stale campaign visible-copy result summary
- expression result summary
- mobile result summary
- desktop result summary
- rollback backup reference
- rollback owner
- rollback source note
- updated `GO / HOLD / NO-GO` rationale

## 19. HOLD Continuation Conditions If Evidence Is Missing

Continue `HOLD` if any of the following remains unresolved:

- no measurement proof
- no cluster hierarchy proof
- no FAQ necessity / redundancy proof
- no `1018` exclusion proof
- no stale campaign visible-copy proof
- no expression restraint proof
- no mobile proof
- no desktop proof
- no rollback reference, owner, or source note

## 20. Conditions That Switch To NO-GO

Switch to `NO-GO` if any of the following is found during evidence collection:

- `fanza_cta_click` mapping mismatch
- `1018` appears in a normal route
- visible copy contains stale campaign names, dates, or discount figures
- exaggerated claims are present
- deterministic earnings-style claims are present
- over-certain safety wording is present
- cluster hierarchy overtakes the official CTA
- page role shifts away from beginner onboarding

## 21. Condition To Move To WordPress Pre-Reflection Check

The page may move to the WordPress pre-reflection check stage only if:

- the full evidence set has been collected
- no `NO-GO` condition has been triggered
- `HOLD` blockers have been reduced to zero or explicitly resolved
- the sign-off draft has been updated with the evidence summary
- the page still preserves the role of beginner onboarding, anxiety reduction, and registration guidance

Even then, this plan does not authorize immediate production reflection.

## 22. Suggested `operation-log.md` Entry

Suggested summary:

- created `00_admin/fanza-1095-execution-stage-evidence-collection-plan.md`
- defined the evidence collection sequence for `1095` without performing live evidence capture
- documented confirmation methods for measurement, hierarchy, FAQ, `1018` exclusion, stale campaign absence, expression restraint, mobile / desktop checks, and rollback recording
- kept `1095` in `HOLD`
- made no WordPress, SSH, DB, article, taxonomy, redirect, slug, noindex, theme, plugin, media, or `.env` changes
