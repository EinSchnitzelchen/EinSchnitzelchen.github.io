import { toggleTheme, cycleWallpaper } from '../theme.js';
import { state } from '../state.js';

export function renderSettings() {
  return `
    <div class="window-toolbar">
      <div class="toolbar-group"><span class="chip">System</span><span class="chip">Bluetooth & Geräte</span><span class="chip">Personalisierung</span></div>
      <div class="toolbar-group"><button class="toolbar-btn primary">Updates prüfen</button></div>
    </div>
    <div class="settings-grid">
      <section class="settings-card">
        <h3>Systemübersicht</h3>
        <div class="settings-row"><div><strong>Gerätename</strong><div class="muted">DESKTOP-ULTRATHINK</div></div><span class="chip">Windows 11 Pro</span></div>
        <div class="settings-row"><div><strong>Anzeige</strong><div class="muted">2560 × 1440 · 120 Hz</div></div><button class="toolbar-btn">Ändern</button></div>
        <div class="settings-row"><div><strong>Sound</strong><div class="muted">Lautsprecher · 36%</div></div><div class="switch on"></div></div>
        <div class="settings-row"><div><strong>Benachrichtigungen</strong><div class="muted">Banner, Ton, Priorität</div></div><div class="switch on"></div></div>
        <div class="settings-row"><div><strong>Datenschutz</strong><div class="muted">Kamera, Mikrofon und Ortung</div></div><button class="toolbar-btn">Verwalten</button></div>
      </section>
      <aside class="settings-card">
        <h3>Design</h3>
        <div class="theme-grid">
          <button class="theme-tile light" data-theme-choice="light"><div class="theme-preview"></div><strong style="font-size:var(--text-xs)">Hell</strong></button>
          <button class="theme-tile active" data-theme-choice="dark"><div class="theme-preview"></div><strong style="font-size:var(--text-xs)">Dunkel</strong></button>
          <button class="theme-tile sunset" id="wallpaperTheme"><div class="theme-preview"></div><strong style="font-size:var(--text-xs)">Sunset</strong></button>
        </div>
        <h3 style="margin-top:1rem">Personalisierung</h3>
        <div class="settings-row"><div><strong>Akzentfarbe</strong><div class="muted">Blau</div></div><span class="chip">Standard</span></div>
        <div class="settings-row"><div><strong>Transparenz</strong><div class="muted">Mica + Acrylic aktiv</div></div><div class="switch on"></div></div>
        <div class="settings-row"><div><strong>Widgets</strong><div class="muted">News, Wetter, Kalender</div></div><div class="switch on"></div></div>
      </aside>
    </div>`;
}

export function setupSettings(win) {
  const themeButtons = win.querySelectorAll('[data-theme-choice]');
  const setActiveThemeButton = () => {
    themeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.themeChoice === state.theme));
  };

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleTheme(btn.dataset.themeChoice);
      setActiveThemeButton();
    });
  });

  setActiveThemeButton();

  win.querySelectorAll('.switch').forEach(sw => sw.addEventListener('click', () => sw.classList.toggle('on')));
  const wallpaperTheme = win.querySelector('#wallpaperTheme');
  if (wallpaperTheme) wallpaperTheme.addEventListener('click', cycleWallpaper);
}

