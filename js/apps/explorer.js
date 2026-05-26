const QUICK_ACCESS = ['Start', 'Desktop', 'Dokumente', 'Downloads', 'Bilder'];
const DRIVES = ['Windows (C:)', 'Daten (D:)'];

const explorerData = {
  Start: {
    title: 'Start',
    icon: '🏠',
    type: 'folder',
    canCreateFolder: false,
    items: [
      { name: 'Projektplan.docx', type: 'Word-Dokument', icon: '📄' },
      { name: 'Rechnung-April.pdf', type: 'PDF', icon: '🧾' },
      { name: 'Screenshots', type: 'Ordner', icon: '🗂️', children: [
        { name: 'Screenshot-1.png', type: 'Bild', icon: '🖼️' },
        { name: 'Screenshot-2.png', type: 'Bild', icon: '🖼️' }
      ]},
      { name: 'Designs.fig', type: 'Figma-Datei', icon: '🎨' },
      { name: 'Urlaub.jpg', type: 'Bild', icon: '🖼️' },
      { name: 'Musik', type: 'Ordner', icon: '🎵', children: [
        { name: 'Playlist.m3u', type: 'M3U-Datei', icon: '🎶' }
      ] },
      { name: 'Setup.exe', type: 'Anwendung', icon: '🧩' },
      { name: 'Archiv.zip', type: 'ZIP-Archiv', icon: '🗜️' }
    ]
  },
  Desktop: {
    title: 'Desktop',
    icon: '🖥️',
    type: 'folder',
    canCreateFolder: false,
    items: [
      { name: 'Arbeitsbereich', type: 'Ordner', icon: '🗂️', children: [
        { name: 'Meeting-Notizen.txt', type: 'Textdatei', icon: '📄' }
      ] },
      { name: 'Webdesign', type: 'Ordner', icon: '🗂️', children: [
        { name: 'Startseite.psd', type: 'Photoshop-Datei', icon: '🖌️' }
      ] },
      { name: 'Kürzlich geöffnet', type: 'Ordner', icon: '🕑', children: [] },
      { name: 'Browser-Verknüpfung.lnk', type: 'Verknüpfung', icon: '🔗' }
    ]
  },
  Dokumente: {
    title: 'Dokumente',
    icon: '📄',
    type: 'folder',
    canCreateFolder: false,
    items: [
      { name: 'Bericht-2026.docx', type: 'Word-Dokument', icon: '📄' },
      { name: 'Budget.xlsx', type: 'Excel-Tabelle', icon: '📊' },
      { name: 'Protokoll.pdf', type: 'PDF', icon: '🧾' }
    ]
  },
  Downloads: {
    title: 'Downloads',
    icon: '⬇️',
    type: 'folder',
    canCreateFolder: false,
    items: [
      { name: 'Installationen', type: 'Ordner', icon: '📂', children: [] },
      { name: 'Leseliste.pdf', type: 'PDF', icon: '🧾' }
    ]
  },
  Bilder: {
    title: 'Bilder',
    icon: '🖼️',
    type: 'folder',
    canCreateFolder: false,
    items: [
      { name: 'Urlaub', type: 'Ordner', icon: '🗂️', children: [
        { name: 'Strand.jpg', type: 'Bild', icon: '🖼️' }
      ] },
      { name: 'Designs', type: 'Ordner', icon: '🗂️', children: [] }
    ]
  },
  'Windows (C:)': {
    title: 'Windows (C:)',
    icon: '💽',
    type: 'drive',
    canCreateFolder: true,
    items: [
      { name: 'Programme', type: 'Ordner', icon: '📁', children: [
        { name: 'AppA', type: 'Ordner', icon: '📁', children: [] }
      ] },
      { name: 'Users', type: 'Ordner', icon: '📁', children: [
        { name: 'Julien', type: 'Ordner', icon: '📁', children: [
          { name: 'Dokumente', type: 'Ordner', icon: '📁', children: [] },
          { name: 'Bilder', type: 'Ordner', icon: '📁', children: [] }
        ] }
      ] },
      { name: 'Windows', type: 'Ordner', icon: '📁', children: [] }
    ]
  },
  'Daten (D:)': {
    title: 'Daten (D:)',
    icon: '🗄️',
    type: 'drive',
    canCreateFolder: true,
    items: [
      { name: 'Projekte', type: 'Ordner', icon: '📁', children: [
        { name: 'Website', type: 'Ordner', icon: '📁', children: [] }
      ] },
      { name: 'Medien', type: 'Ordner', icon: '📁', children: [
        { name: 'Fotos', type: 'Ordner', icon: '📁', children: [] }
      ] }
    ]
  }
};

const explorerState = {
  currentPath: ['Start']
};

function findNode(path) {
  let node = explorerData[path[0]];
  if (!node) return null;

  for (let i = 1; i < path.length; i += 1) {
    const segment = path[i];
    if (!node.items) return null;
    const child = node.items.find(item => item.name === segment);
    if (!child) return null;
    node = {
      title: child.name,
      icon: child.icon,
      type: child.children ? 'folder' : child.type,
      canCreateFolder: Boolean(child.children),
      items: child.children || []
    };
  }

  return node;
}

function getCurrentNode() {
  return findNode(explorerState.currentPath) || explorerData.Start;
}

function renderSidebar() {
  return `
    <aside class="sidebar">
      <h3>Schnellzugriff</h3>
      <div class="menu-list">
        ${QUICK_ACCESS.map(folder => `<button class="menu-item" data-folder="${folder}"><span>${explorerData[folder].icon}</span><span>${folder}</span></button>`).join('')}
      </div>
      <h3>Laufwerke</h3>
      <div class="menu-list">
        ${DRIVES.map(folder => `<button class="menu-item" data-folder="${folder}"><span>${explorerData[folder].icon}</span><span>${folder}</span></button>`).join('')}
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
  return node.items.map(item => {
    const isFolder = Boolean(item.children);
    return `
      <article class="file-card" data-item="${item.name}" data-folder="${isFolder}">
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
    const writable = currentNode.type === 'drive' || currentNode.canCreateFolder;
    newFolderBtn.disabled = !writable;
    newFolderBtn.textContent = writable ? 'Neuer Ordner' : 'Ordner nicht verfügbar';
  }
}

function setCurrentPath(win, path) {
  explorerState.currentPath = path;
  updateActiveSidebar(win);
  updateExplorerView(win);
}

function createFolder(win) {
  const currentNode = getCurrentNode();
  if (!(currentNode.type === 'drive' || currentNode.canCreateFolder)) return;

  const name = prompt('Name des neuen Ordners');
  if (!name) return;

  const normalized = name.trim();
  if (!normalized) return;

  if (currentNode.items.some(item => item.name.toLowerCase() === normalized.toLowerCase())) {
    alert('Ein Ordner mit diesem Namen existiert bereits.');
    return;
  }

  currentNode.items.push({ name: normalized, type: 'Ordner', icon: '📁', children: [] });
  updateExplorerView(win);
}

export function initializeExplorer(win) {
  win.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const folder = item.dataset.folder;
      if (!folder) return;
      setCurrentPath(win, [folder]);
    });
  });

  win.querySelector('.toolbar-btn.new-folder')?.addEventListener('click', () => createFolder(win));

  win.querySelector('.file-grid')?.addEventListener('click', (event) => {
    const card = event.target.closest('.file-card');
    if (!card) return;
    const itemName = card.dataset.item;
    const currentNode = getCurrentNode();
    const item = currentNode.items.find(entry => entry.name === itemName);
    if (!item) return;

    if (item.children) {
      setCurrentPath(win, [...explorerState.currentPath, item.name]);
      return;
    }

    alert(`${item.name} kann in dieser Demo nicht geöffnet werden.`);
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
