# FANZA 954 Visual Priority Rules

## Scope

- Target page: `post_id 954`
- Page type: `Evergreen Sale Hub`
- Phase: local design only
- Default state: `generic_latest_check_state`
- Alternate state: `active_campaign_state`
- No production WordPress changes are allowed from this document

## 1. Purpose Of The Visual Priority Rules

These rules exist to:

- keep `954` usable as an evergreen sale hub year-round
- allow a stronger campaign emphasis only when a current campaign is officially confirmed
- preserve the FANZA official CTA as the highest-priority action
- prevent the page from turning into a full-page seasonal campaign article
- keep stale campaign details visually and structurally isolated

## 2. Generic Latest-Check State Priority

`generic_latest_check_state` is the default visual state.

Priority order:

1. page purpose and evergreen lead
2. official sale-confirmation CTA
3. current-campaign module in generic latest-check mode
4. evergreen offer comparison guidance
5. fallback internal-link cluster

In this state:

- the module should be visible but not dominant over the page purpose
- urgency should stay low
- the page should read as a stable evergreen guide first

## 3. Active Campaign State Priority

`active_campaign_state` is used only when an active campaign is officially confirmed.

Priority order:

1. official sale-confirmation CTA
2. active current-campaign module
3. page purpose and evergreen lead
4. evergreen offer comparison guidance
5. fallback internal-link cluster

In this state:

- the module may become the strongest content block in the middle of the page
- the page still must remain structurally an evergreen hub, not a standalone campaign article

## 4. Generic / Active Visual Differences

### Generic latest-check state

- neutral status badge
- moderate contrast module container
- evergreen wording
- no campaign name
- no explicit time pressure styling

### Active campaign state

- higher-contrast status badge
- stronger module border or background emphasis
- campaign-specific summary visible
- higher CTA emphasis within the module
- still only one campaign module and one campaign-specific CTA

## 5. Current-Campaign Module Emphasis Rules

- in generic state:
  - emphasize clarity over urgency
  - the module should look like a check point, not a promotion banner
- in active state:
  - allow stronger contrast than other content sections
  - do not exceed the visual authority of the page hero plus official CTA combined
- in both states:
  - keep the module as one isolated block
  - avoid repeating campaign styling elsewhere on the page

## 6. Rules To Prevent The Module From Consuming The Evergreen Body

- hero copy must stay evergreen in both states
- offer-type overview must remain visible as a separate evergreen section
- campaign details must not spread into cards, headings, or closing text outside the module
- the end-of-page section must return to evergreen confirmation wording
- no section title outside the module may contain a current campaign name

## 7. CTA Priority Rules

Priority order:

1. official FANZA sale-confirmation CTA
2. current-campaign module CTA
3. end-of-page official CTA repeat
4. fallback internal-link cluster

Additional rules:

- the top or mid official CTA must remain stronger than any internal link
- the module CTA may be the strongest single button in active state
- no internal link should visually mimic the primary official CTA

## 8. Internal-Link Cluster Priority

- always lower priority than the official CTA
- always lower priority than the current-campaign module in both states
- in generic state:
  - keep it compact and calm
- in active state:
  - reduce its visual pull further so the active module remains the commercial focus

## 9. Desktop / Mobile Visual Hierarchy

### Desktop

- allow a clear block hierarchy:
  - hero and primary CTA
  - current-campaign module
  - evergreen comparison guidance
  - fallback internal-link cluster
- active state may use stronger contrast in the module, but not full-width takeover styling

### Mobile

- stack visual priorities vertically in the same order
- keep the top CTA visible early
- keep the current-campaign module immediately after evergreen orientation content
- avoid long campaign-heavy scroll sections before the user reaches the CTA

## 10. Visual Rules To Prevent Stale Campaign Remnants

- campaign name must appear only inside the module
- campaign period must appear only inside the module
- historical discount figures must appear only inside the module when active
- do not use campaign names in hero labels, breadcrumbs, or fallback clusters
- if the module returns to generic state, all campaign-specific styling and copy must disappear with it

## 11. Swap Checklist

Before a future operator changes the module state:

1. confirm whether the page should stay generic or move active
2. confirm that campaign facts are official and current
3. confirm campaign-specific copy exists only inside the module
4. confirm the official CTA remains the top action
5. confirm fallback links are still visually secondary
6. confirm no expired dates or discount claims remain outside the module
7. confirm desktop and mobile hierarchy still reads correctly

## 12. Procedure To Return From Active To Generic

1. remove the campaign name
2. remove the campaign period
3. remove campaign-specific discount or urgency language
4. reset the status badge to the generic latest-check state
5. reset CTA wording to generic official confirmation wording
6. confirm the page still reads as an evergreen sale hub without any named campaign

## 13. Pre-Implementation Checklist

1. confirm `generic_latest_check_state` is the default design state
2. confirm `active_campaign_state` is used only with official confirmation
3. confirm the page hero remains evergreen in both states
4. confirm the active module does not turn the whole page into a campaign article
5. confirm official FANZA CTA remains the highest-priority action
6. confirm internal-link clusters remain supportive only
7. confirm expired campaign names, dates, and discount figures do not remain in evergreen sections
8. confirm desktop and mobile hierarchy are consistent
9. confirm state changes can be made by editing only the module block
10. confirm generic fallback styling is always available when no campaign is active
