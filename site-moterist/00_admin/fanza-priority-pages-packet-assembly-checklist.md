# FANZA Priority Pages Packet Assembly Checklist

## 1. Purpose

This checklist defines the assembly procedure for page-by-page approval packets before any future production approval request is filed.

Its goals are:

- make packet preparation sequential and page-scoped
- ensure no page is filed without its required evidence bundle
- keep `954` defaulted to `generic_latest_check_state`
- block routing drift, stale campaign residue, and measurement mismatch before filing

This is a local preparation checklist only. It does not authorize production edits.

## 2. Filing Order

Assemble packets in this order:

1. `1095`
2. `1106`
3. `994`
4. `954`

Rule:

- do not start the next page packet until the current page packet is complete and its decision basis is ready

## 3. Page-Specific Materials To Gather

For each page, gather:

- page-specific production approval request draft
- page-specific approval log draft block
- page-specific paste unit list
- page-specific section rewrite draft reference
- page-specific QA checklist reference
- page-specific `GO / HOLD / NO-GO` decision reference
- page-specific CTA mapping reference
- page-specific internal-link cluster reference
- page-specific FAQ reference if used
- rollback readiness note

For `954`, also gather:

- `generic_latest_check_state` block
- `active_campaign_state` block only when official campaign confirmation exists
- stale campaign residue check reference

## 4. Items To Transfer Into The Production Approval Request

Before filing, confirm the following fields are ready to copy into the request:

- `page_id`
- `page_type`
- `page_role`
- request scope
- intended paste units to apply
- paste units not to apply
- execution order
- pre-reflection check fields
- post-reflection placeholder fields
- CTA confirmation block
- internal-link cluster confirmation block
- FAQ block if applicable
- `fanza_cta_click` confirmation block
- `1018` exclusion block
- stale campaign / copy safety block
- rollback preparation block

## 5. Items To Prepare For The Approval Log

Before filing, prepare:

- page-level decision shell
- paste-unit-level review entries where needed
- CTA-level entries where needed
- reviewer, approver, operator fields
- timestamp placeholders
- next action field for potential `HOLD`
- rejection reason field for potential `NO-GO`

## 6. Paste Unit Verification Procedure

For each page packet:

1. list all paste units assigned to the page
2. mark which units are in scope for the next filing
3. mark which units are intentionally excluded
4. confirm unit order matches the implementation runbook
5. confirm each unit's role matches the page role
6. confirm replacement vs preserved regions
7. confirm no out-of-scope unit is silently included

Stop and mark `HOLD` if unit order or replacement scope is unclear.

## 7. CTA Verification Procedure

For each page packet:

1. identify top, mid, and end CTA units
2. confirm primary CTA matches page role
3. confirm secondary CTA stays subordinate
4. confirm official FANZA CTA remains primary
5. confirm CTA labels match the approved CTA block spec
6. confirm CTA link targets are known

Page-specific focus:

- `1095`: beginner-first CTA path
- `1106`: registration-benefits-first CTA path
- `994`: reassurance-first then CTA
- `954`: current sale confirmation first

## 8. Internal-Link Cluster Verification Procedure

For each page packet:

1. confirm cluster exists only as support routing
2. confirm cluster appears after or below the CTA layer
3. confirm linked destinations match the page role
4. confirm cluster does not replace the main CTA action
5. confirm `1018` is excluded from normal routing

## 9. FAQ Verification Procedure

For each page packet with FAQ:

1. confirm FAQ is role-relevant
2. confirm questions do not reopen resolved objections unnecessarily
3. confirm FAQ does not outrank the final CTA
4. confirm FAQ does not introduce unstable campaign-specific claims

## 10. `fanza_cta_click` Verification Procedure

For each packeted CTA:

1. confirm `event_name = fanza_cta_click`
2. confirm `page_type`
3. confirm `page_role`
4. confirm `placement`
5. confirm `cta_id`
6. confirm `link_target`

If any field is unresolved, packet cannot move to `GO`.

## 11. Checks Before `GO / HOLD / NO-GO`

Before page-level filing status is assigned:

1. page role alignment must be reviewed
2. paste unit scope and order must be frozen
3. CTA checks must be complete
4. internal-link cluster checks must be complete
5. FAQ checks must be complete when applicable
6. measurement checks must be complete
7. stale campaign / copy safety checks must be complete
8. rollback readiness must be documented

## 12. Connection To The Pre-Publish QA Checklist

Each packet must map back to the pre-publish QA checklist for:

- shared page checks
- page-specific checks
- CTA checks
- cluster checks
- FAQ checks
- measurement checks
- mobile checks
- desktop checks
- `954` state checks

## 13. Connection To The WordPress Implementation Runbook

Each packet must align with the runbook for:

- page reflection order
- page-specific paste unit order
- allowed touch areas
- forbidden touch areas
- stop conditions
- rollback readiness
- post-reflection review points

## 14. `954` `generic_latest_check_state` Pre-Filing Checks

This is the default `954` filing path.

Confirm:

1. request assumes `generic_latest_check_state`
2. primary CTA is current sale confirmation
3. no campaign name remains outside the module
4. no campaign date remains outside the module
5. no discount figure remains outside the module
6. evergreen hero remains evergreen
7. end-of-page remains evergreen

## 15. `954` `active_campaign_state` Filing Conditions

This is not a default packet.

It can be assembled only if:

1. official campaign confirmation exists
2. campaign name is confirmed
3. campaign period is confirmed
4. campaign scope is confirmed
5. swap area remains module-bounded
6. rollback to generic state is ready

If any one of these is missing, use `HOLD` or fall back to `generic_latest_check_state`.

## 16. `1018` Pending Source Material Exclusion Check

Before a packet is marked ready:

1. confirm `1018` is absent from CTA paths
2. confirm `1018` is absent from fallback internal-link clusters
3. confirm `1018` is absent from FAQ-driven routing
4. confirm `1018` is absent from end-of-page next-step suggestions

If `1018` appears in routine routing, packet is `NO-GO`.

## 17. Stale Campaign / Exaggeration Check

Before a packet is marked ready:

1. check for old campaign names
2. check for old campaign dates
3. check for old discount statements
4. check for exaggerated claims
5. check for certainty-based safety language
6. check for unsupported performance or earnings language

Disposition:

- clear evidence of invalid copy: `NO-GO`
- unresolved suspicion pending confirmation: `HOLD`

## 18. Rollback Readiness Check

For each page packet, confirm:

1. draft source reference is recorded
2. backup plan reference is recorded
3. paste unit order reference is recorded
4. rollback owner is known
5. rollback trigger condition is documented

For `954 active_campaign_state`, rollback readiness is mandatory before filing.

## 19. Packet Completion Conditions

A page packet is complete only when:

- all required materials are gathered
- request fields are ready to transfer
- approval log shell is ready
- paste unit order is confirmed
- CTA and measurement checks are complete
- cluster and FAQ checks are complete
- page-specific risks are reviewed
- rollback readiness is documented

## 20. `HOLD` Conditions For Incomplete Packets

Mark the packet `HOLD` when:

- evidence bundle is incomplete
- CTA destination is not confirmed
- `fanza_cta_click` mapping is incomplete
- mobile or desktop confirmation inputs are still pending
- `954 active_campaign_state` is proposed without official confirmation evidence
- stale campaign risk is suspected but not yet resolved

## 21. Conditions To Move To The Next Filing

Move to the next page packet only when the current packet has:

- complete assembly
- page-level decision basis prepared
- no unresolved structural blocker
- no `NO-GO` condition active
- explicit readiness to file the production approval request

Recommended sequence:

1. complete `1095`
2. complete `1106`
3. complete `994`
4. complete `954 generic_latest_check_state`
5. complete `954 active_campaign_state` only if conditions exist

## 22. `operation-log.md` Recording Granularity

Record in `operation-log.md`:

- whether the worktree was clean at start
- whether the requested commit already existed
- which checklist file was created or updated
- what packet assembly scope was defined
- that production WordPress remained untouched
- what the next recommended planning step is

Do not use `operation-log.md` as the actual approval packet or approval decision record.
