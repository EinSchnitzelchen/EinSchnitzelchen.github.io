import { createFolder as createFsFolder, getCurrentFolder, getRootFolders, listFolder, moveItem, openFile } from '../filesystem.js';
import { openApp } from '../window-manager.js';

const QUICK_ACCESS = ['Start', 'Desktop', 'Dokumente', 'Downloads', 'Bilder'];
const DRIVES = ['Windows (C:)', 'Daten (D:)'];

const explorerState = {
  currentPath: ['Start']
};

function getCurrentNode() {
  return getCurrentFolder(explorerState.currentPath) || { title: 'Start', icon: '🏠', type: 'folder', items: listFolder(['Start']) };
}

function renderSidebar() {
  return `
    <aside class="sidebar">
      <h3>Schnellzugriff</h3>
      <div class="menu-list">
        ${QUICK_ACCESS.map(folder => `<button class="menu-item" data-folder="${folder}"><span>${getRootFolders().find(entry => entry.name === folder)?.icon || '📁'}</span><span>${folder}</span></button>`).join('')}
      </div>
      <h3>Laufwerke</h3>
      <div class="menu-list">
        ${DRIVES.map(folder => `<button class="menu-item" data-folder="${folder}"><span>${getRootFolders().find(entry => entry.name === folder)?.icon || '💽'}</span><span>${folder}</span></button>`).join('')}
      </div>
    </aside>
  `;
}

function renderBreadcrumbs(path) {
  const rootText = DRIVES.includes(path[0]) ? 'Dieser PC' : 'Schnellzugriff';
  const crumbs = [`<span class="crumb" data-index="0">${rootText}</span>`];
  path.forEach((segment, index) => {
    crumbs.push(`<span class="crumb" data-index="${index + 1}">${segment}</span>`);
  });
  return crumbs.join('');
}

function renderFileGrid(node) {
  const items = node.items || [];
  return items.map(item => {
    const isFolder = Boolean(item.children);
    const path = JSON.stringify([...explorerState.currentPath, item.name]);
    return `
      <article class="file-card" draggable="true" data-item="${item.name}" data-folder="${isFolder}" data-path='${path}'>
        <div class="file-thumb">${item.icon}</div>
        <div>
          <strong style="display:block;font-size:var(--text-sm)">${item.name}</strong>
          <div class="file-meta">${item.type}</div>
        </div>
      </article>`;
  }).join('') || '<div class="empty-state">Dieser Ordner ist leer.</div>';
}

export function renderExplorer() {
  const currentNode = getCurrentNode();

  return `
    <div class="explorer-layout">
      ${renderSidebar()}
      <div class="explorer-main">
        <div class="window-toolbar">
          <div class="toolbar-group"><button class="toolbar-btn new-folder">Neuer Ordner</button><button class="toolbar-btn">Sortieren</button><button class="toolbar-btn">Ansicht</button></div>
          <div class="toolbar-group"><button class="toolbar-btn primary">Teilen</button></div>
        </div>
        <div class="pathbar">${renderBreadcrumbs(explorerState.currentPath)}</div>
        <div class="file-grid">
          ${renderFileGrid(currentNode)}
        </div>
      </div>
    </div>`;
}

function updateActiveSidebar(win) {
  const currentRoot = explorerState.currentPath[0];
  win.querySelectorAll('.menu-item').forEach(item => {
    item.classList.toggle('active', item.dataset.folder === currentRoot);
  });
}

function updateExplorerView(win) {
  const currentNode = getCurrentNode();
  const pathbar = win.querySelector('.pathbar');
  const grid = win.querySelector('.file-grid');
  const newFolderBtn = win.querySelector('.toolbar-btn.new-folder');

  if (pathbar) pathbar.innerHTML = renderBreadcrumbs(explorerState.currentPath);
  if (grid) grid.innerHTML = renderFileGrid(currentNode);
  if (newFolderBtn) {
    const writable = currentNode.type === 'drive' || currentNode.type === 'folder';
    newFolderBtn.disabled = !writable;
    newFolderBtn.textContent = writable ? 'Neuer Ordner' : 'Ordner nicht verfügbar';
  }
}

function setCurrentPath(win, path) {
  explorerState.currentPath = path;
  updateActiveSidebar(win);
  updateExplorerView(win);
}

function showCreateFolderDialog(win) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'folder-prompt-overlay';
    overlay.innerHTML = `
      <div class="folder-prompt-card">
        <h3>Neuer Ordner</h3>
        <p>Gib einen Namen für den neuen Ordner ein.</p>
        <input class="folder-name-input" type="text" placeholder="Ordnername" maxlength="40" />
        <div class="folder-prompt-actions">
          <button class="toolbar-btn folder-prompt-cancel" type="button">Abbrechen</button>
          <button class="toolbar-btn primary folder-prompt-confirm" type="button">Erstellen</button>
        </div>
      </div>`;

    const input = overlay.querySelector('.folder-name-input');
    const cancel = overlay.querySelector('.folder-prompt-cancel');
    const confirm = overlay.querySelector('.folder-prompt-confirm');

    const close = () => {
      overlay.remove();
      resolve(null);
    };

    cancel.addEventListener('click', close);
    confirm.addEventListener('click', () => {
      const value = input.value.trim();
      overlay.remove();
      resolve(value || null);
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') confirm.click();
      if (event.key === 'Escape') close();
    });

    win.appendChild(overlay);
    setTimeout(() => input.focus(), 0);
  });
}

async function createFolder(win) {
  const currentNode = getCurrentNode();
  if (!currentNode || !(currentNode.type === 'drive' || currentNode.type === 'folder')) return;

  const name = await showCreateFolderDialog(win);
  if (!name) return;

  const entry = createFsFolder(explorerState.currentPath, name);
  if (!entry) {
    alert('Ein Ordner mit diesem Namen existiert bereits oder der Ordner kann nicht erstellt werden.');
    return;
  }

  updateExplorerView(win);
}

export function initializeExplorer(win) {
  // Event listener for virtual filesystem changes (refreshes Explorer view)
  const onFsChange = () => {
    if (!win.isConnected) {
      document.removeEventListener('fs-change', onFsChange);
      return;
    }
    updateExplorerView(win);
  };
  document.addEventListener('fs-change', onFsChange);

  win.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const folder = item.dataset.folder;
      if (!folder) return;
      setCurrentPath(win, [folder]);
    });
  });

  win.querySelector('.toolbar-btn.new-folder')?.addEventListener('click', () => { void createFolder(win); });

  win.querySelector('.file-grid')?.addEventListener('click', (event) => {
    const card = event.target.closest('.file-card');
    if (!card) return;
    const itemName = card.dataset.item;
    const currentNode = getCurrentNode();
    const item = (currentNode.items || []).find(entry => entry.name === itemName);
    if (!item) return;

    if (item.children) {
      setCurrentPath(win, [...explorerState.currentPath, item.name]);
      return;
    }

    const file = openFile([...explorerState.currentPath, item.name]);
    if (file) {
      // If it's a text file, open it directly in the new premium Notes app!
      if (item.type === 'Textdatei' || item.name.endsWith('.txt') || item.name.endsWith('.md')) {
        openApp('notes', [...explorerState.currentPath, item.name]);
        return;
      }
      alert(`${file.name}\n\n${file.content}`);
      return;
    }

    alert(`${item.name} kann in dieser Demo nicht geöffnet werden.`);
  });

  win.querySelector('.file-grid')?.addEventListener('dragstart', (event) => {
    const card = event.target.closest('.file-card');
    if (!card) return;
    event.dataTransfer?.setData('application/x-mock-file', card.dataset.path || '');
    event.dataTransfer?.setData('text/plain', card.dataset.path || '');
  });

  win.querySelector('.file-grid')?.addEventListener('dragover', (event) => {
    if (event.dataTransfer?.types?.includes('application/x-mock-file')) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }
  });

  win.querySelector('.file-grid')?.addEventListener('drop', (event) => {
    const raw = event.dataTransfer?.getData('application/x-mock-file');
    if (!raw) return;
    const sourcePath = JSON.parse(raw);
    const targetPath = [...explorerState.currentPath];

    try {
      moveItem(sourcePath, targetPath);
      updateExplorerView(win);
    } catch (error) {
      alert('Datei konnte nicht verschoben werden.');
    }
  });

  win.querySelector('.pathbar')?.addEventListener('click', (event) => {
    const crumb = event.target.closest('.crumb');
    if (!crumb || typeof crumb.dataset.index === 'undefined') return;
    const index = Number(crumb.dataset.index);
    if (Number.isNaN(index)) return;

    if (index === 0) {
      const root = explorerState.currentPath[0];
      setCurrentPath(win, [root]);
      return;
    }

    const newPath = explorerState.currentPath.slice(0, index);
    setCurrentPath(win, newPath);
  });

  updateActiveSidebar(win);
  updateExplorerView(win);
}
