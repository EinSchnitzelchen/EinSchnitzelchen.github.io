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

export function setCookie(name, value, days = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split('; ').reduce((map, cookie) => {
    const [key, ...rest] = cookie.split('=');
    map[decodeURIComponent(key)] = decodeURIComponent(rest.join('='));
    return map;
  }, {});
  return cookies[name] || null;
}

export function saveUserCookieSettings(settings) {
  try {
    setCookie('einschnitzelchen_settings', JSON.stringify(settings));
  } catch (error) {
    console.warn('Unable to save settings in cookies:', error);
  }
}

export function loadUserCookieSettings() {
  try {
    const raw = getCookie('einschnitzelchen_settings');
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Unable to load settings from cookies:', error);
    return {};
  }
}
