export function renderPaint() {
  return `
    <div class="paint-app">
      <div class="window-toolbar">
        <div class="toolbar-group">
          <button class="toolbar-btn primary" data-paint-action="new">Neu</button>
          <button class="toolbar-btn" data-paint-action="save">Speichern</button>
          <button class="toolbar-btn" data-paint-action="clear">Leeren</button>
          <button class="toolbar-btn" data-paint-action="undo">Rückgängig</button>
        </div>
        <div class="toolbar-group paint-controls">
          <label class="paint-slider">
            <span>Stärke</span>
            <input type="range" min="1" max="32" value="4" data-paint-size />
          </label>
          <button class="toolbar-btn" data-paint-mode="brush">Pinsel</button>
          <button class="toolbar-btn" data-paint-mode="eraser">Radierer</button>
        </div>
      </div>
      <div class="paint-toolbar-row">
        <div class="paint-palette" aria-label="Farben">
          <button class="paint-color active" data-paint-color="#111827" style="--swatch:#111827"></button>
          <button class="paint-color" data-paint-color="#2563eb" style="--swatch:#2563eb"></button>
          <button class="paint-color" data-paint-color="#10b981" style="--swatch:#10b981"></button>
          <button class="paint-color" data-paint-color="#f59e0b" style="--swatch:#f59e0b"></button>
          <button class="paint-color" data-paint-color="#ef4444" style="--swatch:#ef4444"></button>
          <button class="paint-color" data-paint-color="#8b5cf6" style="--swatch:#8b5cf6"></button>
          <button class="paint-color" data-paint-color="#ec4899" style="--swatch:#ec4899"></button>
          <button class="paint-color" data-paint-color="#ffffff" style="--swatch:#ffffff"></button>
        </div>
        <div class="paint-hint">Zeichnen, Radieren und direkt als PNG speichern.</div>
      </div>
      <div class="paint-canvas-shell">
        <canvas class="paint-canvas" width="980" height="560"></canvas>
      </div>
    </div>`;
}
