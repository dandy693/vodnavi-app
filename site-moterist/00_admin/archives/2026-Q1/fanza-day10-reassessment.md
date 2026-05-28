# FANZA Day 10 Reassessment

## Purpose

This file re-evaluates Day 10 candidate issues from a FANZA monetization-first perspective.
The short-term benchmark is not general cleanup. It is making later FANZA click generation safer and more measurable.

## Classification Buckets

- `Now`: needed before the next current-state audit starts
- `Before Monetization`: needed before production-side FANZA conversion work
- `Later`: useful, but not a prerequisite for current rebuild design
- `Unnecessary`: not worth active work in the rebuild path
- `Need Confirmation`: evidence conflict or insufficient proof

## Reassessment Result

### 1. Existing browser old Service Worker / Cache Storage residue

- Classification: `Before Monetization`
- Why:
  - It can distort visible page state and QA outcomes
  - It can create false positives or false negatives during CTA validation
  - It matters once production-side conversion checks begin
- Why not `Now`:
  - This phase is local planning only
  - No production-side validation is being executed in this turn
- Required action before production monetization work:
  - define browser verification protocol
  - define cache-related escalation notes
  - define evidence capture standard

### 2. WP-CLI output contamination by Ahrefs script

- Classification: `Later`
- Why:
  - It is mostly an operations readability problem
  - It does not directly block the FANZA rebuild architecture
  - It should be investigated before heavy CLI automation, not before audit template creation
- Trigger to promote priority:
  - if CLI-based audit tooling becomes a core workflow
  - if contamination affects structured exports or parsing

### 3. Day 8-9 document inconsistency about Service Worker reflection timing

- Classification: `Now`
- Why:
  - Several logs reviewed in this phase do not read as a single clean narrative
  - Agent teams need a stable shared understanding of what is confirmed, what was observed at one point in time, and what remains uncertain
  - This is a documentation integrity issue, not a production issue
- Required action now:
  - treat Day 9 Service Worker state as "historically improved, but fresh audit evidence required before reuse"
  - do not assume current production state from old summaries alone

### 4. Existing core-article CTA structure validity under the new rebuild

- Classification: `Now`
- Why:
  - Day 8 CTA cleanup was optimized for the previous repair phase
  - The rebuild aims for zero-based revenue-path design
  - Current CTA structure should be treated as a reference pattern only
- Required action now:
  - keep the UX lesson
  - do not lock future content architecture to the current three-page structure

### 5. Legacy category / tag / slug / noindex assumptions

- Classification: `Need Confirmation`
- Why:
  - Previous docs often state that certain fields were not changed, but the rebuild phase still needs a fresh baseline
  - These attributes strongly affect SEO and content disposition decisions
- Required action:
  - include them in the current-state audit template

### 6. Legacy thin-post consolidation priority

- Classification: `Before Monetization`
- Why:
  - Thin posts can dilute crawl quality and muddle user journeys
  - But consolidation execution should come after the rebuild information architecture is decided
- Required action before monetization execution:
  - decide destination page types
  - decide keep / rebuild / merge / retire policy
  - decide link and redirect strategy

### 7. Existing three core posts as permanent pillars

- Classification: `Need Confirmation`
- Why:
  - They are strong candidates, but the rebuild may introduce new pillar pages or a different hub-spoke arrangement
- Required action:
  - re-score them during the audit on intent coverage, conversion proximity, freshness burden, and compliance safety

## Priority Order For The Rebuild Phase

1. Normalize shared understanding of Day 8-9 technical history
2. Freeze a verification protocol that accounts for Service Worker and cache effects
3. Re-audit current information architecture and legacy content inventory
4. Re-score existing pillar candidates against FANZA monetization goals
5. Postpone WP-CLI Ahrefs-noise investigation unless it blocks audit automation

## Decision Summary

### Now

- documentation inconsistency around Day 9 confirmation status
- validity of prior CTA assumptions under the new rebuild

### Before Monetization

- Service Worker / Cache Storage verification protocol
- legacy thin-post consolidation execution decisions

### Later

- WP-CLI Ahrefs contamination investigation

### Unnecessary

- none at this stage

### Need Confirmation

- current taxonomy / noindex / slug baseline
- permanence of existing core article set
