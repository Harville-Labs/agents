# AGENTS.md

Guide for AI coding agents and the humans reviewing their work in this repository. Harville Labs' org-wide standards ([Harville-Labs/agents](https://github.com/Harville-Labs/agents)) apply too; where they disagree, this file wins.

## What this repo is

<!-- Two or three sentences: what it does, who uses it, how it ships. Link the design docs. -->

## Commands

```sh
<install>                # install dependencies
<check>                  # everything CI runs; must pass before every commit
<test one>               # a single test or package
<dev>                    # run locally
<format>                 # apply formatting
```

## Layout

| Path | Owns | Must not |
|---|---|---|
| `src/...` | | |

## Invariants

These hold the system together. A change that breaks one needs an ADR in `docs/adr/` first.

1. **<Rule.>** <Why it matters.>

## How to make common changes

**<Add a thing.>** <Exact files to touch, in order, and the test to add.>

## Conventions

<!-- Only what differs from or adds to the org standards. -->

## Things not to do

- Don't ...
