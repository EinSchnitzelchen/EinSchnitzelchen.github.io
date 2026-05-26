export function renderCalc() {
  const keys = ['C','⌫','%','/','7','8','9','*','4','5','6','-','1','2','3','+','0','.','(',')','='];
  return `
    <div class="calc">
      <div class="calc-display"><div class="calc-expression"></div><div class="calc-result">0</div></div>
      ${keys.map(key => `<button class="${['/','*','-','+','%'].includes(key)?'operator':''} ${key==='='?'equals':''}" data-calc="${key}">${key}</button>`).join('')}
    </div>`;
}
