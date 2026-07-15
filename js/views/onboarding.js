/* views/onboarding.js — привітання, ім'я, старт, режим дня. */
(function (App) {
  const S = () => App.store, U = () => App.ui;
  const MEALS = [['breakfast', '🍳', 'Сніданок'], ['lunch', '🥗', 'Обід'], ['dinner', '🍽️', 'Вечеря']];

  function nav(step, withBack, total) {
    let dots = '';
    for (let i = 0; i < (total || 3); i++) dots += '<i class="' + (i === step ? 'on' : '') + '"></i>';
    return '<div class="step-nav">' +
      (withBack ? '<button class="back" data-act="back">Назад</button>' : '<span></span>') +
      '<div class="dots">' + dots + '</div>' +
      '<button class="xclose" title="Пропустити — увійти без ліків" data-act="skip">' + App.icons.ui('close', 'ic sm') + '</button></div>';
  }

  function render(root) {
    const prof = S().profile();
    const step = App.state.onbStep || 0;
    let mid = '';
    if (step === 0) {
      mid = '<div class="mid"><div class="cap">' + App.icons.ui('check') + '</div>' +
        '<h3>Привіт! Як тебе <b>звати?</b></h3><p>Додаток звертатиметься на ім\'я.</p>' +
        '<input class="nameinput" id="obName" placeholder="Ім\'я" value="' + U().esc(prof.name) + '"></div>' +
        '<button class="btn primary lg block go" data-act="next">Далі</button>';
    } else if (step === 1) {
      mid = '<div class="mid"><div class="cap">' + App.icons.ui('calendar') + '</div>' +
        '<h3>Коли <b>старт курсу?</b></h3><p>Від цієї дати рахуємо дні лікування.</p>' +
        '<div class="bigdate">' + App.icons.ui('calendar', 'ic') + '<input type="date" id="obStart" value="' + prof.treatmentStart + '"></div></div>' +
        '<button class="btn primary lg block go" data-act="next">Далі</button>';
    } else {
      let meals = '<div class="meal"><span class="mi">' + App.icons.ui('sun', 'ic sm') + '</span><span class="ml">Прокидаюсь</span><input type="time" data-day="wake" value="' + prof.day.wake + '"></div>';
      MEALS.forEach(m => {
        const on = prof.mealsEnabled[m[0]] !== false;
        meals += '<div class="meal ' + (on ? '' : 'off') + '"><span class="mi">' + m[1] + '</span><span class="ml">' + m[2] + '</span>' +
          (on ? '<input type="time" data-meal="' + m[0] + '" value="' + prof.day.meals[m[0]] + '">' : '<span class="chip grey">вимк.</span>') +
          '<button class="toggle ' + (on ? '' : 'off') + '" data-toggle-meal="' + m[0] + '"></button></div>';
      });
      meals += '<div class="meal"><span class="mi">' + App.icons.ui('moon', 'ic sm') + '</span><span class="ml">Сон</span><input type="time" data-day="sleep" value="' + prof.day.sleep + '"></div>';
      mid = '<div class="mid top"><div class="cap">' + App.icons.ui('sun') + '</div>' +
        '<h3>Твій <b>режим дня</b></h3><p>Тапни час, щоб змінити. Ліки прив\'яжемо до цих подій.</p>' +
        '<div class="meal-list">' + meals + '</div></div>' +
        '<button class="btn primary lg block go" data-act="addmed">Додати ліки</button>';
    }
    root.innerHTML = '<div class="onb">' + nav(step, step > 0) + mid + '</div>';
    wire(root);
  }

  function wire(root) {
    const name = root.querySelector('#obName');
    if (name) name.addEventListener('input', e => S().setProfile({ name: e.target.value }));
    const start = root.querySelector('#obStart');
    if (start) start.addEventListener('change', e => S().setProfile({ treatmentStart: e.target.value }));
    root.querySelectorAll('input[data-day]').forEach(i => i.addEventListener('change', e => S().setDay({ [e.target.getAttribute('data-day')]: e.target.value })));
    root.querySelectorAll('input[data-meal]').forEach(i => i.addEventListener('change', e => {
      const m = e.target.getAttribute('data-meal'); const meals = Object.assign({}, S().profile().day.meals); meals[m] = e.target.value; S().setDay({ meals: meals });
    }));
    root.querySelectorAll('[data-toggle-meal]').forEach(b => b.addEventListener('click', () => {
      const m = b.getAttribute('data-toggle-meal'); const en = Object.assign({}, S().profile().mealsEnabled); en[m] = en[m] === false; S().setProfile({ mealsEnabled: en }); App.render();
    }));
    root.addEventListener('click', e => {
      const t = e.target.closest('[data-act]'); if (!t) return;
      const a = t.getAttribute('data-act');
      if (a === 'next') { App.state.onbStep = (App.state.onbStep || 0) + 1; App.render(); }
      else if (a === 'back') { App.state.onbStep = Math.max(0, (App.state.onbStep || 0) - 1); App.render(); }
      else if (a === 'skip') { S().setProfile({ onboarded: true }); App.go('today'); }
      else if (a === 'addmed') { S().setProfile({ onboarded: true }); App.state.firstRun = true; App.go('add'); }
    });
  }

  App.views = App.views || {};
  App.views.onboarding = { render: render };
})(window.App = window.App || {});
