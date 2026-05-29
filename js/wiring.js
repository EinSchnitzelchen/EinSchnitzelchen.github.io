import { initializeExplorer } from './apps/explorer.js';
import { setupNotes } from './apps/notes.js';
import { setupCalculator } from './apps/calc.js';
import { setupPaint } from './apps/paint.js';
import { setupGames } from './apps/games.js';
import { setupTerminal } from './apps/terminal.js';
import { setupSettings } from './apps/settings.js';
import { setupBrowser } from './apps/browser.js';

export function wireAppInternals(win) {
  const app = win.dataset.app;
  
  if (app === 'notes') {
    setupNotes(win);
  } else if (app === 'calc') {
    setupCalculator(win);
  } else if (app === 'paint') {
    setupPaint(win);
  } else if (app === 'games') {
    setupGames(win);
  } else if (app === 'terminal') {
    setupTerminal(win);
  } else if (app === 'settings') {
    setupSettings(win);
  } else if (app === 'explorer') {
    initializeExplorer(win);
  } else if (app === 'browser') {
    setupBrowser(win);
  }
}

