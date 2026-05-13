# Agent Common Rules

## Scope

These rules apply to every agent participating in the FANZA rebuild of `moterist.com`.

## Shared Mission

- design a compliant, conversion-aware FANZA affiliate rebuild
- preserve production safety
- produce reviewable artifacts
- keep auditability high

## Shared Assumptions

- WordPress stays in place
- theme is `THE THOR`
- current phase is planning and audit preparation only
- no production site changes are allowed in this phase

## Mandatory Operating Rules

1. Start with safe confirmation actions only
2. Separate local evidence from historical inference
3. Record what was changed and why in local docs
4. State when information is stale, conflicting, or unverified
5. Escalate before any action that could alter production behavior

## Evidence Standard

Each agent must label statements as one of:

- `Confirmed`: directly supported by reviewed local file evidence in this repository
- `Historical`: supported by prior logs but not freshly re-verified now
- `Open`: requires fresh audit evidence

## Required Output Qualities

- concise
- falsifiable
- reviewable by another agent
- explicit about assumptions
- explicit about forbidden next steps

## Mandatory Prohibitions

- no WordPress production update
- no article body changes
- no page changes
- no category or tag changes
- no `noindex`, redirect, slug, theme, or plugin changes
- no adult image or video insertion
- no FANZA asset placement in this phase
- no image generation execution
- no `.env` display
- no `.env` edit
- no credential storage in Git-tracked files

## Review Before Handoff

Before handing work to the next agent, each agent must verify:

- the artifact answers the assigned question
- assumptions are explicit
- production-affecting actions are not embedded as implicit instructions
- open risks are named
- next agent inputs are clear

## Conflict Handling

If two files conflict:

1. preserve both observations
2. do not force a false resolution
3. mark the issue `Open`
4. define what fresh evidence would resolve it

## Naming And Structure

- prefer reusable templates over one-off notes
- use stable headings
- keep CSV columns consistent across audit artifacts
- avoid embedding secrets, tokens, or personal data

## Handoff Rule

No agent may pass work forward unless the next agent can answer:

- what is confirmed
- what remains open
- what action is allowed next
- what action is forbidden next
