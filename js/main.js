/* main.js — ініціалізація, роутинг, тема, PWA. */
(function (App) {
  App.state = { route: 'today', viewDate: null, onbStep: 0, editMedId: null, firstRun: false, expandMed: null, statRange: 'course', statMed: null };
  let lastRoute = null;

  const ROUTES = ['today', 'stats', 'reminders', 'settings', 'add', 'onboarding'];
  function currentRoute() { const h = (location.hash || '#today').slice(1); return ROUTES.indexOf(h) >= 0 ? h : 'today'; }
  App.go = function (route) { if (currentRoute() === route) App.render(); else location.hash = '#' + route; };

  App.pageTop = function (active) {
    const tabs = [['today', 'Сьогодні'], ['stats', 'Статистика'], ['reminders', 'Нагадування'], ['settings', 'Налаштування']];
    return '<div class="topbar"><div class="brand"><span class="dot"></span>пілюлі</div>' +
      '<div class="tabs">' + tabs.map(t => '<button class="' + (t[0] === active ? 'on' : '') + '" data-nav="' + t[0] + '">' + t[1] + '</button>').join('') + '</div></div>';
  };

  App.render = function () {
    const host = document.getElementById('app');
    let route = currentRoute();
    const prof = App.store.profile();
    if (!prof.onboarded && route !== 'onboarding' && route !== 'add') route = 'onboarding';
    if (route === 'onboarding' && lastRoute !== 'onboarding') App.state.onbStep = App.state.onbStep || 0;
    App.state.route = route;

    // свіжий контейнер щоразу — жодних накопичених слухачів
    const root = document.createElement('div');
    host.innerHTML = ''; host.appendChild(root);

    const view = ({ onboarding: App.views.onboarding, add: App.views.addMed, stats: App.views.stats, reminders: App.views.reminders, settings: App.views.settings, today: App.views.today })[route];
    view.render(root);
    renderTabbar(route);

    if (route !== lastRoute) window.scrollTo(0, 0);
    lastRoute = route;
  };

  function renderTabbar(route) {
    const tb = document.getElementById('tabbar'); if (!tb) return;
    const show = ['today', 'stats', 'reminders', 'settings'].indexOf(route) >= 0;
    tb.classList.toggle('hidden', !show);
    if (!show) { tb.innerHTML = ''; return; }
    const items = [['today', 'home', 'Сьогодні'], ['stats', 'chart', 'Статистика'], ['reminders', 'bookmark', 'Нагадування'], ['settings', 'gear', 'Ще']];
    tb.innerHTML = items.map(i => '<button class="' + (i[0] === route ? 'on' : '') + '" data-nav="' + i[0] + '">' + App.icons.ui(i[1], 'ic') + i[2] + '</button>').join('');
  }

  function init() {
    App.store.load();
    if (!App.state.viewDate) App.state.viewDate = App.schedule.todayKey();

    document.addEventListener('click', function (e) {
      const n = e.target.closest('[data-nav]'); if (n) { e.preventDefault(); App.go(n.getAttribute('data-nav')); }
    });
    window.addEventListener('hashchange', function () {
      const r = currentRoute();
      if (r !== 'add' && App.views.addMed && App.views.addMed.reset) App.views.addMed.reset();
      if (r !== 'reminders' && App.views.reminders && App.views.reminders.reset) App.views.reminders.reset();
      App.render();
    });

    App.render();

    // Офлайн-режим. Service worker працює за стратегією network-first:
    // онлайн — завжди свіжа версія, офлайн — збережена копія.
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () {});
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(window.App = window.App || {});
