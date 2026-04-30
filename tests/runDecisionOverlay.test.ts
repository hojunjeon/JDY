import { afterEach, describe, expect, it } from 'vitest';
import { clearRunDecisionOverlay, showGameOverOverlay, showQuickFixOverlay, showStageClearOverlay } from '../src/ui/runDecisionOverlay';

describe('runDecisionOverlay', () => {
  afterEach(() => {
    clearRunDecisionOverlay();
  });

  it('renders Quick Fix options and dispatches a selection', () => {
    let selected = '';

    showQuickFixOverlay({
      weapon: 'python',
      onSelect: (id) => {
        selected = id;
      },
    });

    expect(document.querySelector('[data-decision="quick-fix"]')).not.toBeNull();
    document.querySelector<HTMLElement>('[data-quick-fix="heal"]')?.click();
    expect(selected).toBe('heal');
  });

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

    showGameOverOverlay({
      stageTitle: 'Stage 1 - Python Basics',
      elapsedSec: 48,
      kills: 21,
      onRetry: noop,
      onMenu: noop,
    });

    expect(document.querySelector('[data-decision="game-over"] .jds-decision-titlebar')).not.toBeNull();
    expect(document.querySelector('[data-decision="game-over"] .jds-decision-statusbar')).not.toBeNull();
  });

  it('renders result overlays and clears the active overlay', () => {
    let action = '';
    let codexOpened = false;

    showStageClearOverlay({
      stageTitle: 'Stage 1 - Python Basics',
      elapsedSec: 125,
      kills: 72,
      unlockedText: 'reward weapon unlocked',
      onContinue: () => {
        action = 'continue';
      },
      onMenu: () => {
        action = 'menu';
      },
      onCodex: () => {
        codexOpened = true;
      },
    });

    expect(document.querySelector('[data-decision="stage-clear"]')).not.toBeNull();
    document.querySelector<HTMLElement>('[data-action="codex"]')?.click();
    expect(codexOpened).toBe(true);
    document.querySelector<HTMLElement>('[data-action="continue"]')?.click();
    expect(action).toBe('continue');

    showGameOverOverlay({
      stageTitle: 'Stage 1 - Python Basics',
      elapsedSec: 48,
      kills: 21,
      onRetry: () => {
        action = 'retry';
      },
      onMenu: () => {
        action = 'menu';
      },
    });

    expect(document.querySelector('[data-decision="stage-clear"]')).toBeNull();
    expect(document.querySelector('[data-decision="game-over"]')).not.toBeNull();
    document.querySelector<HTMLElement>('[data-action="retry"]')?.click();
    expect(action).toBe('retry');

    clearRunDecisionOverlay();
    expect(document.querySelector('.jds-decision-root')).toBeNull();
  });
});
