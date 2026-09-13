# Portfolio funnel analytics audit

## Metric and boundary

**Done when:** a future implementation can distinguish four visitor actions and qualified inquiries without collecting personal data in analytics, and can calculate rates only when it has a traffic denominator.

**Budget:** one source audit and one measurement-design pass. This document proposes names and placements only; it adds no tracking code, provider configuration, dashboards, or data collection.

## Audit scope: baseline source and final integration

The baseline source audit was performed against `origin/main` at `0fb5f13`. The event placements below are corrected against the final integrated diff at `8450322` (`origin/main..HEAD`), which adds the leadership-contact and résumé paths. Neither revision contains analytics code or configuration.

## What the final integration proves

The final integrated source contains the following conversion paths:

| Visitor action | Source evidence | Current measurement evidence |
| --- | --- | --- |
| Hiring contact | The homepage hero has `Discuss a role`; the homepage contact section and résumé have `Discuss a leadership role`; `/work-with-me` has `Discuss a role`. Each is a `mailto:` link. | No click event is implemented in source. |
| Consulting calendar | The homepage contact section and `/work-with-me` service and closing sections have `Discuss a consulting project`; case-study footers retain `Grab time on my calendar`. Each links to `site.bookingUrl`, a Cal.com 30-minute URL. | No click event is implemented in source. A completed booking is not established by this repository. |
| Résumé PDF | `/resume` renders a native `download` link labelled `Download résumé PDF` to `/resume.pdf`. | No download-initiation event is implemented in source. |
| Service-page visit | `/work-with-me` is an application route with service and calendar CTAs. | No page-view event is implemented in source. |

`package.json` has no analytics SDK dependency, `next.config.ts` has no tracking configuration, and `vercel.json` declares only the Next.js framework. The repository also has no application analytics endpoint. These are source facts, not a statement about a deployed host.

## Hosting and provider dashboards: unverified

The README identifies a Vercel project, and the source links to Cal.com and posts newsletter requests to ActiveCampaign. The audit did not inspect any authenticated Vercel, Cal.com, or ActiveCampaign dashboard. Therefore the following are unknown:

- Whether Vercel Web Analytics is enabled, which pages it reports, or its retention and consent settings.
- Whether Cal.com reports booking-page visits, completed bookings, cancellations, or attribution fields for this link.
- Whether ActiveCampaign records a source useful for this portfolio's inquiry funnel.

Do not use a provider dashboard as evidence for a metric until its current settings, date range, and event definition have been checked. A provider acknowledgement, a calendar landing-page visit, or a newsletter submission is not a qualified hiring or consulting inquiry.

## Proposed event contract

Implement these only after choosing an approved analytics provider and consent posture. The event contract is limited to its event name, page path, and CTA placement; do not send email addresses, names, free-text messages, calendar details, IP addresses, or user IDs to analytics.

| Event name | Page path | CTA placement |
| --- | --- | --- |
| `hiring_contact_click` | `/` | Hero `Discuss a role`; contact section `Discuss a leadership role` |
| `hiring_contact_click` | `/work-with-me` | Intro `Discuss a role` |
| `hiring_contact_click` | `/resume` | Header and leadership section `Discuss a leadership role` |
| `consulting_calendar_click` | `/` | Contact section `Discuss a consulting project` |
| `consulting_calendar_click` | `/work-with-me` | Service-panel and closing `Discuss a consulting project` |
| `resume_pdf_download_initiated` | `/resume` | Header `Download résumé PDF` |
| `service_page_view` | `/work-with-me` | Route view; no CTA |

Record a click before an external navigation where the chosen provider supports it; otherwise label the event as a best-effort click measurement. `resume_pdf_download_initiated` means activation of the download link only. It does not prove a completed file transfer. No click proves that an email was sent or a meeting was booked.

## Qualified inquiries are a separate outcome

Count a qualified inquiry outside click analytics after a real person or approved workflow confirms both:

1. A stated need that fits either a leadership role or a consulting engagement.
2. Enough context to determine a plausible next step, such as role scope, project need, timing, or an agreed follow-up.

Keep the supporting email, calendar details, name, and notes in the appropriate contact or scheduling system, not in analytics. Report an aggregate `qualified_hiring_inquiries` and `qualified_consulting_inquiries` count by reporting period only after the qualification decision is documented. Do not infer qualification from a `mailto:` click or calendar-page click.

## Rate rules

Rates require a matching denominator and shared date range:

| Rate | Numerator | Required denominator |
| --- | --- | --- |
| Hiring-contact click-through rate | Unique eligible page views during which `hiring_contact_click` occurred | Unique eligible homepage, service-page, or résumé page views, segmented to the matching CTA placement |
| Consulting-calendar click-through rate | Unique eligible page views during which `consulting_calendar_click` occurred | Unique eligible views of the page/placement where that calendar CTA appears |
| Résumé-download-initiation rate | Unique `/resume` page views during which `resume_pdf_download_initiated` occurred | Unique `/resume` page views |
| Service-page qualified-inquiry rate | Qualified consulting inquiries attributed under an approved rule | Unique `/work-with-me` page views for the same period |

Do not calculate a rate from event counts alone, from calendar completions alone, or from traffic totals covering unrelated pages. State the attribution rule for qualified inquiries before reporting a service-page rate; otherwise report counts only.

## Iteration log

- **Writing pass:** mapped the four requested actions to actual source paths and separated source evidence from uninspected provider dashboards.
- **Correction:** updated placements to the final integrated contact and résumé copy; reduced the event contract to event name, page path, and CTA placement; counted CTR numerators as unique page views with the event; and renamed the PDF event to make its initiation-only meaning explicit.
- **Verdict — keep:** the proposed contract contains no PII fields, does not claim existing tracking, and keeps clicks, qualified inquiries, and rates distinct.
