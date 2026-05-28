# FANZA 1095 Visual Hierarchy Review

## 1. Purpose

This document reviews the likely desktop / mobile visual hierarchy of page `1095` based on read-only evidence and existing planning documents.

Its goals are:

- judge whether beginner-first information is still the dominant layer
- identify whether promo wording may visually overtake the page role
- evaluate the likely relationship between official CTA, support links, and FAQ
- record why the page remains `HOLD`

This is a review note only. It does not authorize WordPress edits or a final `GO`.

## 2. Target Page Information

- `page_id`: `1095`
- `page_type`: `Beginner Guide`
- `page_role`: `初心者導入・不安低減・登録導線`

Role boundary reminder:

- beginner onboarding must remain primary
- anxiety reduction should come before stronger conversion pressure
- `954` sale-check behavior must remain secondary on this page

## 3. Current Decision

- current status: `HOLD`

## 4. Desktop Review Viewpoints

Review points for desktop:

- whether beginner-oriented title and section flow remain the strongest frame
- whether official CTA remains more important than support routes
- whether promo copy visually competes with orientation content
- whether the page reads as explanatory before it reads as commercial

Current review status:

- partially inferable from public HTML and structure
- not visually confirmed in a rendered desktop browser state

## 5. Mobile Review Viewpoints

Review points for mobile:

- whether beginner-first reading order remains intact
- whether CTA appears before support links become dominant
- whether promo blocks create compression or urgency too early
- whether the page feels overloaded before orientation is completed

Current review status:

- partially inferable from source order
- not visually confirmed in a rendered mobile browser state

## 6. Whether Beginner / Anxiety-Reduction Information Is The Main Layer

Current assessment:

- provisionally yes at the document and heading level

Supporting observations:

- title and `H1` are clearly beginner-oriented
- `H2` sequence begins with service explanation and usage guidance
- beginner-first body framing is visible in the sampled article text

Limitation:

- rendered visual dominance is not proven
- a source-level pass cannot confirm whether promo blocks or affiliate widgets visually interrupt the intended flow

Decision:

- `HOLD`

## 7. Whether Strong Promo Wording Is Too Prominent

Current assessment:

- unresolved

Observed risk items:

- `初回購入限定！90%OFFクーポンはこちら→`
- `独占オリジナル動画が50,000本以上！`
- `月間女優ランキング`

Risk interpretation:

- these phrases are stronger than normal beginner-support wording
- if they are visually dominant, they can shift the page into sale-first behavior
- if they are merely supplementary and clearly weaker than the main CTA, they may remain as weakening candidates

Decision:

- `HOLD`

## 8. Role-Mixing Risk With `954 Evergreen Sale Hub`

Current assessment:

- material `HOLD` risk

Reason:

- `954` owns current sale / coupon check intent
- `1095` should not behave like an evergreen sale hub
- a strong `90%OFF` message can cause practical role drift even if the article body is beginner-oriented

Specific risk condition:

- if the page gives a strong `今すぐセール` impression before beginner orientation is complete, this is either continued `HOLD` or a `NO-GO` candidate

## 9. CTA Visual Priority

Current assessment:

- structurally acceptable in planning
- not fully proven in rendered execution

What is known:

- official CTA exists in public output
- support routes to `1106 / 994 / 954` exist

What remains unknown:

- whether the official CTA is visually stronger than promo blocks
- whether the official CTA is visually stronger than all support routes on desktop and mobile

Decision:

- `HOLD`

## 10. Internal-Link Cluster Visual Subordination

Current assessment:

- structurally acceptable, visually unresolved

What is known:

- support links to `1106 / 994 / 954` are present
- no `1018` route was identified in the inspected public HTML

What remains unknown:

- cluster placement weight in rendered layout
- whether cluster plus promo blocks overpower the official CTA

Decision:

- `HOLD`

## 11. FAQ Position And Visibility

Current assessment:

- section existence is confirmed
- visual and functional weight remains unresolved

What is known:

- `よくある質問` exists in the article

What remains unknown:

- whether the FAQ appears at an appropriate support level
- whether it visually competes with the conversion path

Decision:

- `HOLD`

## 12. Mobile Congestion / Route Overload

Current assessment:

- unresolved

Risk:

- mobile may stack article content, promo wording, support links, and FAQ too tightly
- if users encounter sale-push language before orientation is complete, mobile may intensify role drift

Decision:

- `HOLD`

## 13. Desktop Density / CTA Placement

Current assessment:

- unresolved

Risk:

- desktop can make promo widgets more visually assertive than the article flow
- if CTA placement is diluted by strong affiliate blocks, `1095` may stop reading like a beginner page

Decision:

- `HOLD`

## 14. Conditions That Keep `HOLD`

Keep `HOLD` if:

- desktop rendering is not visually checked
- mobile rendering is not visually checked
- official CTA dominance is not visually proven
- support-link subordination is not visually proven
- promo wording dominance is not visually judged
- FAQ placement is not visually judged

## 15. Conditions That Switch To `NO-GO`

Switch to `NO-GO` if any of the following is found:

- promo wording is the visual star of the page
- the page gives a strong `今すぐセール` impression before beginner guidance is complete
- support or promo blocks are visually stronger than the official CTA
- the page behaves practically like `954`
- mobile or desktop layout breaks beginner-first orientation

## 16. Recommended Handling

Current recommendation set:

- `そのまま維持`: not recommended at current evidence level
- `弱体化`: recommended if promo wording remains but only as supplementary information
- `配置変更候補`: recommended if visual dominance appears too early in desktop or mobile flow
- `954への導線化候補`: recommended if the wording behaves like current sale intent

## 17. Items To Transfer Into The Sign-Off Draft

Transfer these findings:

- beginner-first structure is provisionally intact at source level
- rendered visual hierarchy is still unresolved
- strong promo wording is a hierarchy risk, not a `GO` factor
- `954` role-mixing risk remains open
- desktop / mobile hierarchy must stay `HOLD` until rendered confirmation exists

## 18. Condition To Proceed To The Next HOLD-Resolution Task

Proceed only if this review framing is accepted:

- visual hierarchy is not yet proven
- promo wording remains a live risk
- the next meaningful step is still rendered hierarchy / execution evidence work, not `GO`

## 19. Suggested `operation-log.md` Entry

Suggested summary:

- created `00_admin/fanza-1095-visual-hierarchy-review.md`
- reviewed `1095` desktop / mobile hierarchy using read-only evidence and planning docs
- concluded that beginner-first structure is provisionally intact at source level but rendered hierarchy remains unresolved
- recorded strong promo wording as a hierarchy and `954` role-mixing risk
- kept `1095` in `HOLD`
- made no WordPress, SSH, DB, article, taxonomy, redirect, slug, noindex, theme, plugin, media, or `.env` changes
