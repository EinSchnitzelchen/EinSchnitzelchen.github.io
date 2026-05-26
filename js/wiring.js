import { state } from './state.js';
import { toggleTheme, cycleWallpaper } from './theme.js';
import { notify } from './utils.js';

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
    win.querySelectorAll('.menu-item').forEach(item => item.addEventListener('click', () => {
      win.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const name = item.dataset.folder || 'Dieser PC';
      win.querySelector('.pathbar').innerHTML = `<span class="crumb">Schnellzugriff</span><span class="crumb">${name}</span>`;
    }));
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
  const history = [
    'Windows [Version 11.0.26100.1]',
    '(c) Demo Environment. Alle Rechte vorbehalten.',
    '',
    'PS C:\\Users\\Julien> dir',
    ' Desktop  Documents  Downloads  Music  Pictures  Projects',
    'PS C:\\Users\\Julien> systeminfo',
    ' OS Name: Microsoft Windows 11 Pro (Web Simulation)',
    ' Build: ULTRATHINK Edition',
    ' Memory: 16 GB',
    ''
  ];
  output.textContent = history.join('\n');
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
  if (cmd === 'help') return 'Verfügbare Befehle: help, dir, cls, date, apps, theme light, theme dark';
  if (cmd === 'dir') return 'Explorer  Settings  Notes  Calculator  Terminal  Widgets';
  if (cmd === 'cls') return '';
  if (cmd === 'date') return new Date().toLocaleString('de-DE');
  if (cmd === 'apps') return 'Datei-Explorer\nEinstellungen\nNotizen\nRechner\nTerminal\nWidgets';
  if (cmd === 'theme light') { toggleTheme('light'); return 'Light Theme aktiviert.'; }
  if (cmd === 'theme dark') { toggleTheme('dark'); return 'Dark Theme aktiviert.'; }
  return `'${cmd}' wurde nicht als interner Befehl erkannt.`;
}
