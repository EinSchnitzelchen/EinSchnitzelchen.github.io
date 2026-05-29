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

export function setupPaint(win) {
  const canvas = win.querySelector('.paint-canvas');
  const ctx = canvas.getContext('2d');
  const sizeInput = win.querySelector('[data-paint-size]');
  const colorButtons = win.querySelectorAll('[data-paint-color]');
  const modeButtons = win.querySelectorAll('[data-paint-mode]');
  const actionButtons = win.querySelectorAll('[data-paint-action]');

  let currentColor = '#111827';
  let currentMode = 'brush';
  let currentSize = Number(sizeInput?.value || 4);
  let drawing = false;
  const history = [];

  const saveState = () => history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  const restoreState = () => {
    if (!history.length) return;
    const state = history.pop();
    ctx.putImageData(state, 0, 0);
  };

  const getPoint = event => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  const beginStroke = event => {
    event.preventDefault();
    saveState();
    drawing = true;
    const point = getPoint(event);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentMode === 'eraser' ? '#ffffff' : currentColor;
    ctx.lineWidth = currentMode === 'eraser' ? currentSize * 2 : currentSize;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const drawStroke = event => {
    if (!drawing) return;
    const point = getPoint(event);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const endStroke = () => {
    if (!drawing) return;
    drawing = false;
    ctx.closePath();
  };

  sizeInput?.addEventListener('input', event => {
    currentSize = Number(event.target.value || 4);
  });

  colorButtons.forEach(btn => btn.addEventListener('click', () => {
    currentColor = btn.dataset.paintColor;
    currentMode = 'brush';
    modeButtons.forEach(mode => mode.classList.toggle('primary', mode.dataset.paintMode === 'brush'));
    colorButtons.forEach(b => b.classList.toggle('active', b === btn));
  }));

  modeButtons.forEach(btn => btn.addEventListener('click', () => {
    currentMode = btn.dataset.paintMode;
    modeButtons.forEach(b => b.classList.toggle('primary', b === btn));
  }));

  actionButtons.forEach(btn => btn.addEventListener('click', () => {
    const action = btn.dataset.paintAction;
    if (action === 'clear') {
      saveState();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }
    if (action === 'undo') restoreState();
    if (action === 'new') {
      saveState();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (action === 'save') {
      const link = document.createElement('a');
      link.download = 'zeichnung.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }));

  canvas.addEventListener('pointerdown', beginStroke);
  canvas.addEventListener('pointermove', drawStroke);
  window.addEventListener('pointerup', endStroke);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

