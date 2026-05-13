# FANZA 1095 Read-Only Evidence Collection Procedure

## 1. Purpose

This document defines the read-only procedure for collecting planned evidence for page `1095` without making any production changes.

Its goals are:

- turn the permission boundary and evidence plan into a practical step order
- keep evidence collection read-only
- preserve the role of `1095` as beginner onboarding, anxiety reduction, and registration guidance
- prepare later transfer into the sign-off draft

This file does not authorize WordPress edits, production reflection, or final approval.

## 2. Target Page Information

- `page_id`: `1095`
- `page_type`: `Beginner Guide`
- `page_role`: `初心者導入・不安低減・登録導線`

Role boundary reminder:

- beginner-first orientation remains dominant
- anxiety reduction should come before stronger conversion pressure
- official FANZA guidance should remain primary
- `1106 / 994 / 954` role framing must not overtake this page

## 3. Current Decision

- current status: `HOLD`

## 4. Pre-Work Check

Before any evidence work begins, confirm:

- the task remains read-only
- no production save action is planned
- no SSH / DB / taxonomy / redirect / slug / noindex action is planned
- no article body editing is planned
- the review target is only `1095`
- the objective is evidence collection, not `GO` approval

## 5. Allowed Read-Only Checks

Allowed checks:

- open published public page output
- inspect visible CTA order
- inspect visible internal-link cluster order
- inspect visible FAQ presence and scope
- inspect mobile / desktop rendering
- compare observed routes with planning docs
- write local review notes and evidence references
- record rollback reference fields in local docs

## 6. Prohibited Operations

Remain prohibited:

- WordPress production edits
- any admin save / update / publish action
- SSH actions
- DB actions
- taxonomy edits
- redirect / slug / noindex edits
- plugin or theme edits
- article body edits on production
- secret or credential exposure

## 7. Evidence Collection Order

Recommended order:

1. confirm pre-work read-only boundary
2. confirm public page target and page role reference
3. inspect public page visible structure
4. inspect desktop rendering
5. inspect mobile rendering
6. inspect CTA visibility and route hierarchy
7. inspect `fanza_cta_click` mapping against local spec
8. inspect internal-link cluster live hierarchy
9. inspect FAQ necessity / redundancy
10. inspect `1018` exclusion from routine routing
11. inspect stale campaign absence
12. inspect exaggeration / over-certainty absence
13. record rollback backup reference / owner / source note
14. transfer summary results into the sign-off draft

## 8. Public Page Display Check Procedure

Procedure:

1. open the public page in read-only mode
2. confirm that the viewed page corresponds to `1095`
3. confirm that no edit or save path is being used
4. review visible module order from top to bottom
5. note whether the beginner-first orientation is preserved

Record:

- page viewed
- date and time
- observer
- high-level route structure note

## 9. Desktop Display Check Procedure

Procedure:

1. view the page in desktop layout
2. confirm main CTA visual priority
3. confirm support links are secondary
4. confirm FAQ does not visually overtake the page purpose
5. confirm end-of-page composition remains readable

Record:

- desktop observation note
- any hierarchy concern
- whether additional human check is needed

## 10. Mobile Display Check Procedure

Procedure:

1. view the page in mobile layout
2. confirm reading order remains beginner-first
3. confirm CTA is visible before support links dominate
4. confirm FAQ remains assistive
5. confirm spacing and module order remain understandable

Record:

- mobile observation note
- any buried CTA concern
- any role-mixing concern

## 11. CTA Display Check Procedure

Procedure:

1. identify top, mid, end, and inline CTA positions
2. confirm the official CTA remains primary
3. confirm support routes do not overtake the official CTA
4. confirm CTA copy intent matches beginner onboarding

Record:

- CTA position note
- CTA priority note
- route hierarchy note

## 12. `fanza_cta_click` Check Procedure

Procedure:

1. compare observed CTA set against the local measurement spec
2. confirm `event_name = fanza_cta_click`
3. confirm `page_type = beginner_guide`
4. confirm `page_role = entry`
5. confirm each planned `cta_id` and intended `link_target`

Expected CTA IDs:

- `beginner_guide__top__official_latest_info`
- `beginner_guide__mid__official_latest_info`
- `beginner_guide__end__internal_benefits_next`
- `beginner_guide__end__internal_safety_next`
- `beginner_guide__inline__internal_sale_next`

Record:

- mapping confirmation note
- unresolved mapping note
- reason for continued `HOLD` if proof remains incomplete

## 13. Internal-Link Cluster Live Hierarchy Check Procedure

Procedure:

1. identify internal-link cluster placement
2. compare cluster prominence to the main official CTA
3. confirm cluster remains support-only
4. confirm cluster does not redefine the page into `1106 / 994 / 954`

Record:

- cluster visibility note
- CTA-subordination note
- role-boundary note

## 14. FAQ Live Necessity / Redundancy Check Procedure

Procedure:

1. identify the FAQ block
2. confirm the FAQ addresses beginner hesitation
3. confirm the FAQ is not duplicating the body without added support value
4. confirm the FAQ is not creating a competing route

Record:

- FAQ usefulness note
- FAQ redundancy note
- FAQ role-boundary note

## 15. `1018` Exclusion Check Procedure

Procedure:

1. inspect CTA routes
2. inspect internal-link cluster routes
3. inspect FAQ routes
4. inspect end-of-page routes
5. confirm `1018` does not appear in routine routing

Record:

- exclusion confirmation note
- suspected route contamination note

## 16. Stale Campaign Absence Check Procedure

Procedure:

1. review visible copy for campaign names
2. review visible copy for ended dates
3. review visible copy for outdated discount figures
4. review visible copy for seasonal urgency residue
5. confirm no `954`-style campaign-state language leaks into `1095`

Record:

- stale-campaign absence note
- residue suspicion note

## 17. No Exaggeration / No Over-Certainty Check Procedure

Procedure:

1. review visible copy for exaggerated outcomes
2. review visible copy for deterministic earnings-style language
3. review visible copy for guaranteed safety wording
4. review visible copy for unsupported certainty framing

Record:

- expression restraint note
- possible `NO-GO` language note

## 18. Rollback Backup Reference / Owner / Source Note Recording Procedure

Procedure:

1. record a traceable rollback backup reference
2. record the responsible rollback owner
3. record the rollback source note explaining the safe restore point

Record fields:

```text
rollback_backup_reference:
rollback_owner:
rollback_source_note:
```

## 19. Evidence File / Record Naming Rule

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

## 20. Transfer Procedure To Sign-Off Draft

After evidence is later collected:

1. summarize each evidence result
2. update the `1095` sign-off draft evidence reference fields
3. update each result block
4. keep status at `HOLD` if any required evidence remains unresolved
5. only escalate beyond `HOLD` after full human review and evidence completion

## 21. Conditions That Keep `HOLD`

Keep `HOLD` when:

- any evidence category remains unreviewed
- read-only safety is unclear
- `fanza_cta_click` mapping remains unresolved
- cluster hierarchy remains unresolved
- FAQ necessity / redundancy remains unresolved
- `1018` exclusion remains unresolved
- stale campaign absence remains unresolved
- expression restraint remains unresolved
- mobile / desktop checks remain unresolved
- rollback reference fields remain incomplete

## 22. Conditions That Switch To `NO-GO`

Switch to `NO-GO` if:

- any step would require production mutation
- `fanza_cta_click` is inconsistent with the approved spec
- `1018` appears in normal routing
- stale campaign names, dates, or discount figures are found
- exaggerated claims are found
- deterministic earnings-style claims are found
- guaranteed safety wording is found
- the page role drifts away from beginner onboarding

## 23. Next Stage After Evidence Collection

After evidence collection is completed, the next stage is:

- update the sign-off draft with evidence summaries
- conduct the next human review decision pass
- only then consider whether the page may move toward the WordPress pre-reflection check

This procedure does not authorize immediate reflection.

## 24. Suggested `operation-log.md` Entry

Suggested summary:

- created `00_admin/fanza-1095-read-only-evidence-collection-procedure.md`
- documented the read-only step sequence for future `1095` evidence collection
- kept production mutation, admin save actions, SSH, DB, taxonomy work, and article edits out of scope
- kept `1095` in `HOLD`
- made no WordPress, SSH, DB, article, taxonomy, redirect, slug, noindex, theme, plugin, media, or `.env` changes
