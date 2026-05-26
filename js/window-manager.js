import { state } from './state.js';
import { dom } from './dom.js';
import { apps } from './apps-config.js';
import { updateTaskbarState } from './taskbar.js';
import { notify } from './utils.js';
import { wireAppInternals } from './wiring.js';

export function openApp(key) {
  if (state.openWindows.has(key)) {
    const existing = state.openWindows.get(key);
    existing.classList.remove('hidden');
    focusWindow(existing);
    return existing;
  }
  const config = apps[key];
  const tpl = dom.windowTemplate.content.firstElementChild.cloneNode(true);
  tpl.dataset.app = key;
  tpl.style.width = config.width + 'px';
  tpl.style.height = config.height + 'px';
  tpl.style.left = config.x + 'px';
  tpl.style.top = config.y + 'px';
  tpl.style.zIndex = ++state.z;
  tpl.querySelector('.window-icon').innerHTML = config.icon;
  tpl.querySelector('.window-title').textContent = config.title;
  tpl.querySelector('.window-subtitle').textContent = config.subtitle;
  tpl.querySelector('.window-content').innerHTML = config.render();
  attachWindowEvents(tpl);
  dom.windowArea.appendChild(tpl);
  state.openWindows.set(key, tpl);
  updateTaskbarState(key, true);
  focusWindow(tpl);
  notify(config.title, 'Anwendung wurde geöffnet.');
  return tpl;
}

export function toggleTaskApp(key) {
  const win = state.openWindows.get(key);
  if (!win) return openApp(key);
  if (!win.classList.contains('hidden') && state.activeWindow === win) {
    win.classList.add('hidden');
    updateTaskbarState(key, true, false);
    state.activeWindow = null;
    return;
  }
  win.classList.remove('hidden');
  focusWindow(win);
}

export function closeWindow(win) {
  const key = win.dataset.app;
  state.openWindows.delete(key);
  win.remove();
  updateTaskbarState(key, false, false);
  notify(apps[key].title, 'Fenster wurde geschlossen.');
}

export function focusWindow(win) {
  document.querySelectorAll('.window').forEach(w => { w.classList.add('inactive'); w.classList.remove('active'); });
  win.classList.remove('hidden');
  win.classList.add('active');
  win.classList.remove('inactive');
  win.style.zIndex = ++state.z;
  state.activeWindow = win;
  state.taskButtons.forEach((btn, key) => btn.classList.toggle('active', state.openWindows.get(key) === win));
}

function attachWindowEvents(win) {
  const header = win.querySelector('.window-header');
  let drag = null;

  const restoreSnappedWindow = () => {
    if (!win.classList.contains('snapped-left') && !win.classList.contains('snapped-right') && !win.classList.contains('snapped-top')) return;
    const rect = win.getBoundingClientRect();
    win.classList.remove('snapped-left', 'snapped-right', 'snapped-top');
    Object.assign(win.style, {
      left: `${rect.left}px`,
      top: `${Math.max(0, rect.top)}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    });
  };

  header.addEventListener('pointerdown', e => {
    if (e.target.closest('.window-controls')) return;
    if (win.classList.contains('maximized')) return;
    focusWindow(win);
    restoreSnappedWindow();
    drag = { x: e.clientX, y: e.clientY, left: parseFloat(win.style.left), top: parseFloat(win.style.top) };
    dom.snapOverlay.classList.add('active');
    updateSnapPreview(e.clientX, e.clientY);
    header.setPointerCapture(e.pointerId);
  });
  header.addEventListener('pointermove', e => {
    if (!drag) return;
    win.style.left = drag.left + (e.clientX - drag.x) + 'px';
    win.style.top = Math.max(0, drag.top + (e.clientY - drag.y)) + 'px';
    updateSnapPreview(e.clientX, e.clientY);
  });
  header.addEventListener('pointerup', e => {
    if (!drag) return;
    const zone = getSnapZone(e.clientX, e.clientY);
    dom.snapOverlay.classList.remove('active');
    updateSnapPreview();
    if (zone) applySnap(win, zone);
    drag = null;
  });
  header.addEventListener('dblclick', () => toggleMaximize(win));
  win.addEventListener('pointerdown', () => focusWindow(win));
  win.querySelectorAll('[data-win]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.win;
      if (action === 'close') closeWindow(win);
      if (action === 'minimize') { win.classList.add('hidden'); updateTaskbarState(win.dataset.app, true, false); }
      if (action === 'maximize') toggleMaximize(win);
    });
  });
  attachResizers(win);
  wireAppInternals(win);
}

function attachResizers(win) {
  win.querySelectorAll('.resizer').forEach(handle => {
    handle.addEventListener('pointerdown', e => {
      if (win.classList.contains('maximized')) return;
      focusWindow(win);
      const dir = [...handle.classList].find(c => c !== 'resizer');
      const start = { x: e.clientX, y: e.clientY, w: win.offsetWidth, h: win.offsetHeight, l: win.offsetLeft, t: win.offsetTop, dir };
      const move = ev => resizeWindow(win, start, ev.clientX, ev.clientY);
      const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      e.stopPropagation();
    });
  });
}

function resizeWindow(win, start, x, y) {
  let width = start.w, height = start.h, left = start.l, top = start.t;
  const dx = x - start.x, dy = y - start.y;
  if (start.dir.includes('e')) width = Math.max(320, start.w + dx);
  if (start.dir.includes('s')) height = Math.max(260, start.h + dy);
  if (start.dir.includes('w')) { width = Math.max(320, start.w - dx); left = start.l + dx; }
  if (start.dir.includes('n')) { height = Math.max(260, start.h - dy); top = start.t + dy; }
  Object.assign(win.style, { width: width + 'px', height: height + 'px', left: left + 'px', top: Math.max(0, top) + 'px' });
}

function toggleMaximize(win) {
  const maximized = win.classList.toggle('maximized');
  if (!maximized) {
    const rect = win.dataset.restore ? JSON.parse(win.dataset.restore) : null;
    if (rect) Object.assign(win.style, { left: rect.left, top: rect.top, width: rect.width, height: rect.height });
  } else {
    win.dataset.restore = JSON.stringify({ left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height });
    win.classList.remove('snapped-left','snapped-right','snapped-top');
  }
}

function setSnapZoneActive(zone) {
  if (!dom.snapOverlay) return;
  dom.snapOverlay.querySelectorAll('.snap-zone').forEach(el => {
    el.classList.toggle('active', el.classList.contains(zone));
  });
}

function updateSnapPreview(x, y) {
  if (!dom.snapOverlay) return;
  if (typeof x === 'undefined' || typeof y === 'undefined') {
    dom.snapOverlay.classList.remove('active');
    setSnapZoneActive('');
    return;
  }
  const zone = getSnapZone(x, y);
  dom.snapOverlay.classList.toggle('active', Boolean(zone));
  setSnapZoneActive(zone);
}

function getSnapZone(x, y) {
  const w = window.innerWidth;
  const h = window.innerHeight - parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-height'));
  if (y < 40) return 'max';
  if (x < w * 0.12) return 'left';
  if (x > w * 0.88) return 'right';
  if (y < h * 0.12) return 'top';
  return null;
}

function applySnap(win, zone) {
  win.classList.remove('maximized','snapped-left','snapped-right','snapped-top');
  if (zone === 'max') { win.classList.add('maximized'); return; }
  if (zone === 'left') win.classList.add('snapped-left');
  if (zone === 'right') win.classList.add('snapped-right');
  if (zone === 'top') win.classList.add('snapped-top');
}
