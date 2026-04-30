import { afterEach, describe, expect, it } from 'vitest';
import { createMenuFlowState } from '../src/ui/menuFlow';
import { mountMenuOverlay, renderMenuOverlayHtml } from '../src/ui/menuOverlay';

describe('menuOverlay', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the start screen as an IDE boot layout', () => {
    const html = renderMenuOverlayHtml(createMenuFlowState());

    expect(html).toContain('data-screen="start"');
    expect(html).toContain('Explorer');
    expect(html).toContain('JDS');
    expect(html).toContain('Mission Briefing');
    expect(html).toContain('start debug');
  });

  it('renders the stage select pipeline', () => {
    const html = renderMenuOverlayHtml({ ...createMenuFlowState(), screen: 'stage-select' });

    expect(html).toContain('data-screen="stage-select"');
    expect(html).toContain('Stage Pipeline');
    expect(html).toContain('stage_01.python');
    expect(html).toContain('LOCKED');
    expect(html).toContain('continue to weapon select');
  });

  it('renders the weapon select source-file arsenal', () => {
    const html = renderMenuOverlayHtml({ ...createMenuFlowState(), screen: 'weapon-select' });

    expect(html).toContain('data-screen="weapon-select"');
    expect(html).toContain('Weapon Select');
    expect(html).toContain('Python.py');
    expect(html).toContain('C_Cpp.c');
    expect(html).toContain('Java.class');
    expect(html).toContain('start Stage 1');
  });

  it('does not render mojibake placeholder copy', () => {
    const startHtml = renderMenuOverlayHtml(createMenuFlowState());
    const stageHtml = renderMenuOverlayHtml({ ...createMenuFlowState(), screen: 'stage-select' });
    const weaponHtml = renderMenuOverlayHtml({ ...createMenuFlowState(), screen: 'weapon-select' });
    const html = [startHtml, stageHtml, weaponHtml].join('\n');

    expect(html).not.toMatch(/[\u63f4\u6e72\u81fe\u745c\uf9e3\u6e90\u5ac4\u7337\u0080\u2501\u2466\u3008]/);
    expect(startHtml).toContain('\uad50\uc2e4 \ud130\ubbf8\ub110\uc5d0\uc11c');
    expect(stageHtml).toContain('Python \uae30\ubcf8 \ubb38\ubc95');
  });

  it('dispatches the Codex action from the start overlay', () => {
    let opened = false;
    const controller = mountMenuOverlay({
      state: createMenuFlowState(),
      dispatch: () => undefined,
      openCodex: () => {
        opened = true;
      },
    });

    document.querySelector<HTMLElement>('[data-action="codex.open"]')?.click();

    expect(opened).toBe(true);
    controller.destroy();
  });
});
