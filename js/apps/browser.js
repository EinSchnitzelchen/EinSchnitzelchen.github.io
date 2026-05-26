export function renderBrowser() {
  return `
    <div class="browser">
      <div class="browser-tabs"><div class="tab active">Startseite</div><div class="tab">Dokumentation</div><div class="tab">Suche</div></div>
      <div class="browser-bar"><button class="toolbar-btn">←</button><button class="toolbar-btn">→</button><button class="toolbar-btn">↻</button><div class="address">https://start.windows-web.local</div><button class="toolbar-btn">⋯</button></div>
      <div class="browser-page">
        <section class="hero-banner"><h2>Willkommen zurück</h2><p>Dein schneller Zugriff auf Projekte, Nachrichten und zuletzt verwendete Inhalte.</p></section>
        <div class="article-grid">
          <article class="article-card"><strong>Neue Systemfunktionen</strong><p class="muted" style="margin-top:.5rem">Snap Layouts, Focus Sessions und eine überarbeitete Dateien-Ansicht.</p></article>
          <article class="article-card"><strong>Produktivitätstipps</strong><p class="muted" style="margin-top:.5rem">Starte Apps mit Shortcuts, nutze Widgets und organisiere Desktops effizient.</p></article>
          <article class="article-card"><strong>Letzte Downloads</strong><p class="muted" style="margin-top:.5rem">3 neue Dateien und ein Updatepaket stehen bereit.</p></article>
        </div>
      </div>
    </div>`;
}
