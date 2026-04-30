# Deep Interview: HUD-first Codex Examples Visual Renewal

- Profile: standard
- Context type: brownfield
- Final ambiguity: 10%
- Threshold: 20%
- Context snapshot: `.omx/context/codex-examples-ingame-design-20260430T055505Z.md`
- Date: 2026-04-30

## Clarified Intent

The user wants the live JDS game screen to visibly adopt the design language from `codex_examples`, especially after prior prompts failed because the actual in-game screen did not change. The first pass should prove the pipeline works by updating the real in-game HUD, not only static reference HTML.

## Brownfield Evidence

- `DESIGN.md` identifies `codex_examples/04_in_game_hud_frontend_design.html` as the current in-game HUD reference.
- `codex_examples/*.html` are reference/mockup files and are not automatically wired into the Phaser game.
- The live in-game HUD is currently created in `src/scenes/GameScene.ts` with Phaser `Container`, `Rectangle`, and `Text` objects.
- `src/ui/runtimeOverlay.ts` builds HUD text view-model lines.
- `src/ui/runtimeOverlayDom.ts` and `src/ui/runtimeOverlay.css` currently cover quest toast and boss warning DOM alerts, not the main HUD.

## Desired Outcome

A HUD-first implementation where the actual running `GameScene` HUD resembles `codex_examples/04_in_game_hud_frontend_design.html` in structure, color, and terminal/IDE mood while preserving live combat readability.

## In Scope

- Update the live in-game HUD only.
- Use the visual language from `04_in_game_hud_frontend_design.html`:
  - terminal/IDE dark panels
  - compact top HUD sections
  - HP/EXP-style meters where current data allows
  - stage/timer/weapon/event/boss status presentation
  - VS Code-like palette from `DESIGN.md`
- Compare the resulting live game screenshot against the reference HTML/screenshot qualitatively.
- Leave a follow-up checklist/plan for improving other screens against their `codex_examples` references.

## Out of Scope / Non-goals

- Do not change player, enemy, projectile, or arena visuals in this first pass.
- Do not change gameplay logic: HP, kills, events, boss spawning, weapon behavior, cooldown math, movement, damage, and stage progression must remain functionally unchanged.
- Do not force a 100% static HTML clone if that would reduce combat readability.
- Do not complete the entire `codex_examples` screen set in this first pass.

## Decision Boundaries

Codex may decide practical HUD implementation details without further confirmation, including:

- Phaser-only HUD refinement versus a small DOM overlay if it remains safe and non-intercepting.
- Simplifying static reference elements for live gameplay readability.
- Reusing existing theme tokens and view-model helpers.
- Adding or adjusting tests that lock the HUD view-model or overlay behavior.

Codex should not decide without confirmation:

- Broad redesign of arena, monsters, weapons, or core gameplay visuals.
- New dependencies.
- Changes to game mechanics or progression rules.
- Committing or pushing to GitHub.

## Constraints

- Follow `DESIGN.md` terminal/IDE visual direction.
- Keep HUD compact and readable during combat.
- Preserve existing gameplay logic.
- Keep changes scoped and reversible.
- Use TDD or regression checks where feasible.
- Verify before completion.

## Testable Acceptance Criteria

1. Live `GameScene` HUD visibly resembles `codex_examples/04_in_game_hud_frontend_design.html` in structure, palette, and terminal/IDE feel.
2. A Playwright/browser screenshot of the running in-game scene is captured or otherwise inspected against the reference.
3. HUD remains readable and does not obscure core combat space more than the current implementation.
4. Gameplay values and logic remain unchanged.
5. `npm test` passes.
6. `npm run build` passes.
7. `npm run e2e` is run when practical; any limitation must be reported explicitly.
8. A follow-up checklist exists for the other `codex_examples` screens and their similarity gaps.

## Likely Touchpoints

- `src/scenes/GameScene.ts`
- `src/ui/runtimeOverlay.ts`
- `src/ui/runtimeOverlayDom.ts`
- `src/ui/runtimeOverlay.css`
- `src/ui/theme.ts`
- `tests/runtimeOverlay.test.ts`
- `tests/e2e/boot.spec.ts`

## Follow-up Screen Checklist

After HUD-first is complete, compare and improve these separately:

- `01_start_screen_frontend_design.html` vs menu/start screen
- `02_stage_select_frontend_design.html` vs stage selection, if implemented
- `03_weapon_select_frontend_design.html` vs weapon select
- `05_level_up_upgrade_modal_frontend_design.html` vs quick-fix/level-up overlay
- `06_event_quest_popup_frontend_design.html` vs event toast/quest popup
- `07_boss_warning_frontend_design.html` vs boss warning overlay
- `08_stage_clear_result_frontend_design.html` vs stage clear result
- `09_game_over_frontend_design.html` vs game over result
- `10_collection_codex_frontend_design.html` vs codex/collection overlay
