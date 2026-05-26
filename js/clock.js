import { dom } from './dom.js';

export function initClock() {
  function updateClock() {
    const now = new Date();
    dom.clockStack.innerHTML = `<div>${now.toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit' })}</div><div>${now.toLocaleDateString('de-DE')}</div>`;
  }
  updateClock();
  setInterval(updateClock, 1000 * 30);
}
