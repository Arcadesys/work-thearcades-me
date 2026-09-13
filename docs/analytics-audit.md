# Portfolio funnel analytics audit

## Metric and boundary

**Done when:** a future implementation can distinguish four visitor actions and qualified inquiries without collecting personal data in analytics, and can calculate rates only when it has a traffic denominator.

**Budget:** one source audit and one measurement-design pass. This document proposes names and placements only; it adds no tracking code, provider configuration, dashboards, or data collection.

## What the repository proves today

The source at `0fb5f13` contains the following conversion paths:

| Visitor action | Source evidence | Current measurement evidence |
| --- | --- | --- |
| Hiring contact | Homepage hero `Discuss a role` is a `mailto:` link; `/work-with-me` also has a `Discuss a role` email link; the résumé has email links. | No click event is implemented in source. |
| Consulting calendar | The homepage contact section, every service panel, the `/work-with-me` closing section, and case-study footers link to `site.bookingUrl`, a Cal.com 30-minute URL. | No click event is implemented in source. A completed booking is not established by this repository. |
| Résumé PDF | `/resume` renders a native `download` link to `/resume.pdf`. | No download event is implemented in source. |
| Service-page visit | `/work-with-me` is an application route with service and calendar CTAs. | No page-view event is implemented in source. |

`package.json` has no analytics SDK dependency, `next.config.ts` has no tracking configuration, and `vercel.json` declares only the Next.js framework. The repository also has no application analytics endpoint. These are source facts, not a statement about a deployed host.

## Hosting and provider dashboards: unverified

The README identifies a Vercel project, and the source links to Cal.com and posts newsletter requests to ActiveCampaign. The audit did not inspect any authenticated Vercel, Cal.com, or ActiveCampaign dashboard. Therefore the following are unknown:

- Whether Vercel Web Analytics is enabled, which pages it reports, or its retention and consent settings.
- Whether Cal.com reports booking-page visits, completed bookings, cancellations, or attribution fields for this link.
- Whether ActiveCampaign records a source useful for this portfolio's inquiry funnel.

Do not use a provider dashboard as evidence for a metric until its current settings, date range, and event definition have been checked. A provider acknowledgement, a calendar landing-page visit, or a newsletter submission is not a qualified hiring or consulting inquiry.

## Proposed event contract

Implement these only after choosing an approved analytics provider and consent posture. Use only the listed operational fields; do not send email addresses, names, free-text messages, calendar details, IP addresses, or user IDs to analytics.

| Event name | When to record | Page and CTA placement | Allowed properties |
| --- | --- | --- | --- |
| `hiring_contact_click` | A visitor activates a role-oriented `mailto:` CTA. | Homepage hero `Discuss a role`; `/work-with-me` intro `Discuss a role`; résumé `Email me` actions. | `page_path`, `cta_id`, `cta_label`, `journey: "hiring"` |
| `consulting_calendar_click` | A visitor activates a consulting-oriented Cal.com CTA. | `/work-with-me` service-panel `Discuss a consulting project` buttons and closing button; homepage contact `Grab time on my calendar` only if its copy is deliberately classified as consulting; case-study footer only if deliberately classified as consulting. | `page_path`, `cta_id`, `cta_label`, `journey: "consulting"`, optional `service_id` |
| `resume_pdf_download` | A visitor activates the native download link. | `/resume` `Download résumé PDF`. | `page_path: "/resume"`, `cta_id: "resume_pdf_download"`, `cta_label` |
| `service_page_view` | The `/work-with-me` route has rendered and is visible to the visitor. | `/work-with-me`, once per page view. | `page_path: "/work-with-me"`, `page_type: "service"` |

Use stable `cta_id` values in addition to visible labels, so a copy edit does not split a time series. Record the click before an external navigation where the chosen provider supports it; otherwise label the event as a best-effort click measurement. A click remains a click, not proof that an email was sent, a meeting was booked, or a PDF download completed.

## Qualified inquiries are a separate outcome

Count a qualified inquiry outside click analytics after a real person or approved workflow confirms both:

1. A stated need that fits either a leadership role or a consulting engagement.
2. Enough context to determine a plausible next step, such as role scope, project need, timing, or an agreed follow-up.

Keep the supporting email, calendar details, name, and notes in the appropriate contact or scheduling system, not in analytics. Report an aggregate `qualified_hiring_inquiries` and `qualified_consulting_inquiries` count by reporting period only after the qualification decision is documented. Do not infer qualification from a `mailto:` click or calendar-page click.

## Rate rules

Rates require a matching denominator and shared date range:

| Rate | Numerator | Required denominator |
| --- | --- | --- |
| Hiring-contact click-through rate | `hiring_contact_click` | Unique eligible homepage, service-page, or résumé page views, segmented to the matching CTA placement |
| Consulting-calendar click-through rate | `consulting_calendar_click` | Unique eligible views of the page/placement where that calendar CTA appears |
| Résumé-download rate | `resume_pdf_download` | Unique `/resume` page views |
| Service-page qualified-inquiry rate | Qualified consulting inquiries attributed under an approved rule | Unique `/work-with-me` page views for the same period |

Do not calculate a rate from event counts alone, from calendar completions alone, or from traffic totals covering unrelated pages. State the attribution rule for qualified inquiries before reporting a service-page rate; otherwise report counts only.

## Iteration log

- **Writing pass:** mapped the four requested actions to actual source paths and separated source evidence from uninspected provider dashboards.
- **Correction:** narrowed calendar measurement to CTAs deliberately classified as consulting, and described the service page as a route rather than relying on prior build-history language.
- **Verdict — keep:** the proposed contract contains no PII fields, does not claim existing tracking, and keeps clicks, qualified inquiries, and rates distinct.
