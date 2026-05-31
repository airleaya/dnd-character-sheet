# Documents And Workflow Index

## Purpose

This page explains which project documents are authoritative for different maintenance tasks. The repo has long-lived planning and audit files; keep their roles clear so future work does not duplicate or contradict itself.

## Current Primary Documents

- `README.md` - public project overview, setup, architecture summary, and document links.
- `PROJECT_INDEX.md` - root navigation entry for this index group.
- `docs/index/` - maintained subsystem index for development and AI handoff.
- `TODOLIST.md` - current and future work, status notes, version planning, and unresolved cleanup tasks.
- `UPDATE_LOG.md` - completed work history and verification records.
- `FRONTEND_DESIGN_AUDIT.md` - frontend design map, UX risks, and visual-system audit.
- `CSS_COLOR_USAGE_AUDIT.md` - historical CSS color usage baseline before tokenization.
- `CODE_HEALTH_PLAN.md` - historical and governance-oriented code health plan.

## Historical Or Specialized Documents

- `ATTACK_PANEL_PLAN.md` and `ATTACK_PANEL_DATA_REQUEST.md` - attack panel planning history.
- `ITEM_LIBRARY_WORKFLOW.md` - item library workflow notes.
- `RELEASE_NOTES_v0.14.21.md` - old release note draft; treat as historical unless regenerated.
- `src/data/libraries/structured/*.md` - structured item migration and review notes.
- `scripts/README.md` - script-specific notes.

## Version And Work Log Rules

- When rolling a version, update `package.json`, `package-lock.json`, `README.md`, `TODOLIST.md`, and `UPDATE_LOG.md`.
- When user says to submit/commit the work, project convention means commit and push.
- Keep `TODOLIST.md` for active or pending state; move completed implementation summaries into `UPDATE_LOG.md`.
- Keep verification commands with the completed update entry when tests/builds were run.
- If changing architecture or subsystem ownership, update the relevant `docs/index/` page.

## Documentation Risks

- Old documents may contain stale test counts, old storage paths, or pre-0.15 architecture notes.
- Do not treat generated build output or old release notes as current source of truth.
- Prefer adding a concise current-state note over rewriting long historical records unless the user asks for cleanup.
