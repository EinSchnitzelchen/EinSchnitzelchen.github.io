export function renderWidgets() {
  return `
    <div class="widgets-window">
      <section class="widget">
        <h3>Heute im Überblick</h3>
        <div class="kpi-grid">
          <div class="kpi"><span>Fokuszeit</span><strong>3h 24m</strong></div>
          <div class="kpi"><span>Tasks</span><strong>12</strong></div>
          <div class="kpi"><span>Meetings</span><strong>2</strong></div>
        </div>
        <div class="hero-banner" style="margin-top:1rem"><h2>Projektstatus stabil</h2><p>Nächster Meilenstein ist in zwei Tagen fällig. Priorität: mittel.</p></div>
      </section>
      <aside class="widget">
        <h3>Kalender</h3>
        <div class="calendar-grid">${Array.from({length:35}, (_,i)=> `<div class="calendar-tile ${i===24?'active':''}">${(i%31)+1}</div>`).join('')}</div>
      </aside>
    </div>`;
}
