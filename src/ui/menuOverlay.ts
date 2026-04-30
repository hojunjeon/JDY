import { stages, starterWeaponConfigs } from '../data/gameData';
import type { MenuFlowEvent, MenuFlowState } from './menuFlow';

export function renderMenuOverlayHtml(state: MenuFlowState): string {
  if (state.screen === 'stage-select') return renderStageSelect(state);
  if (state.screen === 'weapon-select') return renderWeaponSelect(state);
  return renderStart();
}

function renderStart(): string {
  return `
    <section class="jds-menu jds-screen-start" data-screen="start">
      <header class="jds-titlebar">
        <span class="jds-dot red"></span><span class="jds-dot yellow"></span><span class="jds-dot green"></span>
        <span>jiyoon@ssafy: ~/debug-survival/start.frontend-design</span>
      </header>
      <main class="jds-workspace three-col">
        <aside class="jds-sidebar">
          <div class="jds-label">Explorer</div>
          <h3>debug-survival</h3>
          <button class="jds-file active" data-action="start.confirm"><b>start.sh</b><span>boot entrypoint</span></button>
          <button class="jds-file" data-action="noop"><b>stage_01/</b><span>Python Basics</span></button>
          <button class="jds-file" data-action="noop"><b>weapons/</b><span>Python.py, C_Cpp.c, Java.class</span></button>
          <button class="jds-file" data-action="noop"><b>boss.trace</b><span>locked until runtime</span></button>
        </aside>
        <section class="jds-center">
          <div class="jds-hero">
            <div>
              <div class="jds-eyebrow">// SSAFY boot sequence initialized</div>
              <h1>JDS<br>Survival</h1>
              <p>교실 터미널에서 runaway error를 정리하고 첫 boss trace까지 버티세요.</p>
            </div>
            <div class="jds-boot-chip"><span>Boot</span><strong>01</strong><em>ready</em></div>
          </div>
          <section class="jds-panel-grid">
            <article class="jds-panel">
              <span class="jds-label">Boot Log</span>
              <p><b class="green">OK</b> loaded Python Basics</p>
              <p><b class="green">OK</b> mounted SSAFY classroom</p>
              <p><b class="yellow">WARN</b> 24 unresolved bugs detected</p>
              <p><b class="red">ERR</b> IndentationError wave scheduled</p>
            </article>
            <article class="jds-panel">
              <span class="jds-label">Command Preview</span>
              <code><span class="teal">jiyoon@ssafy</span>:<span class="blue">~/stage1</span>$ <span class="yellow">npm run survive</span></code>
            </article>
          </section>
          <footer class="jds-actions">
            <code><span class="teal">$</span> session.prepare("stage_01")</code>
            <button data-action="start.confirm">start debug</button>
            <button data-action="codex.open">open codex</button>
          </footer>
        </section>
        <aside class="jds-sidebar">
          <div class="jds-label">Mission Briefing</div>
          <h2>Stage 1</h2>
          <dl>
            <dt>Curriculum</dt><dd>Python Basics</dd>
            <dt>Location</dt><dd>SSAFY lab</dd>
            <dt>First wave</dt><dd>IndentationError</dd>
            <dt>Boss</dt><dd>Jang Seonhyeong</dd>
          </dl>
        </aside>
      </main>
      <footer class="jds-statusbar"><span>01_start_screen_frontend_design.html</span><span>Enter: start</span><span>JDS</span></footer>
    </section>
  `;
}

function renderStageSelect(state: MenuFlowState): string {
  const rows = stages.map((stage) => {
    const active = stage.id === state.selectedStageId;
    const locked = stage.id !== 1;
    return `
      <button class="jds-stage ${active ? 'active' : ''} ${locked ? 'locked' : ''}" data-stage-id="${stage.id}" ${locked ? 'disabled' : ''}>
        <span class="jds-stage-id">${stage.id.toString().padStart(2, '0')}<em>${locked ? 'LOCKED' : 'READY'}</em></span>
        <span class="jds-stage-main"><b>${stage.title.replace(/^Stage \d - /, '')}</b><small>${stage.theme}</small></span>
        <span class="jds-stage-state">${active ? 'selected' : locked ? 'requires clear' : 'available'}</span>
      </button>
    `;
  }).join('');

  return `
    <section class="jds-menu jds-screen-stage" data-screen="stage-select">
      <header class="jds-titlebar"><span class="jds-dot red"></span><span class="jds-dot yellow"></span><span class="jds-dot green"></span><span>~/debug-survival/stage-pipeline.config</span></header>
      <main class="jds-workspace stage-layout">
        <aside class="jds-sidebar"><div class="jds-label">Explorer</div><p class="active">curriculum</p><p class="active">stage_01.python</p><p class="locked">stage_02.algorithm</p><p class="locked">stage_03.web</p></aside>
        <section class="jds-center">
          <div class="jds-tabs"><span class="active">stage-pipeline.config</span><span>quest.queue</span><span>boss.trace</span></div>
          <div class="jds-head"><div><div class="jds-eyebrow">// SSAFY curriculum is compiled as survival stages</div><h1>Stage Pipeline</h1></div><code>run stage_01 --mode survival</code></div>
          <div class="jds-stage-list">${rows}</div>
        </section>
        <aside class="jds-sidebar"><div class="jds-label">Selected Stage</div><h2>Stage 1 Briefing</h2><p>Python 기본 문법 오류와 첫 이벤트를 처리하는 디버거 생존 루트입니다.</p><button data-action="stage.confirm">continue to weapon select</button><button data-action="back">return to boot screen</button></aside>
      </main>
      <footer class="jds-statusbar"><span>02_stage_select_frontend_design.html</span><span>1-6: select</span><span>ESC: back</span></footer>
    </section>
  `;
}

function renderWeaponSelect(state: MenuFlowState): string {
  const selected = starterWeaponConfigs.find((weapon) => weapon.id === state.selectedWeapon) ?? starterWeaponConfigs[0];
  const files = starterWeaponConfigs.map((weapon) => `
    <button class="jds-file ${weapon.id === state.selectedWeapon ? 'active' : ''}" data-weapon-id="${weapon.id}">
      <b>${getWeaponFileName(weapon.name)}</b>
      <span>${weapon.codeName}</span>
    </button>
  `).join('');
  const tabs = starterWeaponConfigs.map((weapon) => `
    <span class="${weapon.id === state.selectedWeapon ? 'active' : ''}">${getWeaponFileName(weapon.name)}</span>
  `).join('');

  return `
    <section class="jds-menu jds-screen-weapon" data-screen="weapon-select">
      <header class="jds-titlebar"><span class="jds-dot red"></span><span class="jds-dot yellow"></span><span class="jds-dot green"></span><span>~/debug-survival/loadout/${getWeaponFileName(selected.name)}</span></header>
      <main class="jds-workspace three-col">
        <aside class="jds-sidebar"><div class="jds-label">Explorer</div><h3>starter_weapons</h3>${files}<h3>reward_weapons</h3><p class="locked">Git.sh</p><p class="locked">SQL.sql</p></aside>
        <section class="jds-center">
          <div class="jds-tabs">${tabs}</div>
          <div class="jds-head"><div><div class="jds-eyebrow">// choose the first debugging weapon file</div><h1>Weapon Select</h1></div><code>equip ${selected.codeName}</code></div>
          <div class="jds-bench">
            <pre class="jds-code"><code># ${selected.name}
class ${selected.name.replace(/[^A-Za-z]/g, '')}Weapon:
    damage = ${selected.damage}
    cooldown_ms = ${selected.cooldownMs}
    pattern = "${selected.description}"

    def cast(self, bugs):
        return ${selected.codeName}</code></pre>
            <article class="jds-preview"><span>effect.preview</span><strong>${selected.codeName}</strong><p>${selected.description}</p></article>
          </div>
        </section>
        <aside class="jds-sidebar"><div class="jds-label">Selected Weapon</div><h2>${selected.name} / ${selected.codeName}</h2><p>${selected.description}</p><button data-action="weapon.confirm">start Stage 1</button><button data-action="back">return to stage pipeline</button></aside>
      </main>
      <footer class="jds-statusbar"><span>03_weapon_select_frontend_design.html</span><span>1-3: weapon</span><span>Enter: start</span></footer>
    </section>
  `;
}

function getWeaponFileName(name: string): string {
  if (name === 'C/C++') return 'C_Cpp.c';
  if (name === 'Java') return 'Java.class';
  return `${name}.py`;
}

export interface MenuOverlayController {
  update(state: MenuFlowState): void;
  destroy(): void;
}

export function mountMenuOverlay(input: {
  state: MenuFlowState;
  dispatch: (event: MenuFlowEvent) => void;
  openCodex?: () => void;
}): MenuOverlayController {
  const root = document.createElement('div');
  root.className = 'jds-menu-root';
  document.body.append(root);

  const render = (state: MenuFlowState) => {
    root.innerHTML = renderMenuOverlayHtml(state);
  };

  const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const action = target.closest<HTMLElement>('[data-action]')?.dataset.action;
    const stageId = target.closest<HTMLElement>('[data-stage-id]')?.dataset.stageId;
    const weaponId = target.closest<HTMLElement>('[data-weapon-id]')?.dataset.weaponId;

    if (action === 'start.confirm') input.dispatch({ type: 'start.confirm' });
    if (action === 'stage.confirm') input.dispatch({ type: 'stage.confirm' });
    if (action === 'weapon.confirm') input.dispatch({ type: 'weapon.confirm' });
    if (action === 'back') input.dispatch({ type: 'back' });
    if (action === 'codex.open') input.openCodex?.();
    if (stageId) input.dispatch({ type: 'stage.select', stageId: Number(stageId) });
    if (weaponId) input.dispatch({ type: 'weapon.select', weapon: weaponId as MenuFlowState['selectedWeapon'] });
  };

  root.addEventListener('click', onClick);
  render(input.state);

  return {
    update: render,
    destroy: () => {
      root.removeEventListener('click', onClick);
      root.remove();
    },
  };
}
