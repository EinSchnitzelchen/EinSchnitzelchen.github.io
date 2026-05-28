const STORAGE_KEY = 'mock-file-system-v1';

const initialFileSystem = {
  Start: {
    title: 'Start',
    icon: '🏠',
    type: 'folder',
    items: [
      { name: 'Projektplan.docx', type: 'Word-Dokument', icon: '📄', content: 'Projektplan für die kommende Demo.' },
      { name: 'Rechnung-April.pdf', type: 'PDF', icon: '🧾', content: 'Rechnungsdaten und Aufwandsposten für April.' },
      { name: 'Screenshots', type: 'Ordner', icon: '🗂️', children: [
        { name: 'Screenshot-1.png', type: 'Bild', icon: '🖼️', content: 'Bilddatei aus dem Mock-Dateisystem.' },
        { name: 'Screenshot-2.png', type: 'Bild', icon: '🖼️', content: 'Zweite Demo-Bilddatei.' }
      ]},
      { name: 'Designs.fig', type: 'Figma-Datei', icon: '🎨', content: 'Figma-Entwürfe für die Oberfläche.' },
      { name: 'Urlaub.jpg', type: 'Bild', icon: '🖼️', content: 'Urlaubsfoto aus dem Mock-Dateisystem.' },
      { name: 'Musik', type: 'Ordner', icon: '🎵', children: [
        { name: 'Playlist.m3u', type: 'M3U-Datei', icon: '🎶', content: 'Demo-Playlist für das Mock-Dateisystem.' }
      ] },
      { name: 'Setup.exe', type: 'Anwendung', icon: '🧩', content: 'Demo-Anwendung für den Desktop.' },
      { name: 'Archiv.zip', type: 'ZIP-Archiv', icon: '🗜️', content: 'Archiv mit Demo-Dateien.' },
      { name: 'Notiz-Export.txt', type: 'Textdatei', icon: '📄', content: 'Diese Datei wurde als Mock-Note in Notes geöffnet.' }
    ]
  },
  Desktop: {
    title: 'Desktop',
    icon: '🖥️',
    type: 'folder',
    items: [
      { name: 'Arbeitsbereich', type: 'Ordner', icon: '🗂️', children: [
        { name: 'Meeting-Notizen.txt', type: 'Textdatei', icon: '📄', content: 'Besprechungsnotizen aus dem Desktop.' }
      ] },
      { name: 'Webdesign', type: 'Ordner', icon: '🗂️', children: [
        { name: 'Startseite.psd', type: 'Photoshop-Datei', icon: '🖌️', content: 'Photoshop-Datei für das Mock-Dateisystem.' }
      ] },
      { name: 'Kürzlich geöffnet', type: 'Ordner', icon: '🕑', children: [] },
      { name: 'Browser-Verknüpfung.lnk', type: 'Verknüpfung', icon: '🔗', content: 'Verknüpfung zur Browser-App.' }
    ]
  },
  Dokumente: {
    title: 'Dokumente',
    icon: '📄',
    type: 'folder',
    items: [
      { name: 'Bericht-2026.docx', type: 'Word-Dokument', icon: '📄', content: 'Bericht für das Jahr 2026.' },
      { name: 'Budget.xlsx', type: 'Excel-Tabelle', icon: '📊', content: 'Budgetdaten für das erste Halbjahr.' },
      { name: 'Protokoll.pdf', type: 'PDF', icon: '🧾', content: 'Protokoll der letzten Projektbesprechung.' }
    ]
  },
  Downloads: {
    title: 'Downloads',
    icon: '⬇️',
    type: 'folder',
    items: [
      { name: 'Installationen', type: 'Ordner', icon: '📂', children: [] },
      { name: 'Leseliste.pdf', type: 'PDF', icon: '🧾', content: 'Leseliste mit offenen Aufgaben.' }
    ]
  },
  Bilder: {
    title: 'Bilder',
    icon: '🖼️',
    type: 'folder',
    items: [
      { name: 'Urlaub', type: 'Ordner', icon: '🗂️', children: [
        { name: 'Strand.jpg', type: 'Bild', icon: '🖼️', content: 'Bild aus dem Urlaub.' }
      ] },
      { name: 'Designs', type: 'Ordner', icon: '🗂️', children: [] }
    ]
  },
  'Windows (C:)': {
    title: 'Windows (C:)',
    icon: '💽',
    type: 'drive',
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getStore() {
  if (typeof localStorage === 'undefined') return clone(initialFileSystem);
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : clone(initialFileSystem);
}

function saveStore(store) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
}

const store = getStore();

function resolveNode(path) {
  if (!Array.isArray(path) || !path.length) return null;

  let node = store[path[0]];
  if (!node) return null;

  for (let i = 1; i < path.length; i += 1) {
    const key = path[i];
    if (!node.items) return null;
    const child = node.items.find(item => item.name === key);
    if (!child) return null;
    node = child.children ? { title: child.name, icon: child.icon, type: 'folder', items: child.children } : { title: child.name, icon: child.icon, type: child.type || 'file', items: child.children || [] };
  }

  return node;
}

function resolveParentFolder(path) {
  if (!Array.isArray(path) || path.length === 0) return null;
  return resolveNode(path);
}

function findItem(path) {
  if (!Array.isArray(path) || !path.length) return null;

  let current = store[path[0]];
  if (!current) return null;

  for (let i = 1; i < path.length; i += 1) {
    const next = path[i];
    if (!current.items) return null;
    const item = current.items.find(entry => entry.name === next);
    if (!item) return null;
    if (i === path.length - 1) return item;
    current = item;
  }

  return current;
}

function getFolderItems(path) {
  const node = resolveNode(path);
  return node && node.items ? node.items : [];
}

export function getFileSystemSnapshot() {
  return clone(store);
}

export function listFolder(path) {
  return getFolderItems(path);
}

export function getItem(path) {
  return findItem(path);
}

export function getCurrentFolder(path) {
  const node = resolveNode(path);
  return node ? { ...node, items: getFolderItems(path) } : null;
}

export function createFolder(path, name) {
  const folder = resolveParentFolder(path);
  if (!folder || !folder.items) return null;

  const normalized = name.trim();
  if (!normalized || folder.items.some(item => item.name.toLowerCase() === normalized.toLowerCase())) return null;

  const entry = { name: normalized, type: 'Ordner', icon: '📁', children: [] };
  folder.items.push(entry);
  saveStore(store);
  return entry;
}

export function moveItem(sourcePath, targetPath) {
  const item = findItem(sourcePath);
  const targetFolder = resolveParentFolder(targetPath);
  if (!item || !targetFolder || !targetFolder.items) return null;

  const sourceFolder = sourcePath.length > 1 ? resolveParentFolder(sourcePath.slice(0, -1)) : { items: store[sourcePath[0]].items };
  if (!sourceFolder || !sourceFolder.items) return null;

  if (sourcePath.join('/') === targetPath.join('/')) return item;

  sourceFolder.items = sourceFolder.items.filter(entry => entry.name !== item.name);
  if (!targetFolder.items.some(entry => entry.name.toLowerCase() === item.name.toLowerCase())) {
    targetFolder.items.push(clone(item));
  }
  saveStore(store);
  return item;
}

export function getRootFolders() {
  return Object.keys(store).map(name => ({ name, ...store[name] }));
}

export function openFile(path) {
  const item = findItem(path);
  if (!item) return null;
  return { ...item, path: path.slice() };
}

export function resetFileSystem() {
  const fresh = clone(initialFileSystem);
  Object.keys(store).forEach(key => delete store[key]);
  Object.assign(store, fresh);
  saveStore(store);
  return clone(store);
}
