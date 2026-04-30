import { describe, expect, it } from 'vitest';
import { buildBossWarningView, buildQuestToastView, buildRuntimeHudView } from '../src/ui/runtimeOverlay';

describe('runtimeOverlay', () => {
  it('builds structured HUD copy from existing runtime state', () => {
    const view = buildRuntimeHudView({
      stageTitle: 'Stage 1 - Python Basics',
      hp: 76.3,
      maxHp: 100,
      kills: 18,
      nextUpgradeAtKills: 24,
      elapsedSec: 83.8,
      weaponCodeName: 'python.auto()',
      weaponLevel: 2,
      cooldownLeftMs: 620,
      cooldownMs: 1000,
      events: [
        { id: 'q1', completed: false, active: true, progress: 12 },
        { id: 'e1', completed: true, active: false, progress: 10 },
        { id: 'e2', completed: false, active: false, progress: 0 },
        { id: 'boss', completed: false, active: false, progress: 0 },
      ],
      boss: null,
    });

    expect(view.statusLine).toBe('Stage 1 - Python Basics | 01:23 | python.auto()');
    expect(view.vitalsLine).toBe('HP 77/100 | kills 18');
    expect(view.eventLine).toBe('q1:run:12 | e1:done:10 | e2:wait:0 | boss:wait:0');
    expect(view.bossLine).toBeNull();
    expect(view.stageLabel).toBe('Stage 1 - Python Basics');
    expect(view.timerLabel).toBe('01:23');
    expect(view.hp).toEqual({ label: 'HP', value: '77 / 100', ratio: 0.763 });
    expect(view.upgrade).toEqual({ label: 'Upgrade', value: '18 / 24', ratio: 0.75 });
    expect(view.weapon).toEqual({
      label: 'python.auto()',
      detail: 'Lv. 02 | cooldown 0.62s',
      cooldownRatio: 0.326,
    });
    expect(view.boss).toBeNull();
    expect(view.hintLine).toBe('move WASD/arrows | R restart | ESC menu');
  });

  it('clamps HUD meters and keeps boss state compact', () => {
    const view = buildRuntimeHudView({
      stageTitle: 'Stage 1 - Python Basics',
      hp: 130,
      maxHp: 100,
      kills: 123,
      nextUpgradeAtKills: 12,
      elapsedSec: 599,
      weaponCodeName: 'python.auto()',
      weaponLevel: 12,
      cooldownLeftMs: -30,
      cooldownMs: 620,
      events: [
        { id: 'q1', completed: false, active: true, progress: 12 },
        { id: 'e1', completed: false, active: false, progress: 0 },
        { id: 'e2', completed: false, active: false, progress: 0 },
        { id: 'boss', completed: false, active: false, progress: 0 },
      ],
      boss: { name: 'Jang Seonhyeong', hp: 250, maxHp: 300 },
    });

    expect(view.statusLine.length).toBeLessThanOrEqual(54);
    expect(view.vitalsLine).toBe('HP 100/100 | kills 123');
    expect(view.bossLine).toBe('BOSS Jang Seonhyeong | HP 250/300');
    expect(view.hp.ratio).toBe(1);
    expect(view.upgrade.ratio).toBe(1);
    expect(view.weapon.detail).toBe('Lv. 12 | ready');
    expect(view.weapon.cooldownRatio).toBe(1);
    expect(view.boss).toEqual({
      label: 'BOSS',
      value: 'Jang Seonhyeong',
      detail: 'HP 250 / 300',
      ratio: 0.833,
    });
  });

  it('builds DOM quest and boss overlay copy', () => {
    expect(buildQuestToastView({
      title: 'E1: indentation panic',
      dialogue: '"IndentationError keeps breaking the lab!"',
      rewardText: 'upgrade currency +3',
    })).toEqual({
      heading: 'EVENT_TRIGGERED',
      body: 'E1: indentation panic',
      detail: 'reward: upgrade currency +3',
      dialogue: '"IndentationError keeps breaking the lab!"',
    });

    expect(buildBossWarningView({
      name: 'Jang Seonhyeong',
      dialogue: 'boss.spawn("I am not losing again!")',
    })).toEqual({
      heading: 'BOSS PROCESS ATTACHED',
      name: 'Jang Seonhyeong',
      detail: 'boss.spawn("I am not losing again!")',
    });
  });
});
