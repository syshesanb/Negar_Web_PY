// =============================================================================
// Negar Web App - Core Controller
// Architecture: Each tile button shows its own form; Back button returns to tiles
// =============================================================================

// ======================================================
// Eshkal Logger & Diagnostics System (دیباگر اختصاصی eshkal.txt)
// ======================================================
const EshkalLogger = {
  logs: [],
  startTime: Date.now(),

  clear() {
    this.logs = [];
    this.startTime = Date.now();
    try {
      localStorage.removeItem('negar_eshkal_txt');
    } catch(e) {}
  },

  log(eventTitle, details = {}) {
    const elapsed = Date.now() - this.startTime;
    const timestamp = new Date().toLocaleTimeString('fa-IR') + ` (+${elapsed}ms)`;

    let snapshot = {};
    try {
      const getDim = (idOrSel) => {
        const el = typeof idOrSel === 'string' ? (document.getElementById(idOrSel) || document.querySelector(idOrSel)) : idOrSel;
        if (!el) return 'NOT_FOUND';
        const cs = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          display: cs.display,
          width: cs.width,
          height: cs.height,
          minWidth: cs.minWidth,
          minHeight: cs.minHeight,
          maxWidth: cs.maxWidth,
          maxHeight: cs.maxHeight,
          flexDirection: cs.flexDirection,
          flex: cs.flex,
          offsetWidth: el.offsetWidth,
          offsetHeight: el.offsetHeight,
          clientWidth: el.clientWidth,
          clientHeight: el.clientHeight,
          scrollWidth: el.scrollWidth,
          scrollHeight: el.scrollHeight,
          rectWidth: Math.round(rect.width),
          rectHeight: Math.round(rect.height),
          rectTop: Math.round(rect.top),
          rectLeft: Math.round(rect.left),
          overflowX: cs.overflowX,
          overflowY: cs.overflowY,
          visibility: cs.visibility
        };
      };

      snapshot = {
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        bodyClasses: document.body.className,
        mainApp: getDim('mainApp'),
        appLayoutWrapper: getDim('.app-layout-wrapper'),
        appSidebar: getDim('appSidebar'),
        appSidebarClasses: document.getElementById('appSidebar')?.className || '',
        appContainer: getDim('.app-container'),
        mainContent: getDim('mainContent'),
        formsArea: getDim('formsArea'),
        formHesabdariMain: getDim('form-hesabdari-main'),
        hesabdariSubtabsBar: getDim('.hesabdari-subtabs-bar'),
        tabPanelAccounts: getDim('tab-panel-accounts'),
        formCard: getDim('.card.form-card'),
        tableWrapper: getDim('.table-wrapper'),
        accountsTable: getDim('#tab-panel-accounts table'),
        watermark: getDim('negarMainWatermark')
      };
    } catch(e) {
      snapshot = { error: e.message };
    }

    const logEntry = {
      index: this.logs.length + 1,
      timestamp,
      elapsedMs: elapsed,
      event: eventTitle,
      details,
      snapshot
    };

    this.logs.push(logEntry);
    this.saveToStorage();
  },

  formatAsText() {
    let txt = `======================================================\n`;
    txt += `  گزارش جامع دیباگ عرض و ارتفاع سیستم نگار (eshkal.txt)\n`;
    txt += `  تاریخ و زمان ایجاد: ${new Date().toLocaleString('fa-IR')}\n`;
    txt += `  آدرس URL جاری: ${window.location.href}\n`;
    txt += `======================================================\n\n`;

    this.logs.forEach(entry => {
      txt += `------------------------------------------------------\n`;
      txt += `[رویداد ${entry.index}] زمان: ${entry.timestamp} | رویداد: ${entry.event}\n`;
      if (Object.keys(entry.details).length > 0) {
        txt += `جزئیات: ${JSON.stringify(entry.details)}\n`;
      }
      txt += `ابعاد، عرض، ارتفاع و موقعیت عناصر:\n`;
      const s = entry.snapshot;
      if (s) {
        txt += `  • پنجره مرورگر: عرض=${s.windowWidth}px | ارتفاع=${s.windowHeight}px\n`;
        txt += `  • کلاس‌های body: "${s.bodyClasses}"\n`;
        txt += `  • کلاس‌های sidebar: "${s.appSidebarClasses}"\n`;
        txt += `  • mainApp: ${JSON.stringify(s.mainApp)}\n`;
        txt += `  • appLayoutWrapper: ${JSON.stringify(s.appLayoutWrapper)}\n`;
        txt += `  • appContainer: ${JSON.stringify(s.appContainer)}\n`;
        txt += `  • mainContent: ${JSON.stringify(s.mainContent)}\n`;
        txt += `  • formsArea: ${JSON.stringify(s.formsArea)}\n`;
        txt += `  • formHesabdariMain: ${JSON.stringify(s.formHesabdariMain)}\n`;
        txt += `  • hesabdariSubtabsBar: ${JSON.stringify(s.hesabdariSubtabsBar)}\n`;
        txt += `  • tabPanelAccounts: ${JSON.stringify(s.tabPanelAccounts)}\n`;
        txt += `  • formCard: ${JSON.stringify(s.formCard)}\n`;
        txt += `  • tableWrapper: ${JSON.stringify(s.tableWrapper)}\n`;
        txt += `  • accountsTable: ${JSON.stringify(s.accountsTable)}\n`;
        txt += `  • watermark: ${JSON.stringify(s.watermark)}\n`;
      }
      txt += `\n`;
    });

    return txt;
  },

  saveToStorage() {
    const text = this.formatAsText();
    try {
      localStorage.setItem('negar_eshkal_txt', text);
    } catch(e) {}

    // Auto-send log to local background server to automatically overwrite C:\Negar_Web_C\eshkal.txt
    try {
      fetch('http://127.0.0.1:9999/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: text
      }).catch(() => {});
    } catch(e) {}
  },

  downloadFile() {
    const text = this.formatAsText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'eshkal.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};


// ============================
// AUTHENTICATION - Credentials
// ============================
const CREDENTIALS = [
  { username: 'admin',        password: 'admin123',    fullName: 'ابر مدیر سیستم',         role: 'SuperAdmin' },
  { username: 'accountant1',  password: 'acc2024',     fullName: 'علی رضایی (حسابدار)',     role: 'User' },
  { username: 'storekeeper',  password: 'store2024',   fullName: 'رضا حسینی (انباردار)',    role: 'User' }
];

let currentUser = null;  // will be set after successful login

function doLogin() {
  const usernameEl = document.getElementById('loginUsername');
  const passwordEl = document.getElementById('loginPassword');
  const errorEl   = document.getElementById('loginError');
  const btnText   = document.getElementById('loginBtnText');
  const btnSpinner= document.getElementById('loginBtnSpinner');
  const loginBtn  = document.getElementById('loginBtn');

  const username = usernameEl?.value?.trim();
  const password = passwordEl?.value;

  // Basic empty check
  if (!username) {
    usernameEl?.focus();
    showLoginError('لطفاً نام کاربری را وارد کنید.');
    return;
  }
  if (!password) {
    passwordEl?.focus();
    showLoginError('لطفاً رمز عبور را وارد کنید.');
    return;
  }

  // Show loading state
  if (btnText)   btnText.style.display = 'none';
  if (btnSpinner) btnSpinner.style.display = 'inline';
  if (loginBtn)  loginBtn.disabled = true;

  // Simulate a short delay (like a real server call)
  setTimeout(() => {
    const found = CREDENTIALS.find(
      c => c.username === username && c.password === password
    );

    if (found) {
      // ✅ Success
      currentUser = found;
      try {
        localStorage.setItem('negar_logged_in', 'true');
      } catch(e) {}
      if (errorEl) errorEl.style.display = 'none';

      // Update header info
      const headerUser = document.getElementById('headerUsername');
      if (headerUser) headerUser.textContent = found.fullName + ' (' + found.username + ')';

      // Animate out login, animate in app
      const overlay  = document.getElementById('loginOverlay');
      const mainApp  = document.getElementById('mainApp');

      overlay.classList.add('login-fade-out');
      setTimeout(() => {
        overlay.style.display = 'none';
        mainApp.style.display = 'flex';
        mainApp.style.flexDirection = 'column';
        mainApp.style.width = '100%';
        mainApp.classList.add('app-fade-in');

        // Update header info (Username/Role)
        updateHeaderBar();

        // Show "Switch Company / Fiscal Year" form so user explicitly selects company and year
        showForm('form-switch-company');
      }, 400);

    } else {
      // ❌ Wrong credentials
      showLoginError('نام کاربری یا رمز عبور اشتباه است. لطفاً دوباره تلاش کنید.');
      if (passwordEl) { passwordEl.value = ''; passwordEl.focus(); }
      // Reset button
      if (btnText)    btnText.style.display = 'inline';
      if (btnSpinner) btnSpinner.style.display = 'none';
      if (loginBtn)   loginBtn.disabled = false;
    }
  }, 700);
}

function showLoginError(msg) {
  const el = document.getElementById('loginError');
  if (!el) return;
  el.textContent = '❌ ' + msg;
  el.style.display = 'block';
  // Re-trigger shake animation
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = 'shake 0.4s ease';
}

function togglePasswordVisibility() {
  const input = document.getElementById('loginPassword');
  const btn   = document.querySelector('.login-eye-btn');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.textContent = '🙈';
  } else {
    input.type = 'password';
    if (btn) btn.textContent = '👁';
  }
  try { input.focus(); } catch(e) {}
}

function logout() {
  currentUser = null;
  // Clear fields
  const u = document.getElementById('loginUsername');
  const p = document.getElementById('loginPassword');
  if (u) u.value = '';
  if (p) { p.value = ''; p.type = 'password'; }
  const btn = document.querySelector('.login-eye-btn');
  if (btn) btn.textContent = '👁';
  // Hide error
  const err = document.getElementById('loginError');
  if (err) err.style.display = 'none';
  // Reset button state
  const btnText    = document.getElementById('loginBtnText');
  const btnSpinner = document.getElementById('loginBtnSpinner');
  const loginBtn   = document.getElementById('loginBtn');
  if (btnText)    { btnText.style.display = 'inline'; }
  if (btnSpinner) { btnSpinner.style.display = 'none'; }
  if (loginBtn)   { loginBtn.disabled = false; }

  // Show login, hide app
  const overlay = document.getElementById('loginOverlay');
  const mainApp = document.getElementById('mainApp');
  if (mainApp)  { mainApp.style.display = 'none'; mainApp.classList.remove('app-fade-in'); }
  if (overlay)  { overlay.style.display = 'flex'; overlay.classList.remove('login-fade-out'); }
  // Focus username field
  setTimeout(() => { if (u) u.focus(); }, 100);
}

let dbAccounts = [];
let pristineAccountsTemplate = [];
const expandedAccountIds = new Set();

function initializeCompanyAccounts(newCompanyCode) {
  // Always clone from the pristine, unmodified template
  const idMap = {};
  let counter = Date.now();
  
  const copies = pristineAccountsTemplate.map(a => {
    const newId = ++counter;
    idMap[a.id] = newId;
    return {
      ...a,
      id: newId,
      companyCode: newCompanyCode
    };
  });
  
  copies.forEach(copy => {
    if (copy.parentId !== null && copy.parentId !== undefined) {
      copy.parentId = idMap[copy.parentId] || null;
    }
  });
  
  dbAccounts.push(...copies);
}

function switchActiveCompany(newCompany) {
  if (!newCompany) return;
  
  // Save current accounts first
  if (SessionState.company) {
    const oldCode = SessionState.company.code;
    dbAccounts = dbAccounts.filter(a => a.companyCode !== oldCode && (a.companyCode || oldCode !== '1001'));
    AppState.accounts.forEach(a => {
      a.companyCode = oldCode;
    });
    dbAccounts.push(...AppState.accounts);
  }
  
  SessionState.company = newCompany;
  
  const newCode = newCompany.code;
  AppState.accounts = dbAccounts.filter(a => a.companyCode === newCode || (!a.companyCode && newCode === '1001'));
  
  if (AppState.accounts.length === 0) {
    initializeCompanyAccounts(newCode);
    AppState.accounts = dbAccounts.filter(a => a.companyCode === newCode);
  }

  // Auto-expand all accounts so they are fully displayed by default
  AppState.accounts.forEach(a => {
    expandedAccountIds.add(a.id);
  });
}

// ---- App State ----

const AppState = {
  isTabMode: false,          // opened via direct tab routing (hides top nav bar)
  currentModule: 'system',   // active ribbon tab
  currentForm: null,          // null = tiles view, otherwise form id
  companies: [
    {
      id: 1,
      code: '1001',
      name: 'شرکت نمونه نگار',
      ecoCode: '411111111111',
      phone: '021-88888888',
      fax: '021-88888889',
      postalCode: '1234567890',
      email: 'info@negar-erp.ir',
      website: 'www.negar-erp.ir',
      address: 'تهران، خیابان ولیعصر، پلاک ۱۰۰',
      notes: 'شرکت اصلی و پیش‌فرض سیستم نگار',
      activeYear: '1403'
    }
  ],
  fiscalYears: [
    { id: 1, year: '1403', startDate: '1403/01/01', endDate: '1403/12/29', company: '1001', notes: 'سال مالی جاری شرکت نمونه نگار', status: 'فعال' },
    { id: 2, year: '1402', startDate: '1402/01/01', endDate: '1402/12/29', company: '1001', notes: 'سال مالی قبل', status: 'بسته' },
    { id: 3, year: '1401', startDate: '1401/01/01', endDate: '1401/12/29', company: '1001', notes: 'سال مالی ۱۴۰۱', status: 'بسته' },
    { id: 4, year: '1400', startDate: '1400/01/01', endDate: '1400/12/29', company: '1001', notes: 'سال مالی اولیه تاسیس', status: 'بسته' }
  ],
  users: [
    { id: 1, username: 'admin', fullName: 'مدیر ارشد سیستم', userType: 'SuperAdmin', isActive: true, ip: '127.0.0.1' },
    { id: 2, username: 'accountant1', fullName: 'علی رضایی (حسابدار)', userType: 'User', isActive: true, ip: '192.168.1.10' },
    { id: 3, username: 'storekeeper', fullName: 'رضا حسینی (انباردار)', userType: 'User', isActive: true, ip: '192.168.1.15' }
  ],
  accounts: [
    { id: 1, code: '11', name: 'دارائیهای جاری', type: 'گروه', nature: 'بدهکار', parentId: null },
    { id: 2, code: '12', name: 'دارائیهای غیرجاری', type: 'گروه', nature: 'بدهکار', parentId: null },
    { id: 3, code: '21', name: 'بدهیهای جاری', type: 'گروه', nature: 'بستانکار', parentId: null },
    { id: 4, code: '22', name: 'بدهیهای غیرجاری', type: 'گروه', nature: 'بستانکار', parentId: null },
    { id: 5, code: '31', name: 'حقوق صاحبان سهام', type: 'گروه', nature: 'بستانکار', parentId: null },
    { id: 6, code: '41', name: 'درآمدها', type: 'گروه', nature: 'بستانکار', parentId: null },
    { id: 7, code: '42', name: 'فروش', type: 'گروه', nature: 'بستانکار', parentId: null },
    { id: 8, code: '51', name: 'بهای تمام شده کالای فروش رفته', type: 'گروه', nature: 'بدهکار', parentId: null },
    { id: 9, code: '52', name: 'هزینه های عمومی و اداری', type: 'گروه', nature: 'بدهکار', parentId: null },
    { id: 10, code: '61', name: 'عملکرد و سود و زیان', type: 'گروه', nature: 'مشترک', parentId: null },
    { id: 11, code: '71', name: 'حسابهای انتظامی', type: 'گروه', nature: 'بدهکار', parentId: null },
    { id: 12, code: '1101', name: 'موجودی نقد و بانک', type: 'کل', nature: 'بدهکار', parentId: 1 },
    { id: 13, code: '1102', name: 'سرمایه‌گذاری‌های کوتاه مدت', type: 'کل', nature: 'بدهکار', parentId: 1 },
    { id: 14, code: '1103', name: 'حساب‌ها و اسناد دریافتنی تجاری', type: 'کل', nature: 'بدهکار', parentId: 1 },
    { id: 15, code: '1104', name: 'سایر حساب‌ها و اسناد دریافتنی', type: 'کل', nature: 'بدهکار', parentId: 1 },
    { id: 16, code: '1105', name: 'موجودی مواد و کالا', type: 'کل', nature: 'بدهکار', parentId: 1 },
    { id: 17, code: '1106', name: 'پیش‌پرداخت‌ها', type: 'کل', nature: 'بدهکار', parentId: 1 },
    { id: 18, code: '1201', name: 'دارایی‌های ثابت مشهود', type: 'کل', nature: 'بدهکار', parentId: 2 },
    { id: 19, code: '1202', name: 'استهلاک انباشته دارایی‌ها', type: 'کل', nature: 'بستانکار', parentId: 2 },
    { id: 20, code: '1203', name: 'دارایی‌های نامشهود', type: 'کل', nature: 'بدهکار', parentId: 2 },
    { id: 21, code: '2101', name: 'حساب‌ها و اسناد پرداختنی تجاری', type: 'کل', nature: 'بستانکار', parentId: 3 },
    { id: 22, code: '2102', name: 'سایر حساب‌ها و اسناد پرداختنی', type: 'کل', nature: 'بستانکار', parentId: 3 },
    { id: 23, code: '2103', name: 'پیش‌دریافت‌ها', type: 'کل', nature: 'بستانکار', parentId: 3 },
    { id: 24, code: '2104', name: 'ذخایر جاری', type: 'کل', nature: 'بستانکار', parentId: 3 },
    { id: 25, code: '2201', name: 'تسهیلات مالی بلندمدت', type: 'کل', nature: 'بستانکار', parentId: 4 },
    { id: 26, code: '2202', name: 'ذخیره مزایای پایان خدمت پرسنل', type: 'کل', nature: 'بستانکار', parentId: 4 },
    { id: 27, code: '3101', name: 'سرمایه', type: 'کل', nature: 'بستانکار', parentId: 5 },
    { id: 28, code: '3102', name: 'اندوخته‌ها', type: 'کل', nature: 'بستانکار', parentId: 5 },
    { id: 29, code: '3103', name: 'سود و زیان انباشته', type: 'کل', nature: 'مشترک', parentId: 5 },
    { id: 30, code: '3104', name: 'برداشت‌ها و تقسیم سود', type: 'کل', nature: 'بدهکار', parentId: 5 },
    { id: 31, code: '4101', name: 'درآمدهای غیرعملیاتی', type: 'کل', nature: 'بستانکار', parentId: 6 },
    { id: 32, code: '4201', name: 'فروش کالا و خدمات', type: 'کل', nature: 'بستانکار', parentId: 7 },
    { id: 33, code: '4202', name: 'برگشت از فروش و تخفیفات', type: 'کل', nature: 'بدهکار', parentId: 7 },
    { id: 34, code: '5101', name: 'بهای تمام شده کالای فروش رفته', type: 'کل', nature: 'بدهکار', parentId: 8 },
    { id: 35, code: '5102', name: 'خرید و ملزومات', type: 'کل', nature: 'بدهکار', parentId: 8 },
    { id: 36, code: '5103', name: 'هزینه‌های مستقیم حمل و نقل', type: 'کل', nature: 'بدهکار', parentId: 8 },
    { id: 37, code: '5201', name: 'هزینه‌های حقوق و دستمزد', type: 'کل', nature: 'بدهکار', parentId: 9 },
    { id: 38, code: '5202', name: 'هزینه‌های عمومی و اداری', type: 'کل', nature: 'بدهکار', parentId: 9 },
    { id: 39, code: '5203', name: 'هزینه‌های توزیع و فروش', type: 'کل', nature: 'بدهکار', parentId: 9 },
    { id: 40, code: '5204', name: 'هزینه‌های مالی', type: 'کل', nature: 'بدهکار', parentId: 9 },
    { id: 41, code: '5205', name: 'هزینه استهلاک', type: 'کل', nature: 'بدهکار', parentId: 9 },
    { id: 42, code: '6101', name: 'حساب خلاصه سود و زیان', type: 'کل', nature: 'مشترک', parentId: 10 },
    { id: 43, code: '6102', name: 'تعدیلات سنواتی', type: 'کل', nature: 'مشترک', parentId: 10 },
    { id: 44, code: '7101', name: 'حساب‌های انتظامی به نفع شرکت', type: 'کل', nature: 'بدهکار', parentId: 11 },
    { id: 45, code: '7102', name: 'حساب‌های انتظامی به عهده شرکت', type: 'کل', nature: 'بدهکار', parentId: 11 },
    { id: 46, code: '110101', name: 'صندوق‌ها', type: 'معین', nature: 'بدهکار', parentId: 12 },
    { id: 47, code: '110102', name: 'بانک‌ها', type: 'معین', nature: 'بدهکار', parentId: 12 },
    { id: 48, code: '110103', name: 'تنخواه‌گردان‌ها', type: 'معین', nature: 'بدهکار', parentId: 12 },
    { id: 49, code: '110201', name: 'سپرده‌های بانکی کوتاه مدت', type: 'معین', nature: 'بدهکار', parentId: 13 },
    { id: 50, code: '110202', name: 'سهام و اوراق بهادار کوتاه مدت', type: 'معین', nature: 'بدهکار', parentId: 13 },
    { id: 51, code: '110301', name: 'حساب‌های دریافتنی (مشتریان)', type: 'معین', nature: 'بدهکار', parentId: 14 },
    { id: 52, code: '110302', name: 'اسناد دریافتنی نزد صندوق', type: 'معین', nature: 'بدهکار', parentId: 14 },
    { id: 53, code: '110303', name: 'اسناد دریافتنی درجریان وصول', type: 'معین', nature: 'بدهکار', parentId: 14 },
    { id: 54, code: '110304', name: 'اسناد واخواست شده', type: 'معین', nature: 'بدهکار', parentId: 14 },
    { id: 55, code: '110401', name: 'مساعده حقوق و دستمزد', type: 'معین', nature: 'بدهکار', parentId: 15 },
    { id: 56, code: '110402', name: 'وام و مطالبات پرسنل', type: 'معین', nature: 'بدهکار', parentId: 15 },
    { id: 57, code: '110403', name: 'سپرده‌های دریافتنی (ودیعه)', type: 'معین', nature: 'بدهکار', parentId: 15 },
    { id: 58, code: '110501', name: 'موجودی کالا در انبار', type: 'معین', nature: 'بدهکار', parentId: 16 },
    { id: 59, code: '110502', name: 'موجودی مواد اولیه', type: 'معین', nature: 'بدهکار', parentId: 16 },
    { id: 60, code: '110503', name: 'موجودی قطعات و ملزومات', type: 'معین', nature: 'بدهکار', parentId: 16 },
    { id: 61, code: '110504', name: 'کالای درجریان ساخت', type: 'معین', nature: 'بدهکار', parentId: 16 },
    { id: 62, code: '110601', name: 'پیش‌پرداخت خرید کالا و خدمات', type: 'معین', nature: 'بدهکار', parentId: 17 },
    { id: 63, code: '110602', name: 'پیش‌پرداخت اجاره', type: 'معین', nature: 'بدهکار', parentId: 17 },
    { id: 64, code: '110603', name: 'پیش‌پرداخت بیمه', type: 'معین', nature: 'بدهکار', parentId: 17 },
    { id: 65, code: '110604', name: 'پیش‌پرداخت مالیات و عوارض', type: 'معین', nature: 'بدهکار', parentId: 17 },
    { id: 66, code: '120101', name: 'زمین', type: 'معین', nature: 'بدهکار', parentId: 18 },
    { id: 67, code: '120102', name: 'ساختمان و تاسیسات', type: 'معین', nature: 'بدهکار', parentId: 18 },
    { id: 68, code: '120103', name: 'ماشین‌آلات و تجهیزات', type: 'معین', nature: 'بدهکار', parentId: 18 },
    { id: 69, code: '120104', name: 'وسایط نقلیه', type: 'معین', nature: 'بدهکار', parentId: 18 },
    { id: 70, code: '120105', name: 'اثاثه و منصوبات', type: 'معین', nature: 'بدهکار', parentId: 18 },
    { id: 71, code: '120201', name: 'استهلاک انباشته ساختمان', type: 'معین', nature: 'بستانکار', parentId: 19 },
    { id: 72, code: '120202', name: 'استهلاک انباشته ماشین‌آلات', type: 'معین', nature: 'بستانکار', parentId: 19 },
    { id: 73, code: '120203', name: 'استهلاک انباشته وسایط نقلیه', type: 'معین', nature: 'بستانکار', parentId: 19 },
    { id: 74, code: '120204', name: 'استهلاک انباشته اثاثه', type: 'معین', nature: 'بستانکار', parentId: 19 },
    { id: 75, code: '120301', name: 'نرم‌افزارهای رایانه‌ای', type: 'معین', nature: 'بدهکار', parentId: 20 },
    { id: 76, code: '120302', name: 'حق‌الامتیاز و علائم تجاری', type: 'معین', nature: 'بدهکار', parentId: 20 },
    { id: 77, code: '210101', name: 'حساب‌های پرداختنی (تامین‌کنندگان)', type: 'معین', nature: 'بستانکار', parentId: 21 },
    { id: 78, code: '210102', name: 'اسناد پرداختنی عهده بانک‌ها', type: 'معین', nature: 'بستانکار', parentId: 21 },
    { id: 79, code: '210201', name: 'حقوق و دستمزد پرداختنی', type: 'معین', nature: 'بستانکار', parentId: 22 },
    { id: 80, code: '210202', name: 'بیمه پرداختنی (سازمان تامین اجتماعی)', type: 'معین', nature: 'بستانکار', parentId: 22 },
    { id: 81, code: '210203', name: 'مالیات تکلیفی و حقوق پرداختنی', type: 'معین', nature: 'بستانکار', parentId: 22 },
    { id: 82, code: '210204', name: 'مالیات بر ارزش افزوده پرداختنی', type: 'معین', nature: 'بستانکار', parentId: 22 },
    { id: 83, code: '210301', name: 'پیش‌دریافت از مشتریان', type: 'معین', nature: 'بستانکار', parentId: 23 },
    { id: 84, code: '210401', name: 'ذخیره مالیات بر درآمد', type: 'معین', nature: 'بستانکار', parentId: 24 },
    { id: 85, code: '220101', name: 'وام‌ها و تسهیلات بانکی بلندمدت', type: 'معین', nature: 'بستانکار', parentId: 25 },
    { id: 86, code: '220201', name: 'ذخیره بازخرید سنوات خدمت', type: 'معین', nature: 'بستانکار', parentId: 26 },
    { id: 87, code: '310101', name: 'سرمایه ثبت شده', type: 'معین', nature: 'بستانکار', parentId: 27 },
    { id: 88, code: '310201', name: 'اندوخته قانونی', type: 'معین', nature: 'بستانکار', parentId: 28 },
    { id: 89, code: '310202', name: 'اندوخته عمومی و احتیاطی', type: 'معین', nature: 'بستانکار', parentId: 28 },
    { id: 90, code: '310301', name: 'سود (زیان) انباشته', type: 'معین', nature: 'مشترک', parentId: 29 },
    { id: 91, code: '310401', name: 'سود پیشنهادی و مصوب', type: 'معین', nature: 'بدهکار', parentId: 30 },
    { id: 92, code: '410101', name: 'درآمد حاصل از سود سپرده‌های بانکی', type: 'معین', nature: 'بستانکار', parentId: 31 },
    { id: 93, code: '410102', name: 'سود (زیان) حاصل از فروش دارایی‌ها', type: 'معین', nature: 'بستانکار', parentId: 31 },
    { id: 94, code: '410103', name: 'سایر درآمدهای متفرقه', type: 'معین', nature: 'بستانکار', parentId: 31 },
    { id: 95, code: '420101', name: 'فروش ناخالص کالا', type: 'معین', nature: 'بستانکار', parentId: 32 },
    { id: 96, code: '420102', name: 'درآمد حاصل از ارائه خدمات', type: 'معین', nature: 'بستانکار', parentId: 32 },
    { id: 97, code: '420201', name: 'برگشت از فروش و کاهش قیمت', type: 'معین', nature: 'بدهکار', parentId: 33 },
    { id: 98, code: '420202', name: 'تخفیفات نقدی فروش', type: 'معین', nature: 'بدهکار', parentId: 33 },
    { id: 99, code: '510101', name: 'بهای تمام شده کالای خریده شده / ساخته شده', type: 'معین', nature: 'بدهکار', parentId: 34 },
    { id: 100, code: '510201', name: 'خرید ناخالص کالا', type: 'معین', nature: 'بدهکار', parentId: 35 },
    { id: 101, code: '510202', name: 'برگشت از خرید و تخفیفات', type: 'معین', nature: 'بستانکار', parentId: 35 },
    { id: 102, code: '510203', name: 'تخفیفات نقدی خرید', type: 'معین', nature: 'بستانکار', parentId: 35 },
    { id: 103, code: '510301', name: 'هزینه حمل کالای خریداری شده', type: 'معین', nature: 'بدهکار', parentId: 36 },
    { id: 104, code: '520101', name: 'حقوق پایه و حقوق ماهانه', type: 'معین', nature: 'بدهکار', parentId: 37 },
    { id: 105, code: '520102', name: 'اضافه‌کاری و پاداش', type: 'معین', nature: 'بدهکار', parentId: 37 },
    { id: 106, code: '520103', name: 'حق بیمه سهم کارفرما', type: 'معین', nature: 'بدهکار', parentId: 37 },
    { id: 107, code: '520104', name: 'بن و مسکن و اولاد', type: 'معین', nature: 'بدهکار', parentId: 37 },
    { id: 108, code: '520105', name: 'عیدی و پاداش پایان سال', type: 'معین', nature: 'بدهکار', parentId: 37 },
    { id: 109, code: '520201', name: 'هزینه اجاره دفتر و انبار', type: 'معین', nature: 'بدهکار', parentId: 38 },
    { id: 110, code: '520202', name: 'هزینه آب، برق، گاز و تلفن', type: 'معین', nature: 'بدهکار', parentId: 38 },
    { id: 111, code: '520203', name: 'هزینه ملزومات و لوازم‌التحریر', type: 'معین', nature: 'بدهکار', parentId: 38 },
    { id: 112, code: '520204', name: 'هزینه ایاب و ذهاب و پذیرایی', type: 'معین', nature: 'بدهکار', parentId: 38 },
    { id: 113, code: '520205', name: 'هزینه پست، پیک و ارتباطات', type: 'معین', nature: 'بدهکار', parentId: 38 },
    { id: 114, code: '520301', name: 'هزینه تبلیغات و بازاریابی', type: 'معین', nature: 'بدهکار', parentId: 39 },
    { id: 115, code: '520302', name: 'هزینه حمل و نقل فروش', type: 'معین', nature: 'بدهکار', parentId: 39 },
    { id: 116, code: '520401', name: 'هزینه کارمزد بانکی', type: 'معین', nature: 'بدهکار', parentId: 40 },
    { id: 117, code: '520402', name: 'هزینه سود و کارمزد تسهیلات بانکی', type: 'معین', nature: 'بدهکار', parentId: 40 },
    { id: 118, code: '520501', name: 'هزینه استهلاک دارایی‌های ثابت', type: 'معین', nature: 'بدهکار', parentId: 41 },
    { id: 119, code: '610101', name: 'خلاصه سود و زیان سال جاری', type: 'معین', nature: 'مشترک', parentId: 42 },
    { id: 120, code: '610201', name: 'تعدیلات سنواتی سود و زیان', type: 'معین', nature: 'مشترک', parentId: 43 },
    { id: 121, code: '710101', name: 'اسناد وثیقه‌ای و ضمانتی دریافتی', type: 'معین', nature: 'بدهکار', parentId: 44 },
    { id: 122, code: '710102', name: 'طرف حساب اسناد انتظامی دریافتی', type: 'معین', nature: 'بستانکار', parentId: 44 },
    { id: 123, code: '710201', name: 'اسناد وثیقه‌ای و ضمانتی پرداختی', type: 'معین', nature: 'بدهکار', parentId: 45 },
    { id: 124, code: '710202', name: 'طرف حساب اسناد انتظامی پرداختی', type: 'معین', nature: 'بستانکار', parentId: 45 }
  ],
  shenavars: [
    { id: 1, code: 'SH-101', name: 'پروژه احداث شعبه غرب', parentId: null, status: 'فعال' },
    { id: 2, code: 'SH-102', name: 'مرکز هزینه کارخانه ۱', parentId: null, status: 'فعال' },
    { id: 3, code: 'SH-101-01', name: 'فاز ۱ سازه بتنی', parentId: 1, status: 'فعال' },
    { id: 4, code: 'SH-101-02', name: 'فاز ۲ محوطه‌سازی', parentId: 1, status: 'فعال' }
  ],
  bakhsh: [
    { id: 1, code: 1, name: 'حسابداری' },
    { id: 2, code: 2, name: 'خرید و فروش' },
    { id: 3, code: 3, name: 'انبارداری' },
    { id: 4, code: 4, name: 'حقوق و دستمزد' },
    { id: 5, code: 5, name: 'خزانه‌داری' },
    { id: 6, code: 6, name: 'بودجه و هزینه' },
    { id: 7, code: 7, name: 'اموال' }
  ],
  sanads: [
    // --- سال ۱۴۰۳ ---
    { id: 101, date: '1403/01/05', desc: 'سند افتتاحیه سال مالی ۱۴۰۳', debit: 5000000000, credit: 5000000000, status: 'دائم', bakhshId: 1 },
    { id: 102, date: '1403/02/10', desc: 'فاکتور فروش کالا به شرکت فناوری آریا', debit: 450000000, credit: 450000000, status: 'تایید شده', bakhshId: 2 },
    { id: 103, date: '1403/02/12', desc: 'دریافت حواله بانکی از شرکت آریا به بانک ملت', debit: 450000000, credit: 450000000, status: 'تایید شده', bakhshId: 5 },
    { id: 104, date: '1403/03/15', desc: 'پرداخت حقوق و دستمزد پرسنل از بانک صادرات', debit: 350000000, credit: 350000000, status: 'تایید شده', bakhshId: 4 },
    { id: 105, date: '1403/04/20', desc: 'خرید ملزومات اداری و تجهیزات از بانک ملی', debit: 120000000, credit: 120000000, status: 'تایید شده', bakhshId: 1 },
    { id: 106, date: '1403/05/14', desc: 'واریز نقدی صندوق به بانک ملی', debit: 75000000, credit: 75000000, status: 'تایید شده', bakhshId: 5 },
    { id: 107, date: '1403/06/01', desc: 'واریز پیش‌دریافت مشتری به بانک صادرات', debit: 200000000, credit: 200000000, status: 'تایید شده', bakhshId: 5 },

    // --- سال ۱۴۰۲ ---
    { id: 201, date: '1402/01/05', desc: 'سند افتتاحیه سال مالی ۱۴۰۲', debit: 3800000000, credit: 3800000000, status: 'دائم', bakhshId: 1 },
    { id: 202, date: '1402/04/18', desc: 'واریز درآمد فروش خدمات به بانک ملت', debit: 320000000, credit: 320000000, status: 'تایید شده', bakhshId: 2 },
    { id: 203, date: '1402/08/22', desc: 'پرداخت هزینه اجاره دفتر از بانک ملی', debit: 180000000, credit: 180000000, status: 'تایید شده', bakhshId: 1 },
    { id: 204, date: '1402/11/10', desc: 'پرداخت وجه فاکتور تامین‌کننده از بانک صادرات', debit: 250000000, credit: 250000000, status: 'تایید شده', bakhshId: 2 },

    // --- سال ۱۴۰۱ ---
    { id: 301, date: '1401/01/05', desc: 'سند افتتاحیه سال مالی ۱۴۰۱', debit: 2500000000, credit: 2500000000, status: 'دائم', bakhshId: 1 },
    { id: 302, date: '1401/06/15', desc: 'دریافت وجه خدمات مشاوره‌ای در بانک ملت', debit: 210000000, credit: 210000000, status: 'تایید شده', bakhshId: 2 },
    { id: 303, date: '1401/09/05', desc: 'خرید سیستم‌ها و نرم‌افزار از بانک ملی', debit: 160000000, credit: 160000000, status: 'تایید شده', bakhshId: 1 }
  ],
  sanadLines: [
    { account: '110101', desc: 'دریافت نقدی', debit: 50000000, credit: 0 },
    { account: '110301', desc: 'تسویه حساب مشتری', debit: 0, credit: 50000000 }
  ],
  products: [
    { id: 1, code: 'PRD-101', name: 'لپ‌تاپ گیمینگ ایسوس ۱۵ اینچ', unit: 'دستگاه', price: 450000000, stock: 24, barcode: '690123456789' },
    { id: 2, code: 'PRD-102', name: 'مانیتور ۲۷ اینچ 4K سامسونگ', unit: 'عدد', price: 180000000, stock: 15, barcode: '690987654321' }
  ],
  warehouses: [
    { id: 1, code: 'WH-01', name: 'انبار مرکزی کالا', type: 'عمومی', keeper: 'رضا حسینی', location: 'تهران - سالن اصلی', allowNeg: false }
  ],
  purchaseInvoices: [
    { id: 'PINV-4001', date: '1403/05/02', party: 'بازرگانی واردات پارس', total: 1850000000, warehouse: 'انبار مرکزی', status: 'ثبت نهایی' }
  ],
  salesInvoices: [
    { id: 'INV-8001', date: '1403/05/08', party: 'شرکت فناوری آریا', total: 630000000, warehouse: 'انبار مرکزی', status: 'ثبت نهایی' }
  ],
  checks: [
    { id: 1, number: '1234567', bank: 'بانک ملی', amount: 150000000, dueDate: '1403/06/01', type: 'دریافتی', status: 'در جریان' },
    { id: 2, number: '7654321', bank: 'بانک ملت', amount: 85000000, dueDate: '1403/05/20', type: 'پرداختی', status: 'در جریان' }
  ],
  personnel: [
    { id: 1, nationalId: '1234567890', fullName: 'مهران رجبی', role: 'حسابدار ارشد', baseSalary: 180000000, housingAllowance: 15000000, groceryAllowance: 10000000 },
    { id: 2, nationalId: '0987654321', fullName: 'سارا کریمی', role: 'کارشناس انبار', baseSalary: 140000000, housingAllowance: 15000000, groceryAllowance: 10000000 }
  ]
};

// Initial vouchers detail database (سندهای پیش‌فرض سیستم)
AppState.voucherDetails = {
  101: [
    { account: '110102', desc: 'آرتیکل بدهکار - واریز سرمایه اولیه بانک ملت', debit: 5000000000, credit: 0, txNo: '', txDate: '' },
    { account: '310101', desc: 'آرتیکل بستانکار - سرمایه صاحبان سهام', debit: 0, credit: 5000000000, txNo: '', txDate: '' }
  ],
  102: [
    { account: '110301', desc: 'طلب از شرکت فناوری آریا', debit: 450000000, credit: 0, txNo: '', txDate: '' },
    { account: '420101', desc: 'فروش کالا فاکتور INV-8001', debit: 0, credit: 450000000, txNo: '', txDate: '' }
  ],
  103: [
    { account: '110102', desc: 'دریافت حواله بانکی از شرکت آریا به بانک ملت', debit: 450000000, credit: 0, txNo: '9845120', txDate: '1403/02/12' },
    { account: '110301', desc: 'تسویه حساب فاکتور فروش INV-8001', debit: 0, credit: 450000000, txNo: '', txDate: '' }
  ],
  104: [
    { account: '520101', desc: 'هزینه حقوق و دستمزد پرسنل خرداد ماه', debit: 350000000, credit: 0, txNo: '', txDate: '' },
    { account: '110102', desc: 'پرداخت لیست حقوق از حساب بانک صادرات', debit: 0, credit: 350000000, txNo: '7789012', txDate: '1403/03/15' }
  ],
  105: [
    { account: '520203', desc: 'هزینه ملزومات اداری و تجهیزات', debit: 120000000, credit: 0, txNo: '', txDate: '' },
    { account: '110102', desc: 'پرداخت چک ۵۱۲ از حساب بانک ملی', debit: 0, credit: 120000000, txNo: '5120091', txDate: '1403/04/20' }
  ],
  106: [
    { account: '110102', desc: 'واریز نقدی صندوق به بانک ملی', debit: 75000000, credit: 0, txNo: '5120095', txDate: '1403/05/14' },
    { account: '110101', desc: 'تحویل موجودی نقدی صندوق', debit: 0, credit: 75000000, txNo: '', txDate: '' }
  ],
  107: [
    { account: '110102', desc: 'واریز پیش‌دریافت مشتری به بانک صادرات', debit: 200000000, credit: 0, txNo: '7789055', txDate: '1403/06/01' },
    { account: '210301', desc: 'پیش‌دریافت از شرکت پارس تکنولوژی', debit: 0, credit: 200000000, txNo: '', txDate: '' }
  ],

  201: [
    { account: '110102', desc: 'آرتیکل بدهکار - بابت سند افتتاحیه سال مالی ۱۴۰۲', debit: 3800000000, credit: 0, txNo: '', txDate: '' },
    { account: '310101', desc: 'آرتیکل بستانکار - بابت سند افتتاحیه سال مالی ۱۴۰۲', debit: 0, credit: 3800000000, txNo: '', txDate: '' }
  ],
  202: [
    { account: '110102', desc: 'واریز درآمد فروش خدمات به بانک ملت', debit: 320000000, credit: 0, txNo: '8812340', txDate: '1402/04/18' },
    { account: '420102', desc: 'درآمد حاصل از ارائه خدمات مشاوره‌ای', debit: 0, credit: 320000000, txNo: '', txDate: '' }
  ],
  203: [
    { account: '520201', desc: 'هزینه اجاره دفتر و انبار', debit: 180000000, credit: 0, txNo: '', txDate: '' },
    { account: '110102', desc: 'پرداخت هزینه اجاره دفتر از بانک ملی', debit: 0, credit: 180000000, txNo: '4110022', txDate: '1402/08/22' }
  ],
  204: [
    { account: '210101', desc: 'تسویه حساب فاکتور تامین‌کننده', debit: 250000000, credit: 0, txNo: '', txDate: '' },
    { account: '110102', desc: 'پرداخت وجه فاکتور تامین‌کننده از بانک صادرات', debit: 0, credit: 250000000, txNo: '6654311', txDate: '1402/11/10' }
  ],

  301: [
    { account: '110102', desc: 'آرتیکل بدهکار - بابت سند افتتاحیه سال مالی ۱۴۰۱', debit: 2500000000, credit: 0, txNo: '', txDate: '' },
    { account: '310101', desc: 'آرتیکل بستانکار - بابت سند افتتاحیه سال مالی ۱۴۰۱', debit: 0, credit: 2500000000, txNo: '', txDate: '' }
  ],
  302: [
    { account: '110102', desc: 'دریافت وجه خدمات مشاوره‌ای در بانک ملت', debit: 210000000, credit: 0, txNo: '7700112', txDate: '1401/06/15' },
    { account: '420102', desc: 'درآمد حاصل از ارائه خدمات', debit: 0, credit: 210000000, txNo: '', txDate: '' }
  ],
  303: [
    { account: '120301', desc: 'خرید سیستم‌ها و نرم‌افزار', debit: 160000000, credit: 0, txNo: '', txDate: '' },
    { account: '110102', desc: 'خرید سیستم‌ها و نرم‌افزار از بانک ملی', debit: 0, credit: 160000000, txNo: '3109088', txDate: '1401/09/05' }
  ]
};

// Default Coding/Level settings
AppState.codingSettings = {
  detailLevelsCount: 3,
  groupCodeLength: 2,
  klCodeLength: 4,
  moeinCodeLength: 6,
  tafsili1Length: 6,
  tafsili2Length: 6,
  tafsili3Length: 6
};

// ============================
// Navigation: Ribbon Tab Switch
// ============================
function toggleAppSidebar(forceState) {
  const sidebar = document.getElementById('appSidebar');
  const icon = document.getElementById('sidebarHandleIcon');
  if (!sidebar) return;

  const isCollapsed = sidebar.classList.contains('collapsed');
  const shouldCollapse = (typeof forceState === 'boolean') ? forceState : !isCollapsed;

  if (shouldCollapse) {
    sidebar.classList.add('collapsed');
    if (icon) icon.textContent = '◀';
  } else {
    sidebar.classList.remove('collapsed');
    if (icon) icon.textContent = '▶';
  }
}

function switchRibbon(moduleId, tabEl) {
  AppState.currentModule = moduleId;

  // Update active status on sidebar nav items
  document.querySelectorAll('.sidebar-nav-item').forEach(t => t.classList.remove('active'));
  
  if (tabEl) {
    tabEl.classList.add('active');
  } else {
    const navItem = document.querySelector(`.sidebar-nav-item[onclick*="'${moduleId}'"]`);
    if (navItem) navItem.classList.add('active');
  }

  // Ensure sidebar is expanded so user sees active module item alongside flyout panel
  toggleAppSidebar(false);

  // Open Flyout Submenu Panel floating over current page WITHOUT changing background workspace!
  openModuleFlyoutPanel(moduleId);
}

function openModuleFlyoutPanel(moduleId) {
  const panel = document.getElementById('moduleFlyoutPanel');
  const titleEl = document.getElementById('flyoutTitle');
  const bodyEl = document.getElementById('flyoutBody');
  const targetTiles = document.getElementById('tiles-' + moduleId);
  if (!panel || !bodyEl || !targetTiles) return;

  // 1. Get module title
  const pageTitle = targetTiles.querySelector('.page-title');
  if (titleEl && pageTitle) {
    titleEl.textContent = pageTitle.textContent.trim();
  }

  // 2. Clear previous flyout cards
  bodyEl.innerHTML = '';

  // 3. Extract tile-card items from targetTiles
  const cards = targetTiles.querySelectorAll('.tile-card');
  cards.forEach(card => {
    const iconBox = card.querySelector('.tile-icon-box');
    const titleBox = card.querySelector('.tile-title');
    const onclickAttr = card.getAttribute('onclick') || '';

    const item = document.createElement('div');
    item.className = 'flyout-card-item';
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'flyout-card-icon ' + (iconBox ? iconBox.className : '');
    iconDiv.innerHTML = iconBox ? iconBox.innerHTML : '⚡';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'flyout-card-title';
    titleDiv.textContent = titleBox ? titleBox.textContent.trim() : '';

    item.appendChild(iconDiv);
    item.appendChild(titleDiv);

    // Onclick: Open in a NEW BROWSER TAB and close flyout panel!
    item.onclick = function(e) {
      e.stopPropagation();
      closeModuleFlyoutPanel();
      executeCardInNewTab(onclickAttr);
    };

    bodyEl.appendChild(item);
  });

  // Display flyout panel
  panel.style.display = 'flex';
}

function closeModuleFlyoutPanel() {
  const panel = document.getElementById('moduleFlyoutPanel');
  if (panel) panel.style.display = 'none';
}

function openPageTab(url, formKey) {
  // Synchronize AppState.companies from localStorage if updated in another tab
  try {
    const savedCompanies = localStorage.getItem('negar_companies');
    if (savedCompanies) {
      AppState.companies = JSON.parse(savedCompanies);
    }
  } catch(e) {}

  const comp = SessionState.company || (AppState.companies && AppState.companies.length > 0 ? AppState.companies[0] : null);
  const openMode = (comp && comp.pageOpenMode) ? comp.pageOpenMode : 'unique';

  if (openMode === 'unique') {
    // If we are ALREADY on this form in the current tab, don't open another tab!
    const currentFormKey = AppState.currentForm || (new URLSearchParams(window.location.search).get('form')) || 'main';
    if (currentFormKey === formKey) {
      window.focus();
      return window;
    }

    const targetName = 'negar_tab_' + (formKey || 'main');
    const win = window.open(url, targetName);
    if (win) {
      win.focus();
    }
    return win;
  } else {
    // Duplicate mode: always open a new tab with unique target
    const targetName = 'negar_tab_' + (formKey || 'main') + '_' + Date.now();
    const win = window.open(url, targetName);
    if (win) {
      win.focus();
    }
    return win;
  }
}

function executeCardInNewTab(onclickAttr) {
  closeModuleFlyoutPanel();
  if (onclickAttr.includes('openHesabdariMain')) {
    const match = onclickAttr.match(/openHesabdariMain\(['"]([^'"]+)['"]\)/);
    const mode = match ? match[1] : 'coding';
    openPageTab(`index.html?form=form-hesabdari-main&mode=${mode}`, 'hesabdari_' + mode);
  } else if (onclickAttr.includes('showForm')) {
    const match = onclickAttr.match(/showForm\(['"]([^'"]+)['"]\)/);
    if (match && match[1]) {
      openPageTab(`index.html?form=${match[1]}`, match[1]);
    }
  } else {
    showTiles('system');
  }
}

// Close flyout panel when clicking outside
document.addEventListener('click', function(e) {
  const panel = document.getElementById('moduleFlyoutPanel');
  const sidebar = document.getElementById('appSidebar');
  if (!panel || panel.style.display === 'none') return;
  if (!panel.contains(e.target) && !sidebar.contains(e.target)) {
    closeModuleFlyoutPanel();
  }
});

function showTiles(moduleId) {
  document.body.classList.remove('accounts-mode');
  // Hide forms area
  const formsArea = document.getElementById('formsArea');
  if (formsArea) formsArea.style.display = 'none';

  // Show background branding watermark when no form is open
  const watermark = document.getElementById('negarMainWatermark');
  if (watermark) watermark.style.display = 'flex';

  // Hide all tile containers
  document.querySelectorAll('.tiles-container').forEach(t => {
    t.classList.remove('active');
    t.style.display = 'none';
  });

  // Ensure active class on matching sidebar nav item
  document.querySelectorAll('.sidebar-nav-item').forEach(t => {
    const onclickStr = t.getAttribute('onclick') || '';
    if (onclickStr.includes(`'${moduleId}'`)) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });

  // Show only selected module's tiles
  const target = document.getElementById('tiles-' + moduleId);
  if (target) {
    target.classList.add('active');
    target.style.display = 'block';
  }

  // Automatically expand sidebar on tile dashboard
  toggleAppSidebar(false);

  updateDocumentTitle(null);
}

// ============================
// Dynamic Browser Tab Title Handler
// ============================
function updateDocumentTitle(formId, customSubTitle) {
  if (!formId) {
    document.title = 'نگار تحت وب - سیستم یکپارچه مالی، حسابداری، انبارداری';
    return;
  }

  const titlesMap = {
    'form-switch-company': 'تغییر شرکت / سال مالی',
    'form-switch-year': 'تغییر سال مالی',
    'form-companies-list': 'مدیریت شرکت‌ها',
    'form-fiscal-years': 'مدیریت سال‌های مالی',
    'form-hesabdari-main': 'حسابداری',
    'form-accounts-chart': 'کدگذاری حساب‌ها',
    'form-shenavar': 'حساب‌های شناور',
    'form-sanad1': 'ثبت و مدیریت اسناد حسابداری',
    'form-sanad2': 'ثبت و صدور سند حسابداری',
    'form-product-groups': 'گروه‌بندی کالاها',
    'form-products': 'تعریف و مدیریت کالاها',
    'form-warehouses': 'مدیریت انبارها',
    'form-cardex': 'کاردکس کالا',
    'form-purchase-invoice': 'فاکتور خرید',
    'form-sales-invoice': 'فاکتور فروش',
    'form-warehouse-transfer': 'انتقال بین انبارها',
    'form-users-list': 'مدیریت کاربران',
    'form-permissions-matrix': 'سطوح دسترسی کاربران',
    'form-change-password': 'تغییر رمز عبور',
    'form-activity-log': 'لاگ فعالیت‌ها',
    'form-backup': 'پشتیبان‌گیری',
    'form-restore': 'بازیابی اطلاعات',
    'form-theme-manager': 'مدیریت تم‌ها',
    'form-lock': 'قفل سیستم',
    'form-about': 'درباره نگار',
    'form-contact': 'تماس با ما',
    'form-exit': 'خروج از سیستم',
    'form-data-migration': 'مهاجرت داده‌ها',
    'form-system-messages': 'پیام‌های سیستم',
    'form-release': 'تغییرات نسخه',
    'form-update': 'ارتقای سیستم',
    'form-db-audit': 'ممیزی دیتابیس',
    'form-account-levels': 'سطوح کدگذاری حساب‌ها',
    'form-tax-system': 'سامانه مودیان',
    'form-parties': 'اشخاص و طرف حساب‌ها',
    'form-personnel': 'مدیریت پرسنل',
    'form-payslip': 'فیش حقوقی',
    'form-attendance': 'حضور و غیاب',
    'form-assets-list': 'اموال و دارایی ثابت',
    'form-depreciation': 'محاسبه استهلاک',
    'form-letters': 'دبیرخانه و نامه‌ها',
    'form-dms': 'مدیریت اسناد DMS',
    'form-crm-customers': 'مشتریان CRM',
    'form-crm-opportunities': 'فرصت‌های CRM',
    'form-checks': 'مدیریت چک‌ها',
    'form-bank-accounts': 'حساب‌های بانکی',
    'form-budget-plan': 'برنامه‌ریزی بودجه',
    'form-cost-centers': 'مراکز هزینه',
    'form-bom': 'فرمول ساخت BOM'
  };

  let title = customSubTitle || titlesMap[formId];

  if (!title) {
    const targetForm = document.getElementById(formId);
    if (targetForm) {
      const heading = targetForm.querySelector('.form-heading') || targetForm.querySelector('h1, h2, h3, h4');
      if (heading) {
        title = heading.textContent.replace(/\s*\([^)]*\)/g, '').trim();
      }
    }
  }

  if (!title) {
    title = 'نگار تحت وب';
  }

  document.title = title + ' - نگار';
}

// ============================
// Show Form (called when a tile is clicked)
// ============================
function showForm(formId) {
  EshkalLogger.log('showForm_Enter', { formId });

  // If we are in the main dashboard tab (not inside a sub-tab) and not a system dialog, open in browser tab per company pageOpenMode setting
  if (!AppState.isTabMode && formId !== 'form-switch-company' && formId !== 'form-switch-year') {
    const url = `index.html?form=${formId}`;
    openPageTab(url, formId);
    return;
  }

  AppState.currentForm = formId;

  // Update browser tab title
  updateDocumentTitle(formId);

  // Automatically slide collapse sidebar to the right when entering any form
  toggleAppSidebar(true);

  if (formId !== 'form-hesabdari-main') {
    document.body.classList.remove('accounts-mode');
  } else {
    document.body.classList.add('accounts-mode');
  }
  document.querySelectorAll('.tiles-container').forEach(t => {
    t.classList.remove('active');
    t.style.display = 'none';
  });

  // Hide background branding watermark when a form is opened
  const watermark = document.getElementById('negarMainWatermark');
  if (watermark) watermark.style.display = 'none';

  // Show forms area
  const formsArea = document.getElementById('formsArea');
  formsArea.style.display = 'flex';
  formsArea.style.flexDirection = 'column';
  formsArea.style.width = '100%';

  // Hide back-bar when in voucher editor (form-sanad2)
  const backBar = document.querySelector('.back-bar');
  if (backBar) {
    if (formId === 'form-sanad2') {
      backBar.style.display = 'none';
    } else {
      backBar.style.display = 'flex';
    }
  }

  // Hide all individual form sections
  document.querySelectorAll('.form-section').forEach(f => {
    f.style.display = 'none';
  });

  // Show selected form
  const targetForm = document.getElementById(formId);
  if (targetForm) {
    if (formId === 'form-hesabdari-main' || formId === 'form-sanad2') {
      targetForm.style.display = 'flex';
      targetForm.style.flexDirection = 'column';
      targetForm.style.width = '100%';
    } else {
      targetForm.style.display = 'block';
    }

    // Set back-bar title
    const heading = targetForm.querySelector('.form-heading');
    const titleEl = document.getElementById('currentFormTitle');
    if (titleEl && heading) titleEl.textContent = heading.textContent;

    // Scroll to top
    window.scrollTo(0, 0);
  }

  // Toggle body scroll for form-sanad2
  if (formId === 'form-sanad2') {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
  } else {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.height = '';
  }

  // Re-render dynamic tables when their form is shown
  if (formId === 'form-users-list') renderUsersTable();
  if (formId === 'form-accounts-chart') renderAccountsTable();
  if (formId === 'form-shenavar') renderShenavaarTable();
  if (formId === 'form-sanad1') renderSanadListTable();
  if (formId === 'form-sanad2') renderSanadEditorLines();
  if (formId === 'form-products') renderProductsTable();
  if (formId === 'form-warehouses') renderWarehousesTable();
  if (formId === 'form-purchase-invoice') renderPurchaseInvoicesTable();
  if (formId === 'form-sales-invoice') renderSalesInvoicesTable();
  if (formId === 'form-checks') renderChecksTable();
  if (formId === 'form-bank-accounts') renderBankAccountsTable();
  if (formId === 'form-personnel') renderPersonnelTable();
  if (formId === 'form-payslip') initPayslipForm();
  if (formId === 'form-cardex') initCardexForm();
  if (formId === 'form-permissions-matrix') renderPermissionsMatrix();
  if (formId === 'form-companies-list') renderCompaniesTable();
  if (formId === 'form-fiscal-years') renderFiscalYearsTable();
  if (formId === 'form-switch-company') renderSwitchCompanyForm();
  if (formId === 'form-switch-year') renderSwitchYearOnlyForm();
  if (formId === 'form-account-levels') loadCodingSettings();
  if (formId === 'form-hesabdari-main') {
    const activeSub = document.querySelector('.hesabdari-subtabs-bar .subtab-item.active');
    const tabId = activeSub ? activeSub.getAttribute('data-tab') : 'sanad';
    switchHesabdariTab(tabId);
  }
}

// ============================
// HESABDARI MAIN MODULE & SUB-TABS
// ============================
function openHesabdariMain(mode) {
  if (!AppState.isTabMode) {
    openPageTab(`index.html?form=form-hesabdari-main&mode=${mode}`, 'hesabdari_' + mode);
    return;
  }
  showForm('form-hesabdari-main');
  if (mode === 'reports') {
    switchHesabdariTab('taraz');
  } else if (mode === 'coding') {
    switchHesabdariTab('accounts');
  } else {
    switchHesabdariTab('sanad');
  }
}

function switchHesabdariTab(tabId) {
  EshkalLogger.log('switchHesabdariTab_Enter', { tabId });

  // 1. Update sub-tab navigation items
  const items = document.querySelectorAll('.hesabdari-subtabs-bar .subtab-item');
  items.forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 2. Update sub-tab panels
  const panels = document.querySelectorAll('.hesabdari-tab-panel');
  panels.forEach(panel => {
    if (panel.id === 'tab-panel-' + tabId) {
      panel.classList.add('active');
      panel.style.display = '';
    } else {
      panel.classList.remove('active');
      panel.style.display = 'none';
    }
  });

  // Keep accounts-mode active on body so all tabs have sticky headers and inner datagrid scroll
  document.body.classList.add('accounts-mode');

  // Hide background branding watermark when hesabdari subtabs are active
  const watermark = document.getElementById('negarMainWatermark');
  if (watermark) watermark.style.display = 'none';

  const hesabdariSubTitles = {
    'accounts': 'حسابداری - سرفصل حساب‌ها',
    'shenavar': 'حسابداری - حساب‌های شناور',
    'sanad': 'حسابداری - اسناد',
    'taraz': 'حسابداری - تراز آزمایشی',
    'ledger': 'حسابداری - دفتر حساب',
    'bank': 'حسابداری - مغایرت بانکی',
    'taraz-shenavar': 'حسابداری - تراز شناور',
    'daftar-shenavar': 'حسابداری - دفتر شناور'
  };
  if (hesabdariSubTitles[tabId]) {
    updateDocumentTitle('form-hesabdari-main', hesabdariSubTitles[tabId]);
  }

  // 3. Render dynamic content for specific tab
  if (tabId === 'accounts') renderAccountsTable();
  if (tabId === 'shenavar') renderShenavaarTable();
  if (tabId === 'sanad') renderSanadListTable();
  if (tabId === 'taraz') populateTarazFields();
  if (tabId === 'ledger') populateLedgerCombos();
  if (tabId === 'taraz-shenavar') calculateTarazShenavar();
  if (tabId === 'daftar-shenavar') populateDaftarShenavarCombos();
}

// ============================
// Back Button
// ============================
function goBack() {
  if (AppState.currentForm === 'form-sanad2' || AppState.currentForm === 'form-sanad-attachments') {
    closeSanadEditor();
    return;
  }
  if (AppState.isTabMode) {
    window.close();
    return;
  }
  AppState.currentForm = null;
  showTiles(AppState.currentModule);
}

// ============================
// USERS MODULE
// ============================
function renderUsersTable() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  tbody.innerHTML = AppState.users.map(u => `
    <tr>
      <td><b>${u.username}</b></td>
      <td>${u.fullName}</td>
      <td><span class="badge badge-primary">${u.userType}</span></td>
      <td>${u.ip}</td>
      <td><span class="badge ${u.isActive ? 'badge-success' : 'badge-warning'}">${u.isActive ? 'فعال' : 'غیرفعال'}</span></td>
      <td>
        <button class="btn btn-outline" style="padding:3px 8px;" onclick="toggleUserStatus(${u.id})">
          ${u.isActive ? '🔴 غیرفعال' : '🟢 فعال'}
        </button>
        <button class="btn btn-outline" style="padding:3px 8px;color:red;" onclick="deleteUser(${u.id})">🗑️ حذف</button>
      </td>
    </tr>
  `).join('');
}

function openAddUserRow() {
  document.getElementById('addUserRow').style.display = 'block';
  document.getElementById('newUsername').focus();
}

function saveNewUser() {
  const username = document.getElementById('newUsername')?.value?.trim();
  const fullName = document.getElementById('newFullName')?.value?.trim();
  const userType = document.getElementById('newUserType')?.value;
  if (!username || !fullName) { alert('نام کاربری و نام کامل الزامی هستند.'); return; }
  if (AppState.users.find(u => u.username === username)) { alert('این نام کاربری قبلاً ثبت شده است.'); return; }
  AppState.users.push({ id: Date.now(), username, fullName, userType, isActive: true, ip: '127.0.0.1' });
  document.getElementById('newUsername').value = '';
  document.getElementById('newFullName').value = '';
  document.getElementById('addUserRow').style.display = 'none';
  renderUsersTable();
  alert(`کاربر "${username}" با موفقیت اضافه شد.`);
}

function toggleUserStatus(userId) {
  const user = AppState.users.find(u => u.id === userId);
  if (user) { user.isActive = !user.isActive; renderUsersTable(); }
}

function deleteUser(userId) {
  if (userId === 1) { alert('حذف مدیر ارشد سیستم مجاز نیست.'); return; }
  if (confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
    AppState.users = AppState.users.filter(u => u.id !== userId);
    renderUsersTable();
  }
}

function renderPermissionsMatrix() {
  const modules = ['حسابداری', 'کاربران', 'انبارداری', 'خرید', 'فروش', 'حقوق', 'اموال', 'اتوماسیون', 'CRM', 'خزانه'];
  const tbody = document.getElementById('permissionsMatrixBody');
  if (!tbody) return;
  tbody.innerHTML = modules.map(m => `
    <tr>
      <td>${m}</td>
      ${['مشاهده','ایجاد','ویرایش','حذف','چاپ','خروجی'].map(p => `
        <td style="text-align:center;"><input type="checkbox" checked style="width:16px;height:16px;cursor:pointer;" /></td>
      `).join('')}
    </tr>
  `).join('');
}

// ============================
// ACCOUNTING MODULE
// ============================
function sortTreePreOrder(list) {
  const result = [];
  
  function traverse(parentId) {
    const children = list.filter(item => item.parentId === parentId);
    
    // Sort children alphabetically/numerically by code
    children.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' }));
    
    for (const child of children) {
      result.push(child);
      traverse(child.id);
    }
  }
  
  traverse(null);
  return result;
}

// Set of expanded account IDs for treeview datagrid (declared at top level)
let currentParentIdForNewAccount = null;

function toggleAccountExpand(accId) {
  if (expandedAccountIds.has(accId)) {
    expandedAccountIds.delete(accId);
  } else {
    expandedAccountIds.add(accId);
  }
  renderAccountsTable();
}

function canAddChildOf(parentAcc) {
  const settings = AppState.codingSettings || { detailLevelsCount: 3 };
  if (parentAcc.type === 'گروه') return true;
  if (parentAcc.type === 'کل') return true;
  if (parentAcc.type === 'معین') {
    return settings.detailLevelsCount >= 1;
  }
  if (parentAcc.type === 'تفصیلی ۱') {
    return settings.detailLevelsCount >= 2;
  }
  if (parentAcc.type === 'تفصیلی ۲') {
    return settings.detailLevelsCount >= 3;
  }
  return false; // تفصیلی ۳ has no sub-level
}

function getChildType(parentAcc) {
  if (parentAcc.type === 'گروه') return 'کل';
  if (parentAcc.type === 'کل') return 'معین';
  if (parentAcc.type === 'معین') return 'تفصیلی ۱';
  if (parentAcc.type === 'تفصیلی ۱') return 'تفصیلی ۲';
  if (parentAcc.type === 'تفصیلی ۲') return 'تفصیلی ۳';
  return null;
}

function handleTreeButtonClick(accId) {
  const account = AppState.accounts.find(a => a.id === accId);
  if (!account) return;

  // Set the clicked row as the active selected parent row
  currentParentIdForNewAccount = accId;

  const hasChildren = AppState.accounts.some(child => child.parentId === account.id);
  if (hasChildren) {
    // Normal expand/collapse toggle
    toggleAccountExpand(accId);
  } else {
    // Check if sub-level is allowed
    if (!canAddChildOf(account)) {
      const settings = AppState.codingSettings || { detailLevelsCount: 3 };
      let limitName = 'تفصیلی ۳';
      if (settings.detailLevelsCount === 1) limitName = 'تفصیلی ۱';
      if (settings.detailLevelsCount === 2) limitName = 'تفصیلی ۲';
      
      alert(`خطا: بر اساس تنظیمات سطوح حساب‌ها، امکان ایجاد حساب در سطح پایین‌تر وجود ندارد. حداکثر سطح مجاز فرزند: "${limitName}" می‌باشد.`);
      currentParentIdForNewAccount = null;
      renderAccountsTable();
      return;
    }
    
    const parentLevel = account.type;
    const childLevel = getChildType(account);
    
    const msg = `تا کنون برای این سرفصل "${parentLevel}" ، حساب "${childLevel}" ، ایجاد نشده است ، آیا مایلید برای آن حساب "${childLevel}" ایجاد کنید؟`;
    if (confirm(msg)) {
      openAddAccountRow();
    } else {
      // Clear selection if cancelled
      currentParentIdForNewAccount = null;
      renderAccountsTable();
    }
  }
}

function getAccountLevel(a) {
  let level = 0;
  let curr = a;
  let visited = new Set();
  while (curr && curr.parentId && !visited.has(curr.id)) {
    visited.add(curr.id);
    curr = AppState.accounts.find(x => x.id === curr.parentId);
    if (curr) level++;
    else break;
  }
  return level;
}

function isAccountVisible(a) {
  let curr = a;
  let visited = new Set();
  while (curr && curr.parentId && !visited.has(curr.id)) {
    visited.add(curr.id);
    if (!expandedAccountIds.has(curr.parentId)) return false;
    curr = AppState.accounts.find(x => x.id === curr.parentId);
  }
  return true;
}

let accountSearchCode = '';
let accountSearchName = '';
let selectedAccountId = null;

function filterAccountsGrid() {
  accountSearchCode = (document.getElementById('searchAccountCode')?.value || '').trim();
  accountSearchName = (document.getElementById('searchAccountName')?.value || '').trim();
  renderAccountsTable();
}

function clearAccountSearch() {
  const codeIn = document.getElementById('searchAccountCode');
  const nameIn = document.getElementById('searchAccountName');
  if (codeIn) codeIn.value = '';
  if (nameIn) nameIn.value = '';
  accountSearchCode = '';
  accountSearchName = '';
  renderAccountsTable();
}

function handleAccountsExpandLevelChange(level) {
  expandedAccountIds.clear();
  
  if (level === 'group') {
    // Collapsed all
  } else if (level === 'general') {
    AppState.accounts.forEach(a => {
      if (a.type === 'گروه') expandedAccountIds.add(a.id);
    });
  } else if (level === 'auxiliary') {
    AppState.accounts.forEach(a => {
      if (a.type === 'گروه' || a.type === 'کل') expandedAccountIds.add(a.id);
    });
  } else {
    // Expand everything
    AppState.accounts.forEach(a => {
      expandedAccountIds.add(a.id);
    });
  }
  
  renderAccountsTable();
}

function selectAccountRow(id) {
  selectedAccountId = id;
  currentParentIdForNewAccount = id;
  
  const acc = AppState.accounts.find(x => x.id === id);
  updateAccountHierarchyLabel(acc);
  
  renderAccountsTable();
}

function updateAccountHierarchyLabel(a) {
  const label = document.getElementById('accountHierarchyLabel');
  if (!label) return;
  
  if (!a) {
    label.innerHTML = `سطح سرفصل جاری: - / زنجیره: -`;
    return;
  }
  
  const chain = [];
  let curr = a;
  while (curr) {
    chain.unshift(`${curr.code} (${curr.name})`);
    curr = AppState.accounts.find(x => x.id === curr.parentId);
  }
  
  const chainStr = chain.join(' / ');
  label.innerHTML = `سطح سرفصل جاری: <span style="color:var(--accent-color);">${a.type}</span> / زنجیره: <span style="color:var(--primary-color);">${chainStr}</span>`;
}

function isAccountVisibleWithFilter(a, sortedAccounts) {
  if (!accountSearchCode && !accountSearchName) {
    return isAccountVisible(a);
  }
  
  // Match criteria: code must contain search code AND name must contain search name exactly as substring
  const codeMatch = !accountSearchCode || (a.code && a.code.toLowerCase().includes(accountSearchCode.toLowerCase()));
  const nameMatch = !accountSearchName || (a.name && a.name.toLowerCase().includes(accountSearchName.toLowerCase()));
  return codeMatch && nameMatch;
}

function renderAccountsTable() {
  const tbody = document.getElementById('accountsTableBody');
  if (!tbody) return;

  const sortedAccounts = sortTreePreOrder(AppState.accounts);
  const visibleAccounts = sortedAccounts.filter(a => isAccountVisibleWithFilter(a, sortedAccounts));

  tbody.innerHTML = visibleAccounts.map(a => {
    const level = getAccountLevel(a);
    const hasChildren = AppState.accounts.some(child => child.parentId === a.id);
    const isExpanded = expandedAccountIds.has(a.id);
    const isSelected = (a.id === selectedAccountId);
    const selectedClass = isSelected ? 'selected-parent-row' : '';

    // Show tree toggle button (do not show '+' for leaf nodes at max allowed coding level)
    const toggleBtnHtml = hasChildren
      ? `<button class="tree-toggle-btn ${isExpanded ? 'expanded' : ''}" onclick="event.stopPropagation(); handleTreeButtonClick(${a.id})">${isExpanded ? '-' : '+'}</button>`
      : (canAddChildOf(a) ? `<button class="tree-toggle-btn" onclick="event.stopPropagation(); handleTreeButtonClick(${a.id})">+</button>` : '');

    const indentPx = level * 22;

    return `
      <tr id="acc-row-${a.id}" class="tree-level-${Math.min(level, 3)} ${selectedClass}" onclick="selectAccountRow(${a.id})" style="cursor:pointer;">
        <td style="text-align:center;vertical-align:middle;">${toggleBtnHtml}</td>
        <td><b>${a.code}</b></td>
        <td style="padding-right:${indentPx + 10}px;">
          ${level > 0 ? '<span style="color:var(--accent-color);margin-left:6px;">└─</span>' : ''}
          <b>${a.name}</b>
        </td>
        <td><span class="badge badge-primary">${a.type}</span></td>
        <td>${a.nature}</td>
        <td><span class="badge badge-success">فعال</span></td>
        <td>
          <button class="btn btn-outline" style="padding:3px 8px;color:var(--success-color);border-color:var(--success-color);" onclick="event.stopPropagation(); openSameLevelNewAccount(${a.id})">➕ جدید</button>
          <button class="btn btn-outline" style="padding:3px 8px;" onclick="event.stopPropagation(); openEditAccountRow(${a.id})">✏️ ویرایش</button>
          <button class="btn btn-outline" style="padding:3px 8px;color:red;" onclick="event.stopPropagation(); deleteAccount(${a.id})">🗑️ حذف</button>
        </td>
      </tr>
    `;
  }).join('');
}

function suggestNextAccountCode(type, parentId) {
  const siblings = AppState.accounts.filter(a => a.type === type && a.parentId === parentId);
  if (siblings.length > 0) {
    const codes = siblings.map(s => parseInt(s.code, 10)).filter(num => !isNaN(num));
    if (codes.length > 0) {
      const maxCodeVal = Math.max(...codes);
      const nextVal = maxCodeVal + 1;
      const sampleCode = siblings[0].code;
      return String(nextVal).padStart(sampleCode.length, '0');
    }
  }
  
  const settings = AppState.codingSettings || {
    detailLevelsCount: 3,
    groupCodeLength: 2,
    klCodeLength: 4,
    moeinCodeLength: 6,
    tafsili1Length: 6,
    tafsili2Length: 6,
    tafsili3Length: 6
  };

  if (type === 'گروه') {
    const rootGroups = AppState.accounts.filter(a => a.parentId === null);
    if (rootGroups.length > 0) {
      const codes = rootGroups.map(s => parseInt(s.code, 10)).filter(num => !isNaN(num));
      const maxCodeVal = Math.max(...codes);
      return String(maxCodeVal + 1).padStart(settings.groupCodeLength, '0');
    }
    return String(1).padStart(settings.groupCodeLength, '0');
  }
  
  if (parentId) {
    const parent = AppState.accounts.find(a => a.id === parentId);
    if (parent) {
      if (type === 'کل') {
        const gap = settings.klCodeLength - parent.code.length;
        return parent.code + String(1).padStart(gap > 0 ? gap : 2, '0');
      }
      if (type === 'معین') {
        const gap = settings.moeinCodeLength - parent.code.length;
        return parent.code + String(1).padStart(gap > 0 ? gap : 2, '0');
      }
      if (type === 'تفصیلی ۱') {
        const gap = settings.tafsili1Length - parent.code.length;
        return parent.code + String(1).padStart(gap > 0 ? gap : 2, '0');
      }
      if (type === 'تفصیلی ۲') {
        const gap = settings.tafsili2Length - parent.code.length;
        return parent.code + String(1).padStart(gap > 0 ? gap : 2, '0');
      }
      if (type === 'تفصیلی ۳') {
        const gap = settings.tafsili3Length - parent.code.length;
        return parent.code + String(1).padStart(gap > 0 ? gap : 2, '0');
      }
    }
  }
  return '';
}

function openAddAccountRow() {
  const editIdIn = document.getElementById('newAccEditId');
  if (editIdIn) editIdIn.value = '';

  const selectType = document.getElementById('newAccType');
  const selectParent = document.getElementById('newAccParentId');
  const inputCode = document.getElementById('newAccCode');
  
  let targetType = 'گروه';
  let targetParentId = null;
  
  if (currentParentIdForNewAccount !== null) {
    const parentAcc = AppState.accounts.find(a => a.id === currentParentIdForNewAccount);
    if (parentAcc) {
      // Validate sub-level limits
      if (!canAddChildOf(parentAcc)) {
        const settings = AppState.codingSettings || { detailLevelsCount: 3 };
        let limitName = 'تفصیلی ۳';
        if (settings.detailLevelsCount === 1) limitName = 'تفصیلی ۱';
        if (settings.detailLevelsCount === 2) limitName = 'تفصیلی ۲';
        
        alert(`خطا: بر اساس تنظیمات سطوح حساب‌ها، امکان ایجاد حساب در سطح پایین‌تر وجود ندارد. حداکثر سطح مجاز فرزند: "${limitName}" می‌باشد.`);
        currentParentIdForNewAccount = null;
        renderAccountsTable();
        return;
      }
      targetParentId = parentAcc.id;
      targetType = getChildType(parentAcc);
    }
  }
  
  if (selectType) selectType.value = targetType;
  if (selectParent) {
    selectParent.innerHTML = `<option value="${targetParentId || ''}">${targetParentId ? targetParentId : 'بدون والد'}</option>`;
    selectParent.value = targetParentId || '';
  }
  
  if (inputCode) {
    inputCode.value = suggestNextAccountCode(targetType, targetParentId);
  }
  
  // Update modal title
  const titleEl = document.getElementById('accountModalTitle');
  if (titleEl) {
    if (currentParentIdForNewAccount !== null) {
      const parentAcc = AppState.accounts.find(a => a.id === currentParentIdForNewAccount);
      const parentName = parentAcc ? parentAcc.name : '';
      const childType = getChildType(parentAcc) || '';
      titleEl.innerHTML = `➕ افزودن سرفصل <span style="color:var(--accent-color);">${childType}</span> فرزند <span style="color:var(--primary-color);">"${parentName}"</span>`;
    } else {
      titleEl.textContent = '➕ افزودن سرفصل جدید (گروه اصلی)';
    }
  }

  // Highlight the table to show current selection
  renderAccountsTable();

  openAccountModal();
  setTimeout(() => { if (document.getElementById('newAccName')) document.getElementById('newAccName').focus(); }, 200);
}

function openEditAccountRow(id) {
  const acc = AppState.accounts.find(x => x.id === id);
  if (!acc) return;
  
  const titleEl = document.getElementById('accountModalTitle');
  if (titleEl) titleEl.innerHTML = `✏️ ویرایش سرفصل <span style="color:var(--accent-color);">${acc.type}</span> (کد: ${acc.code})`;
  
  document.getElementById('newAccEditId').value = acc.id;
  document.getElementById('newAccCode').value = acc.code;
  document.getElementById('newAccName').value = acc.name;
  document.getElementById('newAccNature').value = acc.nature;
  document.getElementById('newAccType').value = acc.type;
  document.getElementById('newAccParentId').value = acc.parentId || '';
  
  openAccountModal();
  setTimeout(() => { const n = document.getElementById('newAccName'); if(n) n.focus(); }, 200);
}

function openSameLevelNewAccount(id) {
  const acc = AppState.accounts.find(a => a.id === id);
  if (!acc) return;

  // Clear any active edit state and set parent to sibling's parent
  currentParentIdForNewAccount = acc.parentId; // same parent = same level

  const editIdIn = document.getElementById('newAccEditId');
  if (editIdIn) editIdIn.value = '';

  const selectType = document.getElementById('newAccType');
  const selectParent = document.getElementById('newAccParentId');
  const inputCode = document.getElementById('newAccCode');
  const inputName = document.getElementById('newAccName');
  if (inputName) inputName.value = '';

  if (selectType) selectType.value = acc.type;
  if (selectParent) {
    selectParent.innerHTML = `<option value="${acc.parentId || ''}">${acc.parentId ? acc.parentId : 'بدون والد'}</option>`;
    selectParent.value = acc.parentId || '';
  }
  if (inputCode) {
    inputCode.value = suggestNextAccountCode(acc.type, acc.parentId);
  }

  const titleEl2 = document.getElementById('accountModalTitle');
  if (titleEl2) {
    const parentAcc = acc.parentId ? AppState.accounts.find(a => a.id === acc.parentId) : null;
    const parentInfo = parentAcc ? ` (فرزند <span style="color:var(--primary-color);">"${parentAcc.name}"</span>)` : ' (گروه اصلی)';
    titleEl2.innerHTML = `➕ افزودن سرفصل جدید در سطح <span style="color:var(--accent-color);font-weight:bold;">${acc.type}</span>${parentInfo}`;
  }

  selectedAccountId = id;
  renderAccountsTable();

  openAccountModal();
  if (inputCode) inputCode.focus();
}

function resetParentSelectionForNewAccount(e) {
  if (e) e.preventDefault();
  currentParentIdForNewAccount = null;
  openAddAccountRow();
}

function openAccountModal() {
  const overlay = document.getElementById('accountModalOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('active'), 10);
  }
}

function closeAccountModal() {
  const overlay = document.getElementById('accountModalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.style.display = 'none';
  }
}

function saveNewAccount() {
  const editIdStr = document.getElementById('newAccEditId')?.value;
  let code = document.getElementById('newAccCode')?.value?.trim();
  const name = document.getElementById('newAccName')?.value?.trim();
  const type = document.getElementById('newAccType')?.value;
  const nature = document.getElementById('newAccNature')?.value;
  const parentVal = document.getElementById('newAccParentId')?.value;
  const parentId = parentVal ? Number(parentVal) : null;

  if (!code || !name) { alert('کد حساب و عنوان الزامی است.'); return; }
  
  const settings = AppState.codingSettings || {
    detailLevelsCount: 3,
    groupCodeLength: 2,
    klCodeLength: 4,
    moeinCodeLength: 6,
    tafsili1Length: 6,
    tafsili2Length: 6,
    tafsili3Length: 6
  };
  
  let expectedLen = 0;
  if (type === 'گروه') expectedLen = settings.groupCodeLength;
  else if (type === 'کل') expectedLen = settings.klCodeLength;
  else if (type === 'معین') expectedLen = settings.moeinCodeLength;
  else if (type === 'تفصیلی ۱') expectedLen = settings.tafsili1Length;
  else if (type === 'تفصیلی ۲') expectedLen = settings.tafsili2Length;
  else if (type === 'تفصیلی ۳') expectedLen = settings.tafsili3Length;
  
  if (code.length < expectedLen) {
    code = code.padStart(expectedLen, '0');
  } else if (code.length > expectedLen) {
    alert(`خطا: طول کد حساب برای سطح "${type}" نمی‌تواند بیشتر از ${expectedLen} رقم باشد (کد وارد شده: ${code.length} رقم).`);
    return;
  }
  
  let savedId = null;
  if (editIdStr) {
    // Edit Mode
    const id = Number(editIdStr);
    if (AppState.accounts.some(a => a.id !== id && a.code === code && a.type === type)) {
      alert(`این کد حساب قبلاً در سطح "${type}" ثبت شده است.`);
      return;
    }
    const acc = AppState.accounts.find(a => a.id === id);
    if (acc) {
      acc.code = code;
      acc.name = name;
      acc.type = type;
      acc.nature = nature;
      acc.parentId = parentId;
      savedId = id;
    }
  } else {
    // Insert Mode
    if (AppState.accounts.some(a => a.code === code && a.type === type)) {
      alert(`این کد حساب قبلاً در سطح "${type}" ثبت شده است.`);
      return;
    }
    const newId = Date.now();
    AppState.accounts.push({ id: newId, code, name, type, nature, parentId });
    savedId = newId;
  }

  document.getElementById('newAccEditId').value = '';
  document.getElementById('newAccCode').value = '';
  document.getElementById('newAccName').value = '';
  closeAccountModal();
  
  if (savedId) {
    selectedAccountId = savedId;
    
    // Auto-expand all ancestors to make sure it's visible in the tree
    let current = AppState.accounts.find(a => a.id === savedId);
    while (current && current.parentId !== null) {
      expandedAccountIds.add(current.parentId);
      current = AppState.accounts.find(a => a.id === current.parentId);
    }
  }
  
  // Clear selection after save
  currentParentIdForNewAccount = null;

  renderAccountsTable();
  
  // Focus & smooth scroll to the newly created/edited account row
  if (savedId) {
    setTimeout(() => {
      const rowEl = document.getElementById(`acc-row-${savedId}`);
      if (rowEl) {
        rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        rowEl.style.transition = 'background-color 0.5s ease';
        rowEl.style.backgroundColor = 'rgba(56,189,248,0.25)';
        setTimeout(() => {
          rowEl.style.backgroundColor = '';
        }, 2000);
      }
    }, 150);
  }
  
  alert(`حساب "${code} - ${name}" با موفقیت ذخیره شد.`);
}

function deleteAccount(id) {
  if (confirm('آیا از حذف این حساب اطمینان دارید؟')) {
    AppState.accounts = AppState.accounts.filter(a => a.id !== id);
    renderAccountsTable();
  }
}

// Set of expanded floating account IDs
const expandedShenavarIds = new Set();
let currentShenavarParentIdForNewAccount = null;

function toggleShenavarExpand(shenId) {
  if (expandedShenavarIds.has(shenId)) {
    expandedShenavarIds.delete(shenId);
  } else {
    expandedShenavarIds.add(shenId);
  }
  renderShenavaarTable();
}

function handleShenavarTreeButtonClick(shenId) {
  const s = AppState.shenavars.find(x => x.id === shenId);
  if (!s) return;

  // Set the clicked row as the active selected parent row for floating account creation
  currentShenavarParentIdForNewAccount = shenId;

  const hasChildren = AppState.shenavars.some(child => child.parentId === s.id);
  if (hasChildren) {
    // Normal expand/collapse toggle
    toggleShenavarExpand(shenId);
  } else {
    // No children: Check level limit (max 3 levels)
    if (getShenavarLevel(s) >= 2) {
      alert('خطا: حداکثر تعداد سطوح مجاز برای حساب‌های شناور، ۳ سطح می‌باشد. امکان ایجاد سطح پایین‌تر از سطح ۳ وجود ندارد.');
      currentShenavarParentIdForNewAccount = null;
      renderShenavaarTable();
      return;
    }
    const parentLevelText = s.parentId ? 'فرعی' : 'اصلی';
    const childLevelText = s.parentId ? 'زیرمجموعه' : 'فرعی';

    const msg = `تا کنون برای این سرفصل شناور "${parentLevelText}" ، حساب شناور "${childLevelText}" ، ایجاد نشده است ، آیا مایلید برای آن حساب شناور "${childLevelText}" ایجاد کنید؟`;
    if (confirm(msg)) {
      openAddShenavarRow();
    } else {
      // Clear selection if cancelled
      currentShenavarParentIdForNewAccount = null;
      renderShenavaarTable();
    }
  }
}

function getShenavarLevel(s) {
  let level = 0;
  let curr = s;
  let visited = new Set();
  while (curr && curr.parentId && !visited.has(curr.id)) {
    visited.add(curr.id);
    curr = AppState.shenavars.find(x => x.id === curr.parentId);
    if (curr) level++;
    else break;
  }
  return level;
}

function isShenavarVisible(s) {
  let curr = s;
  let visited = new Set();
  while (curr && curr.parentId && !visited.has(curr.id)) {
    visited.add(curr.id);
    if (!expandedShenavarIds.has(curr.parentId)) return false;
    curr = AppState.shenavars.find(x => x.id === curr.parentId);
  }
  return true;
}

let shenavarSearchCode = '';
let shenavarSearchName = '';
let selectedShenavarId = null;

function filterShenavarGrid() {
  shenavarSearchCode = (document.getElementById('searchShenavarCode')?.value || '').trim();
  shenavarSearchName = (document.getElementById('searchShenavarName')?.value || '').trim();
  renderShenavaarTable();
}

function clearShenavarSearch() {
  const codeIn = document.getElementById('searchShenavarCode');
  const nameIn = document.getElementById('searchShenavarName');
  if (codeIn) codeIn.value = '';
  if (nameIn) nameIn.value = '';
  shenavarSearchCode = '';
  shenavarSearchName = '';
  renderShenavaarTable();
}

function handleShenavarExpandLevelChange(level) {
  expandedShenavarIds.clear();
  
  if (level === 'root') {
    // Collapsed all
  } else {
    // Expand all levels
    AppState.shenavars.forEach(s => {
      expandedShenavarIds.add(s.id);
    });
  }
  
  renderShenavaarTable();
}

function selectShenavarRow(id) {
  selectedShenavarId = id;
  currentShenavarParentIdForNewAccount = id;
  
  const s = AppState.shenavars.find(x => x.id === id);
  updateShenavarHierarchyLabel(s);
  
  renderShenavaarTable();
}

function updateShenavarHierarchyLabel(s) {
  const label = document.getElementById('shenavarHierarchyLabel');
  if (!label) return;
  
  if (!s) {
    label.innerHTML = `سطح شناور جاری: - / زنجیره: -`;
    return;
  }
  
  const chain = [];
  let curr = s;
  while (curr) {
    chain.unshift(`${curr.code} (${curr.name})`);
    curr = AppState.shenavars.find(x => x.id === curr.parentId);
  }
  
  const levelName = s.parentId ? 'زیرمجموعه' : 'شناور اصلی';
  const chainStr = chain.join(' / ');
  label.innerHTML = `سطح شناور جاری: <span style="color:var(--accent-color);">${levelName}</span> / زنجیره: <span style="color:var(--primary-color);">${chainStr}</span>`;
}

function isShenavarVisibleWithFilter(s, sortedShenavars) {
  if (!shenavarSearchCode && !shenavarSearchName) {
    return isShenavarVisible(s);
  }
  
  const codeMatch = !shenavarSearchCode || (s.code && s.code.toLowerCase().includes(shenavarSearchCode.toLowerCase()));
  const nameMatch = !shenavarSearchName || (s.name && s.name.toLowerCase().includes(shenavarSearchName.toLowerCase()));
  return codeMatch && nameMatch;
}

function renderShenavaarTable() {
  const tbody = document.getElementById('shenavaarTableBody');
  if (!tbody) return;

  const sortedShenavars = sortTreePreOrder(AppState.shenavars);
  const visibleShenavars = sortedShenavars.filter(s => isShenavarVisibleWithFilter(s, sortedShenavars));

  tbody.innerHTML = visibleShenavars.map(s => {
    const level = getShenavarLevel(s);
    const hasChildren = AppState.shenavars.some(child => child.parentId === s.id);
    const isExpanded = expandedShenavarIds.has(s.id);
    const isSelected = (s.id === selectedShenavarId);
    const selectedClass = isSelected ? 'selected-parent-row' : '';

    // Show tree toggle button (do not show '+' for leaf nodes at max level 3)
    const toggleBtnHtml = hasChildren
      ? `<button class="tree-toggle-btn ${isExpanded ? 'expanded' : ''}" onclick="event.stopPropagation(); handleShenavarTreeButtonClick(${s.id})">${isExpanded ? '-' : '+'}</button>`
      : (level < 2 ? `<button class="tree-toggle-btn" onclick="event.stopPropagation(); handleShenavarTreeButtonClick(${s.id})">+</button>` : '');

    const indentPx = level * 22;

    return `
      <tr class="tree-level-${Math.min(level, 3)} ${selectedClass}" onclick="selectShenavarRow(${s.id})" style="cursor:pointer;">
        <td style="text-align:center;vertical-align:middle;">${toggleBtnHtml}</td>
        <td><b>${s.code}</b></td>
        <td style="padding-right:${indentPx + 10}px;">
          ${level > 0 ? '<span style="color:var(--accent-color);margin-left:6px;">└─</span>' : ''}
          <b>${s.name}</b>
        </td>
        <td><span class="badge badge-success">${s.status}</span></td>
        <td>
          <button class="btn btn-outline" style="padding:3px 8px;color:var(--success-color);border-color:var(--success-color);" onclick="event.stopPropagation(); openSameLevelNewShenavar(${s.id})">➕ جدید</button>
          <button class="btn btn-outline" style="padding:3px 8px;" onclick="event.stopPropagation(); openEditShenavarRow(${s.id})">✏️ ویرایش</button>
          <button class="btn btn-outline" style="padding:3px 8px;color:red;" onclick="event.stopPropagation(); deleteShenavar(${s.id})">🗑️ حذف</button>
        </td>
      </tr>
    `;
  }).join('');
}

function suggestNextShenavarCode(parentId) {
  const siblings = AppState.shenavars.filter(s => s.parentId === parentId);
  if (siblings.length > 0) {
    const codes = siblings.map(s => {
      const parts = s.code.split('-');
      const lastPart = parts[parts.length - 1];
      return parseInt(lastPart, 10);
    }).filter(num => !isNaN(num));
    
    if (codes.length > 0) {
      const maxVal = Math.max(...codes);
      const nextVal = maxVal + 1;
      
      const sampleCode = siblings[0].code;
      const sampleParts = sampleCode.split('-');
      const lastPart = sampleParts[sampleParts.length - 1];
      
      const prefixParts = sampleParts.slice(0, -1);
      const formattedLast = String(nextVal).padStart(lastPart.length, '0');
      return [...prefixParts, formattedLast].join('-');
    }
  }
  
  if (parentId) {
    const parent = AppState.shenavars.find(s => s.id === parentId);
    if (parent) {
      return parent.code + '-01'; // e.g. 'SH-101' -> 'SH-101-01'
    }
  }
  
  // Default root level code calculation
  const roots = AppState.shenavars.filter(s => s.parentId === null);
  if (roots.length > 0) {
    const codes = roots.map(s => {
      const parts = s.code.split('-');
      return parseInt(parts[parts.length - 1], 10);
    }).filter(num => !isNaN(num));
    const maxVal = Math.max(...codes);
    return 'SH-' + (maxVal + 1);
  }
  return 'SH-101';
}

function openShenavarModal() {
  const overlay = document.getElementById('shenavarModalOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('active'), 10);
  }
}

function closeShenavarModal() {
  const overlay = document.getElementById('shenavarModalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.style.display = 'none';
  }
}

function openAddShenavarRow() {
  const editIdIn = document.getElementById('newShenEditId');
  if (editIdIn) editIdIn.value = '';

  const selectParent = document.getElementById('newShenParentId');
  const inputCode = document.getElementById('newShenCode');
  const inputName = document.getElementById('newShenName');
  if (inputName) inputName.value = '';
  
  let targetParentId = null;
  
  if (currentShenavarParentIdForNewAccount !== null) {
    const parentShen = AppState.shenavars.find(s => s.id === currentShenavarParentIdForNewAccount);
    if (parentShen) {
      // Enforce 3-level max hierarchy for floating accounts
      if (getShenavarLevel(parentShen) >= 2) {
        alert('خطا: حداکثر تعداد سطوح مجاز برای حساب‌های شناور، ۳ سطح می‌باشد. امکان ایجاد سطح پایین‌تر از سطح ۳ وجود ندارد.');
        currentShenavarParentIdForNewAccount = null;
        renderShenavaarTable();
        return;
      }
      targetParentId = parentShen.id;
    }
  }
  
  if (selectParent) {
    selectParent.innerHTML = `<option value="${targetParentId || ''}">${targetParentId ? targetParentId : 'بدون والد'}</option>`;
    selectParent.value = targetParentId || '';
  }
  
  if (inputCode) {
    inputCode.value = suggestNextShenavarCode(targetParentId);
  }
  
  const titleEl = document.getElementById('shenavarModalTitle');
  if (titleEl) {
    if (currentShenavarParentIdForNewAccount !== null) {
      const parentShen = AppState.shenavars.find(s => s.id === currentShenavarParentIdForNewAccount);
      const parentName = parentShen ? parentShen.name : '';
      titleEl.innerHTML = `➕ افزودن حساب شناور فرزند <span style="color:var(--primary-color);">"${parentName}"</span>`;
    } else {
      titleEl.textContent = '➕ افزودن حساب شناور جدید (شناور اصلی)';
    }
  }

  renderShenavaarTable();
  openShenavarModal();
  setTimeout(() => { if (document.getElementById('newShenName')) document.getElementById('newShenName').focus(); }, 200);
}

function openSameLevelNewShenavar(id) {
  const s = AppState.shenavars.find(a => a.id === id);
  if (!s) return;

  currentShenavarParentIdForNewAccount = s.parentId;

  const editIdIn = document.getElementById('newShenEditId');
  if (editIdIn) editIdIn.value = '';

  const selectParent = document.getElementById('newShenParentId');
  const inputCode = document.getElementById('newShenCode');
  const inputName = document.getElementById('newShenName');
  if (inputName) inputName.value = '';

  if (selectParent) {
    selectParent.innerHTML = `<option value="${s.parentId || ''}">${s.parentId ? s.parentId : 'بدون والد'}</option>`;
    selectParent.value = s.parentId || '';
  }
  if (inputCode) {
    inputCode.value = suggestNextShenavarCode(s.parentId);
  }

  const titleEl = document.getElementById('shenavarModalTitle');
  if (titleEl) {
    const parentShen = s.parentId ? AppState.shenavars.find(a => a.id === s.parentId) : null;
    const parentInfo = parentShen ? ` (فرزند <span style="color:var(--primary-color);">"${parentShen.name}"</span>)` : ' (شناور اصلی)';
    titleEl.innerHTML = `➕ افزودن حساب شناور جدید همتا ${parentInfo}`;
  }

  selectedShenavarId = id;
  renderShenavaarTable();

  openShenavarModal();
  setTimeout(() => { if (inputCode) inputCode.focus(); }, 200);
}

function openEditShenavarRow(id) {
  const s = AppState.shenavars.find(x => x.id === id);
  if (!s) return;
  
  const titleEl = document.getElementById('shenavarModalTitle');
  if (titleEl) titleEl.innerHTML = `✏️ ویرایش حساب شناور <span style="color:var(--accent-color);">(کد: ${s.code})</span>`;
  
  document.getElementById('newShenEditId').value = s.id;
  document.getElementById('newShenCode').value = s.code;
  document.getElementById('newShenName').value = s.name;
  document.getElementById('newShenParentId').value = s.parentId || '';
  
  openShenavarModal();
  setTimeout(() => { const n = document.getElementById('newShenName'); if (n) n.focus(); }, 200);
}

function resetShenavarParentSelectionForNewAccount(e) {
  if (e) e.preventDefault();
  currentShenavarParentIdForNewAccount = null;
  openAddShenavarRow();
}

function saveNewShenavar() {
  const editIdStr = document.getElementById('newShenEditId')?.value;
  const code = document.getElementById('newShenCode')?.value?.trim();
  const name = document.getElementById('newShenName')?.value?.trim();
  const parentVal = document.getElementById('newShenParentId')?.value;
  const parentId = parentVal ? Number(parentVal) : null;

  if (!code || !name) { alert('کد و عنوان شناور الزامی است.'); return; }
  
  if (editIdStr) {
    // Edit Mode
    const id = Number(editIdStr);
    const s = AppState.shenavars.find(x => x.id === id);
    if (s) {
      s.code = code;
      s.name = name;
      s.parentId = parentId;
    }
  } else {
    // Insert Mode
    if (parentId !== null) {
      const parentShen = AppState.shenavars.find(s => s.id === parentId);
      if (parentShen && getShenavarLevel(parentShen) >= 2) {
        alert('خطا: حداکثر تعداد سطوح مجاز برای حساب‌های شناور، ۳ سطح می‌باشد. امکان ایجاد سطح پایین‌تر از سطح ۳ وجود ندارد.');
        return;
      }
    }
    if (AppState.shenavars.find(s => s.code === code)) { alert('این کد شناور قبلاً ثبت شده است.'); return; }
    AppState.shenavars.push({ id: Date.now(), code, name, parentId, status: 'فعال' });
  }

  document.getElementById('newShenEditId').value = '';
  document.getElementById('newShenCode').value = '';
  document.getElementById('newShenName').value = '';
  closeShenavarModal();
  
  // Auto-expand parent so the new child is visible
  if (parentId) {
    expandedShenavarIds.add(parentId);
  }
  
  // Clear selection after save
  currentShenavarParentIdForNewAccount = null;

  renderShenavaarTable();
  alert(`حساب شناور "${code} - ${name}" با موفقیت ذخیره شد.`);
}

function deleteShenavar(id) {
  if (confirm('آیا از حذف این حساب شناور اطمینان دارید؟')) {
    AppState.shenavars = AppState.shenavars.filter(s => s.id !== id);
    renderShenavaarTable();
  }
}

// Sanad 1 (list)
let selectedSanadId = null;

function getCurrentBakhshId() {
  // If we are in Hesabdari main form or voucher editor:
  if (AppState.currentForm === 'form-hesabdari-main' || AppState.currentForm === 'form-sanad2' || AppState.currentModule === 'accounting') {
    return 1; // 1 = حسابداری (Accounting)
  }
  if (AppState.currentForm === 'form-sales-invoice' || AppState.currentForm === 'form-purchase-invoice') {
    return 2; // 2 = خرید و فروش
  }
  if (AppState.currentForm === 'form-products' || AppState.currentForm === 'form-warehouses' || AppState.currentForm === 'form-cardex' || AppState.currentModule === 'inventory') {
    return 3; // 3 = انبارداری
  }
  if (AppState.currentForm === 'form-personnel' || AppState.currentForm === 'form-payroll' || AppState.currentModule === 'payroll') {
    return 4; // 4 = حقوق و دستمزد
  }
  if (AppState.currentForm === 'form-moghayerat-banki' || AppState.currentModule === 'treasury') {
    return 5; // 5 = خزانه‌داری
  }

  const mapping = {
    'accounting': 1,
    'purchase-sales': 2,
    'inventory': 3,
    'payroll': 4,
    'treasury': 5,
    'budget': 6
  };
  return mapping[AppState.currentModule] || 1;
}

function selectSanadRow(id) {
  selectedSanadId = id;
  renderSanadListTable();
}

function getJalaliDayOfYear(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return 1;
  const parts = dateStr.split('/');
  if (parts.length < 3) return 1;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) return 1;
  
  let dayOfYear = 0;
  for (let m = 1; m < month; m++) {
    if (m <= 6) {
      dayOfYear += 31;
    } else {
      dayOfYear += 30;
    }
  }
  dayOfYear += day;
  return dayOfYear;
}

function clearSanadListSearches() {
  const ids = [
    'searchSanadId', 'searchSanadDay', 'searchSanadDate',
    'searchSanadDesc', 'searchSanadDebit', 'searchSanadCredit',
    'searchSanadTaraz', 'searchSanadBakhsh', 'searchSanadStatus'
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderSanadListTable();
}

function renderSanadListTable() {
  const tbody = document.getElementById('sanadListTable');
  if (!tbody) return;

  // Read search values from header textboxes
  const qId        = (document.getElementById('searchSanadId')?.value || '').trim().toLowerCase();
  const qDay       = (document.getElementById('searchSanadDay')?.value || '').trim().toLowerCase();
  const qDate      = (document.getElementById('searchSanadDate')?.value || '').trim().toLowerCase();
  const qDesc      = (document.getElementById('searchSanadDesc')?.value || '').trim().toLowerCase();
  const qDebitRaw  = (document.getElementById('searchSanadDebit')?.value || '').trim();
  const qCreditRaw = (document.getElementById('searchSanadCredit')?.value || '').trim();
  const qTaraz     = (document.getElementById('searchSanadTaraz')?.value || '').trim().toLowerCase();
  const qBakhsh    = (document.getElementById('searchSanadBakhsh')?.value || '').trim().toLowerCase();
  const qStatus    = (document.getElementById('searchSanadStatus')?.value || '').trim().toLowerCase();

  // Multi-column combined filtering with prefix support (> < = *)
  const filtered = AppState.sanads.filter(s => {
    const bakhshObj = AppState.bakhsh.find(b => b.id === s.bakhshId);
    const bakhshName = bakhshObj ? bakhshObj.name : 'حسابداری';
    
    if (!s.dayOfYear) {
      s.dayOfYear = getJalaliDayOfYear(s.date);
    }

    const isBalanced = (s.debit === s.credit && s.status !== 'نامتوازن' && s.status !== 'بدهکار' && s.status !== 'بستانکار');
    const tarazText = isBalanced ? 'تراز' : ((s.debit > s.credit || s.status === 'بدهکار') ? 'بدهکار' : 'بستانکار');

    if (qId && !String(s.id).toLowerCase().includes(qId.replace('#', ''))) return false;
    if (qDay && !String(s.dayOfYear).toLowerCase().includes(qDay)) return false;
    if (qDate && !String(s.date).toLowerCase().includes(qDate)) return false;
    if (qDesc && !String(s.desc).toLowerCase().includes(qDesc)) return false;
    
    // Support prefix search (> < = *) for Debit and Credit
    if (qDebitRaw && !matchAmount(Number(s.debit || 0), qDebitRaw)) return false;
    if (qCreditRaw && !matchAmount(Number(s.credit || 0), qCreditRaw)) return false;

    if (qTaraz && !tarazText.toLowerCase().includes(qTaraz)) return false;
    if (qBakhsh && !bakhshName.toLowerCase().includes(qBakhsh)) return false;
    if (qStatus && !String(s.status).toLowerCase().includes(qStatus)) return false;

    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:24px; color:var(--text-muted); font-weight:bold;">هیچ سندی با مشخصات واردشده یافت نشد.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const isSelected = (s.id === selectedSanadId);
    const selectedClass = isSelected ? 'selected-parent-row' : '';
    const bakhshObj = AppState.bakhsh.find(b => b.id === s.bakhshId);
    const bakhshName = bakhshObj ? bakhshObj.name : 'حسابداری';

    return `
      <tr class="${selectedClass}" onclick="selectSanadRow(${s.id})" style="cursor:pointer;">
        <td><b>#${s.id}</b></td>
        <td style="text-align:center;"><b>${s.dayOfYear}</b></td>
        <td>${s.date}</td>
        <td>${s.desc}</td>
        <td>${s.debit.toLocaleString()}</td>
        <td>${s.credit.toLocaleString()}</td>
        <td>
          ${(s.debit === s.credit && s.status !== 'نامتوازن' && s.status !== 'بدهکار' && s.status !== 'بستانکار')
            ? `<span class="badge badge-success">تراز ✅</span>`
            : `<span class="badge" style="background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3); font-weight:bold;">${(s.debit > s.credit || s.status === 'بدهکار') ? 'بدهکار' : 'بستانکار'} ❌</span>`
          }
        </td>
        <td><span class="badge" style="background:rgba(168,85,247,0.15);color:#c084fc;border:1px solid rgba(168,85,247,0.3);font-weight:bold;">${bakhshName}</span></td>
        <td><span class="badge badge-primary">${s.status}</span></td>
        <td>
          <button class="btn btn-outline" style="padding:3px 8px;" onclick="event.stopPropagation(); editSanad(${s.id})">✏️ ویرایش</button>
          <button class="btn btn-outline" style="padding:3px 8px;color:red;" onclick="event.stopPropagation(); deleteSanad(${s.id})">🗑️ حذف</button>
        </td>
      </tr>
    `;
  }).join('');
}

function deleteSanad(id) {
  const s = AppState.sanads.find(x => x.id === id);
  if (s && s.bakhshId && s.bakhshId !== getCurrentBakhshId()) {
    const creatorBakhsh = AppState.bakhsh.find(b => b.id === s.bakhshId);
    const bName = creatorBakhsh ? creatorBakhsh.name : 'بخش دیگر';
    alert(`این سند به‌طور خودکار توسط بخش «${bName}» صادر شده است و ویرایش یا حذف آن فقط از طریق همان بخش مجاز می‌باشد تا در زنجیره اطلاعات خطایی پیش نیاد.`);
    return;
  }
  if (confirm(`حذف سند #${id}؟`)) {
    AppState.sanads = AppState.sanads.filter(s => s.id !== id);
    if (selectedSanadId === id) selectedSanadId = null;
    renderSanadListTable();
  }
}

function editSanad(id, fromMogh = false) {
  AppState.openedFromMoghayerat = fromMogh;
  AppState.tempAttachments = null; // Clear attachments draft
  initVoucherAttachments(); // Guarantees AppState.sanadAttachments is initialized
  const s = AppState.sanads.find(x => x.id === id);
  if (s && s.bakhshId && s.bakhshId !== getCurrentBakhshId()) {
    const creatorBakhsh = AppState.bakhsh.find(b => b.id === s.bakhshId);
    const bName = creatorBakhsh ? creatorBakhsh.name : 'بخش دیگر';
    alert(`این سند به‌طور خودکار توسط بخش «${bName}» صادر شده است و ویرایش یا حذف آن فقط از طریق همان بخش مجاز می‌باشد تا در زنجیره اطلاعات خطایی پیش نیاد.`);
    return;
  }
  showForm('form-sanad2');
  document.getElementById('sanadNumberInput').value = id;
  document.getElementById('sanadNumberInput').readOnly = true; // Protect voucher number during edit
  document.getElementById('sanadDateInput').value = s.date;
  document.getElementById('sanadDescInput').value = s.desc;

  // Render lines with the voucher's values from details database
  AppState.voucherDetails = AppState.voucherDetails || {};
  if (AppState.voucherDetails[id]) {
    AppState.sanadLines = JSON.parse(JSON.stringify(AppState.voucherDetails[id]));
  } else {
    AppState.sanadLines = [
      { account: '110101', desc: `آرتیکل بدهکار - بابت ${s.desc}`, debit: s.debit, credit: 0, txNo: '', txDate: '' },
      { account: '210101', desc: `آرتیکل بستانکار - بابت ${s.desc}`, debit: 0, credit: s.credit, txNo: '', txDate: '' }
    ];
  }

  // Store original state for edited voucher
  originalSanadState = {
    isNew: false,
    id: id,
    date: s.date,
    desc: s.desc,
    lines: JSON.parse(JSON.stringify(AppState.sanadLines)),
    attachments: JSON.parse(JSON.stringify(AppState.sanadAttachments[id] || []))
  };

  renderSanadEditorLines();
}

function autoFormatDate(input) {
  if (!input) return;
  let v = input.value;
  // Convert Persian & Arabic digits to standard English 0-9
  v = v.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
       .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  
  // Keep digits only
  let digits = v.replace(/[^0-9]/g, '');
  if (digits.length > 8) digits = digits.slice(0, 8);
  
  let formatted = digits;
  if (digits.length >= 5) {
    formatted = digits.slice(0, 4) + '/' + digits.slice(4, 6);
    if (digits.length >= 7) {
      formatted += '/' + digits.slice(6, 8);
    }
  }
  
  input.value = formatted;
}

function printVouchers() {
  const modal = document.getElementById('printVouchersModal');
  if (!modal) return;

  const activeYear = String(SessionState.year || SessionState.fiscalYear || AppState.fiscalYear || '1403');
  const titleEl = document.getElementById('printVouchersModalTitle');
  if (titleEl) {
    titleEl.innerHTML = `🖨️ تنظیمات و محدوده چاپ اسناد حسابداری سال جاری : ${activeYear}`;
  }

  // Filter sanads strictly belonging to the active current fiscal year
  const currentYearSanads = AppState.sanads.filter(s => {
    const sYear = (s.date || '').slice(0, 4);
    return !sYear || sYear === activeYear || (s.fiscalYear && String(s.fiscalYear) === activeYear);
  });

  // Set default values based on current active year sanads database
  const sortedIds = currentYearSanads.map(s => s.id).sort((a, b) => a - b);
  const minId = sortedIds.length > 0 ? sortedIds[0] : 101;
  const maxId = sortedIds.length > 0 ? sortedIds[sortedIds.length - 1] : 105;

  const sortedDates = currentYearSanads.map(s => s.date).sort();
  const minDate = sortedDates.length > 0 ? sortedDates[0] : `${activeYear}/01/01`;
  const maxDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : `${activeYear}/12/29`;

  const fromNoEl = document.getElementById('printFromSanadNo');
  const toNoEl = document.getElementById('printToSanadNo');
  const fromDateEl = document.getElementById('printFromDate');
  const toDateEl = document.getElementById('printToDate');

  if (fromNoEl) fromNoEl.value = minId;
  if (toNoEl) toNoEl.value = maxId;
  if (fromDateEl) fromDateEl.value = minDate;
  if (toDateEl) toDateEl.value = maxDate;

  // Set default radio: By Number
  const radioNo = document.getElementById('printRangeByNo');
  if (radioNo) radioNo.checked = true;
  togglePrintRangeInputs();
  togglePrintFontSettingsState();

  modal.style.display = 'flex';
}

function closePrintVouchersModal() {
  const modal = document.getElementById('printVouchersModal');
  if (modal) modal.style.display = 'none';
}

function togglePrintFontSettingsState() {
  const chk = document.getElementById('printUseDefaultFonts');
  const container = document.getElementById('printCustomFontsContainer');
  if (!chk || !container) return;
  if (chk.checked) {
    container.style.opacity = '0.4';
    container.style.pointerEvents = 'none';
  } else {
    container.style.opacity = '1';
    container.style.pointerEvents = 'auto';
  }
}

function openPrintDateCal(inputId, btnEl) {
  const radioDate = document.getElementById('printRangeByDate');
  if (radioDate) {
    radioDate.checked = true;
    togglePrintRangeInputs();
  }
  setTimeout(() => {
    PersianCal.open(inputId, btnEl);
  }, 10);
}

function selectPrintRangeByNo() {
  const radioNo = document.getElementById('printRangeByNo');
  if (radioNo && !radioNo.checked) {
    radioNo.checked = true;
    togglePrintRangeInputs();
  }
}

function onFocusPrintSanadNo() {
  selectPrintRangeByNo();
  const combo = document.getElementById('printSanadNumType');
  if (combo && combo.value === 'dayNo') {
    combo.value = 'bothNo';
    updatePrintNumTypeState();
  }
}

function onFocusPrintDayNo() {
  selectPrintRangeByNo();
  const combo = document.getElementById('printSanadNumType');
  if (combo && combo.value === 'sanadNo') {
    combo.value = 'bothNo';
    updatePrintNumTypeState();
  }
}

function updatePrintNumTypeState() {
  const isByNo = document.getElementById('printRangeByNo')?.checked;
  const numTypeSelect = document.getElementById('printSanadNumType');
  const numType = numTypeSelect?.value || 'sanadNo';

  const rowSanad = document.getElementById('rowSanadNoInputs');
  const rowDay = document.getElementById('rowDayNoInputs');

  const fromSanad = document.getElementById('printFromSanadNo');
  const toSanad = document.getElementById('printToSanadNo');
  const fromDay = document.getElementById('printFromDayNo');
  const toDay = document.getElementById('printToDayNo');

  // Keep all number inputs enabled so manual typing is always allowed
  if (fromSanad) fromSanad.disabled = false;
  if (toSanad) toSanad.disabled = false;
  if (fromDay) fromDay.disabled = false;
  if (toDay) toDay.disabled = false;

  if (!isByNo) {
    if (numTypeSelect) numTypeSelect.disabled = true;
    if (rowSanad) rowSanad.style.opacity = '0.4';
    if (rowDay) rowDay.style.opacity = '0.4';
    return;
  }

  if (numTypeSelect) numTypeSelect.disabled = false;

  if (numType === 'sanadNo') {
    // Item 1: Sanad No row highlighted
    if (rowSanad) rowSanad.style.opacity = '1';
    if (rowDay) rowDay.style.opacity = '0.65';
  } else if (numType === 'dayNo') {
    // Item 2: Day No row highlighted
    if (rowSanad) rowSanad.style.opacity = '0.65';
    if (rowDay) rowDay.style.opacity = '1';
  } else if (numType === 'bothNo') {
    // Item 3: Both rows highlighted
    if (rowSanad) rowSanad.style.opacity = '1';
    if (rowDay) rowDay.style.opacity = '1';
  }
}

function togglePrintRangeInputs() {
  const isByNo = document.getElementById('printRangeByNo')?.checked;
  const containerNo = document.getElementById('printRangeNoContainer');
  const containerDate = document.getElementById('printRangeDateContainer');

  const fromDate = document.getElementById('printFromDate');
  const toDate = document.getElementById('printToDate');

  if (isByNo) {
    if (containerNo) containerNo.style.opacity = '1';
    if (containerDate) containerDate.style.opacity = '0.4';

    if (fromDate) fromDate.disabled = true;
    if (toDate) toDate.disabled = true;
  } else {
    if (containerNo) containerNo.style.opacity = '0.4';
    if (containerDate) containerDate.style.opacity = '1';

    if (fromDate) fromDate.disabled = false;
    if (toDate) toDate.disabled = false;
  }

  updatePrintNumTypeState();
}

function numberToPersianWords(num) {
  num = parseInt(num, 10);
  if (isNaN(num) || num === 0) return 'صفر ریال';

  const yekan = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
  const dahgan = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
  const dahYek = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
  const sadgan = ['', 'یکصد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];

  const levels = ['', ' هزار', ' میلیون', ' میلیارد', ' تریلیون'];

  function convertThreeDigits(n) {
    if (n === 0) return '';
    let parts = [];
    const s = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const y = n % 10;

    if (s > 0) parts.push(sadgan[s]);

    if (d === 1) {
      parts.push(dahYek[y]);
    } else {
      if (d > 1) parts.push(dahgan[d]);
      if (y > 0) parts.push(yekan[y]);
    }
    return parts.join(' و ');
  }

  let resultParts = [];
  let levelIdx = 0;
  let temp = Math.abs(num);

  while (temp > 0) {
    const chunk = temp % 1000;
    if (chunk > 0) {
      const chunkWords = convertThreeDigits(chunk);
      if (chunkWords) {
        const levelName = levels[levelIdx] || '';
        resultParts.unshift(chunkWords + levelName);
      }
    }
    temp = Math.floor(temp / 1000);
    levelIdx++;
  }

  const result = resultParts.join(' و ') + ' ریال';
  return (num < 0 ? 'منفی ' : '') + result;
}

function submitPrintVouchersRange() {
  const isByNo = document.getElementById('printRangeByNo')?.checked;
  const levelComboValue = document.getElementById('printAccountLevelCombo')?.value || 'group_kol_moin';

  let selectedVouchers = [];

  // Always restrict to current fiscal year only
  const activeYear = String(SessionState.year || SessionState.fiscalYear || AppState.fiscalYear || '1403');
  const yearStart = `${activeYear}/01/01`;
  const yearEnd = `${activeYear}/12/29`;

  if (isByNo) {
    const numType = document.getElementById('printSanadNumType')?.value || 'sanadNo';
    const fromSanad = parseInt(document.getElementById('printFromSanadNo')?.value || '0', 10);
    const toSanad = parseInt(document.getElementById('printToSanadNo')?.value || '999999', 10);
    const fromDay = parseInt(document.getElementById('printFromDayNo')?.value || '0', 10);
    const toDay = parseInt(document.getElementById('printToDayNo')?.value || '999999', 10);

    selectedVouchers = AppState.sanads.filter(s => {
      // First: restrict to current year only
      const sDate = (s.date || '');
      const sYear = sDate.slice(0, 4);
      if (sYear && sYear !== activeYear) return false;

      if (!s.dayOfYear) s.dayOfYear = getJalaliDayOfYear(s.date);

      if (numType === 'sanadNo') {
        return s.id >= fromSanad && s.id <= toSanad;
      } else if (numType === 'dayNo') {
        return s.dayOfYear >= fromDay && s.dayOfYear <= toDay;
      } else if (numType === 'bothNo') {
        return (s.id >= fromSanad && s.id <= toSanad) && (s.dayOfYear >= fromDay && s.dayOfYear <= toDay);
      }
      return true;
    });
  } else {
    const fromDateRaw = (document.getElementById('printFromDate')?.value || '').trim();
    const toDateRaw = (document.getElementById('printToDate')?.value || '').trim();
    // Clamp date range to current fiscal year boundaries
    const fromDate = fromDateRaw < yearStart ? yearStart : fromDateRaw;
    const toDate = toDateRaw > yearEnd ? yearEnd : toDateRaw;
    selectedVouchers = AppState.sanads.filter(s => {
      const sYear = (s.date || '').slice(0, 4);
      if (sYear && sYear !== activeYear) return false;
      return s.date >= fromDate && s.date <= toDate;
    });
  }

  if (selectedVouchers.length === 0) {
    alert('هیچ سندی در محدوده تعیین‌شده یافت نشد.');
    return;
  }

  closePrintVouchersModal();

  // Open multi-voucher Print Preview window
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  AppState.voucherDetails = AppState.voucherDetails || {};

  const compCode = SessionState.company?.code;
  const compDetails = AppState.companyDetails ? AppState.companyDetails[compCode] : null;
  const companyName = SessionState.company?.name || 'شرکت نمونه نگار';
  const logoSrc = (compDetails && compDetails.logo) ? compDetails.logo : (typeof currentCompLogoBase64 !== 'undefined' ? currentCompLogoBase64 : '');

  let logoHtml = '';
  if (logoSrc) {
    logoHtml = `<img src="${logoSrc}" alt="آرم شرکت" style="max-height:55px; max-width:130px; object-fit:contain;" />`;
  } else {
    logoHtml = `
      <div style="display:flex; align-items:center; gap:8px;">
        <div style="width:48px; height:48px; border-radius:8px; background:linear-gradient(135deg, #0284c7, #0369a1); color:#fff; display:flex; align-items:center; justify-content:center; font-size:24px; box-shadow:0 2px 6px rgba(0,0,0,0.12);">🏢</div>
      </div>
    `;
  }

  const numType = document.getElementById('printSanadNumType')?.value || 'sanadNo';
  const numberType = document.getElementById('printNumberTypeCombo')?.value || 'fa';

  const vouchersHtml = selectedVouchers.map((s, idx) => {
    if (!s.dayOfYear) {
      s.dayOfYear = getJalaliDayOfYear(s.date);
    }

    let numDisplay = '';
    if (numType === 'sanadNo') {
      numDisplay = `${s.id}`;
    } else if (numType === 'dayNo') {
      numDisplay = `${s.dayOfYear || ''}`;
    } else if (numType === 'bothNo') {
      numDisplay = `${s.id} / ${s.dayOfYear || ''}`;
    } else {
      numDisplay = `${s.id}`;
    }

    const numDisplayFormatted = formatNumberForPrint(numDisplay, numberType);
    const dateFormatted = formatNumberForPrint(s.date, numberType);

    const linesRows = buildVoucherLevelRows(s, levelComboValue, numberType);

    const totalWords = numberToPersianWords(s.debit || 0);
    const totalWordsFormatted = numberType === 'fa' ? toPersianDigitsStr(totalWords) : totalWords;
    const voucherCurrentPage = 1;
    const voucherTotalPages = 1;
    const pageStr = formatNumberForPrint(`${voucherCurrentPage} از ${voucherTotalPages}`, numberType);

    const debitFormatted = formatNumberForPrint(Number(s.debit).toLocaleString(), numberType);
    const creditFormatted = formatNumberForPrint(Number(s.credit).toLocaleString(), numberType);

    return `
      <div class="voucher-page">
        <div class="voucher-header">
          <div class="header-right">
            ${logoHtml}
          </div>
          <div class="header-center">
            <div class="company-title">${companyName}</div>
            <div class="doc-title">سند حسابداری</div>
          </div>
          <div class="header-left doc-info">
            <div>شماره سند: <b>${numDisplayFormatted}</b></div>
            <div>تاریخ: <b>${dateFormatted}</b></div>
            <div>وضعیت: <b>${s.status}</b></div>
            <div>صفحه: <b>${pageStr}</b></div>
          </div>
        </div>

        <table class="main-table">
          <thead>
            <tr>
              <th style="width:3%; text-align:center;">ردیف</th>
              <th style="width:7%; text-align:center;">کد حساب</th>
              <th style="width:15%; text-align:center;">عنوان حساب</th>
              <th style="width:33%; text-align:center;">شرح آرتیکل</th>
              <th style="width:14%; text-align:center; white-space:nowrap;">مبلغ جزء (ریال)</th>
              <th style="width:14%; text-align:center; white-space:nowrap;">بدهکار (ریال)</th>
              <th style="width:14%; text-align:center; white-space:nowrap;">بستانکار (ریال)</th>
            </tr>
          </thead>
          <tbody>
            ${linesRows}
          </tbody>
          <tfoot>
            <tr style="font-weight:bold; background:#f8fafc;">
              <td colspan="4" style="text-align:right;">
                جمع کل سند: <span style="color:#0284c7; margin-right:6px; font-size:11px;">(${totalWordsFormatted})</span>
              </td>
              <td style="text-align:right; white-space:nowrap;"></td>
              <td style="text-align:right; white-space:nowrap;">${debitFormatted}</td>
              <td style="text-align:right; white-space:nowrap;">${creditFormatted}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Independent Description Box below Total Amount line -->
        <div class="voucher-desc-box" style="border:1px solid #94a3b8; border-radius:6px; padding:10px 14px; margin-top:12px; margin-bottom:24px; background:#f8fafc; font-size:12px; line-height:1.6; text-align:right;">
          <span style="font-weight:bold;">شرح سند:</span>
          <span style="margin-right:6px;">${s.desc || ''}</span>
        </div>

        <div class="signatures">
          <div class="sig-box">تنظیم‌کننده</div>
          <div class="sig-box">تاییدکننده</div>
          <div class="sig-box">حسابدار ارشد</div>
          <div class="sig-box">مدیر مالی</div>
        </div>
      </div>
    `;
  }).join('<div class="page-break"></div>');

  let customFontsCss = '';
  const useDefaultFonts = document.getElementById('printUseDefaultFonts')?.checked;
  if (!useDefaultFonts) {
    const compFam = document.getElementById('fontCompFamily')?.value || 'Tahoma';
    const compSz = document.getElementById('fontCompSize')?.value || '16px';
    const compCol = document.getElementById('fontCompColor')?.value || '#0f172a';

    const titleFam = document.getElementById('fontTitleFamily')?.value || 'Tahoma';
    const titleSz = document.getElementById('fontTitleSize')?.value || '18px';
    const titleCol = document.getElementById('fontTitleColor')?.value || '#0284c7';

    const thFam = document.getElementById('fontThFamily')?.value || 'Tahoma';
    const thSz = document.getElementById('fontThSize')?.value || '12px';
    const thCol = document.getElementById('fontThColor')?.value || '#0f172a';

    const tdFam = document.getElementById('fontTdFamily')?.value || 'Tahoma';
    const tdSz = document.getElementById('fontTdSize')?.value || '11px';
    const tdCol = document.getElementById('fontTdColor')?.value || '#0f172a';

    const descFam = document.getElementById('fontDescFamily')?.value || 'Tahoma';
    const descSz = document.getElementById('fontDescSize')?.value || '11px';
    const descCol = document.getElementById('fontDescColor')?.value || '#0f172a';

    const infoFam = document.getElementById('fontInfoFamily')?.value || 'Tahoma';
    const infoSz = document.getElementById('fontInfoSize')?.value || '11px';
    const infoCol = document.getElementById('fontInfoColor')?.value || '#0f172a';

    const sigFam = document.getElementById('fontSigFamily')?.value || 'Tahoma';
    const sigSz = document.getElementById('fontSigSize')?.value || '11px';
    const sigCol = document.getElementById('fontSigColor')?.value || '#0f172a';

    customFontsCss = `
        .voucher-header .company-title { font-family: '${compFam}', Tahoma, sans-serif !important; font-size: ${compSz} !important; color: ${compCol} !important; }
        .voucher-header .doc-title { font-family: '${titleFam}', Tahoma, sans-serif !important; font-size: ${titleSz} !important; color: ${titleCol} !important; }
        .main-table th { font-family: '${thFam}', Tahoma, sans-serif !important; font-size: ${thSz} !important; color: ${thCol} !important; }
        .main-table td { font-family: '${tdFam}', Tahoma, sans-serif !important; font-size: ${tdSz} !important; color: ${tdCol} !important; }
        .voucher-desc-box { font-family: '${descFam}', Tahoma, sans-serif !important; font-size: ${descSz} !important; color: ${descCol} !important; }
        .header-left.doc-info { font-family: '${infoFam}', Tahoma, sans-serif !important; font-size: ${infoSz} !important; color: ${infoCol} !important; }
        .signatures .sig-box { font-family: '${sigFam}', Tahoma, sans-serif !important; font-size: ${sigSz} !important; color: ${sigCol} !important; }
    `;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <title>پیش‌نمایش چاپ اسناد حسابداری</title>
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        ${customFontsCss}
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          font-family: Tahoma, 'IRANSans', Arial, sans-serif;
          color: #0f172a;
          background: #e2e8f0;
          font-size: 12px;
          line-height: 1.5;
        }
        .no-print-bar {
          background: #0f172a;
          color: #fff;
          padding: 12px 18px;
          border-radius: 0 0 10px 10px;
          margin-bottom: 0;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.35);
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        #printableArea {
          flex: 1 1 auto;
          overflow-y: auto;
          padding: 20px;
          box-sizing: border-box;
        }
        .toolbar-title { font-size: 14px; font-weight: bold; color: #38bdf8; display: flex; align-items: center; gap: 6px; }
        .toolbar-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
        .toolbar-group { display: flex; align-items: center; gap: 6px; font-size: 12px; }
        .toolbar-group label { color: #cbd5e1; white-space: nowrap; }
        .toolbar-select { background: #1e293b; color: #f8fafc; border: 1px solid #475569; border-radius: 6px; padding: 5px 8px; font-size: 12px; font-family: inherit; cursor: pointer; }
        .toolbar-select:focus { border-color: #38bdf8; outline: none; }
        .no-print-btn { border: none; padding: 6px 14px; border-radius: 6px; font-weight: bold; cursor: pointer; font-family: inherit; font-size: 12px; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
        .excel-btn { background: #16a34a; color: #fff; }
        .excel-btn:hover { background: #15803d; }
        .word-btn { background: #2563eb; color: #fff; }
        .word-btn:hover { background: #1d4ed8; }
        .pdf-btn { background: #dc2626; color: #fff; }
        .pdf-btn:hover { background: #b91c1c; }
        .print-btn { background: #0284c7; color: #fff; }
        .print-btn:hover { background: #0369a1; }
        
        .voucher-page { border: 1px solid #cbd5e1; border-radius: 8px; padding: 24px; margin-bottom: 30px; background: #fff; page-break-inside: avoid; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .voucher-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
        .header-right { width: 30%; display: flex; align-items: center; justify-content: flex-start; }
        .header-center { width: 40%; text-align: center; }
        .header-left { width: 30%; text-align: left; }
        .company-title { font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 4px; }
        .doc-title { font-size: 18px; font-weight: bold; color: #0284c7; }
        .main-table { width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 12px; margin-bottom: 20px; }
        .main-table th, .main-table td { border: 1px solid #94a3b8; padding: 5px 3px; text-align: right; word-wrap: break-word; overflow-wrap: break-word; }
        .main-table th { background-color: #e2e8f0 !important; font-weight: bold; text-align: center !important; }
        .main-table td:nth-child(5), .main-table td:nth-child(6), .main-table td:nth-child(7) { white-space: nowrap !important; text-align: right; direction: ltr; font-size: 11px; }
        .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding: 0 10px; }
        .sig-box { text-align: center; width: 22%; border-top: 1px solid #0f172a; padding-top: 6px; font-weight: bold; font-size: 11px; }
        .page-break { page-break-after: always; height: 0; }
        
        /* Black & White Mode Styles */
        body.bw-mode #printableArea {
          filter: grayscale(100%) contrast(120%) !important;
        }
        body.bw-mode #printableArea * {
          color: #000000 !important;
          border-color: #000000 !important;
        }
        body.bw-mode .main-table th {
          background-color: #e5e5e5 !important;
          background: #e5e5e5 !important;
          color: #000000 !important;
        }
        body.bw-mode .company-title,
        body.bw-mode .doc-title,
        body.bw-mode .total-words,
        body.bw-mode span {
          color: #000000 !important;
        }
        body.bw-mode .voucher-desc-box {
          background-color: #f8f8f8 !important;
          background: #f8f8f8 !important;
          border-color: #000000 !important;
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body.bw-mode #printableArea {
            filter: grayscale(100%) contrast(120%) !important;
          }
          html, body {
            height: auto !important;
            overflow: visible !important;
            display: block !important;
            padding: 0 !important;
            background: #fff !important;
          }
          .no-print-bar { display: none !important; }
          #printableArea {
            overflow: visible !important;
            padding: 0 !important;
          }
          .voucher-page { border: none !important; padding: 0 !important; margin-bottom: 0 !important; box-shadow: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="no-print-bar">
        <div class="toolbar-title">
          🖨️ پیش‌نمایش چاپ ${selectedVouchers.length} سند حسابداری انتخاب‌شده
        </div>

        <div class="toolbar-controls">
          <!-- Paper Settings -->
          <div class="toolbar-group">
            <label>📐 کاغذ:</label>
            <select id="pageSizeSelect" class="toolbar-select" onchange="changePageSize(this.value)">
              <option value="A4" selected>A4</option>
              <option value="A5">A5</option>
              <option value="Letter">Letter</option>
            </select>
          </div>

          <div class="toolbar-group">
            <label>🔄 جهت:</label>
            <select id="pageOrientationSelect" class="toolbar-select" onchange="changePageOrientation(this.value)">
              <option value="portrait" selected>عمودی</option>
              <option value="landscape">افقی</option>
            </select>
          </div>

          <div class="toolbar-group">
            <label>📏 حاشیه:</label>
            <select id="pageMarginSelect" class="toolbar-select" onchange="changePageMargin(this.value)">
              <option value="normal" selected>عادی</option>
              <option value="narrow">باریک</option>
              <option value="zero">بدون حاشیه</option>
            </select>
          </div>

          <!-- Color Mode Combo -->
          <div class="toolbar-group">
            <label>🎨 حالت رنگ:</label>
            <select id="pageColorModeSelect" class="toolbar-select" onchange="changePageColorMode(this.value)">
              <option value="color" selected>رنگی</option>
              <option value="bw">سیاه و سفید</option>
            </select>
          </div>

          <!-- Exports & Print -->
          <button class="no-print-btn excel-btn" onclick="exportToExcel()">📊 خروجی اکسل</button>
          <button class="no-print-btn word-btn" onclick="exportToWord()">📝 خروجی Word</button>
          <button class="no-print-btn pdf-btn" onclick="exportToPDF()">📄 ذخیره به صورت PDF</button>
          <button class="no-print-btn print-btn" onclick="window.print()">🖨️ تنظیمات چاپگر و چاپ</button>
        </div>
      </div>

      <div id="printableArea">
        ${vouchersHtml}
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();

  // Attach interactive toolbar functions directly onto printWindow object to guarantee execution
  printWindow.changePageSize = function(size) {
    let styleEl = printWindow.document.getElementById('dynamicPageStyle');
    if (!styleEl) {
      styleEl = printWindow.document.createElement('style');
      styleEl.id = 'dynamicPageStyle';
      printWindow.document.head.appendChild(styleEl);
    }
    const orientation = printWindow.document.getElementById('pageOrientationSelect')?.value || 'portrait';
    const margin = printWindow.document.getElementById('pageMarginSelect')?.value || 'normal';
    let marginVal = '15mm';
    if (margin === 'narrow') marginVal = '5mm';
    if (margin === 'zero') marginVal = '0mm';
    styleEl.innerHTML = '@page { size: ' + size + ' ' + orientation + '; margin: ' + marginVal + '; }';
  };

  printWindow.changePageOrientation = function(orientation) {
    const size = printWindow.document.getElementById('pageSizeSelect')?.value || 'A4';
    printWindow.changePageSize(size);
  };

  printWindow.changePageMargin = function(margin) {
    const size = printWindow.document.getElementById('pageSizeSelect')?.value || 'A4';
    printWindow.changePageSize(size);
  };

  printWindow.changePageColorMode = function(mode) {
    if (mode === 'bw') {
      printWindow.document.body.classList.add('bw-mode');
    } else {
      printWindow.document.body.classList.remove('bw-mode');
    }
  };

  printWindow.exportToPDF = function() {
    const oldTitle = printWindow.document.title;
    printWindow.document.title = 'اسناد_حسابداری_' + new Date().toISOString().slice(0, 10);
    printWindow.print();
    setTimeout(function() { printWindow.document.title = oldTitle; }, 1000);
  };

  printWindow.exportToWord = function() {
    const content = printWindow.document.getElementById('printableArea').innerHTML;
    const isBw = printWindow.document.body.classList.contains('bw-mode');
    const thBg = isBw ? '#e5e5e5' : '#e2e8f0';
    const titleColor = isBw ? '#000000' : '#0284c7';
    
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40' dir='rtl'>" +
      "<head><meta charset='utf-8'><title>اسناد حسابداری</title>" +
      "<style>" +
      "body { font-family: Tahoma, Arial, sans-serif; direction: rtl; padding: 20px; background: #fff; color: #0f172a; }\n" +
      ".voucher-page { border: 1px solid #cbd5e1; border-radius: 8px; padding: 24px; margin-bottom: 30px; background: #fff; page-break-inside: avoid; }\n" +
      ".voucher-header { display: table; width: 100%; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }\n" +
      ".header-right { display: table-cell; width: 30%; text-align: right; vertical-align: middle; }\n" +
      ".header-center { display: table-cell; width: 40%; text-align: center; vertical-align: middle; }\n" +
      ".header-left { display: table-cell; width: 30%; text-align: left; vertical-align: middle; }\n" +
      ".company-title { font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 4px; }\n" +
      ".doc-title { font-size: 18px; font-weight: bold; color: " + titleColor + " !important; }\n" +
      ".main-table { width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 12px; margin-bottom: 20px; }\n" +
      ".main-table th, .main-table td { border: 1px solid #94a3b8; padding: 6px 4px; text-align: right; word-wrap: break-word; }\n" +
      ".main-table th { background-color: " + thBg + " !important; font-weight: bold; text-align: center !important; }\n" +
      ".main-table td:nth-child(3) { text-align: center !important; }\n" +
      ".main-table td:nth-child(5), .main-table td:nth-child(6), .main-table td:nth-child(7) { white-space: nowrap !important; text-align: right; direction: ltr; font-size: 11px; }\n" +
      ".voucher-desc-box { border: 1px solid #94a3b8; border-radius: 6px; padding: 10px 14px; margin-top: 12px; margin-bottom: 24px; background: #f8fafc; font-size: 12px; text-align: right; }\n" +
      ".signatures { display: table; width: 100%; margin-top: 40px; }\n" +
      ".sig-box { display: table-cell; text-align: center; width: 25%; border-top: 1px solid #0f172a; padding-top: 6px; font-weight: bold; font-size: 11px; }\n" +
      "</style></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;

    const blob = new Blob(['\ufeff' + sourceHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = printWindow.document.createElement('a');
    a.href = url;
    a.download = 'اسناد_حسابداری.doc';
    printWindow.document.body.appendChild(a);
    a.click();
    printWindow.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  printWindow.exportToExcel = function() {
    const content = printWindow.document.getElementById('printableArea').innerHTML;
    const isBw = printWindow.document.body.classList.contains('bw-mode');
    const thBg = isBw ? '#e5e5e5' : '#e2e8f0';
    const titleColor = isBw ? '#000000' : '#0284c7';

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40' dir='rtl'>" +
      "<head><meta charset='utf-8'><title>اسناد حسابداری</title>" +
      "<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>" +
      "<x:Name>اسناد حسابداری</x:Name>" +
      "<x:WorksheetOptions><x:DisplayRightToLeft/></x:WorksheetOptions>" +
      "</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->" +
      "<style>" +
      "body { font-family: Tahoma, Arial, sans-serif; direction: rtl; padding: 15px; background: #fff; }\n" +
      ".main-table { border-collapse: collapse; width: 100%; margin-top: 10px; margin-bottom: 20px; }\n" +
      ".main-table th, .main-table td { border: 1px solid #94a3b8; padding: 6px 10px; text-align: right; }\n" +
      ".main-table th { background-color: " + thBg + " !important; font-weight: bold; text-align: center !important; }\n" +
      ".main-table td:nth-child(3) { text-align: center !important; }\n" +
      ".company-title { font-size: 16px; font-weight: bold; }\n" +
      ".doc-title { font-size: 18px; font-weight: bold; color: " + titleColor + " !important; }\n" +
      ".signatures { display: table; width: 100%; margin-top: 30px; }\n" +
      ".sig-box { display: table-cell; text-align: center; width: 25%; border-top: 1px solid #000; padding-top: 5px; }\n" +
      "</style></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;

    const blob = new Blob(['\ufeff' + sourceHTML], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = printWindow.document.createElement('a');
    a.href = url;
    a.download = 'اسناد_حسابداری.xls';
    printWindow.document.body.appendChild(a);
    a.click();
    printWindow.document.body.removeChild(a);
  };
}

function toPersianDigitsStr(str) {
  if (str === null || str === undefined) return '';
  const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(str).replace(/[0-9]/g, w => faDigits[parseInt(w, 10)]);
}

function formatNumberForPrint(val, numberType) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (numberType === 'fa') {
    return toPersianDigitsStr(str);
  }
  return str;
}

function buildVoucherLevelRows(s, levelComboValue, numberType = 'fa') {
  AppState.voucherDetails = AppState.voucherDetails || {};
  const targetLines = AppState.voucherDetails[s.id] || [
    { account: '110102', desc: `آرتیکل بدهکار - بابت ${s.desc}`, debit: s.debit, credit: 0 },
    { account: '310101', desc: `آرتیکل بستانکار - بابت ${s.desc}`, debit: 0, credit: s.credit }
  ];

  const enriched = targetLines.map(line => {
    const acc = AppState.accounts.find(a => a.code === line.account);
    let moinCode = line.account;
    let moinName = acc ? acc.name : `حساب معین ${line.account}`;
    let kolCode = moinCode.length >= 4 ? moinCode.slice(0, 4) : moinCode;
    let kolName = 'حساب کل';
    let groupCode = moinCode.length >= 2 ? moinCode.slice(0, 2) : moinCode;
    let groupName = 'گروه حساب‌ها';

    if (acc) {
      const parentKol = acc.parentId ? AppState.accounts.find(x => x.id === acc.parentId) : null;
      if (parentKol) {
        kolCode = parentKol.code;
        kolName = parentKol.name;
        const parentGroup = parentKol.parentId ? AppState.accounts.find(x => x.id === parentKol.parentId) : null;
        if (parentGroup) {
          groupCode = parentGroup.code;
          groupName = parentGroup.name;
        }
      }
    }

    const shen = AppState.shenavars ? AppState.shenavars.find(sh => sh.code === line.shenavarCode) : null;
    const tafsilCode = shen ? shen.code : '';
    const tafsilName = shen ? shen.name : '';

    return {
      ...line,
      moinCode,
      moinName,
      kolCode,
      kolName,
      groupCode,
      groupName,
      tafsilCode,
      tafsilName
    };
  });

  const rows = [];
  let rowIdx = 1;

  if (levelComboValue === 'group') {
    const groupsMap = {};
    enriched.forEach(l => {
      if (!groupsMap[l.groupCode]) {
        groupsMap[l.groupCode] = { code: l.groupCode, name: l.groupName, debit: 0, credit: 0 };
      }
      groupsMap[l.groupCode].debit += Number(l.debit || 0);
      groupsMap[l.groupCode].credit += Number(l.credit || 0);
    });

    Object.values(groupsMap).forEach(g => {
      rows.push(`
        <tr>
          <td style="text-align:center;">${formatNumberForPrint(rowIdx++, numberType)}</td>
          <td style="text-align:center;">${formatNumberForPrint(g.code, numberType)}</td>
          <td style="text-align:center;">${g.name}</td>
          <td>حساب‌های گروه ${g.name}</td>
          <td style="text-align:right;"></td>
          <td style="text-align:right;">${g.debit > 0 ? formatNumberForPrint(g.debit.toLocaleString(), numberType) : formatNumberForPrint(0, numberType)}</td>
          <td style="text-align:right;">${g.credit > 0 ? formatNumberForPrint(g.credit.toLocaleString(), numberType) : formatNumberForPrint(0, numberType)}</td>
        </tr>
      `);
    });

  } else if (levelComboValue === 'kol') {
    const kolsMap = {};
    enriched.forEach(l => {
      if (!kolsMap[l.kolCode]) {
        kolsMap[l.kolCode] = { code: l.kolCode, name: l.kolName, debit: 0, credit: 0 };
      }
      kolsMap[l.kolCode].debit += Number(l.debit || 0);
      kolsMap[l.kolCode].credit += Number(l.credit || 0);
    });

    Object.values(kolsMap).forEach(k => {
      rows.push(`
        <tr>
          <td style="text-align:center;">${formatNumberForPrint(rowIdx++, numberType)}</td>
          <td style="text-align:center;">${formatNumberForPrint(k.code, numberType)}</td>
          <td style="text-align:center;">${k.name}</td>
          <td>حساب کل ${k.name}</td>
          <td style="text-align:right;"></td>
          <td style="text-align:right;">${k.debit > 0 ? formatNumberForPrint(k.debit.toLocaleString(), numberType) : formatNumberForPrint(0, numberType)}</td>
          <td style="text-align:right;">${k.credit > 0 ? formatNumberForPrint(k.credit.toLocaleString(), numberType) : formatNumberForPrint(0, numberType)}</td>
        </tr>
      `);
    });

  } else if (levelComboValue === 'group_kol') {
    const groupsMap = {};
    enriched.forEach(l => {
      if (!groupsMap[l.groupCode]) {
        groupsMap[l.groupCode] = { code: l.groupCode, name: l.groupName, debit: 0, credit: 0, kols: {} };
      }
      groupsMap[l.groupCode].debit += Number(l.debit || 0);
      groupsMap[l.groupCode].credit += Number(l.credit || 0);

      if (!groupsMap[l.groupCode].kols[l.kolCode]) {
        groupsMap[l.groupCode].kols[l.kolCode] = { code: l.kolCode, name: l.kolName, debit: 0, credit: 0 };
      }
      groupsMap[l.groupCode].kols[l.kolCode].debit += Number(l.debit || 0);
      groupsMap[l.groupCode].kols[l.kolCode].credit += Number(l.credit || 0);
    });

    Object.values(groupsMap).forEach(g => {
      rows.push(`
        <tr style="background:#f1f5f9; font-weight:bold;">
          <td style="text-align:center;">${formatNumberForPrint(rowIdx++, numberType)}</td>
          <td style="text-align:center;">${formatNumberForPrint(g.code, numberType)}</td>
          <td style="text-align:center;">${g.name}</td>
          <td>جمع گروه ${g.name}</td>
          <td style="text-align:right;"></td>
          <td style="text-align:right;">${g.debit > 0 ? formatNumberForPrint(g.debit.toLocaleString(), numberType) : formatNumberForPrint(0, numberType)}</td>
          <td style="text-align:right;">${g.credit > 0 ? formatNumberForPrint(g.credit.toLocaleString(), numberType) : formatNumberForPrint(0, numberType)}</td>
        </tr>
      `);
      Object.values(g.kols).forEach(k => {
        const subAmt = k.debit > 0 ? k.debit : k.credit;
        rows.push(`
          <tr>
            <td style="text-align:center;">${formatNumberForPrint(rowIdx++, numberType)}</td>
            <td style="text-align:center;">${formatNumberForPrint(k.code, numberType)}</td>
            <td style="text-align:center;">${k.name}</td>
            <td>حساب کل ${k.name}</td>
            <td style="text-align:right;">${formatNumberForPrint(Number(subAmt || 0).toLocaleString(), numberType)}</td>
            <td style="text-align:right;"></td>
            <td style="text-align:right;"></td>
          </tr>
        `);
      });
    });

  } else if (levelComboValue === 'group_kol_moin') {
    const groupsMap = {};
    enriched.forEach(l => {
      if (!groupsMap[l.groupCode]) {
        groupsMap[l.groupCode] = { code: l.groupCode, name: l.groupName, debit: 0, credit: 0, kols: {} };
      }
      groupsMap[l.groupCode].debit += Number(l.debit || 0);
      groupsMap[l.groupCode].credit += Number(l.credit || 0);

      if (!groupsMap[l.groupCode].kols[l.kolCode]) {
        groupsMap[l.groupCode].kols[l.kolCode] = { code: l.kolCode, name: l.kolName, debit: 0, credit: 0, moins: [] };
      }
      groupsMap[l.groupCode].kols[l.kolCode].debit += Number(l.debit || 0);
      groupsMap[l.groupCode].kols[l.kolCode].credit += Number(l.credit || 0);
      groupsMap[l.groupCode].kols[l.kolCode].moins.push(l);
    });

    Object.values(groupsMap).forEach(g => {
      rows.push(`
        <tr style="background:#f1f5f9; font-weight:bold;">
          <td style="text-align:center;">${formatNumberForPrint(rowIdx++, numberType)}</td>
          <td style="text-align:center;">${formatNumberForPrint(g.code, numberType)}</td>
          <td style="text-align:center;">${g.name}</td>
          <td>جمع گروه ${g.name}</td>
          <td style="text-align:right;"></td>
          <td style="text-align:right;">${g.debit > 0 ? formatNumberForPrint(g.debit.toLocaleString(), numberType) : formatNumberForPrint(0, numberType)}</td>
          <td style="text-align:right;">${g.credit > 0 ? formatNumberForPrint(g.credit.toLocaleString(), numberType) : formatNumberForPrint(0, numberType)}</td>
        </tr>
      `);
      Object.values(g.kols).forEach(k => {
        const kolSubAmt = k.debit > 0 ? k.debit : k.credit;
        rows.push(`
          <tr style="font-weight:bold; background:rgba(241,245,249,0.4);">
            <td style="text-align:center;">${formatNumberForPrint(rowIdx++, numberType)}</td>
            <td style="text-align:center;">${formatNumberForPrint(k.code, numberType)}</td>
            <td style="text-align:center;">${k.name}</td>
            <td>جمع کل ${k.name}</td>
            <td style="text-align:right;">${formatNumberForPrint(Number(kolSubAmt || 0).toLocaleString(), numberType)}</td>
            <td style="text-align:right;"></td>
            <td style="text-align:right;"></td>
          </tr>
        `);
        k.moins.forEach(m => {
          const moinSubAmt = Number(m.debit || 0) > 0 ? Number(m.debit) : Number(m.credit || 0);
          rows.push(`
            <tr>
              <td style="text-align:center;">${formatNumberForPrint(rowIdx++, numberType)}</td>
              <td style="text-align:center;">${formatNumberForPrint(m.moinCode, numberType)}</td>
              <td style="text-align:center;">${m.moinName}</td>
              <td>${m.desc || ''}</td>
              <td style="text-align:right;">${formatNumberForPrint(Number(moinSubAmt || 0).toLocaleString(), numberType)}</td>
              <td style="text-align:right;"></td>
              <td style="text-align:right;"></td>
            </tr>
          `);
        });
      });
    });

  } else if (levelComboValue === 'kol_moin') {
    const kolsMap = {};
    enriched.forEach(l => {
      if (!kolsMap[l.kolCode]) {
        kolsMap[l.kolCode] = { code: l.kolCode, name: l.kolName, debit: 0, credit: 0, moins: [] };
      }
      kolsMap[l.kolCode].debit += Number(l.debit || 0);
      kolsMap[l.kolCode].credit += Number(l.credit || 0);
      kolsMap[l.kolCode].moins.push(l);
    });

    Object.values(kolsMap).forEach(k => {
      rows.push(`
        <tr style="background:#f1f5f9; font-weight:bold;">
          <td style="text-align:center;">${formatNumberForPrint(rowIdx++, numberType)}</td>
          <td style="text-align:center;">${formatNumberForPrint(k.code, numberType)}</td>
          <td style="text-align:center;">${k.name}</td>
          <td>جمع کل ${k.name}</td>
          <td style="text-align:right;"></td>
          <td style="text-align:right;">${k.debit > 0 ? formatNumberForPrint(k.debit.toLocaleString(), numberType) : formatNumberForPrint(0, numberType)}</td>
          <td style="text-align:right;">${k.credit > 0 ? formatNumberForPrint(k.credit.toLocaleString(), numberType) : formatNumberForPrint(0, numberType)}</td>
        </tr>
      `);
      k.moins.forEach(m => {
        const moinSubAmt = Number(m.debit || 0) > 0 ? Number(m.debit) : Number(m.credit || 0);
        rows.push(`
          <tr>
            <td style="text-align:center;">${formatNumberForPrint(rowIdx++, numberType)}</td>
            <td style="text-align:center;">${formatNumberForPrint(m.moinCode, numberType)}</td>
            <td style="text-align:center;">${m.moinName}</td>
            <td>${m.desc || ''}</td>
            <td style="text-align:right;">${formatNumberForPrint(Number(moinSubAmt || 0).toLocaleString(), numberType)}</td>
            <td style="text-align:right;"></td>
            <td style="text-align:right;"></td>
          </tr>
        `);
      });
    });

  } else if (levelComboValue === 'kol_moin_tafsil') {
    const kolsMap = {};
    enriched.forEach(l => {
      if (!kolsMap[l.kolCode]) {
        kolsMap[l.kolCode] = { code: l.kolCode, name: l.kolName, debit: 0, credit: 0, moins: {} };
      }
      kolsMap[l.kolCode].debit += Number(l.debit || 0);
      kolsMap[l.kolCode].credit += Number(l.credit || 0);

      if (!kolsMap[l.kolCode].moins[l.moinCode]) {
        kolsMap[l.kolCode].moins[l.moinCode] = { code: l.moinCode, name: l.moinName, debit: 0, credit: 0, tafsils: [] };
      }
      kolsMap[l.kolCode].moins[l.moinCode].debit += Number(l.debit || 0);
      kolsMap[l.kolCode].moins[l.moinCode].credit += Number(l.credit || 0);
      kolsMap[l.kolCode].moins[l.moinCode].tafsils.push(l);
    });

    Object.values(kolsMap).forEach(k => {
      rows.push(`
        <tr style="background:#f1f5f9; font-weight:bold;">
          <td style="text-align:center;">${formatNumberForPrint(rowIdx++, numberType)}</td>
          <td style="text-align:center;">${formatNumberForPrint(k.code, numberType)}</td>
          <td style="text-align:center;">${k.name}</td>
          <td>جمع کل ${k.name}</td>
          <td style="text-align:right;"></td>
          <td style="text-align:right;">${k.debit > 0 ? formatNumberForPrint(k.debit.toLocaleString(), numberType) : formatNumberForPrint(0, numberType)}</td>
          <td style="text-align:right;">${k.credit > 0 ? formatNumberForPrint(k.credit.toLocaleString(), numberType) : formatNumberForPrint(0, numberType)}</td>
        </tr>
      `);
      Object.values(k.moins).forEach(m => {
        const moinSubAmt = m.debit > 0 ? m.debit : m.credit;
        rows.push(`
          <tr style="font-weight:bold; background:rgba(241,245,249,0.4);">
            <td style="text-align:center;">${formatNumberForPrint(rowIdx++, numberType)}</td>
            <td style="text-align:center;">${formatNumberForPrint(m.code, numberType)}</td>
            <td style="text-align:center;">${m.name}</td>
            <td>جمع معین ${m.name}</td>
            <td style="text-align:right;">${formatNumberForPrint(Number(moinSubAmt || 0).toLocaleString(), numberType)}</td>
            <td style="text-align:right;"></td>
            <td style="text-align:right;"></td>
          </tr>
        `);
        m.tafsils.forEach(t => {
          const tafsilSubAmt = Number(t.debit || 0) > 0 ? Number(t.debit) : Number(t.credit || 0);
          const fullCode = t.tafsilCode ? `${t.moinCode}/${t.tafsilCode}` : t.moinCode;
          const fullTitle = t.tafsilName ? `${t.tafsilName}` : t.moinName;
          rows.push(`
            <tr>
              <td style="text-align:center;">${formatNumberForPrint(rowIdx++, numberType)}</td>
              <td style="text-align:center;">${formatNumberForPrint(fullCode, numberType)}</td>
              <td style="text-align:center;">${fullTitle}</td>
              <td>${t.desc || ''}</td>
              <td style="text-align:right;">${formatNumberForPrint(Number(tafsilSubAmt || 0).toLocaleString(), numberType)}</td>
              <td style="text-align:right;"></td>
              <td style="text-align:right;"></td>
            </tr>
          `);
        });
      });
    });
  }

  return rows.join('');
}

function printJournalLedger() {
  const modal = document.getElementById('printJournalModal');
  if (!modal) return;

  const activeYear = String(SessionState.year || SessionState.fiscalYear || AppState.fiscalYear || '1403');
  const titleEl = document.getElementById('printJournalModalTitle');
  if (titleEl) {
    titleEl.innerHTML = `🖨️ تنظیمات و محدوده چاپ دفتر روزنامه سال جاری : ${activeYear}`;
  }

  // Set default values from current year sanads
  const currentYearSanads = AppState.sanads.filter(s => {
    const sYear = (s.date || '').slice(0, 4);
    return !sYear || sYear === activeYear;
  });

  const sortedIds = currentYearSanads.map(s => s.id).sort((a, b) => a - b);
  const minId = sortedIds.length > 0 ? sortedIds[0] : 101;
  const maxId = sortedIds.length > 0 ? sortedIds[sortedIds.length - 1] : 999;

  const sortedDates = currentYearSanads.map(s => s.date).sort();
  const minDate = sortedDates.length > 0 ? sortedDates[0] : `${activeYear}/01/01`;
  const maxDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : `${activeYear}/12/29`;

  const fromNoEl = document.getElementById('printJrnFromSanadNo');
  const toNoEl = document.getElementById('printJrnToSanadNo');
  const fromDateEl = document.getElementById('printJrnFromDate');
  const toDateEl = document.getElementById('printJrnToDate');

  if (fromNoEl) fromNoEl.value = minId;
  if (toNoEl) toNoEl.value = maxId;
  if (fromDateEl) fromDateEl.value = minDate;
  if (toDateEl) toDateEl.value = maxDate;

  // Set default radio
  const radioNo = document.getElementById('printJrnRangeByNo');
  if (radioNo) radioNo.checked = true;
  togglePrintJournalRangeInputs();
  togglePrintJournalFontState();

  modal.style.display = 'flex';
}

function closePrintJournalModal() {
  const modal = document.getElementById('printJournalModal');
  if (modal) modal.style.display = 'none';
}

function togglePrintJournalRangeInputs() {
  const isByNo = document.getElementById('printJrnRangeByNo')?.checked;
  const noContainer = document.getElementById('printJrnRangeNoContainer');
  const dateContainer = document.getElementById('printJrnRangeDateContainer');
  if (noContainer) { noContainer.style.opacity = isByNo ? '1' : '0.4'; noContainer.style.pointerEvents = isByNo ? 'auto' : 'none'; }
  if (dateContainer) { dateContainer.style.opacity = isByNo ? '0.4' : '1'; dateContainer.style.pointerEvents = isByNo ? 'none' : 'auto'; }
}

function togglePrintJournalFontState() {
  const useDefault = document.getElementById('printJrnUseDefaultFonts')?.checked;
  const container = document.getElementById('printJrnFontsContainer');
  if (container) { container.style.opacity = useDefault ? '0.4' : '1'; container.style.pointerEvents = useDefault ? 'none' : 'auto'; }
}

function submitPrintJournalRange() {
  const isByNo = document.getElementById('printJrnRangeByNo')?.checked;
  const activeYear = String(SessionState.year || SessionState.fiscalYear || AppState.fiscalYear || '1403');
  const yearStart = `${activeYear}/01/01`;
  const yearEnd = `${activeYear}/12/29`;

  let selectedSanads = [];

  if (isByNo) {
    const numType = document.getElementById('printJrnNumType')?.value || 'sanadNo';
    const fromSanad = parseInt(document.getElementById('printJrnFromSanadNo')?.value || '0', 10);
    const toSanad = parseInt(document.getElementById('printJrnToSanadNo')?.value || '999999', 10);
    const fromDay = parseInt(document.getElementById('printJrnFromDayNo')?.value || '0', 10);
    const toDay = parseInt(document.getElementById('printJrnToDayNo')?.value || '999999', 10);
    selectedSanads = AppState.sanads.filter(s => {
      const sYear = (s.date || '').slice(0, 4);
      if (sYear && sYear !== activeYear) return false;
      if (!s.dayOfYear) s.dayOfYear = getJalaliDayOfYear(s.date);
      if (numType === 'sanadNo') return s.id >= fromSanad && s.id <= toSanad;
      if (numType === 'dayNo') return s.dayOfYear >= fromDay && s.dayOfYear <= toDay;
      if (numType === 'bothNo') return (s.id >= fromSanad && s.id <= toSanad) && (s.dayOfYear >= fromDay && s.dayOfYear <= toDay);
      return true;
    });
  } else {
    const fromDateRaw = (document.getElementById('printJrnFromDate')?.value || '').trim();
    const toDateRaw = (document.getElementById('printJrnToDate')?.value || '').trim();
    const fromDate = fromDateRaw < yearStart ? yearStart : fromDateRaw;
    const toDate = toDateRaw > yearEnd ? yearEnd : toDateRaw;
    selectedSanads = AppState.sanads.filter(s => {
      const sYear = (s.date || '').slice(0, 4);
      if (sYear && sYear !== activeYear) return false;
      return s.date >= fromDate && s.date <= toDate;
    });
  }

  if (selectedSanads.length === 0) {
    alert('هیچ سندی در محدوده تعیین‌شده یافت نشد.');
    return;
  }

  closePrintJournalModal();

  // Read settings
  const pageSize = document.getElementById('printJrnPageSize')?.value || 'A4';
  const orientation = document.getElementById('printJrnPageOrientation')?.value || 'landscape';
  const colorMode = document.getElementById('printJrnColorMode')?.value || 'color';
  const numberType = document.getElementById('printJrnNumberType')?.value || 'fa';
  const pageMargin = document.getElementById('printJrnPageMargin')?.value || '10mm';
  const useDefaultFonts = document.getElementById('printJrnUseDefaultFonts')?.checked !== false;

  // Column visibility
  const showRow        = document.getElementById('jrnColRow')?.checked !== false;
  const showSanadNo    = document.getElementById('jrnColSanadNo')?.checked !== false;
  const showDayNo      = document.getElementById('jrnColDayNo')?.checked !== false;
  const showDate       = document.getElementById('jrnColDate')?.checked !== false;
  const showStatus     = document.getElementById('jrnColStatus')?.checked !== false;
  const showDebit      = document.getElementById('jrnColDebit')?.checked !== false;
  const showCredit     = document.getElementById('jrnColCredit')?.checked !== false;
  const showCombined   = document.getElementById('jrnColCombined')?.checked === true;
  const showVoucherDesc= document.getElementById('jrnColVoucherDesc')?.checked === true;

  // Font settings
  const compF  = useDefaultFonts ? 'Tahoma' : (document.getElementById('jrnFontCompFamily')?.value || 'Tahoma');
  const compS  = useDefaultFonts ? '16px'   : (document.getElementById('jrnFontCompSize')?.value   || '16px');
  const compC  = useDefaultFonts ? '#0f172a': (document.getElementById('jrnFontCompColor')?.value  || '#0f172a');
  const titleF = useDefaultFonts ? 'Tahoma' : (document.getElementById('jrnFontTitleFamily')?.value|| 'Tahoma');
  const titleS = useDefaultFonts ? '18px'   : (document.getElementById('jrnFontTitleSize')?.value  || '18px');
  const titleC = useDefaultFonts ? '#0284c7': (document.getElementById('jrnFontTitleColor')?.value || '#0284c7');
  const thF    = useDefaultFonts ? 'Tahoma' : (document.getElementById('jrnFontThFamily')?.value   || 'Tahoma');
  const thS    = useDefaultFonts ? '12px'   : (document.getElementById('jrnFontThSize')?.value     || '12px');
  const thC    = useDefaultFonts ? '#0f172a': (document.getElementById('jrnFontThColor')?.value    || '#0f172a');
  const tdF    = useDefaultFonts ? 'Tahoma' : (document.getElementById('jrnFontTdFamily')?.value   || 'Tahoma');
  const tdS    = useDefaultFonts ? '11px'   : (document.getElementById('jrnFontTdSize')?.value     || '11px');
  const tdC    = useDefaultFonts ? '#0f172a': (document.getElementById('jrnFontTdColor')?.value    || '#0f172a');
  const totF   = useDefaultFonts ? 'Tahoma' : (document.getElementById('jrnFontTotalFamily')?.value|| 'Tahoma');
  const totS   = useDefaultFonts ? '11px'   : (document.getElementById('jrnFontTotalSize')?.value  || '11px');
  const totC   = useDefaultFonts ? '#0f172a': (document.getElementById('jrnFontTotalColor')?.value || '#0f172a');

  const isBw = colorMode === 'bw';
  const headerBg  = isBw ? '#e5e5e5' : '#e2e8f0';
  const subTotBg  = isBw ? '#f0f0f0' : '#f0f9ff';
  const grandBg   = isBw ? '#d8d8d8' : '#dbeafe';
  const titleColor= isBw ? '#000000' : titleC;

  // Helper: get account name from code
  const getAccName = (code) => {
    const acc = AppState.accounts ? AppState.accounts.find(a => a.code === String(code)) : null;
    return acc ? acc.name : (code || '');
  };

  // Company info
  const compCode    = SessionState.company?.code;
  const compDetails = AppState.companyDetails ? AppState.companyDetails[compCode] : null;
  const companyName = SessionState.company?.name || 'شرکت نمونه نگار';
  const logoSrc = (compDetails && compDetails.logo) ? compDetails.logo
    : (typeof currentCompLogoBase64 !== 'undefined' ? currentCompLogoBase64 : '');
  const logoHtml = logoSrc
    ? `<img src="${logoSrc}" alt="آرم" style="max-height:48px;max-width:110px;object-fit:contain;" />`
    : `<div style="width:42px;height:42px;border-radius:8px;background:linear-gradient(135deg,#0284c7,#0369a1);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;">🏢</div>`;

  const numFmt = n  => formatNumberForPrint(String(n), numberType);
  const monFmt = n  => formatNumberForPrint(Number(n || 0).toLocaleString(), numberType);
  const dateFmt= d  => formatNumberForPrint(d || '', numberType);

  // ────────────────────────────────────────
  // Build table header columns
  // ────────────────────────────────────────
  const colDefs = [];
  if (showRow)      colDefs.push({ label: 'ردیف',                        width: '4%',  align: 'center' });
  if (showSanadNo)  colDefs.push({ label: 'شماره سند',                    width: '7%',  align: 'center' });
  if (showDayNo)    colDefs.push({ label: 'شماره روز',                    width: '6%',  align: 'center' });
  if (showCombined) colDefs.push({ label: 'شماره سند / شماره روز',        width: '9%',  align: 'center' });
  if (showDate)     colDefs.push({ label: 'تاریخ',                        width: '9%',  align: 'center' });
  if (showStatus)   colDefs.push({ label: 'وضعیت',                        width: '7%',  align: 'center' });
  colDefs.push({ label: 'کد حساب',    width: '7%',  align: 'center' });
  colDefs.push({ label: 'نام حساب',   width: '18%', align: 'right'  });
  colDefs.push({ label: 'شرح آرتیکل', width: '25%', align: 'right'  });
  if (showDebit)    colDefs.push({ label: 'بدهکار (ریال)',                 width: '10%', align: 'left'   });
  if (showCredit)   colDefs.push({ label: 'بستانکار (ریال)',               width: '10%', align: 'left'   });

  const thHtml = colDefs.map(c =>
    `<th style="width:${c.width};text-align:${c.align};">${c.label}</th>`
  ).join('');

  // ────────────────────────────────────────
  // Build rows: article-by-article
  // ────────────────────────────────────────
  let grandDebit = 0, grandCredit = 0;
  let rowSeq = 0; // running article row number
  let bodyHtml = '';

  AppState.voucherDetails = AppState.voucherDetails || {};

  selectedSanads.forEach(s => {
    if (!s.dayOfYear) s.dayOfYear = getJalaliDayOfYear(s.date);
    const lines = AppState.voucherDetails[s.id] || [];

    let vDebit = 0, vCredit = 0;
    let isFirst = true;

    lines.forEach(line => {
      rowSeq++;
      vDebit  += (line.debit  || 0);
      vCredit += (line.credit || 0);
      const accCode = line.account || '';
      const accName = getAccName(accCode);
      // Debit lines first (بدهکار), then credit (بستانکار) — already ordered in data
      const isDebit = (line.debit || 0) > 0;
      // Indent credit lines (بستانکار) as per Iranian convention
      const accNameDisplay = isDebit
        ? accName
        : `&nbsp;&nbsp;&nbsp;&nbsp;${accName}`;
      const descDisplay = isDebit
        ? (line.desc || '')
        : `&nbsp;&nbsp;&nbsp;&nbsp;${line.desc || ''}`;

      const tds = [];
      if (showRow)      tds.push(`<td style="text-align:center;">${numFmt(rowSeq)}</td>`);
      if (showSanadNo)  tds.push(isFirst
        ? `<td style="text-align:center;font-weight:bold;">${numFmt(s.id)}</td>`
        : `<td style="text-align:center;color:#94a3b8;">↑</td>`);
      if (showDayNo)    tds.push(isFirst
        ? `<td style="text-align:center;">${numFmt(s.dayOfYear || '')}</td>`
        : `<td></td>`);
      if (showCombined) tds.push(isFirst
        ? `<td style="text-align:center;font-weight:bold;direction:ltr;">${numFmt(s.dayOfYear || '')}/${numFmt(s.id)}</td>`
        : `<td style="text-align:center;color:#94a3b8;">↑</td>`);
      if (showDate)     tds.push(isFirst
        ? `<td style="text-align:center;">${dateFmt(s.date)}</td>`
        : `<td></td>`);
      if (showStatus)   tds.push(isFirst
        ? `<td style="text-align:center;">${s.status || ''}</td>`
        : `<td></td>`);
      tds.push(`<td style="text-align:center;direction:ltr;">${accCode}</td>`);
      tds.push(`<td style="text-align:right;">${accNameDisplay}</td>`);
      tds.push(`<td style="text-align:right;">${descDisplay}</td>`);
      if (showDebit)    tds.push(isDebit
        ? `<td style="text-align:left;direction:ltr;white-space:nowrap;font-weight:bold;">${monFmt(line.debit)}</td>`
        : `<td></td>`);
      if (showCredit)   tds.push(!isDebit
        ? `<td style="text-align:left;direction:ltr;white-space:nowrap;">${monFmt(line.credit)}</td>`
        : `<td></td>`);

      bodyHtml += `<tr class="article-row">${tds.join('')}</tr>`;
      isFirst = false;
    });

    // Sub-total row per voucher (جمع سند)
    if (lines.length > 0) {
      grandDebit  += vDebit;
      grandCredit += vCredit;
      const subCols = [];
      if (showRow)      subCols.push('<td></td>');
      if (showSanadNo)  subCols.push(`<td style="text-align:center;font-weight:bold;">${numFmt(s.id)}</td>`);
      if (showDayNo)    subCols.push('<td></td>');
      if (showCombined) subCols.push(`<td style="text-align:center;font-weight:bold;direction:ltr;">${numFmt(s.dayOfYear || '')}/${numFmt(s.id)}</td>`);
      if (showDate)     subCols.push('<td></td>');
      if (showStatus)   subCols.push('<td></td>');
      subCols.push('<td colspan="3" style="text-align:right;font-weight:bold;">جمع سند</td>');
      if (showDebit)    subCols.push(`<td style="text-align:left;direction:ltr;white-space:nowrap;font-weight:bold;">${monFmt(vDebit)}</td>`);
      if (showCredit)   subCols.push(`<td style="text-align:left;direction:ltr;white-space:nowrap;font-weight:bold;">${monFmt(vCredit)}</td>`);
      bodyHtml += `<tr class="subtotal-row">${subCols.join('')}</tr>`;

      // Voucher description row (شرح سند) — shown below subtotal if requested
      if (showVoucherDesc && s.desc) {
        const descColspan = colDefs.length;
        bodyHtml += `<tr class="voucher-desc-row"><td colspan="${descColspan}" style="text-align:right;padding:4px 10px;font-style:italic;color:${isBw ? '#333' : '#1e40af'};background:${isBw ? '#f5f5f5' : '#eff6ff'} !important;border:1px solid ${isBw ? '#ccc' : '#bfdbfe'};font-size:${tdS};">📝 شرح سند: ${s.desc}</td></tr>`;
      }

      // Separator row
      bodyHtml += `<tr class="sep-row"><td colspan="${colDefs.length}" style="height:6px;border:none;background:transparent;"></td></tr>`;
    }
  });

  // ────────────────────────────────────────
  // Grand total row (جمع کل دفتر روزنامه)
  // ────────────────────────────────────────
  const grandCols = [];
  if (showRow)     grandCols.push('<td></td>');
  if (showSanadNo) grandCols.push('<td></td>');
  if (showDayNo)   grandCols.push('<td></td>');
  if (showDate)    grandCols.push('<td></td>');
  if (showStatus)  grandCols.push('<td></td>');
  grandCols.push('<td colspan="3" style="text-align:right;font-weight:bold;">جمع کل دفتر روزنامه</td>');
  if (showDebit)   grandCols.push(`<td style="text-align:left;direction:ltr;white-space:nowrap;font-weight:bold;">${monFmt(grandDebit)}</td>`);
  if (showCredit)  grandCols.push(`<td style="text-align:left;direction:ltr;white-space:nowrap;font-weight:bold;">${monFmt(grandCredit)}</td>`);

  // ────────────────────────────────────────
  // Open print window and write HTML
  // ────────────────────────────────────────
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <html dir="rtl">
    <head>
      <title>دفتر روزنامه - ${activeYear}</title>
      <style>
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
        body { font-family: '${tdF}', Tahoma, Arial, sans-serif; padding: 0; margin: 0; color: #000; background: #fff; font-size: ${tdS}; }
        @page { size: ${pageSize} ${orientation}; margin: ${pageMargin}; }

        .no-print { display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: #1e293b; color: #f8fafc; flex-wrap: wrap; position: sticky; top: 0; z-index: 99; }
        .no-print button { border: none; padding: 6px 14px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 13px; }
        .btn-pdf { background: #dc2626; color: #fff; }
        .btn-print { background: #0284c7; color: #fff; }

        .report-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding: 10px 14px 10px 14px; margin-bottom: 12px; }
        .company-name { font-family: '${compF}', Tahoma; font-size: ${compS}; font-weight: bold; color: ${isBw ? '#000' : compC}; }
        .report-title { font-family: '${titleF}', Tahoma; font-size: ${titleS}; font-weight: bold; color: ${titleColor}; text-align: center; }
        .report-sub { font-size: 11px; color: #475569; text-align: center; margin-top: 3px; }

        .main-table { width: calc(100% - 28px); border-collapse: collapse; margin: 0 14px; }
        .main-table thead th {
          font-family: '${thF}', Tahoma; font-size: ${thS}; color: ${isBw ? '#000' : thC};
          background-color: ${headerBg} !important;
          border: 1px solid ${isBw ? '#000' : '#64748b'};
          padding: 6px 4px; text-align: center;
          position: sticky; top: 0;
        }
        .main-table td { font-family: '${tdF}', Tahoma; font-size: ${tdS}; color: ${isBw ? '#000' : tdC}; border: 1px solid ${isBw ? '#aaa' : '#cbd5e1'}; padding: 4px 5px; }
        .article-row:nth-child(odd) td { background-color: ${isBw ? '#fff' : '#fff'}; }
        .article-row:nth-child(even) td { background-color: ${isBw ? '#f7f7f7' : '#f8fafc'}; }

        /* Subtotal row (جمع سند) */
        .subtotal-row td {
          font-family: '${totF}', Tahoma; font-size: ${totS}; font-weight: bold;
          background-color: ${subTotBg} !important;
          border: 1px solid ${isBw ? '#888' : '#93c5fd'};
          color: ${isBw ? '#000' : '#1e40af'};
          padding: 4px 5px;
        }
        /* Grand total row */
        .grand-total-row td {
          font-family: '${totF}', Tahoma; font-size: ${totS}; font-weight: bold;
          background-color: ${grandBg} !important;
          border: 2px solid ${isBw ? '#000' : '#1d4ed8'};
          color: ${isBw ? '#000' : '#1e3a8a'};
          padding: 6px 5px;
        }
        .sep-row td { border: none !important; }

        @media print {
          .no-print { display: none !important; }
          body { padding: 0; }
          .main-table thead th { position: static; }
          .subtotal-row { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body${isBw ? ' style="filter:grayscale(100%) contrast(115%);"' : ''}>
      <div class="no-print">
        <span style="font-weight:bold;color:#38bdf8;">📒 دفتر روزنامه | ${activeYear} | تعداد اسناد: ${selectedSanads.length} | تعداد آرتیکل: ${rowSeq}</span>
        <button class="btn-pdf" onclick="exportJrnToPDF()">📄 ذخیره PDF</button>
        <button class="btn-print" onclick="window.print()">🖨️ چاپ</button>
      </div>

      <div class="report-header">
        <div>${logoHtml}</div>
        <div style="text-align:center;">
          <div class="company-name">${companyName}</div>
          <div class="report-title">دفتر روزنامه</div>
          <div class="report-sub">سال مالی ${activeYear} &nbsp;|&nbsp; تعداد اسناد: ${numFmt(selectedSanads.length)} &nbsp;|&nbsp; تعداد آرتیکل: ${numFmt(rowSeq)}</div>
        </div>
        <div style="font-size:11px;color:#475569;text-align:left;">
          <div>تاریخ چاپ:</div>
          <div>${new Date().toLocaleDateString('fa-IR')}</div>
        </div>
      </div>

      <table class="main-table">
        <thead><tr>${thHtml}</tr></thead>
        <tbody>
          ${bodyHtml}
          <tr class="grand-total-row">${grandCols.join('')}</tr>
        </tbody>
      </table>
    </body>
    </html>
  `);
  printWindow.document.close();

  printWindow.exportJrnToPDF = function() {
    const oldTitle = printWindow.document.title;
    printWindow.document.title = `دفتر_روزنامه_${activeYear}`;
    printWindow.print();
    setTimeout(() => { printWindow.document.title = oldTitle; }, 1000);
  };
}


function copyActiveVoucher() {
  if (!selectedSanadId) {
    alert('لطفاً ابتدا یک سند را از جدول انتخاب (کلیک) کنید.');
    return;
  }
  const source = AppState.sanads.find(x => x.id === selectedSanadId);
  if (!source) return;

  if (confirm(`آیا مایلید سند #${source.id} را کپی کنید؟`)) {
    const newId = Math.max(...AppState.sanads.map(s => s.id)) + 1;
    const todayStr = (PersianCal && typeof PersianCal.getTodayString === 'function') 
      ? PersianCal.getTodayString() 
      : '1403/05/11';

    const newVoucher = {
      id: newId,
      date: todayStr,
      desc: `کپی از سند #${source.id} - ${source.desc}`,
      debit: source.debit,
      credit: source.credit,
      status: 'موقت'
    };

    AppState.sanads.push(newVoucher);
    selectedSanadId = newId; // Select the copied one
    renderSanadListTable();
    alert(`سند #${source.id} با موفقیت به سند جدید #${newId} کپی گردید.`);
  }
}

// Sanad 2 (editor)
let focusedLineIndex = 0;
let originalSanadState = null;

function updateFocusedPaths(i) {
  focusedLineIndex = i;
  
  // Dynamic visual row selection highlight
  const rows = document.querySelectorAll('#sanadLinesEditorBody tr');
  rows.forEach((row, idx) => {
    if (idx === i) {
      row.classList.add('focused-row');
    } else {
      row.classList.remove('focused-row');
    }
  });

  const line = AppState.sanadLines[i];
  if (!line) return;
  
  // Find selected account path
  const acc = AppState.accounts.find(a => a.code === line.account);
  let accPath = '<span style="color:var(--text-muted); font-weight:normal;">-</span>';
  if (acc) {
    const pathParts = [];
    let curr = acc;
    while (curr) {
      pathParts.unshift(`${curr.code} : ${curr.name}`);
      curr = curr.parentId ? AppState.accounts.find(x => x.id === curr.parentId) : null;
    }
    accPath = `<span style="color:var(--accent-color); font-weight:bold;">${pathParts.join(' / ')}</span>`;
  }
  
  // Find selected shenavar path
  const shen = AppState.shenavars.find(s => s.code === line.shenavarCode);
  let shenPath = '<span style="color:var(--text-muted); font-weight:normal;">بدون شناور</span>';
  if (shen) {
    const pathParts = [];
    let curr = shen;
    while (curr) {
      pathParts.unshift(`${curr.code} : ${curr.name}`);
      curr = curr.parentId ? AppState.shenavars.find(x => x.id === curr.parentId) : null;
    }
    shenPath = `<span style="color:var(--accent-color); font-weight:bold;">${pathParts.join(' / ')}</span>`;
  }
  
  const accEl = document.getElementById('focusedAccountPath');
  const shenEl = document.getElementById('focusedShenavarPath');
  const lineDescEl = document.getElementById('focusedLineDesc');
  if (accEl) accEl.innerHTML = accPath;
  if (shenEl) shenEl.innerHTML = shenPath;
  if (lineDescEl) {
    lineDescEl.innerHTML = `<span style="color:var(--accent-color); font-weight:bold;">${line.desc || '-'}</span>`;
  }
}

function updateSanadLineField(i, field, value) {
  if (!AppState.sanadLines[i]) return;
  if (field === 'debit' || field === 'credit') {
    AppState.sanadLines[i][field] = Number(value || 0);
    updateSanadTotals();
  } else {
    AppState.sanadLines[i][field] = value;
  }
  if (field === 'account' || field === 'shenavarCode') {
    updateFocusedPaths(i);
  }
  if (field === 'desc') {
    const lineDescEl = document.getElementById('focusedLineDesc');
    if (lineDescEl) {
      lineDescEl.innerHTML = `<span style="color:var(--accent-color); font-weight:bold;">${value || '-'}</span>`;
    }
  }
}

function formatAmount(val) {
  if (val === undefined || val === null || val === '') return '0';
  const clean = val.toString().replace(/,/g, '');
  const num = Number(clean);
  if (isNaN(num)) return '0';
  return num === 0 ? '0' : num.toLocaleString('en-US');
}

function handleAmountInput(input, index, field) {
  let selectionStart = input.selectionStart;
  let originalLen = input.value.length;
  
  // Strip all non-digit characters
  let clean = input.value.replace(/[^0-9]/g, '');
  const num = clean === '' ? 0 : Number(clean);
  
  AppState.sanadLines[index][field] = num;
  updateSanadTotals();
  
  // Formatted value
  const formatted = num === 0 ? '0' : num.toLocaleString('en-US');
  input.value = formatted;
  
  // Restore cursor position
  let newLen = formatted.length;
  let diff = newLen - originalLen;
  let newCursor = selectionStart + diff;
  input.setSelectionRange(newCursor, newCursor);
}

function cleanAmountSearchInput(input) {
  if (!input || input.value === undefined) return;
  let val = input.value;

  // Convert Persian & Arabic digits to standard 0-9 digits
  val = val.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
           .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));

  // Restrict input to digits (0-9), prefix chars (> < = *), and comma (,)
  let cleaned = val.replace(/[^><=\*0-9,]/g, '');

  // Prefix characters (> < = *) can ONLY be at index 0!
  if (cleaned.length > 1) {
    const first = cleaned[0];
    const rest = cleaned.slice(1).replace(/[><=\*]/g, '');
    cleaned = first + rest;
  }

  if (input.value !== cleaned) {
    const start = input.selectionStart;
    input.value = cleaned;
    try {
      input.setSelectionRange(start, start);
    } catch(e) {}
  }
}

function matchAmount(val, filterText) {
  filterText = filterText.replace(/,/g, '').trim();
  if (filterText.length === 0) return true;
  
  const ch = filterText[0];
  if (ch === '*') {
    const searchStr = filterText.slice(1);
    if (searchStr.length === 0) return true;
    return String(Math.floor(val)).includes(searchStr);
  } else if (ch === '<') {
    const numStr = filterText.slice(1).trim();
    if (numStr.length === 0) return true;
    const threshold = parseFloat(numStr);
    return isNaN(threshold) ? true : val < threshold;
  } else if (ch === '>') {
    const numStr = filterText.slice(1).trim();
    if (numStr.length === 0) return true;
    const threshold = parseFloat(numStr);
    return isNaN(threshold) ? true : val > threshold;
  } else if (ch === '=') {
    const numStr = filterText.slice(1).trim();
    if (numStr.length === 0) return true;
    const target = parseFloat(numStr);
    return isNaN(target) ? true : val === target;
  } else {
    const target = parseFloat(filterText);
    return isNaN(target) ? true : val === target;
  }
}

const sanadSearchFilters = {
  account: '',
  shenavarCode: '',
  desc: '',
  debit: '',
  credit: '',
  txNo: '',
  txDate: ''
};

function handleColumnSearch(field, value) {
  sanadSearchFilters[field] = value;
  renderSanadEditorLines();
}

function clearColumnSearches() {
  for (let key in sanadSearchFilters) {
    sanadSearchFilters[key] = '';
  }
  const inputs = [
    'searchColAccount', 'searchColShenavar', 'searchColDesc',
    'searchColDebit', 'searchColCredit', 'searchColTxNo', 'searchColTxDate'
  ];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderSanadEditorLines();
}

function renderSanadEditorLines() {
  const tbody = document.getElementById('sanadLinesEditorBody');
  if (!tbody) return;

  tbody.innerHTML = AppState.sanadLines.map((line, i) => {
    // Default values for missing properties
    if (!line.account) line.account = '110101';
    if (!line.shenavarCode) line.shenavarCode = '';
    if (!line.txNo) line.txNo = '';
    if (!line.txDate) line.txDate = '';

    // Apply search filters
    if (sanadSearchFilters.account && !line.account.includes(sanadSearchFilters.account)) return '';
    if (sanadSearchFilters.shenavarCode && !line.shenavarCode.includes(sanadSearchFilters.shenavarCode)) return '';
    if (sanadSearchFilters.desc && !line.desc.toLowerCase().includes(sanadSearchFilters.desc.toLowerCase())) return '';
    if (sanadSearchFilters.txNo && !line.txNo.includes(sanadSearchFilters.txNo)) return '';
    if (sanadSearchFilters.txDate && !line.txDate.includes(sanadSearchFilters.txDate)) return '';

    if (sanadSearchFilters.debit) {
      if (!matchAmount(Number(line.debit || 0), sanadSearchFilters.debit)) return '';
    }
    if (sanadSearchFilters.credit) {
      if (!matchAmount(Number(line.credit || 0), sanadSearchFilters.credit)) return '';
    }
    if (!line.txDate) line.txDate = '';

    const isSelected = (i === focusedLineIndex);
    const rowClass = isSelected ? 'focused-row' : '';

    return `
      <tr class="${rowClass}" data-index="${i}" onclick="updateFocusedPaths(${i})" style="cursor:pointer;">
        <!-- Row No -->
        <td style="text-align:center; font-weight:bold;">${i + 1}</td>
        
        <!-- SF button helper -->
        <td style="text-align:center;"><button class="btn btn-outline date-picker-btn" style="padding:2px 6px; font-size:0.75rem;" onclick="event.stopPropagation(); openSfPopup(${i})">...</button></td>

        <!-- Account Code TextBox -->
        <td>
          <input type="text" class="form-input" style="width:100%; border:none; padding:4px; font-size:0.8rem; background:transparent;" value="${line.account || ''}" onfocus="updateFocusedPaths(${i})" oninput="updateSanadLineField(${i}, 'account', this.value)" />
        </td>
        
        <!-- SH button helper -->
        <td style="text-align:center;"><button class="btn btn-outline date-picker-btn" style="padding:2px 6px; font-size:0.75rem;" onclick="event.stopPropagation(); openShPopup(${i})">...</button></td>

        <!-- Floating Account Code TextBox -->
        <td>
          <input type="text" class="form-input" style="width:100%; border:none; padding:4px; font-size:0.8rem; background:transparent;" value="${line.shenavarCode || ''}" onfocus="updateFocusedPaths(${i})" oninput="updateSanadLineField(${i}, 'shenavarCode', this.value)" placeholder="بدون شناور" />
        </td>
        
        <!-- Description -->
        <td>
          <input type="text" class="form-input" style="width:100%; border:none; padding:4px; font-size:0.8rem; background:transparent;" value="${line.desc || ''}" onfocus="updateFocusedPaths(${i})" oninput="updateSanadLineField(${i}, 'desc', this.value)" />
        </td>
        
        <!-- Debit -->
        <td>
          <input type="text" class="form-input" style="width:100%; border:none; padding:4px; text-align:right; font-weight:bold; font-size:0.8rem; background:transparent;" value="${formatAmount(line.debit)}" onfocus="updateFocusedPaths(${i})" oninput="handleAmountInput(this, ${i}, 'debit')" />
        </td>
        
        <!-- Credit -->
        <td>
          <input type="text" class="form-input" style="width:100%; border:none; padding:4px; text-align:right; font-weight:bold; font-size:0.8rem; background:transparent;" value="${formatAmount(line.credit)}" onfocus="updateFocusedPaths(${i})" oninput="handleAmountInput(this, ${i}, 'credit')" />
        </td>
        
        <!-- Transaction Number -->
        <td>
          <input type="text" class="form-input" style="width:100%; border:none; padding:4px; font-size:0.8rem; background:transparent;" value="${line.txNo}" onfocus="updateFocusedPaths(${i})" oninput="updateSanadLineField(${i}, 'txNo', this.value)" />
        </td>

        <!-- TT Transaction Type Helper (Jalali Calendar Button) -->
        <td style="text-align:center;">
          <button class="btn btn-outline date-picker-btn" style="padding:2px 6px; font-size:0.75rem;" onclick="event.stopPropagation(); PersianCal.open('txDateInput_${i}', this)">...</button>
        </td>
        
        <!-- Transaction Date -->
        <td>
          <input type="text" id="txDateInput_${i}" class="form-input" style="width:100%; border:none; padding:4px; font-size:0.8rem; background:transparent;" value="${line.txDate}" maxlength="10" onfocus="updateFocusedPaths(${i})" oninput="autoFormatDate(this); updateSanadLineField(${i}, 'txDate', this.value)" />
        </td>
        
        <!-- Action: Delete -->
        <td style="text-align:center;">
          <button class="btn btn-outline" style="padding:2px 6px; color:red; border:none; background:transparent;" onclick="event.stopPropagation(); removeSanadLine(${i})">❌</button>
        </td>
      </tr>
    `;
  }).join('');
  
  updateSanadTotals();
  updateFocusedPaths(focusedLineIndex);
}

function addSanadLine() {
  AppState.sanadLines.push({ account: '110101', shenavarCode: '', desc: '', debit: 0, credit: 0, txNo: '', txDate: '' });
  focusedLineIndex = AppState.sanadLines.length - 1;
  renderSanadEditorLines();
}

function removeSanadLine(i) {
  if (confirm(`آیا از حذف ردیف ${i + 1} سند حسابداری اطمینان دارید؟`)) {
    AppState.sanadLines.splice(i, 1);
    if (AppState.sanadLines.length === 0) {
      AppState.sanadLines.push({ account: '110101', shenavarCode: '', desc: '', debit: 0, credit: 0, txNo: '', txDate: '' });
    }
    focusedLineIndex = Math.max(0, i - 1);
    renderSanadEditorLines();
  }
}

function copyFocusedSanadLine(direction) {
  if (focusedLineIndex === null || !AppState.sanadLines[focusedLineIndex]) {
    alert('لطفاً ابتدا روی یکی از ردیف‌های سند کلیک کنید تا به عنوان سطر جاری انتخاب شود.');
    return;
  }
  const sourceLine = { ...AppState.sanadLines[focusedLineIndex] };
  if (direction === 'above') {
    AppState.sanadLines.splice(focusedLineIndex, 0, sourceLine);
    focusedLineIndex = focusedLineIndex + 1;
  } else {
    AppState.sanadLines.splice(focusedLineIndex + 1, 0, sourceLine);
    focusedLineIndex = focusedLineIndex + 1;
  }
  renderSanadEditorLines();
}

function copyFocusedSanadLineToCustom() {
  if (focusedLineIndex === null || !AppState.sanadLines[focusedLineIndex]) {
    alert('لطفاً ابتدا روی یکی از ردیف‌های سند کلیک کنید تا به عنوان سطر جاری انتخاب شود.');
    return;
  }
  
  const totalRows = AppState.sanadLines.length;
  const input = prompt(
    `شماره سطر مقصد را وارد کنید (1 تا ${totalRows + 1}):`,
    (focusedLineIndex + 1).toString()
  );
  
  if (input === null || input.trim() === '') {
    return;
  }
  
  const pos = parseInt(input.trim(), 10);
  if (isNaN(pos) || pos < 1 || pos > totalRows + 1) {
    alert('شماره سطر وارد شده معتبر نیست.');
    return;
  }
  
  const insertAt = pos - 1;
  const sourceLine = { ...AppState.sanadLines[focusedLineIndex] };
  
  AppState.sanadLines.splice(insertAt, 0, sourceLine);
  focusedLineIndex = insertAt;
  
  renderSanadEditorLines();
}

function deleteFocusedSanadLine() {
  if (focusedLineIndex === null || !AppState.sanadLines[focusedLineIndex]) {
    alert('لطفاً ابتدا روی یکی از ردیف‌های سند کلیک کنید.');
    return;
  }
  removeSanadLine(focusedLineIndex);
}

function updateSanadTotals() {
  const td = AppState.sanadLines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const tc = AppState.sanadLines.reduce((s, l) => s + Number(l.credit || 0), 0);
  const diff = td - tc;

  const debitEl = document.getElementById('footerTotalDebit');
  const creditEl = document.getElementById('footerTotalCredit');
  const diffDebitEl = document.getElementById('footerDiffDebit');
  const diffCreditEl = document.getElementById('footerDiffCredit');
  const badgeEl = document.getElementById('sanadBalanceStatusBadge');

  if (debitEl) debitEl.value = td.toLocaleString();
  if (creditEl) creditEl.value = tc.toLocaleString();

  // If Debits > Credits, the deficit is on the Credit side (footerDiffCredit)
  // If Debits < Credits, the deficit is on the Debit side (footerDiffDebit)
  if (diff > 0) {
    if (diffCreditEl) diffCreditEl.value = diff.toLocaleString();
    if (diffDebitEl) diffDebitEl.value = '0';
  } else if (diff < 0) {
    if (diffDebitEl) diffDebitEl.value = Math.abs(diff).toLocaleString();
    if (diffCreditEl) diffCreditEl.value = '0';
  } else {
    if (diffDebitEl) diffDebitEl.value = '0';
    if (diffCreditEl) diffCreditEl.value = '0';
  }

  if (badgeEl) {
    if (diff === 0) {
      badgeEl.className = 'badge badge-success';
      badgeEl.textContent = 'تراز';
      badgeEl.style.background = 'rgba(16,185,129,0.15)';
      badgeEl.style.color = '#10b981';
    } else if (diff > 0) {
      badgeEl.className = 'badge badge-danger';
      badgeEl.textContent = 'بدهکار';
      badgeEl.style.background = 'rgba(239,68,68,0.15)';
      badgeEl.style.color = '#ef4444';
    } else {
      badgeEl.className = 'badge badge-danger';
      badgeEl.textContent = 'بستانکار';
      badgeEl.style.background = 'rgba(239,68,68,0.15)';
      badgeEl.style.color = '#ef4444';
    }
  }

  // Trigger dynamic pixel-perfect alignment
  setTimeout(alignFooterTotals, 0);
}

function alignFooterTotals() {
  const headers = document.querySelectorAll('#form-sanad2 table th');
  if (headers.length < 8) return;
  
  let debitTh = null;
  let creditTh = null;
  headers.forEach(th => {
    if (th.textContent.includes('بدهکار')) debitTh = th;
    if (th.textContent.includes('بستانکار')) creditTh = th;
    
    const input = th.querySelector('input');
    if (input) {
      const placeholder = input.placeholder || '';
      if (placeholder.includes('بدهکار')) debitTh = th;
      if (placeholder.includes('بستانکار')) creditTh = th;
    }
  });
  
  if (!debitTh || !creditTh) return;
  
  const bottomPanel = document.getElementById('sanadBottomPanel');
  if (!bottomPanel) return;
  
  const panelRect = bottomPanel.getBoundingClientRect();
  const debitRect = debitTh.getBoundingClientRect();
  const creditRect = creditTh.getBoundingClientRect();
  
  // Calculate LTR offset positions relative to the bottom panel
  const debitLeft = debitRect.left - panelRect.left;
  const creditLeft = creditRect.left - panelRect.left;
  const debitWidth = debitRect.width;
  const creditWidth = creditRect.width;
  
  // Apply position to inputs
  const totalDebitInput = document.getElementById('footerTotalDebit');
  const totalCreditInput = document.getElementById('footerTotalCredit');
  const diffDebitInput = document.getElementById('footerDiffDebit');
  const diffCreditInput = document.getElementById('footerDiffCredit');
  
  if (totalDebitInput) {
    totalDebitInput.style.left = `${debitLeft}px`;
    totalDebitInput.style.width = `${debitWidth}px`;
  }
  if (totalCreditInput) {
    totalCreditInput.style.left = `${creditLeft}px`;
    totalCreditInput.style.width = `${creditWidth}px`;
  }
  if (diffDebitInput) {
    diffDebitInput.style.left = `${debitLeft}px`;
    diffDebitInput.style.width = `${debitWidth}px`;
  }
  if (diffCreditInput) {
    diffCreditInput.style.left = `${creditLeft}px`;
    diffCreditInput.style.width = `${creditWidth}px`;
  }
  
  // Position labels dynamically to the right of the Debit column
  const labelLeft = (debitRect.right - panelRect.left) + 12;
  const labelTotal = document.getElementById('footerLabelTotal');
  const labelDiff = document.getElementById('footerLabelDiff');
  
  if (labelTotal) {
    labelTotal.style.left = `${labelLeft}px`;
  }
  if (labelDiff) {
    labelDiff.style.left = `${labelLeft}px`;
  }

  // Centered inside leftmost empty space (0 to creditLeft)
  const statusContainer = document.getElementById('sanadBalanceStatusContainer');
  if (statusContainer) {
    statusContainer.style.left = '12px';
    statusContainer.style.width = `${creditLeft - 12}px`;
    statusContainer.style.top = '12px';
    statusContainer.style.height = '50px';
  }
}

// ==========================================
// Accounts Popup Dialog (Sarafsol Selection)
// ==========================================
let activePopupRowIndex = null;

function openSfPopup(rowIndex) {
  if (activePopupMode !== 'moghayerat') {
    activePopupMode = 'sanad';
  }
  activePopupRowIndex = rowIndex;
  lastSelectedPopupAccId = null;
  
  // Clear search inputs
  const sc = document.getElementById('popupSearchCode');
  const sn = document.getElementById('popupSearchName');
  if (sc) sc.value = '';
  if (sn) sn.value = '';
  
  // Close any open CRUD form in popup
  cancelAccountInPopup();
  
  // Render
  renderPopupAccounts();
  
  // Show modal
  const modal = document.getElementById('sfPopupModal');
  if (modal) modal.style.display = 'flex';
  
  // Set date/time in status bar
  const dateEl = document.getElementById('popupStatusBarDate');
  const timeEl = document.getElementById('popupStatusBarTime');
  const userEl = document.getElementById('popupStatusUser');
  const compEl = document.getElementById('popupStatusCompany');
  const yearEl = document.getElementById('popupStatusYear');
  
  if (dateEl && PersianCal && typeof PersianCal.getTodayString === 'function') {
    dateEl.textContent = PersianCal.getTodayString();
  }
  if (timeEl) {
    const now = new Date();
    timeEl.textContent = now.toTimeString().split(' ')[0];
  }
  if (userEl && currentUser) userEl.textContent = currentUser.fullName;
  if (compEl && SessionState.company) compEl.textContent = SessionState.company.name;
  if (yearEl && SessionState.year) yearEl.textContent = `سال مالی: ${SessionState.year}`;
}

function closeSfPopup() {
  const modal = document.getElementById('sfPopupModal');
  if (modal) modal.style.display = 'none';
}

function renderPopupAccounts() {
  const tbody = document.getElementById('popupAccountsTableBody');
  if (!tbody) return;
  
  const searchCode = (document.getElementById('popupSearchCode')?.value || '').trim();
  const searchName = (document.getElementById('popupSearchName')?.value || '').trim().toLowerCase();
  
  const sortedAccounts = sortTreePreOrder(AppState.accounts);
  let list;
  
  const isSearching = (searchCode || searchName);
  
  if (isSearching) {
    list = sortedAccounts.filter(a => {
      const matchCode = searchCode ? a.code.includes(searchCode) : true;
      const matchName = searchName ? a.name.toLowerCase().includes(searchName) : true;
      return matchCode && matchName;
    });
  } else {
    list = sortedAccounts.filter(isAccountVisible);
  }
  
  tbody.innerHTML = list.map(account => {
    const level = getAccountLevel(account);
    const hasChildren = AppState.accounts.some(child => child.parentId === account.id);
    const isExpanded = expandedAccountIds.has(account.id);
    
    // Toggle button in popup
    const toggleBtnHtml = hasChildren
      ? `<button class="tree-toggle-btn ${isExpanded ? 'expanded' : ''}" onclick="event.stopPropagation(); togglePopupAccountExpand(${account.id})">${isExpanded ? '-' : '+'}</button>`
      : `<button class="tree-toggle-btn" style="visibility:hidden; width:16px;">+</button>`;
      
    const indentPx = level * 18;
    const isSelected = (account.code === AppState.sanadLines[activePopupRowIndex]?.account);
    const selectedClass = isSelected ? 'focused-row' : '';
    
    return `
      <tr onclick="updatePopupSelectedPath(${JSON.stringify(account).replace(/"/g, '&quot;')})" style="cursor:pointer; height:26px; ${isSelected ? 'background-color:rgba(2,132,199,0.18) !important;' : ''}">
        <!-- Expand/Collapse Button (instead of "+" for sub-account) -->
        <td style="text-align:center; vertical-align:middle;">
          ${toggleBtnHtml}
        </td>
        <!-- Select Button -->
        <td style="text-align:center;">
          <button class="btn btn-outline" style="padding:1px 6px; font-size:0.75rem; border-color:#10b981; color:#10b981; font-weight:bold;" onclick="event.stopPropagation(); selectAccountInPopup('${account.code}')">انتخاب</button>
        </td>
        <!-- Edit Button -->
        <td style="text-align:center;">
          <button class="btn btn-outline" style="padding:1px 6px; font-size:0.75rem;" onclick="event.stopPropagation(); openEditAccountInPopup(${account.id})">ویرایش</button>
        </td>
        <!-- Delete Button -->
        <td style="text-align:center;">
          <button class="btn btn-outline" style="padding:1px 6px; font-size:0.75rem; color:red;" onclick="event.stopPropagation(); deleteAccountInPopup(${account.id})">حذف</button>
        </td>
        <!-- Code -->
        <td style="padding:4px 8px; font-weight:bold; font-size:0.8rem;">${account.code}</td>
        <!-- Name (with tree indentation) -->
        <td style="padding:4px 8px; padding-right:${indentPx + 10}px; font-size:0.8rem; text-align:right;">
          ${level > 0 ? '<span style="color:var(--accent-color);margin-left:6px;">└─</span>' : ''}
          <b>${account.name}</b>
        </td>
        <!-- Active Checkbox -->
        <td style="text-align:center;">
          <input type="checkbox" checked disabled />
        </td>
      </tr>
    `;
  }).join('');
}

function togglePopupAccountExpand(accId) {
  if (expandedAccountIds.has(accId)) {
    expandedAccountIds.delete(accId);
  } else {
    expandedAccountIds.add(accId);
  }
  renderPopupAccounts();
  if (typeof renderAccountsTable === 'function') {
    renderAccountsTable();
  }
}

function filterPopupAccounts() {
  renderPopupAccounts();
}

let activePopupMode = 'sanad';

function selectAccountInPopup(code) {
  if (activePopupMode === 'moghayerat') {
    const el = document.getElementById('lblMoghBankAccText');
    if (el) el.textContent = code;
    closeSfPopup();
    return;
  }
  
  if (activePopupRowIndex !== null && AppState.sanadLines[activePopupRowIndex]) {
    AppState.sanadLines[activePopupRowIndex].account = code;
    renderSanadEditorLines();
    updateFocusedPaths(activePopupRowIndex);
  }
  closeSfPopup();
}

let lastSelectedPopupAccId = null;

function updatePopupSelectedPath(account) {
  lastSelectedPopupAccId = account.id;
  let curr = account;
  const pathParts = [];
  while (curr) {
    pathParts.unshift(`${curr.code} : ${curr.name}`);
    curr = curr.parentId ? AppState.accounts.find(x => x.id === curr.parentId) : null;
  }
  const pathStr = `سطح سرفصل جاری: ${account.type} / زنجیره: ${pathParts.join(' / ')}`;
  const el = document.getElementById('popupSelectedAccPath');
  if (el) el.innerHTML = pathStr;
}

function openAddAccountInPopup(parentId = null) {
  const form = document.getElementById('popupAccCrudForm');
  if (!form) return;
  
  let targetParentId = parentId;
  
  if (targetParentId === null && lastSelectedPopupAccId !== null) {
    targetParentId = lastSelectedPopupAccId;
  }
  
  let targetType = 'گروه';
  let parentAcc = null;
  
  if (targetParentId !== null) {
    parentAcc = AppState.accounts.find(a => a.id === targetParentId);
    if (parentAcc) {
      const nextLevelMap = {
        'گروه': 'کل',
        'کل': 'معین',
        'معین': 'تفصیلی',
        'تفصیلی': 'تفصیلی'
      };
      targetType = nextLevelMap[parentAcc.type] || 'تفصیلی';
    }
  }
  
  const titleEl = document.getElementById('popupAccCrudTitle');
  if (titleEl) {
    if (targetParentId !== null && parentAcc) {
      titleEl.innerHTML = `افزودن حساب جدید <span style="font-size:0.75rem;color:var(--accent-color);font-weight:normal;margin-right:6px;">(به عنوان فرزندِ "${parentAcc.name}")</span> 
        <button class="btn btn-outline" style="padding:1px 6px;font-size:0.7rem;margin-right:12px;" onclick="resetPopupParentSelection(event)">🔄 ایجاد به عنوان حساب اصلی (گروه)</button>`;
    } else {
      titleEl.innerHTML = `افزودن حساب جدید <span style="font-size:0.75rem;color:var(--text-muted);font-weight:normal;margin-right:6px;">(به عنوان حساب اصلی / گروه)</span>`;
    }
  }
  
  document.getElementById('popupAccCrudParentId').value = targetParentId || '';
  document.getElementById('popupAccCrudEditId').value = '';
  document.getElementById('popupAccCrudType').value = targetType;
  document.getElementById('popupAccCrudCode').value = suggestNextAccountCode(targetType, targetParentId);
  document.getElementById('popupAccCrudName').value = '';
  document.getElementById('popupAccCrudNature').value = parentAcc ? parentAcc.nature : 'بدهکار';
  
  form.style.display = 'block';
}

function resetPopupParentSelection(e) {
  if (e) e.preventDefault();
  lastSelectedPopupAccId = null;
  openAddAccountInPopup();
}

function openEditAccountInPopup(id) {
  const acc = AppState.accounts.find(x => x.id === id);
  if (!acc) return;
  
  const form = document.getElementById('popupAccCrudForm');
  if (!form) return;
  
  form.style.display = 'block';
  document.getElementById('popupAccCrudTitle').textContent = 'ویرایش سرفصل حساب';
  document.getElementById('popupAccCrudParentId').value = acc.parentId || '';
  document.getElementById('popupAccCrudEditId').value = acc.id;
  document.getElementById('popupAccCrudCode').value = acc.code;
  document.getElementById('popupAccCrudName').value = acc.name;
  document.getElementById('popupAccCrudNature').value = acc.nature;
  document.getElementById('popupAccCrudType').value = acc.type;
}

function cancelAccountInPopup() {
  const form = document.getElementById('popupAccCrudForm');
  if (form) form.style.display = 'none';
}

function saveAccountInPopup() {
  const parentIdStr = document.getElementById('popupAccCrudParentId').value;
  const editIdStr = document.getElementById('popupAccCrudEditId').value;
  const code = document.getElementById('popupAccCrudCode').value.trim();
  const name = document.getElementById('popupAccCrudName').value.trim();
  const nature = document.getElementById('popupAccCrudNature').value;
  const type = document.getElementById('popupAccCrudType').value;
  
  if (!code || !name) {
    alert('لطفاً کد و نام سرفصل را وارد کنید.');
    return;
  }
  
  if (editIdStr) {
    // Edit existing account
    const id = Number(editIdStr);
    const acc = AppState.accounts.find(x => x.id === id);
    if (acc) {
      acc.code = code;
      acc.name = name;
      acc.nature = nature;
      acc.type = type;
    }
  } else {
    // Add new account
    const newId = AppState.accounts.length > 0 ? Math.max(...AppState.accounts.map(x => x.id)) + 1 : 1;
    const parentId = parentIdStr ? Number(parentIdStr) : null;
    AppState.accounts.push({
      id: newId,
      code: code,
      name: name,
      type: type,
      nature: nature,
      parentId: parentId
    });
  }
  
  // Refresh accounts table inside both popup and coding tab
  renderPopupAccounts();
  if (typeof renderAccountsTable === 'function') {
    renderAccountsTable();
  }
  
  // Hide Form
  cancelAccountInPopup();
}

function deleteAccountInPopup(id) {
  if (confirm('آیا مایل به حذف این سرفصل هستید؟')) {
    const idx = AppState.accounts.findIndex(x => x.id === id);
    if (idx !== -1) {
      AppState.accounts.splice(idx, 1);
      renderPopupAccounts();
      if (typeof renderAccountsTable === 'function') {
        renderAccountsTable();
      }
    }
  }
}

// ==========================================
// Shenavars Popup Dialog (Floating Accounts Selection)
// ==========================================
let activeShPopupRowIndex = null;
let lastSelectedPopupShenavarId = null;

function openShPopup(rowIndex) {
  activeShPopupRowIndex = rowIndex;
  lastSelectedPopupShenavarId = null;
  
  // Clear search inputs
  const sc = document.getElementById('popupSearchShCode');
  const sn = document.getElementById('popupSearchShName');
  if (sc) sc.value = '';
  if (sn) sn.value = '';
  
  // Close any open CRUD form in popup
  cancelShenavarInPopup();
  
  // Render
  renderPopupShenavars();
  
  // Show modal
  const modal = document.getElementById('shPopupModal');
  if (modal) modal.style.display = 'flex';
  
  // Set date/time in status bar
  const dateEl = document.getElementById('popupShStatusBarDate');
  const timeEl = document.getElementById('popupShStatusBarTime');
  const userEl = document.getElementById('popupShStatusUser');
  const compEl = document.getElementById('popupShStatusCompany');
  const yearEl = document.getElementById('popupShStatusYear');
  
  if (dateEl && PersianCal && typeof PersianCal.getTodayString === 'function') {
    dateEl.textContent = PersianCal.getTodayString();
  }
  if (timeEl) {
    const now = new Date();
    timeEl.textContent = now.toTimeString().split(' ')[0];
  }
  if (userEl && currentUser) userEl.textContent = currentUser.fullName;
  if (compEl && SessionState.company) compEl.textContent = SessionState.company.name;
  if (yearEl && SessionState.year) yearEl.textContent = `سال مالی: ${SessionState.year}`;
}

function closeShPopup() {
  const modal = document.getElementById('shPopupModal');
  if (modal) modal.style.display = 'none';
}

function renderPopupShenavars() {
  const tbody = document.getElementById('popupShenavarsTableBody');
  if (!tbody) return;
  
  const searchCode = (document.getElementById('popupSearchShCode')?.value || '').trim();
  const searchName = (document.getElementById('popupSearchShName')?.value || '').trim().toLowerCase();
  
  const sortedShenavars = sortTreePreOrder(AppState.shenavars);
  let list;
  
  const isSearching = (searchCode || searchName);
  
  if (isSearching) {
    list = sortedShenavars.filter(s => {
      const matchCode = searchCode ? s.code.includes(searchCode) : true;
      const matchName = searchName ? s.name.toLowerCase().includes(searchName) : true;
      return matchCode && matchName;
    });
  } else {
    list = sortedShenavars.filter(isShenavarVisible);
  }
  
  tbody.innerHTML = list.map(s => {
    const level = getShenavarLevel(s);
    const hasChildren = AppState.shenavars.some(child => child.parentId === s.id);
    const isExpanded = expandedShenavarIds.has(s.id);
    
    // Toggle button in popup
    const toggleBtnHtml = hasChildren
      ? `<button class="tree-toggle-btn ${isExpanded ? 'expanded' : ''}" onclick="event.stopPropagation(); togglePopupShenavarExpand(${s.id})">${isExpanded ? '-' : '+'}</button>`
      : `<button class="tree-toggle-btn" style="visibility:hidden; width:16px;">+</button>`;
      
    const indentPx = level * 18;
    const isSelected = (s.code === AppState.sanadLines[activeShPopupRowIndex]?.shenavarCode);
    
    return `
      <tr onclick="updatePopupSelectedShPath(${JSON.stringify(s).replace(/"/g, '&quot;')})" style="cursor:pointer; height:26px; ${isSelected ? 'background-color:rgba(2,132,199,0.18) !important;' : ''}">
        <!-- Expand/Collapse Button -->
        <td style="text-align:center; vertical-align:middle;">
          ${toggleBtnHtml}
        </td>
        <!-- Select Button -->
        <td style="text-align:center;">
          <button class="btn btn-outline" style="padding:1px 6px; font-size:0.75rem; border-color:#10b981; color:#10b981; font-weight:bold;" onclick="event.stopPropagation(); selectShenavarInPopup('${s.code}')">انتخاب</button>
        </td>
        <!-- Edit Button -->
        <td style="text-align:center;">
          <button class="btn btn-outline" style="padding:1px 6px; font-size:0.75rem;" onclick="event.stopPropagation(); openEditShenavarInPopup(${s.id})">ویرایش</button>
        </td>
        <!-- Delete Button -->
        <td style="text-align:center;">
          <button class="btn btn-outline" style="padding:1px 6px; font-size:0.75rem; color:red;" onclick="event.stopPropagation(); deleteShenavarInPopup(${s.id})">حذف</button>
        </td>
        <!-- Code -->
        <td style="padding:4px 8px; font-weight:bold; font-size:0.8rem;">${s.code}</td>
        <!-- Name (with tree indentation) -->
        <td style="padding:4px 8px; padding-right:${indentPx + 10}px; font-size:0.8rem; text-align:right;">
          ${level > 0 ? '<span style="color:var(--accent-color);margin-left:6px;">└─</span>' : ''}
          <b>${s.name}</b>
        </td>
        <!-- Active Checkbox -->
        <td style="text-align:center;">
          <input type="checkbox" checked disabled />
        </td>
      </tr>
    `;
  }).join('');
}

function togglePopupShenavarExpand(shenId) {
  if (expandedShenavarIds.has(shenId)) {
    expandedShenavarIds.delete(shenId);
  } else {
    expandedShenavarIds.add(shenId);
  }
  renderPopupShenavars();
  if (typeof renderShenavaarTable === 'function') {
    renderShenavaarTable();
  }
}

function filterPopupShenavars() {
  renderPopupShenavars();
}

function selectShenavarInPopup(code) {
  if (activeShPopupRowIndex !== null && AppState.sanadLines[activeShPopupRowIndex]) {
    AppState.sanadLines[activeShPopupRowIndex].shenavarCode = code;
    
    // Rerender row template to show the new value in text box
    renderSanadEditorLines();
    
    // Also, trigger manual path update for header
    updateFocusedPaths(activeShPopupRowIndex);
  }
  closeShPopup();
}

function updatePopupSelectedShPath(s) {
  lastSelectedPopupShenavarId = s.id;
  let curr = s;
  const pathParts = [];
  while (curr) {
    pathParts.unshift(`${curr.code} : ${curr.name}`);
    curr = curr.parentId ? AppState.shenavars.find(x => x.id === curr.parentId) : null;
  }
  const levelText = getShenavarLevel(s) === 0 ? 'گروه اصلی' : 'زیرمجموعه';
  const pathStr = `سطح شناور جاری: ${levelText} / زنجیره: ${pathParts.join(' / ')}`;
  const el = document.getElementById('popupSelectedShPath');
  if (el) el.innerHTML = pathStr;
}

function openAddShenavarInPopup(parentId = null) {
  const form = document.getElementById('popupShCrudForm');
  if (!form) return;
  
  let targetParentId = parentId;
  
  if (targetParentId === null && lastSelectedPopupShenavarId !== null) {
    targetParentId = lastSelectedPopupShenavarId;
  }
  
  let parentShen = null;
  if (targetParentId !== null) {
    parentShen = AppState.shenavars.find(s => s.id === targetParentId);
  }
  
  const titleEl = document.getElementById('popupShCrudTitle');
  if (titleEl) {
    if (targetParentId !== null && parentShen) {
      titleEl.innerHTML = `افزودن حساب شناور جدید <span style="font-size:0.75rem;color:var(--accent-color);font-weight:normal;margin-right:6px;">(به عنوان فرزندِ "${parentShen.name}")</span> 
        <button class="btn btn-outline" style="padding:1px 6px;font-size:0.7rem;margin-right:12px;" onclick="resetPopupShenavarParentSelection(event)">🔄 ایجاد به عنوان شناور اصلی</button>`;
    } else {
      titleEl.innerHTML = `افزودن حساب شناور جدید <span style="font-size:0.75rem;color:var(--text-muted);font-weight:normal;margin-right:6px;">(به عنوان شناور اصلی)</span>`;
    }
  }
  
  document.getElementById('popupShCrudParentId').value = targetParentId || '';
  document.getElementById('popupShCrudEditId').value = '';
  document.getElementById('popupShCrudCode').value = suggestNextShenavarCode(targetParentId);
  document.getElementById('popupShCrudName').value = '';
  document.getElementById('popupShCrudStatus').value = 'فعال';
  
  form.style.display = 'block';
}

function resetPopupShenavarParentSelection(e) {
  if (e) e.preventDefault();
  lastSelectedPopupShenavarId = null;
  openAddShenavarInPopup();
}

function openEditShenavarInPopup(id) {
  const s = AppState.shenavars.find(x => x.id === id);
  if (!s) return;
  
  const form = document.getElementById('popupShCrudForm');
  if (!form) return;
  
  form.style.display = 'block';
  document.getElementById('popupShCrudTitle').textContent = 'ویرایش حساب شناور';
  document.getElementById('popupShCrudParentId').value = s.parentId || '';
  document.getElementById('popupShCrudEditId').value = s.id;
  document.getElementById('popupShCrudCode').value = s.code;
  document.getElementById('popupShCrudName').value = s.name;
  document.getElementById('popupShCrudStatus').value = s.status || 'فعال';
}

function cancelShenavarInPopup() {
  const form = document.getElementById('popupShCrudForm');
  if (form) form.style.display = 'none';
}

function saveShenavarInPopup() {
  const parentIdStr = document.getElementById('popupShCrudParentId').value;
  const editIdStr = document.getElementById('popupShCrudEditId').value;
  const code = document.getElementById('popupShCrudCode').value.trim();
  const name = document.getElementById('popupShCrudName').value.trim();
  const status = document.getElementById('popupShCrudStatus').value;
  
  if (!code || !name) {
    alert('لطفاً کد و عنوان شناور را وارد کنید.');
    return;
  }
  
  if (editIdStr) {
    // Edit existing
    const id = Number(editIdStr);
    const s = AppState.shenavars.find(x => x.id === id);
    if (s) {
      s.code = code;
      s.name = name;
      s.status = status;
    }
  } else {
    // Add new
    const newId = AppState.shenavars.length > 0 ? Math.max(...AppState.shenavars.map(x => x.id)) + 1 : 1;
    const parentId = parentIdStr ? Number(parentIdStr) : null;
    AppState.shenavars.push({
      id: newId,
      code: code,
      name: name,
      parentId: parentId,
      status: status
    });
  }
  
  // Refresh lists
  renderPopupShenavars();
  if (typeof renderShenavaarTable === 'function') {
    renderShenavaarTable();
  }
  
  cancelShenavarInPopup();
}

function deleteShenavarInPopup(id) {
  if (confirm('آیا مایل به حذف این حساب شناور هستید؟')) {
    const idx = AppState.shenavars.findIndex(x => x.id === id);
    if (idx !== -1) {
      AppState.shenavars.splice(idx, 1);
      renderPopupShenavars();
      if (typeof renderShenavaarTable === 'function') {
        renderShenavaarTable();
      }
    }
  }
}

function isValidJalaliDate(dateStr) {
  if (!dateStr) return false;
  const regex = /^\d{4}\/\d{2}\/\d{2}$/;
  if (!regex.test(dateStr)) return false;
  
  const parts = dateStr.split('/');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  
  if (isNaN(y) || isNaN(m) || isNaN(d)) return false;
  if (y < 1300 || y > 1500) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1) return false;
  
  if (m >= 1 && m <= 6) {
    if (d > 31) return false;
  } else if (m >= 7 && m <= 11) {
    if (d > 30) return false;
  } else if (m === 12) {
    if (d > 30) return false;
  }
  return true;
}

function openNewSanadForm() {
  AppState.openedFromMoghayerat = false;
  AppState.tempAttachments = null; // Clear attachments draft
  initVoucherAttachments(); // Guarantees AppState.sanadAttachments is initialized
  const nextNo = AppState.sanads.length > 0 ? Math.max(...AppState.sanads.map(s => Number(s.id))) + 1 : 101;
  showForm('form-sanad2');
  
  const numInput = document.getElementById('sanadNumberInput');
  if (numInput) {
    numInput.value = nextNo;
    numInput.readOnly = false; // Allow editing number for new vouchers
  }
  
  const todayStr = (PersianCal && typeof PersianCal.getTodayString === 'function') 
    ? PersianCal.getTodayString() 
    : '1403/05/11';
  document.getElementById('sanadDateInput').value = todayStr;
  document.getElementById('sanadDescInput').value = '';
  
  focusedLineIndex = 0;
  AppState.sanadLines = [
    { account: '110101', shenavarCode: '', desc: 'توضیحات ردیف ۱', debit: 0, credit: 0, txNo: '', txDate: '' },
    { account: '210101', shenavarCode: '', desc: 'توضیحات ردیف ۲', debit: 0, credit: 0, txNo: '', txDate: '' }
  ];

  // Store original state for new voucher
  originalSanadState = {
    isNew: true,
    id: nextNo,
    date: todayStr,
    desc: '',
    lines: JSON.parse(JSON.stringify(AppState.sanadLines)),
    attachments: []
  };

  renderSanadEditorLines();
}

function getSanadUnsavedChanges() {
  if (!originalSanadState) return null;
  
  const currentDate = document.getElementById('sanadDateInput')?.value || '';
  const currentDesc = document.getElementById('sanadDescInput')?.value || '';
  const currentLines = AppState.sanadLines || [];
  const currentAttachments = AppState.tempAttachments || [];
  
  const orig = originalSanadState;
  const changes = [];
  
  if (orig.isNew) {
    const dateChanged = (currentDate !== orig.date);
    const descEntered = (currentDesc.trim() !== '');
    const linesLengthChanged = (currentLines.length !== orig.lines.length);
    
    let linesModified = false;
    const lineDetails = [];
    
    currentLines.forEach((line, i) => {
      const origLine = orig.lines[i];
      if (!origLine) {
        lineDetails.push(`ردیف جدید ${i + 1} ایجاد شده است.`);
        linesModified = true;
      } else {
        const accChanged = (line.account !== origLine.account);
        const descChanged = (line.desc && line.desc !== origLine.desc && line.desc !== 'توضیحات ردیف ' + (i+1));
        const debitChanged = (Number(line.debit || 0) !== Number(origLine.debit || 0));
        const creditChanged = (Number(line.credit || 0) !== Number(origLine.credit || 0));
        const txNoChanged = (line.txNo && line.txNo !== origLine.txNo);
        const txDateChanged = (line.txDate && line.txDate !== origLine.txDate);
        const shenavarChanged = (line.shenavarCode && line.shenavarCode !== origLine.shenavarCode);
        
        if (accChanged || descChanged || debitChanged || creditChanged || txNoChanged || txDateChanged || shenavarChanged) {
          let parts = [];
          if (accChanged) parts.push(`سرفصل: ${line.account}`);
          if (debitChanged) parts.push(`بدهکار: ${line.debit}`);
          if (creditChanged) parts.push(`بستانکار: ${line.credit}`);
          if (descChanged) parts.push(`شرح ردیف: ${line.desc}`);
          if (txNoChanged) parts.push(`شماره تراکنش: ${line.txNo}`);
          if (txDateChanged) parts.push(`تاریخ تراکنش: ${line.txDate}`);
          if (shenavarChanged) parts.push(`شناور: ${line.shenavarCode}`);
          
          lineDetails.push(`در ردیف ${i + 1} اطلاعات وارد شده است (${parts.join('، ')}).`);
          linesModified = true;
        }
        
        if (line.txDate && !isValidJalaliDate(line.txDate)) {
          lineDetails.push(`⚠️ فرمت تاریخ تراکنش در ردیف ${i + 1} نامعتبر است (${line.txDate}).`);
          linesModified = true;
        }
        if (line.txDate && isValidJalaliDate(line.txDate) && currentDate && isValidJalaliDate(currentDate) && line.txDate > currentDate) {
          lineDetails.push(`⚠️ تاریخ تراکنش در ردیف ${i + 1} (${line.txDate}) بزرگتر از تاریخ سند (${currentDate}) است.`);
          linesModified = true;
        }
      }
    });
    
    const hasAttachments = (currentAttachments.length > 0);
    const dateInvalid = (currentDate && !isValidJalaliDate(currentDate));
    
    if (dateChanged || descEntered || linesLengthChanged || linesModified || hasAttachments || dateInvalid) {
      if (dateChanged) {
        changes.push(`- تاریخ سند به "${currentDate}" تغییر یافته است.`);
      }
      if (dateInvalid) {
        changes.push(`- ⚠️ تاریخ سند وارد شده نامعتبر است (${currentDate}).`);
      }
      if (descEntered) changes.push(`- شرح سند به "${currentDesc}" تغییر یافته است.`);
      if (hasAttachments) changes.push(`- ضمائم جدید به سند اضافه شده است.`);
      lineDetails.forEach(det => changes.push(`- ${det}`));
    }
  } else {
    if (currentDate !== orig.date) {
      changes.push(`- تاریخ سند از "${orig.date}" به "${currentDate}" تغییر یافته است.`);
    }
    if (currentDate && !isValidJalaliDate(currentDate)) {
      changes.push(`- ⚠️ فرمت تاریخ سند جدید نامعتبر است (${currentDate}).`);
    }
    if (currentDesc !== orig.desc) {
      changes.push(`- شرح سند از "${orig.desc}" به "${currentDesc}" تغییر یافته است.`);
    }
    
    const maxLen = Math.max(orig.lines.length, currentLines.length);
    for (let i = 0; i < maxLen; i++) {
      const origLine = orig.lines[i];
      const curLine = currentLines[i];
      
      if (origLine && !curLine) {
        changes.push(`- ردیف شماره ${i + 1} سند حذف شده است.`);
      } else if (!origLine && curLine) {
        changes.push(`- ردیف شماره ${i + 1} جدید به سند اضافه شده است.`);
      } else if (origLine && curLine) {
        const diffs = [];
        if (curLine.account !== origLine.account) diffs.push(`سرفصل از "${origLine.account}" به "${curLine.account}"`);
        if (Number(curLine.debit || 0) !== Number(origLine.debit || 0)) diffs.push(`بدهکار از ${Number(origLine.debit || 0).toLocaleString()} به ${Number(curLine.debit || 0).toLocaleString()}`);
        if (Number(curLine.credit || 0) !== Number(origLine.credit || 0)) diffs.push(`بستانکار از ${Number(origLine.credit || 0).toLocaleString()} به ${Number(curLine.credit || 0).toLocaleString()}`);
        if ((curLine.desc || '') !== (origLine.desc || '')) diffs.push(`شرح ردیف از "${origLine.desc || ''}" به "${curLine.desc || ''}"`);
        if ((curLine.shenavarCode || '') !== (origLine.shenavarCode || '')) diffs.push(`شناور از "${origLine.shenavarCode || ''}" به "${curLine.shenavarCode || ''}"`);
        if ((curLine.txNo || '') !== (origLine.txNo || '')) diffs.push(`شماره تراکنش از "${origLine.txNo || ''}" به "${curLine.txNo || ''}"`);
        
        if ((curLine.txDate || '') !== (origLine.txDate || '')) {
          diffs.push(`تاریخ تراکنش از "${origLine.txDate || ''}" به "${curLine.txDate || ''}"`);
        }
        if (curLine.txDate && !isValidJalaliDate(curLine.txDate)) {
          diffs.push(`⚠️ فرمت تاریخ تراکنش نامعتبر است (${curLine.txDate})`);
        }
        if (curLine.txDate && isValidJalaliDate(curLine.txDate) && currentDate && isValidJalaliDate(currentDate) && curLine.txDate > currentDate) {
          diffs.push(`⚠️ تاریخ تراکنش (${curLine.txDate}) بزرگتر از تاریخ سند (${currentDate}) است`);
        }
        
        if (diffs.length > 0) {
          changes.push(`- ردیف شماره ${i + 1} تغییر کرده است (${diffs.join('، ')}).`);
        }
      }
    }
    
    const origAttsStr = JSON.stringify(orig.attachments);
    const curAttsStr = JSON.stringify(currentAttachments);
    if (origAttsStr !== curAttsStr) {
      changes.push(`- ضمائم یا عکس‌های پیوست سند تغییر کرده است.`);
    }
  }
  
  return changes;
}

function closeSanadEditor() {
  const changes = getSanadUnsavedChanges();
  if (changes && changes.length > 0) {
    const isNew = originalSanadState.isNew;
    let msg = '';
    if (isNew) {
      msg = `⚠️ اطلاعات زیر در سند جدید وارد شده و در صورت خروج بدون ذخیره، از بین خواهند رفت:\n\n` + 
            changes.join('\n') + 
            `\n\nآیا از خروج بدون ذخیره اطمینان دارید؟`;
    } else {
      msg = `⚠️ تغییرات زیر در سند شماره #${originalSanadState.id} اعمال شده ولی ذخیره نشده‌اند و در صورت خروج، لغو خواهند شد:\n\n` + 
            changes.join('\n') + 
            `\n\nآیا از خروج بدون ذخیره و لغو تغییرات اطمینان دارید؟`;
    }
    
    if (!confirm(msg)) {
      return; // cancel exit
    }
  }

  AppState.tempAttachments = null; // Discard attachments draft
  originalSanadState = null;
  if (AppState.openedFromMoghayerat) {
    AppState.openedFromMoghayerat = false;
    showForm('form-hesabdari-main');
    switchHesabdariTab('bank');
    switchBankSubtab('reconcile');
    renderMoghayeratReconcilePanel();
  } else {
    showForm('form-hesabdari-main');
    switchHesabdariTab('sanad');
    renderSanadListTable();
  }
}

function saveSanadEntry() {
  const td = AppState.sanadLines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const tc = AppState.sanadLines.reduce((s, l) => s + Number(l.credit || 0), 0);
  
  const isUnbalanced = (td !== tc);
  if (isUnbalanced) {
    const confirmSave = confirm("توجه: این سند نامتوازن است (جمع بدهکار و بستانکار برابر نیست). آیا می‌خواهید سند را به صورت نامتوازن ذخیره کنید تا بعداً آن را ویرایش و تکمیل کنید؟");
    if (!confirmSave) return;
  }

  const no = Number(document.getElementById('sanadNumberInput')?.value);
  const date = document.getElementById('sanadDateInput')?.value;
  const desc = document.getElementById('sanadDescInput')?.value || 'سند حسابداری';

  if (isNaN(no) || no <= 0) { alert('شماره سند نامعتبر است.'); return; }

  // Strictly validate date formats
  if (!isValidJalaliDate(date)) {
    alert(`خطا: فرمت تاریخ سند نامعتبر است (${date}). تاریخ باید به فرمت معتبر yyyy/mm/dd وارد شود.`);
    return;
  }

  for (let i = 0; i < AppState.sanadLines.length; i++) {
    const line = AppState.sanadLines[i];
    if (line.txDate && !isValidJalaliDate(line.txDate)) {
      alert(`خطا: فرمت تاریخ تراکنش در ردیف ${i + 1} نامعتبر است (${line.txDate}). تاریخ باید به فرمت معتبر yyyy/mm/dd وارد شود.`);
      return;
    }
    if (line.txDate && isValidJalaliDate(line.txDate) && line.txDate > date) {
      alert(`خطا: تاریخ تراکنش در ردیف ${i + 1} (${line.txDate}) نمی‌تواند از تاریخ سند (${date}) بزرگتر باشد.`);
      return;
    }
  }

  const existingIdx = AppState.sanads.findIndex(x => x.id === no);
  
  if (originalSanadState && originalSanadState.isNew) {
    if (existingIdx !== -1) {
      alert(`خطا: سند شماره ${no} قبلاً در سیستم ثبت شده است. لطفاً از شماره دیگری استفاده کنید.`);
      return;
    }
  }

  if (existingIdx !== -1) {
    const s = AppState.sanads[existingIdx];
    if (s.bakhshId && s.bakhshId !== getCurrentBakhshId()) {
      alert('شما مجاز به ویرایش این سند نیستید.');
      return;
    }
    AppState.sanads[existingIdx] = {
      ...s,
      date,
      desc,
      debit: td,
      credit: tc,
      status: isUnbalanced ? ((td > tc) ? 'بدهکار' : 'بستانکار') : ((s.status === 'بدهکار' || s.status === 'بستانکار' || s.status === 'نامتوازن') ? 'موقت' : s.status),
      dayOfYear: getJalaliDayOfYear(date)
    };
    alert(`سند شماره ${no} با موفقیت ویرایش شد.`);
  } else {
    AppState.sanads.push({ 
      id: no, 
      date, 
      desc, 
      debit: td, 
      credit: tc, 
      status: isUnbalanced ? ((td > tc) ? 'بدهکار' : 'بستانکار') : 'موقت', 
      bakhshId: getCurrentBakhshId(),
      dayOfYear: getJalaliDayOfYear(date)
    });
    alert(`سند شماره ${no} با موفقیت ثبت شد.`);
  }

  // Save detailed lines in detailed database
  AppState.voucherDetails = AppState.voucherDetails || {};
  AppState.voucherDetails[no] = JSON.parse(JSON.stringify(AppState.sanadLines));

  // COMMIT ATTACHMENTS TRANSACTION
  if (AppState.tempAttachments) {
    AppState.sanadAttachments[no] = AppState.tempAttachments;
    AppState.tempAttachments = null;
  }

  originalSanadState = null; // Clear original state after save
  AppState.sanadLines = [{ account: '110101', shenavarCode: '', desc: '', debit: 0, credit: 0, txNo: '', txDate: '' }];
  closeSanadEditor();
}

// ============================
// INVENTORY MODULE
// ============================
function renderProductsTable() {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;
  tbody.innerHTML = AppState.products.map(p => `
    <tr>
      <td><b>${p.code}</b></td>
      <td>${p.name}</td>
      <td>${p.unit}</td>
      <td style="font-size:0.8rem;">${p.barcode}</td>
      <td>${p.price.toLocaleString()} ریال</td>
      <td>${p.stock}</td>
      <td>
        <button class="btn btn-outline" style="padding:3px 8px;">✏️ ویرایش</button>
        <button class="btn btn-outline" style="padding:3px 8px;color:red;" onclick="deleteProduct(${p.id})">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function openAddProductRow() {
  document.getElementById('addProductRow').style.display = 'block';
  document.getElementById('newProdCode').focus();
}

function saveNewProduct() {
  const code = document.getElementById('newProdCode')?.value?.trim();
  const name = document.getElementById('newProdName')?.value?.trim();
  const unit = document.getElementById('newProdUnit')?.value;
  const price = Number(document.getElementById('newProdPrice')?.value || 0);
  const stock = Number(document.getElementById('newProdStock')?.value || 0);
  if (!code || !name) { alert('کد کالا و نام کالا الزامی است.'); return; }
  AppState.products.push({ id: Date.now(), code, name, unit, price, stock, barcode: '690' + Math.floor(Math.random() * 1e9) });
  document.getElementById('newProdCode').value = '';
  document.getElementById('newProdName').value = '';
  document.getElementById('addProductRow').style.display = 'none';
  renderProductsTable();
  alert(`کالای "${name}" با موفقیت ثبت شد.`);
}

function deleteProduct(id) {
  if (confirm('حذف این کالا؟')) {
    AppState.products = AppState.products.filter(p => p.id !== id);
    renderProductsTable();
  }
}

function renderWarehousesTable() {
  const tbody = document.getElementById('warehousesTableBody');
  if (!tbody) return;
  tbody.innerHTML = AppState.warehouses.map(w => `
    <tr>
      <td><b>${w.code}</b></td>
      <td>${w.name}</td>
      <td>${w.type}</td>
      <td>${w.keeper}</td>
      <td>${w.location}</td>
      <td>${w.allowNeg ? 'بله' : 'خیر'}</td>
      <td><button class="btn btn-outline" style="padding:3px 8px;">✏️ ویرایش</button></td>
    </tr>
  `).join('');
}

function renderPurchaseInvoicesTable() {
  const tbody = document.getElementById('purchaseInvoicesBody');
  if (!tbody) return;
  tbody.innerHTML = AppState.purchaseInvoices.map(inv => `
    <tr>
      <td><b>${inv.id}</b></td>
      <td>${inv.date}</td>
      <td>${inv.party}</td>
      <td>${inv.warehouse}</td>
      <td>${inv.total.toLocaleString()} ریال</td>
      <td><span class="badge badge-success">${inv.status}</span></td>
      <td><button class="btn btn-outline" style="padding:3px 8px;">📋 جزئیات</button></td>
    </tr>
  `).join('');
}

function renderSalesInvoicesTable() {
  const tbody = document.getElementById('salesInvoicesBody');
  if (!tbody) return;
  tbody.innerHTML = AppState.salesInvoices.map(inv => `
    <tr>
      <td><b>${inv.id}</b></td>
      <td>${inv.date}</td>
      <td>${inv.party}</td>
      <td>${inv.warehouse}</td>
      <td>${inv.total.toLocaleString()} ریال</td>
      <td><span class="badge badge-success">${inv.status}</span></td>
      <td><button class="btn btn-outline" style="padding:3px 8px;">📋 جزئیات</button></td>
    </tr>
  `).join('');
}

function showCardex() {
  document.getElementById('cardexResult').style.display = 'block';
  document.getElementById('cardexTableBody').innerHTML = `
    <tr><td>1403/01/05</td><td>موجودی اول دوره</td><td>100</td><td>-</td><td>100</td><td>390,000,000</td><td>39,000,000,000</td></tr>
    <tr><td>1403/05/02</td><td>رسید خرید PINV-4001</td><td>50</td><td>-</td><td>150</td><td>392,000,000</td><td>58,800,000,000</td></tr>
    <tr><td>1403/05/08</td><td>حواله فروش INV-8001</td><td>-</td><td>25</td><td>125</td><td>391,333,333</td><td>48,916,666,625</td></tr>
  `;
}

// ============================
// SYSTEM MODULE
// ============================
function doBackup() {
  const name = document.getElementById('backupFileName')?.value || 'backup.sql';
  const log = document.getElementById('backupLog');
  if (log) {
    log.style.display = 'block';
    log.innerHTML = `
      <div class="log-line">▶ شروع پشتیبان‌گیری از دیتابیس negar_db ...</div>
      <div class="log-line">✔ جدول users: 3 رکورد</div>
      <div class="log-line">✔ جدول accounts: 13 رکورد</div>
      <div class="log-line">✔ جدول sanads: 2 رکورد</div>
      <div class="log-line">✔ جدول products: 2 رکورد</div>
      <div class="log-line" style="color:var(--success-color);">✅ پشتیبان‌گیری با موفقیت کامل شد → ${name}</div>
    `;
  }
}

function doRestore() {
  const file = document.getElementById('restoreFile')?.files[0];
  if (!file) { alert('لطفاً فایل پشتیبان را انتخاب کنید.'); return; }
  if (confirm(`آیا از بازیابی فایل "${file.name}" اطمینان دارید؟ این عملیات تمامی داده‌های فعلی را جایگزین می‌کند!`)) {
    setTimeout(() => alert('✅ بازیابی دیتابیس با موفقیت انجام شد.'), 1000);
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  alert(`تم "${theme}" با موفقیت اعمال شد.`);
}

function lockApp() {
  const pwd = document.getElementById('lockPassword')?.value;
  if (!pwd) { alert('لطفاً رمز قفل را وارد کنید.'); return; }
  alert('برنامه قفل شد. برای ورود مجدد رمز عبور خود را وارد کنید.');
}

// ============================
// COMPANIES MODULE
// ============================
function renderCompaniesTable() {
  const tbody = document.getElementById('companiesTableBody');
  if (!tbody) return;
  tbody.innerHTML = AppState.companies.map(c => `
    <tr>
      <td><b>${c.code}</b></td>
      <td><b>${c.name}</b></td>
      <td style="font-size:0.82rem;">${c.ecoCode || '-'}</td>
      <td>${c.phone || '-'}</td>
      <td style="font-size:0.82rem;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${c.address || ''}">${c.address || '-'}</td>
      <td style="text-align:center;"><span class="badge badge-success">${c.activeYear}</span></td>
      <td>
        <button class="btn btn-outline" style="padding:3px 10px;" onclick="openCompanyForm(${c.id})">✏️ ویرایش</button>
        <button class="btn btn-outline" style="padding:3px 10px;color:red;" onclick="deleteCompany(${c.id})">🗑️ حذف</button>
      </td>
    </tr>
  `).join('');
}

function switchCompanyFormTab(tabId) {
  // Hide all sections
  document.querySelectorAll('.company-form-section-tab').forEach(sec => {
    sec.style.display = 'none';
  });
  // Show target section
  const target = document.getElementById(`compSec-${tabId}`);
  if (target) target.style.display = 'block';

  // Manage tab button states
  const btns = [
    { id: 'tabBtn-general', key: 'general' },
    { id: 'tabBtn-location', key: 'location' },
    { id: 'tabBtn-bank', key: 'bank' },
    { id: 'tabBtn-tax', key: 'tax' },
    { id: 'tabBtn-license', key: 'license' },
    { id: 'tabBtn-sign', key: 'sign' }
  ];
  btns.forEach(b => {
    const btnEl = document.getElementById(b.id);
    if (btnEl) {
      if (b.key === tabId) {
        btnEl.classList.add('active-company-tab');
      } else {
        btnEl.classList.remove('active-company-tab');
      }
    }
  });
}

function addCompBankAccountRow(data = {}) {
  const tbody = document.getElementById('compBankAccountsTableBody');
  if (!tbody) return;

  const row = document.createElement('tr');
  row.className = 'comp-bank-account-row';
  row.innerHTML = `
    <td><input type="text" class="form-input comp-bank-name" style="padding:4px 8px; font-size:0.8rem; background:var(--bg-primary);" value="${data.bankName || ''}" placeholder="مثال: ملی" /></td>
    <td><input type="text" class="form-input comp-bank-branch" style="padding:4px 8px; font-size:0.8rem; background:var(--bg-primary);" value="${data.branchName || ''}" placeholder="مثال: مرکزی" /></td>
    <td><input type="text" class="form-input comp-bank-type" style="padding:4px 8px; font-size:0.8rem; background:var(--bg-primary);" value="${data.accountType || ''}" placeholder="مثال: جاری" /></td>
    <td><input type="text" class="form-input comp-bank-no" style="padding:4px 8px; font-size:0.8rem; font-family:monospace; background:var(--bg-primary);" value="${data.accountNo || ''}" /></td>
    <td><input type="text" class="form-input comp-bank-shiba" style="padding:4px 8px; font-size:0.8rem; font-family:monospace; background:var(--bg-primary);" value="${data.shiba || ''}" placeholder="IR..." /></td>
    <td><input type="text" class="form-input comp-bank-card" style="padding:4px 8px; font-size:0.8rem; font-family:monospace; background:var(--bg-primary);" value="${data.cardNo || ''}" /></td>
    <td><input type="text" class="form-input comp-bank-address" style="padding:4px 8px; font-size:0.8rem; background:var(--bg-primary);" value="${data.address || ''}" /></td>
    <td style="text-align:center;"><button type="button" class="btn btn-outline" style="color:var(--danger-color); border-color:var(--danger-color); padding:2px 6px;" onclick="this.closest('tr').remove()">❌</button></td>
  `;
  tbody.appendChild(row);
}

function addCompSignatoryRow(data = {}) {
  const tbody = document.getElementById('compSignatoriesTableBody');
  if (!tbody) return;

  const activeChecked = data.isActive ? 'checked' : '';

  const row = document.createElement('tr');
  row.className = 'comp-signatory-row';
  row.innerHTML = `
    <td><input type="text" class="form-input comp-sign-name" style="padding:4px 8px; font-size:0.8rem; background:var(--bg-primary);" value="${data.name || ''}" /></td>
    <td><input type="text" class="form-input comp-sign-role" style="padding:4px 8px; font-size:0.8rem; background:var(--bg-primary);" value="${data.role || ''}" /></td>
    <td style="text-align:center;"><input type="checkbox" class="comp-sign-active" style="width:18px; height:18px; cursor:pointer;" ${activeChecked} /></td>
    <td style="text-align:center;"><button type="button" class="btn btn-outline" style="color:var(--danger-color); border-color:var(--danger-color); padding:2px 6px;" onclick="this.closest('tr').remove()">❌</button></td>
  `;
  tbody.appendChild(row);
}

let currentCompLogoBase64 = '';

function handleCompLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    currentCompLogoBase64 = e.target.result;
    const preview = document.getElementById('compLogoPreview');
    if (preview) {
      preview.innerHTML = `<img src="${currentCompLogoBase64}" style="width:100%; height:100%; object-fit:contain;" />`;
    }
  };
  reader.readAsDataURL(file);
}

function clearCompLogo() {
  currentCompLogoBase64 = '';
  const preview = document.getElementById('compLogoPreview');
  if (preview) {
    preview.innerHTML = `<span style="font-size:1.5rem; color:var(--text-muted);">🏢</span>`;
  }
  const fileInput = document.getElementById('compLogoInput');
  if (fileInput) fileInput.value = '';
}

function openCompanyForm(companyId) {
  const modal = document.getElementById('companyModalOverlay');
  const title = document.getElementById('companyFormTitle');
  if (!modal) return;

  modal.style.display = 'flex';

  if (companyId === null) {
    // NEW company mode
    title.textContent = '🏢 تعریف شرکت جدید';
    document.getElementById('editingCompanyId').value = '';
    document.getElementById('compCode').value = '';
    document.getElementById('compName').value = '';
    document.getElementById('compEcoCode').value = '';
    document.getElementById('compPhone').value = '';
    document.getElementById('compFax').value = '';
    document.getElementById('compPostalCode').value = '';
    document.getElementById('compEmail').value = '';
    document.getElementById('compWebsite').value = '';
    document.getElementById('compAddress').value = '';
    document.getElementById('compNotes').value = '';
    document.getElementById('compActiveYear').value = '1403';
    
    // New fields:
    if (document.getElementById('compLegalType')) document.getElementById('compLegalType').value = 'سهامی خاص';
    if (document.getElementById('compRegNo')) document.getElementById('compRegNo').value = '';
    if (document.getElementById('compNationalId')) document.getElementById('compNationalId').value = '';
    if (document.getElementById('compRegDate')) document.getElementById('compRegDate').value = '';
    if (document.getElementById('compActivity')) document.getElementById('compActivity').value = '';
    if (document.getElementById('compFactoryAddress')) document.getElementById('compFactoryAddress').value = '';
    if (document.getElementById('compCurrency')) document.getElementById('compCurrency').value = 'ریال';
    if (document.getElementById('compModyanUniqueId')) document.getElementById('compModyanUniqueId').value = '';
    if (document.getElementById('compInsuranceCode')) document.getElementById('compInsuranceCode').value = '';
    if (document.getElementById('compVatRate')) document.getElementById('compVatRate').value = '10';
    if (document.getElementById('compModyanPrivateKey')) document.getElementById('compModyanPrivateKey').value = '';
    if (document.getElementById('compLicenseNo')) document.getElementById('compLicenseNo').value = '';
    if (document.getElementById('compLicenseExpiry')) document.getElementById('compLicenseExpiry').value = '';
    if (document.getElementById('compShenaseSenfi')) document.getElementById('compShenaseSenfi').value = '';
    if (document.getElementById('compCEO')) document.getElementById('compCEO').value = '';
    if (document.getElementById('compCeoNationalId')) document.getElementById('compCeoNationalId').value = '';
    if (document.getElementById('compCeoPhone')) document.getElementById('compCeoPhone').value = '';
    if (document.getElementById('compPageOpenMode')) document.getElementById('compPageOpenMode').value = 'unique';
  } else {
    // EDIT mode: load existing data
    const company = AppState.companies.find(c => c.id === companyId);
    if (!company) return;
    title.textContent = `✏️ ویرایش مشخصات شرکت: ${company.name}`;
    document.getElementById('editingCompanyId').value = company.id;
    document.getElementById('compCode').value = company.code;
    document.getElementById('compName').value = company.name;
    document.getElementById('compEcoCode').value = company.ecoCode || '';
    document.getElementById('compPhone').value = company.phone || '';
    document.getElementById('compFax').value = company.fax || '';
    document.getElementById('compPostalCode').value = company.postalCode || '';
    document.getElementById('compEmail').value = company.email || '';
    document.getElementById('compWebsite').value = company.website || '';
    document.getElementById('compAddress').value = company.address || '';
    document.getElementById('compNotes').value = company.notes || '';
    document.getElementById('compActiveYear').value = company.activeYear || '1403';

    // New fields:
    if (document.getElementById('compLegalType')) document.getElementById('compLegalType').value = company.legalType || 'سهامی خاص';
    if (document.getElementById('compRegNo')) document.getElementById('compRegNo').value = company.regNo || '';
    if (document.getElementById('compNationalId')) document.getElementById('compNationalId').value = company.nationalId || '';
    if (document.getElementById('compRegDate')) document.getElementById('compRegDate').value = company.regDate || '';
    if (document.getElementById('compActivity')) document.getElementById('compActivity').value = company.activity || '';
    if (document.getElementById('compFactoryAddress')) document.getElementById('compFactoryAddress').value = company.factoryAddress || '';
    if (document.getElementById('compCurrency')) document.getElementById('compCurrency').value = company.currency || 'ریال';
    if (document.getElementById('compModyanUniqueId')) document.getElementById('compModyanUniqueId').value = company.modyanUniqueId || '';
    if (document.getElementById('compInsuranceCode')) document.getElementById('compInsuranceCode').value = company.insuranceCode || '';
    if (document.getElementById('compVatRate')) document.getElementById('compVatRate').value = company.vatRate || '10';
    if (document.getElementById('compModyanPrivateKey')) document.getElementById('compModyanPrivateKey').value = company.modyanPrivateKey || '';
    if (document.getElementById('compLicenseNo')) document.getElementById('compLicenseNo').value = company.licenseNo || '';
    if (document.getElementById('compLicenseExpiry')) document.getElementById('compLicenseExpiry').value = company.licenseExpiry || '';
    if (document.getElementById('compShenaseSenfi')) document.getElementById('compShenaseSenfi').value = company.shenaseSenfi || '';
    if (document.getElementById('compCEO')) document.getElementById('compCEO').value = company.ceo || '';
    if (document.getElementById('compCeoNationalId')) document.getElementById('compCeoNationalId').value = company.ceoNationalId || '';
    if (document.getElementById('compCeoPhone')) document.getElementById('compCeoPhone').value = company.ceoPhone || '';
    if (document.getElementById('compPageOpenMode')) document.getElementById('compPageOpenMode').value = company.pageOpenMode || 'unique';
  }

  // Reset active tab to General when opening
  switchCompanyFormTab('general');

  setTimeout(() => document.getElementById('compCode')?.focus(), 100);
}

function closeCompanyForm() {
  const modal = document.getElementById('companyModalOverlay');
  if (modal) modal.style.display = 'none';
}

function saveCompany() {
  const editingId = document.getElementById('editingCompanyId')?.value;
  const code = document.getElementById('compCode')?.value?.trim();
  const name = document.getElementById('compName')?.value?.trim();
  const ecoCode = document.getElementById('compEcoCode')?.value?.trim();
  const phone = document.getElementById('compPhone')?.value?.trim();
  const fax = document.getElementById('compFax')?.value?.trim();
  const postalCode = document.getElementById('compPostalCode')?.value?.trim();
  const email = document.getElementById('compEmail')?.value?.trim();
  const website = document.getElementById('compWebsite')?.value?.trim();
  const address = document.getElementById('compAddress')?.value?.trim();
  const notes = document.getElementById('compNotes')?.value?.trim();
  const activeYear = document.getElementById('compActiveYear')?.value;
  const pageOpenMode = document.getElementById('compPageOpenMode')?.value || 'unique';

  // New fields:
  const legalType = document.getElementById('compLegalType')?.value;
  const regNo = document.getElementById('compRegNo')?.value?.trim();
  const nationalId = document.getElementById('compNationalId')?.value?.trim();
  const regDate = document.getElementById('compRegDate')?.value?.trim();
  const activity = document.getElementById('compActivity')?.value?.trim();
  const factoryAddress = document.getElementById('compFactoryAddress')?.value?.trim();
  const currency = document.getElementById('compCurrency')?.value;
  const modyanUniqueId = document.getElementById('compModyanUniqueId')?.value?.trim();
  const insuranceCode = document.getElementById('compInsuranceCode')?.value?.trim();
  const vatRate = document.getElementById('compVatRate')?.value?.trim();
  const modyanPrivateKey = document.getElementById('compModyanPrivateKey')?.value?.trim();
  const licenseNo = document.getElementById('compLicenseNo')?.value?.trim();
  const licenseExpiry = document.getElementById('compLicenseExpiry')?.value?.trim();
  const shenaseSenfi = document.getElementById('compShenaseSenfi')?.value?.trim();
  const ceo = document.getElementById('compCEO')?.value?.trim();
  const ceoNationalId = document.getElementById('compCeoNationalId')?.value?.trim();
  const ceoPhone = document.getElementById('compCeoPhone')?.value?.trim();

  // Get logo
  const logo = currentCompLogoBase64;

  // Get bank accounts from rows
  const bankAccounts = [];
  document.querySelectorAll('.comp-bank-account-row').forEach(row => {
    const bankName = row.querySelector('.comp-bank-name')?.value?.trim();
    const branchName = row.querySelector('.comp-bank-branch')?.value?.trim();
    const accountType = row.querySelector('.comp-bank-type')?.value?.trim();
    const accountNo = row.querySelector('.comp-bank-no')?.value?.trim();
    const shiba = row.querySelector('.comp-bank-shiba')?.value?.trim();
    const cardNo = row.querySelector('.comp-bank-card')?.value?.trim();
    const address = row.querySelector('.comp-bank-address')?.value?.trim();

    if (bankName || accountNo) {
      bankAccounts.push({ bankName, branchName, accountType, accountNo, shiba, cardNo, address });
    }
  });

  // Get signatories from rows
  const signatories = [];
  document.querySelectorAll('.comp-signatory-row').forEach(row => {
    const name = row.querySelector('.comp-sign-name')?.value?.trim();
    const role = row.querySelector('.comp-sign-role')?.value?.trim();
    const isActive = row.querySelector('.comp-sign-active')?.checked || false;

    if (name) {
      signatories.push({ name, role, isActive });
    }
  });

  // Validation
  if (!code) { alert('کد شرکت الزامی است.'); document.getElementById('compCode').focus(); return; }
  if (!name) { alert('نام شرکت الزامی است.'); document.getElementById('compName').focus(); return; }

  const newCompanyData = {
    code, name, ecoCode, phone, fax, postalCode, email, website, address, notes, activeYear, pageOpenMode,
    legalType, regNo, nationalId, regDate, activity, factoryAddress, currency, 
    modyanUniqueId, insuranceCode, vatRate, modyanPrivateKey,
    licenseNo, licenseExpiry, shenaseSenfi, ceo, ceoNationalId, ceoPhone,
    logo, bankAccounts, signatories
  };

  if (SessionState.company && SessionState.company.code === code) {
    SessionState.company.pageOpenMode = pageOpenMode;
  }

  if (editingId) {
    // UPDATE existing company
    const idx = AppState.companies.findIndex(c => c.id === Number(editingId));
    if (idx !== -1) {
      AppState.companies[idx] = { ...AppState.companies[idx], ...newCompanyData };
      alert(`شرکت "${name}" با موفقیت بروزرسانی شد.`);
    }
  } else {
    // CHECK duplicate code
    if (AppState.companies.find(c => c.code === code)) {
      alert(`کد شرکت "${code}" قبلاً ثبت شده است. لطفاً کد منحصربفرد وارد کنید.`);
      document.getElementById('compCode').focus();
      return;
    }
    // CREATE new company
    AppState.companies.push({
      id: Date.now(),
      ...newCompanyData
    });
    alert(`شرکت جدید "${name}" با موفقیت ثبت شد.`);
  }

  try {
    localStorage.setItem('negar_companies', JSON.stringify(AppState.companies));
  } catch(e) {}

  closeCompanyForm();
  renderCompaniesTable();
}

function deleteCompany(companyId) {
  const company = AppState.companies.find(c => c.id === companyId);
  if (!company) return;
  if (AppState.companies.length === 1) {
    alert('حداقل یک شرکت باید در سیستم تعریف شده باشد. امکان حذف آخرین شرکت وجود ندارد.');
    return;
  }
  if (confirm(`آیا از حذف شرکت "${company.name}" (کد: ${company.code}) اطمینان دارید؟`)) {
    AppState.companies = AppState.companies.filter(c => c.id !== companyId);
    renderCompaniesTable();
    alert(`شرکت "${company.name}" با موفقیت حذف شد.`);
  }
}

// ============================
// FISCAL YEARS MODULE
// ============================
function renderFiscalYearsTable() {
  const tbody = document.getElementById('fiscalYearsTableBody');
  if (!tbody) return;

  // Sort by year descending (newest first)
  const sorted = [...AppState.fiscalYears].sort((a, b) => Number(b.year) - Number(a.year));

  tbody.innerHTML = sorted.map(fy => {
    const companyName = AppState.companies.find(c => c.code === fy.company)?.name || fy.company;
    const statusBadge = fy.status === 'فعال'
      ? '<span class="badge badge-success">فعال ✅</span>'
      : '<span class="badge badge-warning">بسته 🔒</span>';
    return `
      <tr>
        <td><b>${fy.year}</b></td>
        <td>${fy.startDate}</td>
        <td>${fy.endDate}</td>
        <td>${companyName}</td>
        <td style="color:var(--text-muted);font-size:0.82rem;">${fy.notes || '-'}</td>
        <td style="text-align:center;">${statusBadge}</td>
        <td>
          <button class="btn btn-outline" style="padding:3px 10px;" onclick="openFiscalYearForm(${fy.id})">✏️ ویرایش</button>
          <button class="btn btn-outline" style="padding:3px 10px;color:red;" onclick="deleteFiscalYear(${fy.id})">🗑️ حذف</button>
        </td>
      </tr>
    `;
  }).join('');
}

function openFiscalYearForm(fiscalYearId) {
  const modal = document.getElementById('fiscalYearModalOverlay');
  const title = document.getElementById('fiscalYearFormTitle');
  if (!modal) return;

  // Refresh company dropdown from AppState
  const select = document.getElementById('fyCompany');
  if (select) {
    select.innerHTML = AppState.companies.map(c =>
      `<option value="${c.code}">${c.name} (${c.code})</option>`
    ).join('');
  }

  modal.style.display = 'flex';

  if (fiscalYearId === null) {
    // NEW mode
    title.textContent = '📅 تعریف سال مالی جدید';
    document.getElementById('editingFiscalYearId').value = '';
    document.getElementById('fyYear').value = '';
    document.getElementById('fyStartDate').value = '';
    document.getElementById('fyEndDate').value = '';
    document.getElementById('fyNotes').value = '';
    if (document.getElementById('fyStatus')) document.getElementById('fyStatus').value = 'فعال';
    if (select && AppState.companies.length > 0) {
      select.value = AppState.companies[0].code;
    }
  } else {
    // EDIT mode
    const fy = AppState.fiscalYears.find(f => f.id === fiscalYearId);
    if (!fy) return;
    title.textContent = `✏️ ویرایش سال مالی: ${fy.year}`;
    document.getElementById('editingFiscalYearId').value = fy.id;
    document.getElementById('fyYear').value = fy.year;
    document.getElementById('fyStartDate').value = fy.startDate;
    document.getElementById('fyEndDate').value = fy.endDate;
    document.getElementById('fyNotes').value = fy.notes || '';
    if (document.getElementById('fyStatus')) document.getElementById('fyStatus').value = fy.status || 'فعال';
    if (select) select.value = fy.company;
  }

  setTimeout(() => document.getElementById('fyYear')?.focus(), 100);
}

function closeFiscalYearForm() {
  const modal = document.getElementById('fiscalYearModalOverlay');
  if (modal) modal.style.display = 'none';
}

function saveFiscalYear() {
  const editingId = document.getElementById('editingFiscalYearId')?.value;
  const year = document.getElementById('fyYear')?.value?.trim();
  const startDate = document.getElementById('fyStartDate')?.value?.trim();
  const endDate = document.getElementById('fyEndDate')?.value?.trim();
  const company = document.getElementById('fyCompany')?.value;
  const notes = document.getElementById('fyNotes')?.value?.trim();
  const status = document.getElementById('fyStatus')?.value;

  // Validation
  if (!year) { alert('سال مالی الزامی است.'); document.getElementById('fyYear').focus(); return; }
  if (!/^\d{4}$/.test(year)) { alert('سال مالی باید یک عدد ۴ رقمی باشد. مثال: 1404'); document.getElementById('fyYear').focus(); return; }
  if (!startDate) { alert('تاریخ شروع الزامی است.'); document.getElementById('fyStartDate').focus(); return; }
  if (!endDate) { alert('تاریخ پایان الزامی است.'); document.getElementById('fyEndDate').focus(); return; }

  if (editingId) {
    // UPDATE
    const idx = AppState.fiscalYears.findIndex(f => f.id === Number(editingId));
    if (idx !== -1) {
      AppState.fiscalYears[idx] = { ...AppState.fiscalYears[idx], year, startDate, endDate, company, notes, status };
      alert(`سال مالی \${year} با موفقیت بروزرسانی شد.`);
    }
  } else {
    // Check duplicate year for same company
    if (AppState.fiscalYears.find(f => f.year === year && f.company === company)) {
      alert(`سال مالی "\${year}" قبلاً برای این شرکت تعریف شده است.`);
      document.getElementById('fyYear').focus();
      return;
    }
    // CREATE
    AppState.fiscalYears.push({
      id: Date.now(),
      year, startDate, endDate, company, notes, status
    });
    alert(`سال مالی \${year} با موفقیت تعریف شد.`);
  }

  closeFiscalYearForm();
  renderFiscalYearsTable();
}

function deleteFiscalYear(fyId) {
  const fy = AppState.fiscalYears.find(f => f.id === fyId);
  if (!fy) return;
  if (fy.status === 'فعال') {
    alert('امکان حذف سال مالی فعال وجود ندارد. ابتدا سال مالی دیگری را فعال کنید.');
    return;
  }
  if (confirm(`آیا از حذف سال مالی "${fy.year}" اطمینان دارید؟`)) {
    AppState.fiscalYears = AppState.fiscalYears.filter(f => f.id !== fyId);
    renderFiscalYearsTable();
    alert(`سال مالی ${fy.year} با موفقیت حذف شد.`);
  }
}

// ============================
// SWITCH COMPANY / FISCAL YEAR
// ============================

// Current session state
const SessionState = {
  company: null,   // currently active company object
  year:    null    // currently active year string
};

let selectedCompanyCodeForSwitch = null;
let selectedYearForSwitch = null;

function renderSwitchCompanyForm() {
  const companyGridBody = document.getElementById('switchCompanyGridBody');
  if (!companyGridBody) return;

  // Default to currently active company or first available company
  if (!selectedCompanyCodeForSwitch) {
    selectedCompanyCodeForSwitch = SessionState.company ? SessionState.company.code : (AppState.companies[0]?.code || '');
  }

  // Render Right Side DataGrid: Companies
  companyGridBody.innerHTML = AppState.companies.map(c => {
    const isSelected = c.code === selectedCompanyCodeForSwitch;
    const activeStyle = isSelected ? 'background:rgba(2, 132, 199, 0.3); font-weight:bold; border-right:4px solid var(--accent-color);' : '';
    return `
      <tr style="cursor:pointer; ${activeStyle}" onclick="selectCompanyForSwitch('${c.code}')">
        <td style="text-align:center;">${c.code}</td>
        <td>${c.name}</td>
      </tr>
    `;
  }).join('');

  // Render Left Side DataGrid: Fiscal Years for selected company
  renderSwitchYearGrid();
}

function selectCompanyForSwitch(companyCode) {
  selectedCompanyCodeForSwitch = companyCode;
  selectedYearForSwitch = null; // Reset year selection so default active year for new company is loaded
  renderSwitchCompanyForm();
}

function renderSwitchYearGrid() {
  const yearGridBody = document.getElementById('switchYearGridBody');
  if (!yearGridBody) return;

  const years = AppState.fiscalYears
    .filter(fy => fy.company === selectedCompanyCodeForSwitch)
    .sort((a, b) => Number(b.year) - Number(a.year));

  if (years.length === 0) {
    yearGridBody.innerHTML = `
      <tr>
        <td colspan="2" style="text-align:center; color:var(--text-muted); padding:16px;">
          -- سال مالی برای این شرکت تعریف نشده است --
        </td>
      </tr>
    `;
    selectedYearForSwitch = null;
    return;
  }

  // Default to active year or first year in list
  if (!selectedYearForSwitch) {
    const activeOne = years.find(fy => fy.status === 'فعال') || years[0];
    selectedYearForSwitch = activeOne ? activeOne.year : '';
  }

  // Render Left Side DataGrid: Fiscal Years
  yearGridBody.innerHTML = years.map(fy => {
    const isSelected = fy.year === selectedYearForSwitch;
    const activeStyle = isSelected ? 'background:rgba(2, 132, 199, 0.3); font-weight:bold; border-right:4px solid var(--accent-color);' : '';
    const statusColor = fy.status === 'فعال' ? 'color:var(--success-color);' : 'color:var(--text-muted);';
    return `
      <tr style="cursor:pointer; ${activeStyle}" onclick="selectYearForSwitch('${fy.year}')">
        <td style="text-align:center;">${fy.year}</td>
        <td style="text-align:center; ${statusColor}">${fy.status}</td>
      </tr>
    `;
  }).join('');
}

function selectYearForSwitch(year) {
  selectedYearForSwitch = year;
  renderSwitchYearGrid();
}

function applyCompanySwitch() {
  if (!selectedCompanyCodeForSwitch) {
    alert('لطفاً یک شرکت را از دیتاگرید سمت راست انتخاب کنید.');
    return;
  }
  if (!selectedYearForSwitch) {
    alert('لطفاً یک سال مالی را از دیتاگرید سمت چپ انتخاب کنید.');
    return;
  }

  const company = AppState.companies.find(c => c.code === selectedCompanyCodeForSwitch);
  if (!company) return;

  // 1. Update active year for company
  company.activeYear = selectedYearForSwitch;

  // 2. Update statuses in AppState.fiscalYears
  AppState.fiscalYears.forEach(fy => {
    if (fy.company === company.code) {
      fy.status = (fy.year === selectedYearForSwitch) ? 'فعال' : 'بسته';
    }
  });

  // 3. Update session
  switchActiveCompany(company);
  SessionState.year = selectedYearForSwitch;

  // 4. Save session to localStorage
  try {
    localStorage.setItem('negar_active_company', company.code);
    localStorage.setItem('negar_active_year', selectedYearForSwitch);
  } catch (e) {}

  // 5. Update header status bar immediately
  updateHeaderBar();

  // Feedback toast
  alert(`✅ شرکت و سال مالی با موفقیت انتخاب شد.\n\nشرکت فعال: ${company.name}\nسال مالی فعال: ${selectedYearForSwitch}`);

  // Go to main system dashboard/tiles
  if (AppState.isTabMode) {
    AppState.isTabMode = false;
  }
  AppState.currentForm = null;
  showTiles('system');
}

function renderSwitchYearOnlyForm() {
  const yearSel = document.getElementById('quickSwitchYear');
  const subTitle = document.getElementById('switchYearSubtitle');
  if (!yearSel) return;

  const currentComp = SessionState.company || (AppState.companies.length > 0 ? AppState.companies[0] : null);
  const compCode = currentComp ? currentComp.code : '';
  const compName = currentComp ? currentComp.name : '';

  if (subTitle) {
    subTitle.textContent = `سال مالی جاری شرکت "${compName}" را انتخاب کنید:`;
  }

  const years = AppState.fiscalYears
    .filter(fy => fy.company === compCode)
    .sort((a, b) => Number(b.year) - Number(a.year));

  if (years.length === 0) {
    yearSel.innerHTML = '<option value="">-- سال مالی تعریف نشده --</option>';
  } else {
    yearSel.innerHTML = years.map(fy =>
      `<option value="${fy.year}" ${SessionState.year === fy.year ? 'selected' : ''}>${fy.year} (${fy.status})</option>`
    ).join('');
  }
}

function applyYearOnlySwitch() {
  const yearSel = document.getElementById('quickSwitchYear');
  if (!yearSel) return;

  const selectedYear = yearSel.value;
  if (!selectedYear) {
    alert('برای این شرکت هیچ سال مالی تعریف نشده است.');
    return;
  }

  SessionState.year = selectedYear;

  if (SessionState.company) {
    SessionState.company.activeYear = selectedYear;
    AppState.fiscalYears.forEach(fy => {
      if (fy.company === SessionState.company.code) {
        fy.status = (fy.year === selectedYear) ? 'فعال' : 'بسته';
      }
    });
  }

  try {
    localStorage.setItem('negar_active_year', selectedYear);
  } catch (e) {}

  updateHeaderBar();

  alert(`✅ سال مالی جاری با موفقیت به "${selectedYear}" تغییر یافت.`);

  if (AppState.isTabMode) {
    AppState.isTabMode = false;
  }
  AppState.currentForm = null;
  showTiles('system');
}

function updateHeaderBar() {
  const company = SessionState.company;
  const year    = SessionState.year;

  // Header title bar
  const headerComp = document.getElementById('headerCompany');
  const headerYear = document.getElementById('headerYear');
  if (headerComp && company) headerComp.textContent = company.name;
  if (headerYear && year)    headerYear.textContent  = 'سال مالی: ' + year;

  const subComp = document.getElementById('hesabdariCompany');
  const subYear = document.getElementById('hesabdariYear');
  if (subComp && company) subComp.textContent = company.name;
  if (subYear && year) subYear.textContent = 'سال مالی: ' + year;
}

function updateSystemClock() {
  const timeEl = document.getElementById('headerTime');
  const dateEl = document.getElementById('headerDate');
  const now = new Date();
  if (timeEl) timeEl.textContent = now.toLocaleTimeString('fa-IR');
  if (dateEl && typeof PersianCal !== 'undefined') {
    dateEl.textContent = PersianCal.getTodayString();
  }
}

// ============================
// Init on page load
// ============================
document.addEventListener('DOMContentLoaded', () => {
  // Clear previous log messages completely on each page load/refresh as requested by user
  EshkalLogger.clear();

  // Check if form parameter is present in URL
  const urlParams = new URLSearchParams(window.location.search);
  const formParam = urlParams.get('form');
  const modeParam = urlParams.get('mode');

  EshkalLogger.log('01_DOMContentLoaded_Start', { formParam, modeParam });

  // Schedule timed layout snapshots to capture what changes "after a few moments"
  [50, 150, 300, 500, 1000, 1500, 2000, 3000, 5000].forEach(delay => {
    setTimeout(() => {
      EshkalLogger.log(`Timed_Layout_Snapshot_${delay}ms`);
    }, delay);
  });

  // Load companies list from localStorage if updated previously
  try {
    const savedCompanies = localStorage.getItem('negar_companies');
    if (savedCompanies) {
      const parsed = JSON.parse(savedCompanies);
      if (Array.isArray(parsed) && parsed.length > 0) {
        AppState.companies = parsed;
      }
    }
  } catch(e) {}

  let savedCompCode = null;
  let savedYear = null;
  try {
    savedCompCode = localStorage.getItem('negar_active_company');
    savedYear = localStorage.getItem('negar_active_year');
  } catch(e) {}

  if (formParam) {
    // 1. Mark as tab mode & set window name for target resolution
    AppState.isTabMode = true;
    window.name = 'negar_tab_' + formParam;
    
    // Collapse right sidebar and close flyout panel so controls take 100% full screen width!
    toggleAppSidebar(true);
    closeModuleFlyoutPanel();

    // 2. Bypass login overlay
    const overlay = document.getElementById('loginOverlay');
    const mainApp = document.getElementById('mainApp');
    if (overlay) overlay.style.display = 'none';
    if (mainApp) {
      mainApp.style.display = 'flex';
      mainApp.style.flexDirection = 'column';
      mainApp.style.width = '100%';
      mainApp.classList.add('app-fade-in');
    }

    // 3. Keep desktop header title bar visible
    const desktopHeader = document.querySelector('.desktop-header');
    if (desktopHeader) {
      desktopHeader.style.display = 'block';
    }

    // 4. Set current user to admin (session bypass)
    currentUser = CREDENTIALS[0]; // admin
    const headerUser = document.getElementById('headerUsername');
    if (headerUser) headerUser.textContent = currentUser.fullName + ' (' + currentUser.username + ')';

    if (savedCompCode && AppState.companies.some(c => c.code === savedCompCode)) {
      const comp = AppState.companies.find(c => c.code === savedCompCode);
      switchActiveCompany(comp);
      SessionState.year = savedYear || comp.activeYear || '1403';
    } else if (AppState.companies.length > 0) {
      switchActiveCompany(AppState.companies[0]);
      const activeYears = AppState.fiscalYears
        .filter(fy => fy.company === SessionState.company.code)
        .sort((a, b) => Number(b.year) - Number(a.year));
      const activeOne = activeYears.find(fy => fy.status === 'فعال') || activeYears[0];
      if (activeOne) SessionState.year = activeOne.year;
    }
    updateHeaderBar();

    // 5. Show the requested form
    if (formParam === 'form-hesabdari-main') {
      AppState.currentModule = 'accounting';
    }
    showForm(formParam);

    // 6. Handle special mode for accounting main module
    if (formParam === 'form-hesabdari-main' && modeParam) {
      if (modeParam === 'reports') {
        switchHesabdariTab('taraz');
      } else {
        switchHesabdariTab('accounts');
      }
    }
  } else {
    // Standard dashboard mode: focus username field and ensure inputs are enabled
    const passInput = document.getElementById('loginPassword');
    if (passInput) {
      passInput.disabled = false;
      passInput.readOnly = false;
    }
    const usernameInput = document.getElementById('loginUsername');
    if (usernameInput) {
      usernameInput.disabled = false;
      usernameInput.readOnly = false;
      setTimeout(() => usernameInput.focus(), 200);
    }
  }

  // Update clock & date immediately and then every second
  updateSystemClock();
  setInterval(updateSystemClock, 1000);

  // Resize and scroll listeners to dynamically align footer totals
  window.addEventListener('resize', () => {
    if (typeof alignFooterTotals === 'function') alignFooterTotals();
  });
  const sanadWrapper = document.querySelector('#form-sanad2 .table-wrapper');
  if (sanadWrapper) {
    sanadWrapper.addEventListener('scroll', () => {
      if (typeof alignFooterTotals === 'function') alignFooterTotals();
    });
  }
});

// ============================
// Global Keyboard Shortcuts
// ============================
window.addEventListener('keydown', (e) => {
  const loginOverlay = document.getElementById('loginOverlay');
  if (loginOverlay && loginOverlay.style.display !== 'none') {
    return; // Do not open if still at login screen
  }

  // Alt + A (KeyA / ش): Switch Company & Year Form
  const isAKey = e.code === 'KeyA' || e.key === 'a' || e.key === 'A' || e.key === 'ش';
  if (e.altKey && isAKey) {
    e.preventDefault();
    e.stopPropagation();
    const systemTab = document.querySelector('.ribbon-tab[onclick*="system"]');
    if (systemTab) switchRibbon('system', systemTab);
    showForm('form-switch-company');
    return;
  }

  // Alt + S (KeyS / س): Quick Switch Year Form
  const isSKey = e.code === 'KeyS' || e.key === 's' || e.key === 'S' || e.key === 'س';
  if (e.altKey && isSKey) {
    e.preventDefault();
    e.stopPropagation();
    const systemTab = document.querySelector('.ribbon-tab[onclick*="system"]');
    if (systemTab) switchRibbon('system', systemTab);
    showForm('form-switch-year');
    return;
  }
}, true);

// ==========================================
// ── Bank Reconciliation Module (مغایرات بانکی) ──
// ==========================================

AppState.moghayeratBanks = [
  {
    id: 1,
    bankName: 'ملت',
    branchName: 'مرکزی ولیعصر',
    branchCode: '1020',
    branchAddress: 'تهران، خیابان ولیعصر، پلاک ۴۵',
    accountType: 'جاری',
    accountNumber: '222217831',
    accountId: 47
  },
  {
    id: 2,
    bankName: 'ملی',
    branchName: 'شعبه میدان ونک',
    branchCode: '0154',
    branchAddress: 'تهران، میدان ونک، برج نگار',
    accountType: 'جاری سپهر',
    accountNumber: '0104889123005',
    accountId: 47
  },
  {
    id: 3,
    bankName: 'صادرات',
    branchName: 'شعبه میرداماد',
    branchCode: '0892',
    branchAddress: 'تهران، بلوار میرداماد، جنب ایستگاه مترو',
    accountType: 'سپرده کوتاه مدت',
    accountNumber: '0201994821008',
    accountId: 47
  }
];

AppState.bankTransactions = [
  // --- بانک ملت (bankId: 1) ---
  { id: 1, bankId: 1, txDate: '1403/02/12', refNo: '9845120', debit: 0, credit: 450000000, desc: 'واریز حواله اینترنتی پایا از فناوری آریا', beneficiary: 'شرکت فناوری آریا', isClosed: false },
  { id: 2, bankId: 1, txDate: '1403/05/15', refNo: '9845125', debit: 5000000, credit: 0, desc: 'کارمزد صدور دسته چک و خدمات الکترونیک', beneficiary: 'بانک ملت', isClosed: false },
  { id: 3, bankId: 1, txDate: '1403/06/05', refNo: '9845130', debit: 0, credit: 280000000, desc: 'واریز از خریدار آقای اکبری', beneficiary: 'محمد اکبری', isClosed: false },
  { id: 4, bankId: 1, txDate: '1402/04/18', refNo: '8812340', debit: 0, credit: 320000000, desc: 'واریز حواله ساتنا بابت درآمد فروش خدمات', beneficiary: 'بازرگانی پارس', isClosed: false },
  { id: 5, bankId: 1, txDate: '1402/09/01', refNo: '8812399', debit: 0, credit: 15000000, desc: 'واریز سود سپرده بانکی ماهانه', beneficiary: 'بانک ملت', isClosed: false },
  { id: 6, bankId: 1, txDate: '1401/06/15', refNo: '7700112', debit: 0, credit: 210000000, desc: 'واریز پایا خدمات مشاوره‌ای', beneficiary: 'صنایع همکار', isClosed: false },

  // --- بانک ملی (bankId: 2) ---
  { id: 7, bankId: 2, txDate: '1403/04/20', refNo: '5120091', debit: 120000000, credit: 0, desc: 'پرداخت چک ۵۱۲ در وجه علی رضایی بابت ملزومات', beneficiary: 'فروشگاه تجهیزات اداری', isClosed: false },
  { id: 8, bankId: 2, txDate: '1403/05/14', refNo: '5120095', debit: 0, credit: 75000000, desc: 'واریز نقدی شعبه میدان ونک', beneficiary: 'امین صندوق‌دار', isClosed: false },
  { id: 9, bankId: 2, txDate: '1403/05/15', refNo: '5120098', debit: 23000000, credit: 0, desc: 'خرید تجهیزات اداری پوز بانکی (تراکنش مغایر)', beneficiary: 'بازرگانی تجهیزات', isClosed: false },
  { id: 10, bankId: 2, txDate: '1402/08/22', refNo: '4110022', debit: 180000000, credit: 0, desc: 'پرداخت چک اجاره ماهانه دفتر', beneficiary: 'موجر آقای حسینی', isClosed: false },
  { id: 11, bankId: 2, txDate: '1401/09/05', refNo: '3109088', debit: 160000000, credit: 0, desc: 'پرداخت حواله پایا خریدهای سیستمی', beneficiary: 'توسعه نرم‌افزار نگار', isClosed: false },

  // --- بانک صادرات (bankId: 3) ---
  { id: 12, bankId: 3, txDate: '1403/03/15', refNo: '7789012', debit: 350000000, credit: 0, desc: 'پرداخت لیست حقوق پرسنل از حساب صادرات', beneficiary: 'پرسنل شرکت', isClosed: false },
  { id: 13, bankId: 3, txDate: '1403/06/01', refNo: '7789055', debit: 0, credit: 200000000, desc: 'واریز پیش‌پرداخت قرارداد از شرکت پارس', beneficiary: 'شرکت پارس تکنولوژی', isClosed: false },
  { id: 14, bankId: 3, txDate: '1402/11/10', refNo: '6654311', debit: 250000000, credit: 0, desc: 'تسویه بابت فاکتور تامین‌کننده قطعات', beneficiary: 'بازرگانی واردات قطعات', isClosed: false }
];
AppState.ledgerTransactions = []; // تراکنش‌های استخراج‌شده از دفاتر شرکت
AppState.moghayeratReconciled = false;
AppState.moghCurrentSubtab = 'defs';
AppState.moghBankSubtabFilter = 'all';
AppState.moghLedgerSubtabFilter = 'all';
AppState.moghBankSortColumn = null;
AppState.moghBankSortDir = 'asc';
AppState.moghLedgerSortColumn = null;
AppState.moghLedgerSortDir = 'asc';
AppState.selectedMoghBankId = 1;

// بارگذاری اولیه مقادیر کامبوها به صورت پیش‌فرض
document.addEventListener('DOMContentLoaded', () => {
  // Initialize dbAccounts with default accounts mapped to company 1001
  dbAccounts = AppState.accounts.map(a => ({ ...a, companyCode: '1001' }));
  // Save a pristine template of default accounts before any user modification
  pristineAccountsTemplate = AppState.accounts.map(a => ({ ...a }));
  // Expand default accounts on load
  AppState.accounts.forEach(a => {
    expandedAccountIds.add(a.id);
  });

  populateMoghCombos();
  renderMoghayeratBanksTable();
});

function switchBankSubtab(subtab) {
  AppState.moghCurrentSubtab = subtab;
  
  // بروزرسانی دکمه‌های ناوبری زیرتب
  const btnIds = {
    defs: 'btnSubtabBankDefs',
    import: 'btnSubtabBankImport',
    reconcile: 'btnSubtabBankReconcile',
    suggestions: 'btnSubtabBankSuggestions'
  };
  
  for (let key in btnIds) {
    const btn = document.getElementById(btnIds[key]);
    if (btn) {
      if (key === subtab) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  }
  
  // بروزرسانی پنل‌های نمایش زیرتب
  const panelIds = {
    defs: 'pnlBankSubtabDefs',
    import: 'pnlBankSubtabImport',
    reconcile: 'pnlBankSubtabReconcile',
    suggestions: 'pnlBankSubtabSuggestions'
  };
  
  for (let key in panelIds) {
    const panel = document.getElementById(panelIds[key]);
    if (panel) {
      if (key === subtab) {
        panel.style.display = (key === 'defs') ? 'flex' : 'flex'; // flex for defs, block/flex for others
        if (key === 'import') panel.style.display = 'flex';
        if (key === 'reconcile') panel.style.display = 'flex';
      } else {
        panel.style.display = 'none';
      }
    }
  }
  
  // رندر متناسب با تب جاری
  if (subtab === 'defs') renderMoghayeratBanksTable();
  else if (subtab === 'import') loadImportedBankState();
  else if (subtab === 'reconcile') renderMoghayeratReconcilePanel();
  else if (subtab === 'suggestions') renderMoghayeratSuggestions();
}

function openSelectLedgerForMoghayerat() {
  activePopupMode = 'moghayerat';
  openSfPopup();
}

function populateMoghCombos() {
  const cmbImport = document.getElementById('cmbMoghImportBank');
  const cmbReconcile = document.getElementById('cmbMoghReconcileBank');
  
  const optionsHtml = AppState.moghayeratBanks.map(b => 
    `<option value="${b.id}">${b.bankName} - ${b.branchName} - ${b.accountNumber}</option>`
  ).join('');
  
  if (cmbImport) {
    cmbImport.innerHTML = optionsHtml;
    if (AppState.moghayeratBanks.length > 0) cmbImport.value = AppState.moghayeratBanks[0].id;
  }
  if (cmbReconcile) {
    cmbReconcile.innerHTML = `<option value="all">استفاده از تمام بانکها</option>` + optionsHtml;
    cmbReconcile.value = 'all';
  }
}

function openBankModal() {
  const modal = document.getElementById('bankModalOverlay');
  if (modal) modal.style.display = 'flex';
}

function closeBankModal() {
  const modal = document.getElementById('bankModalOverlay');
  if (modal) modal.style.display = 'none';
}

function openAddBankModal() {
  clearMoghayeratBankForm();
  const title = document.getElementById('bankModalTitle');
  if (title) title.textContent = '🏢 تعریف بانک جدید';
  openBankModal();
}

function openEditBankModal(id) {
  selectMoghayeratBank(id);
  const b = AppState.moghayeratBanks.find(x => x.id === id);
  const title = document.getElementById('bankModalTitle');
  if (title && b) title.textContent = `✏️ ویرایش مشخصات بانک (${b.bankName})`;
  openBankModal();
}

function deleteMoghayeratBankById(id) {
  const b = AppState.moghayeratBanks.find(x => x.id === id);
  const bankName = b ? b.bankName : '';
  if (!confirm(`آیا از حذف بانک (${bankName}) اطمینان دارید؟`)) return;

  AppState.moghayeratBanks = AppState.moghayeratBanks.filter(x => x.id !== id);
  if (AppState.selectedMoghBankId === id) {
    AppState.selectedMoghBankId = AppState.moghayeratBanks.length > 0 ? AppState.moghayeratBanks[0].id : null;
  }

  populateMoghCombos();
  clearMoghayeratBankForm();
  renderMoghayeratBanksTable();
}

function renderMoghayeratBanksTable() {
  const tbody = document.getElementById('tblMoghayeratBanksBody');
  if (!tbody) return;
  
  if (AppState.moghayeratBanks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:var(--text-muted); padding:20px;">هیچ بانکی تعریف نشده است.</td></tr>`;
    updateBankStatementRangeHeader(null);
    return;
  }
  
  tbody.innerHTML = AppState.moghayeratBanks.map(b => {
    const acc = AppState.accounts.find(a => a.id === b.accountId);
    const accName = acc ? `${acc.code} - ${acc.name}` : '-';
    
    // ردیف انتخاب شده
    const isSelected = (AppState.selectedMoghBankId === b.id);
    const selectedStyle = isSelected ? 'background-color:rgba(56, 189, 248, 0.12); font-weight:bold;' : '';
    
    return `
      <tr onclick="selectMoghayeratBank(${b.id})" style="cursor:pointer; ${selectedStyle}">
        <td style="padding:8px; text-align:center;">${b.bankName}</td>
        <td style="padding:8px; text-align:center;">${b.branchName}</td>
        <td style="padding:8px; text-align:center;">${b.branchCode || '-'}</td>
        <td style="padding:8px; text-align:center;">${b.branchAddress || '-'}</td>
        <td style="padding:8px; text-align:center;">${b.accountType || '-'}</td>
        <td style="padding:8px; text-align:center;">${b.accountNumber}</td>
        <td style="padding:8px; text-align:center; direction:ltr;">${accName}</td>
        <td style="padding:4px; text-align:center;">
          <button class="btn btn-outline" style="padding:2px 8px; font-size:0.75rem;" onclick="event.stopPropagation(); openEditBankModal(${b.id})">✏️ ویرایش</button>
        </td>
        <td style="padding:4px; text-align:center;">
          <button class="btn btn-outline" style="padding:2px 8px; font-size:0.75rem; color:red; border-color:red;" onclick="event.stopPropagation(); deleteMoghayeratBankById(${b.id})">🗑️ حذف</button>
        </td>
      </tr>
    `;
  }).join('');
  
  // آپدیت هدر بازه تاریخ بر اساس بانک انتخاب شده
  updateBankStatementRangeHeader(AppState.selectedMoghBankId);
}

function selectMoghayeratBank(id) {
  AppState.selectedMoghBankId = id;
  const b = AppState.moghayeratBanks.find(x => x.id === id);
  if (!b) return;
  
  document.getElementById('moghBankEditId').value = b.id;
  document.getElementById('moghBankName').value = b.bankName;
  document.getElementById('moghBankBranch').value = b.branchName;
  document.getElementById('moghBankBranchCode').value = b.branchCode || '';
  document.getElementById('moghBankBranchAddress').value = b.branchAddress || '';
  document.getElementById('moghBankAccountType').value = b.accountType || '';
  document.getElementById('moghBankAccountNo').value = b.accountNumber;
  
  const acc = AppState.accounts.find(a => a.id === b.accountId);
  document.getElementById('lblMoghBankAccText').textContent = acc ? acc.code : '-';
  
  renderMoghayeratBanksTable();
}

function updateBankStatementRangeHeader(bankId) {
  const lbl = document.getElementById('lblBankStatementRangeHeader');
  if (!lbl) return;
  
  if (!bankId) {
    lbl.textContent = 'بازه تاریخی صورت حساب وارد شده: فاقد صورت حساب وارد شده';
    return;
  }
  
  const txs = AppState.bankTransactions.filter(t => t.bankId === bankId);
  if (txs.length === 0) {
    lbl.textContent = 'بازه تاریخی صورت حساب وارد شده: فاقد صورت حساب وارد شده';
    return;
  }
  
  // پیدا کردن مینیمم و ماکسیمم تاریخ
  const dates = txs.map(t => t.txDate).sort();
  const minDate = dates[0];
  const maxDate = dates[dates.length - 1];
  lbl.textContent = `بازه تاریخی صورت حساب وارد شده: از تاریخ: ${minDate} تا تاریخ: ${maxDate}`;
}

function saveMoghayeratBank() {
  const name = document.getElementById('moghBankName').value.trim();
  const branch = document.getElementById('moghBankBranch').value.trim();
  const code = document.getElementById('moghBankBranchCode').value.trim();
  const address = document.getElementById('moghBankBranchAddress').value.trim();
  const type = document.getElementById('moghBankAccountType').value.trim();
  const accNo = document.getElementById('moghBankAccountNo').value.trim();
  const accCode = document.getElementById('lblMoghBankAccText').textContent.trim();
  
  if (!name || !accNo) {
    alert('نام بانک و شماره حساب الزامی هستند.');
    return;
  }
  
  const acc = AppState.accounts.find(a => a.code === accCode);
  if (!acc) {
    alert('انتخاب سرفصل حساب الزامی است.');
    return;
  }
  
  const editIdStr = document.getElementById('moghBankEditId').value;
  if (editIdStr) {
    // Edit
    const id = parseInt(editIdStr, 10);
    const idx = AppState.moghayeratBanks.findIndex(x => x.id === id);
    if (idx !== -1) {
      AppState.moghayeratBanks[idx] = {
        id, bankName: name, branchName: branch, branchCode: code, branchAddress: address,
        accountType: type, accountNumber: accNo, accountId: acc.id
      };
      alert('مشخصات بانک با موفقیت ویرایش شد.');
    }
  } else {
    // Add New
    const newId = AppState.moghayeratBanks.length > 0 ? Math.max(...AppState.moghayeratBanks.map(x => x.id)) + 1 : 1;
    AppState.moghayeratBanks.push({
      id: newId, bankName: name, branchName: branch, branchCode: code, branchAddress: address,
      accountType: type, accountNumber: accNo, accountId: acc.id
    });
    AppState.selectedMoghBankId = newId;
    alert('مشخصات بانک با موفقیت ثبت شد.');
  }
  
  populateMoghCombos();
  clearMoghayeratBankForm();
  closeBankModal();
  renderMoghayeratBanksTable();
}

function clearMoghayeratBankForm() {
  document.getElementById('moghBankEditId').value = '';
  document.getElementById('moghBankName').value = '';
  document.getElementById('moghBankBranch').value = '';
  document.getElementById('moghBankBranchCode').value = '';
  document.getElementById('moghBankBranchAddress').value = '';
  document.getElementById('moghBankAccountType').value = '';
  document.getElementById('moghBankAccountNo').value = '';
  document.getElementById('lblMoghBankAccText').textContent = '-';
}

function deleteMoghayeratBank() {
  const editIdStr = document.getElementById('moghBankEditId').value;
  if (!editIdStr) {
    alert('لطفا ابتدا یک بانک را از جدول انتخاب کنید.');
    return;
  }
  
  if (!confirm('آیا از حذف بانک انتخاب شده اطمینان دارید؟')) return;
  
  const id = parseInt(editIdStr, 10);
  AppState.moghayeratBanks = AppState.moghayeratBanks.filter(x => x.id !== id);
  if (AppState.selectedMoghBankId === id) {
    AppState.selectedMoghBankId = AppState.moghayeratBanks.length > 0 ? AppState.moghayeratBanks[0].id : null;
  }
  
  populateMoghCombos();
  clearMoghayeratBankForm();
  closeBankModal();
  renderMoghayeratBanksTable();
}

// ── زیرتب ۲: ورود صورتحساب ──

function triggerMoghBrowseFile() {
  document.getElementById('fileMoghImport').click();
}

function handleMoghFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById('lblMoghFileName').textContent = file.name;
  loadSampleMoghData();
}

let mockExcelData = [];

function loadSampleMoghData() {
  // شبیه‌سازی خواندن اکسل با ۶ سطر تستی باکیفیت
  mockExcelData = [
    { date: '1403/05/10', refNo: '982711', debit: 0, credit: 15000000, desc: 'واریز سود سپرده ملت', ben: 'بانک ملت' },
    { date: '1403/05/11', refNo: '887251', debit: 120000000, credit: 0, desc: 'برداشت بابت چک شماره ۵۱۲', ben: 'علی رضایی' },
    { date: '1403/05/12', refNo: '772152', debit: 0, credit: 450000000, desc: 'حواله دریافتی از مشتری', ben: 'شرکت آریا' },
    { date: '1403/05/13', refNo: '662198', debit: 5000000, credit: 0, desc: 'کارمزد انتقال وجه شتاب', ben: 'بانک ملت' },
    { date: '1403/05/14', refNo: '551223', debit: 0, credit: 75000000, desc: 'واریز نقدی صندوقدار به بانک', ben: 'صندوقدار' },
    { date: '1403/05/15', refNo: '441029', debit: 23000000, credit: 0, desc: 'برداشت خرید تجهیزات اداری', ben: 'دیجی‌کالا' }
  ];
  
  // پر کردن کامبوهای نگاشت ستون‌ها با اسامی فیلدها
  const cols = ['ستون A (تاریخ)', 'ستون B (پیگیری)', 'ستون C (بدهکار/برداشت)', 'ستون D (بستانکار/واریز)', 'ستون E (شرح)', 'ستون F (ذینفع)'];
  const fillSelect = (id, defIdx) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = cols.map((c, i) => `<option value="${i}" ${i === defIdx ? 'selected' : ''}>${c}</option>`).join('');
  };
  
  fillSelect('mapColTxDate', 0);
  fillSelect('mapColTxNo', 1);
  fillSelect('mapColDebit', 2);
  fillSelect('mapColCredit', 3);
  fillSelect('mapColDesc', 4);
  fillSelect('mapColBeneficiary', 5);
  
  renderMoghayeratImportPreview();
}

function renderMoghayeratImportPreview() {
  const thead = document.querySelector('#tblMoghImportPreview thead');
  const tbody = document.querySelector('#tblMoghImportPreview tbody');
  if (!thead || !tbody) return;
  
  thead.innerHTML = `
    <tr style="border-bottom:1px solid var(--border-color);">
      <th style="padding:6px; text-align:center;">ردیف</th>
      <th style="padding:6px; text-align:center;">تاریخ تراکنش</th>
      <th style="padding:6px; text-align:center;">شماره پیگیری</th>
      <th style="padding:6px; text-align:center;">برداشت (بدهکار)</th>
      <th style="padding:6px; text-align:center;">واریز (بستانکار)</th>
      <th style="padding:6px; text-align:center;">شرح</th>
      <th style="padding:6px; text-align:center;">واریز کننده / ذینفع</th>
    </tr>
  `;
  
  if (mockExcelData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:20px;">هیچ داده‌ای بارگذاری نشده است.</td></tr>`;
    return;
  }
  
  tbody.innerHTML = mockExcelData.map((row, i) => `
    <tr>
      <td style="padding:6px; text-align:center;">${i + 1}</td>
      <td style="padding:6px; text-align:center;">${row.date}</td>
      <td style="padding:6px; text-align:center;">${row.refNo}</td>
      <td style="padding:6px; text-align:left; color:#ef4444;">${row.debit === 0 ? '-' : row.debit.toLocaleString()}</td>
      <td style="padding:6px; text-align:left; color:#10b981;">${row.credit === 0 ? '-' : row.credit.toLocaleString()}</td>
      <td style="padding:6px; text-align:right;">${row.desc}</td>
      <td style="padding:6px; text-align:right;">${row.ben}</td>
    </tr>
  `).join('');
}

function loadImportedBankState() {
  const bankId = Number(document.getElementById('cmbMoghImportBank')?.value || 1);
  const fileLabel = document.getElementById('lblMoghFileName');
  
  const hasData = AppState.bankTransactions.some(t => t.bankId === bankId);
  if (hasData) {
    if (fileLabel) fileLabel.textContent = 'صورت حساب ذخیره شده در سیستم';
    mockExcelData = AppState.bankTransactions.filter(t => t.bankId === bankId).map(t => ({
      date: t.txDate, refNo: t.refNo, debit: t.debit, credit: t.credit, desc: t.desc, ben: t.beneficiary
    }));
    renderMoghayeratImportPreview();
  } else {
    if (fileLabel) fileLabel.textContent = 'فایلی انتخاب نشده است';
    mockExcelData = [];
    renderMoghayeratImportPreview();
  }
}

function saveMoghImportedTransactions() {
  const bankId = Number(document.getElementById('cmbMoghImportBank')?.value || 1);
  if (mockExcelData.length === 0) {
    alert('لطفاً ابتدا داده‌های صورتحساب را بارگذاری کنید.');
    return;
  }
  
  // پاکسازی تراکنش‌های قدیمی این بانک
  AppState.bankTransactions = AppState.bankTransactions.filter(t => t.bankId !== bankId);
  
  // درج تراکنش‌های جدید
  mockExcelData.forEach((row, i) => {
    AppState.bankTransactions.push({
      id: i + 1,
      bankId: bankId,
      txDate: row.date,
      refNo: row.refNo,
      debit: row.debit,
      credit: row.credit,
      desc: row.desc,
      beneficiary: row.ben,
      isClosed: false
    });
  });
  
  alert('اطلاعات صورت‌حساب بانکی با موفقیت در پایگاه داده ذخیره شد.');
  updateBankStatementRangeHeader(bankId);
}

// ── زیرتب ۳: مغایرت گیری ──

function toggleMoghDateInputs(show) {
  const el = document.getElementById('divMoghCustomDates');
  if (el) el.style.display = show ? 'flex' : 'none';
}

function runMoghReconciliation() {
  const bankIdVal = document.getElementById('cmbMoghReconcileBank')?.value;
  const isAll = bankIdVal === 'all';
  
  let bankTxs = [];
  if (isAll) {
    bankTxs = AppState.bankTransactions;
  } else {
    const bankId = Number(bankIdVal || 1);
    const bank = AppState.moghayeratBanks.find(b => b.id === bankId);
    if (!bank) {
      alert('لطفاً ابتدا مشخصات بانک را در تب اول تعریف کنید.');
      return;
    }
    bankTxs = AppState.bankTransactions.filter(t => t.bankId === bankId);
  }
  
  if (bankTxs.length === 0) {
    alert('صورتحسابی برای این بانک یافت نشد. ابتدا باید صورتحساب را در تب دوم بارگذاری و ذخیره کنید.');
    return;
  }
  
  // استخراج اقلام دفاتر بر اساس اسناد حسابداری ثبت‌شده در سیستم
  let ledgerItems = [];
  let itemId = 1;
  AppState.sanads.forEach(s => {
    const details = AppState.voucherDetails[s.id] || [];
    details.forEach(d => {
      if (d.account === '110102' || d.account === '110101' || d.account.startsWith('1101')) {
        ledgerItems.push({
          id: itemId++,
          date: s.date,
          sanadNo: String(s.id),
          txNo: d.txNo || '-',
          debit: d.debit,
          credit: d.credit,
          desc: d.desc || s.desc,
          isClosed: false
        });
      }
    });
  });

  if (ledgerItems.length === 0) {
    ledgerItems = [
      { id: 1, date: '1403/05/11', sanadNo: '102', debit: 0, credit: 120000000, desc: 'صدور چک ۵۱۲ در وجه علی رضایی', isClosed: false },
      { id: 2, date: '1403/05/12', sanadNo: '103', debit: 450000000, credit: 0, desc: 'دریافت حواله بانکی از شرکت آریا', isClosed: false },
      { id: 3, date: '1403/05/14', sanadNo: '104', debit: 75000000, credit: 0, desc: 'واریز نقدی صندوق به بانک', isClosed: false },
      { id: 4, date: '1403/05/14', sanadNo: '105', debit: 90000000, credit: 0, desc: 'حواله دریافتی بابت طلب شرکت سارا (ثبت اشتباه در دفتر)', isClosed: false },
      { id: 5, date: '1403/05/15', sanadNo: '106', debit: 0, credit: 20000000, desc: 'پرداخت بابت هزینه‌های خرید تجهیزات اداری (اختلاف با فاکتور بانک)', isClosed: false }
    ];
  }
  AppState.ledgerTransactions = ledgerItems;
  
  // الگوریتم تطابق مغایرت
  // بانک:
  // ۱. واریز سود ۱۵,۰۰۰,۰۰۰ (بستانکار بانک) -> دفتری وجود ندارد (تراکنش باز)
  // ۲. چک ۵۱۲ ۱۲۰,۰۰۰,۰۰۰ (بدهکار بانک) -> در دفاتر بستانکار است (بسته می‌شود)
  // ۳. حواله مشتری ۴۵۰,۰۰۰,۰۰۰ (بستانکار بانک) -> در دفاتر بدهکار است (بسته می‌شود)
  // ۴. کارمزد ۵,۰۰۰ (بدهکار بانک) -> دفتری وجود ندارد (تراکنش باز)
  // ۵. واریز نقدی ۷۵,۰۰۰,۰۰۰ (بستانکار بانک) -> در دفاتر بدهکار است (بسته می‌شود)
  // ۶. خرید ۲۳,۰۰۰,۰۰۰ (بدهکار بانک) -> در دفاتر ۲۰,۰۰۰,۰۰۰ ثبت شده (تراکنش باز به دلیل اختلاف مبلغ)
  
  // بازنشانی
  if (isAll) {
    AppState.bankTransactions.forEach(t => t.isClosed = false);
  } else {
    const bankId = Number(bankIdVal || 1);
    AppState.bankTransactions.filter(t => t.bankId === bankId).forEach(t => t.isClosed = false);
  }
  AppState.ledgerTransactions.forEach(t => t.isClosed = false);
  
  // تطبیق بدهکار بانک با بستانکار دفتر
  bankTxs.forEach(bt => {
    if (bt.debit > 0) {
      const match = AppState.ledgerTransactions.find(lt => lt.credit === bt.debit && !lt.isClosed);
      if (match) {
        bt.isClosed = true;
        match.isClosed = true;
      }
    } else if (bt.credit > 0) {
      const match = AppState.ledgerTransactions.find(lt => lt.debit === bt.credit && !lt.isClosed);
      if (match) {
        bt.isClosed = true;
        match.isClosed = true;
      }
    }
  });
  
  AppState.moghayeratReconciled = true;
  alert('مغایرت‌گیری بانکی با موفقیت انجام شد! نتایج تطابق در جداول نمایش داده می‌شوند.');
  
  renderMoghayeratReconcilePanel();
}

function switchBankGridSubtab(filter) {
  AppState.moghBankSubtabFilter = filter;
  renderMoghayeratReconcilePanel();
}

function switchLedgerGridSubtab(filter) {
  AppState.moghLedgerSubtabFilter = filter;
  renderMoghayeratReconcilePanel();
}

function sortMoghBankGrid(colKey) {
  if (AppState.moghBankSortColumn === colKey) {
    AppState.moghBankSortDir = AppState.moghBankSortDir === 'asc' ? 'desc' : 'asc';
  } else {
    AppState.moghBankSortColumn = colKey;
    AppState.moghBankSortDir = 'asc';
  }
  renderMoghayeratReconcilePanel();
}

function sortMoghLedgerGrid(colKey) {
  if (AppState.moghLedgerSortColumn === colKey) {
    AppState.moghLedgerSortDir = AppState.moghLedgerSortDir === 'asc' ? 'desc' : 'asc';
  } else {
    AppState.moghLedgerSortColumn = colKey;
    AppState.moghLedgerSortDir = 'asc';
  }
  renderMoghayeratReconcilePanel();
}

function filterMoghBankGrid() {
  renderMoghayeratReconcilePanel();
}

function filterMoghLedgerGrid() {
  renderMoghayeratReconcilePanel();
}

function openSanadFromMoghayerat(sanadNoStr, targetLineIdx) {
  const sanadId = Number(sanadNoStr);
  let s = AppState.sanads.find(x => x.id === sanadId);
  
  if (!s) {
    s = {
      id: sanadId,
      date: '1403/05/12',
      desc: `سند شماره ${sanadId}`,
      debit: 0,
      credit: 0,
      status: 'موقت',
      bakhshId: getCurrentBakhshId(),
      dayOfYear: 135
    };
    AppState.sanads.push(s);
  }

  editSanad(sanadId, true);

  let focusIdx = 0;
  if (typeof targetLineIdx === 'number' && targetLineIdx >= 0 && targetLineIdx < AppState.sanadLines.length) {
    focusIdx = targetLineIdx;
  } else {
    const foundIdx = AppState.sanadLines.findIndex(l => l.account && l.account.startsWith('1101'));
    if (foundIdx !== -1) focusIdx = foundIdx;
  }

  focusedLineIndex = focusIdx;
  renderSanadEditorLines();

  setTimeout(() => {
    const rowEl = document.querySelector(`#sanadLinesEditorBody tr[data-index="${focusIdx}"]`);
    if (rowEl) {
      rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const inputs = rowEl.querySelectorAll('input');
      if (inputs && inputs.length > 0) {
        const targetInput = inputs[2] || inputs[0];
        targetInput.focus();
        targetInput.select();
      }
    }
  }, 150);
}

function getMoghSortIcon(gridType, colKey) {
  const currentCol = gridType === 'bank' ? AppState.moghBankSortColumn : AppState.moghLedgerSortColumn;
  const currentDir = gridType === 'bank' ? AppState.moghBankSortDir : AppState.moghLedgerSortDir;
  if (currentCol !== colKey) return '';
  return currentDir === 'asc' ? ' 🔼' : ' 🔽';
}

function renderMoghayeratReconcilePanel() {
  const tbodyBank = document.getElementById('tblMoghBankStatementBody');
  const tbodyLedger = document.getElementById('tblMoghLedgerBody');
  if (!tbodyBank || !tbodyLedger) return;
  
  const bankIdVal = document.getElementById('cmbMoghReconcileBank')?.value || '1';
  const isAll = bankIdVal === 'all';
  
  // سوییچ کلاس فعال دکمه‌های گرید بانک
  const bankSubtabs = ['allBank', 'all', 'debit', 'credit', 'closed', 'closedDebit', 'closedCredit', 'dup'];
  bankSubtabs.forEach(s => {
    const el = document.getElementById('btnBankSubtab' + s.charAt(0).toUpperCase() + s.slice(1));
    if (el) {
      if (s === AppState.moghBankSubtabFilter) el.classList.add('active');
      else el.classList.remove('active');
    }
  });
  
  // سوییچ کلاس فعال دکمه‌های گرید دفتر
  const ledgerSubtabs = ['allLedger', 'all', 'debit', 'credit', 'closed', 'closedDebit', 'closedCredit', 'dup'];
  ledgerSubtabs.forEach(s => {
    const el = document.getElementById('btnLedgerSubtab' + s.charAt(0).toUpperCase() + s.slice(1));
    if (el) {
      if (s === AppState.moghLedgerSubtabFilter) el.classList.add('active');
      else el.classList.remove('active');
    }
  });
  
  // بروزرسانی عناوین سرستون‌ها همراه با آیکون جهتی سورت
  const bankCols = ['row', 'txDate', 'sanadNo', 'refNo', 'debit', 'credit', 'desc', 'isClosed'];
  bankCols.forEach(col => {
    const th = document.getElementById(`thMoghBank_${col}`);
    if (th) {
      const baseTitle = th.getAttribute('data-title') || th.textContent.replace(/[🔼🔽\s]+/g, '');
      th.setAttribute('data-title', baseTitle);
      th.innerHTML = baseTitle + getMoghSortIcon('bank', col);
    }
  });

  const ledgerCols = ['row', 'date', 'sanadNo', 'txNo', 'debit', 'credit', 'desc', 'isClosed'];
  ledgerCols.forEach(col => {
    const th = document.getElementById(`thMoghLedger_${col}`);
    if (th) {
      const baseTitle = th.getAttribute('data-title') || th.textContent.replace(/[🔼🔽\s]+/g, '');
      th.setAttribute('data-title', baseTitle);
      th.innerHTML = baseTitle + getMoghSortIcon('ledger', col);
    }
  });

  // فیلترینگ تراکنش‌های بانک
  let bankList = isAll
    ? AppState.bankTransactions
    : AppState.bankTransactions.filter(t => t.bankId === Number(bankIdVal));
    
  if (AppState.moghayeratReconciled) {
    if (AppState.moghBankSubtabFilter === 'allBank') {
      // کل ارقام بانک: تمام تراکنش‌های موجود بانک
    } else if (AppState.moghBankSubtabFilter === 'all') bankList = bankList.filter(t => !t.isClosed);
    else if (AppState.moghBankSubtabFilter === 'debit') bankList = bankList.filter(t => !t.isClosed && t.debit > 0);
    else if (AppState.moghBankSubtabFilter === 'credit') bankList = bankList.filter(t => !t.isClosed && t.credit > 0);
    else if (AppState.moghBankSubtabFilter === 'closed') bankList = bankList.filter(t => t.isClosed);
    else if (AppState.moghBankSubtabFilter === 'closedDebit') bankList = bankList.filter(t => t.isClosed && t.debit > 0);
    else if (AppState.moghBankSubtabFilter === 'closedCredit') bankList = bankList.filter(t => t.isClosed && t.credit > 0);
    else if (AppState.moghBankSubtabFilter === 'dup') bankList = [];
  }

  let mappedBankList = bankList.map((t, idx) => {
    let matchedSanadNo = '-';
    if (t.isClosed) {
      const match = AppState.ledgerTransactions.find(lt => lt.isClosed && (lt.debit === t.credit || lt.credit === t.debit));
      if (match) matchedSanadNo = match.sanadNo;
    }
    return { ...t, origRow: idx + 1, matchedSanadNo };
  });

  if (AppState.moghBankSortColumn) {
    const col = AppState.moghBankSortColumn;
    const dir = AppState.moghBankSortDir === 'asc' ? 1 : -1;
    mappedBankList.sort((a, b) => {
      let valA, valB;
      if (col === 'row') { valA = a.origRow; valB = b.origRow; }
      else if (col === 'sanadNo') { valA = a.matchedSanadNo; valB = b.matchedSanadNo; }
      else { valA = a[col]; valB = b[col]; }

      if (typeof valA === 'boolean' || typeof valB === 'boolean') {
        valA = valA ? 1 : 0;
        valB = valB ? 1 : 0;
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * dir;
      }
      return String(valA || '').localeCompare(String(valB || ''), 'fa', { numeric: true }) * dir;
    });
  }

  // اعمال جستجوی ترکیبی و لحظه‌ای سرستون‌های گرید بانک
  const srchBankRow = document.getElementById('srchBank_row')?.value.trim();
  const srchBankTxDate = document.getElementById('srchBank_txDate')?.value.trim();
  const srchBankSanadNo = document.getElementById('srchBank_sanadNo')?.value.trim();
  const srchBankRefNo = document.getElementById('srchBank_refNo')?.value.trim();
  const srchBankDebit = document.getElementById('srchBank_debit')?.value.trim();
  const srchBankCredit = document.getElementById('srchBank_credit')?.value.trim();
  const srchBankDesc = document.getElementById('srchBank_desc')?.value.trim();
  const srchBankIsClosed = document.getElementById('srchBank_isClosed')?.value.trim();

  if (srchBankRow) mappedBankList = mappedBankList.filter(t => String(t.origRow).includes(srchBankRow));
  if (srchBankTxDate) mappedBankList = mappedBankList.filter(t => String(t.txDate || '').includes(srchBankTxDate));
  if (srchBankSanadNo) mappedBankList = mappedBankList.filter(t => String(t.matchedSanadNo || '').includes(srchBankSanadNo));
  if (srchBankRefNo) mappedBankList = mappedBankList.filter(t => String(t.refNo || '').includes(srchBankRefNo));
  if (srchBankDebit) mappedBankList = mappedBankList.filter(t => (t.debit ? t.debit.toLocaleString() : '-').includes(srchBankDebit) || String(t.debit).includes(srchBankDebit));
  if (srchBankCredit) mappedBankList = mappedBankList.filter(t => (t.credit ? t.credit.toLocaleString() : '-').includes(srchBankCredit) || String(t.credit).includes(srchBankCredit));
  if (srchBankDesc) mappedBankList = mappedBankList.filter(t => String(t.desc || '').toLowerCase().includes(srchBankDesc.toLowerCase()));
  if (srchBankIsClosed) {
    mappedBankList = mappedBankList.filter(t => {
      const st = t.isClosed ? 'بسته' : 'باز';
      return st.toLowerCase().includes(srchBankIsClosed.toLowerCase());
    });
  }
  
  document.getElementById('lblCountBankTransactions').textContent = `تعداد رکورد در این تب: ${mappedBankList.length}`;
  
  tbodyBank.innerHTML = mappedBankList.map((t) => {
    const statusText = t.isClosed 
      ? '<span class="badge badge-success">✓ بسته</span>' 
      : '<span class="badge badge-danger">✗ باز</span>';
      
    const rowColor = t.isClosed ? 'background-color:rgba(16, 185, 129, 0.08);' : 'background-color:rgba(239, 68, 68, 0.04);';

    return `
      <tr style="${rowColor}">
        <td style="width:80px; padding:4px; text-align:center;">${t.origRow}</td>
        <td style="width:75px; padding:4px; text-align:center;">${t.txDate}</td>
        <td style="width:65px; padding:4px; text-align:center;">${t.matchedSanadNo}</td>
        <td style="width:85px; padding:4px; text-align:center;">${t.refNo}</td>
        <td style="width:105px; padding:4px; text-align:right; color:#ef4444;">${t.debit === 0 ? '-' : t.debit.toLocaleString()}</td>
        <td style="width:105px; padding:4px; text-align:right; color:#10b981;">${t.credit === 0 ? '-' : t.credit.toLocaleString()}</td>
        <td style="width:150px; max-width:150px; padding:4px; text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${t.desc}">${t.desc}</td>
        <td style="width:85px; padding:4px; text-align:center;">${statusText}</td>
      </tr>
    `;
  }).join('');
  
  // فیلترینگ تراکنش‌های دفاتر
  let ledgerList = AppState.ledgerTransactions;
  if (AppState.moghayeratReconciled) {
    if (AppState.moghLedgerSubtabFilter === 'allLedger') {
      // کل ارقام دفتر: تمام تراکنش‌های موجود دفتر
    } else if (AppState.moghLedgerSubtabFilter === 'all') ledgerList = ledgerList.filter(t => !t.isClosed);
    else if (AppState.moghLedgerSubtabFilter === 'debit') ledgerList = ledgerList.filter(t => !t.isClosed && t.debit > 0);
    else if (AppState.moghLedgerSubtabFilter === 'credit') ledgerList = ledgerList.filter(t => !t.isClosed && t.credit > 0);
    else if (AppState.moghLedgerSubtabFilter === 'closed') ledgerList = ledgerList.filter(t => t.isClosed);
    else if (AppState.moghLedgerSubtabFilter === 'closedDebit') ledgerList = ledgerList.filter(t => t.isClosed && t.debit > 0);
    else if (AppState.moghLedgerSubtabFilter === 'closedCredit') ledgerList = ledgerList.filter(t => t.isClosed && t.credit > 0);
    else if (AppState.moghLedgerSubtabFilter === 'dup') ledgerList = [];
  }

  let mappedLedgerList = ledgerList.map((t, idx) => ({ ...t, origRow: idx + 1 }));

  if (AppState.moghLedgerSortColumn) {
    const col = AppState.moghLedgerSortColumn;
    const dir = AppState.moghLedgerSortDir === 'asc' ? 1 : -1;
    mappedLedgerList.sort((a, b) => {
      let valA, valB;
      if (col === 'row') { valA = a.origRow; valB = b.origRow; }
      else { valA = a[col]; valB = b[col]; }

      if (typeof valA === 'boolean' || typeof valB === 'boolean') {
        valA = valA ? 1 : 0;
        valB = valB ? 1 : 0;
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * dir;
      }
      return String(valA || '').localeCompare(String(valB || ''), 'fa', { numeric: true }) * dir;
    });
  }

  // اعمال جستجوی ترکیبی و لحظه‌ای سرستون‌های گرید دفتر
  const srchLedgerRow = document.getElementById('srchLedger_row')?.value.trim();
  const srchLedgerDate = document.getElementById('srchLedger_date')?.value.trim();
  const srchLedgerSanadNo = document.getElementById('srchLedger_sanadNo')?.value.trim();
  const srchLedgerTxNo = document.getElementById('srchLedger_txNo')?.value.trim();
  const srchLedgerDebit = document.getElementById('srchLedger_debit')?.value.trim();
  const srchLedgerCredit = document.getElementById('srchLedger_credit')?.value.trim();
  const srchLedgerDesc = document.getElementById('srchLedger_desc')?.value.trim();
  const srchLedgerIsClosed = document.getElementById('srchLedger_isClosed')?.value.trim();

  if (srchLedgerRow) mappedLedgerList = mappedLedgerList.filter(t => String(t.origRow).includes(srchLedgerRow));
  if (srchLedgerDate) mappedLedgerList = mappedLedgerList.filter(t => String(t.date || '').includes(srchLedgerDate));
  if (srchLedgerSanadNo) mappedLedgerList = mappedLedgerList.filter(t => String(t.sanadNo || '').includes(srchLedgerSanadNo));
  if (srchLedgerTxNo) mappedLedgerList = mappedLedgerList.filter(t => String(t.txNo || '').includes(srchLedgerTxNo));
  if (srchLedgerDebit) mappedLedgerList = mappedLedgerList.filter(t => (t.debit ? t.debit.toLocaleString() : '-').includes(srchLedgerDebit) || String(t.debit).includes(srchLedgerDebit));
  if (srchLedgerCredit) mappedLedgerList = mappedLedgerList.filter(t => (t.credit ? t.credit.toLocaleString() : '-').includes(srchLedgerCredit) || String(t.credit).includes(srchLedgerCredit));
  if (srchLedgerDesc) mappedLedgerList = mappedLedgerList.filter(t => String(t.desc || '').toLowerCase().includes(srchLedgerDesc.toLowerCase()));
  if (srchLedgerIsClosed) {
    mappedLedgerList = mappedLedgerList.filter(t => {
      const st = t.isClosed ? 'بسته' : 'باز';
      return st.toLowerCase().includes(srchLedgerIsClosed.toLowerCase());
    });
  }
  
  document.getElementById('lblCountLedgerTransactions').textContent = `تعداد رکورد در این تب: ${mappedLedgerList.length}`;
  
  tbodyLedger.innerHTML = mappedLedgerList.map((t) => {
    const statusText = t.isClosed 
      ? '<span class="badge badge-success">✓ بسته</span>' 
      : '<span class="badge badge-danger">✗ باز</span>';
      
    const rowColor = t.isClosed ? 'background-color:rgba(16, 185, 129, 0.08);' : 'background-color:rgba(239, 68, 68, 0.04);';
    
    return `
      <tr style="${rowColor}">
        <td style="width:35px; padding:4px; text-align:center;">${t.origRow}</td>
        <td style="width:45px; padding:4px; text-align:center;">
          <button class="btn btn-outline btn-xs" style="padding:1px 6px; font-size:0.65rem; font-weight:bold; border-color:#3b82f6; color:#3b82f6;" onclick="event.stopPropagation(); openSanadFromMoghayerat('${t.sanadNo}', ${t.lineIndex ?? -1})">سند</button>
        </td>
        <td style="width:75px; padding:4px; text-align:center;">${t.date}</td>
        <td style="width:65px; padding:4px; text-align:center;">${t.sanadNo}</td>
        <td style="width:85px; padding:4px; text-align:center;">${t.txNo || '-'}</td>
        <td style="width:105px; padding:4px; text-align:right; color:#10b981;">${t.debit === 0 ? '-' : t.debit.toLocaleString()}</td>
        <td style="width:105px; padding:4px; text-align:right; color:#ef4444;">${t.credit === 0 ? '-' : t.credit.toLocaleString()}</td>
        <td style="width:150px; max-width:150px; padding:4px; text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${t.desc}">${t.desc}</td>
        <td style="width:85px; padding:4px; text-align:center;">${statusText}</td>
      </tr>
    `;
  }).join('');
}

// ── زیرتب ۴: پیشنهاد برای رفع مغایرت ──

function renderMoghayeratSuggestions() {
  const container = document.getElementById('divMoghSuggestionsList');
  if (!container) return;
  
  if (!AppState.moghayeratReconciled) {
    container.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted); text-align:center; padding:30px;">هیچ مغایرت بازی جهت ارائه پیشنهاد یافت نشد. لطفاً ابتدا در تب «مغایرت گیری» دکمه تهیه مغایرت را فشار دهید.</div>`;
    return;
  }
  
  // یافتن اقلام باز
  const openBank = AppState.bankTransactions.filter(t => !t.isClosed);
  const openLedger = AppState.ledgerTransactions.filter(t => !t.isClosed);
  
  if (openBank.length === 0 && openLedger.length === 0) {
    container.innerHTML = `<div style="font-size:0.8rem; color:#10b981; text-align:center; padding:30px; font-weight:bold;">✓ تبریک! هیچ مغایرتی بین صورت‌حساب بانک و دفاتر مالی شرکت وجود ندارد.</div>`;
    return;
  }
  
  let html = '';
  
  // ۱. اقلامی که در بانک هستند اما در دفاتر ثبت نشده‌اند
  openBank.forEach(b => {
    if (b.credit > 0) {
      // بانک بستانکار شده (دریافت شده) اما دفتر ثبت نکرده
      html += `
        <div style="background:rgba(56, 189, 248, 0.05); border:1px solid rgba(56, 189, 248, 0.2); border-radius:4px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span style="color:var(--accent-color); font-weight:bold; font-size:0.8rem;">[ثبت نشده در دفاتر]</span>
            <span style="font-size:0.8rem; margin-right:8px;">مبلغ <b>${b.credit.toLocaleString()} ریال</b> بابت <b>${b.desc}</b> در بانک واریز شده ولی در دفاتر ثبت نگردیده است.</span>
          </div>
          <button class="btn btn-primary btn-xs" onclick="generateAdjustmentSanad(${b.credit}, 'debit', '${b.desc}')">ثبت آرتیکل اصلاحی</button>
        </div>
      `;
    } else if (b.debit > 0) {
      // بانک بدهکار شده (کارمزد یا برداشت) اما دفتر ثبت نکرده
      html += `
        <div style="background:rgba(239, 68, 68, 0.05); border:1px solid rgba(239, 68, 68, 0.2); border-radius:4px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span style="color:#ef4444; font-weight:bold; font-size:0.8rem;">[هزینه ثبت نشده]</span>
            <span style="font-size:0.8rem; margin-right:8px;">مبلغ <b>${b.debit.toLocaleString()} ریال</b> بابت <b>${b.desc}</b> از بانک کسر شده ولی در دفاتر ثبت نگردیده است.</span>
          </div>
          <button class="btn btn-primary btn-xs" onclick="generateAdjustmentSanad(${b.debit}, 'credit', '${b.desc}')">ثبت آرتیکل اصلاحی</button>
        </div>
      `;
    }
  });
  
  // ۲. اقلامی که در دفاتر ثبت شده‌اند اما در بانک وصول نشده‌اند (مانند چک‌های معوق)
  openLedger.forEach(l => {
    if (l.credit > 0) {
      html += `
        <div style="background:rgba(245, 158, 11, 0.05); border:1px solid rgba(245, 158, 11, 0.2); border-radius:4px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span style="color:#f59e0b; font-weight:bold; font-size:0.8rem;">[چک معوق وصول نشده]</span>
            <span style="font-size:0.8rem; margin-right:8px;">چک شماره <b>${l.sanadNo}</b> به مبلغ <b>${l.credit.toLocaleString()} ریال</b> صادر شده ولی هنوز از بانک برداشت نشده است.</span>
          </div>
          <span style="font-size:0.75rem; color:var(--text-muted);">نیاز به اقدام اصلاحی ندارد (پیگیری وصول)</span>
        </div>
      `;
    }
  });
  
  container.innerHTML = html;
}

function generateAdjustmentSanad(amount, side, desc) {
  // شبیه‌سازی ایجاد آرتیکل اصلاحی در فرم ویرایش سند
  alert(`سند اصلاحی با شرح "${desc}" و مبلغ ${amount.toLocaleString()} ریال در دفاتر ثبت گردید.`);
  
  // تبدیل تراکنش به حالت بسته
  const bankTx = AppState.bankTransactions.find(t => t.debit === amount || t.credit === amount);
  if (bankTx) bankTx.isClosed = true;
  
  renderMoghayeratSuggestions();
  renderMoghayeratReconcilePanel();
}

// ── دکمه‌های نوار ابزار اصلی پایین ──

function exportMoghayeratExcel() {
  alert('گزارش اقلام مغایرت بانکی با فرمت اکسل تولید و در مسیر دانلودهای سیستم ذخیره شد.');
}

function printMoghStatementReport() {
  alert('گزارش چاپی صورتحساب بانکی صادر گردید.');
}

function transferMoghDescToLedger() {
  alert('انتقال شرح صورتحساب بانک به شرح ردیف دفاتر با موفقیت برای تمامی اقلام بسته شده انجام گرفت.');
}


// ==========================================
// ACCOUNTING REPORTS IMPLEMENTATION
// ==========================================

// Ensure sanad lines are populated on initial mock data
function ensureSanadMockLines() {
  AppState.sanads.forEach(s => {
    if (!s.lines) {
      if (s.id === 101) {
        s.lines = [
          { account: '110101', shenavarCode: 'SH-101', desc: 'سند افتتاحیه صندوق مرکزی', debit: 5000000000, credit: 0, txNo: '101', txDate: '1403/01/05' },
          { account: '210101', shenavarCode: '', desc: 'سند افتتاحیه تامین‌کنندگان', debit: 0, credit: 5000000000, txNo: '101', txDate: '1403/01/05' }
        ];
      } else if (s.id === 102) {
        s.lines = [
          { account: '110102', shenavarCode: 'SH-102', desc: 'دریافت بانک ملی بابت فروش', debit: 125000000, credit: 0, txNo: '102', txDate: '1403/05/10' },
          { account: '420101', shenavarCode: '', desc: 'درآمد حاصل از فروش کالا', debit: 0, credit: 125000000, txNo: '102', txDate: '1403/05/10' }
        ];
      } else {
        s.lines = [
          { account: '110101', desc: `آرتیکل بدهکار - بابت ${s.desc}`, debit: s.debit, credit: 0, txNo: s.id.toString(), txDate: s.date },
          { account: '210101', desc: `آرتیکل بستانکار - بابت ${s.desc}`, debit: 0, credit: s.credit, txNo: s.id.toString(), txDate: s.date }
        ];
      }
    }
  });
}

// 1. Trial Balance (تراز آزمایشی)
function toggleTarazNode(nodeIdOrCode) {
  if (!AppState.expandedTarazNodes) {
    AppState.expandedTarazNodes = new Set();
  }
  const key = String(nodeIdOrCode);
  if (AppState.expandedTarazNodes.has(key)) {
    AppState.expandedTarazNodes.delete(key);
  } else {
    AppState.expandedTarazNodes.add(key);
  }
  calculateTrialBalance();
}

function isAccountTreeNodeVisible(acc) {
  let curr = acc;
  while (curr && curr.parentId !== null && curr.parentId !== undefined) {
    const parentAcc = AppState.accounts.find(p => p.id === curr.parentId);
    if (!parentAcc) break;
    const parentKeyId = String(parentAcc.id);
    const parentKeyCode = String(parentAcc.code);
    if (!AppState.expandedTarazNodes.has(parentKeyId) && !AppState.expandedTarazNodes.has(parentKeyCode)) {
      return false;
    }
    curr = parentAcc;
  }
  return true;
}

function populateTarazFields() {
  ensureSanadMockLines();
  const fromEl = document.getElementById('tarazFromDate');
  const toEl = document.getElementById('tarazToDate');
  if (fromEl && !fromEl.value) fromEl.value = '1403/01/01';
  if (toEl && !toEl.value) toEl.value = '1403/12/29';
  calculateTrialBalance();
}

function calculateTrialBalance() {
  ensureSanadMockLines();
  const colCount = Number(document.getElementById('tarazColCount')?.value || 4);
  const maxLevel = document.getElementById('tarazLevel')?.value || 'moein';
  const fromDate = document.getElementById('tarazFromDate')?.value || '1403/01/01';
  const toDate = document.getElementById('tarazToDate')?.value || '1403/12/29';
  const onlyTurnover = document.getElementById('tarazOnlyTurnover')?.checked;

  if (!AppState.expandedTarazNodes) {
    AppState.expandedTarazNodes = new Set(); // پیش‌فرض بسته بودن گره‌ها جهت باز شدن با دکمه +
  }

  const headerRow = document.querySelector('#tblTrialBalance thead');
  const bodyEl = document.getElementById('tblTrialBalanceBody');
  const footerEl = document.getElementById('tblTrialBalanceFooter');
  if (!bodyEl) return;

  // Render headers
  let headerHtml = '';
  if (colCount === 2) {
    headerHtml = `
      <tr style="background:linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-bottom:2px solid #3b82f6; color:#f8fafc;">
        <th style="padding:8px; text-align:center; width:55px;">دفتر</th>
        <th style="padding:8px; text-align:center; width:110px;">کد حساب</th>
        <th style="padding:8px; text-align:right;">نام حساب</th>
        <th style="padding:8px; text-align:left; width:180px;">مانده بدهکار (ریال)</th>
        <th style="padding:8px; text-align:left; width:180px;">مانده بستانکار (ریال)</th>
      </tr>
    `;
  } else if (colCount === 4) {
    headerHtml = `
      <tr style="background:linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-bottom:2px solid #3b82f6; color:#f8fafc;">
        <th style="padding:8px; text-align:center; width:55px;">دفتر</th>
        <th style="padding:8px; text-align:center; width:110px;">کد حساب</th>
        <th style="padding:8px; text-align:right;">نام حساب</th>
        <th style="padding:8px; text-align:left; width:150px;">گردش بدهکار (ریال)</th>
        <th style="padding:8px; text-align:left; width:150px;">گردش بستانکار (ریال)</th>
        <th style="padding:8px; text-align:left; width:150px;">مانده بدهکار (ریال)</th>
        <th style="padding:8px; text-align:left; width:150px;">مانده بستانکار (ریال)</th>
      </tr>
    `;
  } else {
    headerHtml = `
      <tr style="background:linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-bottom:2px solid #3b82f6; color:#f8fafc;">
        <th style="padding:8px; text-align:center; width:55px;">دفتر</th>
        <th style="padding:8px; text-align:center; width:100px;">کد حساب</th>
        <th style="padding:8px; text-align:right;">نام حساب</th>
        <th style="padding:8px; text-align:left; width:130px;">مانده قبل بدهکار</th>
        <th style="padding:8px; text-align:left; width:130px;">مانده قبل بستانکار</th>
        <th style="padding:8px; text-align:left; width:130px;">گردش طی بدهکار</th>
        <th style="padding:8px; text-align:left; width:130px;">گردش طی بستانکار</th>
        <th style="padding:8px; text-align:left; width:130px;">مانده نهایی بدهکار</th>
        <th style="padding:8px; text-align:left; width:130px;">مانده نهایی بستانکار</th>
      </tr>
    `;
  }
  if (headerRow) headerRow.innerHTML = headerHtml;

  // استفاده از پیمایش پیش‌ترتیب (Depth-First Pre-Order) تا تمام فرزندان بلافاصله زیر والد قرار گیرند
  const sortedAccounts = sortTreePreOrder(AppState.accounts);

  // Process data
  let rowData = [];
  sortedAccounts.forEach(acc => {
    // Determine level
    let meetsLevel = false;
    if (maxLevel === 'group' && acc.type === 'گروه') meetsLevel = true;
    if (maxLevel === 'kol' && (acc.type === 'گروه' || acc.type === 'کل')) meetsLevel = true;
    if (maxLevel === 'moein' && (acc.type === 'گروه' || acc.type === 'کل' || acc.type === 'معین')) meetsLevel = true;
    if (maxLevel === 'tafsili') meetsLevel = true; // All

    if (!meetsLevel) return;

    // بررسی وضعیت گستردگی/جمعبندی والدها در درخت
    if (!isAccountTreeNodeVisible(acc)) return;

    // Calculate sums
    let debitBefore = 0, creditBefore = 0;
    let debitTurnover = 0, creditTurnover = 0;

    AppState.sanads.forEach(s => {
      if (!s.lines) return;
      s.lines.forEach(line => {
        if (line.account && line.account.startsWith(acc.code)) {
          const date = line.txDate || s.date;
          if (date < fromDate) {
            debitBefore += Number(line.debit || 0);
            creditBefore += Number(line.credit || 0);
          } else if (date >= fromDate && date <= toDate) {
            debitTurnover += Number(line.debit || 0);
            creditTurnover += Number(line.credit || 0);
          }
        }
      });
    });

    const beforeDiff = debitBefore - creditBefore;
    const beforeDeb = beforeDiff > 0 ? beforeDiff : 0;
    const beforeCred = beforeDiff < 0 ? -beforeDiff : 0;

    const netDebit = debitBefore + debitTurnover;
    const netCredit = creditBefore + creditTurnover;
    const netDiff = netDebit - netCredit;
    const endDeb = netDiff > 0 ? netDiff : 0;
    const endCred = netDiff < 0 ? -netDiff : 0;

    if (onlyTurnover && debitBefore === 0 && creditBefore === 0 && debitTurnover === 0 && creditTurnover === 0) {
      return;
    }

    rowData.push({
      acc,
      beforeDeb,
      beforeCred,
      debitTurnover,
      creditTurnover,
      endDeb,
      endCred
    });
  });

  if (rowData.length === 0) {
    bodyEl.innerHTML = `<tr><td colspan="${colCount === 2 ? 5 : (colCount === 4 ? 7 : 9)}" style="text-align:center; color:var(--text-muted); padding:30px;">داده‌ای یافت نشد.</td></tr>`;
    if (footerEl) footerEl.innerHTML = '';
    return;
  }

  // Render rows with modern high-contrast styling
  bodyEl.innerHTML = rowData.map(row => {
    const acc = row.acc;
    const hasChildren = AppState.accounts.some(child => child.parentId === acc.id);
    const nodeKey = String(acc.id);
    const isExpanded = AppState.expandedTarazNodes.has(nodeKey) || AppState.expandedTarazNodes.has(acc.code);

    let rowStyle = '';
    let codeColor = '#38bdf8';
    let titleColor = '#f8fafc';
    let indent = 0;

    const level = getAccountLevel(acc);
    if (level === 0 || acc.type === 'گروه') {
      rowStyle = 'background:linear-gradient(90deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%); font-weight:bold; border-bottom:1px solid rgba(59, 130, 246, 0.2);';
      codeColor = '#93c5fd';
      titleColor = '#60a5fa';
      indent = 8;
    } else if (level === 1 || acc.type === 'کل') {
      rowStyle = 'background:linear-gradient(90deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.4) 100%); font-weight:600; border-bottom:1px solid rgba(255, 255, 255, 0.05);';
      codeColor = '#38bdf8';
      titleColor = '#e2e8f0';
      indent = 28;
    } else if (level === 2 || acc.type === 'معین') {
      rowStyle = 'background:rgba(15, 23, 42, 0.25); border-bottom:1px solid rgba(255, 255, 255, 0.03);';
      codeColor = '#a7f3d0';
      titleColor = '#cbd5e1';
      indent = 48;
    } else {
      rowStyle = 'background:transparent; border-bottom:1px solid rgba(255, 255, 255, 0.02);';
      codeColor = '#cbd5e1';
      titleColor = '#94a3b8';
      indent = 68;
    }

    const toggleBtn = hasChildren
      ? `<button class="btn btn-outline" style="width:20px; height:20px; padding:0; line-height:18px; text-align:center; font-weight:bold; font-size:0.85rem; border-color:${isExpanded ? '#fb7185' : '#38bdf8'}; color:${isExpanded ? '#fb7185' : '#38bdf8'}; background:${isExpanded ? 'rgba(251, 113, 133, 0.15)' : 'rgba(56, 189, 248, 0.15)'}; border-radius:4px; margin-left:6px; cursor:pointer; box-shadow:0 0 6px ${isExpanded ? 'rgba(251,113,133,0.2)' : 'rgba(56,189,248,0.2)'};" onclick="event.stopPropagation(); toggleTarazNode('${acc.id}')">${isExpanded ? '-' : '+'}</button>`
      : `<span style="display:inline-block; width:20px; height:20px; margin-left:6px;"></span>`;

    const folderIcon = hasChildren ? (isExpanded ? '📂' : '📁') : '📄';

    const nameSpan = `<span style="padding-right:${indent}px; display:inline-flex; align-items:center;">
      ${toggleBtn}
      <span style="margin-left:6px; font-size:0.85rem;">${folderIcon}</span>
      <span style="color:${titleColor};">${acc.name}</span>
    </span>`;

    const ledgerBtn = `<button class="btn btn-outline" style="padding:2px 6px; font-size:0.68rem; border-color:var(--accent-color); color:var(--accent-color); border-radius:3px;" onclick="navigateToLedger('${acc.code}')">دفتر</button>`;

    const formatDeb = (val) => val ? `<span style="color:#f87171; font-weight:600;">${val.toLocaleString()}</span>` : '<span style="color:#64748b;">-</span>';
    const formatCred = (val) => val ? `<span style="color:#34d399; font-weight:600;">${val.toLocaleString()}</span>` : '<span style="color:#64748b;">-</span>';

    if (colCount === 2) {
      return `
        <tr style="${rowStyle}">
          <td style="text-align:center; padding:6px;">${ledgerBtn}</td>
          <td style="text-align:center; font-family:monospace; font-weight:bold; color:${codeColor}; padding:6px;">${acc.code}</td>
          <td style="padding:6px;">${nameSpan}</td>
          <td style="text-align:left; padding:6px;">${formatDeb(row.endDeb)}</td>
          <td style="text-align:left; padding:6px;">${formatCred(row.endCred)}</td>
        </tr>
      `;
    } else if (colCount === 4) {
      return `
        <tr style="${rowStyle}">
          <td style="text-align:center; padding:6px;">${ledgerBtn}</td>
          <td style="text-align:center; font-family:monospace; font-weight:bold; color:${codeColor}; padding:6px;">${acc.code}</td>
          <td style="padding:6px;">${nameSpan}</td>
          <td style="text-align:left; padding:6px;">${formatDeb(row.debitTurnover)}</td>
          <td style="text-align:left; padding:6px;">${formatCred(row.creditTurnover)}</td>
          <td style="text-align:left; padding:6px;">${formatDeb(row.endDeb)}</td>
          <td style="text-align:left; padding:6px;">${formatCred(row.endCred)}</td>
        </tr>
      `;
    } else {
      return `
        <tr style="${rowStyle}">
          <td style="text-align:center; padding:6px;">${ledgerBtn}</td>
          <td style="text-align:center; font-family:monospace; font-weight:bold; color:${codeColor}; padding:6px;">${acc.code}</td>
          <td style="padding:6px;">${nameSpan}</td>
          <td style="text-align:left; padding:6px;">${formatDeb(row.beforeDeb)}</td>
          <td style="text-align:left; padding:6px;">${formatCred(row.beforeCred)}</td>
          <td style="text-align:left; padding:6px;">${formatDeb(row.debitTurnover)}</td>
          <td style="text-align:left; padding:6px;">${formatCred(row.creditTurnover)}</td>
          <td style="text-align:left; padding:6px;">${formatDeb(row.endDeb)}</td>
          <td style="text-align:left; padding:6px;">${formatCred(row.endCred)}</td>
        </tr>
      `;
    }
  }).join('');

  // Calculate totals
  const totalBeforeDeb = rowData.filter(r => r.acc.type === 'معین').reduce((s, r) => s + r.beforeDeb, 0);
  const totalBeforeCred = rowData.filter(r => r.acc.type === 'معین').reduce((s, r) => s + r.beforeCred, 0);
  const totalTurnDeb = rowData.filter(r => r.acc.type === 'معین').reduce((s, r) => s + r.debitTurnover, 0);
  const totalTurnCred = rowData.filter(r => r.acc.type === 'معین').reduce((s, r) => s + r.creditTurnover, 0);
  const totalEndDeb = rowData.filter(r => r.acc.type === 'معین').reduce((s, r) => s + r.endDeb, 0);
  const totalEndCred = rowData.filter(r => r.acc.type === 'معین').reduce((s, r) => s + r.endCred, 0);

  let footerHtml = '';
  if (colCount === 2) {
    footerHtml = `
      <tr>
        <td colspan="3" style="text-align:left; padding:8px;">جمع کل (حساب‌های معین):</td>
        <td style="text-align:left; color:#1e40af; font-size:0.85rem;">${totalEndDeb.toLocaleString()}</td>
        <td style="text-align:left; color:#1e40af; font-size:0.85rem;">${totalEndCred.toLocaleString()}</td>
      </tr>
    `;
  } else if (colCount === 4) {
    footerHtml = `
      <tr>
        <td colspan="3" style="text-align:left; padding:8px;">جمع کل (حساب‌های معین):</td>
        <td style="text-align:left; color:#1e40af; font-size:0.85rem;">${totalTurnDeb.toLocaleString()}</td>
        <td style="text-align:left; color:#1e40af; font-size:0.85rem;">${totalTurnCred.toLocaleString()}</td>
        <td style="text-align:left; color:#1e40af; font-size:0.85rem;">${totalEndDeb.toLocaleString()}</td>
        <td style="text-align:left; color:#1e40af; font-size:0.85rem;">${totalEndCred.toLocaleString()}</td>
      </tr>
    `;
  } else {
    footerHtml = `
      <tr>
        <td colspan="3" style="text-align:left; padding:8px;">جمع کل (حساب‌های معین):</td>
        <td style="text-align:left; color:#1e40af; font-size:0.85rem;">${totalBeforeDeb.toLocaleString()}</td>
        <td style="text-align:left; color:#1e40af; font-size:0.85rem;">${totalBeforeCred.toLocaleString()}</td>
        <td style="text-align:left; color:#1e40af; font-size:0.85rem;">${totalTurnDeb.toLocaleString()}</td>
        <td style="text-align:left; color:#1e40af; font-size:0.85rem;">${totalTurnCred.toLocaleString()}</td>
        <td style="text-align:left; color:#1e40af; font-size:0.85rem;">${totalEndDeb.toLocaleString()}</td>
        <td style="text-align:left; color:#1e40af; font-size:0.85rem;">${totalEndCred.toLocaleString()}</td>
      </tr>
    `;
  }
  if (footerEl) footerEl.innerHTML = footerHtml;
}

function navigateToLedger(accountCode) {
  switchHesabdariTab('ledger');
  const selectEl = document.getElementById('ledgerAccountSelect');
  if (selectEl) {
    selectEl.value = accountCode;
    calculateAccountLedger();
  }
}

function printTrialBalance() {
  window.print();
}

function exportTrialBalanceExcel() {
  alert('گزارش تراز آزمایشی به فرمت اکسل (CSV) تولید و دانلود شد.');
}


// 2. Account Ledger (دفتر حساب)
function populateLedgerCombos() {
  ensureSanadMockLines();
  const selectEl = document.getElementById('ledgerAccountSelect');
  if (!selectEl) return;

  const currentVal = selectEl.value;
  selectEl.innerHTML = AppState.accounts.map(acc => `
    <option value="${acc.code}">${acc.code} - ${acc.name} (${acc.type})</option>
  `).join('');

  if (currentVal && AppState.accounts.some(x => x.code === currentVal)) {
    selectEl.value = currentVal;
  } else {
    // Default to first moein account
    const firstMoein = AppState.accounts.find(x => x.type === 'معین');
    if (firstMoein) selectEl.value = firstMoein.code;
  }
  
  const fromEl = document.getElementById('ledgerFromDate');
  const toEl = document.getElementById('ledgerToDate');
  if (fromEl && !fromEl.value) fromEl.value = '1403/01/01';
  if (toEl && !toEl.value) toEl.value = '1403/12/29';
}

function calculateAccountLedger() {
  ensureSanadMockLines();
  const accountCode = document.getElementById('ledgerAccountSelect')?.value;
  const fromDate = document.getElementById('ledgerFromDate')?.value || '1403/01/01';
  const toDate = document.getElementById('ledgerToDate')?.value || '1403/12/29';
  const descType = document.getElementById('ledgerDescType')?.value || 'line';
  const statusFilter = document.getElementById('ledgerStatusFilter')?.value || 'all';

  const bodyEl = document.getElementById('tblAccountLedgerBody');
  const titleEl = document.getElementById('lblLedgerAccountTitle');
  if (!bodyEl) return;

  const activeAcc = AppState.accounts.find(x => x.code === accountCode);
  if (!activeAcc) {
    bodyEl.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted); padding:30px;">سرفصل معتبری انتخاب نشده است.</td></tr>`;
    return;
  }

  if (titleEl) titleEl.textContent = `دفتر حساب: ${activeAcc.code} - ${activeAcc.name}`;

  // Compute previous balance
  let prevDebit = 0, prevCredit = 0;
  let ledgerLines = [];

  AppState.sanads.forEach(s => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'moo' && s.status !== 'موقت') return;
      if (statusFilter === 'dai' && s.status !== 'دائم') return;
    }

    if (!s.lines) return;
    s.lines.forEach(line => {
      if (line.account && line.account.startsWith(accountCode)) {
        const date = line.txDate || s.date;
        if (date < fromDate) {
          prevDebit += Number(line.debit || 0);
          prevCredit += Number(line.credit || 0);
        } else if (date >= fromDate && date <= toDate) {
          ledgerLines.push({
            date: date,
            sanadId: s.id,
            desc: descType === 'both' ? `${s.desc} / ${line.desc || ''}` : (line.desc || s.desc),
            debit: Number(line.debit || 0),
            credit: Number(line.credit || 0)
          });
        }
      }
    });
  });

  // Sort lines by date, then by sanadId
  ledgerLines.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.sanadId - b.sanadId;
  });

  let html = '';

  // Render "مانده از قبل" row
  let runningBalance = prevDebit - prevCredit;
  let runningInd = runningBalance > 0 ? 'بد' : (runningBalance < 0 ? 'بس' : 'بی');
  
  html += `
    <tr style="background:rgba(220, 235, 255, 0.7); font-weight:bold;">
      <td style="text-align:center;">-</td>
      <td style="text-align:center; color:#475569;">-</td>
      <td style="text-align:center; color:#475569;">-</td>
      <td style="color:#1e3a8a;">مانده از قبل (سوابق قبلی)</td>
      <td style="text-align:left;">${prevDebit.toLocaleString()}</td>
      <td style="text-align:left;">${prevCredit.toLocaleString()}</td>
      <td style="text-align:center; color:#1e40af;">${runningInd}</td>
      <td style="text-align:left; color:#1e40af;">${Math.abs(runningBalance).toLocaleString()}</td>
    </tr>
  `;

  // Render transaction lines
  let totalDeb = prevDebit;
  let totalCred = prevCredit;

  ledgerLines.forEach((line, idx) => {
    runningBalance += line.debit - line.credit;
    runningInd = runningBalance > 0 ? 'بد' : (runningBalance < 0 ? 'بس' : 'بی');
    totalDeb += line.debit;
    totalCred += line.credit;

    html += `
      <tr>
        <td style="text-align:center; color:var(--text-muted);">${idx + 1}</td>
        <td style="text-align:center; font-family:monospace;">${line.date}</td>
        <td style="text-align:center; font-weight:bold; color:var(--accent-color); cursor:pointer;" onclick="openEditSanad(${line.sanadId})">${line.sanadId}</td>
        <td style="text-align:right;">${line.desc}</td>
        <td style="text-align:left; color:#047857;">${line.debit ? line.debit.toLocaleString() : '0'}</td>
        <td style="text-align:left; color:#b91c1c;">${line.credit ? line.credit.toLocaleString() : '0'}</td>
        <td style="text-align:center; font-weight:bold;">${runningInd}</td>
        <td style="text-align:left; font-weight:bold;">${Math.abs(runningBalance).toLocaleString()}</td>
      </tr>
    `;
  });

  // Render "جمع کل" footer row
  const finalInd = runningBalance > 0 ? 'بد' : (runningBalance < 0 ? 'بس' : 'بی');
  html += `
    <tr style="background:rgba(255, 255, 200, 0.7); font-weight:bold; border-top:2px solid var(--border-color);">
      <td colspan="4" style="text-align:left; padding:8px;">جمع نهایی دفتر با احتساب مانده قبلی:</td>
      <td style="text-align:left; color:#047857;">${totalDeb.toLocaleString()}</td>
      <td style="text-align:left; color:#b91c1c;">${totalCred.toLocaleString()}</td>
      <td style="text-align:center; color:#1e40af;">${finalInd}</td>
      <td style="text-align:left; color:#1e40af;">${Math.abs(runningBalance).toLocaleString()}</td>
    </tr>
  `;

  bodyEl.innerHTML = html;
}

function printAccountLedger() {
  window.print();
}

function exportAccountLedgerExcel() {
  alert('گزارش دفتر حساب به فرمت اکسل (CSV) صادر گردید.');
}


// 3. Floating Account Balance (تراز شناور)
function calculateTarazShenavar() {
  ensureSanadMockLines();
  const fromDate = document.getElementById('tarazShenavarFromDate')?.value || '1403/01/01';
  const toDate = document.getElementById('tarazShenavarToDate')?.value || '1403/12/29';

  const bodyEl = document.getElementById('tblTarazShenavarBody');
  const footerEl = document.getElementById('tblTarazShenavarFooter');
  if (!bodyEl) return;

  let rowData = [];
  AppState.shenavars.forEach(sh => {
    let debitTurnover = 0, creditTurnover = 0;
    
    AppState.sanads.forEach(s => {
      if (!s.lines) return;
      s.lines.forEach(line => {
        if (line.shenavarCode === sh.code) {
          const date = line.txDate || s.date;
          if (date >= fromDate && date <= toDate) {
            debitTurnover += Number(line.debit || 0);
            creditTurnover += Number(line.credit || 0);
          }
        }
      });
    });

    const diff = debitTurnover - creditTurnover;
    const endDeb = diff > 0 ? diff : 0;
    const endCred = diff < 0 ? -diff : 0;

    rowData.push({
      sh,
      debitTurnover,
      creditTurnover,
      endDeb,
      endCred
    });
  });

  bodyEl.innerHTML = rowData.map(row => {
    const detailBtn = `<button class="btn btn-outline" style="padding:1px 5px; font-size:0.7rem; border-color:var(--accent-color); color:var(--accent-color);" onclick="navigateToDaftarShenavar('${row.sh.code}')">دفتر</button>`;
    return `
      <tr>
        <td style="text-align:center;">${detailBtn}</td>
        <td style="text-align:center; font-family:monospace; font-weight:bold;">${row.sh.code}</td>
        <td>${row.sh.name}</td>
        <td style="text-align:left;">${row.debitTurnover ? row.debitTurnover.toLocaleString() : '0'}</td>
        <td style="text-align:left;">${row.creditTurnover ? row.creditTurnover.toLocaleString() : '0'}</td>
        <td style="text-align:left; font-weight:bold; color:#047857;">${row.endDeb ? row.endDeb.toLocaleString() : '0'}</td>
        <td style="text-align:left; font-weight:bold; color:#b91c1c;">${row.endCred ? row.endCred.toLocaleString() : '0'}</td>
      </tr>
    `;
  }).join('');

  // Totals
  const sumDebTurn = rowData.reduce((s, r) => s + r.debitTurnover, 0);
  const sumCredTurn = rowData.reduce((s, r) => s + r.creditTurnover, 0);
  const sumEndDeb = rowData.reduce((s, r) => s + r.endDeb, 0);
  const sumEndCred = rowData.reduce((s, r) => s + r.endCred, 0);

  if (footerEl) {
    footerEl.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:left; padding:8px;">جمع کل شناورها:</td>
        <td style="text-align:left; color:#1e40af;">${sumDebTurn.toLocaleString()}</td>
        <td style="text-align:left; color:#1e40af;">${sumCredTurn.toLocaleString()}</td>
        <td style="text-align:left; color:#047857;">${sumEndDeb.toLocaleString()}</td>
        <td style="text-align:left; color:#b91c1c;">${sumEndCred.toLocaleString()}</td>
      </tr>
    `;
  }
}

function navigateToDaftarShenavar(shenavarCode) {
  switchHesabdariTab('daftar-shenavar');
  const selectEl = document.getElementById('daftarShenavarSelect');
  if (selectEl) {
    selectEl.value = shenavarCode;
    calculateDaftarShenavar();
  }
}


// 4. Floating Account Ledger (دفتر شناور)
function populateDaftarShenavarCombos() {
  ensureSanadMockLines();
  const selectEl = document.getElementById('daftarShenavarSelect');
  if (!selectEl) return;

  const currentVal = selectEl.value;
  selectEl.innerHTML = AppState.shenavars.map(sh => `
    <option value="${sh.code}">${sh.code} - ${sh.name}</option>
  `).join('');

  if (currentVal && AppState.shenavars.some(x => x.code === currentVal)) {
    selectEl.value = currentVal;
  } else {
    if (AppState.shenavars.length > 0) selectEl.value = AppState.shenavars[0].code;
  }

  const fromEl = document.getElementById('daftarShenavarFromDate');
  const toEl = document.getElementById('daftarShenavarToDate');
  if (fromEl && !fromEl.value) fromEl.value = '1403/01/01';
  if (toEl && !toEl.value) toEl.value = '1403/12/29';
}

function calculateDaftarShenavar() {
  ensureSanadMockLines();
  const shenavarCode = document.getElementById('daftarShenavarSelect')?.value;
  const fromDate = document.getElementById('daftarShenavarFromDate')?.value || '1403/01/01';
  const toDate = document.getElementById('daftarShenavarToDate')?.value || '1403/12/29';

  const bodyEl = document.getElementById('tblDaftarShenavarBody');
  const titleEl = document.getElementById('lblDaftarShenavarTitle');
  if (!bodyEl) return;

  const sh = AppState.shenavars.find(x => x.code === shenavarCode);
  if (!sh) {
    bodyEl.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted); padding:30px;">حساب شناور معتبری انتخاب نشده است.</td></tr>`;
    return;
  }

  if (titleEl) titleEl.textContent = `دفتر شناور: ${sh.code} - ${sh.name}`;

  let prevDebit = 0, prevCredit = 0;
  let ledgerLines = [];

  AppState.sanads.forEach(s => {
    if (!s.lines) return;
    s.lines.forEach(line => {
      if (line.shenavarCode === shenavarCode) {
        const date = line.txDate || s.date;
        if (date < fromDate) {
          prevDebit += Number(line.debit || 0);
          prevCredit += Number(line.credit || 0);
        } else if (date >= fromDate && date <= toDate) {
          ledgerLines.push({
            date: date,
            sanadId: s.id,
            desc: line.desc || s.desc,
            debit: Number(line.debit || 0),
            credit: Number(line.credit || 0)
          });
        }
      }
    });
  });

  ledgerLines.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.sanadId - b.sanadId;
  });

  let html = '';
  let runningBalance = prevDebit - prevCredit;
  let runningInd = runningBalance > 0 ? 'بد' : (runningBalance < 0 ? 'بس' : 'بی');

  html += `
    <tr style="background:rgba(220, 235, 255, 0.7); font-weight:bold;">
      <td style="text-align:center;">-</td>
      <td style="text-align:center; color:#475569;">-</td>
      <td style="text-align:center; color:#475569;">-</td>
      <td style="color:#1e3a8a;">مانده از قبل</td>
      <td style="text-align:left;">${prevDebit.toLocaleString()}</td>
      <td style="text-align:left;">${prevCredit.toLocaleString()}</td>
      <td style="text-align:center; color:#1e40af;">${runningInd}</td>
      <td style="text-align:left; color:#1e40af;">${Math.abs(runningBalance).toLocaleString()}</td>
    </tr>
  `;

  let totalDeb = prevDebit;
  let totalCred = prevCredit;

  ledgerLines.forEach((line, idx) => {
    runningBalance += line.debit - line.credit;
    runningInd = runningBalance > 0 ? 'بد' : (runningBalance < 0 ? 'بس' : 'بی');
    totalDeb += line.debit;
    totalCred += line.credit;

    html += `
      <tr>
        <td style="text-align:center; color:var(--text-muted);">${idx + 1}</td>
        <td style="text-align:center; font-family:monospace;">${line.date}</td>
        <td style="text-align:center; font-weight:bold; color:var(--accent-color); cursor:pointer;" onclick="openEditSanad(${line.sanadId})">${line.sanadId}</td>
        <td style="text-align:right;">${line.desc}</td>
        <td style="text-align:left; color:#047857;">${line.debit ? line.debit.toLocaleString() : '0'}</td>
        <td style="text-align:left; color:#b91c1c;">${line.credit ? line.credit.toLocaleString() : '0'}</td>
        <td style="text-align:center; font-weight:bold;">${runningInd}</td>
        <td style="text-align:left; font-weight:bold;">${Math.abs(runningBalance).toLocaleString()}</td>
      </tr>
    `;
  });

  const finalInd = runningBalance > 0 ? 'بد' : (runningBalance < 0 ? 'بس' : 'بی');
  html += `
    <tr style="background:rgba(255, 255, 200, 0.7); font-weight:bold; border-top:2px solid var(--border-color);">
      <td colspan="4" style="text-align:left; padding:8px;">جمع نهایی دفتر شناور:</td>
      <td style="text-align:left; color:#047857;">${totalDeb.toLocaleString()}</td>
      <td style="text-align:left; color:#b91c1c;">${totalCred.toLocaleString()}</td>
      <td style="text-align:center; color:#1e40af;">${finalInd}</td>
      <td style="text-align:left; color:#1e40af;">${Math.abs(runningBalance).toLocaleString()}</td>
    </tr>
  `;

  bodyEl.innerHTML = html;
}


// 5. Profit & Loss (صورت عملکرد و سود و زیان)
function calculateProfitLoss() {
  ensureSanadMockLines();
  const reportDiv = document.getElementById('divProfitLossReport');
  if (!reportDiv) return;

  let totalSales = 0;
  let totalExpenses = 0;

  AppState.sanads.forEach(s => {
    if (!s.lines) return;
    s.lines.forEach(line => {
      if (line.account) {
        if (line.account.startsWith('04')) {
          totalSales += Number(line.credit || 0) - Number(line.debit || 0);
        } else if (line.account.startsWith('05')) {
          totalExpenses += Number(line.debit || 0) - Number(line.credit || 0);
        }
      }
    });
  });

  const grossProfit = totalSales; // Simple mock calculation
  const netProfit = grossProfit - totalExpenses;

  reportDiv.innerHTML = `
    <div style="max-width:600px; margin:0 auto; border:1px solid rgba(16,185,129,0.3); padding:20px; border-radius:8px; background:rgba(16,185,129,0.02);">
      <h3 style="text-align:center; margin-bottom:4px; color:#166534;">صورت سود و زیان دوره مالی</h3>
      <div style="text-align:center; font-size:0.75rem; color:var(--text-muted); margin-bottom:20px;">سال مالی ۱۴۰۳ - شرکت نمونه نگار</div>
      
      <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed var(--border-color); font-weight:bold;">
        <span>📈 درآمدهای عملیاتی (فروش و خدمات):</span>
        <span style="color:#047857;">${totalSales.toLocaleString()} ریال</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-color); font-size:0.75rem; padding-right:15px; color:var(--text-muted);">
        <span>فروش کالا و محصولات (معین ۰۴۴۰)</span>
        <span>${totalSales.toLocaleString()} ریال</span>
      </div>
      
      <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:2px solid var(--border-color); font-weight:bold; background:rgba(0,0,0,0.02);">
        <span>💵 سود ناویژه (ناخالص):</span>
        <span style="color:#047857;">${grossProfit.toLocaleString()} ریال</span>
      </div>
      
      <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed var(--border-color); font-weight:bold; margin-top:15px;">
        <span>📉 هزینه‌های اداری و فروش:</span>
        <span style="color:#b91c1c;">${totalExpenses.toLocaleString()} ریال</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-color); font-size:0.75rem; padding-right:15px; color:var(--text-muted);">
        <span>هزینه‌های عمومی و اداری (معین ۰۵۵۰)</span>
        <span>${totalExpenses.toLocaleString()} ریال</span>
      </div>

      <div style="display:flex; justify-content:space-between; padding:12px 10px; border-radius:4px; font-weight:bold; background:rgba(16,185,129,0.1); margin-top:20px; font-size:0.95rem; border:1px solid rgba(16,185,129,0.3);">
        <span style="color:#166534;">🏆 سود (زیان) خالص دوره:</span>
        <span style="color:${netProfit >= 0 ? '#047857' : '#b91c1c'};">${netProfit.toLocaleString()} ریال</span>
      </div>
    </div>
  `;
}


// 6. Balance Sheet (ترازنامه مالی)
function calculateBalanceSheet() {
  ensureSanadMockLines();
  const reportDiv = document.getElementById('divBalanceSheetReport');
  if (!reportDiv) return;

  let totalAssets = 0;
  let totalLiabilities = 0;

  AppState.sanads.forEach(s => {
    if (!s.lines) return;
    s.lines.forEach(line => {
      if (line.account) {
        if (line.account.startsWith('01')) {
          totalAssets += Number(line.debit || 0) - Number(line.credit || 0);
        } else if (line.account.startsWith('02')) {
          totalLiabilities += Number(line.credit || 0) - Number(line.debit || 0);
        }
      }
    });
  });

  const equity = totalAssets - totalLiabilities;

  reportDiv.innerHTML = `
    <div style="max-width:900px; margin:0 auto; border:1px solid rgba(30,58,138,0.2); padding:20px; border-radius:8px; background:rgba(30,58,138,0.01);">
      <h3 style="text-align:center; margin-bottom:4px; color:#1e3a8a;">ترازنامه مالی دوره جاری</h3>
      <div style="text-align:center; font-size:0.75rem; color:var(--text-muted); margin-bottom:25px;">منتهی به ۲۹ اسفند ۱۴۰۳ - شرکت نمونه نگار</div>
      
      <div style="display:flex; gap:25px;">
        <!-- Right Column: Assets -->
        <div style="flex:1; border-left:1px solid var(--border-color); padding-left:15px;">
          <h4 style="border-bottom:2px solid #1e3a8a; padding-bottom:6px; color:#1e3a8a;">دارایی‌ها (Assets)</h4>
          
          <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed var(--border-color); font-weight:bold;">
            <span>دارایی‌های جاری:</span>
            <span>${totalAssets.toLocaleString()} ریال</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:6px 0; font-size:0.75rem; padding-right:15px; color:var(--text-muted);">
            <span>موجودی نقد و بانک (صندوق/بانکها)</span>
            <span>${totalAssets.toLocaleString()} ریال</span>
          </div>
          
          <div style="display:flex; justify-content:space-between; padding:10px 0; border-top:2px solid #1e3a8a; font-weight:bold; margin-top:40px; background:rgba(30,58,138,0.03);">
            <span>جمع کل دارایی‌ها:</span>
            <span style="color:#1e3a8a;">${totalAssets.toLocaleString()} ریال</span>
          </div>
        </div>

        <!-- Left Column: Liabilities & Equity -->
        <div style="flex:1; padding-right:15px;">
          <h4 style="border-bottom:2px solid #b91c1c; padding-bottom:6px; color:#b91c1c;">بدهی‌ها و سرمایه (Liabilities & Equity)</h4>
          
          <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed var(--border-color); font-weight:bold;">
            <span>بدهی‌های جاری:</span>
            <span>${totalLiabilities.toLocaleString()} ریال</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:6px 0; font-size:0.75rem; padding-right:15px; color:var(--text-muted);">
            <span>حساب‌های پرداختنی (تامین‌کنندگان)</span>
            <span>${totalLiabilities.toLocaleString()} ریال</span>
          </div>
          
          <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed var(--border-color); font-weight:bold; margin-top:15px;">
            <span>حقوق صاحبان سهام و سرمایه:</span>
            <span>${equity.toLocaleString()} ریال</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:6px 0; font-size:0.75rem; padding-right:15px; color:var(--text-muted);">
            <span>سود (زیان) انباشته دوره جاری</span>
            <span>${equity.toLocaleString()} ریال</span>
          </div>

          <div style="display:flex; justify-content:space-between; padding:10px 0; border-top:2px solid #b91c1c; font-weight:bold; margin-top:10px; background:rgba(185,28,28,0.03);">
            <span>جمع کل بدهی‌ها و سرمایه:</span>
            <span style="color:#b91c1c;">${(totalLiabilities + equity).toLocaleString()} ریال</span>
          </div>
        </div>
      </div>
      
      <!-- Balance Check Indicator -->
      <div style="text-align:center; margin-top:25px; font-weight:bold; color:\${totalAssets === (totalLiabilities + equity) ? '#047857' : '#b91c1c'}; font-size:0.85rem; padding:6px; border-radius:4px; background:rgba(0,0,0,0.02);">
        \${totalAssets === (totalLiabilities + equity) ? '✅ ترازنامه تراز می‌باشد (دارایی‌ها = بدهی‌ها + سرمایه)' : '❌ ترازنامه ناهمخوان می‌باشد!'}
      </div>
    </div>
  `;
}


// ==========================================
// TREASURY: CHECKS & BANK ACCOUNTS
// ==========================================

function renderChecksTable() {
  const tbody = document.getElementById('checksTableBody');
  if (!tbody) return;

  tbody.innerHTML = AppState.checks.map(c => {
    const badgeType = c.type === 'دریافتی' ? 'badge-success' : 'badge-danger';
    let statusClass = 'badge-warning';
    if (c.status === 'وصول شده') statusClass = 'badge-success';
    if (c.status === 'برگشت خورده') statusClass = 'badge-danger';

    let actionBtn = '';
    if (c.status === 'در جریان') {
      actionBtn = `
        <button class="btn btn-outline" style="padding:2px 6px; font-size:0.75rem;" onclick="processCheckAction(${c.id}, 'وصول شده')">وصول</button>
        <button class="btn btn-outline" style="padding:2px 6px; font-size:0.75rem; color:#b91c1c; border-color:#b91c1c;" onclick="processCheckAction(${c.id}, 'برگشت خورده')">برگشت</button>
      `;
    } else {
      actionBtn = `<span style="color:var(--text-muted); font-size:0.75rem;">خاتمه یافته</span>`;
    }

    return `
      <tr>
        <td style="text-align:center; font-family:monospace; font-weight:bold;">${c.number}</td>
        <td>${c.bank}</td>
        <td style="text-align:left; font-weight:bold;">${c.amount.toLocaleString()}</td>
        <td style="text-align:center; font-family:monospace;">${c.dueDate}</td>
        <td style="text-align:center;"><span class="badge ${badgeType}">${c.type}</span></td>
        <td style="text-align:center;"><span class="badge ${statusClass}">${c.status}</span></td>
        <td style="text-align:center;">${actionBtn}</td>
      </tr>
    `;
  }).join('');
}

function openAddCheckRow(type) {
  const form = document.getElementById('addCheckRow');
  const title = document.getElementById('lblAddCheckTitle');
  const typeInput = document.getElementById('newCheckType');
  if (form && title && typeInput) {
    form.style.display = 'block';
    typeInput.value = type;
    title.textContent = `ثبت چک ${type} جدید`;
    document.getElementById('newCheckNo').value = '';
    document.getElementById('newCheckAmount').value = '';
  }
}

function saveNewCheck() {
  const type = document.getElementById('newCheckType').value;
  const number = document.getElementById('newCheckNo').value.trim();
  const bank = document.getElementById('newCheckBank').value.trim();
  const amount = Number(document.getElementById('newCheckAmount').value);
  const dueDate = document.getElementById('newCheckDueDate').value.trim();

  if (!number || !amount) {
    alert('لطفاً شماره چک و مبلغ را وارد نمایید.');
    return;
  }

  const nextId = AppState.checks.length > 0 ? Math.max(...AppState.checks.map(c => c.id)) + 1 : 1;
  AppState.checks.push({
    id: nextId,
    number,
    bank,
    amount,
    dueDate,
    type,
    status: 'در جریان'
  });

  alert('چک با موفقیت در سیستم ثبت گردید.');
  document.getElementById('addCheckRow').style.display = 'none';
  renderChecksTable();
}

function processCheckAction(checkId, newStatus) {
  const c = AppState.checks.find(x => x.id === checkId);
  if (!c) return;

  c.status = newStatus;
  alert(`وضعیت چک شماره ${c.number} به "${newStatus}" تغییر یافت.`);
  renderChecksTable();
  if (typeof renderBankAccountsTable === 'function') {
    renderBankAccountsTable();
  }
}

function renderBankAccountsTable() {
  const tbody = document.getElementById('bankAccountsTableBody');
  if (!tbody) return;

  let bankNationalBalance = 3400000000;
  let centralBoxBalance = 45000000;

  AppState.checks.forEach(c => {
    if (c.status === 'وصول شده') {
      if (c.type === 'دریافتی') {
        bankNationalBalance += c.amount;
      } else {
        bankNationalBalance -= c.amount;
      }
    }
  });

  tbody.innerHTML = `
    <tr>
      <td style="font-weight:bold;">صندوق مرکزی</td>
      <td style="text-align:center;">صندوق نقدی</td>
      <td style="text-align:center;">-</td>
      <td>دفتر مرکزی نمونه</td>
      <td style="text-align:left; font-weight:bold; color:#047857;">${centralBoxBalance.toLocaleString()}</td>
    </tr>
    <tr>
      <td style="font-weight:bold;">بانک ملی مرکزی</td>
      <td style="text-align:center;">حساب بانکی جاری</td>
      <td style="text-align:center; font-family:monospace;">0105000000001</td>
      <td>بانک ملی - شعبه مرکزی تهران</td>
      <td style="text-align:left; font-weight:bold; color:#047857;">${bankNationalBalance.toLocaleString()}</td>
    </tr>
  `;
}


// ==========================================
// PAYROLL: PERSONNEL & PAYSLIPS
// ==========================================

function renderPersonnelTable() {
  const tbody = document.getElementById('personnelTableBody');
  if (!tbody) return;

  tbody.innerHTML = AppState.personnel.map(p => `
    <tr>
      <td style="text-align:center; font-weight:bold; color:var(--accent-color);">EMP-00${p.id}</td>
      <td style="font-weight:bold;">${p.fullName}</td>
      <td style="text-align:center; font-family:monospace;">${p.nationalId}</td>
      <td>${p.role}</td>
      <td style="text-align:left;">${p.baseSalary.toLocaleString()}</td>
      <td style="text-align:left;">${p.housingAllowance.toLocaleString()}</td>
      <td style="text-align:left;">${p.groceryAllowance.toLocaleString()}</td>
    </tr>
  `).join('');
}

function openAddPersonnelRow() {
  const form = document.getElementById('addPersonnelRow');
  if (form) {
    form.style.display = 'block';
    document.getElementById('newPersName').value = '';
    document.getElementById('newPersNationalId').value = '';
    document.getElementById('newPersRole').value = '';
    document.getElementById('newPersBase').value = '';
  }
}

function saveNewPersonnel() {
  const fullName = document.getElementById('newPersName').value.trim();
  const nationalId = document.getElementById('newPersNationalId').value.trim();
  const role = document.getElementById('newPersRole').value.trim();
  const baseSalary = Number(document.getElementById('newPersBase').value);
  const housingAllowance = Number(document.getElementById('newPersHousing').value || 15000000);
  const groceryAllowance = Number(document.getElementById('newPersGrocery').value || 10000000);

  if (!fullName || !nationalId || !baseSalary) {
    alert('لطفاً مشخصات پرسنل و حقوق پایه را وارد نمایید.');
    return;
  }

  const nextId = AppState.personnel.length > 0 ? Math.max(...AppState.personnel.map(p => p.id)) + 1 : 1;
  AppState.personnel.push({
    id: nextId,
    fullName,
    nationalId,
    role,
    baseSalary,
    housingAllowance,
    groceryAllowance
  });

  alert('حکم حقوقی و پرونده پرسنلی جدید با موفقیت صادر گردید.');
  document.getElementById('addPersonnelRow').style.display = 'none';
  renderPersonnelTable();
}

function initPayslipForm() {
  const select = document.getElementById('payslipPersonnelSelect');
  if (!select) return;

  select.innerHTML = AppState.personnel.map(p => `
    <option value="${p.id}">${p.fullName} (EMP-00${p.id})</option>
  `).join('');
}

function generatePersonnelPayslip() {
  const id = Number(document.getElementById('payslipPersonnelSelect').value);
  const monthVal = document.getElementById('payslipMonthSelect').value;
  const p = AppState.personnel.find(x => x.id === id);
  if (!p) return;

  const totalGross = p.baseSalary + p.housingAllowance + p.groceryAllowance;
  const insurance = Math.round(p.baseSalary * 0.07); 
  const taxableAmount = totalGross - 120000000;
  const tax = taxableAmount > 0 ? Math.round(taxableAmount * 0.1) : 0;

  const totalDeductions = insurance + tax;
  const netPay = totalGross - totalDeductions;
  const monthName = monthVal === '05' ? 'مرداد' : 'تیر';

  const card = document.getElementById('payslipResultCard');
  card.style.display = 'block';
  card.innerHTML = `
    <div style="border:2px solid #166534; padding:20px; border-radius:8px; max-width:650px; margin:0 auto; background:rgba(22,101,52,0.02); direction:rtl;">
      <h3 style="text-align:center; color:#166534; margin-bottom:12px;">فیش حقوقی ماهانه پرسنل</h3>
      <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #166534; padding-bottom:8px; font-size:0.85rem;">
        <span>نام کارمند: <strong>${p.fullName}</strong></span>
        <span>سمت: <strong>${p.role}</strong></span>
        <span>دوره مالی: <strong>${monthName} ۱۴۰۳</strong></span>
      </div>

      <div style="display:flex; gap:20px;">
        <div style="flex:1; border-left:1px solid rgba(22,101,52,0.2); padding-left:15px;">
          <h4 style="color:#166534; border-bottom:1px solid #166534; padding-bottom:4px; margin-bottom:8px;">➕ حقوق و مزایا</h4>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; padding:4px 0;">
            <span>حقوق پایه:</span>
            <span>${p.baseSalary.toLocaleString()} ریال</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; padding:4px 0;">
            <span>حق مسکن:</span>
            <span>${p.housingAllowance.toLocaleString()} ریال</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; padding:4px 0;">
            <span>بن خواروبار:</span>
            <span>${p.groceryAllowance.toLocaleString()} ریال</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:0.85rem; padding:8px 0; border-top:1px dashed #166534; margin-top:8px;">
            <span>جمع ناخالص:</span>
            <span>${totalGross.toLocaleString()} ریال</span>
          </div>
        </div>

        <div style="flex:1; padding-right:15px;">
          <h4 style="color:#b91c1c; border-bottom:1px solid #b91c1c; padding-bottom:4px; margin-bottom:8px;">➖ کسورات قانونی</h4>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; padding:4px 0;">
            <span>بیمه سهم کارمند (۷٪):</span>
            <span>${insurance.toLocaleString()} ریال</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; padding:4px 0;">
            <span>مالیات حقوق:</span>
            <span>${tax.toLocaleString()} ریال</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:0.85rem; padding:8px 0; border-top:1px dashed #b91c1c; margin-top:20px;">
            <span>جمع کسورات:</span>
            <span>${totalDeductions.toLocaleString()} ریال</span>
          </div>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; padding:12px 10px; border-radius:4px; font-weight:bold; background:#166534; color:#fff; margin-top:20px; font-size:0.95rem; text-align:center;">
        <span>🏆 خالص پرداختی کارمند:</span>
        <span>${netPay.toLocaleString()} ریال</span>
      </div>
      <div style="text-align:center; margin-top:15px;"><button class="btn btn-outline" style="background:var(--bg-primary); border-color:#166534; color:#166534; font-weight:bold;" onclick="window.print()">🖨️ چاپ فیش حقوقی</button></div>
    </div>
  `;
}


// ==========================================
// WAREHOUSE & INVENTORY: INVOICES & CARDEX
// ==========================================

function renderPurchaseInvoicesTable() {
  const tbody = document.getElementById('purchaseInvoicesBody');
  if (!tbody) return;

  tbody.innerHTML = AppState.purchaseInvoices.map(inv => {
    const totalVal = inv.total || 0;
    return `
      <tr>
        <td style="text-align:center; font-family:monospace; font-weight:bold;">${inv.id}</td>
        <td style="text-align:center; font-family:monospace;">${inv.date}</td>
        <td style="font-weight:bold;">${inv.party}</td>
        <td style="text-align:center;">${inv.warehouse}</td>
        <td style="text-align:left; font-weight:bold; color:#047857;">${totalVal.toLocaleString()}</td>
        <td style="text-align:center;"><span class="badge badge-success">${inv.status}</span></td>
      </tr>
    `;
  }).join('');
}

function openAddPurchaseInvoiceRow() {
  const form = document.getElementById('addPurchaseInvoiceRow');
  const select = document.getElementById('newPurchProduct');
  if (form && select) {
    form.style.display = 'block';
    select.innerHTML = AppState.products.map(p => `
      <option value="${p.code}">${p.code} - ${p.name}</option>
    `).join('');
    
    const nextNo = AppState.purchaseInvoices.length > 0 ? 'PINV-' + (4002 + AppState.purchaseInvoices.length) : 'PINV-4001';
    document.getElementById('newPurchNo').value = nextNo;
    document.getElementById('newPurchPrice').value = AppState.products[0]?.price || 0;
  }
}

function saveNewPurchaseInvoice() {
  const id = document.getElementById('newPurchNo').value.trim();
  const date = document.getElementById('newPurchDate').value.trim();
  const party = document.getElementById('newPurchVendor').value.trim();
  const prodCode = document.getElementById('newPurchProduct').value;
  const qty = Number(document.getElementById('newPurchQty').value);
  const price = Number(document.getElementById('newPurchPrice').value);

  if (!id || !party || !qty || !price) {
    alert('لطفاً اطلاعات فاکتور خرید را کامل کنید.');
    return;
  }

  const total = qty * price;
  AppState.purchaseInvoices.push({
    id,
    date,
    party,
    total,
    warehouse: 'انبار مرکزی',
    status: 'ثبت نهایی',
    lines: [{ prodCode, qty, price }]
  });

  const prod = AppState.products.find(p => p.code === prodCode);
  if (prod) prod.stock += qty;

  alert(`فاکتور خرید ${id} با موفقیت ثبت و به موجودی انبار اضافه شد.`);
  document.getElementById('addPurchaseInvoiceRow').style.display = 'none';
  renderPurchaseInvoicesTable();
}

function renderSalesInvoicesTable() {
  const tbody = document.getElementById('salesInvoicesBody');
  if (!tbody) return;

  tbody.innerHTML = AppState.salesInvoices.map(inv => {
    const totalVal = inv.total || 0;
    return `
      <tr>
        <td style="text-align:center; font-family:monospace; font-weight:bold;">${inv.id}</td>
        <td style="text-align:center; font-family:monospace;">${inv.date}</td>
        <td style="font-weight:bold;">${inv.party}</td>
        <td style="text-align:center;">${inv.warehouse}</td>
        <td style="text-align:left; font-weight:bold; color:#b91c1c;">${totalVal.toLocaleString()}</td>
        <td style="text-align:center;"><span class="badge badge-success">${inv.status}</span></td>
      </tr>
    `;
  }).join('');
}

function openAddSalesInvoiceRow() {
  const form = document.getElementById('addSalesInvoiceRow');
  const select = document.getElementById('newSalesProduct');
  if (form && select) {
    form.style.display = 'block';
    select.innerHTML = AppState.products.map(p => `
      <option value="${p.code}">${p.code} - ${p.name}</option>
    `).join('');
    
    const nextNo = AppState.salesInvoices.length > 0 ? 'INV-' + (8002 + AppState.salesInvoices.length) : 'INV-8001';
    document.getElementById('newSalesNo').value = nextNo;
    document.getElementById('newSalesPrice').value = AppState.products[0]?.price || 0;
  }
}

function saveNewSalesInvoice() {
  const id = document.getElementById('newSalesNo').value.trim();
  const date = document.getElementById('newSalesDate').value.trim();
  const party = document.getElementById('newSalesCustomer').value.trim();
  const prodCode = document.getElementById('newSalesProduct').value;
  const qty = Number(document.getElementById('newSalesQty').value);
  const price = Number(document.getElementById('newSalesPrice').value);

  if (!id || !party || !qty || !price) {
    alert('لطفاً اطلاعات فاکتور فروش را کامل کنید.');
    return;
  }

  const prod = AppState.products.find(p => p.code === prodCode);
  if (prod && prod.stock < qty) {
    alert(`خطا: موجودی کالا برای فروش کافی نیست (موجودی فعلی: ${prod.stock} ${prod.unit})`);
    return;
  }

  const total = qty * price;
  AppState.salesInvoices.push({
    id,
    date,
    party,
    total,
    warehouse: 'انبار مرکزی',
    status: 'ثبت نهایی',
    lines: [{ prodCode, qty, price }]
  });

  if (prod) prod.stock -= qty;

  alert(`فاکتور فروش ${id} ثبت نهایی شده و از انبار صادر گردید.`);
  document.getElementById('addSalesInvoiceRow').style.display = 'none';
  renderSalesInvoicesTable();
}

function initCardexForm() {
  const select = document.getElementById('cardexProductSelect');
  if (!select) return;

  select.innerHTML = AppState.products.map(p => `
    <option value="${p.code}">${p.code} - ${p.name}</option>
  `).join('');
}

function showCardex() {
  const prodCode = document.getElementById('cardexProductSelect').value;
  const tbody = document.getElementById('cardexTableBody');
  const resultDiv = document.getElementById('cardexResult');
  if (!tbody || !resultDiv) return;

  const prod = AppState.products.find(p => p.code === prodCode);
  if (!prod) return;

  resultDiv.style.display = 'block';

  let runningStock = 20; 
  let html = `
    <tr style="background:rgba(220, 235, 255, 0.5); font-weight:bold;">
      <td style="text-align:center;">-</td>
      <td>موجودی اولیه قبل از دوره جاری</td>
      <td style="text-align:center;">${runningStock}</td>
      <td style="text-align:center;">0</td>
      <td style="text-align:center;">${runningStock}</td>
      <td style="text-align:left;">${prod.price.toLocaleString()}</td>
      <td style="text-align:left;">${(runningStock * prod.price).toLocaleString()}</td>
    </tr>
  `;

  let transactions = [];
  AppState.purchaseInvoices.forEach(inv => {
    if (inv.lines) {
      inv.lines.forEach(line => {
        if (line.prodCode === prodCode) {
          transactions.push({
            date: inv.date,
            type: 'فاکتور خرید ' + inv.id,
            inQty: line.qty,
            outQty: 0,
            price: line.price
          });
        }
      });
    } else {
      // Handle legacy
      if (prodCode === 'PRD-101') {
        transactions.push({
          date: inv.date,
          type: 'فاکتور خرید ' + inv.id,
          inQty: 4,
          outQty: 0,
          price: prod.price
        });
      }
    }
  });

  AppState.salesInvoices.forEach(inv => {
    if (inv.lines) {
      inv.lines.forEach(line => {
        if (line.prodCode === prodCode) {
          transactions.push({
            date: inv.date,
            type: 'فاکتور فروش ' + inv.id,
            inQty: 0,
            outQty: line.qty,
            price: line.price
          });
        }
      });
    } else {
      // Handle legacy
      if (prodCode === 'PRD-101') {
        transactions.push({
          date: inv.date,
          type: 'فاکتور فروش ' + inv.id,
          inQty: 0,
          outQty: 1,
          price: prod.price
        });
      }
    }
  });

  transactions.sort((a, b) => a.date.localeCompare(b.date));

  transactions.forEach(tx => {
    runningStock += tx.inQty - tx.outQty;
    const totalVal = runningStock * tx.price;
    html += `
      <tr>
        <td style="text-align:center; font-family:monospace;">${tx.date}</td>
        <td style="font-weight:bold;">${tx.type}</td>
        <td style="text-align:center; color:#047857; font-weight:bold;">${tx.inQty || '-'}</td>
        <td style="text-align:center; color:#b91c1c; font-weight:bold;">${tx.outQty || '-'}</td>
        <td style="text-align:center; font-weight:bold;">${runningStock}</td>
        <td style="text-align:left;">${tx.price.toLocaleString()}</td>
        <td style="text-align:left;">${totalVal.toLocaleString()}</td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}



// ==========================================
//   Voucher Attachments Module (ضمائم سند)
// ==========================================
function generateMockSalesInvoiceDataUrl() {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  
  // Fill white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw header border
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  
  // Header title
  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'bold 20px Tahoma';
  ctx.textAlign = 'center';
  ctx.fillText('فاکتور فروش کالا و خدمات - سیستم نگار تحت وب', canvas.width / 2, 50);
  
  ctx.font = '12px Tahoma';
  ctx.fillStyle = '#333333';
  ctx.fillText('شرکت نمونه نگار (سهامی خاص)', canvas.width / 2, 75);
  
  // Invoice details
  ctx.textAlign = 'right';
  ctx.fillText('شماره فاکتور: INV-8001', canvas.width - 40, 110);
  ctx.fillText('تاریخ فاکتور: 1403/05/10', canvas.width - 40, 130);
  ctx.fillText('خریدار: فروشگاه مرکزی', canvas.width - 40, 150);
  
  // Table Header
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(30, 180, canvas.width - 60, 30);
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 180, canvas.width - 60, 30);
  
  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'bold 11px Tahoma';
  ctx.fillText('ردیف', 70, 200);
  ctx.fillText('شرح کالا / خدمات', 220, 200);
  ctx.fillText('تعداد', 370, 200);
  ctx.fillText('مبلغ کل (ریال)', 520, 200);
  
  // Table rows
  ctx.fillStyle = '#000000';
  ctx.font = '11px Tahoma';
  
  // Row 1
  ctx.fillText('۱', 70, 240);
  ctx.fillText('لپ‌تاپ گیمینگ ایسوس ۱۵ اینچ', 220, 240);
  ctx.fillText('۲ دستگاه', 370, 240);
  ctx.fillText('۹۰۰,۰۰۰,۰۰۰', 520, 240);
  ctx.strokeRect(30, 220, canvas.width - 60, 30);
  
  // Row 2
  ctx.fillText('۲', 70, 270);
  ctx.fillText('مانیتور ۲۷ اینچ 4K سامسونگ', 220, 270);
  ctx.fillText('۱ عدد', 370, 270);
  ctx.fillText('۱۸۰,۰۰۰,۰۰۰', 520, 270);
  ctx.strokeRect(30, 250, canvas.width - 60, 30);
  
  // Total
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(30, 310, canvas.width - 60, 30);
  ctx.strokeRect(30, 310, canvas.width - 60, 30);
  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'bold 12px Tahoma';
  ctx.fillText('جمع کل فاکتور:', 300, 330);
  ctx.fillText('۱,۰۸۰,۰۰۰,۰۰۰ ریال', 520, 330);
  
  // Signatures
  ctx.fillStyle = '#777777';
  ctx.font = 'italic 11px Tahoma';
  ctx.fillText('مهر و امضای فروشنده', 150, 450);
  ctx.fillText('مهر و امضای خریدار', 450, 450);
  
  // Draw stamp
  ctx.strokeStyle = 'rgba(30, 58, 138, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(120, 480, 40, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.font = 'bold 9px Tahoma';
  ctx.fillStyle = 'rgba(30, 58, 138, 0.4)';
  ctx.fillText('سیستم نگار', 140, 480);
  
  return canvas.toDataURL('image/png');
}

function initVoucherAttachments() {
  if (!AppState.sanadAttachments) {
    AppState.sanadAttachments = {};
  }
  
  // Voucher 102 (sales invoice voucher, automatic) auto populated with sales invoice representation
  if (!AppState.sanadAttachments[102]) {
    const mockInvoice = generateMockSalesInvoiceDataUrl();
    AppState.sanadAttachments[102] = [
      {
        rowNo: 1, // first line
        images: [mockInvoice]
      }
    ];
  }
}

function openSanadAttachments() {
  const numInput = document.getElementById('sanadNumberInput');
  const voucherId = numInput ? Number(numInput.value) : null;
  
  if (!voucherId || isNaN(voucherId)) {
    alert('شماره سند نامعتبر است.');
    return;
  }
  
  selectedSanadId = voucherId;
  
  initVoucherAttachments();
  
  // Clone existing attachments to tempAttachments for this editing session if not already initialized
  if (!AppState.tempAttachments) {
    const existing = AppState.sanadAttachments[selectedSanadId] || [];
    AppState.tempAttachments = JSON.parse(JSON.stringify(existing));
  }
  
  // Open Form
  showForm('form-sanad-attachments');
  
  // Update header label
  document.getElementById('attachSanadIdLabel').textContent = selectedSanadId;
  
  renderAttachmentsGrid();
}

function renderAttachmentsGrid() {
  const tbody = document.getElementById('attachGridTableBody');
  if (!tbody) return;
  
  const attachments = AppState.tempAttachments || [];
  
  // Render general voucher attachments row
  const generalItem = attachments.find(x => x.rowNo === 0);
  const generalCount = generalItem ? generalItem.images.length : 0;
  const generalHasNote = !!(generalItem && generalItem.note && generalItem.note.trim() !== '');
  
  let rowsHtml = `
    <tr style="border-bottom:1px solid var(--border-color);">
      <td><b>کل سند</b></td>
      <td>-</td>
      <td style="text-align:right;"><b>عمومی / فاقد سرفصل خاص</b></td>
      <td style="text-align:right;">ضمائم متفرقه و عمومی مربوط به کل سند</td>
      <td>
        <button class="btn btn-outline" style="padding:3px 10px; font-size:0.8rem; font-weight:bold; color:${generalHasNote ? '#38bdf8' : 'var(--text-muted)'}; border-color:${generalHasNote ? '#38bdf8' : 'rgba(255,255,255,0.2)'}; white-space:nowrap; display:inline-flex; align-items:center; justify-content:center; gap:4px;" onclick="openRowNoteModal(0)">📝 ${generalHasNote ? 'یادداشت (دارد)' : 'یادداشت'}</button>
      </td>
      <td>
        <button class="btn btn-outline" style="padding:3px 10px; font-size:0.8rem; font-weight:bold; color:var(--accent-color); border-color:var(--accent-color); white-space:nowrap; display:inline-flex; align-items:center; justify-content:center; gap:4px;" onclick="triggerRowFileUpload(0)">📂 انتخاب</button>
      </td>
      <td><span class="badge ${generalCount > 0 ? 'badge-primary' : 'badge-secondary'}">${generalCount} تصویر</span></td>
      <td>
        <button class="btn btn-outline" style="padding:3px 8px; white-space:nowrap; display:inline-flex; align-items:center; justify-content:center; gap:4px;" onclick="openRowAttachmentsViewer(0)">👁️ نمایش ضمائم</button>
      </td>
    </tr>
  `;
  
  // Render voucher line attachments rows
  AppState.sanadLines.forEach((line, i) => {
    const rowNo = i + 1;
    const acc = AppState.accounts.find(a => a.code === line.account);
    const accName = acc ? acc.name : 'سرفصل نامشخص';
    const rowItem = attachments.find(x => x.rowNo === rowNo);
    const count = rowItem ? rowItem.images.length : 0;
    const rowHasNote = !!(rowItem && rowItem.note && rowItem.note.trim() !== '');
    
    rowsHtml += `
      <tr style="border-bottom:1px solid var(--border-color);">
        <td><b>ردیف ${rowNo}</b></td>
        <td><b>${line.account}</b></td>
        <td style="text-align:right;"><b>${accName}</b></td>
        <td style="text-align:right;">${line.desc || '-'}</td>
        <td>
          <button class="btn btn-outline" style="padding:3px 10px; font-size:0.8rem; font-weight:bold; color:${rowHasNote ? '#38bdf8' : 'var(--text-muted)'}; border-color:${rowHasNote ? '#38bdf8' : 'rgba(255,255,255,0.2)'}; white-space:nowrap; display:inline-flex; align-items:center; justify-content:center; gap:4px;" onclick="openRowNoteModal(${rowNo})">📝 ${rowHasNote ? 'یادداشت (دارد)' : 'یادداشت'}</button>
        </td>
        <td>
          <button class="btn btn-outline" style="padding:3px 10px; font-size:0.8rem; font-weight:bold; color:var(--accent-color); border-color:var(--accent-color); white-space:nowrap; display:inline-flex; align-items:center; justify-content:center; gap:4px;" onclick="triggerRowFileUpload(${rowNo})">📂 انتخاب</button>
        </td>
        <td><span class="badge ${count > 0 ? 'badge-primary' : 'badge-secondary'}">${count} تصویر</span></td>
        <td>
          <button class="btn btn-outline" style="padding:3px 8px; white-space:nowrap; display:inline-flex; align-items:center; justify-content:center; gap:4px;" onclick="openRowAttachmentsViewer(${rowNo})">👁️ نمایش ضمائم</button>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = rowsHtml;
}

let activeRowNoForNote = 0;

function openRowNoteModal(rowNo) {
  activeRowNoForNote = rowNo;
  const attachments = AppState.tempAttachments || [];
  const rowItem = attachments.find(x => x.rowNo === rowNo);
  const existingNote = rowItem ? (rowItem.note || '') : '';

  const targetLabel = rowNo === 0 ? 'کل سند' : `ردیف ${rowNo}`;
  const titleEl = document.getElementById('rowNoteModalTitle');
  if (titleEl) {
    titleEl.textContent = `📝 ثبت/ویرایش یادداشت ضمیمه (${targetLabel})`;
  }

  const input = document.getElementById('rowNoteTextInput');
  if (input) {
    input.value = existingNote;
  }

  const modal = document.getElementById('attachmentNoteModalOverlay');
  if (modal) {
    modal.style.display = 'flex';
    setTimeout(() => { if (input) input.focus(); }, 150);
  }
}

function closeRowNoteModal() {
  const modal = document.getElementById('attachmentNoteModalOverlay');
  if (modal) {
    modal.style.display = 'none';
  }
}

function saveRowNote() {
  const noteText = document.getElementById('rowNoteTextInput')?.value?.trim() || '';

  if (!AppState.tempAttachments) {
    AppState.tempAttachments = [];
  }

  let rowItem = AppState.tempAttachments.find(x => x.rowNo === activeRowNoForNote);
  if (!rowItem) {
    rowItem = { rowNo: activeRowNoForNote, images: [], note: '' };
    AppState.tempAttachments.push(rowItem);
  }

  rowItem.note = noteText;
  closeRowNoteModal();
  renderAttachmentsGrid();
}

let activeRowNoForUpload = 0;

function triggerRowFileUpload(rowNo) {
  activeRowNoForUpload = rowNo;
  const fileIn = document.getElementById('rowFileInput');
  if (fileIn) {
    fileIn.value = '';
    fileIn.click();
  }
}

function handleRowAttachmentUpload(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  
  const targetRowNo = activeRowNoForUpload;
  
  if (!AppState.tempAttachments) {
    AppState.tempAttachments = [];
  }
  
  let rowItem = AppState.tempAttachments.find(x => x.rowNo === targetRowNo);
  if (!rowItem) {
    rowItem = { rowNo: targetRowNo, images: [] };
    AppState.tempAttachments.push(rowItem);
  }
  
  let processedCount = 0;
  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();
    reader.onload = function(e) {
      rowItem.images.push(e.target.result);
      processedCount++;
      if (processedCount === files.length) {
        renderAttachmentsGrid();
        const targetLabel = targetRowNo === 0 ? 'کل سند' : `ردیف ${targetRowNo}`;
        alert(`${files.length} تصویر با موفقیت برای (${targetLabel}) افزوده شد.`);
      }
    };
    reader.readAsDataURL(files[i]);
  }
  
  event.target.value = '';
}

function simulateScannerInputForRow(targetRowNo) {
  if (!AppState.tempAttachments) {
    AppState.tempAttachments = [];
  }
  
  let rowItem = AppState.tempAttachments.find(x => x.rowNo === targetRowNo);
  if (!rowItem) {
    rowItem = { rowNo: targetRowNo, images: [] };
    AppState.tempAttachments.push(rowItem);
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  
  // Paper/scanner background
  ctx.fillStyle = '#fbfbf9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Scanner border
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1;
  ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
  
  // Red stamp
  ctx.strokeStyle = 'rgba(220, 38, 38, 0.5)';
  ctx.lineWidth = 3;
  ctx.strokeRect(400, 50, 150, 60);
  ctx.fillStyle = 'rgba(220, 38, 38, 0.5)';
  ctx.font = 'bold 12px Tahoma';
  ctx.textAlign = 'center';
  ctx.fillText('اسکن شده - بایگانی سند', 475, 75);
  ctx.fillText('سیستم نگار تحت وب', 475, 95);
  
  // Document Text
  ctx.textAlign = 'right';
  ctx.fillStyle = '#222222';
  ctx.font = 'bold 16px Tahoma';
  ctx.fillText('رسید دریافت / پرداخت پیوست سند', canvas.width - 50, 160);
  
  ctx.font = '11px Tahoma';
  ctx.fillText(`تاریخ اسکن: ${new Date().toLocaleDateString('fa-IR')}`, canvas.width - 50, 200);
  ctx.fillText(`ضمیمه مربوط به: ${targetRowNo === 0 ? 'کل سند' : 'ردیف ' + targetRowNo}`, canvas.width - 50, 220);
  ctx.fillText(`شماره سند مالی: #${selectedSanadId}`, canvas.width - 50, 240);
  
  // Main Border
  ctx.strokeStyle = '#cccccc';
  ctx.strokeRect(50, 280, 500, 450);
  
  ctx.fillText('توضیحات مدرک اسکن شده:', 520, 310);
  ctx.font = '10px Tahoma';
  ctx.fillStyle = '#555555';
  ctx.fillText('این مدرک به عنوان تاییدیه رسمی پرداخت/دریافت آرتیکل مربوطه توسط', 520, 340);
  ctx.fillText('اسکنر سخت‌افزاری متصل به پایانه حسابداری اسکن شده و تصویر سند پیوست است.', 520, 360);
  
  // Signatures
  ctx.beginPath();
  ctx.moveTo(100, 650);
  ctx.lineTo(250, 650);
  ctx.moveTo(350, 650);
  ctx.lineTo(500, 650);
  ctx.stroke();
  
  ctx.fillText('امضای مسئول بایگانی', 175, 675);
  ctx.fillText('امضای مدیر مالی', 425, 675);
  
  const dataUrl = canvas.toDataURL('image/png');
  rowItem.images.push(dataUrl);

  renderAttachmentsGrid();
  const labelText = targetRowNo === 0 ? 'کل سند' : `ردیف ${targetRowNo}`;
  alert(`تصویر اسکن شده با موفقیت به عنوان ضمیمه (${labelText}) افزوده شد.`);
}

let viewerActiveRowNo = 0;
let viewerActiveIndex = 0;

function openRowAttachmentsViewer(rowNo) {
  const attachments = AppState.tempAttachments || [];
  const rowItem = attachments.find(x => x.rowNo === rowNo);
  
  if (!rowItem || rowItem.images.length === 0) {
    alert('هیچ تصویری برای این ردیف ضمیمه نشده است.');
    return;
  }
  
  viewerActiveRowNo = rowNo;
  viewerActiveIndex = 0;
  
  showActiveAttachmentInViewer();
  
  document.getElementById('attachmentsViewerModal').style.display = 'flex';
}

function closeAttachmentsViewer() {
  document.getElementById('attachmentsViewerModal').style.display = 'none';
}

function showActiveAttachmentInViewer() {
  const attachments = AppState.tempAttachments || [];
  const rowItem = attachments.find(x => x.rowNo === viewerActiveRowNo);
  if (!rowItem || rowItem.images.length === 0) {
    closeAttachmentsViewer();
    renderAttachmentsGrid();
    return;
  }
  
  if (viewerActiveIndex < 0) viewerActiveIndex = 0;
  if (viewerActiveIndex >= rowItem.images.length) viewerActiveIndex = rowItem.images.length - 1;
  
  const imageSrc = rowItem.images[viewerActiveIndex];
  document.getElementById('attachViewerImage').src = imageSrc;
  document.getElementById('attachViewerTitle').textContent = `نمایش ضمائم ${viewerActiveRowNo === 0 ? 'کل سند' : 'ردیف ' + viewerActiveRowNo}`;
  document.getElementById('attachViewerIndexLabel').textContent = `تصویر ${viewerActiveIndex + 1} از ${rowItem.images.length}`;
}

function showNextAttachment() {
  const attachments = AppState.tempAttachments || [];
  const rowItem = attachments.find(x => x.rowNo === viewerActiveRowNo);
  if (!rowItem) return;
  
  if (viewerActiveIndex < rowItem.images.length - 1) {
    viewerActiveIndex++;
  } else {
    viewerActiveIndex = 0;
  }
  showActiveAttachmentInViewer();
}

function showPrevAttachment() {
  const attachments = AppState.tempAttachments || [];
  const rowItem = attachments.find(x => x.rowNo === viewerActiveRowNo);
  if (!rowItem) return;
  
  if (viewerActiveIndex > 0) {
    viewerActiveIndex--;
  } else {
    viewerActiveIndex = rowItem.images.length - 1;
  }
  showActiveAttachmentInViewer();
}

function printActiveAttachment() {
  const imageSrc = document.getElementById('attachViewerImage').src;
  if (!imageSrc) return;
  
  const printWin = window.open('', '_blank');
  printWin.document.write(`
    <html>
    <head>
      <title>چاپ ضمیمه سند</title>
      <style>
        body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
        img { max-width: 100%; max-height: 100%; object-fit: contain; }
        @media print {
          img { max-width: 100vw; max-height: 100vh; }
        }
      </style>
    </head>
    <body onload="window.print(); window.close();">
      <img src="${imageSrc}" />
    </body>
    </html>
  `);
  printWin.document.close();
}

function deleteActiveAttachment() {
  if (confirm('آیا از حذف این ضمیمه اطمینان دارید؟')) {
    const attachments = AppState.tempAttachments || [];
    const rowItem = attachments.find(x => x.rowNo === viewerActiveRowNo);
    if (!rowItem) return;
    
    rowItem.images.splice(viewerActiveIndex, 1);
    
    if (rowItem.images.length === 0) {
      AppState.tempAttachments = attachments.filter(x => x.rowNo !== viewerActiveRowNo);
    }
    
    showActiveAttachmentInViewer();
    renderAttachmentsGrid();
  }
}


// Unsaved changes window listener
window.addEventListener('beforeunload', function(e) {
  if (AppState.currentForm === 'form-sanad2' || AppState.currentForm === 'form-sanad-attachments') {
    const changes = getSanadUnsavedChanges();
    if (changes && changes.length > 0) {
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  }
});


// ==========================================
//   Initial Accounts coding levels Settings module
// ==========================================
function toggleDetailSettingsDisplay() {
  const levelsCount = Number(document.getElementById('settingDetailLevels')?.value || 3);
  
  const t1Group = document.getElementById('groupTafsili1');
  const t2Group = document.getElementById('groupTafsili2');
  const t3Group = document.getElementById('groupTafsili3');
  
  if (t1Group) t1Group.style.display = (levelsCount >= 1) ? 'block' : 'none';
  if (t2Group) t2Group.style.display = (levelsCount >= 2) ? 'block' : 'none';
  if (t3Group) t3Group.style.display = (levelsCount >= 3) ? 'block' : 'none';
}

function loadCodingSettings() {
  AppState.codingSettings = AppState.codingSettings || {
    detailLevelsCount: 3,
    groupCodeLength: 2,
    klCodeLength: 4,
    moeinCodeLength: 6,
    tafsili1Length: 6,
    tafsili2Length: 6,
    tafsili3Length: 6
  };
  
  const s = AppState.codingSettings;
  const selectLevels = document.getElementById('settingDetailLevels');
  const inputGroup = document.getElementById('settingGroupLen');
  const inputKl = document.getElementById('settingKlLen');
  const inputMoein = document.getElementById('settingMoeinLen');
  const inputT1 = document.getElementById('settingTafsili1Len');
  const inputT2 = document.getElementById('settingTafsili2Len');
  const inputT3 = document.getElementById('settingTafsili3Len');
  
  if (selectLevels) selectLevels.value = s.detailLevelsCount;
  if (inputGroup) inputGroup.value = s.groupCodeLength;
  if (inputKl) inputKl.value = s.klCodeLength;
  if (inputMoein) inputMoein.value = s.moeinCodeLength;
  if (inputT1) inputT1.value = s.tafsili1Length;
  if (inputT2) inputT2.value = s.tafsili2Length;
  if (inputT3) inputT3.value = s.tafsili3Length;
  
  toggleDetailSettingsDisplay();
}

function saveCodingSettings() {
  const selectLevels = Number(document.getElementById('settingDetailLevels')?.value || 3);
  const groupLen = Number(document.getElementById('settingGroupLen')?.value || 2);
  const klLen = Number(document.getElementById('settingKlLen')?.value || 4);
  const moeinLen = Number(document.getElementById('settingMoeinLen')?.value || 6);
  const t1Len = Number(document.getElementById('settingTafsili1Len')?.value || 6);
  const t2Len = Number(document.getElementById('settingTafsili2Len')?.value || 6);
  const t3Len = Number(document.getElementById('settingTafsili3Len')?.value || 6);
  
  if (groupLen < 1 || groupLen > 3) { alert('طول کد گروه باید بین ۱ تا ۳ رقم باشد.'); return; }
  if (klLen < 1 || klLen > 6) { alert('طول کد کل باید بین ۱ تا ۶ رقم باشد.'); return; }
  if (moeinLen < 1 || moeinLen > 6) { alert('طول کد معین باید بین ۱ تا ۶ رقم باشد.'); return; }
  if (selectLevels >= 1 && (t1Len < 1 || t1Len > 6)) { alert('طول کد تفصیلی ۱ باید بین ۱ تا ۶ رقم باشد.'); return; }
  if (selectLevels >= 2 && (t2Len < 1 || t2Len > 6)) { alert('طول کد تفصیلی ۲ باید بین ۱ تا ۶ رقم باشد.'); return; }
  if (selectLevels >= 3 && (t3Len < 1 || t3Len > 6)) { alert('طول کد تفصیلی ۳ باید بین ۱ تا ۶ رقم باشد.'); return; }
  
  AppState.codingSettings = {
    detailLevelsCount: selectLevels,
    groupCodeLength: groupLen,
    klCodeLength: klLen,
    moeinCodeLength: moeinLen,
    tafsili1Length: t1Len,
    tafsili2Length: t2Len,
    tafsili3Length: t3Len
  };
  
  alert('تنظیمات کدینگ حسابداری با موفقیت ذخیره شد.');
}
