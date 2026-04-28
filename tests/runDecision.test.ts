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
