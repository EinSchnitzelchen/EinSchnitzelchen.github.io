export function renderTerminal() {
  return `
    <div class="terminal">
      <div class="terminal-output"></div>
      <div class="terminal-inputbar"><span class="prompt">PS C:\\Users\\Julien&gt;</span><input class="terminal-input" aria-label="Terminaleingabe" placeholder="Befehl eingeben, z. B. help"></div>
    </div>`;
}
