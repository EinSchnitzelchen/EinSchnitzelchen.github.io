import { ICONS } from './icons.js';
import { renderExplorer, renderSettings, renderNotes, renderCalc, renderBrowser, renderTerminal, renderWidgets, renderRecycle } from './renderers.js';

export const apps = {
  explorer: { title: 'Datei-Explorer', subtitle: 'Start > Dieser PC', icon: ICONS.explorer, width: 980, height: 640, x: 120, y: 70, render: renderExplorer },
  settings: { title: 'Einstellungen', subtitle: 'System · Personalisierung', icon: ICONS.settings, width: 980, height: 650, x: 170, y: 100, render: renderSettings },
  notes: { title: 'Notizen', subtitle: 'Schnelle Gedanken', icon: ICONS.notes, width: 760, height: 540, x: 240, y: 110, render: renderNotes },
  calc: { title: 'Rechner', subtitle: 'Standard', icon: ICONS.calc, width: 360, height: 560, x: 860, y: 130, render: renderCalc },
  browser: { title: 'Microsoft Edge', subtitle: 'Startseite', icon: ICONS.browser, width: 1000, height: 690, x: 150, y: 60, render: renderBrowser },
  terminal: { title: 'Terminal', subtitle: 'PowerShell', icon: ICONS.terminal, width: 780, height: 520, x: 250, y: 150, render: renderTerminal },
  widgets: { title: 'Widgets', subtitle: 'Personalisierte Übersicht', icon: ICONS.widgets, width: 860, height: 600, x: 200, y: 90, render: renderWidgets },
  recycle: { title: 'Papierkorb', subtitle: 'Zuletzt entfernt', icon: ICONS.recycle, width: 720, height: 500, x: 260, y: 120, render: renderRecycle }
};

export const pinnedApps = ['explorer','browser','settings','notes','calc','terminal','widgets'];
export const taskbarApps = ['explorer','browser','settings','notes','calc','terminal','widgets'];
