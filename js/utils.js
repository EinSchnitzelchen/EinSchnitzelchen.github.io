import { dom } from './dom.js';

export function notify(title, body) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<strong>${title}</strong><p>${body}</p>`;
  dom.toastStack.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

export function closePanels() {
  [dom.startMenu, dom.quickPanel, dom.notifPanel, dom.contextMenu].forEach(p => p.classList.remove('open'));
}

export function togglePanel(panel) {
  const open = panel.classList.contains('open');
  closePanels();
  if (!open) panel.classList.add('open');
}
