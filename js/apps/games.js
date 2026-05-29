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

export function setupGames(win) {
  const statusEl = win.querySelector('[data-game-status]');
  const scoreEl = win.querySelector('[data-game-score]');
  const memoryBoard = win.querySelector('[data-memory-board]');
  const memoryMovesEl = win.querySelector('[data-memory-moves]');
  const memoryPairsEl = win.querySelector('[data-memory-pairs]');
  const rushButton = win.querySelector('[data-rush-button]');
  const rushTimeEl = win.querySelector('[data-rush-time]');
  const rushScoreEl = win.querySelector('[data-rush-score]');
  const actionButtons = win.querySelectorAll('[data-game-action]');

  const symbols = ['🍒', '🎯', '⭐', '🪐'];
  let memoryCards = [];
  let opened = [];
  let matched = 0;
  let moves = 0;
  let rushTimer = null;
  let rushSeconds = 10;
  let rushHits = 0;

  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

  const updateScore = value => {
    scoreEl.textContent = String(value);
  };

  const updateStatus = text => {
    statusEl.textContent = text;
  };

  const renderMemory = () => {
    const deck = shuffle([...symbols, ...symbols]);
    memoryCards = deck.map((symbol, index) => ({ id: index, symbol, flipped: false, matched: false }));
    memoryBoard.innerHTML = '';
    memoryCards.forEach(card => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'memory-card';
      btn.dataset.card = String(card.id);
      btn.textContent = '❓';
      btn.addEventListener('click', () => flipCard(card.id));
      memoryBoard.appendChild(btn);
    });
    moves = 0;
    matched = 0;
    opened = [];
    memoryMovesEl.textContent = '0';
    memoryPairsEl.textContent = '0 / 4';
    updateStatus('Memory ist frisch gemischt.');
  };

  const flipCard = id => {
    const card = memoryCards.find(item => item.id === id);
    if (!card || card.flipped || card.matched || opened.length >= 2 || opened.some(item => item.id === id)) return;

    card.flipped = true;
    const el = memoryBoard.querySelector(`[data-card="${id}"]`);
    if (el) {
      el.textContent = card.symbol;
      el.classList.add('flipped');
    }
    opened.push(card);

    if (opened.length === 2) {
      moves += 1;
      memoryMovesEl.textContent = String(moves);
      const [first, second] = opened;
      if (first.symbol === second.symbol) {
        matched += 1;
        memoryPairsEl.textContent = `${matched} / 4`;
        first.matched = true;
        second.matched = true;
        memoryCards.find(item => item.id === first.id).matched = true;
        memoryCards.find(item => item.id === second.id).matched = true;
        opened.forEach(item => {
          const node = memoryBoard.querySelector(`[data-card="${item.id}"]`);
          node?.classList.add('matched');
        });
        opened = [];
        updateStatus('Treffer! Weiter so.');
        updateScore(scoreEl.textContent === '0' ? 5 : Number(scoreEl.textContent) + 5);
        if (matched === 4) {
          updateStatus('Memory geschafft! Du hast alle Paare gefunden.');
        }
      } else {
        setTimeout(() => {
          opened.forEach(item => {
            const node = memoryBoard.querySelector(`[data-card="${item.id}"]`);
            const source = memoryCards.find(cardItem => cardItem.id === item.id);
            if (source) source.flipped = false;
            node.textContent = '❓';
            node.classList.remove('flipped');
          });
          opened = [];
          updateStatus('Fast! Noch einmal versuchen.');
        }, 650);
      }
    }
  };

  const resetRush = () => {
    if (rushTimer) {
      clearInterval(rushTimer);
      rushTimer = null;
    }
    rushSeconds = 10;
    rushHits = 0;
    rushTimeEl.textContent = String(rushSeconds);
    rushScoreEl.textContent = '0';
    rushButton.disabled = false;
    rushButton.classList.remove('disabled');
    rushButton.textContent = '★';
    updateStatus('Click Rush bereit. Klicke auf den Stern!');
  };

  const startRush = () => {
    if (rushTimer) {
      clearInterval(rushTimer);
    }
    updateStatus('Klicke so schnell du kannst!');
    rushTimer = setInterval(() => {
      rushSeconds -= 1;
      rushTimeEl.textContent = String(Math.max(0, rushSeconds));
      if (rushSeconds <= 0) {
        clearInterval(rushTimer);
        rushTimer = null;
        rushButton.disabled = true;
        rushButton.classList.add('disabled');
        rushButton.textContent = '⏰';
        updateStatus(`Zeit vorbei! Du hast ${rushHits} Treffer erzielt.`);
        updateScore(Number(scoreEl.textContent) + rushHits);
      }
    }, 1000);
  };

  rushButton.addEventListener('click', () => {
    if (rushSeconds <= 0) return;

    if (!rushTimer) {
      startRush();
    }

    rushHits += 1;
    rushScoreEl.textContent = String(rushHits);
  });

  actionButtons.forEach(btn => btn.addEventListener('click', () => {
    const action = btn.dataset.gameAction;
    if (action === 'reset') {
      renderMemory();
      resetRush();
      updateScore(0);
      updateStatus('Beide Spiele wurden zurückgesetzt.');
      return;
    }
    if (action === 'shuffle') {
      renderMemory();
      updateStatus('Memory wurde neu gemischt.');
    }
  }));

  renderMemory();
  resetRush();
  updateScore(0);
}

