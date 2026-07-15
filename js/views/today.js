/* views/today.js — головний екран «Сьогодні». */
(function (App) {
  const S = () => App.store, SC = () => App.schedule, U = () => App.ui;

  const HERO = '<div class="hero-wave" aria-hidden="true"><svg viewBox="0 0 900 360" preserveAspectRatio="none">' +
    '<defs><linearGradient id="wg" x1="0" y1="0" x2="1" y2="0.35"><stop offset="0" stop-color="#8bbcff"/><stop offset="0.5" stop-color="#69d3c8"/><stop offset="1" stop-color="#bda6f4"/></linearGradient>' +
    '<linearGradient id="wf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6fb" stop-opacity="0"/><stop offset="0.5" stop-color="#f4f6fb" stop-opacity="0.5"/><stop offset="1" stop-color="#f4f6fb" stop-opacity="1"/></linearGradient>' +
    '<filter id="wb" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="15"/></filter></defs>' +
    '<rect width="900" height="360" fill="url(#wg)"/>' +
    '<g filter="url(#wb)"><path d="M-60,80 C150,6 330,132 520,62 C700,0 840,104 970,56 L970,-60 L-60,-60 Z" fill="#fff" opacity="0.42"/>' +
    '<path d="M-60,178 C170,104 320,210 500,150 C690,90 840,182 970,134 L970,-10 L-60,-10 Z" fill="#fff" opacity="0.22"/>' +
    '<ellipse cx="250" cy="60" rx="205" ry="82" fill="#fff" opacity="0.32"/><ellipse cx="735" cy="104" rx="185" ry="72" fill="#c8f2ea" opacity="0.5"/></g>' +
    '<rect width="900" height="360" fill="url(#wf)"/></svg></div>';

  function daysLabel(med) {
    const d = med.days || { type: 'everyday' };
    if (d.type === 'everyday') return 'щодня';
    if (d.type === 'interval') return 'через день';
    if (d.type === 'weekdays') return (d.weekdays || []).map(i => U().WDS[i]).join(', ');
    if (d.type === 'cycle') return d.cycleOn + '/' + d.cycleOff + ' цикл';
    return '';
  }
  function medSummary(med) {
    const n = (med.intakes || []).length || 1;
    return med.dose + ' · ' + daysLabel(med) + (n > 1 ? ' · ' + n + '×/день' : '');
  }

  function medCard(med) {
    const p = SC().courseProgress(med, S().profile(), SC().todayKey(), S().log());
    let sub, chip;
    if (p.mode === 'doses') { sub = 'Блок ' + p.total + ' доз'; chip = p.finished ? '✓ завершено' : (p.next ? 'далі ' + p.next : p.done + '/' + p.total); }
    else { sub = 'Курс ' + p.total + ' днів'; chip = p.finished ? '✓ завершено' : 'залишилось ' + p.left + ' дн.'; }
    return '<div class="medcard">' +
      '<div class="top">' + U().tile(med.form, med.color) +
      '<div style="flex:1;margin-left:11px"><div class="mn">' + U().esc(med.name) + '</div><div class="mm">' + U().esc(medSummary(med)) + '</div></div></div>' +
      '<div class="pl"><span>' + sub + '</span><b>' + p.done + ' / ' + p.total + '</b></div>' +
      '<div class="mini"><i style="width:' + Math.max(2, p.pct) + '%"></i></div>' +
      '<span class="left">' + chip + '</span></div>';
  }

  function doseRow(o) {
    const taken = SC().statusTaken(o.status);
    const snoozed = o.status && o.status.s === 'snoozed';
    let right;
    if (taken) right = '';
    else if (snoozed) right = '<span class="chip amber">⏰ до ' + (o.status.until || '') + '</span>';
    else right = '<button class="later" data-act="later" data-key="' + o.doseKey + '">' + App.icons.ui('clock', 'ic sm') + 'Пізніше</button>';
    return '<div class="dose ' + (taken ? 'done' : snoozed ? 'snoozed' : '') + '">' +
      '<span class="check" data-act="toggle" data-key="' + o.doseKey + '">' + App.icons.ui('check', 'ic sm') + '</span>' +
      '<div class="di"><div class="dn">' + U().esc(o.name) + '<span class="dd">' + U().esc(o.dose) + '</span></div>' +
      '<div class="note">' + U().esc(o.note || o.anchorLabel) + (o.phaseInfo ? ' · застосування ' + o.phaseInfo : '') + '</div></div>' + right + '</div>';
  }

  function block(g) {
    const grad = { sun: 'linear-gradient(140deg,#6a8ae6,#3a86e0)', food: 'linear-gradient(140deg,#e0b45f,#c2922f)', sunset: 'linear-gradient(140deg,#5a9be8,#3a86e0)', moon: 'linear-gradient(140deg,#d189b8,#c26a99)' }[g.block.icon] || 'linear-gradient(140deg,#6a8ae6,#3a86e0)';
    const times = g.items.map(i => i.time).filter((v, idx, a) => a.indexOf(v) === idx).slice(0, 2).join(' · ');
    return '<div class="block"><div class="bh"><div class="bt"><span class="tico" style="background:' + grad + '">' + App.icons.ui(g.block.icon, 'ic sm') + '</span>' + g.block.title + '</div><div class="btime">' + times + '</div></div>' +
      g.items.map(doseRow).join('') + '</div>';
  }

  function reminderItem(r) {
    return '<details><summary><span class="ri">' + App.icons.ui('bookmark', 'ic sm') + '</span><span class="rt">' + U().esc(r.title) + (r.body ? '<small>' + U().esc(r.body).slice(0, 60) + '</small>' : '') + '</span><span class="chev">' + App.icons.ui('right', 'ic sm') + '</span></summary>' +
      '<div class="rbody">' + U().esc(r.body) + (r.photo ? '<img src="' + r.photo + '" alt="">' : '') + '</div></details>';
  }

  function render(root) {
    const prof = S().profile(), meds = S().meds(), log = S().log();
    const vd = App.state.viewDate, tk = SC().todayKey();
    const occ = SC().occurrencesForDate(prof, meds, vd, log);
    const groups = SC().groupByBlock(occ);
    const st = SC().dayStats(prof, meds, vd, log);
    const strk = SC().streak(prof, meds, tk, log);
    const remaining = st.total - st.taken;
    const dayIdx = SC().dayDiff(prof.treatmentStart, vd) + 1;

    let html = HERO + '<div class="wrap">';
    // topbar
    html += '<div class="topbar"><div class="brand"><span class="dot"></span>пілюлі</div><div class="top-actions">' +
      '<span class="iconbtn" title="Статистика" data-act="nav" data-route="stats">' + App.icons.ui('chart', 'ic sm') + '</span>' +
      '<span class="iconbtn" title="Нагадування" data-act="nav" data-route="reminders">' + App.icons.ui('bookmark', 'ic sm') + '</span>' +
      '<span class="iconbtn" title="Налаштування" data-act="nav" data-route="settings">' + App.icons.ui('gear', 'ic sm') + '</span></div></div>';
    // greeting
    html += '<div class="greetrow"><div><div class="greet">Привіт, <b>' + U().esc(prof.name || 'друже') + '</b> 👋</div>' +
      '<div class="substreak"><span class="streak">🔥 Стрік ' + strk + ' дн.</span>' +
      (vd === tk && remaining > 0 ? '<span class="muted">попереду ще ' + remaining + ' ' + U().plural(remaining, ['прийом', 'прийоми', 'прийомів']) + ' сьогодні</span>' : (vd === tk && st.total > 0 ? '<span class="muted">усе прийнято на сьогодні ✓</span>' : '')) + '</div></div>' +
      '<div class="startfield"><span class="si">' + App.icons.ui('calendar', 'ic sm') + '</span><div><div class="sl">СТАРТ КУРСУ</div>' +
      '<input type="date" id="startDate" value="' + prof.treatmentStart + '"></div></div></div>';
    // your meds
    html += '<div class="sec"><h4>Твої ліки</h4><span class="act" data-act="nav" data-route="settings">' + App.icons.ui('gear', 'ic sm') + 'Керувати</span></div>';
    if (meds.length) html += '<div class="meds">' + meds.map(medCard).join('') + '</div>';
    else html += '<div class="meds"><div class="medcard" style="grid-column:1/-1;text-align:center;color:var(--muted)">Ще немає ліків. <a href="#add" style="color:var(--azure-ink);font-weight:600">Додати перші</a></div></div>';
    // day switch
    html += '<div class="dayrow"><div class="dayswitch"><span class="arw" data-act="dayprev">' + App.icons.ui('left', 'ic sm') + '</span>' +
      '<div class="dd"><div class="d1">' + (dayIdx >= 1 ? 'День ' + dayIdx : 'До старту') + (vd === tk ? ' · Сьогодні' : '') + '</div><div class="d2">' + U().dateFull(vd) + '</div></div>' +
      '<span class="arw" data-act="daynext">' + App.icons.ui('right', 'ic sm') + '</span></div>' +
      '<span class="takensmall"><span class="dotg"></span>Прийнято <b>' + st.taken + ' з ' + st.total + '</b></span></div>';
    // schedule
    html += '<div class="divlabel">Розклад на день</div>';
    if (groups.length) html += '<div class="blocks">' + groups.map(block).join('') + '</div>';
    else html += '<div class="block"><div class="empty-day">' + (dayIdx < 1 ? 'Курс ще не почався.' : '🎉 На цей день прийомів немає.') + '</div></div>';
    // reminders
    const rems = S().reminders();
    html += '<div class="sec" style="margin-top:26px"><h4>Важливі нагадування</h4><span class="act" data-act="nav" data-route="reminders">' + App.icons.ui('plus', 'ic sm') + 'Додати</span></div>';
    if (rems.length) html += '<div class="rem">' + rems.map(reminderItem).join('') + '</div>';
    else html += '<div class="rem"><div class="empty-day">Поки порожньо. Додай важливі нотатки чи фото рецепта.</div></div>';

    html += '</div>';
    root.innerHTML = html;

    // events
    root.querySelector('#startDate').addEventListener('change', e => {
      S().setProfile({ treatmentStart: e.target.value }); App.render();
    });
    root.addEventListener('click', onClick);
  }

  function onClick(e) {
    const t = e.target.closest('[data-act]'); if (!t) return;
    const act = t.getAttribute('data-act');
    if (act === 'nav') { App.go(t.getAttribute('data-route')); return; }
    if (act === 'dayprev') { App.state.viewDate = SC().addDays(App.state.viewDate, -1); App.render(); return; }
    if (act === 'daynext') { App.state.viewDate = SC().addDays(App.state.viewDate, 1); App.render(); return; }
    if (act === 'toggle' || act === 'later') {
      const key = t.getAttribute('data-key'); const vd = App.state.viewDate;
      const cur = S().getStatus(vd, key);
      if (act === 'toggle') {
        if (SC().statusTaken(cur)) S().setStatus(vd, key, null);
        else { const now = vd === SC().todayKey() ? SC().fmtHM(new Date().getHours() * 60 + new Date().getMinutes()) : ''; S().setStatus(vd, key, { s: 'taken', t: now }); }
      } else {
        // snooze
        const occ = SC().occurrencesForDate(S().profile(), S().meds(), vd, S().log()).find(o => o.doseKey === key);
        const base = occ ? SC().parseHM(occ.time) : 0;
        const until = SC().fmtHM(base + (S().profile().snoozeMinutes || 60));
        S().setStatus(vd, key, { s: 'snoozed', until: until });
      }
      App.render();
    }
  }

  App.views = App.views || {};
  App.views.today = { render: render };
})(window.App = window.App || {});
