# FANZA Priority Pages Rewrite Briefs

## Scope

- Target pages: `1095 / 1106 / 994 / 954`
- Phase: rewrite planning only
- This file defines rewrite briefs for implementation, not actual article copy
- No production WordPress changes are allowed from this document

## Shared Rules

1. Keep one dominant page role per page.
2. Keep FANZA official CTA stronger than internal-link guidance.
3. Exclude `1018` `Pending Source Material` from routine routing.
4. Keep CTA copy confirmation-oriented where facts can drift.
5. Keep `954` evergreen by default and campaign-specific only inside the dedicated module.

## 1095 Beginner Guide Rewrite Brief

### Page Purpose

- act as the first safe entry page for users who are new to FANZA
- reduce uncertainty before the user chooses registration, safety, or sale follow-up

### Intended Reader

- first-time or low-confidence users
- users who do not yet know what to check first

### Search Intent

- what FANZA is
- where to start
- what to confirm before going deeper

### Existing Elements To Keep

- beginner-entry role
- internal bridge to `1106`, `994`, and `954`
- official latest-information confirmation direction

### Existing Elements To Reduce Or Remove

- benefits-heavy persuasion that belongs in `1106`
- dense explanatory detail that increases entry friction
- crowded ending with too many equivalent exits

### New Elements To Add

- beginner orientation box
- confusion-reduction section
- clearer next-step hierarchy
- cleaner support path split: benefits / safety / sales

### Heading Change Policy

- headline should sound beginner-safe and introductory
- avoid benefit-heavy or sale-heavy framing in the H1
- H2s should move from orientation to next steps

### CTA Placement Policy

- top:
  - low-pressure official text-link CTA
- mid:
  - main official latest-info CTA
- end:
  - final official CTA repeat
  - secondary CTA to `1106`

### Internal Link Addition Policy

- keep:
  - `1106`
  - `994`
  - `954`
- use internal links only as support to the beginner journey

### FAQ Addition Policy

- include short beginner FAQs only if they reduce first-step hesitation
- avoid detailed technical or campaign-specific FAQ here

### NG Expressions

- strong registration push before orientation
- campaign-heavy urgency
- copy that assumes prior knowledge

### Rewrite Strength

- `moderate`

### Implementation Priority

- `high`

### Pre-Implementation Checklist

1. confirm the page still reads as beginner-first
2. confirm benefits-heavy messaging is moved to `1106`
3. confirm the first CTA does not feel too aggressive
4. confirm the ending drives the user to one clear next step

## 1106 Registration / Benefits Guide Rewrite Brief

### Page Purpose

- explain why users may find FANZA registration or usage worthwhile
- bridge from understanding to official pre-registration confirmation

### Intended Reader

- users already interested after `1095`
- users comparing value before clicking through

### Search Intent

- benefits of registration or use
- what advantages or value should be checked before acting

### Existing Elements To Keep

- benefit / registration framing
- direct connection to official confirmation
- fallback path to `994`

### Existing Elements To Reduce Or Remove

- general beginner explanation duplicated from `1095`
- campaign-driven wording that weakens the evergreen role
- too many fallback branches at the end

### New Elements To Add

- cleaner benefits comparison structure
- explicit "what should be officially confirmed" section
- one-path official CTA emphasis

### Heading Change Policy

- headline should center on registration value and benefits understanding
- H2s should move from benefits to confirmation
- do not use generic beginner-guide framing

### CTA Placement Policy

- top:
  - official registration-benefits CTA
- mid:
  - strongest official CTA
- end:
  - final official CTA repeat
  - reassurance fallback CTA to `994`

### Internal Link Addition Policy

- keep:
  - `1095`
  - `994`
  - `954`
- use `1095` as backfill, not as the page’s main outcome

### FAQ Addition Policy

- use FAQ only for questions that block registration-benefit understanding
- keep reassurance FAQ secondary to the benefits axis

### NG Expressions

- beginner-overview duplication
- unsupported benefit guarantees
- sale-page tone overtaking benefits intent

### Rewrite Strength

- `moderate`

### Implementation Priority

- `high`

### Pre-Implementation Checklist

1. confirm the page reads as benefits-first
2. confirm official confirmation remains the main action
3. confirm safety fallback stays secondary
4. confirm beginner explanation is not repeated excessively

## 994 Safety / Anxiety Resolution Rewrite Brief

### Page Purpose

- resolve safety, privacy, billing, and pre-use anxiety
- move the user to official confirmation immediately after reassurance

### Intended Reader

- users interested in FANZA but hesitant
- users who need trust clarification before clicking

### Search Intent

- is it safe
- what should be checked before using
- how to reduce pre-use anxiety

### Existing Elements To Keep

- trust/reassurance role
- bridge to `1106` and `954`
- official pre-use confirmation direction

### Existing Elements To Reduce Or Remove

- sale-first framing
- over-promotional offer language
- CTA placement that appears too late after reassurance

### New Elements To Add

- clearer FAQ / reassurance sequence
- explicit fact-versus-example separation
- stronger immediate CTA handoff after anxiety resolution

### Heading Change Policy

- headline should lead with safety and confirmation
- H2s should move from concern to reassurance to action
- keep commercial framing secondary

### CTA Placement Policy

- top:
  - low-pressure official text-link CTA
- mid:
  - main official CTA immediately after reassurance
- end:
  - final official CTA repeat
  - optional secondary sale-support CTA

### Internal Link Addition Policy

- keep:
  - `1095`
  - `1106`
  - `954`
- route to `954` only after trust handoff is complete

### FAQ Addition Policy

- FAQ is a core module here
- questions should be structured around likely hesitation points

### NG Expressions

- reassurance sections that still feel promotional first
- CTA that appears after too much additional content
- sale links that visually overtake the trust role

### Rewrite Strength

- `moderate_to_strong`

### Implementation Priority

- `high`

### Pre-Implementation Checklist

1. confirm the main CTA comes immediately after reassurance
2. confirm the page still feels safety-first
3. confirm sale support stays secondary
4. confirm the FAQ answers real objections, not generic filler

## 954 Evergreen Sale Hub Rewrite Brief

### Page Purpose

- serve as the evergreen hub for users who want to confirm current FANZA sales or campaign status
- keep the page reusable year-round without becoming tied to one campaign

### Intended Reader

- users with explicit sale intent
- users deciding whether current offers justify clicking now

### Search Intent

- what is on sale now
- how to confirm current campaign status
- what should be checked before relying on an offer

### Existing Elements To Keep

- sale-intent URL value
- connection back to `1095`, `1106`, `994`
- role as the commercial hub

### Existing Elements To Reduce Or Remove

- seasonal campaign framing
- expired campaign names, periods, discount figures
- actress-heavy clutter that weakens sale clarity

### New Elements To Add

- evergreen intro section
- offer comparison / how-to-check section
- dedicated `current_campaign_module`
- `generic_latest_check_state` as the default mode

### Heading Change Policy

- headline must be evergreen and sale-intent oriented
- H2s must separate evergreen explanation from campaign-specific module content
- campaign-specific wording belongs only inside the current-campaign module

### CTA Placement Policy

- top:
  - official current-sale CTA
- mid:
  - current-campaign module CTA
- end:
  - final official current-sale CTA

### Internal Link Addition Policy

- keep:
  - `1106`
  - `994`
  - `1095`
- use internal links only as support for users who still need context
- do not route to `1018`

### FAQ Addition Policy

- FAQ should support sale confirmation behavior, not become a second campaign area
- use only short evergreen questions

### NG Expressions

- reverting to a specific seasonal campaign article structure
- campaign details outside the dedicated module
- old discount figures or expired dates in evergreen sections
- registration as the primary CTA instead of current sale confirmation

### Rewrite Strength

- `full`

### Implementation Priority

- `highest`

### Pre-Implementation Checklist

1. confirm the default state is `generic_latest_check_state`
2. confirm `active_campaign_state` is conditional on official confirmation only
3. confirm campaign details live only inside `current_campaign_module`
4. confirm the page still reads correctly when no named campaign is active
5. confirm current sale confirmation remains the strongest action at top, mid, and end

## Global Pre-Implementation Checklist

1. confirm all four briefs preserve their distinct page roles
2. confirm CTA naming stays aligned with `fanza_cta_click`
3. confirm internal-link support does not overpower official CTAs
4. confirm `1018` is excluded from standard routing
5. confirm briefs stay at implementation-guidance level and do not become full draft copy
