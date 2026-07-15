/* schedule.js — рушій: час з прив'язок, дні курсу, статуси, прогрес, статистика. */
(function (App) {
  /* ---------- дати ---------- */
  function pad(n) { return String(n).padStart(2, '0'); }
  function toKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function fromKey(k) { const p = k.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function dayDiff(a, b) { // b - a у днях
    return Math.round((fromKey(b).setHours(12, 0, 0, 0) - fromKey(a).setHours(12, 0, 0, 0)) / 86400000);
  }
  function addDays(k, n) { const d = fromKey(k); d.setDate(d.getDate() + n); return toKey(d); }
  function todayKey() { return toKey(new Date()); }

  /* ---------- час ---------- */
  function parseHM(s) { const p = (s || '0:0').split(':').map(Number); return (p[0] || 0) * 60 + (p[1] || 0); }
  function fmtHM(mins) { mins = ((Math.round(mins) % 1440) + 1440) % 1440; return pad(Math.floor(mins / 60)) + ':' + pad(mins % 60); }

  function anchorMinutes(profile, anchor) {
    const day = profile.day;
    if (anchor === 'wake') return parseHM(day.wake);
    if (anchor === 'sleep') return parseHM(day.sleep);
    return parseHM((day.meals && day.meals[anchor]) || day.wake);
  }
  function intakeTime(profile, intake) {
    if (!intake) return '08:00';
    if (intake.anchor === 'clock') return intake.clock || '08:00';
    let base = anchorMinutes(profile, intake.anchor);
    const off = intake.offset || 0;
    if (intake.relation === 'before') base -= off;
    else if (intake.relation === 'after') base += off;
    return fmtHM(base);
  }
  function anchorLabel(intake) {
    if (!intake) return '';
    if (intake.anchor === 'clock') return 'о ' + (intake.clock || '');
    const names = { wake: 'пробудження', breakfast: 'сніданку', lunch: 'обіду', dinner: 'вечері', sleep: 'сну' };
    const ev = names[intake.anchor] || '';
    if (intake.relation === 'before') return 'за ' + (intake.offset || 0) + ' хв до ' + ev;
    if (intake.relation === 'after') return 'через ' + (intake.offset || 0) + ' хв після ' + ev;
    return 'під час ' + (intake.anchor === 'wake' || intake.anchor === 'sleep' ? ev : ev);
  }

  /* ---------- курс ---------- */
  function endDateKey(course) {
    const d = fromKey(course.start);
    if (course.unit === 'weeks') d.setDate(d.getDate() + course.length * 7 - 1);
    else if (course.unit === 'months') { d.setMonth(d.getMonth() + course.length); d.setDate(d.getDate() - 1); }
    else d.setDate(d.getDate() + course.length - 1);
    return toKey(d);
  }
  function courseLengthDays(course) { return dayDiff(course.start, endDateKey(course)) + 1; }

  function totalDoses(med) {
    if (med.phases && med.phases.length) return Math.max.apply(null, med.phases.map(p => p.to));
    return med.course.length; // для type==='doses'
  }

  /* ---------- статуси ---------- */
  function statusTaken(v) { return !!v && (v === 'taken' || v.s === 'taken'); }
  function takenBefore(med, log, key) {
    let n = 0;
    for (const dk in log) {
      if (dayDiff(dk, key) > 0) {
        const day = log[dk];
        for (const kk in day) if (kk.split('@')[0] === med.id && statusTaken(day[kk])) n++;
      }
    }
    return n;
  }
  function takenTotal(med, log) {
    let n = 0;
    for (const dk in log) { const day = log[dk]; for (const kk in day) if (kk.split('@')[0] === med.id && statusTaken(day[kk])) n++; }
    return n;
  }

  /* ---------- дні прийому ---------- */
  function matchesDays(med, key) {
    const days = med.days || { type: 'everyday' };
    if (days.type === 'everyday') return true;
    if (days.type === 'weekdays') return (days.weekdays || []).indexOf(fromKey(key).getDay()) >= 0;
    const diff = dayDiff(med.course.start, key);
    if (diff < 0) return false;
    if (days.type === 'interval') return diff % (days.interval || 1) === 0;
    if (days.type === 'cycle') { const per = (days.cycleOn || 1) + (days.cycleOff || 0); return per > 0 && (diff % per) < days.cycleOn; }
    return true;
  }
  function isPaused(med, key) {
    return (med.paused || []).some(p => dayDiff(p.from, key) >= 0 && (!p.to || dayDiff(key, p.to) >= 0));
  }
  function isDoseCounted(med) { return (med.course && med.course.type === 'doses') || (med.phases && med.phases.length); }

  function medActiveOn(med, profile, key, log) {
    if (!med.course) return false;
    if (dayDiff(med.course.start, key) < 0) return false;
    if (isPaused(med, key)) return false;
    if (!matchesDays(med, key)) return false;
    if (isDoseCounted(med)) return takenBefore(med, log, key) < totalDoses(med);
    return dayDiff(key, endDateKey(med.course)) >= 0; // key <= end
  }

  /* ---------- блоки часу ---------- */
  function blockOf(mins) {
    if (mins < 11 * 60) return { key: 'morning', title: 'Зранку', icon: 'sun', o: 1 };
    if (mins < 16 * 60) return { key: 'midday', title: 'Вдень', icon: 'food', o: 2 };
    if (mins < 21 * 60 + 30) return { key: 'evening', title: 'Ввечері', icon: 'sunset', o: 3 };
    return { key: 'night', title: 'Перед сном', icon: 'moon', o: 4 };
  }

  /* ---------- прийоми на дату ---------- */
  function occurrencesForDate(profile, meds, key, log) {
    const out = [];
    meds.forEach(med => {
      if (!medActiveOn(med, profile, key, log)) return;
      const intakes = (med.intakes && med.intakes.length) ? med.intakes : [{ anchor: 'wake', relation: 'at', offset: 0, dose: med.dose }];
      // номер дози для фаз (припущення: 1 прийом/день для фазних)
      let doseNum = isDoseCounted(med) ? takenBefore(med, log, key) + 1 : null;
      intakes.forEach((intake, i) => {
        let name = med.name, dose = intake.dose || med.dose;
        let phaseInfo = null;
        if (med.phases && med.phases.length) {
          const ph = med.phases.find(p => doseNum >= p.from && doseNum <= p.to);
          if (ph) { name = ph.name; dose = ph.dose || dose; phaseInfo = doseNum + '/' + totalDoses(med); }
        }
        const time = intakeTime(profile, intake);
        const mins = parseHM(time);
        const doseKey = med.id + '@' + i;
        out.push({
          med: med, medId: med.id, idx: i, doseKey: doseKey,
          name: name, dose: dose, note: med.note || '', form: med.form || 'tablet', color: med.color || '#3a86e0',
          time: time, mins: mins, block: blockOf(mins), anchorLabel: anchorLabel(intake),
          phaseInfo: phaseInfo, status: log[key] ? log[key][doseKey] : undefined
        });
      });
    });
    out.sort((a, b) => a.mins - b.mins);
    return out;
  }

  function groupByBlock(occ) {
    const map = {};
    occ.forEach(o => { (map[o.block.key] = map[o.block.key] || { block: o.block, items: [] }).items.push(o); });
    return Object.keys(map).map(k => map[k]).sort((a, b) => a.block.o - b.block.o);
  }

  /* ---------- прогрес курсу ---------- */
  function courseProgress(med, profile, tKey, log) {
    if (isDoseCounted(med)) {
      const total = totalDoses(med), done = Math.min(takenTotal(med, log), total);
      let next = null;
      if (med.phases && med.phases.length && done < total) {
        const ph = med.phases.find(p => (done + 1) >= p.from && (done + 1) <= p.to);
        next = ph ? ph.name : null;
      }
      return { mode: 'doses', done: done, total: total, unit: 'доз', finished: done >= total, pct: Math.round(done / total * 100), next: next };
    }
    const total = courseLengthDays(med.course);
    const idx = Math.max(0, Math.min(dayDiff(med.course.start, tKey) + 1, total));
    const finished = dayDiff(tKey, endDateKey(med.course)) < 0;
    const left = Math.max(0, total - idx);
    return { mode: 'calendar', done: idx, total: total, unit: 'днів', finished: finished, pct: Math.round(idx / total * 100), left: left, end: endDateKey(med.course) };
  }

  /* ---------- статистика дня ---------- */
  function dayStats(profile, meds, key, log) {
    const occ = occurrencesForDate(profile, meds, key, log);
    let taken = 0, snoozed = 0;
    occ.forEach(o => { if (statusTaken(o.status)) taken++; else if (o.status && o.status.s === 'snoozed') snoozed++; });
    return { total: occ.length, taken: taken, snoozed: snoozed, done: occ.length > 0 && taken === occ.length };
  }

  function adherence(profile, meds, fromK, toK, log) {
    let total = 0, taken = 0, missed = 0;
    const tk = todayKey();
    const n = dayDiff(fromK, toK);
    for (let i = 0; i <= n; i++) {
      const key = addDays(fromK, i);
      if (dayDiff(key, tk) < 0) break; // не рахуємо майбутнє
      const occ = occurrencesForDate(profile, meds, key, log);
      occ.forEach(o => {
        total++;
        if (statusTaken(o.status)) taken++;
        else if (dayDiff(key, tk) > 0) missed++; // минулий день, не прийнято
      });
    }
    return { total: total, taken: taken, missed: missed, pct: total ? Math.round(taken / total * 100) : 100 };
  }

  function streak(profile, meds, tKey, log) {
    let s = 0;
    // рахуємо від вчора назад повні дні, потім додаємо сьогодні якщо повний
    for (let i = 1; i <= 180; i++) {
      const key = addDays(tKey, -i);
      const st = dayStats(profile, meds, key, log);
      if (st.total === 0) continue;      // день без прийомів — не рве
      if (st.done) s++; else break;
    }
    const today = dayStats(profile, meds, tKey, log);
    if (today.total > 0 && today.done) s++;
    return s;
  }

  App.schedule = {
    toKey: toKey, fromKey: fromKey, dayDiff: dayDiff, addDays: addDays, todayKey: todayKey,
    parseHM: parseHM, fmtHM: fmtHM,
    intakeTime: intakeTime, anchorLabel: anchorLabel,
    endDateKey: endDateKey, courseLengthDays: courseLengthDays, totalDoses: totalDoses, isDoseCounted: isDoseCounted,
    medActiveOn: medActiveOn, matchesDays: matchesDays, isPaused: isPaused,
    occurrencesForDate: occurrencesForDate, groupByBlock: groupByBlock, blockOf: blockOf,
    courseProgress: courseProgress, dayStats: dayStats, adherence: adherence, streak: streak,
    statusTaken: statusTaken, takenTotal: takenTotal
  };
})(window.App = window.App || {});
