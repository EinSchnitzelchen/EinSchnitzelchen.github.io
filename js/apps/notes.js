import { state } from '../state.js';
import { openFile, writeFile, createFile, getFileSystemSnapshot } from '../filesystem.js';

export function renderNotes() {
  return `
    <div class="notes-app-layout">
      <!-- SIDEBAR -->
      <aside class="notes-sidebar">
        <div class="notes-sidebar-header">
          <div class="notes-sidebar-title">Meine Notizen</div>
          <button class="toolbar-btn primary new-note-btn" style="width: 100%; margin-top: 0.25rem;">＋ Neue Notiz</button>
        </div>
        <div class="notes-list">
          <!-- Dynamically loaded files -->
        </div>
      </aside>

      <!-- MAIN AREA -->
      <div class="notes-main-area">
        <!-- MINIMAL ACTION HEADER -->
        <div class="notes-header-minimal">
          <div class="notes-file-title">Neue Notiz</div>
          <div class="notes-minimal-actions">
            <button class="toolbar-btn primary save-btn" title="Notiz speichern (Strg+S)">Speichern</button>
            <button class="toolbar-btn export-btn" title="Auf echten PC herunterladen (Strg+E)">Herunterladen</button>
          </div>
        </div>

        <!-- DROPZONE -->
        <div class="notes-dropzone">Datei aus dem Explorer hierher ziehen, um sie zu öffnen.</div>
        
        <!-- EDITOR & PREVIEW PANES -->
        <div class="notes-panes split-view">
          <div class="editor-container">
            <textarea class="editor" aria-label="Notizeditor" placeholder="Schreibe hier deine Gedanken in Markdown..."></textarea>
          </div>
          <div class="preview-container"></div>
        </div>
        
        <!-- STATUS BAR -->
        <div class="notes-statusbar">
          <div class="notes-status-left">
            <span class="notes-status-dot"></span>
            <span class="notes-status-file-path">Neue Notiz</span>
          </div>
          <div class="notes-status-right">
            <span class="notes-status-words">0 Wörter</span>
            <span class="notes-status-chars">0 Zeichen</span>
            <span class="chip">Markdown</span>
          </div>
        </div>

        <!-- SAVE AS OVERLAY DIALOG -->
        <div class="notes-save-prompt-overlay" style="display: none;">
          <div class="notes-save-prompt">
            <h3 style="margin: 0; font-size: var(--text-base);">Notiz speichern unter...</h3>
            <p style="margin: 0; font-size: var(--text-xs); color: var(--color-text-muted);">Gib einen Namen für die Datei ein. Sie wird in "Dokumente" gespeichert.</p>
            <input class="folder-name-input notes-file-name-input" type="text" placeholder="meine-notiz.md" maxlength="40" />
            <div class="folder-prompt-actions">
              <button class="toolbar-btn notes-save-cancel" type="button">Abbrechen</button>
              <button class="toolbar-btn primary notes-save-confirm" type="button">Speichern</button>
            </div>
          </div>
        </div>

        <!-- TOAST OVERLAY -->
        <div class="notes-toast">In die Zwischenablage kopiert! 📋</div>
      </div>
    </div>`;
}

export function setupNotes(win) {
  const textarea = win.querySelector('.editor');
  const preview = win.querySelector('.preview-container');
  const dropzone = win.querySelector('.notes-dropzone');
  const notesPanes = win.querySelector('.notes-panes');
  
  const saveBtn = win.querySelector('.save-btn');
  const exportBtn = win.querySelector('.export-btn');
  const newNoteBtn = win.querySelector('.new-note-btn');
  const headerTitle = win.querySelector('.notes-file-title');
  
  const statusDot = win.querySelector('.notes-status-dot');
  const statusPath = win.querySelector('.notes-status-file-path');
  const statusWords = win.querySelector('.notes-status-words');
  const statusChars = win.querySelector('.notes-status-chars');
  
  const formatButtons = win.querySelectorAll('.format-btn');
  const togglePreviewBtn = win.querySelector('.toggle-preview-btn');
  
  const saveAsOverlay = win.querySelector('.notes-save-prompt-overlay');
  const saveAsInput = win.querySelector('.notes-file-name-input');
  const saveAsCancel = win.querySelector('.notes-save-cancel');
  const saveAsConfirm = win.querySelector('.notes-save-confirm');
  
  const toast = win.querySelector('.notes-toast');
  const sidebarList = win.querySelector('.notes-list');

  // Application State
  let currentFilePath = null;
  let isDirty = false;

  // 1. Recursive finder to list all text files (.txt, .md, type: 'Textdatei')
  function findTextFiles() {
    const files = [];
    const storeSnapshot = getFileSystemSnapshot();

    function traverse(node, currentPath) {
      if (!node) return;
      if (node.items) {
        node.items.forEach(item => {
          if (item.children) {
            traverse({ items: item.children }, [...currentPath, item.name]);
          } else if (item.type === 'Textdatei' || item.name.endsWith('.txt') || item.name.endsWith('.md')) {
            files.push({
              name: item.name,
              path: [...currentPath, item.name],
              content: item.content || ''
            });
          }
        });
      }
    }

    Object.keys(storeSnapshot).forEach(rootName => {
      traverse(storeSnapshot[rootName], [rootName]);
    });

    return files;
  }

  // 2. Render sidebar list
  function updateSidebarList() {
    sidebarList.innerHTML = '';
    const files = findTextFiles();

    if (files.length === 0) {
      sidebarList.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--color-text-muted); font-size: var(--text-xs);">Keine Notizen gefunden</div>';
      return;
    }

    files.forEach(file => {
      const button = document.createElement('button');
      button.className = 'notes-item';
      
      const isActive = currentFilePath && currentFilePath.join('/') === file.path.join('/');
      if (isActive) {
        button.classList.add('active');
      }

      button.innerHTML = `
        <span class="notes-item-info">
          <span>📄</span>
          <span class="notes-item-name" title="${file.name}">${file.name}</span>
        </span>
      `;

      button.addEventListener('click', () => {
        if (isActive) return;
        if (isDirty && !confirm('Ungespeicherte Änderungen gehen verloren. Trotzdem fortfahren?')) {
          return;
        }
        win.openFile(file.path);
      });

      sidebarList.appendChild(button);
    });
  }

  // 3. Expose win.openFile globally so other windows can call it
  win.openFile = function(path) {
    const file = openFile(path);
    if (!file) return;

    currentFilePath = path;
    textarea.value = file.content || '';
    isDirty = false;
    
    // Hide dropzone
    if (dropzone) dropzone.style.display = 'none';

    updateStatusBar();
    renderMarkdownPreview();
    updateSidebarList();
  };

  // 4. Custom Markdown Parser (Lightweight, robust, secure)
  function parseMarkdown(text) {
    if (!text) {
      return `<p style="color: var(--color-text-muted); font-style: italic; text-align: center; padding-top: 2rem;">Kein Inhalt. Schreibe etwas im Editor, um die Live-Vorschau zu sehen!</p>`;
    }

    // Escape HTML to prevent injection
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Fenced code blocks: ```code```
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Inline code: `code`
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headings
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');

    // Blockquotes
    html = html.replace(/^&gt; (.*?)$/gm, '<blockquote>$1</blockquote>');

    // Horizontal Rules
    html = html.replace(/^---$/gm, '<hr>');

    // Bold and Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Links: [Text](URL)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Lists (Unordered lists)
    const lines = html.split('\n');
    let inList = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const content = line.substring(2);
        if (!inList) {
          lines[i] = '<ul><li>' + content + '</li>';
          inList = true;
        } else {
          lines[i] = '<li>' + content + '</li>';
        }
      } else {
        if (inList) {
          lines[i] = '</ul>' + lines[i];
          inList = false;
        }
      }
    }
    if (inList) {
      lines[lines.length - 1] = lines[lines.length - 1] + '</ul>';
    }
    html = lines.join('\n');

    // Paragraphs: Wrap blocks of text not inside block tags in <p>
    html = html.split('\n').map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || trimmed.startsWith('</pre') || 
          trimmed.startsWith('<code') || trimmed.startsWith('</code') || trimmed.startsWith('<ul') || 
          trimmed.startsWith('</ul') || trimmed.startsWith('<li') || trimmed.startsWith('</li') || 
          trimmed.startsWith('<blockquote') || trimmed.startsWith('</blockquote') || trimmed.startsWith('<hr')) {
        return line;
      }
      return '<p>' + trimmed + '</p>';
    }).join('\n');

    return html;
  }

  // 5. Render markdown preview
  function renderMarkdownPreview() {
    preview.innerHTML = parseMarkdown(textarea.value);
  }

  // 6. Update Status Bar details
  function updateStatusBar() {
    // Update minimal header title
    if (headerTitle) {
      if (currentFilePath) {
        const fileName = currentFilePath[currentFilePath.length - 1];
        headerTitle.textContent = fileName + (isDirty ? ' *' : '');
      } else {
        headerTitle.textContent = 'Neue Notiz' + (isDirty ? ' *' : '');
      }
    }

    // 1. File Path
    if (currentFilePath) {
      statusPath.textContent = currentFilePath.join('/');
    } else {
      statusPath.textContent = 'Neue Notiz';
    }

    // 2. Saved Status Dot
    statusDot.className = 'notes-status-dot';
    if (isDirty) {
      statusDot.classList.add('unsaved');
      statusDot.title = 'Ungespeicherte Änderungen';
    } else {
      statusDot.title = 'Alle Änderungen gespeichert';
    }

    // 3. Characters & Words Count
    const text = textarea.value || '';
    const charCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

    statusChars.textContent = `${charCount} Zeichen`;
    statusWords.textContent = `${wordCount} Wörter`;
  }

  // 7. Textarea Input Sync
  textarea.addEventListener('input', () => {
    isDirty = true;
    state.notes = textarea.value; // Sync with OS state for backward compatibility
    renderMarkdownPreview();
    updateStatusBar();
  });

  // 7.5 Export Function (Real browser download)
  function exportNote() {
    let fileName = 'Notiz.md';
    if (currentFilePath) {
      fileName = currentFilePath[currentFilePath.length - 1];
    } else if (textarea.value.trim()) {
      const firstLine = textarea.value.trim().split('\n')[0].replace(/[#*`>]/g, '').trim().substring(0, 15);
      if (firstLine) {
        fileName = firstLine.toLowerCase().replace(/[^a-z0-9_-]/g, '-') + '.md';
      }
    }

    const blob = new Blob([textarea.value], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Notiz als Datei heruntergeladen! 📥');
  }

  // 8. Save Function
  function saveNote() {
    if (currentFilePath) {
      const success = writeFile(currentFilePath, textarea.value);
      if (success) {
        isDirty = false;
        updateStatusBar();
        updateSidebarList();
        
        // Dispatch global event so that Explorer updates
        document.dispatchEvent(new CustomEvent('fs-change'));
        
        // Show saved Toast
        showToast('Notiz erfolgreich gespeichert! 💾');
      } else {
        alert('Fehler beim Speichern der Datei.');
      }
    } else {
      saveNoteAs();
    }
  }

  // 9. Save As Function
  function saveNoteAs() {
    saveAsOverlay.style.display = 'grid';
    // Prefill file name
    let defaultName = 'Notiz.md';
    if (textarea.value.trim()) {
      const firstLine = textarea.value.trim().split('\n')[0].replace(/[#*`>]/g, '').trim().substring(0, 15);
      if (firstLine) {
        defaultName = firstLine.toLowerCase().replace(/[^a-z0-9_-]/g, '-') + '.md';
      }
    }
    saveAsInput.value = defaultName;
    saveAsInput.focus();
    saveAsInput.select();
  }

  // Save As Handlers
  saveAsCancel.addEventListener('click', () => {
    saveAsOverlay.style.display = 'none';
  });

  saveAsConfirm.addEventListener('click', () => {
    let fileName = saveAsInput.value.trim();
    if (!fileName) return;

    if (!fileName.endsWith('.md') && !fileName.endsWith('.txt')) {
      fileName += '.md';
    }

    const entry = createFile(['Dokumente'], fileName, textarea.value);
    if (!entry) {
      alert('Eine Datei mit diesem Namen existiert bereits im Ordner Dokumente.');
      return;
    }

    saveAsOverlay.style.display = 'none';
    currentFilePath = ['Dokumente', fileName];
    isDirty = false;

    updateStatusBar();
    updateSidebarList();

    // Trigger explorer refresh
    document.dispatchEvent(new CustomEvent('fs-change'));
    showToast('Erfolgreich gespeichert in "Dokumente"! 📂');
  });

  // Handle Enter/Escape inside save overlay
  saveAsInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveAsConfirm.click();
    if (e.key === 'Escape') saveAsCancel.click();
  });

  // 10. New Note Function
  newNoteBtn.addEventListener('click', () => {
    if (isDirty && !confirm('Ungespeicherte Änderungen gehen verloren. Neue Notiz anlegen?')) {
      return;
    }
    currentFilePath = null;
    textarea.value = '';
    isDirty = false;
    if (dropzone) dropzone.style.display = 'block';
    
    updateStatusBar();
    renderMarkdownPreview();
    updateSidebarList();
    textarea.focus();
  });

  // 11. Format Buttons Event Listener
  function insertFormatting(tag) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;
    const selectedText = val.substring(start, end);
    
    let insertion = '';
    let offset = 0;
    let length = 0;
    
    switch (tag) {
      case 'bold':
        insertion = `**${selectedText || 'Fettgedruckter Text'}**`;
        offset = 2;
        length = (selectedText || 'Fettgedruckter Text').length;
        break;
      case 'italic':
        insertion = `*${selectedText || 'Kursiver Text'}*`;
        offset = 1;
        length = (selectedText || 'Kursiver Text').length;
        break;
      case 'heading':
        insertion = `\n# ${selectedText || 'Überschrift'}\n`;
        offset = 2;
        length = (selectedText || 'Überschrift').length;
        break;
      case 'list':
        insertion = `\n- ${selectedText || 'Listenpunkt'}\n`;
        offset = 3;
        length = (selectedText || 'Listenpunkt').length;
        break;
      case 'code':
        insertion = `\n\`\`\`javascript\n${selectedText || '// Code hier'}\n\`\`\`\n`;
        offset = 13;
        length = (selectedText || '// Code hier').length;
        break;
    }
    
    textarea.value = val.substring(0, start) + insertion + val.substring(end);
    textarea.focus();
    
    // Restore or select the text beautifully
    textarea.setSelectionRange(start + offset, start + offset + length);
    
    isDirty = true;
    updateStatusBar();
    renderMarkdownPreview();
  }

  formatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      insertFormatting(tag);
    });
  });

  // 12. Preview Toggle handler (Show/Hide side-by-side preview)
  let showPreview = true;

  function updateLayout() {
    if (togglePreviewBtn) {
      togglePreviewBtn.classList.toggle('active', showPreview);
    }

    if (!showPreview) {
      notesPanes.className = 'notes-panes edit-only';
      textarea.focus();
    } else {
      notesPanes.className = 'notes-panes split-view';
    }
  }

  if (togglePreviewBtn) {
    togglePreviewBtn.addEventListener('click', () => {
      showPreview = !showPreview;
      updateLayout();
    });
  }

  // 13. Share Button Handler (Clipboard Copy)


  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  // 14. Save & Export Buttons & Keybinds
  if (saveBtn) saveBtn.addEventListener('click', saveNote);
  if (exportBtn) exportBtn.addEventListener('click', exportNote);

  textarea.addEventListener('keydown', e => {
    // Ctrl + S: Speichern
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      saveNote();
    }
    // Ctrl + B: Fett
    if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      insertFormatting('bold');
    }
    // Ctrl + I: Kursiv
    if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      insertFormatting('italic');
    }
    // Ctrl + P: Vorschau umschalten
    if (e.key === 'p' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      showPreview = !showPreview;
      updateLayout();
    }
    // Ctrl + E: Exportieren / Herunterladen auf echten PC
    if (e.key === 'e' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      exportNote();
    }
  });

  // 15. Drag & Drop Support
  const markDropZone = active => {
    dropzone?.classList.toggle('active', active);
  };

  win.querySelector('.notes-main-area')?.addEventListener('dragover', event => {
    if (event.dataTransfer?.types?.includes('application/x-mock-file')) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      markDropZone(true);
    }
  });

  win.querySelector('.notes-main-area')?.addEventListener('dragleave', () => markDropZone(false));
  
  win.querySelector('.notes-main-area')?.addEventListener('drop', event => {
    const raw = event.dataTransfer?.getData('application/x-mock-file');
    if (!raw) return;
    event.preventDefault();
    markDropZone(false);
    try {
      const path = JSON.parse(raw);
      win.openFile(path);
      showToast('Datei erfolgreich importiert! 📂');
    } catch {
      showToast('Datei konnte nicht geöffnet werden. ❌');
    }
  });

  // INITIAL LOAD
  // Sync editor with state.notes initially (default mock text)
  if (state.notes) {
    textarea.value = state.notes;
  }
  
  updateStatusBar();
  renderMarkdownPreview();
  updateSidebarList();
}
