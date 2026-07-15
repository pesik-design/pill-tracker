/* views/addMed.js — додати / редагувати ліки. */
(function (App) {
  const S = () => App.store, SC = () => App.schedule, U = () => App.ui;
  let draft = null;

  function fresh() {
    return {
      id: null, name: '', form: 'tablet', dose: '', color: '#3a86e0',
      daysType: 'everyday', interval: 2, weekdays: [1, 3, 5],
      intakes: [{ anchor: 'wake', relation: 'at', offset: 0, clock: '08:00', dose: '' }],
      courseLen: 30, courseUnit: 'days', courseType: 'calendar',
      start: S().profile().treatmentStart, note: '', photo: null
    };
  }
  function fromMed(m) {
    const d = fresh();
    d.id = m.id; d.name = m.name; d.form = m.form; d.dose = m.dose; d.color = m.color || '#3a86e0';
    d.note = m.note || ''; d.photo = m.photo || null;
    const dd = m.days || { type: 'everyday' };
    d.daysType = dd.type; d.interval = dd.interval || 2; d.weekdays = dd.weekdays || [1, 3, 5];
    d.courseLen = m.course.length; d.courseUnit = m.course.unit; d.courseType = m.course.type; d.start = m.course.start;
    d.intakes = (m.intakes || []).map(x => ({ anchor: x.anchor, relation: x.relation || 'at', offset: x.offset || 0, clock: x.clock || '08:00', dose: x.dose || '' }));
    if (!d.intakes.length) d.intakes = fresh().intakes;
    return d;
  }
  function anchors() {
    const p = S().profile(), en = p.mealsEnabled;
    const a = [{ v: 'wake', l: 'Пробудження' }];
    if (en.breakfast !== false) a.push({ v: 'breakfast', l: 'Сніданок' });
    if (en.lunch !== false) a.push({ v: 'lunch', l: 'Обід' });
    if (en.dinner !== false) a.push({ v: 'dinner', l: 'Вечеря' });
    a.push({ v: 'sleep', l: 'Сон' }, { v: 'clock', l: 'Точний час' });
    return a;
  }
  function realTime(it) { return SC().intakeTime(S().profile(), it.anchor === 'clock' ? { anchor: 'clock', clock: it.clock } : { anchor: it.anchor, relation: it.relation, offset: Number(it.offset) || 0 }); }

  function segForm() {
    return App.icons.FORMS.map(f => '<span class="opt ' + (draft.form === f ? 'on' : '') + '" data-form="' + f + '">' + App.icons.FORM_LABELS[f] + '</span>').join('');
  }
  function segDays() {
    const o = [['everyday', 'Щодня'], ['interval', 'Через день'], ['weekdays', 'Дні тижня']];
    let h = o.map(x => '<span class="opt ' + (draft.daysType === x[0] ? 'on' : '') + '" data-days="' + x[0] + '">' + x[1] + '</span>').join('');
    if (draft.daysType === 'weekdays') {
      h += '<div class="seg" style="margin-top:8px">' + [1, 2, 3, 4, 5, 6, 0].map(i => '<span class="opt ' + (draft.weekdays.indexOf(i) >= 0 ? 'on' : '') + '" data-wd="' + i + '">' + U().WDS[i] + '</span>').join('') + '</div>';
    }
    return h;
  }
  function intakeRow(it, i) {
    const isClock = it.anchor === 'clock';
    let ctrl;
    if (isClock) ctrl = '<div class="customrow"><input type="time" data-i="' + i + '" data-k="clock" value="' + it.clock + '"></div>';
    else {
      const rel = [['before', 'За хв до'], ['at', 'Під час'], ['after', 'Через хв після']];
      ctrl = '<div class="seg">' + rel.map(r => '<span class="opt ' + (it.relation === r[0] ? 'on' : '') + '" data-i="' + i + '" data-rel="' + r[0] + '">' + r[1] + '</span>').join('') + '</div>';
      if (it.relation !== 'at') ctrl += '<div class="customrow"><input type="number" min="0" step="5" data-i="' + i + '" data-k="offset" value="' + (it.offset || 0) + '"> хв</div>';
    }
    const opts = anchors().map(a => '<option value="' + a.v + '" ' + (it.anchor === a.v ? 'selected' : '') + '>' + a.l + '</option>').join('');
    return '<div class="anchor"><div class="atop"><span class="num">ПРИЙОМ ' + (i + 1) + '</span>' +
      (draft.intakes.length > 1 ? '<button class="rm" data-rm="' + i + '">видалити</button>' : '') + '</div>' +
      '<select class="input" data-i="' + i + '" data-k="anchor" style="margin-bottom:9px">' + opts + '</select>' + ctrl +
      '<div class="rtime">' + App.icons.ui('clock', 'ic sm') + 'Реальний час ' + realTime(it) + '</div></div>';
  }

  function render(root) {
    if (!draft) draft = App.state.editMedId ? fromMed(S().meds().find(m => m.id === App.state.editMedId)) : fresh();
    const editing = !!draft.id, firstRun = App.state.firstRun;
    const colors = ['#3a86e0', '#5b56c4', '#28966a', '#c08a34', '#c26a99', '#cc584c'];

    let html = '<div class="wrap"><div class="topbar"><button class="backbtn" data-act="cancel">' + App.icons.ui('left', 'ic sm') + (firstRun ? 'Онбординг' : 'Назад') + '</button>' +
      '<button class="xclose iconbtn" title="' + (firstRun ? 'Пропустити — без ліків' : 'Закрити') + '" data-act="close">' + App.icons.ui('close', 'ic sm') + '</button></div>';
    html += '<div class="panel"><h3 style="font-size:23px;font-weight:300;margin:0 0 20px">' + (editing ? 'Редагувати' : 'Додати') + ' <b>ліки</b></h3>';
    html += '<div class="field"><label>Назва</label><input class="input big" id="fName" value="' + U().esc(draft.name) + '" placeholder="Напр. Вітамін D"></div>';
    html += '<div class="field"><label>Форма</label><div class="seg" id="segForm">' + segForm() + '</div></div>';
    html += '<div class="tworow"><div class="field"><label>Доза</label><input class="input" id="fDose" value="' + U().esc(draft.dose) + '" placeholder="1 таблетка"></div>' +
      '<div class="field"><label>Дні прийому</label><div class="seg" id="segDays">' + segDays() + '</div></div></div>';
    html += '<div class="field"><label>Прийоми на день · час кожного</label><div id="intakes">' + draft.intakes.map(intakeRow).join('') + '</div>' +
      '<span class="chip azure" data-act="addIntake" style="cursor:pointer;margin-top:2px">＋ ще прийом</span></div>';
    html += '<div class="tworow"><div class="field"><label>Тривалість курсу</label><div class="customrow"><input class="input" style="width:80px" type="number" min="1" id="fLen" value="' + draft.courseLen + '">' +
      '<select class="input" id="fUnit" style="width:auto"><option value="days" ' + (draft.courseUnit === 'days' ? 'selected' : '') + '>днів</option><option value="weeks" ' + (draft.courseUnit === 'weeks' ? 'selected' : '') + '>тижнів</option><option value="months" ' + (draft.courseUnit === 'months' ? 'selected' : '') + '>місяців</option></select></div></div>' +
      '<div class="field"><label>Початок</label><input class="input" type="date" id="fStart" value="' + draft.start + '"></div></div>';
    html += '<details class="adv"><summary>' + App.icons.ui('plus', 'ic sm') + ' Розширено — колір, фото, підрахунок, нотатка</summary>' +
      '<div class="field" style="margin-top:14px"><label>Колір мітки</label><div class="seg" id="segColor">' + colors.map(c => '<span class="opt color ' + (draft.color === c ? 'on' : '') + '" data-color="' + c + '" style="background:' + c + ';border-color:' + c + '"></span>').join('') + '</div></div>' +
      '<div class="field"><label>Підрахунок курсу</label><div class="seg" id="segCount"><span class="opt ' + (draft.courseType === 'calendar' ? 'on' : '') + '" data-count="calendar">Календар</span><span class="opt ' + (draft.courseType === 'doses' ? 'on' : '') + '" data-count="doses">За дозами</span></div></div>' +
      '<div class="field"><label>Фото упаковки</label>' + photoBlock() + '</div>' +
      '<div class="field"><label>Нотатка «як приймати»</label><input class="input" id="fNote" value="' + U().esc(draft.note) + '" placeholder="Напр. натщесерце, запити водою"></div></details>';
    // buttons
    html += '<div class="btnrow" style="display:flex;gap:11px;margin-top:20px">';
    if (firstRun) html += '<button class="btn soft lg" data-act="saveMore">＋ Додати ще ліки</button><button class="btn primary lg" style="flex:1" data-act="finish">Завершити налаштування</button>';
    else html += '<button class="btn lg" data-act="cancel">Скасувати</button><button class="btn primary lg" style="flex:1" data-act="save">' + (editing ? 'Зберегти зміни' : 'Зберегти') + '</button>';
    html += '</div></div></div>';
    root.innerHTML = html;
    wire(root);
  }

  function photoBlock() {
    if (draft.photo) return '<div class="photo-filled"><div class="thumb"><img src="' + draft.photo + '" alt=""></div><div class="pf-actions"><button class="btn" data-act="photoPick">' + App.icons.ui('pencil', 'ic sm') + 'Замінити</button><button class="btn danger" data-act="photoDel">' + App.icons.ui('trash', 'ic sm') + 'Видалити</button></div></div>';
    return '<div class="photo-filled"><div class="thumb">' + App.icons.ui('image', 'ic') + '</div><div class="pf-actions"><button class="btn" data-act="photoPick">' + App.icons.ui('plus', 'ic sm') + 'Додати фото</button></div></div>';
  }

  function build() {
    return {
      id: draft.id || undefined, name: draft.name.trim(), form: draft.form, dose: draft.dose.trim(),
      color: draft.color, note: draft.note.trim(), photo: draft.photo,
      days: draft.daysType === 'everyday' ? { type: 'everyday' } : draft.daysType === 'interval' ? { type: 'interval', interval: Number(draft.interval) || 2 } : { type: 'weekdays', weekdays: draft.weekdays.slice() },
      course: { start: draft.start, type: draft.courseType, length: Number(draft.courseLen) || 1, unit: draft.courseUnit },
      intakes: draft.intakes.map(x => x.anchor === 'clock'
        ? { anchor: 'clock', clock: x.clock || '08:00', dose: x.dose || undefined }
        : { anchor: x.anchor, relation: x.relation, offset: x.relation === 'at' ? 0 : Number(x.offset) || 0, dose: x.dose || undefined })
    };
  }
  function valid() {
    if (!draft.name.trim()) { U().toast('Вкажи назву'); return false; }
    if (!draft.dose.trim()) { U().toast('Вкажи дозу'); return false; }
    return true;
  }
  function persist() { const m = build(); if (m.id) S().updateMed(m.id, m); else S().addMed(m); }

  function wire(root) {
    const bind = (id, key) => { const e = root.querySelector(id); if (e) e.addEventListener('input', ev => draft[key] = ev.target.value); };
    bind('#fName', 'name'); bind('#fDose', 'dose'); bind('#fNote', 'note');
    root.querySelector('#fLen') && root.querySelector('#fLen').addEventListener('input', e => draft.courseLen = e.target.value);
    root.querySelector('#fUnit') && root.querySelector('#fUnit').addEventListener('change', e => draft.courseUnit = e.target.value);
    root.querySelector('#fStart') && root.querySelector('#fStart').addEventListener('change', e => draft.start = e.target.value);
    // intake selects/inputs
    root.querySelectorAll('#intakes [data-k]').forEach(elm => elm.addEventListener('change', e => {
      const i = +e.target.getAttribute('data-i'), k = e.target.getAttribute('data-k');
      draft.intakes[i][k] = e.target.value; render(root);
    }));
    root.addEventListener('click', e => {
      const t = e.target.closest('[data-act],[data-form],[data-days],[data-wd],[data-rel],[data-color],[data-count],[data-rm]'); if (!t) return;
      if (t.hasAttribute('data-form')) { draft.form = t.getAttribute('data-form'); return render(root); }
      if (t.hasAttribute('data-days')) { draft.daysType = t.getAttribute('data-days'); return render(root); }
      if (t.hasAttribute('data-wd')) { const i = +t.getAttribute('data-wd'); const p = draft.weekdays.indexOf(i); if (p >= 0) draft.weekdays.splice(p, 1); else draft.weekdays.push(i); return render(root); }
      if (t.hasAttribute('data-rel')) { const i = +t.getAttribute('data-i'); draft.intakes[i].relation = t.getAttribute('data-rel'); return render(root); }
      if (t.hasAttribute('data-color')) { draft.color = t.getAttribute('data-color'); return render(root); }
      if (t.hasAttribute('data-count')) { draft.courseType = t.getAttribute('data-count'); return render(root); }
      if (t.hasAttribute('data-rm')) { draft.intakes.splice(+t.getAttribute('data-rm'), 1); return render(root); }
      const a = t.getAttribute('data-act');
      if (a === 'addIntake') { draft.intakes.push({ anchor: 'wake', relation: 'at', offset: 0, clock: '08:00', dose: '' }); return render(root); }
      if (a === 'photoPick') return pickPhoto(root);
      if (a === 'photoDel') { draft.photo = null; return render(root); }
      if (a === 'cancel' || a === 'close') { const fr = App.state.firstRun; draft = null; App.state.editMedId = null; App.state.firstRun = false; App.go(fr ? 'today' : (App.state.editMedId ? 'settings' : 'settings')); return; }
      if (a === 'save') { if (!valid()) return; persist(); draft = null; App.state.editMedId = null; U().toast('Збережено'); App.go('settings'); return; }
      if (a === 'saveMore') { if (!valid()) return; persist(); draft = fresh(); U().toast('Додано ✓'); render(root); return; }
      if (a === 'finish') { if (draft.name.trim() && draft.dose.trim()) persist(); draft = null; App.state.firstRun = false; App.go('today'); return; }
    });
  }

  function pickPhoto(root) {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return;
      const r = new FileReader(); r.onload = () => { draft.photo = r.result; render(root); }; r.readAsDataURL(f);
    };
    inp.click();
  }

  App.views = App.views || {};
  App.views.addMed = { render: render, reset: function () { draft = null; } };
})(window.App = window.App || {});
