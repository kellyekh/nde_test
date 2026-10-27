---
name: release-verification
description: Enforce repository verification gates whenever implementing, fixing, refactoring, or preparing code for review, merge, or deployment. Use before describing code changes as finished, ready, verified, or safe to merge.
---

# Release verification

Use targeted tests for rapid development, but never treat targeted success,
test discovery, linting, type checking, or static analysis as proof that the
repository is ready to merge.

## Completion gates

Use these terms consistently:

1. **Implemented** means the relevant targeted tests pass.
2. **Ready for review** means the exact CI command passes locally from the
   completed working tree.
3. **Ready to merge** means that same command passes in GitHub against the same
   commit that will be merged.

For this repository, the required E2E command is:

```bash
CI=true npm run test:ci
```

This is one unified run. Its Playwright configuration starts the Bambora site
on port 8080 and the Stripe site on port 8082, and the run includes the real
Bambora and Stripe payment tests. Use only the configured non-production test
sites, processor sandboxes, contacts, events, and receipt delivery.

Run the full gate again after any of these occur:

- merging or rebasing `dev` or another integration branch;
- changing shared routing, payment code, test fixtures, test configuration, or
  CI configuration;
- resolving a merge conflict;
- making a fix in response to a failure from the full gate.

## Reporting requirements

- State exactly which command ran and whether it passed.
- Distinguish targeted verification from full-suite verification.
- If the full command has not run or did not pass, say that verification is
  incomplete and do not call the branch ready for review or merge.
- `playwright --list` proves discovery only. It never proves behavior.
- Do not assume a GitHub rerun contains local changes; verify that the workflow
  and code changes are committed and pushed first.
- A GitHub pass applies only to the commit SHA that the workflow tested.

## E2E integrity

Follow the repository `e2e` and `tdd` skills. E2E tests must exercise the real
application workflow without mocked application APIs, databases, payment
processors, browser behavior, or email/receipt delivery. Tests that replace
those boundaries are integration or component tests and must not be presented
as end-to-end coverage.

Do not weaken, skip, quarantine, or rewrite a failing test merely to make the
gate green. Determine whether it reveals an application defect, stale fixture,
environment problem, or invalid test expectation, then fix the correct layer.
