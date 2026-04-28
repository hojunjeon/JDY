import { buildGameOverView, buildQuickFixOptions, buildStageClearView, type QuickFixId } from './runDecision';
import type { WeaponId } from '../types';

let activeOverlay: HTMLElement | null = null;

export function showQuickFixOverlay(input: { weapon: WeaponId; onSelect: (id: QuickFixId) => void }): void {
  const options = buildQuickFixOptions(input.weapon);
  showOverlay(`
    <section class="jds-decision modal" data-decision="quick-fix">
      <div class="jds-decision-titlebar">
        <span class="jds-decision-dot red"></span><span class="jds-decision-dot yellow"></span><span class="jds-decision-dot green"></span>
        <span>runtime/quick-fix.patch</span>
      </div>
      <div class="jds-decision-grid">
        <aside>
          <div class="label">Explorer</div>
          <p class="active">patch.damage</p>
          <p class="active">patch.cooldown</p>
          <p class="active">patch.hp</p>
        </aside>
        <section>
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
      </div>
    </section>
  `);
  activeOverlay?.querySelectorAll<HTMLElement>('[data-quick-fix]').forEach((button) => {
    button.addEventListener('click', () => input.onSelect(button.dataset.quickFix as QuickFixId));
  });
}

export function showStageClearOverlay(input: {
  stageTitle: string;
  elapsedSec: number;
  kills: number;
  unlockedText: string;
  onContinue: () => void;
  onMenu: () => void;
}): void {
  const view = buildStageClearView(input);
  showOverlay(`
    <section class="jds-decision result pass" data-decision="stage-clear">
      <div class="jds-decision-titlebar">
        <span class="jds-decision-dot red"></span><span class="jds-decision-dot yellow"></span><span class="jds-decision-dot green"></span>
        <span>ci/stage-result.log</span>
      </div>
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

export function showGameOverOverlay(input: {
  stageTitle: string;
  elapsedSec: number;
  kills: number;
  onRetry: () => void;
  onMenu: () => void;
}): void {
  const view = buildGameOverView(input);
  showOverlay(`
    <section class="jds-decision result fail" data-decision="game-over">
      <div class="jds-decision-titlebar">
        <span class="jds-decision-dot red"></span><span class="jds-decision-dot yellow"></span><span class="jds-decision-dot green"></span>
        <span>runtime/crash.dump</span>
      </div>
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
