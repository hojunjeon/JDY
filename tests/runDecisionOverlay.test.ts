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

  it('renders result overlays and clears the active overlay', () => {
    let action = '';

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
    });

    expect(document.querySelector('[data-decision="stage-clear"]')).not.toBeNull();
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
