/* views/reminders.js — важливі нагадування (ручні, з фото). */
(function (App) {
  const S = () => App.store, U = () => App.ui;
  let draft = null;

  function render(root) {
    let html = '<div class="wrap">' + App.pageTop('reminders');
    if (draft) {
      html += '<div class="panel"><h3 style="font-size:22px;font-weight:300;margin:0 0 18px">' + (draft.id ? 'Редагувати' : 'Нове') + ' <b>нагадування</b></h3>' +
        '<div class="field"><label>Заголовок</label><input class="input" id="rTitle" value="' + U().esc(draft.title) + '" placeholder="Напр. Здати аналізи"></div>' +
        '<div class="field"><label>Текст</label><textarea class="input" id="rBody" rows="4" placeholder="Деталі...">' + U().esc(draft.body) + '</textarea></div>' +
        '<div class="field"><label>Фото</label>' + photoBlock() + '</div>' +
        '<div class="btnrow" style="display:flex;gap:11px;margin-top:8px"><button class="btn lg" data-act="cancel">Скасувати</button><button class="btn primary lg" style="flex:1" data-act="save">Зберегти</button></div></div>';
    } else {
      html += '<div class="sec"><h4>Важливі нагадування</h4><span class="act" data-act="new">' + App.icons.ui('plus', 'ic sm') + 'Додати</span></div>';
      const rems = S().reminders();
      if (rems.length) html += '<div class="rem">' + rems.map(item).join('') + '</div>';
      else html += '<div class="rem"><div class="empty-day">Поки порожньо. Додай нотатки, рецепт лікаря чи фото упаковки.</div></div>';
    }
    html += '</div>';
    root.innerHTML = html;
    wire(root);
  }

  function item(r) {
    return '<details><summary><span class="ri">' + App.icons.ui('bookmark', 'ic sm') + '</span><span class="rt">' + U().esc(r.title) + (r.body ? '<small>' + U().esc(r.body).slice(0, 60) + '</small>' : '') + '</span><span class="chev">' + App.icons.ui('right', 'ic sm') + '</span></summary>' +
      '<div class="rbody">' + U().esc(r.body) + (r.photo ? '<img src="' + r.photo + '" alt="">' : '') +
      '<div class="rmActs"><button class="btn" data-edit="' + r.id + '">' + App.icons.ui('pencil', 'ic sm') + 'Редагувати</button><button class="btn danger" data-del="' + r.id + '">' + App.icons.ui('trash', 'ic sm') + 'Видалити</button></div></div></details>';
  }
  function photoBlock() {
    if (draft.photo) return '<div class="photo-filled"><div class="thumb"><img src="' + draft.photo + '" alt=""></div><div class="pf-actions"><button class="btn" data-act="photoPick">' + App.icons.ui('pencil', 'ic sm') + 'Замінити</button><button class="btn danger" data-act="photoDel">' + App.icons.ui('trash', 'ic sm') + 'Видалити</button></div></div>';
    return '<div class="photo-filled"><div class="thumb">' + App.icons.ui('image', 'ic') + '</div><div class="pf-actions"><button class="btn" data-act="photoPick">' + App.icons.ui('plus', 'ic sm') + 'Додати фото</button></div></div>';
  }

  function wire(root) {
    if (draft) {
      root.querySelector('#rTitle').addEventListener('input', e => draft.title = e.target.value);
      root.querySelector('#rBody').addEventListener('input', e => draft.body = e.target.value);
    }
    root.addEventListener('click', e => {
      const t = e.target.closest('[data-act],[data-edit],[data-del]'); if (!t) return;
      if (t.hasAttribute('data-edit')) { const r = S().reminders().find(x => x.id === t.getAttribute('data-edit')); draft = Object.assign({}, r); return render(root); }
      if (t.hasAttribute('data-del')) { S().removeReminder(t.getAttribute('data-del')); return render(root); }
      const a = t.getAttribute('data-act');
      if (a === 'new') { draft = { id: null, title: '', body: '', photo: null }; return render(root); }
      if (a === 'cancel') { draft = null; return render(root); }
      if (a === 'save') { if (!draft.title.trim()) return U().toast('Вкажи заголовок'); if (draft.id) S().updateReminder(draft.id, draft); else S().addReminder(draft); draft = null; U().toast('Збережено'); return render(root); }
      if (a === 'photoDel') { draft.photo = null; return render(root); }
      if (a === 'photoPick') {
        const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
        inp.onchange = () => { const f = inp.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { draft.photo = rd.result; render(root); }; rd.readAsDataURL(f); };
        inp.click();
      }
    });
  }

  App.views = App.views || {};
  App.views.reminders = { render: render, reset: function () { draft = null; } };
})(window.App = window.App || {});
