import { dom } from './dom.js';

export function initSelectionBox() {
  let selection = null;
  dom.desktopShell.addEventListener('pointerdown', e => {
    if (e.target.closest('.window, .taskbar, .panel, .desktop-icon, .context-menu')) return;
    selection = { x: e.clientX, y: e.clientY };
    dom.selectionBox.style.display = 'block';
    dom.selectionBox.style.left = selection.x + 'px';
    dom.selectionBox.style.top = selection.y + 'px';
    dom.selectionBox.style.width = '0px';
    dom.selectionBox.style.height = '0px';
  });
  dom.desktopShell.addEventListener('pointermove', e => {
    if (!selection) return;
    const x = Math.min(e.clientX, selection.x);
    const y = Math.min(e.clientY, selection.y);
    const w = Math.abs(e.clientX - selection.x);
    const h = Math.abs(e.clientY - selection.y);
    Object.assign(dom.selectionBox.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
  });
  dom.desktopShell.addEventListener('pointerup', () => {
    selection = null;
    dom.selectionBox.style.display = 'none';
  });
}
