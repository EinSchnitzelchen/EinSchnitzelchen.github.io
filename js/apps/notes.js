import { state } from '../state.js';
import { openFile } from '../filesystem.js';

export function renderNotes() {
  return `
    <div class="notes-editor">
      <div class="window-toolbar"><div class="toolbar-group"><button class="toolbar-btn primary">Speichern</button><button class="toolbar-btn">Teilen</button><button class="toolbar-btn">Format</button></div><div class="toolbar-group"><span class="chip">Markdown</span></div></div>
      <div class="notes-content">
        <div class="notes-dropzone">Datei aus dem Explorer hierher ziehen, um sie in Notes zu öffnen.</div>
        <textarea class="editor" aria-label="Notizeditor"></textarea>
      </div>
    </div>`;
}

export function setupNotes(win) {
  const textarea = win.querySelector('.editor');
  const dropzone = win.querySelector('.notes-dropzone');
  const notesContent = win.querySelector('.notes-content');

  textarea.value = state.notes;
  textarea.addEventListener('input', () => state.notes = textarea.value);

  const markDropZone = active => {
    dropzone?.classList.toggle('active', active);
  };

  notesContent?.addEventListener('dragover', event => {
    if (event.dataTransfer?.types?.includes('application/x-mock-file')) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      markDropZone(true);
    }
  });

  notesContent?.addEventListener('dragleave', () => markDropZone(false));
  notesContent?.addEventListener('drop', event => {
    const raw = event.dataTransfer?.getData('application/x-mock-file');
    if (!raw) return;
    event.preventDefault();
    markDropZone(false);
    try {
      const path = JSON.parse(raw);
      const file = openFile(path);
      if (!file || !file.content) return;
      textarea.value = file.content;
      state.notes = file.content;
      dropzone.textContent = `Datei geöffnet: ${file.name}`;
    } catch {
      dropzone.textContent = 'Datei konnte nicht geöffnet werden.';
    }
  });
}

