export const state = {
  z: 20,
  openWindows: new Map(),
  taskButtons: new Map(),
  activeWindow: null,
  theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  wallpaper: 0,
  selectedDesktopIcons: new Set(),
  desktopIconPositions: JSON.parse(localStorage.getItem('desktopIconPositions')) || {},
  notifications: [
    { title: 'Windows Update', body: 'Neues kumulatives Update ist bereit zum Installieren.', time: 'Vor 12 Minuten' },
    { title: 'OneDrive', body: 'Alle Dateien wurden erfolgreich synchronisiert.', time: 'Gerade eben' },
    { title: 'Kalender', body: 'Projekt-Review startet um 10:30 Uhr.', time: 'In 1 Stunde' }
  ],
  quick: { wifi: true, bluetooth: true, airplane: false, night: false, focus: true, battery: true },
  notes: 'ULTRATHINK Build Notes\n\n- Explorer mit Sidebar und Grid\n- Drag, Resize, Snap Layouts\n- Startmenü, Quick Settings, Notification Center\n- Mehrere Apps wie in einem Desktop OS\n\nNächster Schritt:\nFeinschliff oder zusätzliche Apps.'
};
