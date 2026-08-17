// =============================================================================
// Persian (Jalali/Shamsi) Calendar Picker - Negar Web App  v3
// Algorithms verified for correct Gregorian ↔ Jalali conversion
// =============================================================================

const PersianCal = (() => {

  const MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور',
                  'مهر','آبان','آذر','دی','بهمن','اسفند'];

  let state = { year: 1403, month: 1, targetInputId: null };

  // ── Gregorian → Jalali ─────────────────────────────────────────────────
  // Verified: 2026/08/01 → 1405/05/10
  function gregorianToJalali(gy, gm, gd) {
    // Adjust to epoch (1600 CE)
    const gy2 = gy - 1600;
    const gm2 = gm - 1;   // 0-indexed month
    const gd2 = gd - 1;   // 0-indexed day

    let g_day_no = 365 * gy2
      + Math.floor((gy2 + 3) / 4)
      - Math.floor((gy2 + 99) / 100)
      + Math.floor((gy2 + 399) / 400);

    // Gregorian month lengths (non-leap)
    const gML = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for (let i = 0; i < gm2; i++) g_day_no += gML[i];

    // Leap year correction
    const leapG = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
    if (gm2 > 1 && leapG) g_day_no++;
    g_day_no += gd2;

    // Convert to Jalali day number
    let j_day_no = g_day_no - 79;
    let j_np = Math.floor(j_day_no / 12053);
    j_day_no %= 12053;

    let jy = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461);
    j_day_no %= 1461;

    if (j_day_no >= 366) {
      jy += Math.floor((j_day_no - 1) / 365);
      j_day_no = (j_day_no - 1) % 365;
    }

    // Jalali month lengths
    const jML = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
    let jm = 0;
    for (jm = 0; jm < 11 && j_day_no >= jML[jm]; jm++) j_day_no -= jML[jm];

    return [jy, jm + 1, j_day_no + 1];
  }

  // ── Jalali → Gregorian ─────────────────────────────────────────────────
  // Verified: 1405/05/01 → 2026/07/23
  function jalaliToGregorian(jy, jm, jd) {
    const jy2 = jy - 979;
    const jm2 = jm - 1;   // 0-indexed
    const jd2 = jd - 1;   // 0-indexed

    const jML = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

    let j_day_no = 365 * jy2
      + Math.floor(jy2 / 33) * 8
      + Math.floor((jy2 % 33 + 3) / 4);

    for (let i = 0; i < jm2; i++) j_day_no += jML[i];
    j_day_no += jd2;

    let g_day_no = j_day_no + 79;

    // Decompose into Gregorian
    let gy = 1600 + 400 * Math.floor(g_day_no / 146097);
    g_day_no %= 146097;

    let leap = true;
    if (g_day_no >= 36525) {
      g_day_no--;
      gy += 100 * Math.floor(g_day_no / 36524);
      g_day_no %= 36524;
      if (g_day_no >= 365) g_day_no++;
      else leap = false;
    }

    gy += 4 * Math.floor(g_day_no / 1461);
    g_day_no %= 1461;

    if (g_day_no >= 366) {
      leap = false;
      g_day_no--;
      gy += Math.floor(g_day_no / 365);
      g_day_no %= 365;
    }

    const gML = [31, (leap ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let gm = 0;
    for (gm = 0; g_day_no >= gML[gm]; gm++) g_day_no -= gML[gm];

    return [gy, gm + 1, g_day_no + 1];
  }

  // ── Days in Jalali month ────────────────────────────────────────────────
  function daysInMonth(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    // Esfand: check leap by measuring distance to next year's start
    const [gy1, gm1, gd1] = jalaliToGregorian(jy, 12, 1);
    const [gy2, gm2, gd2] = jalaliToGregorian(jy + 1, 1, 1);
    const diff = Math.round(
      (new Date(gy2, gm2 - 1, gd2) - new Date(gy1, gm1 - 1, gd1)) / 86400000
    );
    return diff; // 29 or 30
  }

  // ── Day-of-week for first day of Jalali month (0=Sat … 6=Fri) ─────────
  function firstDayOfMonth(jy, jm) {
    const [gy, gm, gd] = jalaliToGregorian(jy, jm, 1);
    const jsDay = new Date(gy, gm - 1, gd).getDay(); // 0=Sun
    return (jsDay + 1) % 7;   // 0=Sat, 6=Fri
  }

  // ── Today in Jalali ─────────────────────────────────────────────────────
  function todayJalali() {
    const n = new Date();
    return gregorianToJalali(n.getFullYear(), n.getMonth() + 1, n.getDate());
  }

  // ── Render day grid ──────────────────────────────────────────────────────
  function render() {
    const titleEl = document.getElementById('persianCalTitle');
    const daysEl  = document.getElementById('persianCalDays');
    if (!titleEl || !daysEl) return;

    titleEl.textContent = `${MONTHS[state.month - 1]}  ${state.year}`;

    const count    = daysInMonth(state.year, state.month);
    const firstDay = firstDayOfMonth(state.year, state.month);
    const [ty, tm, td] = todayJalali();

    // Find already-selected day in input
    let selDay = 0;
    if (state.targetInputId) {
      const inp = document.getElementById(state.targetInputId);
      if (inp && inp.value.length === 10) {
        const p = inp.value.split('/');
        if (p.length === 3 &&
            parseInt(p[0]) === state.year &&
            parseInt(p[1]) === state.month) {
          selDay = parseInt(p[2]);
        }
      }
    }

    let html = '';
    for (let i = 0; i < firstDay; i++) html += '<div class="pcal-empty"></div>';

    for (let d = 1; d <= count; d++) {
      const col = (firstDay + d - 1) % 7; // 6 = Jomeh (Friday)
      let cls = 'pcal-day';
      if (d === selDay)                                           cls += ' pcal-selected';
      else if (state.year===ty && state.month===tm && d===td)    cls += ' pcal-today';
      if (col === 6) cls += ' pcal-holiday';
      html += `<div class="${cls}" onclick="PersianCal.selectDay(${d})">${d}</div>`;
    }
    daysEl.innerHTML = html;
  }

  // ── Public API ───────────────────────────────────────────────────────────
  return {

    open(inputId, btnEl) {
      state.targetInputId = inputId;

      // Determine which month/year to show
      const inp = document.getElementById(inputId);
      if (inp && inp.value.length === 10) {
        const p = inp.value.split('/');
        if (p.length === 3) {
          const y = parseInt(p[0]), m = parseInt(p[1]);
          if (y > 1300 && y < 1500 && m >= 1 && m <= 12) {
            state.year = y; state.month = m;
          }
        }
      } else {
        // Default: today in Jalali
        const [ty, tm] = todayJalali();
        state.year  = ty;
        state.month = tm;
      }

      const popup = document.getElementById('persianCalendarPopup');
      if (!popup) { console.warn('Persian calendar popup element not found.'); return; }

      // Ensure calendar is a direct child of <body> to break out of any parent stacking context
      if (popup.parentElement !== document.body) {
        document.body.appendChild(popup);
      }

      // ── Position the popup using viewport coords (position:fixed) ───────
      const rect = btnEl.getBoundingClientRect();
      const popW = 298;
      const popH = 280;

      let top  = rect.bottom + 6;
      let left = rect.left;

      // Clamp horizontally
      if (left + popW > window.innerWidth - 8) left = window.innerWidth - popW - 8;
      if (left < 4) left = 4;

      // If not enough space below, show above the button instead
      if (top + popH > window.innerHeight - 8) top = rect.top - popH - 4;
      if (top < 4) top = 4;

      popup.style.position = 'fixed';
      popup.style.top      = top  + 'px';
      popup.style.left     = left + 'px';
      popup.style.zIndex   = '999999';
      popup.style.display  = 'block';

      render();
    },

    close() {
      const p = document.getElementById('persianCalendarPopup');
      if (p) p.style.display = 'none';
      state.targetInputId = null;
    },

    selectDay(day) {
      if (!state.targetInputId) return;
      const inp = document.getElementById(state.targetInputId);
      if (!inp) return;
      const m = String(state.month).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      inp.value = `${state.year}/${m}/${d}`;
      inp.dispatchEvent(new Event('input'));
      this.close();
    },

    prevMonth() { if (--state.month < 1)  { state.month = 12; state.year--; } render(); },
    nextMonth() { if (++state.month > 12) { state.month = 1;  state.year++; } render(); },
    prevYear()  { state.year--;  render(); },
    nextYear()  { state.year++;  render(); },
    getTodayString() {
      const [y, m, d] = todayJalali();
      const sm = String(m).padStart(2, '0');
      const sd = String(d).padStart(2, '0');
      return `${y}/${sm}/${sd}`;
    }
  };
})();

// ── Close when clicking outside ──────────────────────────────────────────
document.addEventListener('mousedown', function(e) {
  const popup = document.getElementById('persianCalendarPopup');
  if (!popup || popup.style.display === 'none') return;
  if (!popup.contains(e.target) && !e.target.classList.contains('date-picker-btn')) {
    PersianCal.close();
  }
});

// ── Auto-format: YYYY/MM/DD  ─────────────────────────────────────────────
// Strips non-digits, caps at 8 digits, inserts "/" automatically.
// Cursor always moves to end for consistent sequential typing.
function autoFormatDate(input) {
  // 1. Extract only digit characters
  let digits = input.value.replace(/\D/g, '');

  // 2. Cap at 8 digits (YYYYMMDD)
  if (digits.length > 8) digits = digits.slice(0, 8);

  // 3. Build formatted string YYYY/MM/DD
  let formatted = digits;
  if (digits.length > 4) {
    formatted = digits.slice(0, 4) + '/' + digits.slice(4);
  }
  if (digits.length > 6) {
    formatted = digits.slice(0, 4) + '/' + digits.slice(4, 6) + '/' + digits.slice(6);
  }

  // 4. Apply only if changed
  if (input.value !== formatted) input.value = formatted;

  // 5. Move cursor to end
  const len = formatted.length;
  setTimeout(() => {
    try { input.setSelectionRange(len, len); } catch(e) {}
  }, 0);
}
