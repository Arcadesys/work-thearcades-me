# Bunch: a context system for continuity across memory gaps

Canonical page: https://work.thearcades.me/work/bunch

## Summary

Bunch is an accessibility-focused context system Austen Tucker-Crowder built to recover working context across memory gaps. It exposes the same underlying records through a web application and an MCP server.

## Austen's role

Product design, architecture, agent-assisted implementation, testing, and delivery.

## System

Web app + MCP server, shared service rules, PostgreSQL.

## Evidence

- One observed catch-up took about 15 seconds where reconstructing the same context manually had previously taken roughly 20 minutes.
- Source code, setup documentation, and the data model are published.
- The web app and MCP server operate on the same explicit records and service rules.

The 15-second result is one personal observation, not a population-wide performance benchmark.

## The problem

Earlier tools could track identity state, but they were much less effective at answering a practical question: what happened while Austen was not present to remember it?

## What Austen owned

Austen owned the product decisions, record model, web and MCP interfaces, and the rules that keep them consistent. AI was used as an implementation tool; Austen retained responsibility for review, testing, and delivery.

## What changed

The product reframed the problem from identity tracking to continuity of context: preserve enough structured information that the next person, session, or interface can keep going.

## Principle

The interface is not the moat. Continuity is.

## Inspect it

- Interactive demo: https://system.thearcades.me/demo
- Technical tour: https://work.thearcades.me/engineering
- Source: https://github.com/Arcadesys/bunch
