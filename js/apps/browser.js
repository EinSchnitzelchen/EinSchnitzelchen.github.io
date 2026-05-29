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

export function setupBrowser(win) {
  const addressForm = win.querySelector('.address-bar');
  const addressInput = win.querySelector('.address-input');
  const openUrlBtn = win.querySelector('.open-url');
  const backBtn = win.querySelector('.nav-back');
  const forwardBtn = win.querySelector('.nav-forward');
  const refreshBtn = win.querySelector('.refresh');
  const browserStart = win.querySelector('.browser-start');
  const browserView = win.querySelector('.browser-view');
  const browserIframe = win.querySelector('.browser-iframe');

  const history = [];
  let historyIndex = -1;

  const normalizeUrl = value => {
    const input = String(value || '').trim();
    if (!input) return 'https://www.bing.com';
    if (/^https?:\/\//i.test(input)) return input;
    if (input.includes(' ') || !input.includes('.')) return `https://www.bing.com/search?q=${encodeURIComponent(input)}`;
    return `https://${input}`;
  };

  const updateNavigation = () => {
    backBtn.disabled = historyIndex <= 0;
    forwardBtn.disabled = historyIndex >= history.length - 1;
  };

  const loadUrl = (rawValue, push = true) => {
    const url = normalizeUrl(rawValue);
    addressInput.value = url;
    if (push) {
      history.splice(historyIndex + 1);
      history.push(url);
      historyIndex = history.length - 1;
    }
    browserIframe.src = url;
    browserStart.classList.add('hidden');
    browserView.classList.remove('hidden');
    updateNavigation();
  };

  const loadHistory = offset => {
    const nextIndex = historyIndex + offset;
    if (nextIndex < 0 || nextIndex >= history.length) return;
    historyIndex = nextIndex;
    const url = history[historyIndex];
    addressInput.value = url;
    browserIframe.src = url;
    updateNavigation();
  };

  addressForm.addEventListener('submit', e => {
    e.preventDefault();
    loadUrl(addressInput.value);
  });

  openUrlBtn.addEventListener('click', () => loadUrl(addressInput.value));
  refreshBtn.addEventListener('click', () => {
    if (!browserView.classList.contains('hidden')) {
      browserIframe.src = browserIframe.src;
    }
  });
  backBtn.addEventListener('click', () => loadHistory(-1));
  forwardBtn.addEventListener('click', () => loadHistory(1));

  browserIframe.addEventListener('load', () => {
    try {
      const doc = browserIframe.contentDocument;
      if (!doc) return;
      const base = doc.querySelector('base') || doc.createElement('base');
      base.target = '_self';
      if (!base.parentNode && doc.head) doc.head.prepend(base);
      doc.querySelectorAll('a[target="_blank"]').forEach(link => link.removeAttribute('target'));
    } catch (error) {
      // Cross-origin pages können nicht umgeschrieben werden.
    }
  });

  win.querySelectorAll('.article-card').forEach(card => {
    const href = card.dataset.href || 'https://www.bing.com';
    card.addEventListener('click', () => loadUrl(href));
  });
}

