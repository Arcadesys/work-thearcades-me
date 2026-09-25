# Work funnel scorecard

## Sources and filters

For PostHog, use production events only with `hostname=work.thearcades.me` and `environment=production`; exclude `utm_campaign=analytics-verification`. Set the report timezone to UTC so its daily buckets match the Redis counters. Work-site pages and click events are already instrumented; do not add a cross-site visitor identifier.

| Step | Event or source | Definition |
| --- | --- | --- |
| Professional handoff | `$pageview`, `utm_campaign=professional_handoff`, `utm_content` in `home_header`, `home_entry`, `start_entry`; fallback `referring_domain=www.thearcades.me` | Work-site landing pageviews attributed to the three creative-site handoff placements. The referring domain is the fallback when campaign parameters are absent. This is an arrival count, not an outbound click count. |
| Case study | `case_study_view`, `slug` | Case-study route view after the work-site arrival. |
| Contact intent | `contact_click`, `placement` | Activation of a hiring email link. It does not prove an email was sent. |
| Booking intent | `booking_click`, `placement` | Activation of a Cal.com link. It does not prove a booking was completed. |
| First-party verification | Daily Redis aggregate `first_party_verified` | A signed verification link was claimed once through the Work endpoint. |
| Kit-active ready | Daily Redis aggregate `kit_active_ready` | Kit reported the verified subscriber active, and the Work form/tag updates completed. This is a delivery-eligibility state, not proof that a broadcast or email was delivered. |
| Actual inquiry/booking | Manually reviewed mailbox and Cal.com totals | Count an inquiry only when the mailbox contains a real role/project request; count a booking only when Cal.com reports a completed booking. Keep those outcomes separate from click events. |

For the Work journey, use the existing same-session PostHog funnel from a work-site landing pageview to `case_study_view` to either `contact_click` or `booking_click`. The creative-to-work transition is summarized by source-domain/campaign totals only; do not join visitor identities across the two domains. Report click/request rows as intent.

The first-party totals are kept in daily Redis hashes named `work-newsletter:v1:metrics:YYYY-MM-DD`, with fields `first_party_verified` and `kit_active_ready`. Each count is incremented atomically with the signup-ledger status transition and expires after 400 days. These are request-transition counts, not unique subscriber counts; one address may make more than one request. Read aggregate hashes only; do not export newsletter records or join the counters to emails, tokens, subscriber IDs, or PostHog visitors.

## 14-day pre/post template

Compare the 14 complete UTC calendar days before the funnel-path release with the 14 complete UTC calendar days after it. Record release time, query/export time, and any site interruption. Use identical PostHog filters and the same inquiry qualification rule in both periods.

| Metric | Pre (14 days) | Post (14 days) | Source |
| --- | ---: | ---: | --- |
| Creative-site handoff arrivals | — | — | Work `$pageview`, referral domain or fixed campaign |
| Case-study views after handoff | — | — | Same-session PostHog funnel |
| Contact clicks (intent) | — | — | `contact_click` |
| Booking clicks (intent) | — | — | `booking_click` |
| First-party verification | N/A before aggregate deployment | — | Sum Redis `first_party_verified` |
| Kit-active ready state | N/A before aggregate deployment | — | Sum Redis `kit_active_ready`; not an email delivery receipt |
| Qualified hiring inquiries | — | — | Manual mailbox review; aggregate count only |
| Completed bookings | — | — | Manual Cal.com total; aggregate count only |

Show raw counts alongside rates. Calculate handoff-to-case-study and case-study-to-click rates only from the same eligible, same-session PostHog funnel cohort. Do not infer inquiries or bookings from clicks. The Redis provider counts intentionally cannot be joined to the PostHog funnel, so report counts without attribution rates. Mark low-volume rows as insufficient evidence.
