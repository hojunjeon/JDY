# Test Spec: HUD-first Codex Examples Visual Renewal

## Purpose

Verify that the live `GameScene` HUD adopts the `codex_examples/04_in_game_hud_frontend_design.html` visual direction while preserving gameplay behavior.

## Source Artifacts

- PRD: `.omx/plans/prd-hud-first-codex-examples.md`
- Source spec: `.omx/specs/deep-interview-hud-first-codex-examples.md`
- Reference: `codex_examples/04_in_game_hud_frontend_design.html`

## Unit Test Plan

### File: `tests/runtimeOverlay.test.ts`

Add/update tests for `buildRuntimeHudView`:

- HP display rounds/clamps safely: `HP ceil(hp) / maxHp`.
- HP ratio clamps to `[0, 1]`.
- Upgrade/Kills progress uses `kills / nextUpgradeAtKills`, labeled `Upgrade` or `Kills`, not `EXP`.
- Timer formats as `MM:SS`.
- Selected weapon label uses `weapons[this.selectedWeapon].codeName` input.
- Selected owned weapon display can show `Lv. n` and cooldown seconds when provided.
- Boss state returns boss name, HP copy, and ratio only when boss exists.
- Event summary remains compact enough for gameplay HUD use.
- Fallback hint remains available when no boss is active.

## E2E / Screenshot Plan

### Existing 1440x900 gameplay screenshot

Use/update `tests/e2e/boot.spec.ts:21-25` to capture:

- `test-results/runtime-overlay-1440x900.png`

Pass criteria:

- Multiple top/edge HUD panels are visible.
- HP meter is visible.
- Upgrade/Kills progress is visible if implemented; it is not mislabeled as `EXP` unless a real EXP system exists.
- Timer is visually isolated and readable.
- Selected weapon label is visible.
- Persistent event summary row is visible.
- Boss slot/hint is visible when no boss is active, or boss meter is visible when boss is active naturally.
- Central combat area remains unobscured.
- Visual language matches the reference direction: dark terminal panels, VS Code-like palette, compact debug-console feel.

### Mandatory small viewport screenshot

Add an e2e viewport check:

- viewport: `390x844`
- artifact: `test-results/runtime-overlay-390x844.png`

Pass criteria:

- HP, timer, selected weapon, and at least one event/hint line remain readable.
- HUD density reduces or stays edge-anchored enough that central combat space is not dominated.
- No text overlap is visible in the main HUD.

If Playwright/e2e cannot run in the environment, report the environment blocker explicitly. Do not silently skip this criterion.

## Gameplay Regression Guard

During implementation review, confirm the diff does not alter gameplay logic in these areas:

- spawn timing or enemy selection
- player movement
- projectile movement/damage
- enemy contact damage
- event trigger timing
- boss spawning/progression
- weapon cooldown math, unless only read for display
- run-end conditions

Allowed gameplay-scene edits are limited to HUD object creation, HUD view-model inputs, and HUD update/rendering.

## Verification Commands

Run in order:

```text
npm test
npm run build
npm run e2e
```

Expected evidence:

- `npm test` passes.
- `npm run build` passes.
- `npm run e2e` passes or reports a concrete environment blocker.
- `test-results/runtime-overlay-1440x900.png` exists and satisfies the visual checklist.
- `test-results/runtime-overlay-390x844.png` exists and satisfies the small-viewport checklist, unless e2e is blocked.

## Manual Visual Review Checklist

Compare the live screenshots against `codex_examples/04_in_game_hud_frontend_design.html`:

- Terminal/IDE dark panel mood is recognizable.
- Color use follows `DESIGN.md` palette: teal, blue, green, yellow, orange, red, dim/white text.
- HUD is compact and tool-like, not a marketing card.
- Important combat state is visible without reading long paragraphs.
- Reference is simplified where needed for combat readability.
- No DOM overlay intercepts gameplay input.

## Completion Rule

The HUD-first pass is complete only when both are true:

1. Functional verification passes (`npm test`, `npm run build`, and `npm run e2e` or documented e2e blocker).
2. Screenshot review shows the actual live in-game HUD—not only reference HTML—matches the agreed visual direction closely enough for a first pass.
