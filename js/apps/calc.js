export function renderCalc() {
  const keys = ['C','⌫','%','/','7','8','9','*','4','5','6','-','1','2','3','+','0','.','(',')','='];
  return `
    <div class="calc">
      <div class="calc-display"><div class="calc-expression"></div><div class="calc-result">0</div></div>
      ${keys.map(key => `<button class="${['/','*','-','+','%'].includes(key)?'operator':''} ${key==='='?'equals':''}" data-calc="${key}">${key}</button>`).join('')}
    </div>`;
}

export function setupCalculator(win) {
  const buttons = win.querySelectorAll('[data-calc]');
  const expr = win.querySelector('.calc-expression');
  const result = win.querySelector('.calc-result');
  let buffer = '';
  buttons.forEach(btn => btn.addEventListener('click', () => {
    const val = btn.dataset.calc;
    if (val === 'C') { buffer = ''; expr.textContent = ''; result.textContent = '0'; return; }
    if (val === '=') {
      try {
        const out = Function(`return (${buffer || 0})`)();
        result.textContent = String(out);
        expr.textContent = buffer;
        buffer = String(out);
      } catch {
        result.textContent = 'Fehler';
      }
      return;
    }
    if (val === '⌫') { buffer = buffer.slice(0,-1); result.textContent = buffer || '0'; return; }
    buffer += val;
    result.textContent = buffer;
  }));
}

