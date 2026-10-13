---
id: work-bunch-chatgpt-oauth-failure-analysis
title: 'Eight Pull Requests to Connect One Account: A Bunch OAuth Failure Analysis'
slug: bunch-chatgpt-oauth-failure-analysis
group: work-notes
publishDate: '2026-10-13T15:30:00.000Z'
buildDate: '2026-09'
excerpt: How connecting Bunch's OAuth-protected MCP server to ChatGPT failed eight different ways, what each failure showed about the client, and the security boundary that stayed fixed throughout.
tags:
  - mcp
  - oauth
  - failure-analysis
seo:
  title: 'MCP OAuth with ChatGPT: A Failure Analysis'
  description: 'Eight production failures connecting an OAuth-protected MCP server to ChatGPT: the evidence, each fix and regression test, and the invariant that never moved.'
---

# Eight Pull Requests to Connect One Account: A Bunch OAuth Failure Analysis

On September 19, 2026, I merged the change that put [Bunch](https://github.com/Arcadesys/bunch)'s hosted MCP server behind OAuth so that people could connect their own private records to ChatGPT. Then connecting it to ChatGPT failed. It failed in eight different ways over roughly 25 hours, and each failure needed its own pull request.

This is the record of that incident: the invariant I held, what each failure showed, how it was fixed and tested, and what I would do differently. Everything here is linked to a public pull request, so you can check the work instead of trusting the summary.

## The invariant

Bunch is an accessibility tool for continuity across memory gaps. Its records are personal. The MCP server has two kinds of callers: anonymous visitors exploring a fictional Demo system, and signed-in owners working with their own data.

The rule I wrote down before any of this broke, and kept through every fix:

- **No Authorization header** selects anonymous discovery or the fictional Demo.
- **A supplied credential that is empty, malformed, expired, revoked, or has the wrong audience or scope fails with HTTP 401.** It never falls back to the Demo.
- **Private reads, private tool calls, and every mutation require a valid, owner-scoped token.**

Every fix below moved the line between *descriptions of the service* and *data*. None of them moved the line for data.

## What the client actually did

My mental model was simple: the client authenticates, then discovers what the server offers. ChatGPT's connector does something else. It probes anonymously before, during, and after the OAuth handoff, and it treats a 401 or 405 at any of those points as a failed connection. Each pull request below fixes one place where the server and the client disagreed.

| PR | Symptom | Cause | Fix |
| --- | --- | --- | --- |
| [#68](https://github.com/Arcadesys/bunch/pull/68) | Connector validation failed | Anonymous list-only discovery calls got 401 | Allow anonymous list-only discovery; reads, private tools, and mutations stay protected |
| [#71](https://github.com/Arcadesys/bunch/pull/71) | OAuth handoff never started | Anonymous `connect_private_system` returned no tool-level OAuth metadata | Return ChatGPT-compatible OAuth metadata from that call; add metadata checks to the public deployment verifier |
| [#74](https://github.com/Arcadesys/bunch/pull/74) | "Could not connect the account" after a successful Auth0 exchange | The next request, `GET /mcp`, got a deliberate 405 | Let the anonymous SSE probe reach the stateless Demo transport |
| [#75](https://github.com/Arcadesys/bunch/pull/75) | Tokens issued for the old hostname would be rejected after the domain move | One accepted audience | Canonical metadata plus an explicit, normalized legacy-audience allow-list |
| [#84](https://github.com/Arcadesys/bunch/pull/84) | Account linking failed with `owner_profile_id_missing` | The profile tool was not discovered until after OAuth | Advertise the profile descriptor during discovery; one shared schema for discovery and execution |
| [#85](https://github.com/Arcadesys/bunch/pull/85) | Private actions missing after install | The catalog depended on a refresh after OAuth | Expose the complete action catalog at discovery; invocations stay protected, and discovery never opens the database |
| [#87](https://github.com/Arcadesys/bunch/pull/87) | Path-aware metadata lookups for `/mcp` found nothing | Metadata was served only at the root well-known path | Serve RFC 9728 path-aware metadata, plus a compatibility alias |
| [#88](https://github.com/Arcadesys/bunch/pull/88) | Connector creation returned HTTP 424 | The anonymous widget probe got 401 | Allow anonymous `resources/read` only for the exact advertised public `ui://` widget URIs |

The first PR in the series, [#66](https://github.com/Arcadesys/bunch/pull/66), merged on September 19 at 16:14 UTC. The last one, #88, merged on September 20 at 17:47 UTC. The next merged change, [#89](https://github.com/Arcadesys/bunch/pull/89), added a private image handoff that runs through the connected ChatGPT app.

## The failure that was my own decision

The most useful failure was #74, because the server was doing what I had told it to do.

Bunch's MCP endpoint is stateless, and it has no server-sent event stream to offer. So I had documented and tested a rule: an anonymous `GET /mcp` stream probe returns `405 Method Not Allowed` instead of sending Demo visitors into a sign-in flow. That seemed correct.

The production evidence showed otherwise. Auth0 completed ChatGPT's authorization-code exchange. ChatGPT's next request was `GET /mcp`, which received the 405 before initialization. ChatGPT then reported that it could not connect the account. My rule was locally sensible and wrong for the real client.

The fix let that anonymous probe reach the stateless Demo transport. The new regression tests check two things: that the probe succeeds, and that it gets there **without touching the private side**:

```ts
assert.equal(streamProbe.status, 200);
assert.equal(streamProbe.headers.get("content-type"), "text/event-stream");
assert.equal(probeAuthorizeCalls, 0);
assert.deepEqual(probeLifecycle.calls, { connect: 1, close: 1 });
```

In the injected-adapter test, the private-server factory throws if it is ever called. A second test sends the same anonymous probe through the real production transport. It asserts a `text/event-stream` response, `Cache-Control: no-store`, and no `WWW-Authenticate` challenge.

## Keeping exceptions narrow

The risk in a series like this is that each fix makes the server a little more open, until the boundary stops meaning anything. Three choices kept that from happening:

- **Exact matches, not patterns.** #88 allows anonymous reads only for the specific public `ui://` widget URIs the server advertises. Arbitrary resource reads still return 401.
- **Descriptors are not data.** #84 and #85 show private tools *by name and schema* during discovery, so the client can install them. Calling them still requires the owner's token, and the discovery path never opens the database.
- **Migration is explicit.** #75 kept the canonical resource URL in metadata and challenges, and accepted the old hostname only through a named allow-list. I also set a merge gate: don't merge until the matching Auth0 audience and environment configuration are confirmed outside the repository.

## What I would do differently

I fixed one symptom per pull request, and that cost eight deploys. Two changes would have shortened the incident:

1. **Capture one complete connection attempt before changing anything.** Every failure in this series was visible in the request sequence of a single ChatGPT connection. I found the failures one at a time because each fix let the client reach the next one.
2. **Write the client's real probe sequence as a conformance test first.** The tests now cover each probe individually. A single test that replays the full anonymous → OAuth → authenticated sequence would have caught most of these failures before production.

## Operating record: tested vs. operated

A failure analysis should be clear about how much it proves, so here is what this record does and does not show.

**Tested.** Each PR lists its verification. Across the series that included focused MCP adapter and authorization tests, type checks, lint, production builds, a disposable-PostgreSQL integration suite (157 tests passing at #71), and a production-mode browser suite (310 passing at #71).

**Deployed and verified.** Merges to `main` deploy to production on Vercel. After a deploy, a credential-free public verifier (`npm run verify:hosted-mcp:public`) checks the live endpoint without creating or changing any production records. It confirms that the protected-resource metadata matches the endpoint and that the authorization server's issuer matches the metadata.

**Operated.** Bunch is in early alpha with about ten active users, and I support them myself.

**Not established.** Bunch has no on-call rotation, no SLA, no published uptime figure, and no independent security audit. The boundary described here is designed, documented, and tested. It has not been certified.

## How the work was divided

I built Bunch with Codex as the implementing agent. My part was the parts that do not delegate well:

- **The invariant:** the security boundary above, written down before anything broke and kept through every fix.
- **Diagnosis:** reading production behavior to find the actual failure, as in #74 and #84.
- **Acceptance criteria:** what each fix had to keep closed, not only what it had to open.
- **Merge gates:** the requirement that each fix pass before it shipped, including the external-configuration gate on #75.

That is the job I'm describing when I say I own the system and supervise the agents that implement it.
