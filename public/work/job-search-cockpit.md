# A job-search cockpit where AI can draft but cannot invent

Canonical page: https://work.thearcades.me/work/job-search-cockpit

## Summary

Austen Tucker-Crowder built a private job-search workspace that finds leads, drafts tailored applications, and hands batches to a local MCP worker while preventing the model from inventing résumé facts.

## Austen's role

Product design, workflow architecture, agent-assisted implementation, and guardrail tests.

## System

Next.js, PostgreSQL, a reviewed-claim store, and a scoped MCP worker API.

## Status

Used for Austen's own search. Public design and code; private leads and drafts. No hiring-outcome claim is made.

## Guardrails

- The model selects reviewed claim IDs rather than writing résumé facts.
- Drafting requires the original posting text and a source note.
- The MCP API has no employer submission endpoint.
- Submission counts come only from saved confirmation receipts.
- Résumé-claim edits append immutable versions.
- Requests reserve budget against a monthly cap.
- The workspace is private by default and excluded from public indexing and analytics.

## The problem

AI can help with repetitive job-search work, but unconstrained generation can invent experience that a candidate does not actually have.

## What Austen owned

Austen owned the workflow, reviewed-claim data model, drafting constraints, MCP queue, receipt boundaries, implementation, and guardrail tests.

## What changed

The resulting system allows AI to move quickly inside explicit boundaries while preserving a human-verifiable source of truth for every claim.

## Principle

Let the AI move fast. Make it prove every claim.

## Inspect it

- MCP API design: https://github.com/Arcadesys/work-thearcades-me/blob/main/docs/jobs-mcp-api.md
- Workspace setup notes: https://github.com/Arcadesys/work-thearcades-me/blob/main/docs/private-jobs-foundation.md
- Drafting guardrail tests: https://github.com/Arcadesys/work-thearcades-me/blob/main/lib/job-drafting.test.ts
- Source: https://github.com/Arcadesys/work-thearcades-me
