---
name: control-ui
description: Drive a web, browser, or Electron UI the way a user does and capture proof that it works. Starts the app, clicks and types through the real flow with Playwright or the harness's browser tool, and saves screenshots, console errors, and network failures. Use when shipping or fixing UI, to reproduce a UI bug, or for "check it in the browser", "drive the UI", or "show it working".
---

# Control UI

Prove a UI change by using it in a real browser, the way a user would, and keeping what you saw. A passing component test is not this proof. If the project has its own `verify-*` skill or app harness, use that first and fall back to this skill only for what it doesn't cover.

## Pick the driver

1. **The harness's own browser tool**, when it has one. It's fastest for a few steps and shows the user what you see.
2. **Playwright**, for anything you'll repeat, any flow longer than a few steps, or any check you want to keep. Use the project's Playwright version if it has one. Write throwaway scripts outside the repository.
3. **Electron apps**: Playwright's `_electron.launch()` drives the real app window. Point it at the built app from your working tree.

## Before you start

- **Run the app from your working tree** with the project's dev command. Read the port it actually printed; many servers move to the next free port.
- **Isolate state.** Use a fresh browser context or profile and the project's seed or test data. Never sign in with the user's real accounts or use real customer data.
- **Avoid real cost and side effects.** Use the project's mock or sandbox mode for payments, email, and paid APIs. Ask before anything that would reach a shared or production system.

## Drive the flow

1. **Do what a user does.** Navigate, click, type, and submit through the visible UI. Locate elements by role and accessible name (`getByRole('button', { name: 'Save' })`), not by CSS classes. A flow you can't drive by role is an accessibility bug worth reporting.
2. **Wait for state, not time.** Wait for the text, element, or network response that marks the step done. Never use fixed sleeps.
3. **Check the result where it lives.** After a save, reload and confirm the data persisted. After a delete, confirm it's gone from the list and the API.
4. **Watch the console and network.** Record console errors and failed or 4xx/5xx requests during the flow. A clean screenshot with a console error is not a pass.
5. **Cover the edges the change touches**: the empty state, the error state, a slow or failed request, a narrow (mobile) viewport, and keyboard-only use when the change is interactive.
6. **Check dark and light** when the change touches color or theming.

## Evidence

Save screenshots at each meaningful step (before and after, for a bug fix) to a directory outside the repository. Use a device scale factor of 2 for screenshots a person will look at. Record a video or trace only when the flow is long or the bug is timing-dependent.

## Report

List the steps you drove, link the screenshots, and quote any console errors or failed requests. Before and after for a bug fix. Say what you didn't cover (a browser, a viewport, a real service, a signed-in role) and why.
