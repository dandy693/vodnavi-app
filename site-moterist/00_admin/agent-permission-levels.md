# Agent Permission Levels

## Purpose

This file defines what each agent may and may not do during the FANZA rebuild program.

## Levels

### Level 0: Read-Only Planning

Allowed:

- read repository files
- summarize logs
- classify assets
- draft policies
- draft templates
- draft plans

Not allowed:

- any production access or change
- any `.env` content access
- any WordPress edit action

### Level 1: Local Documentation Authoring

Allowed:

- create or update local markdown and csv planning files
- refine templates
- maintain operation log entries about local work

Not allowed:

- production changes
- secret handling in tracked files
- content publication prep that assumes execution approval

### Level 2: Local Technical Analysis

Allowed:

- inspect local scripts
- analyze prior implementation logs
- design future technical verification steps

Not allowed:

- SSH execution
- WP-CLI execution against production
- WordPress dashboard operations

### Level 3: Production-Adjacent Planning

Allowed:

- write runbooks
- define rollback plans
- define evidence capture procedures

Not allowed without explicit human approval in a later phase:

- using the runbook
- logging into production
- changing production files or settings

## Current Phase Default

All agents in the current turn are limited to `Level 0` and `Level 1`.

`Level 2` may be used only for local-log-based reasoning.
`Level 3` outputs may exist as documents, but must not be executed.

## Escalation Triggers

If a task would require any of the following, stop and require explicit future approval:

- WordPress login
- production content editing
- plugin or theme changes
- `noindex` changes
- redirect or slug changes
- deployment
- remote CLI or SSH access
- analytics configuration changes

## Permission Matrix

| Agent | Default Level | Max In Current Phase | Notes |
|---|---:|---:|---|
| Project Manager Agent | 1 | 1 | Coordinates only |
| Site Audit Agent | 0 | 1 | Evidence collection and templates |
| Monetization Strategy Agent | 0 | 1 | No live offer edits |
| Compliance / Risk Agent | 0 | 1 | Review and policy only |
| SEO / Content Architecture Agent | 0 | 1 | IA planning only |
| Design System Agent | 0 | 1 | Visual policy only |
| WordPress Implementation Agent | 1 | 2 | Local runbook and implementation planning only |
| Analytics / QA Agent | 0 | 1 | Tracking plan and QA protocol only |
| Image Direction Agent | 0 | 1 | No generation execution |
| Content Production Agent | 0 | 1 | Briefing and structure only, no body edits |
| FANZA Data / API Agent | 0 | 1 | Data-source planning only, no key handling |

## Enforcement Rule

If an agent can only complete its assignment by crossing its current level, the correct output is:

- what blocked the task
- what permission would be required
- what exact artifact should be prepared first
