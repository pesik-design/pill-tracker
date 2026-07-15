/* store.js — стан у localStorage. Єдине джерело правди. */
(function (App) {
  const KEY = 'pillTracker.v1';

  function defaults() {
    return {
      profile: {
        name: '',
        treatmentStart: App.schedule.toKey(new Date()),
        day: {
          wake: '08:00', sleep: '23:00',
          meals: { breakfast: '09:00', lunch: '14:00', dinner: '19:00' }
        },
        mealsEnabled: { breakfast: true, lunch: true, dinner: true },
        snoozeMinutes: 60,
        theme: 'auto',
        onboarded: false
      },
      meds: [],
      log: {},
      reminders: []
    };
  }

  function migrate(st) {
    const d = defaults();
    st = st && typeof st === 'object' ? st : d;
    st.profile = Object.assign({}, d.profile, st.profile || {});
    st.profile.day = Object.assign({}, d.profile.day, st.profile.day || {});
    st.profile.day.meals = Object.assign({}, d.profile.day.meals, (st.profile.day || {}).meals || {});
    st.profile.mealsEnabled = Object.assign({}, d.profile.mealsEnabled, st.profile.mealsEnabled || {});
    if (!Array.isArray(st.meds)) st.meds = [];
    if (!st.log || typeof st.log !== 'object') st.log = {};
    if (!Array.isArray(st.reminders)) st.reminders = [];
    return st;
  }

  let state = null;

  function load() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) {}
    let parsed = null;
    try { parsed = raw ? JSON.parse(raw) : null; } catch (e) { parsed = null; }
    state = migrate(parsed || defaults());
    return state;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('save failed', e); }
  }
  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 1e6).toString(36);
  }

  const S = {
    get: function () { return state || load(); },
    load: load,
    save: save,
    profile: function () { return S.get().profile; },
    meds: function () { return S.get().meds; },
    reminders: function () { return S.get().reminders; },
    log: function () { return S.get().log; },

    setProfile: function (patch) { Object.assign(state.profile, patch); save(); },
    setDay: function (patch) { Object.assign(state.profile.day, patch); save(); },

    addMed: function (med) { med.id = med.id || uid('med'); state.meds.push(med); save(); return med; },
    updateMed: function (id, patch) { const m = state.meds.find(x => x.id === id); if (m) { Object.assign(m, patch); save(); } return m; },
    removeMed: function (id) { state.meds = state.meds.filter(x => x.id !== id); save(); },
    moveMed: function (id, dir) {
      const i = state.meds.findIndex(x => x.id === id); if (i < 0) return;
      const j = i + dir; if (j < 0 || j >= state.meds.length) return;
      const t = state.meds[i]; state.meds[i] = state.meds[j]; state.meds[j] = t; save();
    },

    setStatus: function (dateKey, doseKey, val) {
      if (!state.log[dateKey]) state.log[dateKey] = {};
      if (val == null) delete state.log[dateKey][doseKey];
      else state.log[dateKey][doseKey] = val;
      if (state.log[dateKey] && Object.keys(state.log[dateKey]).length === 0) delete state.log[dateKey];
      save();
    },
    getStatus: function (dateKey, doseKey) { const d = state.log[dateKey]; return d ? d[doseKey] : undefined; },

    addReminder: function (r) { r.id = r.id || uid('rem'); state.reminders.push(r); save(); return r; },
    updateReminder: function (id, patch) { const r = state.reminders.find(x => x.id === id); if (r) { Object.assign(r, patch); save(); } },
    removeReminder: function (id) { state.reminders = state.reminders.filter(x => x.id !== id); save(); },

    exportJSON: function () { return JSON.stringify(S.get(), null, 2); },
    importJSON: function (text) {
      const obj = JSON.parse(text);
      state = migrate(obj);
      save();
      return true;
    },
    reset: function () { state = defaults(); save(); }
  };

  App.store = S;
})(window.App = window.App || {});
