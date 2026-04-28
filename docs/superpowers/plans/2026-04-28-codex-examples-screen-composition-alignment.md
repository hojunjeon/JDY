# Codex Examples Screen Composition Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strengthen the implemented JDS core screens so they visibly follow the `codex_examples/01` through `10` IDE/debugger screen composition.

**Architecture:** Keep the current DOM/Phaser split: DOM for layout-heavy screens and Phaser for always-on combat HUD. Tighten existing overlay modules instead of introducing a new framework. Use tests and screenshots to lock the shared shell structure, readable copy, and gameplay-safe HUD sizing.

**Tech Stack:** Phaser 3, TypeScript, vanilla DOM, CSS, Vitest, Playwright, existing `src/ui/theme.ts` tokens.

---

## Reference And Scope

Read before implementation:

- `DESIGN.md`
- `docs/superpowers/specs/2026-04-28-codex-examples-screen-composition-design.md`
- `codex_examples/01_start_screen_frontend_design.html`
- `codex_examples/02_stage_select_frontend_design.html`
- `codex_examples/03_weapon_select_frontend_design.html`
- `codex_examples/04_in_game_hud_frontend_design.html`
- `codex_examples/05_level_up_upgrade_modal_frontend_design.html`
- `codex_examples/08_stage_clear_result_frontend_design.html`
- `codex_examples/09_game_over_frontend_design.html`
- `codex_examples/10_collection_codex_frontend_design.html`

This plan improves implemented core screens. It does not add new stages, new combat systems, or new weapon stat mechanics.

## File Map

- Modify: `src/ui/menuOverlay.ts` - menu HTML for Start, Stage Select, Weapon Select.
- Modify: `src/ui/menuOverlay.css` - shared menu shell, action rows, preview panels, responsive constraints.
- Modify: `tests/menuOverlay.test.ts` - menu composition and copy regression tests.
- Modify: `src/ui/runDecisionOverlay.ts` - Quick Fix, Stage Clear, Game Over shell markup.
- Modify: `src/ui/runDecisionOverlay.css` - decision/result shell styling.
- Modify: `tests/runDecisionOverlay.test.ts` - decision/result structure tests.
- Modify: `src/ui/runtimeOverlay.ts` - compact HUD copy when needed.
- Modify: `src/ui/runtimeOverlay.css` - event/boss alert composition polish.
- Modify: `tests/runtimeOverlay.test.ts` - runtime text expectations.
- Modify: `src/ui/codexOverlay.ts` - codex shell details and labels.
- Modify: `src/ui/codexOverlay.css` - codex scanline/background and entry grid polish.
- Modify: `tests/codexOverlay.test.ts` - codex shell and interaction tests.
- Modify: `tests/e2e/boot.spec.ts` - screenshot coverage and visual smoke checks.
- Modify: `docs/superpowers/plans/2026-04-28-codex-examples-screen-composition-alignment.md` - mark tasks complete and record verification.

---

### Task 1: Lock Menu Composition And Fix Broken Copy

**Files:**

- Modify: `tests/menuOverlay.test.ts`
- Modify: `src/ui/menuOverlay.ts`

- [ ] **Step 1: Write the failing menu composition tests**

Add this test block to `tests/menuOverlay.test.ts` inside the existing `describe('menuOverlay', ...)`:

```ts
it('uses the codex_examples shell roles on all menu screens', () => {
  const startHtml = renderMenuOverlayHtml(createMenuFlowState());
  const stageHtml = renderMenuOverlayHtml({ ...createMenuFlowState(), screen: 'stage-select' });
  const weaponHtml = renderMenuOverlayHtml({ ...createMenuFlowState(), screen: 'weapon-select' });

  for (const html of [startHtml, stageHtml, weaponHtml]) {
    expect(html).toContain('jds-titlebar');
    expect(html).toContain('jds-sidebar');
    expect(html).toContain('jds-center');
    expect(html).toContain('jds-statusbar');
  }

  expect(startHtml).toContain('교실 터미널에서 runaway error를 정리하고 첫 boss trace까지 버티세요.');
  expect(stageHtml).toContain('Python 기본 문법 오류와 첫 이벤트를 처리하는 디버거 생존 루트입니다.');
  expect(weaponHtml).toContain('jds-effect-stack');
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```powershell
npm test -- tests/menuOverlay.test.ts
```

Expected: FAIL if the broken Korean copy or `jds-effect-stack` preview markup is still missing.

- [ ] **Step 3: Update Start and Stage copy**

In `src/ui/menuOverlay.ts`, replace the broken Start paragraph inside `renderStart()` with:

```html
<p>교실 터미널에서 runaway error를 정리하고 첫 boss trace까지 버티세요.</p>
```

In `renderStageSelect()`, replace the broken Stage 1 briefing paragraph with:

```html
<p>Python 기본 문법 오류와 첫 이벤트를 처리하는 디버거 생존 루트입니다.</p>
```

- [ ] **Step 4: Add a stronger weapon effect preview structure**

In `renderWeaponSelect()`, replace the current preview article:

```ts
<article class="jds-preview"><span>effect.preview</span><strong>${selected.codeName}</strong><p>${selected.description}</p></article>
```

with:

```ts
<article class="jds-preview">
  <span>effect.preview</span>
  <strong>${selected.codeName}</strong>
  <div class="jds-effect-stack" aria-hidden="true">
    <i></i><i></i><i></i>
  </div>
  <p>${selected.description}</p>
</article>
```

- [ ] **Step 5: Run the focused test to verify it passes**

Run:

```powershell
npm test -- tests/menuOverlay.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

Run:

```powershell
git add src/ui/menuOverlay.ts tests/menuOverlay.test.ts
git commit -m "feat: strengthen menu composition copy"
```

---

### Task 2: Tighten Menu Shell Styling

**Files:**

- Modify: `src/ui/menuOverlay.css`
- Modify: `tests/e2e/boot.spec.ts`

- [ ] **Step 1: Add visual smoke assertions to the menu e2e flow**

In `tests/e2e/boot.spec.ts`, inside `test('DOM menu flow reaches gameplay', ...)`, after the start screen visibility assertion, add:

```ts
await expect(page.locator('.jds-menu-root .jds-sidebar').first()).toBeVisible();
await expect(page.locator('.jds-menu-root .jds-center')).toBeVisible();
await expect(page.locator('.jds-menu-root .jds-statusbar')).toBeVisible();
await expect(page.locator('.jds-menu-root')).not.toContainText('援');
await expect(page.locator('.jds-menu-root')).not.toContainText('湲');
```

After the weapon screen visibility assertion, add:

```ts
await expect(page.locator('.jds-effect-stack')).toBeVisible();
```

- [ ] **Step 2: Run e2e to establish the current visual baseline**

Run:

```powershell
npm run e2e
```

Expected: FAIL if `.jds-effect-stack` is not styled/rendered yet, otherwise PASS with screenshots that still need inspection.

- [ ] **Step 3: Add stable preview and action-row CSS**

Append these rules to `src/ui/menuOverlay.css`:

```css
.jds-actions {
  grid-template-columns: minmax(0, 1fr) 190px 190px;
}

.jds-actions button {
  min-height: 46px;
  display: grid;
  align-items: center;
}

.jds-effect-stack {
  position: relative;
  width: min(220px, 100%);
  height: 120px;
  border: 1px solid rgba(78, 201, 176, 0.28);
  background:
    linear-gradient(90deg, rgba(78, 201, 176, 0.1), transparent 58%),
    rgba(0, 0, 0, 0.28);
  overflow: hidden;
}

.jds-effect-stack i {
  position: absolute;
  left: 22px;
  right: 22px;
  height: 2px;
  background: var(--jds-teal);
  box-shadow: 0 0 14px rgba(78, 201, 176, 0.5);
}

.jds-effect-stack i:nth-child(1) { top: 34px; }
.jds-effect-stack i:nth-child(2) { top: 58px; background: var(--jds-yellow); }
.jds-effect-stack i:nth-child(3) { top: 82px; background: var(--jds-blue); }

@media (max-width: 920px) {
  .jds-actions {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Run build and e2e**

Run:

```powershell
npm run build
npm run e2e
```

Expected: both PASS. Inspect `test-results/phase1-dom-start-1440x900.png`, `test-results/phase1-dom-stage-1440x900.png`, and `test-results/phase1-dom-weapon-1440x900.png` for readable copy, no overlap, and visible IDE shell structure.

- [ ] **Step 5: Commit Task 2**

Run:

```powershell
git add src/ui/menuOverlay.css tests/e2e/boot.spec.ts test-results/phase1-dom-start-1440x900.png test-results/phase1-dom-stage-1440x900.png test-results/phase1-dom-weapon-1440x900.png
git commit -m "feat: polish menu shell composition"
```

---

### Task 3: Strengthen Quick Fix And Result Overlays

**Files:**

- Modify: `tests/runDecisionOverlay.test.ts`
- Modify: `src/ui/runDecisionOverlay.ts`
- Modify: `src/ui/runDecisionOverlay.css`

- [ ] **Step 1: Add decision shell tests**

Add this test to `tests/runDecisionOverlay.test.ts`:

```ts
it('renders decision overlays with IDE shell landmarks', () => {
  const noop = () => {};

  showQuickFixOverlay({ weapon: 'python', onSelect: noop });

  expect(document.querySelector('.jds-decision-titlebar')).not.toBeNull();
  expect(document.querySelector('.jds-decision-grid')).not.toBeNull();
  expect(document.querySelector('.jds-decision-statusbar')).not.toBeNull();

  showStageClearOverlay({
    stageTitle: 'Stage 1 - Python Basics',
    elapsedSec: 125,
    kills: 72,
    unlockedText: 'reward weapon unlocked',
    onContinue: noop,
    onMenu: noop,
    onCodex: noop,
  });

  expect(document.querySelector('[data-decision="stage-clear"] .jds-decision-titlebar')).not.toBeNull();
  expect(document.querySelector('[data-decision="stage-clear"] .jds-decision-statusbar')).not.toBeNull();
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```powershell
npm test -- tests/runDecisionOverlay.test.ts
```

Expected: FAIL until the statusbar markup exists.

- [ ] **Step 3: Add decision statusbars**

In `src/ui/runDecisionOverlay.ts`, inside each overlay section, add a statusbar before the closing `</section>`.

For Quick Fix:

```html
<footer class="jds-decision-statusbar"><span>05_level_up_upgrade_modal_frontend_design.html</span><span>1-3: choose patch</span><span>paused</span></footer>
```

For Stage Clear:

```html
<footer class="jds-decision-statusbar"><span>08_stage_clear_result_frontend_design.html</span><span>continue / codex / menu</span><span>pass</span></footer>
```

For Game Over:

```html
<footer class="jds-decision-statusbar"><span>09_game_over_frontend_design.html</span><span>retry / menu</span><span>failed</span></footer>
```

- [ ] **Step 4: Update decision layout CSS**

In `src/ui/runDecisionOverlay.css`, update `.jds-decision` and add `.jds-decision-statusbar`:

```css
.jds-decision {
  width: min(820px, calc(100vw - 52px));
  border: 1px solid rgba(78, 201, 176, 0.5);
  background: rgba(30, 30, 30, 0.97);
  box-shadow: 0 0 42px rgba(78, 201, 176, 0.16);
  display: grid;
  gap: 0;
  overflow: hidden;
}

.jds-decision-statusbar {
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 12px;
  background: #007acc;
  color: #fff;
  font-size: 12px;
}
```

Make sure content sections keep padding:

```css
.jds-decision-grid section,
.jds-decision.result > .label,
.jds-decision.result > h1,
.jds-decision.result > code,
.jds-decision.result > p,
.jds-decision.result > strong,
.jds-decision.result > .actions {
  margin-left: 22px;
  margin-right: 22px;
}

.jds-decision.result > .label {
  margin-top: 22px;
}

.jds-decision.result > .actions {
  margin-bottom: 22px;
}
```

- [ ] **Step 5: Run focused tests and build**

Run:

```powershell
npm test -- tests/runDecision.test.ts tests/runDecisionOverlay.test.ts
npm run build
```

Expected: both PASS.

- [ ] **Step 6: Commit Task 3**

Run:

```powershell
git add src/ui/runDecisionOverlay.ts src/ui/runDecisionOverlay.css tests/runDecisionOverlay.test.ts
git commit -m "feat: align decision overlays with IDE shell"
```

---

### Task 4: Keep Runtime HUD Gameplay-Safe And Polish Alerts

**Files:**

- Modify: `tests/runtimeOverlay.test.ts`
- Modify: `src/ui/runtimeOverlay.ts`
- Modify: `src/ui/runtimeOverlay.css`
- Modify: `src/scenes/GameScene.ts`

- [ ] **Step 1: Add runtime compactness expectations**

In `tests/runtimeOverlay.test.ts`, add:

```ts
it('keeps runtime HUD lines compact for gameplay readability', () => {
  const view = buildRuntimeHudView({
    stageTitle: 'Stage 1 - Python Basics',
    hp: 99,
    maxHp: 100,
    kills: 123,
    elapsedSec: 599,
    weaponCodeName: 'python.auto()',
    events: [
      { id: 'q1', completed: false, active: true, progress: 12 },
      { id: 'e1', completed: false, active: false, progress: 0 },
      { id: 'e2', completed: false, active: false, progress: 0 },
      { id: 'boss', completed: false, active: false, progress: 0 },
    ],
    boss: { name: 'Jang Seonhyeong', hp: 250, maxHp: 300 },
  });

  expect(view.statusLine.length).toBeLessThanOrEqual(54);
  expect(view.vitalsLine).toBe('HP 99/100 | kills 123');
  expect(view.bossLine).toBe('BOSS Jang Seonhyeong | HP 250/300');
});
```

- [ ] **Step 2: Run the focused runtime test**

Run:

```powershell
npm test -- tests/runtimeOverlay.test.ts
```

Expected: PASS if the HUD is already compact, FAIL if status copy has grown too long.

- [ ] **Step 3: Shorten status formatting only if the test fails**

If Step 2 fails because `statusLine` is too long, update `buildRuntimeHudView()` in `src/ui/runtimeOverlay.ts` to format Stage 1 compactly:

```ts
const stageLabel = input.stageTitle.replace('Stage 1 - ', 'S1 ');
return {
  statusLine: `${stageLabel} | ${formatElapsed(input.elapsedSec)} | ${input.weaponCodeName}`,
  vitalsLine: `HP ${Math.max(0, Math.ceil(input.hp))}/${input.maxHp} | kills ${input.kills}`,
  eventLine: input.events.map(formatEvent).join(' | '),
  bossLine: input.boss
    ? `BOSS ${input.boss.name} | HP ${Math.max(0, Math.ceil(input.boss.hp))}/${input.boss.maxHp}`
    : null,
};
```

- [ ] **Step 4: Polish alert CSS without changing lifecycle**

In `src/ui/runtimeOverlay.css`, add a subtle scanline treatment to `.jds-runtime-alert-root`:

```css
.jds-runtime-alert-root {
  background:
    linear-gradient(rgba(212, 212, 212, 0.018) 1px, transparent 1px),
    transparent;
  background-size: 100% 4px, auto;
}
```

Do not set `pointer-events: auto`; runtime alerts must remain non-blocking.

- [ ] **Step 5: Run runtime verification**

Run:

```powershell
npm test -- tests/runtimeOverlay.test.ts
npm run build
```

Expected: both PASS.

- [ ] **Step 6: Commit Task 4**

Run:

```powershell
git add src/ui/runtimeOverlay.ts src/ui/runtimeOverlay.css src/scenes/GameScene.ts tests/runtimeOverlay.test.ts
git commit -m "feat: keep runtime overlays compact"
```

If `src/scenes/GameScene.ts` did not change, omit it from `git add`.

---

### Task 5: Make Codex The Clearest Shared Shell Example

**Files:**

- Modify: `tests/codexOverlay.test.ts`
- Modify: `src/ui/codexOverlay.ts`
- Modify: `src/ui/codexOverlay.css`

- [ ] **Step 1: Add codex shell tests**

Add this test to `tests/codexOverlay.test.ts`:

```ts
it('renders codex with the shared IDE workspace shell', () => {
  let closed = false;
  showCodexOverlay({
    onClose: () => {
      closed = true;
    },
  });

  expect(document.querySelector('.jds-codex-titlebar')).not.toBeNull();
  expect(document.querySelector('.jds-codex-rail')).not.toBeNull();
  expect(document.querySelector('.jds-codex-tabs')).not.toBeNull();
  expect(document.querySelector('.jds-codex-statusbar')).not.toBeNull();
  expect(document.querySelector('[data-codex-group="weapons"]')).not.toBeNull();

  document.querySelector<HTMLElement>('[data-action="close"]')?.click();
  expect(closed).toBe(true);
});
```

- [ ] **Step 2: Run the focused codex test**

Run:

```powershell
npm test -- tests/codexOverlay.test.ts
```

Expected: FAIL if codex group buttons do not expose `data-codex-group`.

- [ ] **Step 3: Add stable codex group attributes**

In `src/ui/codexOverlay.ts`, change the group button template from:

```ts
<button data-group="${group}" class="${group === selectedGroup ? 'active' : ''}">${index + 1}. ${group}</button>
```

to:

```ts
<button data-group="${group}" data-codex-group="${group}" class="${group === selectedGroup ? 'active' : ''}">${index + 1}. ${group}</button>
```

- [ ] **Step 4: Add codex background and entry polish**

In `src/ui/codexOverlay.css`, update `.jds-codex-root`:

```css
.jds-codex-root {
  position: fixed;
  inset: 0;
  z-index: 45;
  background:
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.026), rgba(255, 255, 255, 0.026) 1px, transparent 1px, transparent 4px),
    radial-gradient(circle at 70% 16%, rgba(78, 201, 176, 0.12), transparent 340px),
    #1e1e1e;
  color: #d4d4d4;
  font-family: "JetBrains Mono", "Space Mono", "Noto Sans KR", Consolas, monospace;
}
```

Update `.jds-codex-entry`:

```css
.jds-codex-entry {
  border: 1px solid rgba(78, 201, 176, 0.32);
  border-left: 3px solid rgba(78, 201, 176, 0.58);
  background: rgba(37, 37, 38, 0.88);
  padding: 14px;
  display: grid;
  gap: 8px;
  min-height: 120px;
}
```

- [ ] **Step 5: Run codex tests and build**

Run:

```powershell
npm test -- tests/codexModel.test.ts tests/codexOverlay.test.ts
npm run build
```

Expected: both PASS.

- [ ] **Step 6: Commit Task 5**

Run:

```powershell
git add src/ui/codexOverlay.ts src/ui/codexOverlay.css tests/codexOverlay.test.ts
git commit -m "feat: polish codex workspace shell"
```

---

### Task 6: Full Verification And Plan Closeout

**Files:**

- Modify: `tests/e2e/boot.spec.ts`
- Modify: `docs/superpowers/plans/2026-04-28-codex-examples-screen-composition-alignment.md`

- [ ] **Step 1: Ensure screenshot coverage includes all affected screens**

Confirm `tests/e2e/boot.spec.ts` captures:

```text
test-results/phase1-dom-start-1440x900.png
test-results/phase1-dom-stage-1440x900.png
test-results/phase1-dom-weapon-1440x900.png
test-results/runtime-overlay-1440x900.png
test-results/quick-fix-1440x900.png
test-results/decision-result-1440x900.png
test-results/codex-1440x900.png
```

If any path is missing, add the screenshot call in the matching Playwright test:

```ts
await page.screenshot({ path: 'test-results/codex-1440x900.png', fullPage: true });
```

- [ ] **Step 2: Run full verification**

Run:

```powershell
npm test
npm run build
npm run e2e
```

Expected: all PASS.

- [ ] **Step 3: Inspect screenshots**

Open and inspect these files:

```text
test-results/phase1-dom-start-1440x900.png
test-results/phase1-dom-stage-1440x900.png
test-results/phase1-dom-weapon-1440x900.png
test-results/runtime-overlay-1440x900.png
test-results/quick-fix-1440x900.png
test-results/decision-result-1440x900.png
test-results/codex-1440x900.png
```

Pass criteria:

- No mojibake or replacement-character boxes.
- Titlebar, workspace, and statusbar are visible on DOM-heavy screens.
- Start, Stage, Weapon, Quick Fix, Result, and Codex screens feel like the same IDE/debugger product.
- Runtime HUD stays compact and leaves combat space readable.
- Text does not overlap at 1440x900.

- [ ] **Step 4: Record closeout in this plan**

Add this note under this task after verification passes:

```markdown
Verified on 2026-04-28 with:

- `npm test`
- `npm run build`
- `npm run e2e`

Screenshot inspection passed for Start, Stage Select, Weapon Select, Runtime HUD, Quick Fix, Result, and Codex at 1440x900.
```

- [ ] **Step 5: Commit Task 6**

Run:

```powershell
git add tests/e2e/boot.spec.ts docs/superpowers/plans/2026-04-28-codex-examples-screen-composition-alignment.md test-results/phase1-dom-start-1440x900.png test-results/phase1-dom-stage-1440x900.png test-results/phase1-dom-weapon-1440x900.png test-results/runtime-overlay-1440x900.png test-results/quick-fix-1440x900.png test-results/decision-result-1440x900.png test-results/codex-1440x900.png
git commit -m "docs: verify codex examples composition alignment"
```

## Self-Review

- Spec coverage: Tasks 1-2 cover Start, Stage Select, Weapon Select, broken copy, and shared shell roles. Task 3 covers Quick Fix, Stage Clear, and Game Over. Task 4 covers gameplay-safe HUD and runtime alerts. Task 5 covers Codex. Task 6 covers verification and screenshot inspection.
- Scope check: This plan does not add new stages, new combat systems, or new weapon stat mechanics.
- Placeholder scan: No task uses empty markers or unresolved future work as an implementation step.
- Type consistency: The plan uses existing exported functions from `menuOverlay.ts`, `runDecisionOverlay.ts`, `runtimeOverlay.ts`, and `codexOverlay.ts`.
