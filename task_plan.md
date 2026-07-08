# Task Plan

Goal: finish the remaining actionable recommendations from `docs/reviews/2026-07-08-project-review.md` directly on `main`.

## Phases

1. Complete - Reconcile the review document with the current codebase.
2. Complete - Implement privacy/security hardening that is small enough to verify.
3. Complete - Implement accessibility and navigation fixes with browser-facing tests.
4. Complete - Implement testing/release/PWA improvements.
5. Complete - Implement performance worker safety improvements where scoped.
6. Complete - Run verification, commit, and report any genuinely deferred large refactors.

## Decisions

- Keep changes scoped and testable rather than performing broad registry/AppShell rewrites without a migration plan.
- Use subagents for independent read-only audits and integrate their findings after local implementation.
- Treat registry/AppShell decomposition, full worker migration for every heavy tool, and coverage threshold rollout as follow-up roadmap items rather than risky same-day rewrites.

## Errors Encountered

| Error | Attempt | Resolution |
| --- | --- | --- |
| Subagent spawn limit reached | Spawned third explorer for testing/performance audit | Continue that audit locally and use the two running explorers for other dimensions. |
