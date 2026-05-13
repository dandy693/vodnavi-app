# FANZA Shared CTA Tracking Minimum Implementation Spec

## 1. Current Problem

The current FANZA planning set already defines a shared CTA measurement model, but runtime proof is missing.

Observed state from `1095`:

- CTA transition itself was confirmed
- `window.dataLayer` was not observed
- `fanza_cta_click` literal was not observed
- Ahrefs `pageview` was observed, but not `fanza_cta_click`

This means the measurement spec likely exists only at the planning layer, while the runtime implementation path is still missing or unconfirmed.

## 2. Target Pages

- `1095`
- `1106`
- `994`
- `954`

This spec is shared because the same CTA event model is intended to be reused across all four priority pages.

## 3. Minimum Implementation Direction

Minimum implementation direction:

1. keep CTA metadata on the CTA element itself
2. read that metadata from one shared click handler
3. send one normalized `fanza_cta_click` event through the existing Google tag candidate path
4. treat `dataLayer -> GTM` as a secondary fallback path only if the actual site environment requires it

This is the minimum path because it avoids:

- page-by-page custom tracking
- copy-dependent tracking IDs
- separate event logic on each page

Current environment override:

- `moterist.com` currently shows Google tag IDs:
  - `G-5HYV772ER9`
  - `GT-5RMZVZ9`
- the observed UI is Google tag rather than a visible `GTM-XXXXXXX` container workflow
- tag quality is currently `緊急`

## 4. Required `data-*` Attributes On CTA HTML

Each tracked CTA should expose the minimum metadata on the CTA element.

Required attributes:

- `data-event-name="fanza_cta_click"`
- `data-page-type`
- `data-page-role`
- `data-placement`
- `data-cta-id`
- `data-link-target`

Recommended example for `1095` mid official CTA:

```html
<a
  href="..."
  data-event-name="fanza_cta_click"
  data-page-type="beginner_guide"
  data-page-role="entry"
  data-placement="mid"
  data-cta-id="beginner_guide__mid__official_latest_info"
  data-link-target="official_fanza"
>
  FANZA公式で最新情報を確認する
</a>
```

## 5. Direct Google Tag Send Specification

Minimum shared send shape:

```js
gtag('event', 'fanza_cta_click', {
  page_type: '...',
  page_role: '...',
  placement: '...',
  cta_id: '...',
  link_target: '...'
});
```

Rules:

- use event name `fanza_cta_click`
- keep field names stable across all four pages
- do not derive IDs from display copy at click time
- do not omit required fields

## 5A. Secondary `dataLayer` / GTM Fallback Specification

Minimum shared push shape:

```js
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: "fanza_cta_click",
  page_type: "...",
  page_role: "...",
  placement: "...",
  cta_id: "...",
  link_target: "..."
});
```

Rules:

- use `event` = `fanza_cta_click`
- keep field names stable across all four pages
- do not derive IDs from display copy at click time
- do not omit required fields

## 6. `fanza_cta_click` Event Payload

Minimum required payload:

- `event`
- `page_type`
- `page_role`
- `placement`
- `cta_id`
- `link_target`

Expected value families:

- `page_type`
  - `beginner_guide`
  - `registration_benefits_guide`
  - `safety_anxiety_resolution`
  - `evergreen_sale_hub`
- `page_role`
  - `entry`
  - `consideration`
  - `objection_handling`
  - `commercial_conversion_hub`
- `placement`
  - `top`
  - `mid`
  - `end`
  - `inline`

## 7. Google Tag Requirements

Minimum Google tag-side requirements:

1. the existing Google tag must be able to accept `fanza_cta_click`
2. parameters must pass without rename drift
3. the current `緊急` tag quality issue must be checked before implementation
4. the same parameter schema must remain reusable across `1095 / 1106 / 994 / 954`

## 7A. GTM Requirements

Minimum GTM-side requirements:

1. read the `fanza_cta_click` custom event from `dataLayer`
2. map `page_type / page_role / placement / cta_id / link_target`
3. send the event to the analytics destination with no field renaming drift
4. keep the same schema across `1095 / 1106 / 994 / 954`

GTM should not invent page-specific field names that diverge from the shared spec.

## 8. Shared JS Requirements

Minimum shared JS requirements:

1. attach one delegated click handler to tracked CTA elements
2. read CTA metadata from `data-*` attributes
3. call `gtag('event', 'fanza_cta_click', payload)` before navigation completes
4. only initialize or use `dataLayer` if the actual site implementation later requires the fallback GTM path

The shared JS should remain generic and should not embed page-specific copy logic.

## 9. Impact On Existing HTML / WordPress Body

Expected impact if this path is adopted later:

- CTA markup needs stable `data-*` attributes
- shared CTA blocks should keep the same metadata convention
- article-body rewrite itself does not need to become analytics logic

This means the content layer remains mostly editorial, while measurement metadata is added in a controlled and reusable way.

## 10. Minimum Conditions Needed Before 1095 Reflection

Before `1095` moves beyond `HOLD`, at least the following must be decided:

1. whether `dataLayer` is the canonical event interface
1A. or whether direct Google tag event sending is the canonical interface for this site
2. whether CTA metadata will live in the CTA HTML itself
3. whether the click handler is owned by shared JS, GTM, or both
4. whether `1095` is allowed to reflect before runtime tracking is implemented

Without this, `1095` remains blocked at the CTA measurement layer.

## 11. Pre-Implementation Checks

Before any future implementation:

1. confirm the canonical field names
2. confirm the CTA selector strategy
3. confirm the metadata schema is compatible with all four pages
4. confirm GTM is intended to consume `dataLayer` events
5. confirm no existing JS already emits a conflicting event
6. confirm the current Google tag can accept the intended custom event
7. confirm what the `緊急` tag quality issue means

## 12. Post-Implementation Checks

After any future implementation:

1. click a CTA and confirm `event = fanza_cta_click`
2. confirm `page_type`
3. confirm `page_role`
4. confirm `placement`
5. confirm `cta_id`
6. confirm `link_target`
7. confirm all four pages use the same schema
8. confirm analytics sees CTA clicks as CTA events, not only as pageviews
9. confirm the event is accepted by the existing Google tag path if that is the chosen route

## 13. Risk If Not Implemented

If the shared CTA tracking path is not implemented:

- `1095` remains `HOLD`
- `1106 / 994 / 954` inherit the same ambiguity
- shared reporting becomes unreliable
- later retrofitting may create page-by-page drift
- content reflection may proceed without approved measurement closure

## 14. Recommended Next Action

Recommended next action:

1. approve this minimum shared direction
2. choose the implementation owner:
   - GTM
   - shared JS
   - shared JS plus GTM consumption
   - shared JS plus direct Google tag event sending
3. decide whether content reflection can proceed before runtime tracking is actually live

This document does not implement tracking.

It only defines the minimum shared path needed to move from planning ambiguity toward a reusable CTA measurement architecture.
