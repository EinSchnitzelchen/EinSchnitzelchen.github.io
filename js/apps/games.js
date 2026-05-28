export function renderGames() {
  return `
    <div class="games-app">
      <div class="window-toolbar">
        <div class="toolbar-group">
          <button class="toolbar-btn primary" data-game-action="reset">Neu starten</button>
          <button class="toolbar-btn" data-game-action="shuffle">Memory mischen</button>
        </div>
        <div class="toolbar-group games-stats">
          <span class="chip">Punkte: <strong data-game-score>0</strong></span>
          <span class="chip" data-game-status>Wähle eine Karte oder starte den Klick-Wettkampf.</span>
        </div>
      </div>
      <div class="games-grid">
        <article class="game-card">
          <h3>Memory Blitz</h3>
          <p>Finde die vier Paare mit möglichst wenigen Zügen.</p>
          <div class="memory-board" data-memory-board></div>
          <div class="game-meta">
            <span>Züge: <strong data-memory-moves>0</strong></span>
            <span>Paare: <strong data-memory-pairs>0 / 4</strong></span>
          </div>
        </article>
        <article class="game-card">
          <h3>Click Rush</h3>
          <p>Klicke innerhalb von 10 Sekunden auf den Stern so oft wie möglich.</p>
          <div class="click-rush">
            <button class="rush-btn" data-rush-button>★</button>
            <div class="rush-footer">
              <span>Zeit: <strong data-rush-time>10</strong>s</span>
              <span>Treffer: <strong data-rush-score>0</strong></span>
            </div>
          </div>
        </article>
      </div>
    </div>`;
}
