/* views/stats.js — статистика дотримання. */
(function (App) {
  const S = () => App.store, SC = () => App.schedule, U = () => App.ui;

  function rangeKeys() {
    const tk = SC().todayKey();
    const r = App.state.statRange || 'course';
    let from;
    if (r === '7') from = SC().addDays(tk, -6);
    else if (r === '30') from = SC().addDays(tk, -29);
    else { from = S().profile().treatmentStart; if (SC().dayDiff(from, tk) > 120) from = SC().addDays(tk, -120); if (SC().dayDiff(from, tk) < 0) from = tk; }
    return { from: from, to: tk };
  }
  function filteredMeds() {
    const id = App.state.statMed;
    return id ? S().meds().filter(m => m.id === id) : S().meds();
  }
  function smoothPath(pts) {
    if (pts.length < 2) return pts.length ? 'M ' + pts[0].x + ' ' + pts[0].y : '';
    let d = 'M ' + pts[0].x + ' ' + pts[0].y;
    for (let i = 1; i < pts.length; i++) { const p0 = pts[i - 1], p1 = pts[i], mx = (p0.x + p1.x) / 2, my = (p0.y + p1.y) / 2; d += ' Q ' + p0.x + ' ' + p0.y + ' ' + mx + ' ' + my; }
    d += ' L ' + pts[pts.length - 1].x + ' ' + pts[pts.length - 1].y; return d;
  }

  function render(root) {
    const prof = S().profile(), log = S().log(), meds = filteredMeds();
    const rg = rangeKeys();
    const adh = SC().adherence(prof, meds, rg.from, rg.to, log);
    const strk = SC().streak(prof, S().meds(), SC().todayKey(), log);

    // daily series
    const n = SC().dayDiff(rg.from, rg.to);
    const pts = []; let prev = 100; const labels = [];
    const W = 640, H = 190, L = 24, R = 620, TOP = 20, BOT = 150;
    const count = n + 1;
    for (let i = 0; i <= n; i++) {
      const key = SC().addDays(rg.from, i);
      const st = SC().dayStats(prof, meds, key, log);
      let val = st.total > 0 ? Math.round(st.taken / st.total * 100) : prev;
      prev = val;
      const x = L + (R - L) * (count === 1 ? 0.5 : i / n);
      const y = BOT - (val - 40) / 60 * (BOT - TOP); // scale 40..100
      pts.push({ x: Math.round(x), y: Math.round(Math.max(TOP, Math.min(BOT, y))) });
      if (i === 0 || i === n || (n <= 8) || i % Math.ceil(count / 6) === 0) labels.push({ i: i, t: U().dateShort(key) });
    }
    const line = smoothPath(pts);
    const area = line + ' L ' + pts[pts.length - 1].x + ' ' + BOT + ' L ' + pts[0].x + ' ' + BOT + ' Z';
    const last = pts[pts.length - 1];

    let html = '<div class="wrap">' + App.pageTop('stats');
    html += '<div class="stat-top"><div class="bigstat"><div class="lab">Дотримання' + (App.state.statMed ? '' : ' за курс') + '</div><div class="v tnum">' + adh.pct + '<small>%</small></div></div>' +
      '<div class="scard"><div class="lab">Стрік 🔥</div><div class="v tnum">' + strk + '<small> днів</small></div></div>' +
      '<div class="scard"><div class="lab">Пропущено</div><div class="v tnum">' + adh.missed + '<small> доз</small></div></div></div>';

    html += '<div class="chartcard"><div class="chart-head"><h4>Динаміка дотримання</h4><div class="filters">' +
      [['7', '7 днів'], ['30', '30 днів'], ['course', 'Курс']].map(r => '<span class="fchip ' + ((App.state.statRange || 'course') === r[0] ? 'on' : '') + '" data-range="' + r[0] + '">' + r[1] + '</span>').join('') + '</div></div>';
    html += '<div style="overflow-x:auto"><svg viewBox="0 0 640 200" style="width:100%;min-width:520px;height:200px;display:block">' +
      '<defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a86e0" stop-opacity="0.28"/><stop offset="1" stop-color="#3a86e0" stop-opacity="0"/></linearGradient></defs>' +
      '<line x1="24" y1="20" x2="620" y2="20" stroke="#eef0f5"/><line x1="24" y1="85" x2="620" y2="85" stroke="#eef0f5"/><line x1="24" y1="150" x2="620" y2="150" stroke="#e4e7ee"/>' +
      '<text x="24" y="14" font-size="10" fill="#aab1be">100%</text><text x="24" y="79" font-size="10" fill="#aab1be">70%</text><text x="24" y="164" font-size="10" fill="#aab1be">40%</text>' +
      '<path d="' + area + '" fill="url(#area)"/><path d="' + line + '" fill="none" stroke="#3a86e0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="' + last.x + '" cy="' + last.y + '" r="6" fill="#3a86e0" stroke="#fff" stroke-width="3"/></svg></div>';
    html += '<div style="display:flex;justify-content:space-between;padding:0 20px;min-width:520px">' + labels.map(l => '<span style="font-size:11px;color:var(--faint)">' + l.t + '</span>').join('') + '</div></div>';

    // med filter + per-med
    html += '<div class="filters" style="margin:0 2px 10px"><span class="fchip ' + (!App.state.statMed ? 'on' : '') + '" data-med="">Усі ліки</span>' +
      S().meds().map(m => '<span class="fchip ' + (App.state.statMed === m.id ? 'on' : '') + '" data-med="' + m.id + '">' + U().esc(m.name) + '</span>').join('') + '</div>';
    html += '<div class="permed">' + (S().meds().length ? S().meds().map(m => {
      const a = SC().adherence(prof, [m], rg.from, rg.to, log);
      return '<div class="pmrow"><span class="dotc" style="background:' + (m.color || '#3a86e0') + '"></span><div class="pmn">' + U().esc(m.name) + '<small>' + U().esc(m.dose) + '</small></div>' +
        '<div class="pmbar"><div class="mini"><i style="width:' + a.pct + '%"></i></div></div><span class="pct">' + a.pct + '%</span></div>';
    }).join('') : '<div class="empty-day">Немає даних — додай ліки й почни відмічати.</div>') + '</div>';

    html += '</div>';
    root.innerHTML = html;
    root.addEventListener('click', e => {
      const r = e.target.closest('[data-range]'); if (r) { App.state.statRange = r.getAttribute('data-range'); return App.render(); }
      const m = e.target.closest('[data-med]'); if (m) { App.state.statMed = m.getAttribute('data-med') || null; return App.render(); }
    });
  }

  App.views = App.views || {};
  App.views.stats = { render: render };
})(window.App = window.App || {});
