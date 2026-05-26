export function renderExplorer() {
  return `
    <div class="explorer-layout">
      <aside class="sidebar">
        <h3>Schnellzugriff</h3>
        <div class="menu-list">
          <button class="menu-item active" data-folder="Start"><span>🏠</span><span>Start</span></button>
          <button class="menu-item" data-folder="Desktop"><span>🖥️</span><span>Desktop</span></button>
          <button class="menu-item" data-folder="Dokumente"><span>📄</span><span>Dokumente</span></button>
          <button class="menu-item" data-folder="Downloads"><span>⬇️</span><span>Downloads</span></button>
          <button class="menu-item" data-folder="Bilder"><span>🖼️</span><span>Bilder</span></button>
        </div>
        <h3>Laufwerke</h3>
        <div class="menu-list">
          <button class="menu-item" data-folder="Windows (C:)"><span>💽</span><span>Windows (C:)</span></button>
          <button class="menu-item" data-folder="Daten (D:)"><span>🗄️</span><span>Daten (D:)</span></button>
        </div>
      </aside>
      <div class="explorer-main">
        <div class="window-toolbar">
          <div class="toolbar-group"><button class="toolbar-btn">Neu</button><button class="toolbar-btn">Sortieren</button><button class="toolbar-btn">Ansicht</button></div>
          <div class="toolbar-group"><button class="toolbar-btn primary">Teilen</button></div>
        </div>
        <div class="pathbar"><span class="crumb">Schnellzugriff</span><span class="crumb">Start</span></div>
        <div class="file-grid">
          ${[
            ['Projektplan.docx','Word-Dokument','📄'],['Rechnung-April.pdf','PDF','🧾'],['Screenshots','Ordner','🗂️'],['Designs.fig','Figma Datei','🎨'],['Urlaub.jpg','Bild','🖼️'],['Musik','Ordner','🎵'],['Setup.exe','Anwendung','🧩'],['Archiv.zip','ZIP-Archiv','🗜️']
          ].map(([name,type,emoji]) => `
            <article class="file-card">
              <div class="file-thumb">${emoji}</div>
              <div><strong style="display:block;font-size:var(--text-sm)">${name}</strong><div class="file-meta">${type}</div></div>
            </article>`).join('')}
        </div>
      </div>
    </div>`;
}
