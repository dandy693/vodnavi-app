# Agent Team Plan

## Objective

Define a multi-agent operating model for the FANZA rebuild of `moterist.com` that is safe for a planning-only phase and scalable to later execution phases.

## Team Workflow

Recommended order:

1. Project Manager Agent
2. Site Audit Agent
3. Compliance / Risk Agent
4. SEO / Content Architecture Agent
5. Monetization Strategy Agent
6. Design System Agent
7. Analytics / QA Agent
8. Image Direction Agent
9. Content Production Agent
10. FANZA Data / API Agent
11. WordPress Implementation Agent

## Agent Definitions

### Project Manager Agent

- Role: maintain scope, sequence, dependencies, and approval boundaries
- Scope: milestone definition, artifact checklist, blocker management, handoff coordination
- Deliverables: phase plan, dependency map, work queue, decision log
- Procedure:
  1. confirm allowed scope
  2. define current phase outputs
  3. assign artifact owners
  4. track open questions
  5. approve handoff readiness
- Allowed: local planning docs, sequencing, status control
- Forbidden: production instruction execution, content decisions without source review
- Review Criteria: scope integrity, dependency clarity, no hidden production actions
- Handoff Condition: next agent receives exact input files, goal, and unresolved questions

### Site Audit Agent

- Role: establish the current-state baseline and historical evidence map
- Scope: inventory review, prior logs, URL/state audit templates, evidence gap tracking
- Deliverables: audit sheet, URL disposition draft, evidence notes, baseline summaries
- Procedure:
  1. review inventory files
  2. review key day logs
  3. identify confirmed vs historical vs open items
  4. populate templates
  5. surface blockers
- Allowed: read local files, produce audit templates and summaries
- Forbidden: live site modification, changing taxonomy assumptions into decisions
- Review Criteria: evidence traceability, coverage of URLs/page types, explicit uncertainty labels
- Handoff Condition: downstream agents can rely on a stable baseline and know what still needs confirmation

### Monetization Strategy Agent

- Role: design the shortest compliant path from user intent to first FANZA click
- Scope: offer hierarchy, CTA policy, monetization routes by page type, user journey mapping
- Deliverables: monetization map, CTA standards, priority funnel decisions
- Procedure:
  1. read audit baseline
  2. segment user intent
  3. map FANZA offer types to page types
  4. define primary and secondary CTA goals
  5. flag dependency on compliance and tracking
- Allowed: strategy documents, page-type monetization rules
- Forbidden: promising conversion outcomes, using unverified FANZA offer claims as facts
- Review Criteria: click-path clarity, compliance compatibility, measurable next actions
- Handoff Condition: content and design agents receive page-type goals and CTA rules

### Compliance / Risk Agent

- Role: prevent unsafe copy, policy drift, and operational overreach
- Scope: expression rules, adult-affiliate constraints, disclosure policy, risk escalation conditions
- Deliverables: risk rules, prohibited-pattern list, review checklist, escalation criteria
- Procedure:
  1. review prior risk docs
  2. identify rebuild-specific risk areas
  3. define mandatory checks by artifact type
  4. mark high-risk legacy clusters
  5. publish review thresholds
- Allowed: policy drafting, review standards, risk classification
- Forbidden: approving vague claims, approving adult visual asset usage by default
- Review Criteria: clarity, enforceability, issue escalation quality
- Handoff Condition: every downstream artifact has a concrete compliance gate

### SEO / Content Architecture Agent

- Role: define the future site structure and legacy URL disposition logic
- Scope: page-type map, hub-spoke model, internal link framework, keep/rebuild/merge/retire logic
- Deliverables: IA map, content hierarchy, URL disposition framework, internal link standards
- Procedure:
  1. review inventory and prior grouping
  2. cluster by intent and asset value
  3. define target page types
  4. define disposition rules
  5. align with monetization and compliance constraints
- Allowed: structural planning, taxonomy-neutral clustering
- Forbidden: direct slug or category change instructions in the current phase
- Review Criteria: crawl logic, intent separation, migration readiness
- Handoff Condition: content and implementation agents can plan against a stable architecture

### Design System Agent

- Role: define the rebuild's non-explicit visual language and reusable UI patterns
- Scope: tone, typography direction, color system, layout primitives, component rules
- Deliverables: visual policy, component inventory, page-type layout rules
- Procedure:
  1. read rebuild policy and monetization map
  2. define worldbuilding constraints
  3. define component-level rules
  4. align with WordPress implementation constraints
  5. document exceptions
- Allowed: design policy and local mock-structure planning
- Forbidden: explicit asset insertion, image generation execution, theme switching
- Review Criteria: distinctiveness, readability, implementation realism, compliance fit
- Handoff Condition: implementation and content agents can build pages with consistent visual rules

### WordPress Implementation Agent

- Role: translate approved future decisions into low-risk WordPress execution plans
- Scope: implementation runbooks, dependency checks, rollback design, technical constraint notes
- Deliverables: runbooks, implementation checklists, rollback sheets, dependency notes
- Procedure:
  1. read approved architecture and design policy
  2. identify safest implementation route
  3. define reversible change bundles
  4. define validation steps
  5. block any action lacking approval
- Allowed: local implementation planning, technical notes, rollback planning
- Forbidden: production editing, plugin/theme changes, SSH execution in this phase
- Review Criteria: reversibility, blast-radius control, dependency clarity
- Handoff Condition: any future execution operator can act from a safe, bounded checklist

### Analytics / QA Agent

- Role: make conversion validation and page QA measurable
- Scope: click-event measurement plan, QA evidence protocol, cache-aware verification rules
- Deliverables: QA checklist, event naming plan, evidence capture rules, verification matrix
- Procedure:
  1. read monetization targets and technical history
  2. define first-click measurement requirements
  3. define QA checkpoints by page type
  4. add cache / Service Worker controls
  5. define fail conditions
- Allowed: tracking design and QA protocol planning
- Forbidden: live analytics reconfiguration, making performance claims without data
- Review Criteria: measurability, reproducibility, sensitivity to cache artifacts
- Handoff Condition: execution teams know how success and regressions will be checked

### Image Direction Agent

- Role: define how non-explicit visuals can support the site's world and trust layer
- Scope: abstract art direction, mood boards in text, allowed / banned visual categories
- Deliverables: image policy, prompt direction spec for later use, placement guidance
- Procedure:
  1. read design policy and compliance policy
  2. define acceptable visual roles
  3. define banned substitute use cases
  4. map visuals to page types
  5. define approval checkpoints
- Allowed: direction docs only
- Forbidden: image generation execution, actress or product substitute imagery, adult media insertion
- Review Criteria: clarity of boundaries, usefulness to design/content teams, compliance safety
- Handoff Condition: later visual production can proceed without policy ambiguity

### Content Production Agent

- Role: convert strategy into outlines, briefs, and page-production specs
- Scope: page outlines, section goals, CTA placement rules, source-content extraction notes
- Deliverables: briefs, outlines, reusable section modules, rewrite inputs
- Procedure:
  1. read architecture and monetization rules
  2. define page objective
  3. define section-by-section structure
  4. define CTA and internal-link positions
  5. flag fact-check dependencies
- Allowed: briefs, outlines, structure documents
- Forbidden: direct article body changes in this phase, unsupported factual claims
- Review Criteria: intent fit, clarity, reuse potential, compliance readiness
- Handoff Condition: execution writers or implementers can build from the brief without guessing

### FANZA Data / API Agent

- Role: define how structured FANZA-related data could later support content and merchandising
- Scope: possible data sources, field definitions, refresh rules, compliance and key-handling constraints
- Deliverables: data model draft, source inventory, field map, refresh policy
- Procedure:
  1. identify required product metadata
  2. separate public data from protected access
  3. define field schema for later use
  4. define storage and refresh constraints
  5. flag approval needs
- Allowed: data planning and schema design only
- Forbidden: storing keys in tracked files, executing API integrations in this phase
- Review Criteria: legal and operational safety, usefulness to page generation, schema clarity
- Handoff Condition: implementation work can begin later without ad hoc data assumptions

## Review Chain

- Site Audit Agent output is reviewed by Project Manager Agent and Compliance / Risk Agent
- Monetization Strategy Agent output is reviewed by Compliance / Risk Agent and Analytics / QA Agent
- SEO / Content Architecture Agent output is reviewed by Project Manager Agent and WordPress Implementation Agent
- Design System Agent output is reviewed by Compliance / Risk Agent and WordPress Implementation Agent
- Content Production Agent output is reviewed by Compliance / Risk Agent and Monetization Strategy Agent
- FANZA Data / API Agent output is reviewed by Compliance / Risk Agent and WordPress Implementation Agent

## Success Standard

The team is ready for a later execution phase only when:

- current-state audit is completed
- page-type framework is approved
- monetization path is defined
- risk rules are explicit
- QA and measurement rules exist
- implementation routes are reversible
