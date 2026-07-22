# Copilot Test-Change Guardrails

When making any changes to test files in this repository, follow this rule before considering the work complete:

1. Run the full test suite.
2. Verify there are no collisions, order dependencies, or parallel-execution flakes.
3. Only settle on the change if the full suite passes.

## Required Validation

After editing tests, run:

- `npx playwright test`

If the suite fails, do not finalize the change until:

- failing tests are fixed,
- shared-state collisions are removed,
- and the full suite passes in the current branch.

## Parallel-Safety Expectations

When possible, enforce these patterns:

- Use globally unique test data (avoid timestamp-only IDs).
- Prefer row- or record-scoped assertions over generic text assertions.
- Avoid hidden cross-test coupling through shared mutable state.
- Treat any flaky behavior in parallel runs as a bug to fix, not to ignore.
