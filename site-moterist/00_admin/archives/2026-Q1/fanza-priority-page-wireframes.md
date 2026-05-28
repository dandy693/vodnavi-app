# FANZA Priority Page Wireframes

## Scope

- Target pages: `1095 / 1106 / 994 / 954`
- Phase: local design only
- This document defines wireframe structure, CTA placement, internal link intent, and UI module needs
- No production WordPress changes are allowed from this document

## Shared Wireframe Rules

1. Each page has one primary next action.
2. Top CTA exists only when user intent is already actionable at the top of the page.
3. Mid CTA appears after the first meaningful explanation block.
4. End CTA closes the page without adding a crowded link cluster.
5. Internal links should support funnel progression, not compete with the primary CTA.

## CTA Placement Model

- top CTA
  - visible above the first fold or immediately after the lead block
  - used when the user may already be ready to confirm on FANZA official
- mid CTA
  - placed after the main explanatory or reassurance section
  - used as the first strong conversion handoff
- end CTA
  - final confirmation step
  - paired with only a small set of internal links

## 1095 Wireframe

### Page Summary

- page type: `Beginner Guide`
- page role: top-of-funnel entry
- rewrite strength: `moderate`

### Section Flow

1. Hero / lead
   - role: explain what the page is for and lower entry friction
   - content focus: what FANZA is, who this guide is for, what will be explained
2. Beginner orientation block
   - role: give a safe high-level overview before details
   - content focus: major content categories, basic usage image, what users usually check first
3. How to start evaluating block
   - role: move user from curiosity to structured comparison
   - content focus: what to confirm before using, what not to assume
4. Path selection block
   - role: split users by next intent
   - content focus: benefits route, safety route, sale route
5. Final next-step block
   - role: close with a simple next action
   - content focus: one recommended path and two fallback links

### CTA Plan

- top CTA:
  - yes, but light-emphasis
  - purpose: official latest-information confirmation for already-ready users
- mid CTA:
  - yes, primary conversion-support CTA
  - purpose: move to official FANZA overview or latest information confirmation
- end CTA:
  - yes
  - purpose: move to `1106` as the default next step

### CTA Priority

- primary CTA: confirm latest information on the official FANZA page
- secondary CTA: move to `1106`

### Internal Links

- keep:
  - `1106`
  - `994`
  - `954`
- add later:
  - FANZA top hub if created
  - offer format guide if created

### Required UI Modules

- hero intro
- beginner overview card grid
- next-step decision cards
- light trust note
- compact end-of-page CTA cluster

## 1106 Wireframe

### Page Summary

- page type: `Registration / Benefits Guide`
- page role: mid-funnel consideration bridge
- rewrite strength: `moderate`

### Section Flow

1. Hero / intent capture
   - role: state that this page helps decide whether joining or using FANZA is worth it
   - content focus: benefit-oriented framing without overclaiming
2. Benefit summary block
   - role: show why users consider FANZA
   - content focus: convenience, choice breadth, offer discovery, account-related value
3. What to confirm before acting block
   - role: add compliance buffer before click
   - content focus: benefits can change, official confirmation is required
4. Benefit-to-action block
   - role: connect perceived value to the official confirmation action
   - content focus: what to verify now before joining or using
5. Final CTA and fallback block
   - role: close the page with one official CTA and one reassurance fallback
   - content focus: official confirmation first, `994` second

### CTA Plan

- top CTA:
  - optional but recommended
  - purpose: official registration or benefits confirmation for high-intent users
- mid CTA:
  - yes, strongest primary CTA on the page
  - purpose: official pre-registration confirmation
- end CTA:
  - yes
  - purpose: repeat official confirmation, then show `994` as fallback

### CTA Priority

- primary CTA: confirm registration or benefits details on the official FANZA page
- secondary CTA: move to `994`

### Internal Links

- keep:
  - `1095`
  - `994`
  - `954`
- add later:
  - comparison support page if created
  - offer format guide if created

### Required UI Modules

- hero with concise value framing
- benefit cards
- official-confirmation notice box
- simple checklist
- final CTA block with one fallback link

## 994 Wireframe

### Page Summary

- page type: `Safety / Anxiety Resolution`
- page role: objection-handling trust page
- rewrite strength: `moderate_to_strong`

### Section Flow

1. Hero / reassurance lead
   - role: acknowledge safety, privacy, and billing anxiety
   - content focus: this page exists to help users confirm before acting
2. Safety basics block
   - role: explain what users should verify first
   - content focus: account, billing, browsing, privacy, official guidance
3. Common anxiety FAQ block
   - role: reduce hesitation with short answers
   - content focus: typical concerns and confirmation-oriented answers
4. Safe next-step block
   - role: transition from reassurance to action
   - content focus: official pre-use confirmation, then sale check if user is price-sensitive
5. Final trust-close block
   - role: end without pushing too many options
   - content focus: one official CTA plus one sale-hub branch

### CTA Plan

- top CTA:
  - no heavy top CTA
  - use a low-pressure official guidance text link only
- mid CTA:
  - yes, first strong CTA after the FAQ / safety basics
  - purpose: official pre-use guidance confirmation
- end CTA:
  - yes
  - purpose: repeat official CTA and offer `954` as secondary route

### CTA Priority

- primary CTA: confirm pre-use guidance on the official FANZA page
- secondary CTA: move to `954`

### Internal Links

- keep:
  - `1095`
  - `1106`
  - `954`
- add later:
  - safety FAQ support page if created
  - privacy or usage support page if created

### Required UI Modules

- reassurance hero
- safety checklist
- collapsible FAQ or stacked FAQ cards
- fact-versus-example note box
- end CTA block with one commercial branch

## 954 Wireframe

### Page Summary

- page type: `Evergreen Sale Hub`
- page role: commercial conversion hub
- rewrite strength: `full`

### Section Flow

1. Hero / current-sale intent capture
   - role: tell users this page helps them confirm current sale opportunities
   - content focus: evergreen value proposition, not seasonal copy
2. How to use this page block
   - role: explain what changes and what stays evergreen
   - content focus: current campaign area versus durable guidance
3. Offer type overview block
   - role: orient users to the kinds of sale opportunities they may find
   - content focus: campaign types, eligible formats, what to compare
4. Current campaign update block
   - role: hold the replaceable live campaign summary
   - content focus: campaign name, period, scope, confirmation note, CTA
5. Related guidance block
   - role: route unsure users into context pages
   - content focus: beginner, benefits, safety
6. Final conversion block
   - role: close with the strongest official sale confirmation CTA
   - content focus: official confirmation first, limited fallback links second

### CTA Plan

- top CTA:
  - yes
  - purpose: official current-sale confirmation for high-intent visitors
- mid CTA:
  - yes, inside or immediately after the current campaign update block
  - purpose: official confirmation of the current campaign
- end CTA:
  - yes
  - purpose: final official sale confirmation with minimal fallback links

### CTA Priority

- primary CTA: confirm current sale information on the official FANZA page
- secondary CTA: move to `1106` or `994` if the user still needs context

### Internal Links

- keep:
  - `1095`
  - `1106`
  - `994`
- add later:
  - genre hub if created
  - actress hub if created
  - offer format guide if created

### Required UI Modules

- evergreen hero
- sale-guidance explainer box
- offer type comparison cards
- replaceable current-campaign module
- related guidance strip
- high-emphasis final CTA block

## Cross-Page UI Module Library

- hero intro module
- official confirmation CTA block
- fallback internal-link cluster
- checklist module
- FAQ module
- decision card grid
- replaceable campaign update module

## Handoff Notes For Next Design Step

- convert each section flow into low-fidelity desktop and mobile wireframes
- keep `1095` and `1106` visually lighter than `954`
- keep `994` visually trust-oriented rather than promotional
- reserve the strongest emphasis style for `954` primary CTAs only
