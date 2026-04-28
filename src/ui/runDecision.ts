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
