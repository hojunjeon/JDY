import { afterEach, describe, expect, it } from 'vitest';
import { clearCodexOverlay, showCodexOverlay } from '../src/ui/codexOverlay';

describe('codexOverlay', () => {
  afterEach(() => {
    clearCodexOverlay();
  });

  it('renders the codex screen with weapon entries and clears it', () => {
    showCodexOverlay({ onClose: () => undefined });

    expect(document.querySelector('.jds-codex-root [data-screen="codex"]')).not.toBeNull();
    expect(document.body.textContent).toContain('Collection Codex');
    expect(document.body.textContent).toContain('Python');

    clearCodexOverlay();
    expect(document.querySelector('.jds-codex-root')).toBeNull();
  });

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

  it('switches groups and calls onClose from the close action', () => {
    let closed = false;
    showCodexOverlay({
      onClose: () => {
        closed = true;
      },
    });

    document.querySelector<HTMLElement>('[data-group="monsters"]')?.click();
    expect(document.body.textContent).toContain('SyntaxError');

    document.querySelector<HTMLElement>('[data-action="close"]')?.click();
    expect(closed).toBe(true);
    expect(document.querySelector('.jds-codex-root')).toBeNull();
  });
});
