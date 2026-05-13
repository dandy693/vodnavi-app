# FANZA Priority Pages Approval Packet Composition

## 1. Purpose

This document defines the composition of the approval packet that must be prepared before any future WordPress reflection is requested for the four priority FANZA pages.

Its goals are:

- keep approval preparation page-scoped
- make required review artifacts explicit before any production request is raised
- ensure `GO / HOLD / NO-GO` decisions are evidence-based
- prevent role drift, stale campaign residue, and measurement drift

This is a local planning document only. It does not authorize production edits.

## 2. Approval Packet Definition

An approval packet is the minimum page-specific bundle of documents, confirmation items, and decision records required to request future production reflection for a single page.

One packet must correspond to one page only.

Do not combine multiple pages into a single packet.

## 3. Target Pages

- `1095` `Beginner Guide`
- `1106` `Registration / Benefits Guide`
- `994` `Safety / Anxiety Resolution`
- `954` `Evergreen Sale Hub`

## 4. Required Packet Components By Page

Every page packet must contain:

- page-level production approval request draft
- page-level approval log draft or prepared log block
- page-specific paste unit list
- page-specific QA checklist references
- page-specific `GO / HOLD / NO-GO` decision basis
- CTA confirmation items
- `fanza_cta_click` measurement confirmation items
- internal-link cluster confirmation items
- FAQ confirmation items if FAQ is present
- rollback readiness note

Additional `954` requirements:

- default `generic_latest_check_state` approval block
- `active_campaign_state` block only when official campaign confirmation exists
- stale campaign residue confirmation

## 5. Items Included In The Production Approval Request

Each page packet must include the following request-side items:

- `page_id`
- `page_type`
- `page_role`
- request scope
- intended paste units to apply
- paste units intentionally excluded
- requested execution order
- pre-reflection readiness checks
- post-reflection confirmation placeholders
- CTA confirmation block
- internal-link cluster confirmation block
- FAQ confirmation block when applicable
- `fanza_cta_click` confirmation block
- `1018` exclusion block
- stale campaign / copy safety block
- rollback preparation block

## 6. Items Recorded In The Approval Log

Each packet must define what will later be recorded in the approval log:

- page-level decision
- paste-unit-level decision where needed
- CTA-level decision where needed
- measurement confirmation result
- reviewer / approver / operator
- timestamps
- blocker or rework reason
- next action for `HOLD` or `NO-GO`

## 7. Paste Unit Confirmation Items

Each packet must confirm:

- which paste units belong to the page
- which paste units are in scope for the next reflection request
- role of each paste unit
- intended placement order
- whether the unit replaces or preserves an existing region
- whether the unit contains CTA, internal-link cluster, or FAQ content
- which units must not be applied yet

## 8. QA Checklist Confirmation Items

Each packet must reference the page-specific checks from the pre-publish QA checklist:

- page role remains intact
- CTA placement is correct
- internal-link cluster stays subordinate
- FAQ does not compete with the final CTA
- desktop display assumptions are satisfied
- mobile display assumptions are satisfied
- excluded routing is still excluded
- copy safety checks are complete

## 9. `GO / HOLD / NO-GO` Checklist Confirmation Items

Each packet must map to the following decision basis:

- shared `GO` conditions are met
- no shared `NO-GO` condition is triggered
- page-specific `GO` conditions are met
- page-specific `NO-GO` conditions are not triggered
- unresolved items are explicitly classified as `HOLD`

## 10. Connection To Review / Validation Order

Each packet must follow the existing review order:

- review page role first
- review paste unit sequence second
- review CTA structure third
- review internal-link cluster fourth
- review FAQ and support modules after CTA checks
- review measurement alignment after content structure is locked
- review desktop and mobile assumptions after content and CTA checks

For `954`:

- validate `generic_latest_check_state` first
- validate `active_campaign_state` only when official proof exists

## 11. Connection To WordPress Implementation Runbook

Each packet must be directly usable with the future runbook by including:

- page reflection order
- paste unit order
- allowed touch areas
- forbidden touch areas
- rollback source note
- stop conditions
- post-reflection validation checkpoints

## 12. CTA / `fanza_cta_click` Confirmation Items

Each packet must confirm:

- top, mid, and end CTA placement as applicable
- primary CTA copy matches page role
- secondary CTA does not overtake primary CTA
- official FANZA CTA remains visually and logically primary
- `event_name` uses `fanza_cta_click`
- `page_type` matches approved taxonomy
- `page_role` matches approved taxonomy
- `placement` matches actual location
- `cta_id` matches the approved CTA spec
- `link_target` is confirmed

If any required measurement field is unresolved, packet status cannot be `GO`.

## 13. Internal-Link Cluster Confirmation Items

Each packet must confirm:

- cluster is treated as a support path, not primary action
- cluster appears after or below the official CTA layer
- link targets match the page role
- cluster does not pull the page into another page role
- `1018` does not appear in normal routing

## 14. FAQ Confirmation Items

Each packet must confirm:

- FAQ questions match the page role
- FAQ does not reopen resolved objections unnecessarily
- FAQ does not bury or outrank the final CTA
- FAQ avoids unstable campaign-specific facts unless the module is explicitly state-bound

## 15. `954` `generic_latest_check_state` Packet Composition

This is the default `954` packet.

It must include:

- `954` production approval request block with default generic state
- `954` approval log block for `generic_latest_check_state`
- paste units for evergreen body structure
- current-campaign module in generic latest-check form
- CTA blocks with `current sale confirmation` as the primary action
- stale campaign residue check
- evergreen hero and end-of-page confirmation

Required packet rule:

- no named campaign, campaign date, or past discount statement may remain outside the current-campaign module

## 16. `954` `active_campaign_state` Packet Composition

This packet exists only when an officially confirmed active campaign is available.

It must include:

- separate request block from the generic packet
- official confirmation source
- active campaign module scope
- campaign name, period, and scope confirmation
- proof that campaign details remain inside the module boundary
- rollback-ready note to return to generic state after campaign end

Required packet rule:

- if official confirmation is absent, this packet must be `HOLD` or `NO-GO`

## 17. `1018` Pending Source Material Exclusion Confirmation

Every page packet must explicitly confirm:

- `1018` is not present in primary CTA paths
- `1018` is not present in fallback internal-link clusters
- `1018` is not present in FAQ-driven normal routing
- `1018` is not referenced as a standard next step

## 18. Stale Campaign / Exaggeration Check

Every page packet must include a copy-safety check for:

- stale campaign names
- stale campaign dates
- stale discount percentages
- exaggerated outcome claims
- certainty language implying guaranteed benefit or guaranteed safety
- unsupported earning or performance claims

Any such issue is packet `NO-GO` until corrected.

## 19. Rollback Readiness Confirmation

Every page packet must include:

- source draft reference
- pre-reflection backup reference
- paste unit order reference
- rollback owner
- rollback trigger conditions

For `954 active_campaign_state`, rollback readiness is mandatory before any approval can move to `GO`.

## 20. Minimum Conditions For Page-Level `GO`

### `1095`

- beginner-first role is clear
- anxiety reduction comes before stronger conversion push
- primary CTA leads to approved FANZA path
- `1106 / 994` remain support paths only

### `1106`

- benefits / registration value remains primary
- beginner onboarding tone from `1095` does not overtake the page
- CTA copy is benefits-led
- fallback links do not overpower registration intent

### `994`

- reassurance content is structurally primary
- main CTA appears immediately after anxiety resolution
- safety notes avoid overclaiming
- sale-oriented routing remains secondary

### `954`

- `generic_latest_check_state` is the default packet
- primary CTA is `current sale confirmation`
- evergreen body is not rewritten as a single-campaign article
- no stale campaign detail remains outside the module

## 21. `HOLD` Conditions For Incomplete Packets

Packet status should be `HOLD` when:

- official CTA target is not yet confirmed
- `fanza_cta_click` mapping is incomplete
- mobile or desktop confirmation is pending
- `954 active_campaign_state` is proposed but official campaign proof is pending
- page role alignment is likely correct but final evidence bundle is incomplete

## 22. `NO-GO` Conditions For Invalid Packets

Packet status must be `NO-GO` when:

- page role is mixed or overwritten by another page role
- `1018` appears in normal routing
- official CTA is not the primary action where required
- `fanza_cta_click` fields conflict with the approved measurement spec
- stale campaign information remains in evergreen body copy
- exaggerated or certainty-based claims remain in copy
- `954 active_campaign_state` is proposed without official confirmation

## 23. `operation-log.md` Recording Granularity

For each packet-design or packet-review step, `operation-log.md` should capture:

- date or work session context
- clean-tree or commit-check context at start
- files created or updated
- scope of packet work completed
- explicit note that production WordPress was not changed
- next recommended step

It should record work-session summaries, not the full packet decision history.

Detailed page-by-page decisions belong in the approval request and approval log artifacts.

## 24. Next Approval Request Filing Order

When actual approval requests are later raised, create them in this order:

1. `1095` `Beginner Guide`
2. `1106` `Registration / Benefits Guide`
3. `994` `Safety / Anxiety Resolution`
4. `954` `Evergreen Sale Hub` with `generic_latest_check_state`
5. `954` `active_campaign_state` only if official campaign confirmation exists at that time
