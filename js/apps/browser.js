export function renderBrowser() {
  return `
    <div class="browser">
      <div class="browser-tabs"><div class="tab active">Startseite</div><div class="tab">Dokumentation</div><div class="tab">Suche</div></div>
      <div class="browser-bar">
        <button class="toolbar-btn nav-back" title="Zurück">←</button>
        <button class="toolbar-btn nav-forward" title="Vorwärts">→</button>
        <button class="toolbar-btn refresh" title="Neu laden">↻</button>
        <form class="address-bar" autocomplete="off">
          <input class="address-input" type="text" value="https://start.windows-web.local" placeholder="Adresse eingeben oder suchen" />
        </form>
        <button class="toolbar-btn open-url" title="Öffnen">⏎</button>
      </div>
      <div class="browser-page">
        <div class="browser-start">
          <section class="hero-banner"><h2>Willkommen zurück</h2><p>Dein schneller Zugriff auf Projekte, Nachrichten und zuletzt verwendete Inhalte.</p></section>
          <div class="article-grid">
            <article class="article-card" data-href="https://www.microsoft.com/de-de"><strong>Neue Systemfunktionen</strong><p class="muted" style="margin-top:.5rem">Snap Layouts, Focus Sessions und eine überarbeitete Dateien-Ansicht.</p></article>
            <article class="article-card" data-href="https://www.bing.com/search?q=Produktivit%C3%A4t"><strong>Produktivitätstipps</strong><p class="muted" style="margin-top:.5rem">Starte Apps mit Shortcuts, nutze Widgets und organisiere Desktops effizient.</p></article>
            <article class="article-card" data-href="https://github.com"><strong>Letzte Downloads</strong><p class="muted" style="margin-top:.5rem">3 neue Dateien und ein Updatepaket stehen bereit.</p></article>
          </div>
        </div>
        <div class="browser-view hidden">
          <iframe class="browser-iframe" src="about:blank" sandbox="allow-scripts allow-forms allow-same-origin"></iframe>
        </div>
      </div>
    </div>`;
}
