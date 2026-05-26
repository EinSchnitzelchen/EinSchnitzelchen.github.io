export function renderRecycle() {
  return `
    <div class="window-toolbar"><div class="toolbar-group"><button class="toolbar-btn">Papierkorb leeren</button><button class="toolbar-btn">Wiederherstellen</button></div></div>
    <div class="file-grid">
      ${[['alte-skizze.png','Vor 2 Tagen'],['temp-export.csv','Vor 4 Tagen'],['konzept-alt.docx','Vor 1 Woche']].map(([name,time]) => `<article class="file-card"><div class="file-thumb">🗑️</div><div><strong style="display:block;font-size:var(--text-sm)">${name}</strong><div class="file-meta">${time}</div></div></article>`).join('')}
    </div>`;
}
