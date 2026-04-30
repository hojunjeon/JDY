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
