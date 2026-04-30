# UI Renewal Phase 4 DOM Meta Progression Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a DOM Codex screen that archives unlocked weapons, monsters, bosses, and learning progress in the same IDE/explorer language as the renewed menu flow.

**Architecture:** Keep Codex grouping and entry data in testable `src/ui/codexModel.ts`. Render the Codex as a DOM overlay opened from the start menu and stage-clear result, then close it back to the previous context without creating a Phaser-only Codex scene.

**Tech Stack:** Phaser 3, TypeScript, vanilla DOM, CSS, Vitest, Playwright, existing `src/ui/theme.ts` tokens.

---

## Decisions

- Codex is DOM overlay UI, not a Phaser scene.
- Codex can be opened from the start screen and, after Phase 3 exists, the stage clear result.
- Locked entries are visible as previews but do not reveal full details.
- The first version uses static unlock state.
- Mobile verification remains optional for this prototype pass.

## Files

- Create: `src/ui/codexModel.ts`
- Create: `src/ui/codexOverlay.ts`
- Create: `src/ui/codexOverlay.css`
- Create: `tests/codexModel.test.ts`
- Modify: `src/main.ts`
- Modify: `src/ui/menuOverlay.ts`
- Modify: `src/scenes/MenuScene.ts`
- Modify: `src/scenes/GameScene.ts`
- Modify: `tests/e2e/boot.spec.ts`
- Reference: `DESIGN.md`
- Reference: `codex_examples/10_collection_codex_frontend_design.html`

---

### Task 1: Add Codex Model

**Files:**

- Create: `src/ui/codexModel.ts`
- Create: `tests/codexModel.test.ts`

- [x] **Step 1: Write the failing test**

Create `tests/codexModel.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildCodexEntries, getCodexGroups } from '../src/ui/codexModel';

describe('codexModel', () => {
  it('groups entries by weapons, monsters, bosses, and curriculum', () => {
    expect(getCodexGroups()).toEqual(['weapons', 'monsters', 'bosses', 'curriculum']);
  });

  it('builds starter weapon entries as unlocked', () => {
    const python = buildCodexEntries().find((entry) => entry.id === 'weapon-python');
    expect(python).toEqual({
      id: 'weapon-python',
      group: 'weapons',
      title: 'Python',
      subtitle: 'python.auto()',
      unlocked: true,
      detail: '360 degree interpreter bolts. Broad coverage, steady tempo.',
    });
  });

  it('keeps reward weapons locked', () => {
    const git = buildCodexEntries().find((entry) => entry.id === 'weapon-git');
    expect(git?.unlocked).toBe(false);
    expect(git?.detail).toBe('LOCKED_PREVIEW');
  });

  it('adds boss and curriculum entries', () => {
    const entries = buildCodexEntries();
    expect(entries.some((entry) => entry.id === 'boss-stage-1')).toBe(true);
    expect(entries.some((entry) => entry.id === 'curriculum-stage-1')).toBe(true);
  });
});
```

- [x] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/codexModel.test.ts`

Expected: FAIL because `src/ui/codexModel.ts` does not exist.

- [x] **Step 3: Write the implementation**

Create `src/ui/codexModel.ts`:

```ts
import { enemies, stages, weapons } from '../data/gameData';

export type CodexGroup = 'weapons' | 'monsters' | 'bosses' | 'curriculum';

export interface CodexEntry {
  id: string;
  group: CodexGroup;
  title: string;
  subtitle: string;
  unlocked: boolean;
  detail: string;
}

export function getCodexGroups(): CodexGroup[] {
  return ['weapons', 'monsters', 'bosses', 'curriculum'];
}

export function buildCodexEntries(): CodexEntry[] {
  const weaponEntries = Object.values(weapons).map((weapon) => {
    const unlocked = weapon.unlock === 'starter';
    return {
      id: `weapon-${weapon.id}`,
      group: 'weapons' as const,
      title: weapon.name,
      subtitle: weapon.codeName,
      unlocked,
      detail: unlocked ? weapon.description : 'LOCKED_PREVIEW',
    };
  });

  const monsterEntries = Object.values(enemies).map((enemy) => {
    const unlocked = ['syntax_error', 'null_pointer', 'seg_fault', 'heal_bug'].includes(enemy.id);
    return {
      id: `monster-${enemy.id}`,
      group: 'monsters' as const,
      title: enemy.label,
      subtitle: enemy.behavior,
      unlocked,
      detail: unlocked ? `hp ${enemy.hp} | damage ${enemy.contactDamage}` : 'LOCKED_PREVIEW',
    };
  });

  const bossEntries = stages.map((stage) => ({
    id: `boss-stage-${stage.id}`,
    group: 'bosses' as const,
    title: stage.boss.name,
    subtitle: stage.title,
    unlocked: stage.id === 1,
    detail: stage.id === 1 ? stage.boss.dialogue : 'LOCKED_PREVIEW',
  }));

  const curriculumEntries = stages.map((stage) => ({
    id: `curriculum-stage-${stage.id}`,
    group: 'curriculum' as const,
    title: stage.title,
    subtitle: stage.theme,
    unlocked: stage.id === 1,
    detail: stage.id === 1 ? `enemy pool: ${stage.enemyPool.join(', ')}` : 'LOCKED_PREVIEW',
  }));

  return [...weaponEntries, ...monsterEntries, ...bossEntries, ...curriculumEntries];
}
```

- [x] **Step 4: Run the focused test**

Run: `npm test -- tests/codexModel.test.ts`

Expected: PASS.

- [x] **Step 5: Commit** — Skipped by explicit user instruction: do not commit or push.

Run:

```bash
git add src/ui/codexModel.ts tests/codexModel.test.ts
git commit -m "test: add codex model"
```

### Task 2: Add DOM Codex Overlay

**Files:**

- Create: `src/ui/codexOverlay.ts`
- Create: `src/ui/codexOverlay.css`
- Modify: `src/main.ts`

- [x] **Step 1: Create overlay module**

Create `src/ui/codexOverlay.ts`:

```ts
import { buildCodexEntries, getCodexGroups, type CodexGroup } from './codexModel';

let activeOverlay: HTMLElement | null = null;
let selectedGroup: CodexGroup = 'weapons';

export function showCodexOverlay(input: { onClose: () => void }): void {
  clearCodexOverlay();
  const root = document.createElement('div');
  root.className = 'jds-codex-root';
  document.body.append(root);
  activeOverlay = root;

  const render = () => {
    const entries = buildCodexEntries().filter((entry) => entry.group === selectedGroup);
    root.innerHTML = `
      <section class="jds-codex" data-screen="codex">
        <header class="titlebar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span><span>~/debug-survival/collection.codex</span></header>
        <main class="layout">
          <aside class="rail">
            <div class="label">Explorer</div>
            ${getCodexGroups().map((group, index) => `<button data-group="${group}" class="${group === selectedGroup ? 'active' : ''}">${index + 1}. ${group}</button>`).join('')}
            <button data-action="close">ESC close</button>
          </aside>
          <section class="workspace">
            <div class="tabs"><span class="active">${selectedGroup}.index</span><span>locked.preview</span></div>
            <div class="head"><div><div class="label">// unlocked runtime knowledge</div><h1>Collection Codex</h1></div><code>open ${selectedGroup}</code></div>
            <div class="grid">
              ${entries.map((entry) => `
                <article class="entry ${entry.unlocked ? '' : 'locked'}">
                  <strong>${entry.title}</strong>
                  <span>${entry.unlocked ? entry.subtitle : 'LOCKED_PREVIEW'}</span>
                  <p>${entry.detail}</p>
                </article>
              `).join('')}
            </div>
          </section>
        </main>
        <footer class="statusbar"><span>10_collection_codex_frontend_design.html</span><span>${selectedGroup}</span><span>JDS</span></footer>
      </section>
    `;
    root.querySelectorAll<HTMLElement>('[data-group]').forEach((button) => {
      button.addEventListener('click', () => {
        selectedGroup = button.dataset.group as CodexGroup;
        render();
      });
    });
    root.querySelector<HTMLElement>('[data-action="close"]')?.addEventListener('click', () => {
      clearCodexOverlay();
      input.onClose();
    });
  };

  render();
}

export function clearCodexOverlay(): void {
  activeOverlay?.remove();
  activeOverlay = null;
}
```

- [x] **Step 2: Create overlay CSS**

Create `src/ui/codexOverlay.css`:

```css
.jds-codex-root {
  position: fixed;
  inset: 0;
  z-index: 45;
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: "JetBrains Mono", "Space Mono", "Noto Sans KR", Consolas, monospace;
}
.jds-codex {
  height: calc(100vh - 52px);
  margin: 26px;
  border: 1px solid #3c3c3c;
  display: grid;
  grid-template-rows: 34px minmax(0, 1fr) 28px;
  overflow: hidden;
  background: rgba(30, 30, 30, 0.97);
}
.jds-codex .titlebar, .jds-codex .statusbar { display: flex; align-items: center; gap: 10px; padding: 0 12px; font-size: 12px; }
.jds-codex .titlebar { background: #252526; color: #858585; border-bottom: 1px solid #3c3c3c; }
.jds-codex .statusbar { justify-content: space-between; background: #007acc; color: #fff; }
.jds-codex .dot { width: 11px; height: 11px; border-radius: 50%; display: inline-block; }
.jds-codex .dot.red { background: #ff5f57; } .jds-codex .dot.yellow { background: #ffbd2e; } .jds-codex .dot.green { background: #28c840; }
.jds-codex .layout { min-height: 0; display: grid; grid-template-columns: 260px minmax(0, 1fr); }
.jds-codex .rail { background: #252526; border-right: 1px solid #3c3c3c; padding: 16px; display: grid; align-content: start; gap: 8px; }
.jds-codex button { border: 1px solid transparent; background: rgba(255,255,255,0.02); color: #858585; font: inherit; text-align: left; padding: 10px; cursor: pointer; }
.jds-codex button.active { border-left: 3px solid #4ec9b0; color: #4ec9b0; background: rgba(78,201,176,0.08); }
.jds-codex .workspace { min-width: 0; min-height: 0; display: grid; grid-template-rows: 36px auto minmax(0, 1fr); background: #1e1e1e; }
.jds-codex .tabs { display: flex; background: #181818; border-bottom: 1px solid #3c3c3c; }
.jds-codex .tabs span { min-width: 150px; padding: 10px 13px 0; color: #858585; border-right: 1px solid #3c3c3c; font-size: 12px; }
.jds-codex .tabs .active { color: #d4d4d4; border-top: 2px solid #4ec9b0; }
.jds-codex .head { padding: 22px; display: grid; grid-template-columns: 1fr 280px; gap: 18px; }
.jds-codex .head h1 { margin: 0; font-size: clamp(34px, 5vw, 68px); letter-spacing: 0; }
.jds-codex .label { color: #6a9955; font-size: 12px; text-transform: uppercase; }
.jds-codex code { color: #dcdcaa; border-left: 3px solid #4ec9b0; background: rgba(8,8,8,0.64); padding: 12px; }
.jds-codex .grid { min-height: 0; overflow: auto; padding: 0 22px 22px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.jds-codex .entry { border: 1px solid rgba(78,201,176,0.32); background: rgba(37,37,38,0.88); padding: 14px; display: grid; gap: 8px; }
.jds-codex .entry.locked { opacity: 0.48; }
.jds-codex .entry strong { color: #d4d4d4; }
.jds-codex .entry span { color: #4ec9b0; }
.jds-codex .entry p { margin: 0; color: #858585; line-height: 1.5; }
```

- [x] **Step 3: Import CSS**

In `src/main.ts`, add:

```ts
import './ui/codexOverlay.css';
```

- [x] **Step 4: Run verification**

Run:

```bash
npm test -- tests/codexModel.test.ts
npm run build
```

Expected: both PASS.

- [x] **Step 5: Commit** — Skipped by explicit user instruction: do not commit or push.

Run:

```bash
git add src/ui/codexOverlay.ts src/ui/codexOverlay.css src/main.ts
git commit -m "feat: add DOM codex overlay"
```

### Task 3: Open Codex From Start and Result Screens

**Files:**

- Modify: `src/ui/menuOverlay.ts`
- Modify: `src/scenes/MenuScene.ts`
- Modify: `src/scenes/GameScene.ts`

- [x] **Step 1: Add Codex button to start overlay**

In the start-screen HTML returned from `renderStart()`, add:

```html
<button data-action="codex.open">open codex</button>
```

- [x] **Step 2: Dispatch Codex from menu overlay**

Extend the `mountMenuOverlay` click handler to call a new optional callback:

```ts
export function mountMenuOverlay(input: {
  state: MenuFlowState;
  dispatch: (event: MenuFlowEvent) => void;
  openCodex?: () => void;
}): MenuOverlayController {
  // existing code
  if (action === 'codex.open') input.openCodex?.();
}
```

- [x] **Step 3: Connect `MenuScene` to Codex overlay**

In `MenuScene`, import:

```ts
import { clearCodexOverlay, showCodexOverlay } from '../ui/codexOverlay';
```

Pass `openCodex` into `mountMenuOverlay`:

```ts
openCodex: () => showCodexOverlay({ onClose: () => this.render() }),
```

Add `clearCodexOverlay();` inside `destroyOverlay()`.

- [x] **Step 4: Add stage-clear result Codex action**

In `src/ui/runDecisionOverlay.ts`, extend the stage-clear input:

```ts
export function showStageClearOverlay(input: {
  stageTitle: string;
  elapsedSec: number;
  kills: number;
  unlockedText: string;
  onContinue: () => void;
  onMenu: () => void;
  onCodex?: () => void;
}): void {
  const view = buildStageClearView(input);
  showOverlay(`
    <section class="jds-decision result pass" data-decision="stage-clear">
      <div class="label">Stage Clear</div>
      <h1>${view.heading}</h1>
      <code>${view.command}</code>
      <p>${view.summary}</p>
      <strong>${view.unlockedText}</strong>
      <div class="actions">
        <button data-action="continue">continue</button>
        <button data-action="codex">codex</button>
        <button data-action="menu">menu</button>
      </div>
    </section>
  `);
  activeOverlay?.querySelector<HTMLElement>('[data-action="continue"]')?.addEventListener('click', input.onContinue);
  activeOverlay?.querySelector<HTMLElement>('[data-action="menu"]')?.addEventListener('click', input.onMenu);
  activeOverlay?.querySelector<HTMLElement>('[data-action="codex"]')?.addEventListener('click', () => input.onCodex?.());
}
```

In `GameScene.endRun(true)`, pass:

```ts
onCodex: () => showCodexOverlay({
  onClose: () => this.endRun(true),
}),
```

- [x] **Step 5: Run build**

Run: `npm run build`

Expected: PASS.

- [x] **Step 6: Commit** — Skipped by explicit user instruction: do not commit or push.

Run:

```bash
git add src/ui/menuOverlay.ts src/scenes/MenuScene.ts src/scenes/GameScene.ts
git commit -m "feat: open codex from UI overlays"
```

### Task 4: Add Codex E2E Check

**Files:**

- Modify: `tests/e2e/boot.spec.ts`

- [x] **Step 1: Add Codex navigation test**

Append:

```ts
test('opens DOM codex from the start screen', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.jds-menu-root [data-screen="start"]')).toBeVisible();
  await page.getByRole('button', { name: /open codex/i }).click();
  await expect(page.locator('.jds-codex-root [data-screen="codex"]')).toBeVisible();
  await page.screenshot({ path: 'test-results/codex-1440x900.png', fullPage: true });
  await page.getByRole('button', { name: /esc close/i }).click();
  await expect(page.locator('.jds-codex-root')).toHaveCount(0);
});
```

- [x] **Step 2: Run e2e**

Run: `npm run e2e`

Expected: PASS and `test-results/codex-1440x900.png` exists.

- [x] **Step 3: Commit** — Skipped by explicit user instruction: do not commit or push.

Run:

```bash
git add tests/e2e/boot.spec.ts
git commit -m "test: cover DOM codex navigation"
```

### Task 5: Phase 4 Final Verification and Docs

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

- [x] **Step 2: Update roadmap**

In this phase plan, mark Phase 4 complete and record `test-results/codex-1440x900.png`.

- [x] **Step 3: Update root index**

Only after Phase 1 DOM alignment, Phase 2, Phase 3, and Phase 4 are all complete and verified, move the UI Renewal completed work summary to `docs/superpowers/plans/ARCHIVE.md`.

If no active work remains, replace `PLANS.md` with:

```text
# JDS Plans

No active work. See docs/superpowers/plans/ARCHIVE.md.
```

- [x] **Step 4: Commit** — Skipped by explicit user instruction: do not commit or push.

Run:

```bash
git add PLANS.md docs/superpowers/plans/2026-04-27-ui-renewal-phase-4-meta-progression.md docs/superpowers/plans/ARCHIVE.md
git commit -m "docs: mark UI renewal verified"
```


## Verification Record

- Phase 4 complete: DOM Codex model, overlay, start-menu navigation, stage-clear Codex action, and E2E coverage are implemented.
- Screenshot evidence: `test-results/codex-1440x900.png`.
- Final verification on 2026-04-30: `npm test` (12 files, 35 tests), `npm run build`, and `npm run e2e` (4 Playwright tests) all passed.
- Commit steps were intentionally skipped because the user explicitly requested no commits or pushes.

## Self-Review

- Codex is DOM because it is list/detail heavy.
- No Phaser `CodexScene` is introduced.
- The Codex model remains testable without rendering.
