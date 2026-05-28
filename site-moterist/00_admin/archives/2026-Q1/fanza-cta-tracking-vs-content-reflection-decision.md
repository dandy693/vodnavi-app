# FANZA CTA Tracking Vs Content Reflection Decision

## 1. Current Situation

`1095` is close to a reflection candidate at the article-body level.

Current alignment:

- rewrite direction is beginner-first
- sale / coupon intent is being kept secondary
- current-sale confirmation is being routed toward `954`
- rollback readiness now has provisional recording

Current unresolved point:

- CTA tracking is not proven at runtime

The observed gap is not limited to `1095`.

It is likely a shared issue affecting:

- `1095`
- `1106`
- `994`
- `954`

## 2. Option A: Implement CTA Tracking First

This option means:

- decide the shared CTA tracking implementation path first
- define where the event is emitted
- close the runtime gap before any page moves beyond `HOLD`

This is an implementation-path-first decision, not a copy-first decision.

## 3. Option B: Reflect 1095 Content First

This option means:

- proceed with `1095` content reflection first
- keep CTA tracking unresolved for now
- treat measurement as a later implementation task

This would allow article-body improvements to move before tracking architecture is closed.

## 4. A Merits

- keeps measurement and reflection gates aligned
- avoids page-by-page tracking drift
- creates one reusable path across all four pages
- reduces the chance that `1095` moves while analytics remain structurally ambiguous

## 5. A Risks

- delays `1095` reflection longer
- expands the next decision from one page to four-page shared infrastructure
- may require coordination between markup, GTM, and shared JS ownership

## 6. B Merits

- allows `1095` content cleanup to move sooner
- lets beginner-first copy improvements land without waiting for shared tracking architecture
- may reduce editorial delay if measurement is handled later

## 7. B Risks

- allows reflection while CTA event ownership is still undefined
- risks inconsistent tracking across `1095 / 1106 / 994 / 954`
- weakens post-reflection comparability
- may require retrofitting event logic after content is already live

## 8. Impact On 1095 / 1106 / 994 / 954

This decision is cross-page because the measurement spec assumes common fields:

- `page_type`
- `page_role`
- `placement`
- `cta_id`
- `link_target`

If implementation is not shared:

- `1095` may use one pattern
- `1106 / 994 / 954` may drift into different patterns

That would reduce reporting quality across the priority-page set.

## 9. Recommended Decision

Recommended decision:

- decide the shared CTA tracking implementation path first

Reason:

- the current evidence suggests a shared implementation gap, not just a `1095` verification miss
- solving the path once is cleaner than reflecting `1095` first and retrofitting the other pages later

This does not authorize implementation yet.

It only means:

- keep `1095` at `HOLD`
- treat the next blocking decision as architectural

## 10. Next Actions

1. decide whether `dataLayer` is the required interface
2. decide the canonical CTA metadata source
3. decide the event owner:
   - GTM
   - CTA HTML metadata plus shared handler
   - theme / child-theme JS
   - existing JS
4. decide whether content reflection is allowed before shared tracking is implemented
5. if not, keep `1095` at `HOLD` until the CTA tracking path is approved
