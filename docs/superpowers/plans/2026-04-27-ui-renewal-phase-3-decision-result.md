# UI Renewal Phase 3 DOM Decision and Result Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add DOM overlay screens for Quick Fix upgrades, stage clear, and game over that closely match the reference IDE/debugger UI.

**Architecture:** Keep decision copy and action models in testable `src/ui/runDecision.ts`. Render paused decision/result UI through a DOM overlay module; `GameScene` pauses or ends gameplay and dispatches selected actions.

**Tech Stack:** Phaser 3, TypeScript, vanilla DOM, CSS, Vitest, Playwright, existing `src/ui/theme.ts` tokens.

---

## Decisions

- Quick Fix upgrade choices pause the game completely.
- Quick Fix, Stage Clear, and Game Over are DOM overlays, not Phaser panels.
- DOM overlays are removed when gameplay resumes, restarts, or returns to menu.
- Stage clear keeps continue and menu actions only; Phase 4 adds Codex navigation after the Codex overlay exists.
- Mobile verification remains optional for this prototype pass.

## Files

- Create: `src/ui/runDecision.ts`
- Create: `src/ui/runDecisionOverlay.ts`
- Create: `src/ui/runDecisionOverlay.css`
- Create: `tests/runDecision.test.ts`
- Create: `tests/runDecisionOverlay.test.ts`
- Modify: `src/main.ts`
- Modify: `src/scenes/GameScene.ts`
- Modify: `tests/e2e/boot.spec.ts`
- Reference: `DESIGN.md`
- Reference: `codex_examples/05_level_up_upgrade_modal_frontend_design.html`
- Reference: `codex_examples/08_stage_clear_result_frontend_design.html`
- Reference: `codex_examples/09_game_over_frontend_design.html`

---

### Task 1: Add Decision and Result View Models

**Files:**

- Create: `src/ui/runDecision.ts`
- Create: `tests/runDecision.test.ts`

- [x] **Step 1: Write the failing test**

Create `tests/runDecision.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildGameOverView, buildQuickFixOptions, buildStageClearView } from '../src/ui/runDecision';

describe('runDecision', () => {
  it('builds three Quick Fix options', () => {
    expect(buildQuickFixOptions('python')).toEqual([
      { id: 'damage', title: 'Patch damage', command: 'fix.apply("damage++")', description: 'Increase current weapon damage.' },
      { id: 'cooldown', title: 'Reduce cooldown', command: 'fix.apply("cooldown--")', description: 'Fire the current weapon more often.' },
      { id: 'heal', title: 'Restore HP', command: 'fix.apply("hp.restore")', description: 'Recover a safe chunk of health.' },
    ]);
  });

  it('builds stage clear and game over views', () => {
    expect(buildStageClearView({
      stageTitle: 'Stage 1 - Python Basics',
      elapsedSec: 125,
      kills: 72,
      unlockedText: 'reward weapon unlocked',
    })).toEqual({
      heading: 'tests passed',
      command: 'git push origin stage-2',
      summary: 'Stage 1 - Python Basics clear | 02:05 | kills 72',
      unlockedText: 'reward weapon unlocked',
      nextActions: ['continue', 'menu'],
    });

    expect(buildGameOverView({
      stageTitle: 'Stage 1 - Python Basics',
      elapsedSec: 48,
      kills: 21,
    })).toEqual({
      heading: 'Process terminated',
      command: 'throw new GameOverError("session crashed")',
      summary: 'Stage 1 - Python Basics failed | 00:48 | kills 21',
      nextActions: ['retry', 'menu'],
    });
  });
});
```

- [x] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/runDecision.test.ts`

Expected: FAIL because `src/ui/runDecision.ts` does not exist.

- [x] **Step 3: Write the implementation**

Create `src/ui/runDecision.ts`:

```ts
import type { WeaponId } from '../types';

export type QuickFixId = 'damage' | 'cooldown' | 'heal';
export type StageClearAction = 'continue' | 'menu';
export type GameOverAction = 'retry' | 'menu';

export interface QuickFixOption {
  id: QuickFixId;
  title: string;
  command: string;
  description: string;
}

export function buildQuickFixOptions(_weapon: WeaponId): QuickFixOption[] {
  return [
    { id: 'damage', title: 'Patch damage', command: 'fix.apply("damage++")', description: 'Increase current weapon damage.' },
    { id: 'cooldown', title: 'Reduce cooldown', command: 'fix.apply("cooldown--")', description: 'Fire the current weapon more often.' },
    { id: 'heal', title: 'Restore HP', command: 'fix.apply("hp.restore")', description: 'Recover a safe chunk of health.' },
  ];
}

export function buildStageClearView(input: { stageTitle: string; elapsedSec: number; kills: number; unlockedText: string }) {
  return {
    heading: 'tests passed',
    command: 'git push origin stage-2',
    summary: `${input.stageTitle} clear | ${formatElapsed(input.elapsedSec)} | kills ${input.kills}`,
    unlockedText: input.unlockedText,
    nextActions: ['continue', 'menu'] as StageClearAction[],
  };
}

export function buildGameOverView(input: { stageTitle: string; elapsedSec: number; kills: number }) {
  return {
    heading: 'Process terminated',
    command: 'throw new GameOverError("session crashed")',
    summary: `${input.stageTitle} failed | ${formatElapsed(input.elapsedSec)} | kills ${input.kills}`,
    nextActions: ['retry', 'menu'] as GameOverAction[],
  };
}

function formatElapsed(elapsedSec: number): string {
  const total = Math.max(0, Math.floor(elapsedSec));
  return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
}
```

- [x] **Step 4: Run the focused test**

Run: `npm test -- tests/runDecision.test.ts`

Expected: PASS.

- [x] **Step 5: Commit**

Run:

```bash
git add src/ui/runDecision.ts tests/runDecision.test.ts
git commit -m "test: add run decision view models"
```

### Task 2: Add DOM Decision Overlay

**Files:**

- Create: `src/ui/runDecisionOverlay.ts`
- Create: `src/ui/runDecisionOverlay.css`
- Modify: `src/main.ts`

- [x] **Step 1: Create overlay module**

Create `src/ui/runDecisionOverlay.ts`:

```ts
import { buildGameOverView, buildQuickFixOptions, buildStageClearView, type QuickFixId } from './runDecision';
import type { WeaponId } from '../types';

let activeOverlay: HTMLElement | null = null;

export function showQuickFixOverlay(input: { weapon: WeaponId; onSelect: (id: QuickFixId) => void }): void {
  const options = buildQuickFixOptions(input.weapon);
  showOverlay(`
    <section class="jds-decision modal" data-decision="quick-fix">
      <div class="label">Quick Fix</div>
      <h1>Patch Runtime</h1>
      <p>Select one patch before the runtime resumes.</p>
      <div class="option-list">
        ${options.map((option, index) => `
          <button data-quick-fix="${option.id}">
            <b>${index + 1}. ${option.title}</b>
            <code>${option.command}</code>
            <span>${option.description}</span>
          </button>
        `).join('')}
      </div>
    </section>
  `);
  activeOverlay?.querySelectorAll<HTMLElement>('[data-quick-fix]').forEach((button) => {
    button.addEventListener('click', () => input.onSelect(button.dataset.quickFix as QuickFixId));
  });
}

export function showStageClearOverlay(input: { stageTitle: string; elapsedSec: number; kills: number; unlockedText: string; onContinue: () => void; onMenu: () => void }): void {
  const view = buildStageClearView(input);
  showOverlay(`
    <section class="jds-decision result pass" data-decision="stage-clear">
      <div class="label">Stage Clear</div>
      <h1>${view.heading}</h1>
      <code>${view.command}</code>
      <p>${view.summary}</p>
      <strong>${view.unlockedText}</strong>
      <div class="actions"><button data-action="continue">continue</button><button data-action="menu">menu</button></div>
    </section>
  `);
  activeOverlay?.querySelector<HTMLElement>('[data-action="continue"]')?.addEventListener('click', input.onContinue);
  activeOverlay?.querySelector<HTMLElement>('[data-action="menu"]')?.addEventListener('click', input.onMenu);
}

export function showGameOverOverlay(input: { stageTitle: string; elapsedSec: number; kills: number; onRetry: () => void; onMenu: () => void }): void {
  const view = buildGameOverView(input);
  showOverlay(`
    <section class="jds-decision result fail" data-decision="game-over">
      <div class="label">Game Over</div>
      <h1>${view.heading}</h1>
      <code>${view.command}</code>
      <p>${view.summary}</p>
      <div class="actions"><button data-action="retry">retry</button><button data-action="menu">menu</button></div>
    </section>
  `);
  activeOverlay?.querySelector<HTMLElement>('[data-action="retry"]')?.addEventListener('click', input.onRetry);
  activeOverlay?.querySelector<HTMLElement>('[data-action="menu"]')?.addEventListener('click', input.onMenu);
}

export function clearRunDecisionOverlay(): void {
  activeOverlay?.remove();
  activeOverlay = null;
}

function showOverlay(html: string): void {
  clearRunDecisionOverlay();
  const root = document.createElement('div');
  root.className = 'jds-decision-root';
  root.innerHTML = html;
  document.body.append(root);
  activeOverlay = root;
}
```

- [x] **Step 2: Create overlay CSS**

Create `src/ui/runDecisionOverlay.css`:

```css
.jds-decision-root {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.46);
  color: #d4d4d4;
  font-family: "JetBrains Mono", "Space Mono", "Noto Sans KR", Consolas, monospace;
}

.jds-decision {
  width: min(760px, calc(100vw - 52px));
  border: 1px solid rgba(78, 201, 176, 0.5);
  background: rgba(30, 30, 30, 0.97);
  box-shadow: 0 0 42px rgba(78, 201, 176, 0.16);
  padding: 22px;
  display: grid;
  gap: 14px;
}

.jds-decision .label { color: #6a9955; font-size: 12px; text-transform: uppercase; }
.jds-decision h1 { margin: 0; color: #d4d4d4; font-size: clamp(34px, 6vw, 68px); letter-spacing: 0; }
.jds-decision p { margin: 0; color: #858585; line-height: 1.5; }
.jds-decision code { color: #dcdcaa; }
.jds-decision.pass { border-color: rgba(181, 206, 168, 0.62); }
.jds-decision.fail { border-color: rgba(244, 71, 71, 0.62); }
.jds-decision.fail h1 { color: #f44747; }
.option-list { display: grid; gap: 10px; }
.option-list button, .jds-decision .actions button {
  border: 1px solid rgba(78, 201, 176, 0.42);
  background: rgba(78, 201, 176, 0.08);
  color: #d4d4d4;
  font: inherit;
  padding: 12px;
  display: grid;
  gap: 5px;
  text-align: left;
  cursor: pointer;
}
.option-list button b { color: #4ec9b0; }
.option-list button span { color: #858585; }
.jds-decision .actions { display: flex; gap: 10px; }
.jds-decision .actions button { min-width: 140px; color: #4ec9b0; }
```

- [x] **Step 3: Import CSS**

In `src/main.ts`, add:

```ts
import './ui/runDecisionOverlay.css';
```

- [x] **Step 4: Run build**

Run: `npm run build`

Expected: PASS.

- [x] **Step 5: Commit**

Run:

```bash
git add src/ui/runDecisionOverlay.ts src/ui/runDecisionOverlay.css src/main.ts
git commit -m "feat: add DOM run decision overlays"
```

### Task 3: Connect Quick Fix and Result Overlays to `GameScene`

**Files:**

- Modify: `src/scenes/GameScene.ts`

- [x] **Step 1: Import overlay helpers**

Add:

```ts
import { clearRunDecisionOverlay, showGameOverOverlay, showQuickFixOverlay, showStageClearOverlay } from '../ui/runDecisionOverlay';
import type { QuickFixId } from '../ui/runDecision';
```

- [x] **Step 2: Add decision state**

Add fields:

```ts
private isChoosingUpgrade = false;
private nextUpgradeAtKills = 12;
```

- [x] **Step 3: Pause update while choosing**

At the top of `update()` after the ended check, add:

```ts
if (this.isChoosingUpgrade) return;
```

- [x] **Step 4: Open Quick Fix on kill threshold**

After `this.kills += 1;`, add:

```ts
if (this.kills >= this.nextUpgradeAtKills) {
  this.openQuickFix();
}
```

Add methods:

```ts
private openQuickFix(): void {
  this.isChoosingUpgrade = true;
  showQuickFixOverlay({
    weapon: this.selectedWeapon,
    onSelect: (id) => this.applyQuickFix(id),
  });
}

private applyQuickFix(id: QuickFixId): void {
  if (id === 'heal') this.hp = Math.min(100, this.hp + 25);
  this.nextUpgradeAtKills += 18;
  this.isChoosingUpgrade = false;
  clearRunDecisionOverlay();
}
```

- [x] **Step 5: Replace end-run Phaser panel**

In `endRun(clear: boolean)`, show DOM result overlays:

```ts
if (clear) {
  showStageClearOverlay({
    stageTitle: stages[0].title,
    elapsedSec: this.elapsedSec,
    kills: this.kills,
    unlockedText: 'reward weapon unlocked',
    onContinue: () => this.scene.start('MenuScene'),
    onMenu: () => this.scene.start('MenuScene'),
  });
} else {
  showGameOverOverlay({
    stageTitle: stages[0].title,
    elapsedSec: this.elapsedSec,
    kills: this.kills,
    onRetry: () => this.scene.restart({ stageId: this.stageId, weapon: this.selectedWeapon }),
    onMenu: () => this.scene.start('MenuScene'),
  });
}
```

- [x] **Step 6: Clear overlay on shutdown**

In `create()`, add:

```ts
this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => clearRunDecisionOverlay());
```

- [x] **Step 7: Run verification**

Run:

```bash
npm test -- tests/runDecision.test.ts
npm run build
```

Expected: both PASS.

- [x] **Step 8: Commit**

Run:

```bash
git add src/scenes/GameScene.ts
git commit -m "feat: connect DOM decision overlays"
```

### Task 4: Add E2E Screenshot Check

**Files:**

- Modify: `tests/e2e/boot.spec.ts`

- [x] **Step 1: Add smoke screenshot flow**

Add:

```ts
test('decision overlays do not break canvas flow', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
  await expect(page.locator('canvas')).toBeVisible();
  await page.screenshot({ path: 'test-results/decision-result-1440x900.png', fullPage: true });
});
```

- [x] **Step 2: Run e2e**

Run: `npm run e2e`

Expected: PASS and `test-results/decision-result-1440x900.png` exists.

- [x] **Step 3: Commit**

Run:

```bash
git add tests/e2e/boot.spec.ts
git commit -m "test: cover decision overlay smoke flow"
```

### Task 5: Phase 3 Final Verification and Docs

**Files:**

- Modify: `PLANS.md`

- [x] **Step 1: Run full verification**

Run:

```bash
npm test
npm run build
npm run e2e
```

Expected: all commands PASS.

Phase 3 DOM decision/result screens verified on 2026-04-28 with:

```text
npm test
npm run build
npm run e2e
```

Screenshot evidence:

- `test-results/decision-result-1440x900.png`
- `test-results/quick-fix-1440x900.png`

Implementation note: the retry action keeps the current weapon because the current `GameScene` does not yet track a `stageId` field. The cooldown Quick Fix applies the existing `WeaponSystem.levelUp()` behavior; damage remains modeled in the option copy only until a weapon stat modifier system exists.

- [x] **Step 2: Update docs**

In this phase plan, mark Phase 3 complete only after full verification passes.

In `PLANS.md`, mark Phase 3 `[x]` and Phase 4 `[~]` only after the final verification/docs step in this plan is checked.

If all UI Renewal phases are complete, move the completed work summary to `docs/superpowers/plans/ARCHIVE.md` instead of leaving the finished work active in `PLANS.md`.

- [x] **Step 3: Commit**

Run:

```bash
git add PLANS.md docs/superpowers/plans/2026-04-27-ui-renewal-phase-3-decision-result.md docs/superpowers/plans/ARCHIVE.md
git commit -m "docs: mark DOM decision screens verified"
```

## Self-Review

- Layout-heavy decision screens use DOM.
- Gameplay remains paused or ended while DOM overlays are active.
- Overlay cleanup is explicit.
