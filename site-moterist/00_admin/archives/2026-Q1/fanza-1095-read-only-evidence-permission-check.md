# FANZA 1095 Read-Only Evidence Permission Check

## 1. Purpose

This document defines the allowed and prohibited scope for read-only evidence collection preparation for page `1095`.

Its goals are:

- clarify what may be inspected without changing production
- prevent accidental transition from review work into production edits
- preserve the `HOLD` state until evidence is properly collected and reviewed
- keep the role of `1095` separate from `1106`, `994`, and `954`

This file does not authorize production edits, WordPress reflection, or final approval.

## 2. Target Page Information

- `page_id`: `1095`
- `page_type`: `Beginner Guide`
- `page_role`: `初心者導入・不安低減・登録導線`

Role boundary reminder:

- beginner-first orientation remains dominant
- anxiety reduction precedes stronger conversion guidance
- official FANZA route remains primary
- `1106` benefit framing must not take over
- `994` reassurance framing must not replace beginner onboarding
- `954` sale-check framing must not become the page's main route

## 3. Current Decision

- current status: `HOLD`

## 4. Read-Only Checks That Are Allowed

Allowed read-only scope:

- review local design documents and planning artifacts
- inspect published page behavior only through read-only viewing
- compare visible route hierarchy against the approved planning docs
- record evidence references and review notes in local files
- review CTA mapping assumptions against the measurement specification
- review intended mobile / desktop hierarchy without saving any production changes
- record rollback references and responsible owner fields in local planning documents

## 5. Operations That Remain Prohibited

The following remain prohibited:

- WordPress production content edits
- WordPress admin save actions
- draft or publish actions in the admin UI
- SSH access for production modification
- DB operations
- taxonomy changes
- slug changes
- redirect changes
- noindex changes
- article body edits on production
- plugin or theme changes
- `.env` access intended to expose or store secrets
- any action that changes public output

## 6. Public Page Viewing Permission

Public page viewing is allowed if it remains read-only.

Permitted scope:

- open published public pages
- inspect visible copy
- inspect visible CTA order
- inspect visible internal-link cluster order
- inspect visible FAQ presence
- inspect mobile / desktop rendering from a viewer perspective

Not permitted under this allowance:

- editing through front-end admin affordances
- actions that mutate caches, settings, or content

## 7. WordPress Admin Login Permission

Admin login is not automatically approved by this document.

Current rule:

- admin login may only be treated as a possible read-only review channel if it can be done without any save action
- if admin access is not required, prefer public-page read-only review
- any action that could cross into content mutation remains out of scope

Operational stance:

- keep this stage biased toward public read-only verification unless an explicitly non-mutating admin check becomes necessary later

## 8. Rule Against Saving In Admin

If admin access ever becomes part of a later read-only evidence step, the following remains mandatory:

- do not save
- do not update
- do not publish
- do not quick-edit
- do not change status
- do not alter fields that can auto-save to production

At the current stage, this is a boundary rule only, not a request to log in.

## 9. CTA Link Check Permission

CTA link confirmation is allowed only as read-only review.

Allowed scope:

- verify intended destination class
- verify destination type matches planning docs
- verify route hierarchy matches the page role

Not allowed:

- altering link destinations
- altering CTA copy in production
- altering CTA tracking implementation in production

## 10. `fanza_cta_click` Confirmation Preconditions

`fanza_cta_click` may only be reviewed under these read-only assumptions:

- compare intended mapping against local measurement spec
- record planned verification notes locally
- do not alter measurement code or production settings
- do not assume `GO` from planning alignment alone

This stage allows planning-side confirmation only, not production instrumentation edits.

## 11. Mobile / Desktop Display Check Permission

Mobile and desktop display checks are allowed as read-only visual review.

Allowed scope:

- inspect ordering
- inspect prominence of CTA versus cluster
- inspect FAQ placement
- inspect visible copy for stale or exaggerated wording

Not allowed:

- editing responsive settings
- changing blocks, widgets, CSS, or templates

## 12. Rollback Backup Reference Check Permission

Rollback reference planning is allowed in local documentation.

Allowed scope:

- record what source reference should be used for rollback
- record responsible owner
- record source note

Not allowed:

- execute rollback
- rewrite production content to test rollback behavior

## 13. Evidence That May Be Collected

Permitted evidence categories:

- local review notes
- local evidence index files
- references to visible public-page observations
- local screenshots or non-secret visual captures, if later collected within policy
- local records of CTA route expectations
- local records of cluster / FAQ hierarchy observations
- local records of stale-campaign / exaggeration checks
- local rollback planning notes

## 14. Evidence That Must Not Be Collected

Do not collect or store:

- passwords
- login tokens
- session cookies
- API keys
- database credentials
- private admin secrets
- hidden production-only data not needed for read-only review
- any evidence generated through prohibited save or edit actions

## 15. Rule Against Recording Personal Or Login Information

Do not record:

- usernames tied to personal accounts unless already required in a non-sensitive role label
- passwords
- secret tokens
- email addresses used as credentials
- session values
- any private identifier unnecessary for the review record

Use role labels instead where possible:

- `reviewer`
- `approver`
- `operator`
- `rollback_owner`

## 16. Evidence File / Record Naming Rule

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

## 17. Conditions That Keep `HOLD`

Keep `HOLD` when:

- permission scope is unclear
- evidence method is not yet explicitly safe and read-only
- `fanza_cta_click` alignment is not yet verified
- internal-link cluster hierarchy is not yet verified
- FAQ necessity is not yet verified
- `1018` exclusion is not yet verified
- stale campaign visible-copy absence is not yet verified
- exaggeration / certainty absence is not yet verified
- mobile / desktop checks are not yet verified
- rollback reference fields are still empty

## 18. Conditions That Switch To `NO-GO`

Switch to `NO-GO` if any of the following is found:

- any proposed evidence step requires saving or mutating production
- `fanza_cta_click` mapping is inconsistent with the approved spec
- `1018` appears in normal routing
- stale campaign names, dates, or discount figures appear in visible copy
- exaggerated claims or deterministic earnings-style claims appear
- over-certain safety wording appears
- page role drifts away from beginner onboarding into `1106 / 994 / 954` behavior

## 19. Conditions To Proceed To Actual Evidence Collection

Actual evidence collection may be considered only if:

- the scope remains read-only
- prohibited actions are explicitly avoided
- evidence targets are limited to the approved checklist
- no production mutation is required
- the `HOLD` state is preserved until evidence is actually reviewed

This is not authorization to start WordPress reflection.

## 20. Suggested `operation-log.md` Entry

Suggested summary:

- created `00_admin/fanza-1095-read-only-evidence-permission-check.md`
- documented what is allowed and prohibited for read-only evidence collection preparation on `1095`
- kept admin save actions, DB work, SSH work, taxonomy changes, and production edits out of scope
- preserved `HOLD` and did not move to actual evidence collection or WordPress reflection
- made no WordPress, SSH, DB, article, taxonomy, redirect, slug, noindex, theme, plugin, media, or `.env` changes
