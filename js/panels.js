import { dom } from './dom.js';
import { state } from './state.js';
import { pinnedApps, apps } from './apps-config.js';
import { openApp } from './window-manager.js';
import { closePanels, togglePanel } from './utils.js';
import { toggleTheme, cycleWallpaper } from './theme.js';
import { notify } from './utils.js';

export function renderPinned() {
  dom.pinnedAppsEl.innerHTML = '';
  pinnedApps.forEach(key => {
    const app = apps[key];
    const btn = document.createElement('button');
    btn.className = 'start-app';
    btn.dataset.open = key;
    btn.innerHTML = `<div class="app-icon">${app.icon}</div><strong style="font-size:var(--text-xs)">${app.title}</strong>`;
    btn.addEventListener('click', () => { openApp(key); closePanels(); });
    dom.pinnedAppsEl.appendChild(btn);
  });
}

export function renderQuick() {
  const items = [
    ['wifi', 'WLAN', apps.browser.icon],
    ['bluetooth', 'Bluetooth', apps.widgets.icon],
    ['airplane', 'Flugmodus', apps.terminal.icon],
    ['night', 'Nachtlicht', apps.notes.icon],
    ['focus', 'Fokus', apps.settings.icon],
    ['battery', 'Energiesparen', apps.calc.icon]
  ];
  dom.quickGrid.innerHTML = '';
  items.forEach(([key, label, icon]) => {
    const btn = document.createElement('button');
    btn.className = 'quick-toggle' + (state.quick[key] ? ' active' : '');
    btn.innerHTML = `${icon}<span>${label}</span>`;
    btn.addEventListener('click', () => {
      state.quick[key] = !state.quick[key];
      renderQuick();
      if (key === 'night') toggleTheme(state.quick[key] ? 'dark' : 'light');
    });
    dom.quickGrid.appendChild(btn);
  });
}

export function renderNotifications() {
  dom.notifStack.innerHTML = '';
  if (!state.notifications.length) {
    dom.notifStack.innerHTML = `<div class="notif-card"><h4>Keine neuen Benachrichtigungen</h4><p>Alles ist auf dem neuesten Stand.</p></div>`;
    return;
  }
  state.notifications.forEach(n => {
    const el = document.createElement('article');
    el.className = 'notif-card';
    el.innerHTML = `<h4>${n.title}</h4><p>${n.body}</p><p style="margin-top:.55rem">${n.time}</p>`;
    dom.notifStack.appendChild(el);
  });
  dom.notifStack.insertAdjacentHTML('beforeend', `<div class="notif-card"><h4>Mai 2026</h4><div class="calendar-grid">${Array.from({length:35}, (_,i)=> `<div class="calendar-tile ${i===24?'active':''}">${(i%31)+1}</div>`).join('')}</div></div>`);
}

export function initPanels() {
  document.getElementById('startButton').addEventListener('click', () => togglePanel(dom.startMenu));
  document.getElementById('quickButton').addEventListener('click', () => togglePanel(dom.quickPanel));
  document.getElementById('notifButton').addEventListener('click', () => togglePanel(dom.notifPanel));
  document.getElementById('clearNotifs').addEventListener('click', () => { state.notifications = []; renderNotifications(); });

  dom.desktopShell.addEventListener('click', e => {
    if (!e.target.closest('.panel') && !e.target.closest('.taskbar-button') && !e.target.closest('.system-tray')) closePanels();
  });

  dom.desktopShell.addEventListener('contextmenu', e => {
    e.preventDefault();
    closePanels();
    dom.contextMenu.style.left = Math.min(e.clientX, window.innerWidth - 250) + 'px';
    dom.contextMenu.style.top = Math.min(e.clientY, window.innerHeight - 220) + 'px';
    dom.contextMenu.classList.add('open');
  });

  dom.contextMenu.addEventListener('click', e => {
    const item = e.target.closest('[data-context]');
    if (!item) return;
    const action = item.dataset.context;
    if (action === 'refresh') notify('Desktop', 'Desktop wurde aktualisiert.');
    if (action === 'new-note') openApp('notes');
    if (action === 'new-folder') openApp('explorer');
    if (action === 'toggle-theme') toggleTheme(state.theme === 'dark' ? 'light' : 'dark');
    if (action === 'wallpaper') cycleWallpaper();
    dom.contextMenu.classList.remove('open');
  });
}
