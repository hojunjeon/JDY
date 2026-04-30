import { buildCodexEntries, getCodexGroups, type CodexGroup } from './codexModel';

let activeOverlay: HTMLElement | null = null;
let selectedGroup: CodexGroup = 'weapons';

export function showCodexOverlay(input: { onClose: () => void }): void {
  clearCodexOverlay();
  selectedGroup = 'weapons';
  const root = document.createElement('div');
  root.className = 'jds-codex-root';
  document.body.append(root);
  activeOverlay = root;

  const render = () => {
    const entries = buildCodexEntries().filter((entry) => entry.group === selectedGroup);
    root.innerHTML = `
      <section class="jds-codex" data-screen="codex">
        <header class="titlebar jds-codex-titlebar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span><span>~/debug-survival/collection.codex</span></header>
        <main class="layout">
          <aside class="rail jds-codex-rail">
            <div class="label">Explorer</div>
            ${getCodexGroups().map((group, index) => `<button data-group="${group}" data-codex-group="${group}" class="${group === selectedGroup ? 'active' : ''}">${index + 1}. ${group}</button>`).join('')}
            <button data-action="close">ESC close</button>
          </aside>
          <section class="workspace">
            <div class="tabs jds-codex-tabs"><span class="active">${selectedGroup}.index</span><span>locked.preview</span></div>
            <div class="head"><div><div class="label">// unlocked runtime knowledge</div><h1>Collection Codex</h1></div><code>open ${selectedGroup}</code></div>
            <div class="grid">
              ${entries.map((entry) => `
                <article class="entry jds-codex-entry ${entry.unlocked ? '' : 'locked'}">
                  <strong>${entry.title}</strong>
                  <span>${entry.unlocked ? entry.subtitle : 'LOCKED_PREVIEW'}</span>
                  <p>${entry.detail}</p>
                </article>
              `).join('')}
            </div>
          </section>
        </main>
        <footer class="statusbar jds-codex-statusbar"><span>10_collection_codex_frontend_design.html</span><span>${selectedGroup}</span><span>JDS</span></footer>
      </section>
    `;
    root.querySelectorAll<HTMLElement>('[data-group]').forEach((button) => {
      button.addEventListener('click', () => {
        selectedGroup = button.dataset.group as CodexGroup;
        render();
      });
    });
    root.querySelector<HTMLElement>('[data-action="close"]')?.addEventListener('click', () => {
      clearCodexOverlay();
      input.onClose();
    });
  };

  render();
}

export function clearCodexOverlay(): void {
  activeOverlay?.remove();
  activeOverlay = null;
}
