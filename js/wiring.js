import { state } from './state.js';
import { toggleTheme, cycleWallpaper } from './theme.js';
import { notify } from './utils.js';
import { initializeExplorer } from './apps/explorer.js';

export function wireAppInternals(win) {
  const app = win.dataset.app;
  if (app === 'notes') {
    const textarea = win.querySelector('.editor');
    textarea.value = state.notes;
    textarea.addEventListener('input', () => state.notes = textarea.value);
  }
  if (app === 'calc') setupCalculator(win);
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
    win.querySelectorAll('.article-card').forEach(card => card.addEventListener('click', () => notify('Microsoft Edge', 'Artikel geöffnet: ' + card.querySelector('strong').textContent)));
  }
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
 Type "projects" to view featured projects.`;

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
