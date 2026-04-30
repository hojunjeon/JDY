# RALPLAN Draft: HUD-first Codex Examples Visual Renewal

## Requirements Summary

Implement a first-pass visual renewal of the live in-game HUD so `GameScene` resembles `codex_examples/04_in_game_hud_frontend_design.html`, while preserving gameplay behavior and leaving other screens as a follow-up similarity checklist.

Evidence anchors:

- `DESIGN.md` defines the in-game HUD reference as `codex_examples/04_in_game_hud_frontend_design.html` and requires compact debug-console HUD readability.
- `src/scenes/GameScene.ts:74-82` currently builds a single compact Phaser HUD panel with background, status strip, and text lines.
- `src/scenes/GameScene.ts:268-286` updates HUD text from `buildRuntimeHudView` without changing gameplay values.
- `src/ui/runtimeOverlay.ts:21-29` currently exposes compact text-only HUD view data.
- `tests/runtimeOverlay.test.ts:5-48` locks compact HUD copy and line lengths.
- `tests/e2e/boot.spec.ts:21-25` already captures `test-results/runtime-overlay-1440x900.png` after entering gameplay.
- Reference HTML shows the target HUD structure: reusable panels/meters (`codex_examples/04_in_game_hud_frontend_design.html:234-278`), top HUD sections (`617-641`), side debug/boss sections (`644-679`), bottom weapon/event area (`683-718`), and status bar (`720-724`).
- `src/systems/WeaponSystem.ts:4-8` exposes owned weapon `level` and `cooldownLeftMs`, and `src/systems/WeaponSystem.ts:37-39` exposes `getOwned()` for read-only HUD display data.

## RALPLAN-DR Summary

### Principles

1. Change the live gameplay HUD, not the static reference files.
2. Preserve gameplay logic and data flow; visual state must be derived from existing values.
3. Prefer Phaser HUD for frame-updated combat state, matching `DESIGN.md` DOM/Phaser split.
4. Use the reference as visual direction, not a pixel-perfect clone.
5. Verify both function and appearance before claiming completion.

### Decision Drivers

1. **Actual screen impact:** previous attempts failed because reference HTML was not connected to `GameScene`.
2. **Combat readability:** HUD must not hide core enemy/projectile patterns, especially on 1440x900 and a smaller viewport smoke check.
3. **Regression safety:** visual renewal must not alter gameplay calculations, weapon cooldown math, or input flow.

### Viable Options

#### Option A ? Recommended: Phaser HUD componentization inside `GameScene`

- Approach: Keep the HUD in Phaser, but replace the single text panel with small structured panels/meters and helper methods.
- Pros: Matches `DESIGN.md` guidance for frame-updated HUD; low input-interception risk; no dependency or major architecture change; direct impact on live screenshot.
- Cons: More verbose Phaser object management; CSS reference cannot be reused directly.

#### Option B ? DOM HUD overlay for main HUD

- Approach: Create a DOM overlay for the main HUD using CSS closer to the reference HTML.
- Pros: Easier visual parity with HTML; CSS iteration is faster.
- Cons: Conflicts with `DESIGN.md` preference that combat HUD stay in Phaser; pointer/keyboard interception and per-frame update cleanup risks.

#### Option C ? View-model-first then visual pass

- Approach: Expand `runtimeOverlay.ts` into a richer view model first, then render it in Phaser.
- Pros: Strong testability and separation; easier to prove no gameplay logic changed.
- Cons: May delay visible improvement and adds model shape churn if overdone.

Recommendation: **Option A with a constrained amount of Option C**. Keep rendering in Phaser but enrich `buildRuntimeHudView` only enough to support meters/labels from already-available state. Treat the reference ?EXP? affordance as `Upgrade`/`Kills` progress using `kills / nextUpgradeAtKills`; do not label it `EXP` unless a true EXP system exists later.

## Planned Architecture

## Fixed HUD Data Mapping

Use only existing runtime state. Do not create new progression mechanics.

| HUD affordance | Source | Display rule | Meter rule |
| --- | --- | --- | --- |
| HP | `this.hp`, `maxHp` passed to `buildRuntimeHudView` | `HP ceil(hp) / maxHp` | `clamp(hp / maxHp, 0, 1)` |
| Upgrade/Kills progress | `this.kills`, `this.nextUpgradeAtKills` | label as `Upgrade` or `Kills`, not `EXP` unless a true EXP system is added later | `clamp(kills / nextUpgradeAtKills, 0, 1)` for current quick-fix progress |
| Timer | `this.elapsedSec` | `MM:SS` | no meter |
| Stage | `stages[0].title` | stage title/subtitle text | no meter |
| Selected weapon | `weapons[this.selectedWeapon].codeName` and selected `weaponSystem.getOwned()` row | weapon filename/code label plus `Lv. n` | no meter required |
| Cooldown | selected owned weapon `cooldownLeftMs` plus selected weapon config `cooldownMs` | `cooldown 0.62s` | use denominator `max(140, config.cooldownMs * (1 - (level - 1) * 0.08))`; if this duplication feels risky during implementation, show label only and skip cooldown meter |
| Event state | `eventSystem.getState(...)` summaries | compact event row (`q1 run 12/24`, etc.) | existing progress value where available |
| Boss warning/boss HP | `this.boss` and `stages[0].boss` | boss name/HP when active, otherwise next warning/hint text | `clamp(boss.hp / boss.maxHp, 0, 1)` only when boss exists |

Normal gameplay screenshot requirements should not depend on forcing an active boss or DOM alert. For the first pass, require the persistent event summary row and optional boss slot/hint to be visible. A separate forced boss/event screenshot can be added later, but it is not required for HUD-first completion.

- Keep `GameScene` as the owner of live HUD objects.
- Extract HUD creation/update into private helper methods inside `GameScene` first; only extract a new module if implementation becomes large enough to justify it.
- Expand `buildRuntimeHudView` from text-only lines to include stable, testable presentation values such as formatted HP, HP ratio, elapsed label, weapon label, event summaries, boss ratio, fallback hint, and optional owned-weapon display rows.
- Map reference EXP/cooldown affordances only to existing state: HP from `this.hp`, timer from `this.elapsedSec`, selected weapon from `weapons[this.selectedWeapon]`, weapon level/cooldown from `weaponSystem.getOwned()`, boss ratio from `this.boss`, and event status from `eventSystem`. Do not invent a new EXP stat.
- Reuse `uiColors`, `uiDepths`, `uiFonts`, and `uiLayout` from `src/ui/theme.ts` rather than introducing new constants.
- Replace loose HUD fields with a typed private HUD object/group, for example `private hud!: RuntimeHudObjects`, so adding meters/labels does not scatter many independent properties across `GameScene`.
- Keep `runtimeOverlayDom.ts/css` focused on quest toast and boss warning unless a later iteration explicitly chooses DOM HUD.

## Implementation Steps

1. **Lock view-model expectations first**
   - Update/add tests in `tests/runtimeOverlay.test.ts` for HP ratio, upgrade/kills ratio, formatted timer, weapon label, boss state, event labels, optional weapon level/cooldown display, and compact hint copy.
   - Keep existing line-length/compactness assertions or replace them with equivalent assertions for panel labels.

2. **Refine runtime HUD view model**
   - Update `src/ui/runtimeOverlay.ts` to return structured values needed by the Phaser HUD.
   - Avoid importing Phaser or touching gameplay systems.
   - Ensure view model remains pure and unit-testable.

3. **Replace the single HUD panel with reference-inspired Phaser panels**
   - Update `src/scenes/GameScene.ts:74-82` into a small top/edge HUD layout resembling the reference: player runtime panel, timer panel, selected weapon panel, and compact event/boss/hint text.
   - Use a typed `RuntimeHudObjects`-style shape for created text and meter objects.
   - Add Phaser rectangle bars/meters for HP, upgrade/kills progress, and boss when present; use cooldown meter only if the denominator is derived from selected weapon config and level as specified in the mapping table, otherwise render cooldown as label-only.
   - Keep all HUD objects at `uiDepths.hud` and `setScrollFactor(0)`.
   - Do not change player/enemy/projectile/arena visuals.

4. **Update HUD refresh logic without changing gameplay values**
   - Update `src/scenes/GameScene.ts:268-286` to set text and meter widths/fills from the structured view model.
   - Continue deriving data from `this.hp`, `this.kills`, `this.elapsedSec`, selected weapon, `eventSystem`, and `boss` only.

5. **Preserve and use visual evidence**
   - Run the existing e2e path in `tests/e2e/boot.spec.ts:21-25` to regenerate `test-results/runtime-overlay-1440x900.png`.
   - Compare qualitatively against `codex_examples/04_in_game_hud_frontend_design.html`, checking structure, palette, compactness, and readability rather than pixel-perfect match.
   - Required screenshot checklist: multiple top/edge panels visible, HP meter visible, timer visually isolated, selected weapon label visible, event or boss warning state readable, and central play area remains unobscured.
   - Add a mandatory small-viewport smoke screenshot/check at 390x844 and save `test-results/runtime-overlay-390x844.png`. Pass criteria: HP/timer/weapon text remains readable and the HUD does not dominate the central combat area. If Playwright cannot run in the environment, document the e2e environment blocker explicitly.

6. **Add follow-up screen similarity checklist**
   - Add or update a planning/checklist document, not implementation, for remaining `codex_examples` screens.
   - This checklist must not block HUD-first completion and must not expand implementation scope.
   - Include start, stage select, weapon select, quick-fix, event, boss warning, result, game over, and codex/collection screens.

## Acceptance Criteria

- `GameScene` runtime HUD visibly adopts the `04_in_game_hud_frontend_design.html` panel/meter/terminal style.
- HUD is present in the actual gameplay screenshot, not only in static HTML.
- Gameplay logic remains unchanged: no edits to spawn, damage, weapon math, movement, event triggers, boss progression, or run-end conditions beyond passing existing data into HUD view code.
- HUD remains compact and does not obscure central combat space at 1440x900.
- A small-viewport readability check is captured at 390x844 as `test-results/runtime-overlay-390x844.png`, unless the e2e environment itself is unavailable and that blocker is documented.
- `tests/runtimeOverlay.test.ts` covers the structured HUD view model, including existing-state-only weapon level/cooldown/progress labels if used.
- `npm test` passes.
- `npm run build` passes.
- `npm run e2e` runs and updates/captures `test-results/runtime-overlay-1440x900.png`, or any environment limitation is documented.
- Follow-up screen similarity checklist exists for remaining `codex_examples` screens.

## Risks and Mitigations

- **Risk:** HUD becomes too large and hides enemies.
  - Mitigation: keep first pass mostly top/edge anchored and verify the 1440x900 screenshot.
- **Risk:** Phaser HUD code becomes noisy.
  - Mitigation: private helper methods first; extract only if repetition is clear.
- **Risk:** Visual-only work accidentally changes game behavior.
  - Mitigation: restrict gameplay source edits to HUD create/update sections and run existing systems tests.
- **Risk:** Screenshot comparison becomes subjective.
  - Mitigation: checklist against concrete reference traits: dark panels, status color, HP/boss meters, timer block, selected weapon label, event/debug copy, compact placement.

## Verification Steps

1. `npm test`
2. `npm run build`
3. `npm run e2e`
4. Inspect `test-results/runtime-overlay-1440x900.png` against `codex_examples/04_in_game_hud_frontend_design.html` using the concrete screenshot checklist.
5. Run/capture a mandatory small-viewport smoke check at 390x844 (`test-results/runtime-overlay-390x844.png`), or document the e2e environment blocker.
6. Confirm the normal HUD screenshot checks the persistent event summary row; do not require forced boss/event alert state for first-pass completion.
7. Confirm no gameplay logic files/sections changed outside HUD presentation paths.

## ADR

### Decision

Use a Phaser-rendered, reference-inspired structured HUD for the first pass, with only enough view-model enrichment in `runtimeOverlay.ts` to make the rendering testable.

### Drivers

- Live gameplay HUD changes must be visible in actual screenshots.
- Combat HUD updates every frame and should follow the project DOM/Phaser split.
- The user explicitly chose HUD-first and gameplay-preserving scope.

### Alternatives Considered

- DOM main HUD overlay: rejected for first pass because it adds input/cleanup risk and conflicts with Phaser HUD guidance.
- Static HTML edits only: rejected because it does not affect the running game.
- Whole-screen renewal: deferred because the user selected HUD-first.

### Why Chosen

This path is the smallest change that directly fixes the previous failure mode while preserving gameplay safety and giving clear screenshot evidence.

### Consequences

- Phaser code will become somewhat more structured/verbose.
- Exact CSS parity is not expected.
- EXP-like display must be represented only by existing kill/upgrade/weapon state, or omitted/deferred with clear labeling.
- Follow-up work remains for other screens.

### Follow-ups

- Run a separate similarity pass for remaining `codex_examples` screens.
- Consider extracting a `RuntimeHudRenderer` only after the first HUD pass proves its shape.


## Final Artifact Split

Save two execution artifacts after consensus:

- `prd-hud-first-codex-examples.md`: requirements, scope, non-goals, architecture, RALPLAN-DR summary, ADR, implementation steps, risks, staffing guidance, and follow-up screen checklist.
- `test-spec-hud-first-codex-examples.md`: unit tests, e2e screenshots, 1440x900 visual checklist, mandatory 390x844 small-viewport check, build/test commands, and manual review criteria.

## Available-Agent-Types Roster

- `explore`: repo/file/symbol mapping and impact surface checks.
- `designer`: UI/UX and visual hierarchy review against `DESIGN.md` and the reference.
- `executor`: bounded implementation/refactoring.
- `test-engineer`: unit/e2e test shape and screenshot evidence review.
- `verifier`: completion evidence, build/test/e2e validation.
- `code-reviewer`: final broad code review if the diff grows beyond a small HUD pass.

## Follow-up Staffing Guidance

### `$ralph` sequential path ? recommended

Use one persistent owner because the implementation scope is narrow and needs tight test/screenshot iteration.

Suggested command:

```text
$ralph .omx/plans/prd-hud-first-codex-examples.md
```

Suggested lane order:

1. `executor` medium: implement view-model tests and Phaser HUD changes.
2. `designer` high or visual review pass: compare screenshot against reference and `DESIGN.md`.
3. `verifier` high: run `npm test`, `npm run build`, `npm run e2e`, inspect artifacts.

### `$team` path ? optional if visual iteration expands

Use only if HUD implementation becomes blocked or if the user expands the scope to several screens.

Suggested command:

```text
$team .omx/plans/prd-hud-first-codex-examples.md
```

Suggested team lanes:

- Worker 1 / executor: `src/ui/runtimeOverlay.ts` and `tests/runtimeOverlay.test.ts`.
- Worker 2 / executor: `src/scenes/GameScene.ts` HUD create/update sections only.
- Design reviewer: screenshot/reference comparison.
- Verifier: build/test/e2e evidence.

## Team Verification Path

- Team proves no lane changed gameplay logic outside HUD presentation.
- Team captures/updates `test-results/runtime-overlay-1440x900.png`.
- Ralph or verifier does final sequential validation: `npm test`, `npm run build`, `npm run e2e`, screenshot check, and risk summary.
