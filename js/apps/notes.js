export function renderNotes() {
  return `
    <div class="notes-editor">
      <div class="window-toolbar"><div class="toolbar-group"><button class="toolbar-btn primary">Speichern</button><button class="toolbar-btn">Teilen</button><button class="toolbar-btn">Format</button></div><div class="toolbar-group"><span class="chip">Markdown</span></div></div>
      <div class="notes-content"><textarea class="editor" aria-label="Notizeditor"></textarea></div>
    </div>`;
}
