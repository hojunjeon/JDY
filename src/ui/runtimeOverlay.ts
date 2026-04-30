import type { EventId } from '../types';

export interface RuntimeEventSummary {
  id: EventId;
  active: boolean;
  completed: boolean;
  progress: number;
}

export interface RuntimeHudInput {
  stageTitle: string;
  hp: number;
  maxHp: number;
  kills: number;
  nextUpgradeAtKills?: number;
  elapsedSec: number;
  weaponCodeName: string;
  weaponLevel?: number;
  cooldownLeftMs?: number;
  cooldownMs?: number;
  events: RuntimeEventSummary[];
  boss: { name: string; hp: number; maxHp: number } | null;
}

export function buildRuntimeHudView(input: RuntimeHudInput) {
  const elapsed = formatElapsed(input.elapsedSec);
  const hpValue = clamp(Math.ceil(input.hp), 0, input.maxHp);
  const upgradeTarget = Math.max(1, input.nextUpgradeAtKills ?? 24);
  const weaponLevel = input.weaponLevel ?? 1;
  const cooldownLeftMs = Math.max(0, input.cooldownLeftMs ?? 0);
  const cooldownDenominator = getCooldownDenominator(input.cooldownMs, weaponLevel);
  const cooldownRatio = cooldownDenominator
    ? roundRatio(1 - cooldownLeftMs / cooldownDenominator)
    : cooldownLeftMs === 0 ? 1 : 0;
  const cooldownDetail = cooldownLeftMs === 0
    ? 'ready'
    : `cooldown ${(cooldownLeftMs / 1000).toFixed(2)}s`;
  const bossHp = input.boss ? clamp(Math.ceil(input.boss.hp), 0, input.boss.maxHp) : 0;

  return {
    statusLine: `${input.stageTitle} | ${elapsed} | ${input.weaponCodeName}`,
    vitalsLine: `HP ${hpValue}/${input.maxHp} | kills ${input.kills}`,
    eventLine: input.events.map(formatEvent).join(' | '),
    bossLine: input.boss
      ? `BOSS ${input.boss.name} | HP ${bossHp}/${input.boss.maxHp}`
      : null,
    stageLabel: input.stageTitle,
    timerLabel: elapsed,
    hp: {
      label: 'HP',
      value: `${hpValue} / ${input.maxHp}`,
      ratio: roundRatio(input.hp / input.maxHp),
    },
    upgrade: {
      label: 'Upgrade',
      value: `${input.kills} / ${upgradeTarget}`,
      ratio: roundRatio(input.kills / upgradeTarget),
    },
    weapon: {
      label: input.weaponCodeName,
      detail: `Lv. ${weaponLevel.toString().padStart(2, '0')} | ${cooldownDetail}`,
      cooldownRatio,
    },
    events: input.events.map((event) => ({
      id: event.id,
      label: event.id.toUpperCase(),
      status: event.completed ? 'done' : event.active ? 'run' : 'wait',
      progress: event.progress,
    })),
    boss: input.boss
      ? {
          label: 'BOSS',
          value: input.boss.name,
          detail: `HP ${bossHp} / ${input.boss.maxHp}`,
          ratio: roundRatio(input.boss.hp / input.boss.maxHp),
        }
      : null,
    hintLine: 'move WASD/arrows | R restart | ESC menu',
  };
}

export function buildQuestToastView(input: { title: string; dialogue: string; rewardText: string }) {
  return {
    heading: 'EVENT_TRIGGERED',
    body: input.title,
    detail: `reward: ${input.rewardText}`,
    dialogue: input.dialogue,
  };
}

export function buildBossWarningView(input: { name: string; dialogue: string }) {
  return {
    heading: 'BOSS PROCESS ATTACHED',
    name: input.name,
    detail: input.dialogue,
  };
}

function formatElapsed(elapsedSec: number): string {
  const total = Math.max(0, Math.floor(elapsedSec));
  return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
}

function formatEvent(event: RuntimeEventSummary): string {
  const status = event.completed ? 'done' : event.active ? 'run' : 'wait';
  return `${event.id}:${status}:${event.progress}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundRatio(value: number): number {
  return Number(clamp(value, 0, 1).toFixed(3));
}

function getCooldownDenominator(cooldownMs: number | undefined, level: number): number | null {
  if (cooldownMs === undefined) return null;
  return Math.max(140, cooldownMs * (1 - (level - 1) * 0.08));
}
