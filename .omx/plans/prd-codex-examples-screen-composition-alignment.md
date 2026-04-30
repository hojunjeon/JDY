# PRD: Codex Examples Screen Composition Alignment Closeout

## Problem
Implemented JDS core screens need to visibly share the `codex_examples/01` through `10` IDE/debugger composition while preserving gameplay readability.

## Scope
Continue the checked plan from Task 3 through Task 6 only:
1. Quick Fix, Stage Clear, and Game Over overlays gain IDE shell statusbar landmarks and stable layout.
2. Runtime HUD remains compact and runtime alerts get non-blocking scanline polish.
3. Codex overlay gains shared shell selectors/attributes and visual polish.
4. E2E screenshot coverage and plan closeout are verified.

## Out of Scope
- New stages, combat systems, weapon stat mechanics, UI frameworks, commits, or pushes.

## Acceptance Criteria
- Focused unit tests pass for decision, runtime, and codex overlays.
- `npm test`, `npm run build`, and `npm run e2e` pass.
- Required screenshots exist and are inspected at 1440x900.
- Plan document checkboxes and closeout note reflect completed work.
- Existing dirty work is preserved.
