import { dom } from './dom.js';
import { openApp } from './window-manager.js';
import { closePanels } from './utils.js';
import { state } from './state.js';
import { toggleTheme } from './theme.js';
import { notify } from './utils.js';

export function initInteractions() {
  document.querySelectorAll('[data-open]:not(.desktop-icon)').forEach(el => {
    el.addEventListener('click', () => openApp(el.dataset.open));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePanels();
    if (e.key.toLowerCase() === 'n' && e.ctrlKey && e.altKey) { openApp('notes'); e.preventDefault(); }
    if (e.key.toLowerCase() === 'e' && e.metaKey) { openApp('explorer'); e.preventDefault(); }
    if (e.key === 'F5') { notify('Desktop', 'Ansicht aktualisiert.'); e.preventDefault(); }
    if (e.key.toLowerCase() === 'l' && e.altKey) { toggleTheme(state.theme === 'dark' ? 'light' : 'dark'); e.preventDefault(); }
  });

  dom.brightnessRange.addEventListener('input', () => {
    dom.desktopShell.style.filter = `brightness(${dom.brightnessRange.value}%)`;
  });
}
