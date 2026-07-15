/* icons.js — SVG-іконки як рядки. Форми ліків (дуотон) + UI (лінійні). */
(function (App) {
  const FORM = {
    tablet:
      '<circle cx="12" cy="12" r="8.25" fill="currentColor" fill-opacity=".16" stroke="none"/>' +
      '<circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
      '<path d="M6.3 12h11.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    capsule:
      '<g transform="rotate(-45 12 12)">' +
      '<rect x="3.25" y="8.5" width="17.5" height="7" rx="3.5" fill="currentColor" fill-opacity=".16" stroke="none"/>' +
      '<rect x="3.25" y="8.5" width="17.5" height="7" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
      '<path d="M12 8.5v7" stroke="currentColor" stroke-width="1.6"/></g>',
    drops:
      '<path d="M12 3.2s6.3 6.6 6.3 11.3a6.3 6.3 0 1 1-12.6 0C5.7 9.8 12 3.2 12 3.2Z" fill="currentColor" fill-opacity=".16" stroke="none"/>' +
      '<path d="M12 3.2s6.3 6.6 6.3 11.3a6.3 6.3 0 1 1-12.6 0C5.7 9.8 12 3.2 12 3.2Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    suppository:
      '<path d="M12 2.8c3.3 2.1 4.7 5.8 4.7 9.4S15.3 19.1 12 21.2c-3.3-2.1-4.7-5.8-4.7-9.4S8.7 4.9 12 2.8Z" fill="currentColor" fill-opacity=".16" stroke="none"/>' +
      '<path d="M12 2.8c3.3 2.1 4.7 5.8 4.7 9.4S15.3 19.1 12 21.2c-3.3-2.1-4.7-5.8-4.7-9.4S8.7 4.9 12 2.8Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    syrup:
      '<path d="M9 3.5h6v2.2l1.4 2.1c.4.6.6 1.3.6 2v9.7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9.7c0-.7.2-1.4.6-2L9 5.7V3.5Z" fill="currentColor" fill-opacity=".16" stroke="none"/>' +
      '<path d="M9 3.5h6v2.2l1.4 2.1c.4.6.6 1.3.6 2v9.7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9.7c0-.7.2-1.4.6-2L9 5.7V3.5Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M7.4 13.2h9.2" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 3.5h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    injection:
      '<g transform="rotate(-45 12 12)">' +
      '<rect x="7" y="9" width="8" height="6" rx="1.2" fill="currentColor" fill-opacity=".16" stroke="none"/>' +
      '<rect x="7" y="9" width="8" height="6" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
      '<path d="M7 8.2v7.6M7 12H3.8M15 12h5.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></g>',
    spray:
      '<path d="M9 21.5a1.8 1.8 0 0 1-1.8-1.8v-7.4a3 3 0 0 1 3-3h2.6a1.8 1.8 0 0 1 1.8 1.8v8.6a1.8 1.8 0 0 1-1.8 1.8H9Z" fill="currentColor" fill-opacity=".16" stroke="none"/>' +
      '<path d="M9 21.5a1.8 1.8 0 0 1-1.8-1.8v-7.4a3 3 0 0 1 3-3h2.6a1.8 1.8 0 0 1 1.8 1.8v8.6a1.8 1.8 0 0 1-1.8 1.8H9Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M12.8 9.3V6.4a1.5 1.5 0 0 0-1.5-1.5H9.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M6.4 4.9h1.3M4.7 7.2h1.3M5 2.6h1.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>'
  };

  const UI = {
    bell: '<path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1Z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 13a7.7 7.7 0 0 0 .1-1 7.7 7.7 0 0 0-.1-1l1.9-1.4-2-3.4-2.2 1a7.6 7.6 0 0 0-1.7-1L15 2h-4l-.4 2.2a7.6 7.6 0 0 0-1.7 1l-2.2-1-2 3.4L6.6 11a7.7 7.7 0 0 0 0 2l-1.9 1.4 2 3.4 2.2-1a7.6 7.6 0 0 0 1.7 1L11 22h4l.4-2.2a7.6 7.6 0 0 0 1.7-1l2.2 1 2-3.4Z"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12 5 5 9-11"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>',
    pencil: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    trash: '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/>',
    pause: '<path d="M10 4v16M14 4v16"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    up: '<path d="M6 15l6-6 6 6"/>',
    left: '<path d="M15 6l-6 6 6 6"/>',
    right: '<path d="M9 6l6 6-6 6"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    moon: '<path d="M18 12a6 6 0 0 1-9-5 6 6 0 1 0 8 8 6 6 0 0 1 1-3Z"/>',
    food: '<path d="M4 3v18M4 8h4M8 3v18M14 3c-1 3-1 6 0 9v9M14 12h6M20 3v18"/>',
    sunset: '<path d="M12 10V2M8 6l4 4 4-4M2 18h20M5 22h14M3 14h2M19 14h2"/>',
    calendar: '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    download: '<path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16"/>',
    upload: '<path d="M12 21V9m0 0-4 4m4-4 4 4M4 3h16"/>',
    image: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m3 16 5-4 4 3 3-2 6 4"/>',
    home: '<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
    doc: '<path d="M9 12h6M9 16h6M9 8h2M6 2h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z"/>'
  };

  App.icons = {
    FORMS: ['tablet', 'capsule', 'drops', 'suppository', 'syrup', 'injection', 'spray'],
    FORM_LABELS: {
      tablet: 'Таблетка', capsule: 'Капсула', drops: 'Краплі', suppository: 'Свічка',
      syrup: 'Сироп', injection: "Ін'єкція", spray: 'Спрей'
    },
    form: function (name, cls) {
      return '<svg viewBox="0 0 24 24" fill="none" class="' + (cls || 'ic') + '">' + (FORM[name] || FORM.tablet) + '</svg>';
    },
    ui: function (name, cls) {
      return '<svg viewBox="0 0 24 24" fill="none" class="' + (cls || 'ic') + '" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (UI[name] || '') + '</svg>';
    }
  };
})(window.App = window.App || {});
