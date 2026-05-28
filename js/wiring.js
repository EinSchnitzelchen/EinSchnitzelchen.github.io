import { state } from './state.js';
import { toggleTheme, cycleWallpaper } from './theme.js';
import { notify } from './utils.js';
import { initializeExplorer } from './apps/explorer.js';
import { openFile } from './filesystem.js';

export function wireAppInternals(win) {
  const app = win.dataset.app;
  if (app === 'notes') {
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
  if (app === 'calc') setupCalculator(win);
  if (app === 'paint') setupPaint(win);
  if (app === 'terminal') setupTerminal(win);
  if (app === 'settings') {
    win.querySelectorAll('[data-theme-choice]').forEach(btn => btn.addEventListener('click', () => toggleTheme(btn.dataset.themeChoice)));
    win.querySelectorAll('.switch').forEach(sw => sw.addEventListener('click', () => sw.classList.toggle('on')));
    const wallpaperTheme = win.querySelector('#wallpaperTheme');
    if (wallpaperTheme) wallpaperTheme.addEventListener('click', cycleWallpaper);
  }
  if (app === 'explorer') {
    initializeExplorer(win);
  }
  if (app === 'browser') {
    const addressForm = win.querySelector('.address-bar');
    const addressInput = win.querySelector('.address-input');
    const openUrlBtn = win.querySelector('.open-url');
    const backBtn = win.querySelector('.nav-back');
    const forwardBtn = win.querySelector('.nav-forward');
    const refreshBtn = win.querySelector('.refresh');
    const browserStart = win.querySelector('.browser-start');
    const browserView = win.querySelector('.browser-view');
    const browserIframe = win.querySelector('.browser-iframe');

    const history = [];
    let historyIndex = -1;

    const normalizeUrl = value => {
      const input = String(value || '').trim();
      if (!input) return 'https://www.bing.com';
      if (/^https?:\/\//i.test(input)) return input;
      if (input.includes(' ') || !input.includes('.')) return `https://www.bing.com/search?q=${encodeURIComponent(input)}`;
      return `https://${input}`;
    };

    const updateNavigation = () => {
      backBtn.disabled = historyIndex <= 0;
      forwardBtn.disabled = historyIndex >= history.length - 1;
    };

    const loadUrl = (rawValue, push = true) => {
      const url = normalizeUrl(rawValue);
      addressInput.value = url;
      if (push) {
        history.splice(historyIndex + 1);
        history.push(url);
        historyIndex = history.length - 1;
      }
      browserIframe.src = url;
      browserStart.classList.add('hidden');
      browserView.classList.remove('hidden');
      updateNavigation();
    };

    const loadHistory = offset => {
      const nextIndex = historyIndex + offset;
      if (nextIndex < 0 || nextIndex >= history.length) return;
      historyIndex = nextIndex;
      const url = history[historyIndex];
      addressInput.value = url;
      browserIframe.src = url;
      updateNavigation();
    };

    addressForm.addEventListener('submit', e => {
      e.preventDefault();
      loadUrl(addressInput.value);
    });

    openUrlBtn.addEventListener('click', () => loadUrl(addressInput.value));
    refreshBtn.addEventListener('click', () => {
      if (!browserView.classList.contains('hidden')) {
        browserIframe.src = browserIframe.src;
      }
    });
    backBtn.addEventListener('click', () => loadHistory(-1));
    forwardBtn.addEventListener('click', () => loadHistory(1));

    browserIframe.addEventListener('load', () => {
      try {
        const doc = browserIframe.contentDocument;
        if (!doc) return;
        const base = doc.querySelector('base') || doc.createElement('base');
        base.target = '_self';
        if (!base.parentNode && doc.head) doc.head.prepend(base);
        doc.querySelectorAll('a[target="_blank"]').forEach(link => link.removeAttribute('target'));
      } catch (error) {
        // Cross-origin pages können nicht umgeschrieben werden.
      }
    });

    win.querySelectorAll('.article-card').forEach(card => {
      const href = card.dataset.href || 'https://www.bing.com';
      card.addEventListener('click', () => loadUrl(href));
    });
  }
}

function setupPaint(win) {
  const canvas = win.querySelector('.paint-canvas');
  const ctx = canvas.getContext('2d');
  const sizeInput = win.querySelector('[data-paint-size]');
  const colorButtons = win.querySelectorAll('[data-paint-color]');
  const modeButtons = win.querySelectorAll('[data-paint-mode]');
  const actionButtons = win.querySelectorAll('[data-paint-action]');

  let currentColor = '#111827';
  let currentMode = 'brush';
  let currentSize = Number(sizeInput?.value || 4);
  let drawing = false;
  const history = [];

  const saveState = () => history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  const restoreState = () => {
    if (!history.length) return;
    const state = history.pop();
    ctx.putImageData(state, 0, 0);
  };

  const getPoint = event => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  const beginStroke = event => {
    event.preventDefault();
    saveState();
    drawing = true;
    const point = getPoint(event);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentMode === 'eraser' ? '#ffffff' : currentColor;
    ctx.lineWidth = currentMode === 'eraser' ? currentSize * 2 : currentSize;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const drawStroke = event => {
    if (!drawing) return;
    const point = getPoint(event);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const endStroke = () => {
    if (!drawing) return;
    drawing = false;
    ctx.closePath();
  };

  sizeInput?.addEventListener('input', event => {
    currentSize = Number(event.target.value || 4);
  });

  colorButtons.forEach(btn => btn.addEventListener('click', () => {
    currentColor = btn.dataset.paintColor;
    currentMode = 'brush';
    modeButtons.forEach(mode => mode.classList.toggle('primary', mode.dataset.paintMode === 'brush'));
    colorButtons.forEach(b => b.classList.toggle('active', b === btn));
  }));

  modeButtons.forEach(btn => btn.addEventListener('click', () => {
    currentMode = btn.dataset.paintMode;
    modeButtons.forEach(b => b.classList.toggle('primary', b === btn));
  }));

  actionButtons.forEach(btn => btn.addEventListener('click', () => {
    const action = btn.dataset.paintAction;
    if (action === 'clear') {
      saveState();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }
    if (action === 'undo') restoreState();
    if (action === 'new') {
      saveState();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (action === 'save') {
      const link = document.createElement('a');
      link.download = 'zeichnung.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }));

  canvas.addEventListener('pointerdown', beginStroke);
  canvas.addEventListener('pointermove', drawStroke);
  window.addEventListener('pointerup', endStroke);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function setupCalculator(win) {
  const buttons = win.querySelectorAll('[data-calc]');
  const expr = win.querySelector('.calc-expression');
  const result = win.querySelector('.calc-result');
  let buffer = '';
  buttons.forEach(btn => btn.addEventListener('click', () => {
    const val = btn.dataset.calc;
    if (val === 'C') { buffer = ''; expr.textContent = ''; result.textContent = '0'; return; }
    if (val === '=') {
      try {
        const out = Function(`return (${buffer || 0})`)();
        result.textContent = String(out);
        expr.textContent = buffer;
        buffer = String(out);
      } catch {
        result.textContent = 'Fehler';
      }
      return;
    }
    if (val === '⌫') { buffer = buffer.slice(0,-1); result.textContent = buffer || '0'; return; }
    buffer += val;
    result.textContent = buffer;
  }));
}

function setupTerminal(win) {
  const output = win.querySelector('.terminal-output');
  const input = win.querySelector('.terminal-input');
  
  // ASCII Art Welcome Screen
  const welcomeText = `╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║            ██║ ██╗   ██╗╗██╗     ██╗███████╗███╗   ██╗         ║
║            ██║ ██║   ██║║██║     ██║██╔════╝████╗  ██║         ║
║            ██║ ██║   ██║║██║     ██║█████╗  ██╔██╗ ██║         ║
║      ██║   ██║ ██║   ██║║██║     ██║██╔══╝  ██║╚██╗██║         ║
║      ╚██████╔╝ ╚██████╔╝║███████╗██║███████╗██║ ╚████║         ║
║                                                                ║
║                                                                ║
║          ✨ Portfolio & Website Interaction CLI ✨            ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

 [System Boot] Initializing system components...
 → Loading modules...`;

  const systemInfo = `
 ✓ Theme Engine initialized
 ✓ Clock Service running
 ✓ Desktop Shell ready
 ✓ Terminal Session established
 ✓ GitHub Integration loaded

 ╔════════════════════════════════════════════════════════════════╗
 ║                    📂 Available Resources                      ║
 ╚════════════════════════════════════════════════════════════════╝

 🔗 GitHub Repository:
    https://github.com/EinSchnitzelchen/EinSchnitzelchen.github.io

 📝 Documentation:
    → Main README: https://github.com/EinSchnitzelchen/EinSchnitzelchen.github.io/blob/main/README.md
    → Architecture: https://github.com/EinSchnitzelchen/EinSchnitzelchen.github.io/blob/main/ARCHITECTURE.md
    → Contributing: https://github.com/EinSchnitzelchen/EinSchnitzelchen.github.io/blob/main/CONTRIBUTING.md

 💻 Technology Stack:
    → Vanilla JavaScript (ES6 Modules)
    → CSS3 with Grid & Flexbox
    → HTML5 Semantic Markup
    → Modular Architecture

 ═══════════════════════════════════════════════════════════════

 Welcome! Type "help" to see available commands.
 Type "about" for more information about this portfolio.
 Type "projects" to view featured projects.
 
 ═══════════════════════════════════════════════════════════════
 `;

  // Typewriter effect
  let charIndex = 0;
  const fullText = welcomeText + systemInfo;
  
  const typeWriter = () => {
    if (charIndex < fullText.length) {
      output.textContent = fullText.substring(0, charIndex + 1);
      output.scrollTop = output.scrollHeight;
      charIndex++;
      setTimeout(typeWriter, 5); // 5ms delay between characters
    }
  };
  
  typeWriter();
  
  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const cmd = input.value.trim();
    const response = runTerminalCommand(cmd);
    output.textContent += `\nPS C:\\Users\\Julien> ${cmd}\n${response}\n`;
    output.scrollTop = output.scrollHeight;
    input.value = '';
  });
}

function runTerminalCommand(cmd) {
  if (!cmd) return '';
  
  if (cmd === 'help') return `Available Commands:
  help ..................... Show this help message
  about .................... About this portfolio
  projects ................ View featured projects
  dir ..................... List available applications
  cls ..................... Clear terminal screen
  date .................... Show current date/time
  apps .................... List installed apps
  theme light ............ Switch to light theme
  theme dark ............. Switch to dark theme
  github .................. Open GitHub repository
  skills .................. Show technical skills`;
  
  if (cmd === 'about') return `╔════════════════════════════════════════════════════════════════╗
║                   ABOUT THIS PORTFOLIO                         ║
╚════════════════════════════════════════════════════════════════╝

This is an interactive Windows 11 desktop simulation built with
vanilla JavaScript to showcase web development capabilities.

📚 Full Documentation:
   https://github.com/EinSchnitzelchen/EinSchnitzelchen.github.io

🚀 Features:
   • Full desktop environment with windowed applications
   • Draggable, resizable, and maximizable windows
   • Snap layout system (Windows 11 style)
   • Multiple applications (Explorer, Notes, Calc, Terminal)
   • Dark/Light theme switching
   • Keyboard navigation and shortcuts

💡 Built to demonstrate:
   • Modern JavaScript architecture
   • DOM manipulation & event handling
   • CSS Grid & Flexbox layouts
   • Modular component design
   • Accessibility best practices`;

  if (cmd === 'projects') return `Featured Projects (see GitHub for more):
https://github.com/EinSchnitzelchen

📁 This Repository:
   Windows 11 Web Desktop Simulation
   → Interactive portfolio presentation
   → Modular JS architecture
   → Responsive & accessible

Check the GitHub repo for additional projects and contributions!`;

  if (cmd === 'skills') return `Technical Skills:

Languages:
  • JavaScript (ES6+) ........... Expert
  • Python ...................... Proficient
  • HTML5 & CSS3 ................ Expert
  • TypeScript .................. Intermediate

Technologies:
  • Vanilla DOM API ............. Expert
  • CSS Grid & Flexbox .......... Expert
  • Git & GitHub ................ Expert
  • Responsive Design ........... Expert
  • Accessibility (WCAG) ........ Proficient

See full portfolio and contributions:
https://github.com/EinSchnitzelchen`;

  if (cmd === 'github') return `GitHub Repository:
https://github.com/EinSchnitzelchen/EinSchnitzelchen.github.io

Quick Links:
  README: https://github.com/EinSchnitzelchen/EinSchnitzelchen.github.io/blob/main/README.md
  Issues: https://github.com/EinSchnitzelchen/EinSchnitzelchen.github.io/issues
  Profile: https://github.com/EinSchnitzelchen`;

  if (cmd === 'dir') return 'Explorer  Settings  Notes  Calculator  Terminal  Widgets  Browser';
  
  if (cmd === 'cls') return '';
  
  if (cmd === 'date') return new Date().toLocaleString('de-DE');
  
  if (cmd === 'apps') return 'Datei-Explorer\nEinstellungen\nNotizen\nRechner\nTerminal\nWidgets\nBrowser';
  
  if (cmd === 'theme light') { toggleTheme('light'); return 'Light Theme aktiviert.'; }
  
  if (cmd === 'theme dark') { toggleTheme('dark'); return 'Dark Theme aktiviert.'; }
  
  return `'${cmd}' wurde nicht als interner Befehl erkannt. Geben Sie "help" ein für verfügbare Befehle.`;
}
