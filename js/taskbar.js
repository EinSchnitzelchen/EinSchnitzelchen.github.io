import { apps, taskbarApps } from './apps-config.js';
import { state } from './state.js';
import { dom } from './dom.js';
import { toggleTaskApp } from './window-manager.js';

function makeButtonIcon(icon, label, openKey) {
  const btn = document.createElement('button');
  btn.className = 'taskbar-button';
  btn.dataset.app = openKey;
  btn.setAttribute('aria-label', label);
  btn.innerHTML = icon;
  btn.addEventListener('click', () => toggleTaskApp(openKey));
  return btn;
}

export function bootTaskbar() {
  taskbarApps.forEach(key => {
    const app = apps[key];
    const btn = makeButtonIcon(app.icon, app.title, key);
    state.taskButtons.set(key, btn);
    dom.taskbarCenter.appendChild(btn);
  });
}

export function updateTaskbarState(key, running, active = true) {
  const btn = state.taskButtons.get(key);
  if (!btn) return;
  btn.classList.toggle('running', running);
  btn.classList.toggle('active', !!active);
}
