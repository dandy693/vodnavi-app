# FANZA CTA Tracking Implementation Decision

## 1. Background

The current planning set already defines a shared CTA event model for:

- `1095`
- `1106`
- `994`
- `954`

However, the latest read-only verification for `1095` showed the following:

- CTA destination itself was confirmed
- `window.dataLayer` was not observed
- `fanza_cta_click` literal was not observed
- no payload matching the CTA measurement spec was observed
- Ahrefs `pageview` was observed, but not `fanza_cta_click`

This means the measurement spec exists as planning, but its runtime implementation path is not yet proven.

## 2. Current Problem

The likely problem is not only “verification is incomplete.”

The more important possibility is:

- the measurement spec and runtime implementation are not yet connected

In practical terms, at least one of the following may be true:

- CTA tracking has not been implemented yet
- CTA tracking exists but is not exposed through `dataLayer`
- CTA tracking exists in a different location than assumed
- GTM or JS integration needed for the spec has not been wired

Because of this, `1095` must remain `HOLD` until the implementation path is chosen.

Additional environment finding:

- the currently observed plugin list does not show a typical analytics insertion plugin such as:
  - Site Kit
  - MonsterInsights
  - GA Google Analytics
  - WPCode
  - Insert Headers and Footers

This increases the likelihood that the current Google tag is:

- theme-driven
- child-theme-driven
- manually inserted through existing theme settings or hardcoded output

Additional public-source finding:

- public HTML source for `https://moterist.com/fanza20250329/` did not show:
  - `G-5HYV772ER9`
  - `GT-5RMZVZ9`
  - `gtag/js`
  - `gtag('config')`
  - `googletagmanager.com/gtag/js`
  - any `GTM-` marker
- `Ahrefs analytics.js` was present

This strongly suggests:

- Google tag / GA4 tag is currently not output on the public page

Therefore the practical sequence changes again:

1. establish Google tag output itself
2. then validate `fanza_cta_click`

Minimum installation direction before event work:

- install Google tag output first
- use `G-5HYV772ER9` as the first code-level ID
- keep `GT-5RMZVZ9` as the Google tag UI-side reference
- prefer child-theme `functions.php` and `wp_head` as the first implementation candidate
- keep head-insertion plugin as a secondary option
- perform one final THE THOR settings check before assuming no built-in path exists

## 3. Implementation Candidates

Current environment note:

- for `moterist.com`, Google tag was confirmed with:
  - `G-5HYV772ER9`
  - `GT-5RMZVZ9`
- the currently visible management surface is Google tag, not a `GTM-XXXXXXX` container
- tag quality is shown as `緊急`

This changes the practical first-choice path.

### GTM Side

Possible approach:

- push normalized CTA metadata into `dataLayer`
- let GTM read and transmit `fanza_cta_click`

Strengths:

- centralized tracking control
- easier reuse across `1095 / 1106 / 994 / 954`
- less content-level logic duplication if CTA metadata is consistent

Risks:

- requires reliable `dataLayer` push source
- debugging may be split between page code and GTM
- if GTM is not already governing CTA interactions, setup work may expand
- current observed site environment does not presently confirm a GTM-container-first workflow

### CTA HTML Attribute Side

Possible approach:

- encode CTA metadata in attributes such as `data-page-type`, `data-page-role`, `data-cta-id`, `data-link-target`
- use those attributes as the source of tracking payload

Strengths:

- stable mapping close to the actual CTA element
- easier to keep copy changes separate from tracking identifiers
- usable by GTM or JS

Risks:

- requires markup discipline across all four pages
- still needs a collector layer to transform click into event transport

### Direct Google Tag Side

Possible approach:

- keep CTA metadata stable in HTML or shared JS
- call `gtag('event', 'fanza_cta_click', payload)` directly through the existing Google tag

Strengths:

- aligns with the currently observed `moterist.com` tag environment
- avoids assuming a GTM container workflow that may not exist here
- narrows the first implementation path for `1095`

Risks:

- depends on the current Google tag setup being usable for custom event sending
- tag quality is currently shown as `緊急`
- parameter naming and transport behavior still need human verification in the Google tag admin UI

### Theme / Child Theme JS Side

Possible approach:

- add a shared CTA click listener in theme or child-theme JS
- emit `fanza_cta_click` directly or via `dataLayer`

Strengths:

- one shared listener can cover all pages
- easier to normalize event payload centrally
- avoids per-page ad hoc script drift

Risks:

- touches shared presentation layer
- requires stronger QA because all four pages are affected
- must be kept in sync with CTA markup conventions
- the active theme / child-theme source is not present in this local repository, so the exact insertion point is not yet verified

### Existing JS Side

Possible approach:

- extend whatever JS already handles analytics or CTA interactions

Strengths:

- may reduce new code surface
- can reuse current analytics bootstrapping

Risks:

- current read-only evidence did not expose a visible existing `fanza_cta_click` path
- existing JS responsibility may be unclear
- easier to create hidden coupling if the current code path is not well understood

## 4. Recommended Direction

Recommended direction:

- use a shared CTA metadata convention in the CTA HTML layer
- read that metadata from a centralized JS layer
- prefer direct Google tag event sending as the current-site first candidate
- keep GTM-oriented planning only as a secondary fallback assumption until the actual tag governance is clarified
- before any event work, confirm that Google tag itself is actually present on the public page

In short:

1. define stable CTA metadata on the actual CTA elements
2. choose one shared event transport path
3. emit `fanza_cta_click` from that shared layer through the existing Google tag candidate path

This avoids:

- page-specific one-off implementations
- copy-driven tracking IDs
- separate logic for each page

## 5. Minimum Decision Needed Before 1095 Reflection

Before `1095` can move beyond `HOLD`, the team must decide:

1. where the canonical CTA metadata will live
2. where the click listener / event emission will live
3. whether `dataLayer` is mandatory
4. who owns the tracking implementation path
5. whether the existing Google tag can accept the intended custom event despite the current `緊急` quality status

Without this decision:

- `1095` remains blocked at the measurement layer

## 6. Why This Affects 1106 / 994 / 954 Too

This is not a `1095`-only problem.

The spec already defines common fields across:

- `page_type`
- `page_role`
- `placement`
- `cta_id`
- `link_target`

Therefore, implementation choice for `1095` will influence:

- `1106` CTA tracking
- `994` CTA tracking
- `954` CTA tracking
- consistency of future reporting

If implemented inconsistently page-by-page, the shared measurement model will break down.

## 7. Pre-Implementation Checks

Before any implementation work starts, confirm:

1. final event transport owner
2. whether `dataLayer` is the intended interface
3. stable CTA metadata schema
4. CTA selectors or attribute strategy
5. whether existing JS already owns click tracking
6. whether GTM is present and intended to consume CTA events
7. what the `緊急` tag quality warning actually means for custom-event delivery
8. whether the active theme or child theme already outputs Google tag in `wp_head`
9. whether a new direct-send path would create double counting
10. whether Google tag / GA4 tag is currently absent from the public source and must be installed first
11. whether child-theme `functions.php` can be backed up and restored cleanly

## 8. Post-Implementation Checks

After implementation, confirm:

1. CTA click emits `fanza_cta_click`
2. `page_type` matches page spec
3. `page_role` matches page spec
4. `placement` matches actual CTA position
5. `cta_id` matches the approved naming model
6. `link_target` matches the actual route
7. all four pages emit the same schema
8. no page falls back to ad hoc field naming
9. public HTML shows `G-5HYV772ER9`
10. Tag Assistant detects the Google tag
11. GA4 receives data before CTA-event validation resumes

Implementation-pre-start conclusion for current site state:

- preferred first path:
  - child-theme `functions.php` output through `wp_head`
- code baseline:
  - `G-5HYV772ER9`
- preconditions before any future implementation:
  - child-theme `functions.php` can be backed up safely
  - pre-change `functions.php` is saved as the exact source artifact
  - public HTML still shows no Google tag output
- duplicate-risk judgment:
  - currently low from public-source evidence
  - must still be re-checked after implementation
- rollback judgment:
  - removing the added Google tag block should restore the prior state
- CTA-event judgment:
  - `fanza_cta_click` should not be re-tested until baseline Google tag reception is confirmed
- current decision:
  - `HOLD`

Current site-level implementation-start judgment:

- the recommended path is stable enough for planning
- but production-side implementation should not start yet because:
  - live child-theme edit access path is not confirmed in this workflow
  - exact backup capture for the actual `functions.php` is not yet confirmed operationally
- therefore the site is still in:
  - `HOLD`

Live editing path judgment:

- target file should be the active child-theme `functions.php`
- assume the standard WordPress path:
  - `/wp-content/themes/<active-child-theme>/functions.php`
- because the actual active child-theme slug is not confirmed here, the path is operationally standard but not slug-finalized
- preferred implementation route:
  - server-side or other safe file-based edit path
- avoid as first choice:
  - WordPress admin theme editor
- backup requirement:
  - exact pre-change `functions.php` must be saved before insertion
- insertion position:
  - child-theme `functions.php` hook or direct `wp_head` output path
- rollback:
  - remove the Google tag block and restore the exact saved file if necessary
- current decision remains:
  - `HOLD`

Operational confirmation needed before implementation:

- unresolved item 1:
  - actual active child-theme slug
- unresolved item 2:
  - exact live path of child-theme `functions.php`
- unresolved item 3:
  - exact server-side editing route used by the operator
- resolved direction:
  - use server-side or other safe file-based editing, not the admin theme editor first
- resolved backup rule:
  - save the exact pre-change `functions.php` file before any insertion
- resolved insertion rule:
  - add Google tag output at one `wp_head` emission point only
- resolved rollback rule:
  - remove the added block or restore the saved exact file
- because unresolved items remain, final state stays:
  - `HOLD`

Latest live-entity confirmation status:

- public HTML confirms:
  - `/wp-content/themes/the-thor-child/style-user.css`
- actual active child-theme slug:
  - `the-thor-child` is now the strongest candidate
- exact live `functions.php` path:
  - likely `/wp-content/themes/the-thor-child/functions.php`
  - actual existence and editability still require server-side confirmation
- safe editing route:
  - continue to prefer server-side or other controlled file access
- exact backup:
  - still depends on access to the real live file
- rollback:
  - still acceptable conceptually by block removal or file restore
- implementation start decision:
  - not yet an implementation candidate
  - remain `HOLD`
- remaining next step:
  - confirm `/wp-content/themes/the-thor-child/functions.php`
  - confirm exact backup acquisition method

Current server-side verification status:

- attempted live path check:
  - `/home/rvpuxcjb/public_html/moterist.com/wp-content/themes/the-thor-child/functions.php`
- read-only SSH verification from this environment:
  - failed before remote verification because the identity file could not be accessed
- consequence:
  - actual file existence is still not directly verified
  - backup capture path is still not directly verified
  - safe edit route remains conceptual rather than execution-confirmed
- current decision remains:
  - `HOLD`

Updated implementation status after live tag insertion:

- Google tag baseline output is now installed on the site
- installed through:
  - child-theme `functions.php`
  - `wp_head` output path
- file path used:
  - `/home/rvpuxcjb/public_html/moterist.com/wp-content/themes/the-thor-child/functions.php`
- backup artifact:
  - `/home/rvpuxcjb/public_html/moterist.com/wp-content/themes/the-thor-child/functions.php.bak_20260510_084855`
- syntax checks passed:
  - `functions.php.tmp_google_tag`
  - `functions.php`
- public HTML now confirms:
  - `googletagmanager.com/gtag/js?id=G-5HYV772ER9`
  - `gtag('config', 'G-5HYV772ER9')`
- consequence:
  - Google-tag-absent is no longer the primary blocker
  - next required verification is Tag Assistant plus GA4 data reception
  - `fanza_cta_click` should be re-tested only after baseline tag reception is validated
- current decision:
  - still `HOLD`, but on a later gate

Post-install reception-gate interpretation:

- baseline tag output is now treated as installed correctly
- confirmed public markers:
  - `G-5HYV772ER9`
  - `googletagmanager.com/gtag/js?id=G-5HYV772ER9`
  - `gtag('config', 'G-5HYV772ER9')`
  - `window.dataLayer` initialization
- confirmed coverage-screen update:
  - `https://moterist.com/fanza20250329/` is now treated as tagged
  - tagged count changed from `1` to `2`
  - not-tagged count changed from `37` to `36`
- confirmed Tag Assistant update:
  - `G-5HYV772ER9` detected
  - Google tag `fired / detected`
- confirmed GA4 stream reception update:
  - GA4 realtime traffic confirmed
  - stream detail indicates data collection active within the past 48 hours
  - Google tag panel indicates data is flowing
- the remaining decision gate is no longer code insertion
- the remaining gate is reception confirmation:
  - `fanza_cta_click` event payload delivery
  - measurement-spec field integrity
- until those are human-confirmed:
  - do not treat CTA tracking as complete
  - keep overall state at `HOLD`

Updated implication:

- baseline Google tag installation and reception gate are now treated as passed
- next step can move to minimum direct-send validation for `fanza_cta_click`
- content reflection and CTA-event implementation should still remain separated as controlled next-step work

Direct-send validation preconditions:

- send path:
  - `gtag('event', 'fanza_cta_click', {...})`
- first target:
  - `1095` mid official CTA only
- payload contract:
  - `page_type: beginner_guide`
  - `page_role: entry`
  - `placement: mid`
  - `cta_id: 1095_mid_official`
  - `link_target: official_fanza`
- implementation choices:
  - add handler in child-theme `functions.php`
  - or expose stable CTA metadata and let shared JS read it
- must remain true before implementation:
  - CTA selection is unique
  - link behavior is preserved
  - external transition is not interfered with
  - GA4 custom-event reception is observable
- current decision:
  - still `HOLD`
  - remaining core issue is CTA event validation, not baseline tag installation

## 9. This Turn Does Not Implement Tracking

This document is planning only.

What this turn does:

- identifies a likely implementation gap
- narrows the decision surface
- records recommended direction

What this turn does not do:

- implement JS
- implement GTM
- implement `gtag()` event sending
- edit CTA markup
- edit WordPress production

Current implementation blocker:

- live implementation requires SSH or equivalent server-side file access
- this environment cannot access `C:\\Users\\Tachi\\.ssh\\mixhost_codex_pc`
- and cannot access `C:\\Users\\Tachi\\.ssh\\config`, so `ssh mix-wp` cannot be resolved here
- therefore no live CTA-event implementation was performed from this session

## 10. Suggested operation-log.md Entry

```text
### FANZA CTA Tracking Implementation Decision
- 本番WordPressには触れず、1095で `fanza_cta_click` が確認できなかったことを受けて、4ページ共通の CTA 計測実装方針を整理
- 作成:
- 00_admin/fanza-cta-tracking-implementation-decision.md
- 背景:
- 1095 では CTA 遷移自体は確認済み
- `window.dataLayer`、`fanza_cta_click` literal、payload は確認できなかった
- Ahrefs `pageview` は観測されたが `fanza_cta_click` ではなかった
- 判断:
- measurement spec と runtime 実装が未接続の可能性あり
- 候補:
- GTM側
- CTA HTML属性側
- テーマ / 子テーマJS側
- 既存JS側
- 推奨:
- CTA HTML metadata + shared JS or GTM-connected handler の共通実装
- 今回は実装せず、方針整理のみ
- 本番WordPress、管理画面保存、SSH、DB、taxonomy は未変更
```

## 11. 2026-05-10 Implementation Update

Decision update:

- the first live implementation path is now `wp_head`, not `wp_footer`

Reason:

- short-lived diagnostics proved that `wp_head` marker output reached public HTML
- `wp_footer` marker output did not reliably reach public HTML
- therefore `wp_footer` is not the correct first runtime path for the 1095 minimum test

Implemented minimum path:

- page scope:
  - `1095` only
- CTA scope:
  - official end CTA only
- send path:
  - `gtag('event', 'fanza_cta_click', {...})`
- payload:
  - `page_type: beginner_guide`
  - `page_role: entry`
  - `placement: mid`
  - `cta_id: 1095_mid_official`
  - `link_target: official_fanza`
  - `transport_type: beacon`

Current state:

- runtime literals are confirmed in public HTML for `1095`
- runtime literals are not exposed on `1106`
- click-time reception in Tag Assistant / GA4 DebugView / GA4 realtime remains unconfirmed from this environment

## 12. 2026-05-10 Runtime Send Confirmation

Implementation result update:

- the live `wp_head` implementation now has click-time network proof

Confirmed at runtime:

- CTA click opened the FANZA age-check route
- the same click emitted `POST https://www.google-analytics.com/g/collect`
- the request carried:
  - `en=fanza_cta_click`
  - `ep.page_type=beginner_guide`
  - `ep.page_role=entry`
  - `ep.placement=mid`
  - `ep.cta_id=1095_mid_official`
  - `ep.link_target=official_fanza`
  - `ep.transport_type=beacon`
- the collection request returned `204`

Remaining limitation:

- Tag Assistant / GA4 DebugView / GA4 realtime operator-side confirmation is not directly accessible from this environment

## 13. 2026-05-10 Decision State After Network Confirmation

For `1095`, the CTA tracking decision state is now:

- `network confirmation passed`
- `UI evidence pending`

This means:

- the implementation path is no longer blocked by event-name or payload uncertainty
- the remaining CTA-specific evidence gap is analytics UI attachment, not runtime send behavior

Still separate from this page-level result:

- sitewide Google tag coverage
- cross-page rollout decision for `1106 / 994 / 954`
- final publish gate for `1095` as a whole

## 14. 2026-05-10 Relationship To Publish Gate

Decision boundary:

- CTA tracking for `1095` is no longer the main blocker at network level
- `1095` publish judgment remains `HOLD`

Why `HOLD` remains:

- analytics UI-side evidence is still missing
- publish review must still consider page rendering, role mixing, promo-strip interaction, rollback readiness, and sitewide tag coverage separately

Rollout position:

- do not expand this implementation to `1106 / 994 / 954` yet
- treat sitewide Google tag coverage as an independent task, not as a reason to relitigate the confirmed `1095` network send

## 15. 2026-05-10 Cross-Page Rollout Decision Order

Reference pattern now proven on `1095`:

- Google tag baseline gate passed
- `wp_head` runtime path chosen over `wp_footer`
- `fanza_cta_click` UI-side confirmation achieved
- click-time network and payload integrity confirmed
- rendered-state and promo-strip composition passed
- rollback readiness confirmed

Common rollout rules to freeze before any new page:

1. keep the event name fixed as `fanza_cta_click`
2. keep the payload schema fixed:
   - `page_type`
   - `page_role`
   - `placement`
   - `cta_id`
   - `link_target`
3. redesign payload values per page, not by copying `1095` values
4. keep runtime path preference at `wp_head` unless a stronger page-specific reason appears
5. verify non-target pages for non-expansion on every step
6. keep sitewide tag coverage outside the page-by-page rollout decision

Suggested rollout order:

1. `1106`
2. `994`
3. `954`

Order rationale:

- `1106` is the nearest reusable support-route pattern after `1095`
- `994` is support-oriented but has a different reassurance role and should be validated second
- `954` is the highest-risk sale hub and should be expanded only after the lower-risk patterns are stable

Per-page payload-design rule:

- `page_type` must match the actual page family
- `page_role` must match the actual page role
- `placement` must reflect the real CTA position used on that page
- `cta_id` must be unique and page-specific
- `link_target` must match the real destination semantics on that page

Cross-page `NO-GO` conditions:

- page-role drift caused by implementation or composition
- blind reuse of `1095` payload values on a different page role
- unintended exposure outside the intended page
- CTA navigation degradation
- sale-first / coupon-first distortion on non-sale pages
- `954` logic or sale framing leaking into `1106` or `994`

Rollback rule for future rollout:

- treat `functions.php.bak_fanza_cta_head_20260510_210559` as the current known-good `1095` reference point
- still capture a fresh exact backup before any implementation on the next rollout step

## 16. 2026-05-10 `1106` Pre-Rollout Check

Target page:

- `1106`
- `page_type: Registration / Benefits Guide`
- intended page role:
  - `登録メリット・特典理解`
  - `登録導線`

Reusable pattern from `1095`:

- keep `event_name` as `fanza_cta_click`
- keep the runtime path at `wp_head`
- keep the document-level click handler model
- require click-time network confirmation
- require UI-side confirmation
- require desktop / mobile rendered-state review
- require rollback readiness before sign-off

Draft payload design for `1106`:

- `page_type: registration_benefits_guide`
- `page_role: consideration`
- candidate placements:
  - `top`
  - `mid`
  - `end`
  - `inline`
- candidate `cta_id` family:
  - `registration_benefits_guide__top__official_registration_benefits`
  - `registration_benefits_guide__mid__official_registration_benefits`
  - `registration_benefits_guide__end__official_registration_benefits`
  - `registration_benefits_guide__end__internal_safety_next`
  - `registration_benefits_guide__inline__internal_beginner_context`
- candidate `link_target` family:
  - `official_fanza`
  - `internal_994`
  - `internal_1095`

Current CTA candidates on `1106` planning side:

- top official CTA
- mid official CTA
- end official CTA
- end internal safety CTA
- inline internal beginner-context CTA

Selector and scope judgment before implementation:

- the official CTA family is already structurally named in existing `1106` planning
- a minimum rollout should still start with one official CTA only, not the whole CTA set
- the strongest first candidate is:
  - `registration_benefits_guide__mid__official_registration_benefits`
- reason:
  - closest to the `1095` minimum-test shape
  - lower ambiguity than a mixed end-of-page cluster

Role-mixing risk on `1106`:

- do not let beginner-entry framing from `1095` overtake benefits framing
- do not let reassurance framing from `994` become the main value promise
- do not let sale-confirmation logic from `954` overtake the page
- keep internal support links subordinate to the official registration-benefits CTA

Isolation requirement:

- `1106` rollout must not alter or weaken the working `1095` implementation
- every `1106` step must re-check that `1095` still keeps its own literals, runtime behavior, and page-only scope

Condition to proceed toward implementation planning:

- one uniquely selectable official CTA is chosen
- page-level payload values are frozen for that CTA
- non-target-page non-expansion checks are defined
- rendered-state review plan is defined
- rollback capture plan is defined

Condition to keep `HOLD`:

- CTA uniqueness is still ambiguous
- multiple CTA families are being expanded at once
- page-role integrity is still not human-confirmed
- rollback capture for the next edit is still undefined

`NO-GO` conditions for `1106` rollout:

- `1106` starts reading like `1095`, `994`, or `954`
- copied `1095` payload values are reused without redesign
- official CTA loses primary status
- support links overtake the official route
- page scope spreads unintentionally
- CTA navigation degrades

Rollback readiness note:

- current known-good shared reference remains:
  - `functions.php.bak_fanza_cta_head_20260510_210559`
- before any `1106` implementation:
  - capture a fresh exact backup of the live `functions.php`

## 17. 2026-05-10 `1106` Live HTML Selector Check

Confirmed public target:

- page URL:
  - `https://moterist.com/fanza20250331/`
- permalink mapping:
  - `?p=1106` resolves to the same page family in existing records

Observed live CTA candidate:

- text:
  - `FANZA公式ページで登録前の案内を確認する`
- href characteristics:
  - contains `al.dmm.co.jp`
  - contains `ch=link_tool`
  - contains `ch_id=link`
- observed DOM context:
  - end-of-body list under `次に確認したいページ`

Collision check in live HTML:

- other `al.dmm.co.jp` links currently present are:
  - toolbar ranking link
  - promo-strip coupon link
- those do not match the same `ch=link_tool / ch_id=link` pair
- therefore `href + exact textContent` is currently sufficient to isolate one official CTA without pulling in toolbar or promo-strip links

Design correction before implementation:

- the preferred first target had been named:
  - `registration_benefits_guide__mid__official_registration_benefits`
- but the currently observed live CTA sits in an end-of-body next-page block
- implementation planning should freeze either:
  - a revised `placement` / `cta_id`
  - or a documented reason for keeping `mid`
- do not implement while placement naming and live position disagree

Proceed condition for `1106`:

- target CTA remains uniquely selectable in live HTML
- placement and `cta_id` naming are reconciled with the observed position
- toolbar and promo-strip exclusion stays explicit
- non-expansion checks against `1095` remain in the verification plan

Keep `HOLD` if:

- placement naming is still ambiguous
- the live CTA text or href drifts
- another matching FANZA official link appears in the body

`NO-GO` if:

- the selector cannot avoid toolbar or promo-strip capture
- the target page role is compromised
- `1095` runtime safety would be put at risk by a shared-code change without isolation proof

## 18. 2026-05-10 `1106` Payload And Selector Freeze

Frozen first-rollout payload for `1106`:

- `event_name: fanza_cta_click`
- `page_type: registration_benefits_guide`
- `page_role: consideration`
- `placement: end`
- `cta_id: registration_benefits_guide__end__official_registration_benefits`
- `link_target: official_fanza`

Reason for the naming change:

- the previous draft used:
  - `placement: mid`
  - `registration_benefits_guide__mid__official_registration_benefits`
- the observed live CTA sits in the end-of-body `次に確認したいページ` list
- therefore `end` is now the correct lower-risk naming freeze

Frozen selector contract:

1. `href` includes `al.dmm.co.jp`
2. `href` includes `ch=link_tool`
3. `href` includes `ch_id=link`
4. `textContent` exact match:
   - `FANZA公式ページで登録前の案内を確認する`
5. prefer end-of-body list context if implementation-time DOM selection can use it safely

Explicit exclusion contract:

- exclude toolbar `ch=toolbar` links
- exclude promo-strip `ch=toolbar` links
- do not broaden to generic `al.dmm.co.jp` capture without the exact text and channel pair

Implementation may proceed to the next planning gate only if:

- the live CTA still satisfies the frozen selector contract
- the page keeps the `Registration / Benefits Guide` role
- `1095` non-expansion verification is included
- rollback capture is prepared for the shared file path

Keep `HOLD` if:

- selector uniqueness weakens
- placement and live position diverge again
- body-level FANZA link inventory changes before implementation

`NO-GO` if:

- selector isolation becomes unreliable
- payload naming drifts from live structure
- shared implementation would threaten the confirmed `1095` runtime path

## 19. 2026-05-10 `1106` `wp_head` Final Readiness Check

Approved planning direction for the first `1106` implementation attempt:

- runtime path:
  - `wp_head`
- page scope:
  - `is_single(1106)`
- target count:
  - one CTA only
- frozen payload:
  - `event_name: fanza_cta_click`
  - `page_type: registration_benefits_guide`
  - `page_role: consideration`
  - `placement: end`
  - `cta_id: registration_benefits_guide__end__official_registration_benefits`
  - `link_target: official_fanza`

Why this path is acceptable:

- `1095` already validated the `wp_head` path with public HTML observability
- the frozen `1106` selector can avoid toolbar and promo-strip links
- one-CTA scope minimizes shared-code risk

Isolation rule:

- `1106` implementation must not modify the existing `1095` runtime behavior
- post-implementation verification must explicitly include:
  - `1106` positive check
  - `1095` retained-runtime check
  - `994` non-exposure check
  - `954` non-exposure check

Frozen verification sequence for the future implementation turn:

1. capture a fresh exact backup of live `functions.php`
2. copy to a temp file
3. insert `1106` page-scoped `wp_head` handler only
4. run `php -l` on the temp file
5. reflect only if syntax passes
6. run `php -l` on reflected `functions.php`
7. confirm `1106` literals with no-cache `curl`
8. confirm `1095` existing literals still appear as expected
9. confirm `994` and `954` do not show the new `1106` literals

Keep `HOLD` if:

- fresh backup capture is not ready
- selector contract changes
- non-expansion verification against `1095 / 994 / 954` is not prepared

`NO-GO` if:

- selector isolation against toolbar or promo strip is lost
- `is_single(1106)`-only scoping is not maintained
- the shared-file change cannot be verified safely against the existing `1095` implementation

## 20. 2026-05-10 `1106` Minimum Implementation Outcome

Implementation result:

- first `1106` `wp_head` rollout is now reflected
- page scope used:
  - `is_single(1106)`
- existing `1095` block remained in place

Reflected selector model:

- `href` includes `al.dmm.co.jp`
- `href` includes `ch=link_tool`
- `href` includes `ch_id=link`
- `textContent` exact match:
  - `FANZA公式ページで登録前の案内を確認する`
- extra boundary:
  - `.content` scope
  - list-item presence
  - `outline_1__9` heading-relative end-of-body context

Reflected payload:

- `event_name: fanza_cta_click`
- `page_type: registration_benefits_guide`
- `page_role: consideration`
- `placement: end`
- `cta_id: registration_benefits_guide__end__official_registration_benefits`
- `link_target: official_fanza`
- `transport_type: beacon`

Verified after reflection:

- temp remote `php -l` passed
- reflected remote `php -l` passed
- no-cache `curl` on `1106` exposed the expected runtime literals
- no-cache `curl` on `1095` still exposed the existing `1095` literals
- no-cache `curl` on `994` and `954` did not expose the new `1106` literals

Open item:

- click-time runtime request confirmation for `1106` remains separate
- an attempted Playwright-based check was not completed from this environment because package resolution was not stable enough for the temporary script path
