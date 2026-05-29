import { loadUserCookieSettings, saveUserCookieSettings } from './utils.js';

const savedSettings = typeof document !== 'undefined' ? loadUserCookieSettings() : {};
const defaultQuick = { wifi: true, bluetooth: true, airplane: false, night: false, focus: true, battery: true };
const savedTheme = savedSettings.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
const savedWallpaper = typeof savedSettings.wallpaper === 'number' ? savedSettings.wallpaper : 0;
const savedQuick = typeof savedSettings.quick === 'object' && savedSettings.quick !== null ? { ...defaultQuick, ...savedSettings.quick } : defaultQuick;
const savedDesktopPositions = typeof savedSettings.desktopIconPositions === 'object' && savedSettings.desktopIconPositions !== null ? savedSettings.desktopIconPositions : {};
const savedNotes = typeof savedSettings.notes === 'string' ? savedSettings.notes : 'ULTRATHINK Build Notes\n\n- Explorer mit Sidebar und Grid\n- Drag, Resize, Snap Layouts\n- Startmenü, Quick Settings, Notification Center\n- Mehrere Apps wie in einem Desktop OS\n\nNächster Schritt:\nFeinschliff oder zusätzliche Apps.';

export const state = {
  z: 20,
  openWindows: new Map(),
  taskButtons: new Map(),
  activeWindow: null,
  theme: savedTheme,
  wallpaper: savedWallpaper,
  selectedDesktopIcons: new Set(),
  desktopIconPositions: savedDesktopPositions,
  notifications: [
    { title: 'Windows Update', body: 'Neues kumulatives Update ist bereit zum Installieren.', time: 'Vor 12 Minuten' },
    { title: 'OneDrive', body: 'Alle Dateien wurden erfolgreich synchronisiert.', time: 'Gerade eben' },
    { title: 'Kalender', body: 'Projekt-Review startet um 10:30 Uhr.', time: 'In 1 Stunde' }
  ],
  quick: savedQuick,
  notes: savedNotes
};

export function persistUserSettings() {
  saveUserCookieSettings({
    theme: state.theme,
    wallpaper: state.wallpaper,
    quick: state.quick,
    desktopIconPositions: state.desktopIconPositions,
    notes: state.notes
  });
}
