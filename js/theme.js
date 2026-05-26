import { state } from './state.js';
import { notify } from './utils.js';

export function initTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
}

export function toggleTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  notify('Design', theme === 'dark' ? 'Dunkles Design aktiviert.' : 'Helles Design aktiviert.');
}

export function cycleWallpaper() {
  state.wallpaper = (state.wallpaper + 1) % 3;
  const variants = [
    'radial-gradient(circle at 15% 18%, rgba(60,118,255,0.6), transparent 28%), radial-gradient(circle at 70% 20%, rgba(113,221,255,0.18), transparent 26%), radial-gradient(circle at 85% 78%, rgba(96,83,255,0.22), transparent 24%), linear-gradient(145deg, #08101c 0%, #0d1f3b 42%, #08131f 100%)',
    'radial-gradient(circle at 20% 18%, rgba(255,157,92,0.34), transparent 30%), radial-gradient(circle at 78% 26%, rgba(255,210,125,0.18), transparent 22%), linear-gradient(140deg, #170f25 0%, #49205a 46%, #fd7e5f 100%)',
    'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.3), transparent 22%), radial-gradient(circle at 70% 18%, rgba(93,152,255,0.5), transparent 24%), linear-gradient(135deg, #dbeafe 0%, #97c1ff 45%, #4e7df2 100%)'
  ];
  document.documentElement.style.setProperty('--desktop-wallpaper', variants[state.wallpaper]);
  notify('Personalisierung', 'Wallpaper wurde geändert.');
}
