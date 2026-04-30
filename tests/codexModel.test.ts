import { describe, expect, it } from 'vitest';
import { buildCodexEntries, getCodexGroups } from '../src/ui/codexModel';

describe('codexModel', () => {
  it('groups entries by weapons, monsters, bosses, and curriculum', () => {
    expect(getCodexGroups()).toEqual(['weapons', 'monsters', 'bosses', 'curriculum']);
  });

  it('builds starter weapon entries as unlocked', () => {
    const python = buildCodexEntries().find((entry) => entry.id === 'weapon-python');
    expect(python).toEqual({
      id: 'weapon-python',
      group: 'weapons',
      title: 'Python',
      subtitle: 'python.auto()',
      unlocked: true,
      detail: '360 degree interpreter bolts. Broad coverage, steady tempo.',
    });
  });

  it('keeps reward weapons locked', () => {
    const git = buildCodexEntries().find((entry) => entry.id === 'weapon-git');
    expect(git?.unlocked).toBe(false);
    expect(git?.detail).toBe('LOCKED_PREVIEW');
  });

  it('adds boss and curriculum entries', () => {
    const entries = buildCodexEntries();
    expect(entries.some((entry) => entry.id === 'boss-stage-1')).toBe(true);
    expect(entries.some((entry) => entry.id === 'curriculum-stage-1')).toBe(true);
  });
});
