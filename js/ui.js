/* ui.js — дрібні хелпери: DOM, дати українською, тайли, тост. */
(function (App) {
  const WD = ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', "п'ятниця", 'субота'];
  const WDS = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const MON = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
  const MONS = ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'гру'];

  function el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }
  function dateFull(key) { const d = App.schedule.fromKey(key); return cap(WD[d.getDay()]) + ', ' + d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear(); }
  function dateShort(key) { const d = App.schedule.fromKey(key); return d.getDate() + ' ' + MONS[d.getMonth()]; }
  function dateDot(key) { const d = App.schedule.fromKey(key); return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear(); }
  function hexToRgba(hex, a) {
    hex = (hex || '#3a86e0').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function tile(form, color, size) {
    size = size || 34;
    return '<span class="si" style="width:' + size + 'px;height:' + size + 'px;color:' + color + ';background:' + hexToRgba(color, 0.14) + '">' + App.icons.form(form) + '</span>';
  }
  let toastTimer = null;
  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) { t = el('<div id="toast" class="toast"></div>'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function plural(n, forms) { // forms: [one, few, many]
    const n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return forms[0];
    if (n10 >= 2 && n10 <= 4 && !(n100 >= 12 && n100 <= 14)) return forms[1];
    return forms[2];
  }

  App.ui = { el, cap, dateFull, dateShort, dateDot, hexToRgba, tile, toast, esc, plural, WD, WDS, MON, MONS };
})(window.App = window.App || {});
