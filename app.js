(() => {
  'use strict';

  /* =========================================================
     Config
     ========================================================= */
  const CONFIG = {
    PLP_URL: 'https://www.zoya.in/',
    PRIVACY_URL: 'https://www.zoya.in/privacy-policy.html?lang=en_IN',
    TNC_URL: 'https://www.zoya.in/terms-and-conditions.html?lang=en_IN',
    DEMO_OTP: '123456',
    OTP_LENGTH: 6,
    RESEND_AFTER_S: 30,   // Live site waits ~180s; shortened for the demo.
    OTP_VALID_S: 300,
    MAX_ATTEMPTS: 5,
    MAX_RESENDS: 3,
    LOCK_S: 60,           // Production value is a backend decision (e.g. 15 min).
    LATENCY_MS: 650,
  };

  // min/max = national mobile number length without the trunk "0".
  const C = (iso, dial, name, min, max, pattern, placeholder, group) => ({ iso, dial, name, min, len: max, pattern, placeholder, group });
  const COUNTRIES = [
    C('IN', '91', 'India', 10, 10, /^[6-9]\d{9}$/, '98765 43210', [5, 5]),
    C('AE', '971', 'UAE', 9, 9, /^5\d{8}$/, '50 123 4567', [2, 3, 4]),
    C('DE', '49', 'Germany', 10, 11, /^1[5-7]\d{8,9}$/, '1512 3456789', [4, 7]),
    C('SA', '966', 'Saudi Arabia', 9, 9, /^5\d{8}$/, '51 234 5678', [2, 3, 4]),
    C('NL', '31', 'Netherlands', 9, 9, /^6\d{8}$/, '6 12345678', [1, 8]),
    C('MY', '60', 'Malaysia', 9, 10, /^1\d{8,9}$/, '12 345 6789', [2, 3, 4]),
    C('KE', '254', 'Kenya', 9, 9, /^[17]\d{8}$/, '712 345678', [3, 6]),
    C('RO', '40', 'Romania', 9, 9, /^7\d{8}$/, '712 034 567', [3, 3, 3]),
    C('ES', '34', 'Spain', 9, 9, /^[67]\d{8}$/, '612 34 56 78', [3, 2, 2, 2]),
    C('PT', '351', 'Portugal', 9, 9, /^9\d{8}$/, '912 345 678', [3, 3, 3]),
    C('QA', '974', 'Qatar', 8, 8, /^[3567]\d{7}$/, '3312 3456', [4, 4]),
    C('IT', '39', 'Italy', 9, 10, /^3\d{8,9}$/, '312 345 6789', [3, 3, 4]),
    C('OM', '968', 'Oman', 8, 8, /^[79]\d{7}$/, '9212 3456', [4, 4]),
    C('KW', '965', 'Kuwait', 8, 8, /^[569]\d{7}$/, '500 12345', [3, 5]),
    C('BH', '973', 'Bahrain', 8, 8, /^[36]\d{7}$/, '3600 1234', [4, 4]),
    C('ZA', '27', 'South Africa', 9, 9, /^[6-8]\d{8}$/, '71 123 4567', [2, 3, 4]),
    C('CA', '1', 'Canada', 10, 10, /^[2-9]\d{2}[2-9]\d{6}$/, '506 234 5678', [3, 3, 4]),
    C('NZ', '64', 'New Zealand', 8, 10, /^2\d{7,9}$/, '21 123 4567', [2, 3, 4]),
    C('AU', '61', 'Australia', 9, 9, /^4\d{8}$/, '412 345 678', [3, 3, 3]),
    C('SG', '65', 'Singapore', 8, 8, /^[89]\d{7}$/, '8123 4567', [4, 4]),
    C('US', '1', 'USA', 10, 10, /^[2-9]\d{2}[2-9]\d{6}$/, '201 555 0123', [3, 3, 4]),
    C('GB', '44', 'United Kingdom', 10, 10, /^7\d{9}$/, '7400 123456', [4, 6]),
  ];
  const flagSrc = (iso, w = 40) => `https://flagcdn.com/w${w}/${iso.toLowerCase()}.png`;

  const CHANNELS = [
    { key: 'email', label: 'Email' },
    { key: 'whatsapp', label: 'WhatsApp' },
    { key: 'call', label: 'Call' },
    { key: 'sms', label: 'Text Messages' },
  ];

  const COPY = {
    marketing: 'I would like to receive marketing communications from Titan and its businesses about its products, services, offers, and special occasion promotions.',
    channelsQ: 'Please select how you would like to hear from us:',
    personalisation: 'I consent to the use of my personal data to provide personalized recommendations, offers, and experiences based on my preferences and interactions.',
  };

  const ICON = {
    alert: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.01"/></svg>',
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>',
    tick: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    bell: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6 8-6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>',
  };

  /* =========================================================
     Mock backend (localStorage). Replace with SFCC controllers.
     ========================================================= */
  const DB_KEY = 'zoya-login-demo-db';
  const SESSION_KEY = 'zoya-login-demo-session';

  const consentOf = (marketing, ch, personalisation) => ({
    marketing,
    channels: { email: !!ch.email, whatsapp: !!ch.whatsapp, call: !!ch.call, sms: !!ch.sms },
    personalisation,
    updatedAt: '2025-01-10T10:00:00.000Z',
    source: 'seed',
  });

  const seed = () => ({
    users: {
      '91-9876543210': { title: 'Ms.', first: 'Riya', last: 'Sharma', email: 'riya.sharma@gmail.com', consent: consentOf(true, { email: 1, whatsapp: 1, call: 1, sms: 1 }, true) },
      '91-9876543211': { title: 'Mr.', first: 'Arjun', last: 'Mehta', email: 'arjun.mehta@gmail.com', consent: consentOf(true, { email: 1, whatsapp: 1 }, false) },
      '91-9876543212': { title: 'Mrs.', first: 'Neha', last: 'Kapoor', email: 'neha.kapoor@gmail.com', consent: consentOf(false, {}, false) },
      '91-9812343469': { title: 'Mr.', first: 'Piyush', last: 'Biswal', email: 'piyushbiswal@titan.co.in', consent: consentOf(true, { email: 1 }, true) },
    },
  });

  const db = {
    read() {
      try { return JSON.parse(localStorage.getItem(DB_KEY)) || seed(); } catch { return seed(); }
    },
    write(data) { localStorage.setItem(DB_KEY, JSON.stringify(data)); },
    reset() { [DB_KEY, SESSION_KEY, 'zoya-login-demo-device'].forEach((k) => localStorage.removeItem(k)); },
  };

  const demo = { netFail: false };
  class NetworkError extends Error {}

  const net = () => new Promise((resolve, reject) => {
    setTimeout(() => {
      if (demo.netFail || navigator.onLine === false) reject(new NetworkError('network'));
      else resolve();
    }, CONFIG.LATENCY_MS);
  });

  const api = {
    async sendOtp() { await net(); return { ok: true }; },
    async verifyOtp(code) { await net(); return { ok: code === CONFIG.DEMO_OTP }; },
    async findUser(key) { await net(); return db.read().users[key] || null; },
    async findEmailOwner(email) {
      await net();
      const users = db.read().users;
      return Object.keys(users).find((k) => users[k].email === email) || null;
    },
    async createUser(key, profile, consent, { swapFrom } = {}) {
      await net();
      const data = db.read();
      if (swapFrom && data.users[swapFrom]) data.users[swapFrom].email = null;
      data.users[key] = { ...profile, consent };
      db.write(data);
      return data.users[key];
    },
    async saveConsent(key, consent) {
      await net();
      const data = db.read();
      data.users[key].consent = consent;
      db.write(data);
      return consent;
    },
  };

  // "Remember me": the last account used on this device.
  const DEVICE_KEY = 'zoya-login-demo-device';
  const device = {
    get() { return localStorage.getItem(DEVICE_KEY); },
    set(key) { localStorage.setItem(DEVICE_KEY, key); },
    clear() { localStorage.removeItem(DEVICE_KEY); },
  };

  const session = {
    get() { return localStorage.getItem(SESSION_KEY); },
    set(key) { localStorage.setItem(SESSION_KEY, key); },
    clear() { localStorage.removeItem(SESSION_KEY); },
  };

  /* =========================================================
     Helpers
     ========================================================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const keyOf = (country, number) => `${country.dial}-${number}`;
  const groupDigits = (digits, group) => {
    const out = []; let i = 0;
    for (const g of group) { if (i >= digits.length) break; out.push(digits.slice(i, i + g)); i += g; }
    if (i < digits.length) out.push(digits.slice(i));
    return out.join(' ');
  };
  const prettyPhone = (country, number) => `+${country.dial} ${groupDigits(number, country.group)}`;
  const maskPhone = (key) => {
    const [, num] = key.split('-');
    return `${'*'.repeat(Math.max(0, num.length - 4))}${num.slice(-4)}`;
  };
  const maskEmail = (email) => {
    const [user, domain] = email.split('@');
    const keep = Math.min(user.length, Math.max(2, Math.ceil(user.length * 0.6)));
    return `${'*'.repeat(user.length - keep)}${user.slice(-keep)}@${domain}`;
  };

  const blankConsent = () => ({ marketing: false, channels: { email: false, whatsapp: false, call: false, sms: false }, personalisation: false });
  const cloneConsent = (c) => ({ marketing: !!c?.marketing, channels: { ...blankConsent().channels, ...(c?.channels || {}) }, personalisation: !!c?.personalisation });
  const anyChannel = (c) => Object.values(c.channels).some(Boolean);
  const normaliseConsent = (c, source) => {
    const n = cloneConsent(c);
    n.marketing = n.marketing && anyChannel(n);
    if (!n.marketing) Object.keys(n.channels).forEach((k) => { n.channels[k] = false; });
    return { ...n, updatedAt: new Date().toISOString(), source };
  };
  const consentLevel = (c) => {
    if (!c) return 'none';
    const n = cloneConsent(c);
    const mk = n.marketing && anyChannel(n);
    const allCh = Object.values(n.channels).every(Boolean);
    if (mk && allCh && n.personalisation) return 'all';
    if (!mk && !n.personalisation) return 'none';
    return 'partial';
  };
  const consentSummary = (c) => {
    const n = cloneConsent(c);
    const chosen = CHANNELS.filter((ch) => n.channels[ch.key]).map((ch) => ch.label);
    const mk = n.marketing && chosen.length
      ? (chosen.length === 4 ? 'Offers on all channels' : `Offers by ${listJoin(chosen)}`)
      : 'No marketing messages';
    const p = n.personalisation ? 'personalised picks on' : 'personalised picks off';
    return `${mk} · ${p}`;
  };
  const listJoin = (a) => (a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);

  const EMAIL_RE = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/;
  const DOMAIN_TYPOS = {
    'gmial.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.con': 'gmail.com',
    'gmail.cm': 'gmail.com', 'gnail.com': 'gmail.com', 'gmaill.com': 'gmail.com', 'yahooo.com': 'yahoo.com', 'yaho.com': 'yahoo.com',
    'yahoo.co': 'yahoo.com', 'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'outlok.com': 'outlook.com',
    'outlook.co': 'outlook.com', 'rediffmail.co': 'rediffmail.com', 'rediffmial.com': 'rediffmail.com', 'icloud.co': 'icloud.com',
  };
  const NAME_MAX = 40;
  const SALUTATIONS = ['Mr.', 'Ms.', 'Mrs.'];
  const EMAIL_MAX = 254;

  const announce = (msg) => {
    const live = $('#live');
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = msg; });
  };

  /* =========================================================
     State
     ========================================================= */
  const rememberedUser = () => {
    const k = device.get();
    const u = k && db.read().users[k];
    return u ? { key: k, user: u } : null;
  };
  const fresh = () => ({
    step: 'phone',
    country: COUNTRIES[0], // India is always the default.
    number: '',
    remember: true,
    consentTouched: false,
    consentMode: 'open',
    key: null,
    details: { title: '', first: '', last: '', email: '' },
    consent: blankConsent(),
    swap: { ownerKey: null, choice: 'mobile' },
    otp: null,
    result: null,
    phoneError: '',
  });
  let S = fresh();
  const freshFromDevice = () => {
    const st = fresh();
    const r = rememberedUser();
    if (r) {
      const [dial, num] = r.key.split('-');
      st.country = COUNTRIES.find((c) => c.dial === dial) || COUNTRIES[0];
      st.number = num;
    }
    return st;
  };
  const keepEntry = () => { const { country, number, consent, consentTouched, consentMode, remember } = S; return { ...fresh(), country, number, consent, consentTouched, consentMode, remember }; };
  // OTP limits are tracked per destination so going back cannot reset them.
  const otpLedger = new Map();
  let timerId = null;
  let lastFocus = null;

  /* =========================================================
     Dialog shell
     ========================================================= */
  const el = {
    dlg: $('#dlg'), scrim: $('#scrim'), body: $('#dlgBody'), stage: $('#stage'), trail: $('#trail'),
    foot: $('#foot'), back: $('#backBtn'), close: $('#closeBtn'), store: $('#storefront'),
  };

  function openDialog(step = 'phone') {
    lastFocus = document.activeElement;
    if (step === 'phone') S = freshFromDevice();
    S.step = step;
    el.scrim.hidden = false;
    el.dlg.hidden = false;
    el.store.inert = true;
    document.body.classList.add('is-locked', 'dlg-open');
    render();
  }

  function closeDialog() {
    clearInterval(timerId);
    el.scrim.hidden = true;
    el.dlg.hidden = true;
    el.store.inert = false;
    document.body.classList.remove('is-locked', 'dlg-open');
    renderHeader();
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  el.close.addEventListener('click', closeDialog);
  el.scrim.addEventListener('click', closeDialog);
  el.back.addEventListener('click', goBack);
  document.addEventListener('keydown', (e) => {
    if (el.dlg.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeDialog(); }
    if (e.key === 'Tab') trapFocus(e);
  });
  function trapFocus(e) {
    const f = $$('button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select, [tabindex]:not([tabindex="-1"])', el.dlg)
      .filter((n) => n.offsetParent !== null && !n.closest('[hidden]') && getComputedStyle(n).visibility !== 'hidden');
    if (!f.length) return;
    const first = f[0]; const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  const BACK_MAP = { otp: 'phone', details: 'phone', swap: 'details', 'otp-email': 'swap', 'otp-alt': 'swap' };
  function goBack() {
    const to = BACK_MAP[S.step];
    if (!to) return;
    if (to === 'phone') S = keepEntry();
    go(to);
  }

  function go(step, opts = {}) {
    clearInterval(timerId);
    S.step = step;
    render(opts);
  }

  /* =========================================================
     Rendering
     ========================================================= */
  const STEPS = {};

  function render({ focus } = {}) {
    const view = STEPS[S.step]();
    el.dlg.dataset.step = S.step;
    el.back.hidden = !BACK_MAP[S.step];
    el.stage.innerHTML = view.body;
    el.foot.innerHTML = view.foot || '';
    renderTrail();
    view.bind?.();
    el.body.scrollTop = 0;
    updateFootShadow();
    const target = focus ? $(focus, el.dlg) : (view.focus ? $(view.focus, el.dlg) : $('.prompt', el.stage));
    if (target) {
      if (target.classList.contains('prompt')) target.setAttribute('tabindex', '-1');
      requestAnimationFrame(() => target.focus({ preventScroll: false }));
    }
  }

  function updateFootShadow() {
    const b = el.body;
    el.foot.classList.toggle('is-raised', b.scrollHeight - b.scrollTop - b.clientHeight > 4);
  }
  el.body.addEventListener('scroll', updateFootShadow, { passive: true });
  window.addEventListener('resize', () => { if (!el.dlg.hidden) updateFootShadow(); });
  // Re-check once web fonts or content change the body's height, so the divider never goes stale
  if ('ResizeObserver' in window) { const ro = new ResizeObserver(() => { if (!el.dlg.hidden) updateFootShadow(); }); ro.observe(el.stage); ro.observe(el.body); }
  if (document.fonts) document.fonts.ready.then(() => { if (!el.dlg.hidden) updateFootShadow(); });

  function renderTrail() {
    const items = [];
    if (['swap', 'otp-email', 'otp-alt'].includes(S.step)) {
      items.push({ label: 'Mobile', value: prettyPhone(S.country, S.number), verified: true, edit: 'phone' });
    }
    if (['swap', 'otp-email', 'otp-alt'].includes(S.step)) {
      const name = [S.details.title, S.details.first, S.details.last].filter(Boolean).join(' ');
      items.push({ label: name, value: S.details.email, edit: 'details' });
    }
    el.trail.innerHTML = items.map((it, i) => `
      <li class="chip">
        ${it.verified ? ICON.tick.replace('<svg', '<svg class="chip__tick"') : ''}
        <span class="chip__label">${esc(it.label)}</span>
        <span class="chip__value">${esc(it.value)}</span>
        <button type="button" class="chip__edit" data-edit="${it.edit}" aria-label="Change ${esc(it.label.toLowerCase() === 'mobile' ? 'mobile number' : 'name and email')}">${ICON.edit}</button>
      </li>`).join('');
    $$('[data-edit]', el.trail).forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.edit === 'phone') { S = keepEntry(); go('phone', { focus: '#phoneInput' }); }
      else go('details', { focus: '#title0' });
    }));
  }

  const legal = () => `
    <p class="legal">By continuing, I acknowledge the <a href="${CONFIG.PRIVACY_URL}" target="_blank" rel="noopener">Privacy Notice</a> and agree to the <a href="${CONFIG.TNC_URL}" target="_blank" rel="noopener">Terms &amp; Conditions</a></p>`;

  const errorMsg = (id, text) => `<p class="msg msg--error" id="${id}" role="alert">${text ? ICON.alert + esc(text) : ''}</p>`;
  const alertBox = (text, kind = 'error') => `<div class="alert ${kind === 'info' ? 'alert--info' : ''}" role="${kind === 'info' ? 'status' : 'alert'}">${kind === 'info' ? ICON.info : ICON.alert}<span>${text}</span></div>`;
  const NET_ERR = 'We couldn’t reach our servers. Check your connection and try again.';

  function setBusy(btn, busy, label) {
    if (!btn) return;
    if (busy) {
      btn.dataset.label = btn.innerHTML;
      btn.setAttribute('aria-busy', 'true');
      btn.innerHTML = `<span class="spinner" aria-hidden="true"></span>${esc(label)}`;
    } else {
      btn.removeAttribute('aria-busy');
      if (btn.dataset.label) btn.innerHTML = btn.dataset.label;
    }
  }

  function setFieldError(input, errEl, text) {
    input.setAttribute('aria-invalid', text ? 'true' : 'false');
    errEl.innerHTML = text ? ICON.alert + esc(text) : '';
  }

  /* ---------- Step: phone ---------- */
  STEPS.phone = () => ({
    body: `
      <h2 class="prompt" id="stepTitle">Sign In or Sign Up</h2>
      <div id="formAlert"></div>
      <form id="stepForm" novalidate>
        <div class="phone-card">
        <div class="field">
          <label class="field__label" for="phoneInput">Mobile number</label>
          <div class="phone">
            <div class="cc" id="ccBox">
              <span class="cc__face" aria-hidden="true">
                <img class="cc__flag" id="ccFlag" src="${flagSrc(S.country.iso)}" srcset="${flagSrc(S.country.iso, 80)} 2x" alt="" width="22" height="16" onerror="this.style.visibility='hidden'">
                <span class="cc__iso" id="ccIso">${S.country.iso}</span>
                <span class="cc__dial" id="ccDial">+${S.country.dial}</span>
                ${ICON.chevron}
              </span>
              <select id="countrySel" autocomplete="tel-country-code" aria-label="Country code">
                ${COUNTRIES.map((c) => `<option value="${c.iso}" ${c.iso === S.country.iso ? 'selected' : ''}>${esc(c.name)} (+${c.dial})</option>`).join('')}
              </select>
            </div>
            <input class="input" id="phoneInput" type="tel" inputmode="numeric" autocomplete="tel-national"
              placeholder="${S.country.placeholder}" value="${esc(groupDigits(S.number, S.country.group))}"
              aria-describedby="phoneErr phoneHint" aria-invalid="false" required>
          </div>
          ${errorMsg('phoneErr', S.phoneError)}
          <p class="msg msg--hint" id="phoneHint" aria-live="polite"></p>
        </div>
        </div>
        <label class="check check--remember"><input type="checkbox" id="rememberMe" ${S.remember !== false ? 'checked' : ''}><span>Remember me</span></label>
        <div id="phConsentWrap">${phoneConsent()}</div>
      </form>`,
    foot: `<button class="btn btn--primary" type="submit" form="stepForm" id="primaryBtn">Get OTP</button>${legal()}`,
    focus: '#phoneInput',
    bind() {
      bindPhoneConsent();
      $('#rememberMe').addEventListener('change', (e) => { S.remember = e.target.checked; });
      const input = $('#phoneInput'); const sel = $('#countrySel'); const err = $('#phoneErr'); const hint = $('#phoneHint');
      let hintTimer;
      const flashHint = (t) => { hint.textContent = t; clearTimeout(hintTimer); hintTimer = setTimeout(() => { hint.textContent = ''; }, 2200); };

      const clean = (raw) => {
        let d = raw.replace(/\D/g, '');
        const c = S.country;
        if (d.length > c.len) {
          if (d.startsWith(c.dial) && d.length - c.dial.length <= c.len) d = d.slice(c.dial.length);
          else if (d.startsWith('00' + c.dial)) d = d.slice(2 + c.dial.length);
          if (d.length > c.len && d.startsWith('0')) d = d.replace(/^0+/, '');
        }
        d = d.replace(/^0+/, ''); // trunk prefix: no supported mobile range starts with 0
        return d.slice(0, c.len);
      };
      const refreshConsent = () => {
        const mode = consentModeFor();
        if (mode !== S.consentMode) { $('#phConsentWrap').innerHTML = phoneConsent(); bindPhoneConsent(); }
      };

      input.addEventListener('beforeinput', (e) => {
        if (e.inputType === 'insertText' && e.data && e.data.length === 1 && /[^\d\s]/.test(e.data)) {
          e.preventDefault(); flashHint('Numbers only, please.');
        }
      });
      input.addEventListener('input', () => {
        const hadJunk = /[^\d\s+()-]/.test(input.value);
        S.number = clean(input.value);
        input.value = groupDigits(S.number, S.country.group);
        if (hadJunk) flashHint('Letters and symbols were removed.');
        if (S.phoneError) { S.phoneError = ''; setFieldError(input, err, ''); }
        if (S.number.length === S.country.len && !S.country.pattern.test(S.number)) {
          setFieldError(input, err, invalidPhoneText());
        }
        refreshConsent();
      });
      input.addEventListener('blur', () => {
        if (S.number && S.number.length < S.country.min) setFieldError(input, err, lengthText());
      });
      sel.addEventListener('change', () => {
        S.country = COUNTRIES.find((c) => c.iso === sel.value);
        S.number = S.number.slice(0, S.country.len);
        input.placeholder = S.country.placeholder;
        const flag = $('#ccFlag'); flag.style.visibility = '';
        flag.src = flagSrc(S.country.iso); flag.srcset = `${flagSrc(S.country.iso, 80)} 2x`;
        $('#ccIso').textContent = S.country.iso; $('#ccDial').textContent = `+${S.country.dial}`;
        refreshConsent();
        input.value = groupDigits(S.number, S.country.group);
        setFieldError(input, err, '');
        input.focus();
      });

      $('#stepForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = $('#primaryBtn');
        $('#formAlert').innerHTML = '';
        if (!S.number) return setFieldError(input, err, 'Enter your mobile number.'), input.focus();
        if (S.number.length < S.country.min) return setFieldError(input, err, lengthText()), input.focus();
        if (!S.country.pattern.test(S.number)) return setFieldError(input, err, invalidPhoneText()), input.focus();
        const ce = consentError(S.consent);
        if (ce) { const ce2 = $('#ph-chErr'); ce2.className = 'msg msg--error'; ce2.innerHTML = ICON.alert + esc(ce); $('#ph-ch-email').focus(); return; }
        S.key = keyOf(S.country, S.number);
        await startOtp({ kind: 'phone', dest: S.key, label: prettyPhone(S.country, S.number) }, btn, 'otp');
      });
    },
  });

  function lengthText() {
    const c = S.country;
    return c.min === c.len ? `Enter all ${c.len} digits of your mobile number.` : `Enter ${c.min} to ${c.len} digits of your mobile number.`;
  }

  /* Consent on the first screen. The account is unknown until OTP, so the collapsed
     state is only used when this device remembers the number being entered. */
  function consentModeFor() {
    const r = rememberedUser();
    if (r && r.key === keyOf(S.country, S.number) && consentLevel(r.user.consent) !== 'none') return 'saved';
    return 'open';
  }
  function phoneConsent() {
    const mode = consentModeFor();
    if (mode !== S.consentMode) {
      S.consent = mode === 'saved' ? cloneConsent(rememberedUser().user.consent) : blankConsent();
      S.consentTouched = false;
    }
    S.consentMode = mode;
    if (mode === 'open') return consentFieldset('ph', S.consent);
    return `
      <section class="prefs prefs--inline" id="phPrefs" aria-labelledby="phPrefsTitle">
        <div class="prefs__head">
          <span class="prefs__icon">${ICON.bell}</span>
          <div class="prefs__text">
            <p class="prefs__title" id="phPrefsTitle">Communication preferences</p>
            <p class="prefs__sum" id="phPrefsSum">${esc(consentSummary(S.consent))}</p>
          </div>
          <button type="button" class="prefs__toggle" id="phPrefsToggle" aria-expanded="false" aria-controls="phPrefsPanel">Edit ${ICON.chevron}</button>
        </div>
        <div class="prefs__panel" id="phPrefsPanel" hidden>${consentFieldset('ph', S.consent)}</div>
      </section>`;
  }
  function bindPhoneConsent() {
    const wrap = $('#phConsentWrap');
    bindConsent(wrap, 'ph', S.consent, () => {
      S.consentTouched = true;
      const sum = $('#phPrefsSum'); if (sum) sum.textContent = consentSummary(S.consent);
    });
    const t = $('#phPrefsToggle');
    if (t) t.addEventListener('click', () => {
      const open = t.getAttribute('aria-expanded') !== 'true';
      t.setAttribute('aria-expanded', String(open));
      t.innerHTML = `${open ? 'Hide' : 'Edit'} ${ICON.chevron}`;
      $('#phPrefsPanel').hidden = !open;
      if (open) $('#ph-mkt').focus();
    });
  }

  function invalidPhoneText() {
    return S.country.iso === 'IN'
      ? 'Enter a valid Indian mobile number. It starts with 6, 7, 8 or 9.'
      : `Enter a valid ${S.country.name} mobile number.`;
  }

  /* ---------- OTP engine ---------- */
  function ledger(dest) {
    if (!otpLedger.has(dest)) otpLedger.set(dest, { attempts: 0, resends: 0, sentAt: 0, lockedUntil: 0 });
    return otpLedger.get(dest);
  }

  async function startOtp(ctx, btn, nextStep) {
    const L = ledger(ctx.dest);
    if (L.lockedUntil > Date.now() || (L.sentAt && L.resends >= CONFIG.MAX_RESENDS)) { S.otp = ctx; go(nextStep); return; }
    // Reuse a live code instead of sending another when the user comes back.
    if (L.sentAt && Date.now() - L.sentAt < CONFIG.RESEND_AFTER_S * 1000) { S.otp = ctx; go(nextStep); return; }
    setBusy(btn, true, 'Sending code…');
    try {
      await api.sendOtp(ctx.dest);
      if (L.sentAt) L.resends += 1;
      L.sentAt = Date.now(); L.attempts = 0; L.expired = false;
      S.otp = ctx;
      go(nextStep);
      announce(`Code sent to ${ctx.label}`);
    } catch (e) {
      setBusy(btn, false);
      showFormAlert(NET_ERR);
    }
  }

  function showFormAlert(text, kind) {
    const box = $('#formAlert', el.dlg);
    if (box) { box.innerHTML = alertBox(esc(text), kind); el.body.scrollTop = 0; }
  }

  function otpView({ eyebrow, title, sub }) {
    const L = ledger(S.otp.dest);
    const locked = L.lockedUntil > Date.now();
    return {
      body: `
        ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
        <h2 class="prompt" id="stepTitle">${title}</h2>
        <p class="sub">${sub}</p>
        <div id="formAlert">${locked ? alertBox(`Too many incorrect attempts. For your security, try again in <span data-lock>${fmtTime(Math.ceil((L.lockedUntil - Date.now()) / 1000))}</span>.`) : ''}</div>
        <form id="stepForm" novalidate>
          <label class="field__label" for="otpInput">One-time code</label>
          <div class="otp ${locked ? 'is-disabled' : ''}" id="otpBox">
            <input class="otp__input" id="otpInput" type="text" inputmode="numeric" autocomplete="one-time-code"
              pattern="\\d{6}" maxlength="${CONFIG.OTP_LENGTH}" aria-describedby="otpErr otpMeta" ${locked ? 'disabled' : ''} spellcheck="false">
            <div class="otp__slots" aria-hidden="true">${'<span class="otp__slot"></span>'.repeat(CONFIG.OTP_LENGTH)}</div>
          </div>
          ${errorMsg('otpErr', '')}
          <div class="otp-meta" id="otpMeta">
            <span id="resendArea"></span>
          </div>
        </form>`,
      foot: `<button class="btn btn--primary" type="submit" form="stepForm" id="primaryBtn" ${locked ? 'disabled' : ''}>Verify &amp; continue</button>`,
      focus: locked ? '.prompt' : '#otpInput',
      bind: bindOtp,
    };
  }

  function bindOtp() {
    const input = $('#otpInput'); const box = $('#otpBox'); const err = $('#otpErr');
    const slots = $$('.otp__slot', box); const L = ledger(S.otp.dest);

    const paint = () => {
      const v = input.value;
      slots.forEach((s, i) => { s.textContent = v[i] || ''; s.classList.toggle('is-active', i === Math.min(v.length, CONFIG.OTP_LENGTH - 1)); });
    };
    const clearErr = () => { box.classList.remove('is-invalid'); err.innerHTML = ''; input.removeAttribute('aria-invalid'); };
    input.addEventListener('focus', () => box.classList.add('is-focused'));
    input.addEventListener('blur', () => box.classList.remove('is-focused'));
    input.addEventListener('input', () => {
      const cleaned = input.value.replace(/\D/g, '').slice(0, CONFIG.OTP_LENGTH);
      input.value = cleaned;
      input.setSelectionRange(cleaned.length, cleaned.length);
      clearErr(); paint();
    });
    input.addEventListener('keydown', (e) => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) e.preventDefault(); });
    paint();

    const resendArea = $('#resendArea');
    const tick = () => {
      const now = Date.now();
      const lockEl = $('[data-lock]');
      if (L.lockedUntil > now) {
        if (lockEl) lockEl.textContent = fmtTime(Math.ceil((L.lockedUntil - now) / 1000));
        resendArea.innerHTML = '';
        return;
      }
      if (L.lockedUntil && L.lockedUntil <= now) { L.lockedUntil = 0; L.attempts = 0; L.sentAt = 0; render(); return; }
      if (L.resends >= CONFIG.MAX_RESENDS) {
        resendArea.innerHTML = `<span>You’ve used all ${CONFIG.MAX_RESENDS} resends. Please try again later.</span>`;
        return;
      }
      const left = CONFIG.RESEND_AFTER_S - Math.floor((now - L.sentAt) / 1000);
      if (left > 0 && !L.expired) {
        resendArea.innerHTML = `Didn’t get it? Resend in <span class="timer">${fmtTime(left)}</span>`;
      } else if (!$('#resendBtn')) {
        resendArea.innerHTML = `Didn’t get it? <button type="button" class="link-btn" id="resendBtn">Resend code</button>`;
        $('#resendBtn').addEventListener('click', resend);
      }
      if (!L.expired && now - L.sentAt > CONFIG.OTP_VALID_S * 1000) L.expired = true;
    };
    tick();
    timerId = setInterval(tick, 1000);

    async function resend() {
      const b = $('#resendBtn');
      b.disabled = true; b.textContent = 'Sending…';
      try {
        await api.sendOtp(S.otp.dest);
        L.resends += 1; L.sentAt = Date.now(); L.attempts = 0; L.expired = false;
        input.value = ''; paint(); clearErr();
        showFormAlert(`A new code is on its way to ${S.otp.label}.`, 'info');
        announce('New code sent');
        resendArea.innerHTML = ''; tick(); input.focus();
      } catch {
        b.disabled = false; b.textContent = 'Resend code';
        showFormAlert(NET_ERR);
      }
    }

    $('#stepForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = $('#primaryBtn');
      $('#formAlert').innerHTML = '';
      const code = input.value;
      const fail = (t) => { box.classList.add('is-invalid'); input.setAttribute('aria-invalid', 'true'); err.innerHTML = ICON.alert + esc(t); input.focus(); };
      if (code.length < CONFIG.OTP_LENGTH) return fail(`Enter all ${CONFIG.OTP_LENGTH} digits of the code.`);
      if (L.expired) return fail('This code has expired. Tap “Resend code” to get a new one.');
      setBusy(btn, true, 'Verifying…');
      try {
        const res = await api.verifyOtp(code);
        if (!res.ok) {
          setBusy(btn, false);
          L.attempts += 1;
          const left = CONFIG.MAX_ATTEMPTS - L.attempts;
          if (left <= 0) { L.lockedUntil = Date.now() + CONFIG.LOCK_S * 1000; render(); announce('Too many incorrect attempts.'); return; }
          input.value = ''; paint();
          return fail(`That code isn’t right. ${left} ${left === 1 ? 'attempt' : 'attempts'} left.`);
        }
        otpLedger.delete(S.otp.dest);
        await onOtpVerified(btn);
      } catch (ex) {
        setBusy(btn, false);
        showFormAlert(NET_ERR);
      }
    });
  }

  async function onOtpVerified(btn) {
    const kind = S.otp.kind;
    setBusy(btn, true, 'Signing you in…');
    if (kind === 'phone') {
      let user = await api.findUser(S.key);
      if (user) {
        if (S.consentTouched) user = { ...user, consent: await api.saveConsent(S.key, normaliseConsent(S.consent, 'login')) };
        return signedIn(S.key, user, 'returning');
      }
      return go('details', { focus: '#title0' });
    }
    if (kind === 'alt') {
      const user = await api.findUser(S.swap.ownerKey);
      return signedIn(S.swap.ownerKey, user, 'returning');
    }
    if (kind === 'email') {
      const user = await api.createUser(S.key, profile(), normaliseConsent(S.consent, 'signup'), { swapFrom: S.swap.ownerKey });
      return signedIn(S.key, user, 'swapped');
    }
  }

  const profile = () => ({ title: S.details.title, first: S.details.first.trim(), last: S.details.last.trim(), email: S.details.email });

  function signedIn(key, user, how) {
    session.set(key);
    if (S.remember) device.set(key); else if (device.get() === key) device.clear();
    S.result = { key, how, user };
    renderHeader();
    go('success');
  }

  STEPS.otp = () => otpView({
    title: 'Enter the code we sent you',
    sub: `Sent by SMS to <strong>${esc(S.otp.label)}</strong>.`,
  });
  STEPS['otp-alt'] = () => otpView({
    title: `Sign in with ${esc(maskPhone(S.swap.ownerKey))}`,
    sub: `We’ve sent a code to the mobile number linked to <strong>${esc(S.details.email)}</strong>, ending in <strong>${esc(S.swap.ownerKey.slice(-4))}</strong>.`,
  });
  STEPS['otp-email'] = () => otpView({
    eyebrow: `${ICON.mail} Verify email`,
    title: 'Check your inbox',
    sub: `Enter the code sent to <strong>${esc(maskEmail(S.details.email))}</strong>. Once verified, this email moves to your new account.`,
  });

  /* ---------- Step: details (new user) ---------- */
  STEPS.details = () => ({
    body: `
      <div class="welcome">
        <h2 class="welcome__title" id="stepTitle">Welcome! Create your account</h2>
        <p class="welcome__for">${ICON.tick.replace('<svg', '<svg class="welcome__tick"')} ${esc(prettyPhone(S.country, S.number))}
          <button type="button" class="link-btn" id="changeNum">Change</button></p>
      </div>
      <div id="formAlert"></div>
      <form id="stepForm" novalidate>
        <fieldset class="field salute" aria-describedby="titleErr">
          <legend class="field__label">Title</legend>
          <div class="salute__opts">
            ${SALUTATIONS.map((t, i) => `<label class="salute__opt"><input type="radio" name="title" value="${t}" id="title${i}" ${S.details.title === t ? 'checked' : ''}><span>${t}</span></label>`).join('')}
          </div>
          ${errorMsg('titleErr', '')}
        </fieldset>
        <div class="two-col">
          <div class="field">
            <label class="field__label" for="firstName">First name</label>
            <input class="input" id="firstName" name="first" autocomplete="given-name" autocapitalize="words" maxlength="${NAME_MAX}"
              value="${esc(S.details.first)}" aria-describedby="firstErr" required>
            ${errorMsg('firstErr', '')}
          </div>
          <div class="field">
            <label class="field__label" for="lastName">Last name</label>
            <input class="input" id="lastName" name="last" autocomplete="family-name" autocapitalize="words" maxlength="${NAME_MAX}"
              value="${esc(S.details.last)}" aria-describedby="lastErr" required>
            ${errorMsg('lastErr', '')}
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="email">Email</label>
          <input class="input" id="email" name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false"
            maxlength="${EMAIL_MAX}" placeholder="name@example.com" value="${esc(S.details.email)}" aria-describedby="emailErr emailSuggest" required>
          ${errorMsg('emailErr', '')}
          <p class="suggest" id="emailSuggest" aria-live="polite"></p>
        </div>
        ${consentFieldset('su', S.consent)}
      </form>`,
    foot: `<button class="btn btn--primary" type="submit" form="stepForm" id="primaryBtn">Create account</button>${legal()}`,
    focus: '#title0',
    bind() {
      const first = $('#firstName'); const last = $('#lastName'); const email = $('#email');
      bindName(first, $('#firstErr'), 'first');
      bindName(last, $('#lastErr'), 'last');
      $$('input[name="title"]').forEach((r) => r.addEventListener('change', () => {
        S.details.title = r.value;
        $('#titleErr').innerHTML = '';
        $('.salute').classList.remove('is-invalid');
      }));
      bindEmail(email, $('#emailErr'), $('#emailSuggest'));
      bindConsent($('#stepForm'), 'su', S.consent);
      $('#changeNum').addEventListener('click', () => { S = keepEntry(); go('phone', { focus: '#phoneInput' }); });

      $('#stepForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        $('#formAlert').innerHTML = '';
        const errs = [];
        S.details.title = ($('input[name="title"]:checked') || {}).value || '';
        const te = S.details.title ? '' : 'Select a title.';
        $('#titleErr').innerHTML = te ? ICON.alert + esc(te) : '';
        $('.salute').classList.toggle('is-invalid', !!te);
        if (te) errs.push($('#title0'));
        S.details.first = first.value.trim().replace(/\s+/g, ' ');
        S.details.last = last.value.trim().replace(/\s+/g, ' ');
        S.details.email = email.value.trim().toLowerCase();
        first.value = S.details.first; last.value = S.details.last; email.value = S.details.email;

        const fe = !S.details.first ? 'Enter your first name.' : (S.details.first.replace(/\s/g, '').length < 2 ? 'First name needs at least 2 letters.' : '');
        setFieldError(first, $('#firstErr'), fe); if (fe) errs.push(first);
        const le = !S.details.last ? 'Enter your last name.' : '';
        setFieldError(last, $('#lastErr'), le); if (le) errs.push(last);
        const ee = emailError(S.details.email);
        setFieldError(email, $('#emailErr'), ee); if (ee) errs.push(email);
        const ce = consentError(S.consent);
        const cErrEl = $('#su-chErr');
        cErrEl.className = 'msg msg--error';
        cErrEl.innerHTML = ce ? ICON.alert + esc(ce) : '';
        if (ce) errs.push($('#su-ch-email'));
        if (errs.length) { errs[0].focus(); return; }

        const btn = $('#primaryBtn');
        setBusy(btn, true, 'Creating account…');
        try {
          const owner = await api.findEmailOwner(S.details.email);
          if (owner && owner !== S.key) {
            S.swap = { ownerKey: owner, choice: 'mobile' };
            return go('swap');
          }
          const user = await api.createUser(S.key, profile(), normaliseConsent(S.consent, 'signup'));
          signedIn(S.key, user, 'new');
        } catch {
          setBusy(btn, false);
          showFormAlert(NET_ERR);
        }
      });
    },
  });

  function bindName(input, errEl, field) {
    let t;
    input.addEventListener('input', () => {
      const before = input.value;
      let v = before.replace(/[^\p{L}\p{M} ]/gu, '').replace(/^ +/, '').replace(/ {2,}/g, ' ').slice(0, NAME_MAX);
      if (v !== before) {
        const pos = Math.max(0, (input.selectionStart || v.length) - (before.length - v.length));
        input.value = v; input.setSelectionRange(pos, pos);
        errEl.className = 'msg msg--hint';
        errEl.innerHTML = ICON.info + 'Only letters and spaces are allowed.';
        clearTimeout(t); t = setTimeout(() => { if (errEl.classList.contains('msg--hint')) { errEl.innerHTML = ''; errEl.className = 'msg msg--error'; } }, 2200);
      } else if (input.getAttribute('aria-invalid') === 'true') {
        setFieldError(input, errEl, '');
      }
      S.details[field] = input.value;
    });
  }

  function emailError(v) {
    if (!v) return 'Enter your email address.';
    if (v.length > EMAIL_MAX) return 'That email is too long.';
    if (!v.includes('@')) return 'An email needs an “@”, like name@example.com.';
    if (!EMAIL_RE.test(v) || v.includes('..')) return 'Enter a valid email, like name@example.com.';
    return '';
  }

  function bindEmail(input, errEl, sugEl) {
    const suggest = () => {
      const v = input.value.trim().toLowerCase();
      const dom = v.split('@')[1];
      const fix = dom && DOMAIN_TYPOS[dom];
      if (fix) {
        const s = `${v.split('@')[0]}@${fix}`;
        sugEl.innerHTML = `Did you mean <button type="button" class="link-btn" id="sugBtn">${esc(s)}</button>?`;
        $('#sugBtn').addEventListener('click', () => { input.value = s; S.details.email = s; sugEl.innerHTML = ''; setFieldError(input, errEl, ''); input.focus(); });
      } else sugEl.innerHTML = '';
    };
    input.addEventListener('input', () => {
      const pos = input.selectionStart;
      const before = input.value;
      const v = before.replace(/\s+/g, '');
      if (v !== before) { input.value = v; input.setSelectionRange(pos - 1, pos - 1); }
      S.details.email = v;
      if (input.getAttribute('aria-invalid') === 'true') setFieldError(input, errEl, '');
      sugEl.innerHTML = '';
    });
    input.addEventListener('blur', () => {
      input.value = input.value.trim().toLowerCase();
      S.details.email = input.value;
      if (input.value) setFieldError(input, errEl, emailError(input.value));
      suggest();
    });
  }

  /* ---------- Consent block ---------- */
  function consentFieldset(p, c, { title } = {}) {
    return `
      <fieldset class="consent" id="${p}-consent">
        <legend class="sr-only">${esc(title || 'Communication preferences')}</legend>
        <label class="check">
          <input type="checkbox" id="${p}-mkt" ${c.marketing ? 'checked' : ''}>
          <span>${esc(COPY.marketing)}</span>
        </label>
        <div class="channels" role="group" aria-labelledby="${p}-chq" aria-describedby="${p}-chErr">
          <p class="channels__q" id="${p}-chq">${esc(COPY.channelsQ)}</p>
          <div class="channels__grid">
            ${CHANNELS.map((ch) => `
              <label class="pill"><input type="checkbox" id="${p}-ch-${ch.key}" data-ch="${ch.key}" ${c.channels[ch.key] ? 'checked' : ''}>${esc(ch.label)}</label>`).join('')}
          </div>
          <p class="msg msg--error" id="${p}-chErr" role="alert"></p>
        </div>
        <label class="check">
          <input type="checkbox" id="${p}-prs" ${c.personalisation ? 'checked' : ''}>
          <span>${esc(COPY.personalisation)}</span>
        </label>
      </fieldset>`;
  }

  function consentError(c) {
    return c.marketing && !anyChannel(c) ? 'Choose at least one way to hear from us, or untick marketing communications.' : '';
  }

  function bindConsent(root, p, c, onChange) {
    const mkt = $(`#${p}-mkt`, root); const prs = $(`#${p}-prs`, root);
    const chs = $$(`[data-ch]`, $(`#${p}-consent`, root));
    const errEl = $(`#${p}-chErr`, root);
    const sync = () => chs.forEach((i) => { i.checked = c.channels[i.dataset.ch]; });
    mkt.addEventListener('change', () => {
      c.marketing = mkt.checked;
      // Ticking marketing opts in to every channel; the user can then untick any they don't want.
      Object.keys(c.channels).forEach((k) => { c.channels[k] = mkt.checked; });
      sync(); errEl.innerHTML = '';
      onChange?.();
    });
    chs.forEach((i) => i.addEventListener('change', () => {
      c.channels[i.dataset.ch] = i.checked;
      if (i.checked) { c.marketing = true; mkt.checked = true; }
      else if (!anyChannel(c)) { c.marketing = false; mkt.checked = false; }
      errEl.className = 'msg msg--error'; errEl.innerHTML = '';
      onChange?.();
    }));
    prs.addEventListener('change', () => { c.personalisation = prs.checked; onChange?.(); });
  }

  /* Returning-user preferences: collapsed for all/partial, always expanded for none. */
  function prefsCard(user, { forceOpen = false } = {}) {
    const level = consentLevel(user.consent);
    const open = forceOpen || level === 'none';
    return `
      <section class="prefs" id="prefs" data-level="${level}" aria-labelledby="prefsTitle">
        <div class="prefs__head">
          <span class="prefs__icon">${ICON.bell}</span>
          <div class="prefs__text">
            <p class="prefs__title" id="prefsTitle">${level === 'none' ? 'Hear from us your way' : 'Communication preferences'}</p>
            <p class="prefs__sum" id="prefsSum">${level === 'none' ? 'Choose what you’d like to hear about. You can change this anytime.' : esc(consentSummary(user.consent))}</p>
          </div>
          ${level === 'none' && !forceOpen ? '' : `<button type="button" class="prefs__toggle" id="prefsToggle" aria-expanded="${open}" aria-controls="prefsPanel">${open ? 'Hide' : 'Edit'} ${ICON.chevron}</button>`}
        </div>
        <div class="prefs__panel" id="prefsPanel" ${open ? '' : 'hidden'}>
          ${consentFieldset('pf', cloneConsent(user.consent), { title: 'Communication preferences' })}
          <p class="save-state" id="saveState" aria-live="polite"></p>
        </div>
      </section>`;
  }

  function bindPrefs(key) {
    const card = $('#prefs'); if (!card) return;
    const toggle = $('#prefsToggle'); const panel = $('#prefsPanel');
    const state = $('#saveState'); const sum = $('#prefsSum');
    const c = cloneConsent(db.read().users[key].consent);
    if (toggle) toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.innerHTML = `${open ? 'Hide' : 'Edit'} ${ICON.chevron}`;
      panel.hidden = !open;
      if (open) $('#pf-mkt').focus();
    });
    let t; let seq = 0;
    const save = async () => {
      if (consentError(c)) { state.className = 'save-state'; state.textContent = ''; return; }
      const mine = ++seq;
      state.className = 'save-state'; state.textContent = 'Saving…';
      try {
        const saved = await api.saveConsent(key, normaliseConsent(c, 'preferences'));
        if (mine !== seq) return;
        state.className = 'save-state is-ok'; state.innerHTML = `${ICON.tick} Saved`;
        if (card.dataset.level !== 'none') sum.textContent = consentSummary(saved);
      } catch {
        if (mine !== seq) return;
        state.className = 'save-state is-error';
        state.innerHTML = `${ICON.alert} Couldn’t save. <button type="button" class="link-btn" id="retrySave">Try again</button>`;
        $('#retrySave').addEventListener('click', save);
      }
    };
    bindConsent(card, 'pf', c, () => { clearTimeout(t); t = setTimeout(save, 450); });
  }

  /* ---------- Step: email swap ---------- */
  STEPS.swap = () => {
    const email = S.details.email; const masked = maskPhone(S.swap.ownerKey);
    return {
      body: `
        <p class="eyebrow">${ICON.info} Email already in use</p>
        <h2 class="prompt" id="stepTitle">This email is linked to another account</h2>
        <p class="sub"><strong>${esc(email)}</strong> is already registered with another mobile number. How would you like to continue?</p>
        <div id="formAlert"></div>
        <form id="stepForm" novalidate>
          <fieldset class="choices">
            <legend class="sr-only">Choose how to continue</legend>
            <label class="choice">
              <input type="radio" name="swap" value="mobile" ${S.swap.choice === 'mobile' ? 'checked' : ''}>
              <span><span class="choice__title">Continue with ${esc(masked)}</span>
              <span class="choice__desc">Sign in to the existing account with a code sent to that number.</span></span>
            </label>
            <label class="choice">
              <input type="radio" name="swap" value="email" ${S.swap.choice === 'email' ? 'checked' : ''}>
              <span><span class="choice__title">Verify ${esc(email)}</span>
              <span class="choice__desc">We’ll email you a code, then move this email to the account you’re creating.</span></span>
            </label>
          </fieldset>
          <p class="or-link">Or <button type="button" class="link-btn" id="diffEmail">use a different email</button></p>
        </form>`,
      foot: `<button class="btn btn--primary" type="submit" form="stepForm" id="primaryBtn">Continue</button>`,
      focus: 'input[name="swap"]:checked',
      bind() {
        $$('input[name="swap"]').forEach((r) => r.addEventListener('change', () => { S.swap.choice = r.value; }));
        $('#diffEmail').addEventListener('click', () => go('details', { focus: '#email' }));
        $('#stepForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          $('#formAlert').innerHTML = '';
          const btn = $('#primaryBtn');
          if (S.swap.choice === 'email') {
            await startOtp({ kind: 'email', dest: `email:${email}`, label: maskEmail(email) }, btn, 'otp-email');
          } else {
            await startOtp({ kind: 'alt', dest: S.swap.ownerKey, label: masked }, btn, 'otp-alt');
          }
        });
      },
    };
  };

  /* ---------- Step: success ---------- */
  STEPS.success = () => {
    const { user, how, key } = S.result;
    const name = esc(user.first);
    let title; let sub; let extra = '';
    if (how === 'returning') {
      title = `Welcome back, ${name}`;
      sub = 'You’re signed in.';
      extra = prefsCard(user);
    } else if (how === 'swapped') {
      title = `You’re all set, ${name}`;
      sub = `Your account is ready and <strong>${esc(user.email)}</strong> is now linked to it.`;
    } else {
      title = `Welcome to Zoya, ${name}`;
      sub = 'Your account is ready.';
    }
    if (how !== 'returning') {
      extra = `<p class="consent__note">You can change your communication preferences anytime from your account menu.</p>`;
    }
    return {
      body: `
        <span class="done-mark" aria-hidden="true">${ICON.tick}</span>
        <h2 class="prompt" id="stepTitle">${title}</h2>
        <p class="sub">${sub}</p>
        ${extra}`,
      foot: `
        <a class="btn btn--primary" href="${CONFIG.PLP_URL}">Continue shopping</a>
        <div class="foot-row"><button type="button" class="btn btn--text" id="stayBtn">Stay on this page</button></div>`,
      bind() {
        $('#stayBtn').addEventListener('click', closeDialog);
        bindPrefs(key);
      },
    };
  };

  /* ---------- Step: preferences (from account menu) ---------- */
  STEPS.prefs = () => {
    const key = session.get();
    const user = db.read().users[key];
    return {
      body: `
        <h2 class="prompt" id="stepTitle">Communication preferences</h2>
        <p class="sub">Changes save automatically.</p>
        ${prefsCard(user, { forceOpen: true })}`,
      foot: `<button type="button" class="btn btn--ghost" id="doneBtn">Done</button>`,
      bind() { $('#doneBtn').addEventListener('click', closeDialog); bindPrefs(key); },
    };
  };

  /* =========================================================
     Header (logged-in state)
     ========================================================= */
  function renderHeader() {
    const box = $('#siteActions');
    const key = session.get();
    const user = key && db.read().users[key];
    if (!user) {
      box.innerHTML = `<button class="account-btn" type="button" data-open-login>${ICON.user} Login</button>`;
    } else {
      box.innerHTML = `
        <button class="account-btn" type="button" id="acctBtn" aria-haspopup="true" aria-expanded="false" aria-controls="acctMenu">${ICON.user} Hi, ${esc(user.first)}</button>
        <div class="account-menu" id="acctMenu" hidden>
          <p class="account-menu__who">${esc([user.title, user.first, user.last].filter(Boolean).join(' '))}<br>${esc(user.email || 'No email on file')}</p>
          <button type="button" id="menuPrefs">Communication preferences</button>
          <button type="button" id="menuLogout">Log out</button>
        </div>`;
      const btn = $('#acctBtn'); const menu = $('#acctMenu');
      const setOpen = (o) => { menu.hidden = !o; btn.setAttribute('aria-expanded', String(o)); };
      btn.addEventListener('click', (e) => { e.stopPropagation(); setOpen(menu.hidden); if (!menu.hidden) $('button', menu).focus(); });
      menu.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setOpen(false); btn.focus(); } });
      document.addEventListener('click', (e) => { if (!menu.contains(e.target)) setOpen(false); });
      $('#menuPrefs').addEventListener('click', () => { setOpen(false); openDialog('prefs'); });
      $('#menuLogout').addEventListener('click', () => { session.clear(); renderHeader(); $('[data-open-login]').focus(); });
    }
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open-login]');
    if (t) openDialog('phone');
  });

  /* =========================================================
     Demo panel
     ========================================================= */
  $$('[data-demo-phone]').forEach((b) => b.addEventListener('click', () => {
    session.clear(); renderHeader();
    if (el.dlg.hidden) openDialog('phone');
    else { S = fresh(); go('phone'); }
    S.country = COUNTRIES[0]; $('#countrySel').value = 'IN'; $('#countrySel').dispatchEvent(new Event('change'));
    const input = $('#phoneInput');
    input.value = b.dataset.demoPhone;
    input.dispatchEvent(new Event('input'));
    input.focus();
  }));
  $$('[data-demo-copy]').forEach((b) => b.addEventListener('click', async () => {
    const email = $('#email');
    if (email) { email.value = b.dataset.demoCopy; email.dispatchEvent(new Event('input')); email.focus(); }
    else { try { await navigator.clipboard.writeText(b.dataset.demoCopy); b.textContent = 'Copied'; } catch { /* ignore */ } }
  }));
  $('#demoNetFail').addEventListener('change', (e) => { demo.netFail = e.target.checked; });
  $('#demoExpire').addEventListener('click', () => {
    if (S.otp && otpLedger.has(S.otp.dest)) {
      const L = otpLedger.get(S.otp.dest);
      L.expired = true; L.sentAt = Date.now() - CONFIG.OTP_VALID_S * 1000 - 1;
    }
  });
  $('#demoReset').addEventListener('click', () => {
    db.reset(); otpLedger.clear();
    if (!el.dlg.hidden) closeDialog();
    renderHeader();
  });
  window.addEventListener('offline', () => { if (!el.dlg.hidden) showFormAlert('You’re offline. Reconnect to continue.'); });

  renderHeader();
})();
