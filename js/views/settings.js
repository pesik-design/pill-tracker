/* views/settings.js — редагує все + керує ліками. */
(function (App) {
  const S = () => App.store, SC = () => App.schedule, U = () => App.ui;
  const MEALS = [['breakfast', '🍳', 'Сніданок'], ['lunch', '🥗', 'Обід'], ['dinner', '🍽️', 'Вечеря']];

  function daysLabel(med) {
    const d = med.days || { type: 'everyday' };
    if (d.type === 'everyday') return 'Щодня';
    if (d.type === 'interval') return 'Через ' + (d.interval || 2) + ' дн.';
    if (d.type === 'weekdays') return (d.weekdays || []).map(i => U().WDS[i]).join(', ');
    return d.cycleOn + '/' + d.cycleOff + ' цикл';
  }
  function intakesLabel(med) {
    return (med.intakes || []).map(x => SC().intakeTime(S().profile(), x) + ' · ' + SC().anchorLabel(x)).join('<br>');
  }
  function courseLabel(med) {
    if (SC().isDoseCounted(med)) return SC().totalDoses(med) + ' доз (за дозами)';
    const u = { days: 'днів', weeks: 'тижнів', months: 'місяців' }[med.course.unit];
    return med.course.length + ' ' + u + ' · до ' + U().dateDot(SC().endDateKey(med.course));
  }

  function medBlock(m) {
    const open = App.state.expandMed === m.id;
    const paused = SC().isPaused(m, SC().todayKey());
    let h = '<div class="medhead" data-expand="' + m.id + '">' + U().tile(m.form, m.color, 38) +
      '<div class="ml"><div class="t">' + U().esc(m.name) + '</div><div class="d">' + U().esc(m.dose) + ' · ' + daysLabel(m) + (paused ? ' · ⏸️ пауза' : '') + '</div></div>' +
      '<span class="mededit" title="Редагувати" data-edit="' + m.id + '">' + App.icons.ui('pencil', 'ic sm') + '</span>' +
      '<span class="chev">' + App.icons.ui(open ? 'up' : 'right', 'ic sm') + '</span></div>';
    if (open) {
      h += '<div class="medparams"><div class="pgrid">' +
        pitem('Форма · доза', App.icons.FORM_LABELS[m.form] + ' · ' + m.dose) +
        pitem('Дні', daysLabel(m)) +
        pitem('Прийоми', intakesLabel(m)) +
        pitem('Курс', courseLabel(m)) +
        '</div><div class="medactions">' +
        '<button class="btn azure" data-edit="' + m.id + '">' + App.icons.ui('pencil', 'ic sm') + 'Редагувати</button>' +
        '<button class="btn" data-pause="' + m.id + '">' + App.icons.ui('pause', 'ic sm') + (paused ? 'Продовжити' : 'Пауза') + '</button>' +
        '<button class="btn danger" data-del="' + m.id + '">' + App.icons.ui('trash', 'ic sm') + 'Видалити</button></div></div>';
    }
    return h;
  }
  function pitem(k, v) { return '<div class="pitem"><span class="pk">' + k + '</span><span class="pv">' + v + '</span></div>'; }

  function render(root) {
    const p = S().profile();
    let html = '<div class="wrap">' + App.pageTop('settings') + '<div class="setwrap">';
    // profile
    html += '<div class="group"><div class="gt">Профіль</div>' +
      '<div class="srow"><span class="si">' + App.icons.ui('user', 'ic sm') + '</span><div class="sl"><div class="t">Ім\'я</div></div><input type="text" id="sName" value="' + U().esc(p.name) + '"></div>' +
      '<div class="srow"><span class="si">' + App.icons.ui('calendar', 'ic sm') + '</span><div class="sl"><div class="t">Старт курсу</div></div><input type="date" id="sStart" value="' + p.treatmentStart + '"></div></div>';
    // day
    let dayRows = '<div class="srow"><span class="si">' + App.icons.ui('sun', 'ic sm') + '</span><div class="sl"><div class="t">Прокидаюсь</div></div><input type="time" data-day="wake" value="' + p.day.wake + '"></div>';
    MEALS.forEach(m => {
      const on = p.mealsEnabled[m[0]] !== false;
      dayRows += '<div class="srow"><span class="si">' + m[1] + '</span><div class="sl"><div class="t">' + m[2] + '</div></div>' +
        (on ? '<input type="time" data-meal="' + m[0] + '" value="' + p.day.meals[m[0]] + '">' : '<span class="val" style="color:var(--faint)">вимк.</span>') +
        '<span class="switch ' + (on ? '' : 'off') + '" data-toggle-meal="' + m[0] + '" style="margin-left:10px"></span></div>';
    });
    dayRows += '<div class="srow"><span class="si">' + App.icons.ui('moon', 'ic sm') + '</span><div class="sl"><div class="t">Сон</div></div><input type="time" data-day="sleep" value="' + p.day.sleep + '"></div>';
    html += '<div class="group"><div class="gt">Режим дня</div>' + dayRows + '</div>';
    // meds
    html += '<div class="group"><div class="gt">Мої ліки</div>' + (S().meds().length ? S().meds().map(medBlock).join('') : '<div class="srow"><div class="sl"><div class="d">Ще немає ліків</div></div></div>') +
      '<div class="addmed" data-add="1">' + App.icons.ui('plus', 'ic sm') + 'Додати ліки</div></div>';
    // snooze
    html += '<div class="group"><div class="gt">«Пізніше» — на скільки відкладати</div><div class="snooze-seg">' +
      [15, 30, 60, 120].map(v => '<span class="opt ' + (p.snoozeMinutes === v ? 'on' : '') + '" data-snooze="' + v + '">' + (v < 60 ? v + ' хв' : (v / 60) + ' год') + '</span>').join('') + '</div></div>';
    // data
    html += '<div class="group"><div class="gt">Дані</div><div class="dbtn"><button class="btn" data-act="export">' + App.icons.ui('download', 'ic sm') + 'Експорт JSON</button><button class="btn" data-act="import">' + App.icons.ui('upload', 'ic sm') + 'Імпорт JSON</button></div>' +
      '<div class="dbtn" style="padding-top:0"><button class="btn danger block" data-act="reset">Скинути всі дані</button></div></div>';

    html += '</div></div>';
    root.innerHTML = html;
    wire(root);
  }

  function wire(root) {
    root.querySelector('#sName').addEventListener('input', e => S().setProfile({ name: e.target.value }));
    root.querySelector('#sStart').addEventListener('change', e => S().setProfile({ treatmentStart: e.target.value }));
    root.querySelectorAll('input[data-day]').forEach(i => i.addEventListener('change', e => S().setDay({ [e.target.getAttribute('data-day')]: e.target.value })));
    root.querySelectorAll('input[data-meal]').forEach(i => i.addEventListener('change', e => { const meals = Object.assign({}, S().profile().day.meals); meals[e.target.getAttribute('data-meal')] = e.target.value; S().setDay({ meals: meals }); }));

    root.addEventListener('click', e => {
      const t = e.target.closest('[data-toggle-meal],[data-expand],[data-edit],[data-pause],[data-del],[data-add],[data-snooze],[data-theme],[data-act]'); if (!t) return;
      if (t.hasAttribute('data-toggle-meal')) { const m = t.getAttribute('data-toggle-meal'); const en = Object.assign({}, S().profile().mealsEnabled); en[m] = en[m] === false; S().setProfile({ mealsEnabled: en }); return App.render(); }
      if (t.hasAttribute('data-edit')) { App.state.editMedId = t.getAttribute('data-edit'); App.views.addMed.reset(); return App.go('add'); }
      if (t.hasAttribute('data-expand')) { const id = t.getAttribute('data-expand'); App.state.expandMed = App.state.expandMed === id ? null : id; return App.render(); }
      if (t.hasAttribute('data-pause')) {
        const m = S().meds().find(x => x.id === t.getAttribute('data-pause')); const tk = SC().todayKey();
        if (SC().isPaused(m, tk)) { const pa = (m.paused || []).filter(pp => !(SC().dayDiff(pp.from, tk) >= 0 && (!pp.to || SC().dayDiff(tk, pp.to) >= 0))); S().updateMed(m.id, { paused: pa }); U().toast('Курс продовжено'); }
        else { const pa = (m.paused || []).concat([{ from: tk, to: null }]); S().updateMed(m.id, { paused: pa }); U().toast('Поставлено на паузу'); }
        return App.render();
      }
      if (t.hasAttribute('data-del')) { if (confirm('Видалити ці ліки?')) { S().removeMed(t.getAttribute('data-del')); App.render(); } return; }
      if (t.hasAttribute('data-add')) { App.state.editMedId = null; App.views.addMed.reset(); return App.go('add'); }
      if (t.hasAttribute('data-snooze')) { S().setProfile({ snoozeMinutes: +t.getAttribute('data-snooze') }); return App.render(); }
      const a = t.getAttribute('data-act');
      if (a === 'export') return doExport();
      if (a === 'import') return doImport();
      if (a === 'reset') { if (confirm('Стерти всі дані застосунку?')) { S().reset(); App.state.editMedId = null; App.go('onboarding'); } return; }
    });
  }

  function doExport() {
    const blob = new Blob([S().exportJSON()], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'pill-tracker-backup.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function doImport() {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json';
    inp.onchange = () => { const f = inp.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { S().importJSON(r.result); U().toast('Імпортовано'); App.render(); } catch (e) { U().toast('Помилка файлу'); } }; r.readAsText(f); };
    inp.click();
  }

  App.views = App.views || {};
  App.views.settings = { render: render };
})(window.App = window.App || {});
