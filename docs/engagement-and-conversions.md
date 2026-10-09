# Work engagement and conversion contract (proposed refinement)

This is a draft refinement of the existing PostHog integration, not a provider/identity migration or production release. Keep the current `hostname` + `environment` historical filters, session-storage identity, existing events, saved dashboard and manually confirmed outcomes.

## One bounded engagement family

`reading-engagement` measures the rendered body extent of public blog articles, case studies and the approved `/resume` page marked `data-reading-body`. This includes embedded media and inline controls; it is viewport exposure rather than words read. Discovery/private/verification pages and unpublished résumé editions do not have a meter.

Time accrues only with a visible, focused document and a body intersecting the viewport. Input/textarea/select focus pauses counting. Arrival allows 60 seconds of quiet reading; focus, pointer/key activation and scroll refresh the allowance. No values, text, key names or coordinates are captured. Hidden, blurred, offscreen and more-than-60-second idle time is excluded. Suspended timer gaps over five seconds and clock rollback do not infer engagement. Cap at 1,800 cumulative whole seconds.

At most three milestones (30/120/300 seconds) and one changed final snapshot are emitted per mounted visit; no network heartbeat. Pagehide/navigation/unmount finalizes once; duplicate cleanup and unchanged finals do not resend. BFCache restore starts a fresh meter. Visibility alone pauses/resumes without a receipt. Final capture uses the SDK's [documented immediate `sendBeacon` options](https://posthog.com/docs/libraries/js/usage); delivery is best effort and cannot prove receiver success. Blocked storage disables analytics entirely, with no persistent fallback.

| Property | Contract |
| --- | --- |
| `engagement_version` | Derived `visible_active_v1` |
| `engagement_checkpoint` | `30s`, `120s`, `300s`, `final` |
| `active_seconds` | Whole cumulative seconds 1–1,800; use MAX, never SUM snapshots |
| `depth_percent` | Maximum visible body extent in buckets 0/25/50/75/100 |
| `content_type` | Derived from measured path: `article`, `case_study`, `resume` |

The sender freezes original public pathname/entry attribution for navigation cleanup. The SDK continues to own native session/window identity at capture time; a late final after native idle rotation can belong to another session. Do not override native IDs or introduce a reading-visit identifier to join that boundary. For reporting, use conservative per-session/path maxima and disclose missing/late flushes. These measures do not prove comprehension, a unique person or completed reading. No summary means unknown, not zero.

## Conversion coverage

| Event | Stage / trigger |
| --- | --- |
| `resume_click` | Existing event retained; `interaction_type=resume_navigation`, `resume_pdf`, or `resume_text` |
| `resume_click` with navigation | `resume_navigation_intent`; includes main/hiring navigation placements |
| `resume_click` with PDF/text | `resume_download_intent`; respective `resume_pdf` / `resume_text` placements, not saved-file success |
| `contact_click` | `contact_intent`; existing mail CTAs plus résumé identity mail link, no address/text |
| `booking_click` | `booking_intent`; actual Cal.com link activation, not a completed booking |
| `subscribe_submit_intent` | Existing request intent, per valid submission attempt |
| `subscribe_verification_requested` | New `verification_request_accepted` only after `/api/kit/subscribe` responds OK |
| `subscribe_request_failed` | New `request_failed` on rejection/network failure; no error details |
| `subscribe_request_accepted` | Historical verification-page name retained for compatibility, `first_party_verification_accepted`; never an active-subscription event |

Request handling sends only placement to analytics, suppresses successful/in-flight repeats and keeps reporter failures nonblocking. The token-handling `/newsletter/verify` and `/newsletter/unsubscribe` pages now fail closed for all analytics, matching main/hack. Old verification events remain historical; the client no longer emits them. Future first-party/provider confirmation uses only existing daily Redis aggregates in the scorecard, never a browser token journey.

`work-newsletter:v1:metrics:YYYY-MM-DD` already records atomic `first_party_verified` and `kit_active_ready` transitions. Kit-active readiness also requires form/tag synchronization; it does not prove delivery or a newly acquired subscriber. These are request transitions, not unique addresses. Read totals only and never join email/token/provider records to PostHog identity. Actual hiring inquiries/bookings remain the separate private evidence-backed `/jobs/review` workflow.

## New reports, preserving history

Create separate versioned reports after approval and observed new receipts. Leave dashboard `2095308`, the existing scorecard and old events intact. Every event/step must use `hostname=work.thearcades.me`, `environment=production`, exclude `utm_campaign=analytics-verification`, and share one half-open UTC interval and raw/Regular traffic cohort. Older custom events have null `$host`; filtering all events by `$host` would silently drop historical contacts/downloads/newsletter/résumé receipts. `$host` can be used for pageview diagnostics only. The new property stages are not backfilled onto old events.

| Report | Denominator | Numerator / value |
| --- | --- | --- |
| Meter coverage | Non-null distinct session/path keys with pageviews on measured routes | Same keys with any versioned reading snapshot |
| Engaged exposure | Same eligible pageview keys, coverage displayed alongside | MAX active seconds ≥30 and MAX depth ≥50 |
| Observed time/depth | Measured session/path keys only | Per-key maxima/distributions; not summed cumulative/total visit time |
| Résumé interest/download | Site sessions with pageviews (interest); sessions with résumé pageviews (download) | Sessions with `resume_click`, segmented by interaction type/placement |
| Case-study to contact/booking | Sessions participating in `case_study_view` | Same sessions with `contact_click` / `booking_click`, explicitly intent |
| Newsletter request acceptance | Sessions with `subscribe_submit_intent` | Same sessions with `subscribe_verification_requested`; raw attempts reported separately |

Use unordered same-session participation when transport batching or concurrent effects can reorder receipts. For stricter professional journey reports, define a reviewed conversion window and ordering separately; do not silently convert participation into an ordered funnel. Filter every event, not only the first step. Repeated paths in a session collapse to conservative maxima; work's tab/session identity cannot establish returning people or cross-site journeys.

The read-only audit found no captured `booking_click` taxonomy yet, although links and saved queries exist. Missing receipts do not prove zero bookings or a broken link. Require a reviewed future QA click/receipt before claiming coverage. Native duration/bounce changes when engagement events are added and must not be treated as active time or compared unqualified across cutover.

## Checks and release limits

Focused tests cover visibility/focus/idle/depth, repeats, suspension, BFCache, navigation/pagehide/cleanup, storage failure, request failure/retry, finite sanitization and immediate final transport. Run the normal suites, lint, types and build. No credentials, provider settings, résumé content/exports or saved dashboards change.

Do not merge/deploy this draft. Earlier production smoke evidence remains valid only for that earlier release. Chrome browser QA is blocked by `ERR_BLOCKED_BY_CLIENT`; no protection changes or bypass. Future approved QA must use exact campaign tags on every URL and explicit exclusions, then distinguish payload, provider receipt and session materialization. Missing final snapshots are censored observations. Rollback reverts additive collection while preserving history.
