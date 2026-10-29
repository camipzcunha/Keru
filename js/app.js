import { createStore } from './store.js';
import { allowedEmails } from './config.js';

/* ───────────────────────── Catálogos ───────────────────────── */

const CATEGORIES = [
  { id: 'moda',         label: 'Moda',             icon: '👕', tint: '#F6D5CF' },
  { id: 'beleza',       label: 'Beleza',           icon: '💄', tint: '#F3D9E6' },
  { id: 'casa',         label: 'Casa',             icon: '🪴', tint: '#E3EBDD' },
  { id: 'tecnologia',   label: 'Tecnologia',       icon: '🎧', tint: '#DCE4F2' },
  { id: 'livros',       label: 'Livros & cultura', icon: '📚', tint: '#F4E6CC' },
  { id: 'comida',       label: 'Comida & bebida',  icon: '🍷', tint: '#F0D6D0' },
  { id: 'experiencias', label: 'Experiências',     icon: '🎟️', tint: '#E8DDF3' },
  { id: 'lugares',      label: 'Lugares',          icon: '📍', tint: '#DDEEE9' },
  { id: 'viagens',      label: 'Viagens',          icon: '✈️', tint: '#D8ECF4' },
  { id: 'outros',       label: 'Outros',           icon: '🎁', tint: '#EFE6DC' },
];

const RANGES = [
  { id: 'mimo',     label: 'Mimo',     hint: 'até R$ 100',        min: 0,    max: 100 },
  { id: 'presente', label: 'Presente', hint: 'R$ 100 a 300',      min: 100,  max: 300 },
  { id: 'especial', label: 'Especial', hint: 'R$ 300 a 800',      min: 300,  max: 800 },
  { id: 'grande',   label: 'Grandão',  hint: 'R$ 800 a 2.000',    min: 800,  max: 2000 },
  { id: 'sonho',    label: 'Sonho',    hint: 'acima de R$ 2.000', min: 2000, max: Infinity },
];
const NO_PRICE = { id: 'none', label: 'Sem preço', hint: 'preço não informado' };

const PRIORITIES = { 1: 'Seria legal', 2: 'Quero muito', 3: 'Quero demais' };

const OUT_REASONS = {
  ganhar:  'Vou ganhar de outra pessoa',
  comprar: 'Vou comprar eu mesmo(a)',
  tenho:   'Já tenho',
  outro:   'Outro motivo',
};

const MEASURES = [
  ['altura', 'Altura', 'cm'], ['torax', 'Tórax / Busto', 'cm'], ['cintura', 'Cintura', 'cm'],
  ['quadril', 'Quadril', 'cm'], ['pulso', 'Pulso', 'cm'],
  ['camiseta', 'Camiseta', 'ex.: M'], ['camisa', 'Camisa / Blusa', 'ex.: 40 ou M'],
  ['calca', 'Calça / Bermuda', 'ex.: 42'], ['vestido', 'Vestido / Terno', 'ex.: 40'],
  ['sutia', 'Sutiã / Top', 'ex.: 42B'], ['intima', 'Roupa íntima', 'ex.: M'],
  ['calcado', 'Calçado', 'ex.: 38'], ['anel', 'Anel (aro)', 'ex.: 16'],
];

const PREFS = [
  ['estilo', 'Meu estilo', 'ex.: básico, colorido, vintage…'],
  ['marcas', 'Marcas e lojas favoritas', ''],
  ['aromas', 'Perfumes e aromas', ''],
  ['comidas', 'Comidas e bebidas favoritas', ''],
  ['flores', 'Flores', ''],
  ['hobbies', 'Hobbies', ''],
  ['naoGosto', 'Não gosto de', 'coisas para evitar'],
  ['alergias', 'Alergias e restrições', ''],
  ['obs', 'Outras observações', ''],
];

/* ───────────────────────── Utilidades ───────────────────────── */

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const money = v => (typeof v === 'number' && !Number.isNaN(v) ? brl.format(v) : '');
const catOf = id => CATEGORIES.find(c => c.id === id) || CATEGORIES.at(-1);
const rangeOf = p => (typeof p === 'number' && !Number.isNaN(p) ? RANGES.find(r => p >= r.min && p < r.max) : NO_PRICE);
const firstName = s => (s || '').trim().split(/\s+/)[0] || '';
const safeUrl = u => {
  try {
    const url = new URL(String(u).trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
  } catch { return ''; }
};
const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
const isHex = c => /^#[0-9a-f]{6}$/i.test(c);

const ICONS = {
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  out: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/></svg>',
  logout: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/></svg>',
  gift: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0"/></svg>',
};

const LOGO = `<svg class="logo-mark" viewBox="0 0 64 64" aria-hidden="true">
  <defs><linearGradient id="kg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF6A5C"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient></defs>
  <rect width="64" height="64" rx="18" fill="url(#kg)"/>
  <path d="M32 30c-5-10-17-11-17-3 0 7 10 8 17 3zM32 30c5-10 17-11 17-3 0 7-10 8-17 3z" fill="#fff"/>
  <path d="M30.5 32l-6 15 4.5-1.5 2.8 3.5.7-17zM33.5 32l6 15-4.5-1.5-2.8 3.5-.7-17z" fill="#fff" opacity=".85"/>
  <circle cx="32" cy="30.5" r="4" fill="#fff"/>
</svg>`;

/* ───────────────────────── Estado ───────────────────────── */

const S = {
  user: null,
  profiles: {},      // uid -> perfil
  items: [],
  loaded: { items: false, profiles: false },
  view: 'meus',      // meus | parceiro | keremus | perfil
  profileTab: 'eu',  // eu | par
  filters: { q: '', cat: 'all', range: 'all', sort: 'recent' },
  profileDirty: false,
  unsubs: [],
};

let store;
const me = () => S.user?.uid;
const myProfile = () => S.profiles[me()] || { name: S.user?.name || '' };
const partner = () => Object.values(S.profiles).find(p => p.id !== me()) || null;
const partnerName = () => firstName(partner()?.name) || 'seu amor';

/* ───────────────────────── Inicialização ───────────────────────── */

const root = document.getElementById('app');

async function init() {
  try {
    store = await createStore();
  } catch (err) {
    console.error(err);
    root.innerHTML = `<div class="fatal">${LOGO}<h1>Ops, não consegui conectar.</h1>
      <p>Verifique sua internet e a configuração do Firebase em <code>js/config.js</code>.</p></div>`;
    return;
  }
  root.addEventListener('click', e => {
    const v = e.target.closest('[data-view]');
    if (v && S.user) { e.preventDefault(); go(v.dataset.view); }
  });
  store.onAuth(user => {
    S.unsubs.forEach(u => u && u());
    S.unsubs = [];
    S.user = user;
    if (!user) { S.view = 'meus'; S.profileTab = 'eu'; S.profileDirty = false; return renderAuth(); }
    if (allowedEmails.length && !allowedEmails.includes(user.email)) {
      toast('Este e-mail não está liberado para usar este Keru.', 'error');
      store.signOut();
      return;
    }
    S.items = [];
    S.profiles = {};
    S.loaded = { items: false, profiles: false };
    renderShell();
    S.unsubs.push(
      store.subscribeItems(items => { S.items = items; S.loaded.items = true; refresh(); }, onDataError),
      store.subscribeProfiles(list => {
        S.profiles = Object.fromEntries(list.map(p => [p.id, p]));
        S.loaded.profiles = true;
        ensureMyProfile();
        refresh();
      }, onDataError),
    );
  });
}

function onDataError(err) {
  console.error(err);
  toast(err?.code === 'permission-denied'
    ? 'Sem permissão para ler os dados. Confira o firestore.rules e os e-mails liberados.'
    : 'Erro ao sincronizar os dados.', 'error');
}

function ensureMyProfile() {
  if (S.profiles[me()]) return;
  const name = S.user.name || firstName(S.user.email.split('@')[0]);
  store.saveProfile(me(), { name, email: S.user.email, createdAt: Date.now() }).catch(onDataError);
}

/* ───────────────────────── Tela de login ───────────────────────── */

function renderAuth(mode = 'entrar') {
  const demo = store.mode === 'local';
  root.innerHTML = `
  <div class="auth">
    <section class="auth-hero">
      <div class="brand brand-lg">${LOGO}<span class="wordmark">keru</span></div>
      <h1 class="auth-title">Tudo o que a gente <em>quer</em>,<br>num lugar só.</h1>
      <p class="auth-sub">Desejos, experiências, lugares e viagens — para presentear quem a gente ama sem errar (e sem estragar a surpresa).</p>
      <div class="auth-floaters" aria-hidden="true">
        <div class="floater f1"><span>✈️</span><b>Viagem</b><small>R$ 2.400</small></div>
        <div class="floater f2"><span>🎧</span><b>Fone novo</b><small>R$ 1.499</small></div>
        <div class="floater f3"><span>🎟️</span><b>Cerâmica</b><small>R$ 280</small></div>
      </div>
    </section>
    <section class="auth-panel">
      <form class="auth-card" id="auth-form" novalidate>
        <div class="seg" role="tablist">
          <button type="button" role="tab" class="${mode === 'entrar' ? 'on' : ''}" data-mode="entrar">Entrar</button>
          <button type="button" role="tab" class="${mode === 'criar' ? 'on' : ''}" data-mode="criar">Criar conta</button>
        </div>
        ${mode === 'criar' ? `<label class="field"><span>Seu nome</span><input name="name" autocomplete="given-name" required placeholder="Como o seu par te chama?"></label>` : ''}
        <label class="field"><span>E-mail</span><input name="email" type="email" autocomplete="email" required placeholder="voce@email.com"></label>
        <label class="field"><span>Senha</span><input name="password" type="password" autocomplete="${mode === 'criar' ? 'new-password' : 'current-password'}" required minlength="6" placeholder="mínimo 6 caracteres"></label>
        <p class="form-error" id="auth-error" role="alert"></p>
        <button class="btn btn-primary btn-block" type="submit">${mode === 'criar' ? 'Criar nossa conta' : 'Entrar'}</button>
        ${mode === 'entrar' && !demo ? '<button type="button" class="link-btn" id="forgot">Esqueci minha senha</button>' : ''}
        ${demo ? `<div class="demo-note"><b>Modo demonstração.</b> Os dados ficam só neste navegador. Experimente com
          <code>ana@keru.demo</code> ou <code>leo@keru.demo</code> (senha <code>keru123</code>).
          Para usar nos dois computadores, configure o Firebase (veja o README).</div>` : ''}
      </form>
    </section>
  </div>`;

  $$('.seg button', root).forEach(b => b.addEventListener('click', () => renderAuth(b.dataset.mode)));
  $('#forgot', root)?.addEventListener('click', async () => {
    const email = $('[name=email]', root).value.trim();
    if (!email) return showAuthError('Digite seu e-mail acima primeiro.');
    try { await store.resetPassword(email); toast('Enviamos um link para redefinir a senha.'); }
    catch (e) { showAuthError(authMessage(e)); }
  });
  $('#auth-form', root).addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const email = String(f.get('email') || '').trim().toLowerCase();
    const password = String(f.get('password') || '');
    const name = String(f.get('name') || '').trim();
    if (!email || !password) return showAuthError('Preencha e-mail e senha.');
    if (mode === 'criar' && !name) return showAuthError('Conta pra gente o seu nome.');
    if (allowedEmails.length && !allowedEmails.includes(email)) return showAuthError('Este e-mail não está na lista do casal (js/config.js).');
    const btn = e.target.querySelector('[type=submit]');
    btn.disabled = true;
    try {
      if (mode === 'criar') await store.signUp(name, email, password);
      else await store.signIn(email, password);
    } catch (err) {
      showAuthError(authMessage(err));
      btn.disabled = false;
    }
  });
}

function showAuthError(msg) { const el = $('#auth-error'); if (el) el.textContent = msg; }

function authMessage(err) {
  const map = {
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/wrong-password': 'E-mail ou senha incorretos.',
    'auth/user-not-found': 'E-mail ou senha incorretos.',
    'auth/invalid-email': 'Esse e-mail não parece válido.',
    'auth/email-already-in-use': 'Já existe uma conta com esse e-mail.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/too-many-requests': 'Muitas tentativas. Espere um pouco e tente de novo.',
    'auth/network-request-failed': 'Sem conexão com a internet.',
  };
  return map[err?.code] || err?.message || 'Algo deu errado.';
}

/* ───────────────────────── Estrutura do app ───────────────────────── */

function navTabs() {
  return [
    { id: 'meus', label: 'Meus desejos', short: 'Meus' },
    { id: 'parceiro', label: `Desejos de ${esc(partnerName())}`, short: esc(partnerName()) },
    { id: 'keremus', label: 'Keremus', short: 'Keremus' },
    { id: 'perfil', label: 'Perfis', short: 'Perfis' },
  ];
}

function renderShell() {
  root.innerHTML = `
    ${store.mode === 'local' ? '<div class="demo-bar">Modo demonstração · os dados ficam só neste navegador</div>' : ''}
    <header class="topbar">
      <a class="brand" href="#" data-view="meus" aria-label="Keru, início">${LOGO}<span class="wordmark">keru</span></a>
      <nav class="tabs" id="tabs" aria-label="Seções"></nav>
      <div class="userbox">
        <span class="avatar" id="my-avatar"></span>
        <button class="icon-btn" id="logout" title="Sair" aria-label="Sair">${ICONS.logout}</button>
      </div>
    </header>
    <main id="view" class="view"></main>
    <nav class="bottomnav" id="bottomnav" aria-label="Seções"></nav>
    <div id="toasts" class="toasts" aria-live="polite"></div>`;

  $('#logout').addEventListener('click', () => store.signOut());
  renderNav();
  renderView();
}

function renderNav() {
  const tabs = navTabs();
  $('#tabs').innerHTML = tabs.map(t =>
    `<button class="tab ${S.view === t.id ? 'on' : ''} ${t.id === 'keremus' ? 'tab-nos' : ''}" data-view="${t.id}">${t.label}</button>`).join('');
  $('#bottomnav').innerHTML = tabs.map(t =>
    `<button class="${S.view === t.id ? 'on' : ''}" data-view="${t.id}"><span class="bn-dot"></span>${t.short}</button>`).join('');
  const p = myProfile();
  $('#my-avatar').textContent = (firstName(p.name) || '?').charAt(0).toUpperCase();
  $('#my-avatar').title = p.name || '';
}

function go(view) {
  if (S.view === 'perfil' && view !== 'perfil' && S.profileDirty && !window.confirm('Descartar as alterações do perfil?')) return;
  S.profileDirty = false;
  S.view = view;
  S.filters.q = '';
  renderNav();
  renderView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function refresh() {
  if (!$('#view')) return;
  renderNav();
  if (S.view === 'perfil') {
    if (!S.profileDirty) renderView();
  } else if ($('#results')?.dataset.owner === String(listOwner())) {
    renderListHead();
    renderResults();
  } else {
    renderView();
  }
}

function renderView() {
  if (S.view === 'perfil') return renderProfiles();
  renderList();
}

/* ───────────────────────── Listas de desejos ───────────────────────── */

function listOwner() {
  if (S.view === 'meus') return me();
  if (S.view === 'keremus') return 'nos';
  return partner()?.id || null;
}

function renderList() {
  const view = $('#view');
  const owner = listOwner();
  if (S.view === 'parceiro' && !owner) {
    view.innerHTML = S.loaded.profiles ? emptyPartner() : loading();
    return;
  }
  view.innerHTML = `
    <section class="list-head" id="list-head"></section>
    <section class="filters" aria-label="Filtros">
      <label class="search">${ICONS.search}<input id="q" type="search" placeholder="Buscar desejo…" value="${esc(S.filters.q)}"></label>
      <div class="chips" id="cat-chips">
        <button class="chip ${S.filters.cat === 'all' ? 'on' : ''}" data-cat="all">Todas</button>
        ${CATEGORIES.map(c => `<button class="chip ${S.filters.cat === c.id ? 'on' : ''}" data-cat="${c.id}">${c.icon} ${c.label}</button>`).join('')}
      </div>
      <div class="filter-row">
        <div class="chips chips-range" id="range-chips">
          <button class="chip ${S.filters.range === 'all' ? 'on' : ''}" data-range="all">Qualquer preço</button>
          ${RANGES.map(r => `<button class="chip range-chip r-${r.id} ${S.filters.range === r.id ? 'on' : ''}" data-range="${r.id}" title="${r.hint}">${r.label}<small>${r.hint}</small></button>`).join('')}
        </div>
        <label class="sort">Ordenar
          <select id="sort">
            <option value="recent">Mais recentes</option>
            <option value="priority">Prioridade</option>
            <option value="priceAsc">Menor preço</option>
            <option value="priceDesc">Maior preço</option>
            <option value="az">A–Z</option>
          </select>
        </label>
      </div>
    </section>
    <div id="results" class="fresh" data-owner="${esc(owner)}"></div>`;
  setTimeout(() => $('#results')?.classList.remove('fresh'), 900);

  $('#sort').value = S.filters.sort;
  $('#q').addEventListener('input', e => { S.filters.q = e.target.value; renderResults(); });
  $('#sort').addEventListener('change', e => { S.filters.sort = e.target.value; renderResults(); });
  $('#cat-chips').addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    S.filters.cat = b.dataset.cat;
    $$('#cat-chips .chip').forEach(c => c.classList.toggle('on', c === b));
    renderResults();
  });
  $('#range-chips').addEventListener('click', e => {
    const b = e.target.closest('[data-range]'); if (!b) return;
    S.filters.range = b.dataset.range;
    $$('#range-chips .chip').forEach(c => c.classList.toggle('on', c === b));
    renderResults();
  });
  $('#results').addEventListener('click', onCardClick);
  renderListHead();
  renderResults();
}

function renderListHead() {
  const head = $('#list-head');
  if (!head) return;
  const owner = listOwner();
  const all = S.items.filter(i => i.owner === owner);
  const open = all.filter(i => (i.status || 'desejo') === 'desejo');
  const total = open.reduce((s, i) => s + (typeof i.price === 'number' ? i.price : 0), 0);
  const p = partner();

  const copy = {
    meus: {
      eyebrow: `Olá, ${esc(firstName(myProfile().name))}`,
      title: 'Meus desejos',
      sub: `Tudo o que você quer ganhar. ${esc(partnerName())} vê esta lista e pode reservar em segredo o que vai te dar — você não fica sabendo.`,
    },
    parceiro: {
      eyebrow: 'Para presentear',
      title: `Desejos de ${esc(partnerName())}`,
      sub: `Reserve em segredo o que você vai dar — ${esc(partnerName())} não vê as suas reservas.`,
    },
    keremus: {
      eyebrow: 'Nós dois',
      title: 'Keremus',
      sub: 'Experiências, lugares e viagens para viver juntos.',
    },
  }[S.view];

  const sizes = S.view === 'parceiro' && p?.measures
    ? ['camiseta', 'calca', 'calcado', 'anel'].filter(k => p.measures[k]).map(k => `<span>${MEASURES.find(m => m[0] === k)[1]} <b>${esc(p.measures[k])}</b></span>`).join('')
    : '';

  head.className = `list-head lh-${S.view}`;
  head.innerHTML = `
    <div class="lh-text">
      <p class="eyebrow">${copy.eyebrow}</p>
      <h1>${copy.title}</h1>
      <p class="lh-sub">${copy.sub}</p>
      ${sizes ? `<div class="size-strip">${sizes}<button class="link-btn" data-view="perfil" data-ptab="par">ver perfil completo →</button></div>` : ''}
    </div>
    <div class="lh-side">
      <div class="stat"><b>${open.length}</b><span>${S.view === 'keremus' ? (open.length === 1 ? 'plano' : 'planos') : (open.length === 1 ? 'desejo' : 'desejos')}</span></div>
      <div class="stat"><b>${total ? money(total).replace(/,\d\d$/, '') : '—'}</b><span>somando tudo</span></div>
      ${S.view !== 'parceiro' ? `<button class="btn btn-primary" id="add-item">${ICONS.plus}<span>${S.view === 'keremus' ? 'Novo plano' : 'Novo desejo'}</span></button>` : ''}
    </div>`;
  $('#add-item', head)?.addEventListener('click', () => openItemForm(null));
  $('[data-ptab]', head)?.addEventListener('click', () => { S.profileTab = 'par'; });
}

function applyFilters(list) {
  const { q, cat, range, sort } = S.filters;
  const needle = q.trim().toLowerCase();
  const out = list.filter(i =>
    (cat === 'all' || i.category === cat) &&
    (range === 'all' || rangeOf(i.price).id === range) &&
    (!needle || `${i.title} ${i.notes || ''} ${i.outNote || ''}`.toLowerCase().includes(needle)));
  const price = i => (typeof i.price === 'number' ? i.price : null);
  const sorters = {
    recent: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
    priority: (a, b) => (b.priority || 0) - (a.priority || 0) || (b.createdAt || 0) - (a.createdAt || 0),
    priceAsc: (a, b) => (price(a) ?? Infinity) - (price(b) ?? Infinity),
    priceDesc: (a, b) => (price(b) ?? -1) - (price(a) ?? -1),
    az: (a, b) => a.title.localeCompare(b.title, 'pt-BR'),
  };
  return out.sort(sorters[sort] || sorters.recent);
}

function renderResults() {
  const box = $('#results');
  if (!box) return;
  if (!S.loaded.items) { box.innerHTML = loading(); return; }
  const owner = listOwner();
  const all = S.items.filter(i => i.owner === owner);
  const list = applyFilters(all);
  const by = st => list.filter(i => (i.status || 'desejo') === st);
  const open = by('desejo'), out = by('fora'), done = by('realizado');
  const filtered = S.filters.q || S.filters.cat !== 'all' || S.filters.range !== 'all';

  if (!all.length) { box.innerHTML = emptyList(); return; }
  if (!list.length) { box.innerHTML = `<div class="empty small"><p>Nada encontrado com esses filtros.</p></div>`; return; }

  const doneLabel = S.view === 'keremus' ? 'Já fizemos' : 'Já ganhou';
  box.innerHTML = `
    ${open.length ? `<div class="grid">${open.map(card).join('')}</div>`
      : `<div class="empty small"><p>${filtered ? 'Nenhum desejo em aberto com esses filtros.' : 'Nenhum desejo em aberto agora.'}</p></div>`}
    ${out.length ? `
      <details class="group" open>
        <summary><span class="g-title">Por enquanto, não</span><span class="g-count">${out.length}</span>
          <span class="g-hint">já vão ganhar de outra pessoa, vão comprar ou já têm</span></summary>
        <div class="grid">${out.map(card).join('')}</div>
      </details>` : ''}
    ${done.length ? `
      <details class="group">
        <summary><span class="g-title">${doneLabel}</span><span class="g-count">${done.length}</span></summary>
        <div class="grid">${done.map(card).join('')}</div>
      </details>` : ''}`;
}

function card(item) {
  const cat = catOf(item.category);
  const range = rangeOf(item.price);
  const img = safeUrl(item.image);
  const link = safeUrl(item.link);
  const status = item.status || 'desejo';
  const isMine = item.owner === me();
  const isNos = item.owner === 'nos';
  const editable = isMine || isNos;
  const forPartner = !isMine && !isNos;
  const reservedByMe = forPartner && item.reservedBy === me();
  const prio = Math.min(3, Math.max(1, item.priority || 2));

  return `
  <article class="card st-${status} ${reservedByMe ? 'reserved' : ''}" data-id="${esc(item.id)}">
    <div class="card-media" style="--tint:${cat.tint}">
      <span class="card-emoji" aria-hidden="true">${cat.icon}</span>
      ${img ? `<img src="${esc(img)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}
      <span class="badge r-${range.id}" title="${range.hint}">${range.label}</span>
      ${reservedByMe ? '<span class="ribbon">🤫 Você vai dar</span>' : ''}
    </div>
    <div class="card-body">
      <div class="card-meta">
        <span class="cat">${cat.label}</span>
        <span class="prio p${prio}" title="${PRIORITIES[prio]}">${ICONS.heart.repeat(prio)}</span>
      </div>
      <h3>${esc(item.title)}</h3>
      ${item.notes ? `<p class="notes">${esc(item.notes)}</p>` : ''}
      ${status === 'fora' ? `<p class="reason"><b>${esc(OUT_REASONS[item.outReason] || 'Fora da lista por enquanto')}</b>${item.outNote ? ` · ${esc(item.outNote)}` : ''}</p>` : ''}
      ${status === 'realizado' && item.doneNote ? `<p class="reason done">${esc(item.doneNote)}</p>` : ''}
      <div class="card-foot">
        <strong class="price">${item.price != null ? money(item.price) : '<span class="muted">sem preço</span>'}</strong>
        ${link ? `<a class="shop" href="${esc(link)}" target="_blank" rel="noopener noreferrer">${esc(hostOf(link)) || 'Comprar'} ${ICONS.out}</a>` : ''}
      </div>
      <div class="card-actions">
        ${forPartner && status === 'desejo'
          ? `<button class="btn btn-soft btn-sm" data-act="reserve">${reservedByMe ? 'Desfazer reserva' : `${ICONS.gift}<span>Vou dar esse</span>`}</button>`
          : ''}
        ${editable ? `
          <button class="icon-btn" data-act="edit" title="Editar" aria-label="Editar">${ICONS.edit}</button>
          <button class="icon-btn danger" data-act="delete" title="Excluir" aria-label="Excluir">${ICONS.trash}</button>` : ''}
      </div>
    </div>
  </article>`;
}

async function onCardClick(e) {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const id = btn.closest('[data-id]').dataset.id;
  const item = S.items.find(i => i.id === id);
  if (!item) return;
  const act = btn.dataset.act;
  if (act === 'edit') openItemForm(item);
  if (act === 'delete') {
    if (await confirmDialog(`Excluir “${item.title}”?`, 'Isso não pode ser desfeito.', 'Excluir')) {
      try { await store.deleteItem(id); toast('Desejo excluído.'); } catch (err) { onDataError(err); }
    }
  }
  if (act === 'reserve') {
    const mine = item.reservedBy === me();
    try {
      await store.saveItem({ id, reservedBy: mine ? null : me() });
      toast(mine ? 'Reserva desfeita.' : `Reservado! ${partnerName()} não vai ver. 🤫`);
    } catch (err) { onDataError(err); }
  }
}

function loading() {
  return `<div class="loading"><span></span><span></span><span></span></div>`;
}

function emptyList() {
  const msgs = {
    meus: ['Sua lista está vazia', 'Comece pelo que você anda namorando na vitrine — um livro, um jantar, aquela viagem.'],
    parceiro: [`${esc(partnerName())} ainda não adicionou desejos`, 'Assim que adicionar, aparece tudo aqui.'],
    keremus: ['Nada planejado ainda', 'Que tal o primeiro passeio, show ou viagem que vocês querem fazer juntos?'],
  }[S.view];
  return `<div class="empty">
    <div class="empty-art">${LOGO}</div>
    <h2>${msgs[0]}</h2><p>${msgs[1]}</p>
    ${S.view !== 'parceiro' ? `<button class="btn btn-primary" onclick="document.getElementById('add-item').click()">${ICONS.plus}<span>Adicionar o primeiro</span></button>` : ''}
  </div>`;
}

function emptyPartner() {
  return `<div class="empty">
    <div class="empty-art">${LOGO}</div>
    <h2>Falta o seu par por aqui</h2>
    <p>Peça para ele(a) abrir este mesmo site e clicar em <b>Criar conta</b>${allowedEmails.length ? ' usando o e-mail liberado' : ''}. A lista e o perfil aparecem aqui automaticamente.</p>
  </div>`;
}

/* ───────────────────────── Formulário de desejo ───────────────────────── */

function openItemForm(item) {
  const isNew = !item;
  const nos = item ? item.owner === 'nos' : S.view === 'keremus';
  const v = item || { status: 'desejo', priority: 2, category: nos ? 'experiencias' : (S.filters.cat !== 'all' ? S.filters.cat : 'moda') };
  const status = v.status || 'desejo';

  const dlg = openModal(`
    <form class="item-form" id="item-form" novalidate>
      <header class="modal-head">
        <p class="eyebrow">${nos ? 'Keremus' : 'Meus desejos'}</p>
        <h2>${isNew ? (nos ? 'Novo plano a dois' : 'Novo desejo') : 'Editar'}</h2>
      </header>
      <label class="field"><span>O que é? *</span>
        <input name="title" required maxlength="120" value="${esc(v.title)}" placeholder="${nos ? 'Ex.: Fim de semana na serra' : 'Ex.: Perfume, aula de dança, viagem…'}"></label>

      <fieldset class="field"><legend>Categoria</legend>
        <div class="cat-pick">
          ${CATEGORIES.map(c => `<label class="cat-opt"><input type="radio" name="category" value="${c.id}" ${v.category === c.id ? 'checked' : ''}><span style="--tint:${c.tint}">${c.icon}<em>${c.label}</em></span></label>`).join('')}
        </div>
      </fieldset>

      <div class="row2">
        <label class="field"><span>Preço (R$)</span>
          <input name="price" inputmode="decimal" value="${v.price != null ? String(v.price).replace('.', ',') : ''}" placeholder="0,00">
          <small class="hint" id="range-hint"></small></label>
        <fieldset class="field"><legend>Quanto quer?</legend>
          <div class="prio-pick">
            ${[1, 2, 3].map(n => `<label><input type="radio" name="priority" value="${n}" ${Number(v.priority || 2) === n ? 'checked' : ''}><span>${ICONS.heart.repeat(n)}<em>${PRIORITIES[n]}</em></span></label>`).join('')}
          </div>
        </fieldset>
      </div>

      <label class="field"><span>Link para comprar / reservar</span>
        <input name="link" type="url" inputmode="url" value="${esc(v.link)}" placeholder="https://…"></label>
      <label class="field"><span>Link de uma imagem <small>(opcional)</small></span>
        <input name="image" type="url" inputmode="url" value="${esc(v.image)}" placeholder="https://…/foto.jpg"></label>
      <label class="field"><span>Detalhes</span>
        <textarea name="notes" rows="2" maxlength="500" placeholder="Tamanho, cor, modelo, onde fica…">${esc(v.notes)}</textarea></label>

      <fieldset class="field"><legend>Situação</legend>
        <div class="seg seg-status">
          <label><input type="radio" name="status" value="desejo" ${status === 'desejo' ? 'checked' : ''}><span>${nos ? 'Queremos' : 'Quero'}</span></label>
          <label><input type="radio" name="status" value="fora" ${status === 'fora' ? 'checked' : ''}><span>Por enquanto, não</span></label>
          <label><input type="radio" name="status" value="realizado" ${status === 'realizado' ? 'checked' : ''}><span>${nos ? 'Já fizemos' : 'Já ganhei'}</span></label>
        </div>
      </fieldset>
      <div class="status-extra" data-for="fora">
        <label class="field"><span>Por quê?</span>
          <select name="outReason">${Object.entries(OUT_REASONS).map(([k, l]) => `<option value="${k}" ${v.outReason === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label class="field"><span>Detalhe <small>(de quem, quando…)</small></span>
          <input name="outNote" maxlength="140" value="${esc(v.outNote)}" placeholder="Ex.: Minha irmã vai me dar no aniversário"></label>
      </div>
      <div class="status-extra" data-for="realizado">
        <label class="field"><span>Uma lembrança <small>(opcional)</small></span>
          <input name="doneNote" maxlength="140" value="${esc(v.doneNote)}" placeholder="Ex.: Ganhei no Natal ❤"></label>
      </div>

      <p class="form-error" id="item-error" role="alert"></p>
      <footer class="modal-foot">
        <button type="button" class="btn btn-ghost" data-close>Cancelar</button>
        <button type="submit" class="btn btn-primary">${isNew ? 'Adicionar' : 'Salvar'}</button>
      </footer>
    </form>`);

  const form = $('#item-form', dlg);
  const syncStatus = () => {
    const st = form.status.value;
    $$('.status-extra', form).forEach(el => { el.hidden = el.dataset.for !== st; });
  };
  const syncRange = () => {
    const p = parsePrice(form.price.value);
    const r = rangeOf(p);
    $('#range-hint', form).innerHTML = p == null ? '' : `faixa <b class="r-txt r-${r.id}">${r.label}</b> · ${r.hint}`;
  };
  form.addEventListener('change', e => { if (e.target.name === 'status') syncStatus(); });
  form.price.addEventListener('input', syncRange);
  syncStatus();
  syncRange();
  form.title.focus();

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(form);
    const title = String(f.get('title') || '').trim();
    if (!title) return ($('#item-error', form).textContent = 'Dê um nome ao desejo.');
    const rawPrice = String(f.get('price') || '').trim();
    const price = parsePrice(rawPrice);
    if (rawPrice && price == null) return ($('#item-error', form).textContent = 'Preço inválido. Use algo como 149,90.');
    const link = String(f.get('link') || '').trim();
    const image = String(f.get('image') || '').trim();
    if (link && !safeUrl(link)) return ($('#item-error', form).textContent = 'O link precisa começar com https://');
    if (image && !safeUrl(image)) return ($('#item-error', form).textContent = 'O link da imagem precisa começar com https://');
    const st = String(f.get('status'));

    const data = {
      title,
      category: String(f.get('category') || 'outros'),
      price,
      priority: Number(f.get('priority') || 2),
      link: safeUrl(link),
      image: safeUrl(image),
      notes: String(f.get('notes') || '').trim(),
      status: st,
      outReason: st === 'fora' ? String(f.get('outReason')) : null,
      outNote: st === 'fora' ? String(f.get('outNote') || '').trim() : null,
      doneNote: st === 'realizado' ? String(f.get('doneNote') || '').trim() : null,
      updatedAt: Date.now(),
    };
    if (isNew) Object.assign(data, { owner: nos ? 'nos' : me(), createdBy: me(), createdAt: Date.now(), reservedBy: null });
    else data.id = item.id;

    form.querySelector('[type=submit]').disabled = true;
    try {
      await store.saveItem(data);
      closeModal(dlg);
      toast(isNew ? 'Adicionado! ✨' : 'Salvo.');
    } catch (err) {
      form.querySelector('[type=submit]').disabled = false;
      $('#item-error', form).textContent = err?.code === 'permission-denied' ? 'Sem permissão para salvar.' : 'Não foi possível salvar.';
      console.error(err);
    }
  });
}

function parsePrice(raw) {
  let s = String(raw || '').replace(/[^\d.,]/g, '');
  if (!s) return null;
  // "1.299,90" → 1299.90 ; "1299.90" → 1299.90 ; "1,5" → 1.5
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if ((s.match(/\./g) || []).length > 1 || /\.\d{3}$/.test(s)) s = s.replace(/\./g, '');
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

/* ───────────────────────── Perfis ───────────────────────── */

function renderProfiles() {
  const view = $('#view');
  if (!S.loaded.profiles) { view.innerHTML = loading(); return; }
  const p = partner();
  if (S.profileTab === 'par' && !p) S.profileTab = 'eu';
  const mine = myProfile();

  view.innerHTML = `
    <section class="list-head lh-perfil">
      <div class="lh-text">
        <p class="eyebrow">Para acertar no presente</p>
        <h1>Perfis</h1>
        <p class="lh-sub">Medidas, cores e gostos de cada um. Você edita o seu e consulta o de ${esc(partnerName())}.</p>
      </div>
    </section>
    <div class="seg seg-people" role="tablist">
      <button role="tab" class="${S.profileTab === 'eu' ? 'on' : ''}" data-ptab="eu"><span class="avatar sm">${esc((firstName(mine.name) || '?')[0].toUpperCase())}</span>Meu perfil</button>
      <button role="tab" class="${S.profileTab === 'par' ? 'on' : ''}" data-ptab="par" ${p ? '' : 'disabled'}><span class="avatar sm alt">${esc((firstName(p?.name) || '?')[0].toUpperCase())}</span>${p ? esc(firstName(p.name)) : 'Seu par'}</button>
    </div>
    <div id="profile-body"></div>`;

  $$('[data-ptab]', view).forEach(b => b.addEventListener('click', () => {
    if (b.dataset.ptab === S.profileTab) return;
    if (S.profileDirty && !window.confirm('Descartar as alterações do perfil?')) return;
    S.profileDirty = false;
    S.profileTab = b.dataset.ptab;
    renderProfiles();
  }));

  if (S.profileTab === 'par') renderPartnerProfile(p);
  else renderMyProfileForm(mine);
}

function renderMyProfileForm(p) {
  const m = p.measures || {};
  const pr = p.prefs || {};
  let fav = (p.favColors || []).filter(isHex);
  let avoid = (p.avoidColors || []).filter(isHex);

  const body = $('#profile-body');
  body.innerHTML = `
    <form id="profile-form" class="profile-grid" novalidate>
      <section class="panel">
        <h2>Sobre mim</h2>
        <div class="row2">
          <label class="field"><span>Nome</span><input name="name" maxlength="60" value="${esc(p.name)}"></label>
          <label class="field"><span>Aniversário</span><input name="birthday" type="date" value="${esc(p.birthday)}"></label>
        </div>
      </section>

      <section class="panel">
        <h2>Medidas</h2>
        <p class="panel-sub">Preencha só o que fizer sentido para você.</p>
        <div class="measure-grid">
          ${MEASURES.map(([k, l, ph]) => `<label class="field"><span>${l}</span><input name="m_${k}" maxlength="20" value="${esc(m[k])}" placeholder="${ph}"></label>`).join('')}
        </div>
      </section>

      <section class="panel">
        <h2>Cores</h2>
        <div class="color-block">
          <h3>Amo</h3>
          <div class="swatches" id="fav-sw"></div>
          <div class="color-add"><input type="color" id="fav-in" value="#e2725b" aria-label="Escolher cor favorita"><button type="button" class="btn btn-soft btn-sm" id="fav-add">${ICONS.plus}<span>Adicionar</span></button></div>
        </div>
        <div class="color-block">
          <h3>Evito</h3>
          <div class="swatches" id="avoid-sw"></div>
          <div class="color-add"><input type="color" id="avoid-in" value="#999999" aria-label="Escolher cor que evita"><button type="button" class="btn btn-soft btn-sm" id="avoid-add">${ICONS.plus}<span>Adicionar</span></button></div>
        </div>
      </section>

      <section class="panel panel-wide">
        <h2>Gostos e preferências</h2>
        <div class="prefs-grid">
          ${PREFS.map(([k, l, ph]) => `<label class="field"><span>${l}</span><textarea name="p_${k}" rows="2" maxlength="400" placeholder="${ph}">${esc(pr[k])}</textarea></label>`).join('')}
        </div>
      </section>

      <div class="save-bar"><span id="dirty-note">Tudo salvo</span><button type="submit" class="btn btn-primary">Salvar perfil</button></div>
    </form>`;

  const form = $('#profile-form');
  const markDirty = () => { S.profileDirty = true; $('#dirty-note').textContent = 'Alterações não salvas'; form.classList.add('dirty'); };
  const drawSw = () => {
    $('#fav-sw').innerHTML = swatches(fav, true) || '<span class="muted">nenhuma ainda</span>';
    $('#avoid-sw').innerHTML = swatches(avoid, true) || '<span class="muted">nenhuma ainda</span>';
  };
  drawSw();
  form.addEventListener('input', e => { if (e.target.type !== 'color') markDirty(); });
  $('#fav-add').addEventListener('click', () => { const c = $('#fav-in').value; if (!fav.includes(c)) fav = [...fav, c]; drawSw(); markDirty(); });
  $('#avoid-add').addEventListener('click', () => { const c = $('#avoid-in').value; if (!avoid.includes(c)) avoid = [...avoid, c]; drawSw(); markDirty(); });
  form.addEventListener('click', e => {
    const x = e.target.closest('[data-rm]'); if (!x) return;
    const c = x.dataset.rm;
    if (x.closest('#fav-sw')) fav = fav.filter(v => v !== c); else avoid = avoid.filter(v => v !== c);
    drawSw(); markDirty();
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(form);
    const data = {
      name: String(f.get('name') || '').trim() || p.name || '',
      birthday: String(f.get('birthday') || ''),
      measures: Object.fromEntries(MEASURES.map(([k]) => [k, String(f.get('m_' + k) || '').trim()])),
      prefs: Object.fromEntries(PREFS.map(([k]) => [k, String(f.get('p_' + k) || '').trim()])),
      favColors: fav,
      avoidColors: avoid,
      email: S.user.email,
      updatedAt: Date.now(),
    };
    try {
      await store.saveProfile(me(), data);
      S.profileDirty = false;
      toast('Perfil salvo.');
      renderNav();
      renderProfiles();
    } catch (err) { onDataError(err); }
  });
}

function swatches(list, removable) {
  return list.map(c => `<span class="sw" style="--c:${c}" title="${c}">${removable ? `<button type="button" data-rm="${c}" aria-label="Remover ${c}">${ICONS.close}</button>` : ''}</span>`).join('');
}

function renderPartnerProfile(p) {
  const m = p.measures || {};
  const pr = p.prefs || {};
  const fav = (p.favColors || []).filter(isHex);
  const avoid = (p.avoidColors || []).filter(isHex);
  const filledMeasures = MEASURES.filter(([k]) => m[k]);
  const filledPrefs = PREFS.filter(([k]) => pr[k]);
  const bd = birthdayInfo(p.birthday);
  const unit = (v, u) => (u === 'cm' && /^\d+([.,]\d+)?$/.test(v) ? `${esc(v)} cm` : esc(v));

  $('#profile-body').innerHTML = `
    <div class="profile-grid read">
      <section class="panel panel-hero">
        <span class="avatar xl alt">${esc((firstName(p.name) || '?')[0].toUpperCase())}</span>
        <div>
          <h2>${esc(p.name)}</h2>
          ${bd ? `<p class="bday">🎂 ${bd.date} · <b>${bd.days === 0 ? 'é hoje!' : `faltam ${bd.days} ${bd.days === 1 ? 'dia' : 'dias'}`}</b></p>` : '<p class="muted">Aniversário não informado</p>'}
        </div>
      </section>
      <section class="panel">
        <h2>Medidas</h2>
        ${filledMeasures.length ? `<dl class="measure-list">${filledMeasures.map(([k, l, u]) => `<div><dt>${l}</dt><dd>${unit(m[k], u)}</dd></div>`).join('')}</dl>` : '<p class="muted">Nenhuma medida preenchida ainda.</p>'}
      </section>
      <section class="panel">
        <h2>Cores</h2>
        <div class="color-block"><h3>Ama</h3><div class="swatches">${swatches(fav) || '<span class="muted">—</span>'}</div></div>
        <div class="color-block"><h3>Evita</h3><div class="swatches">${swatches(avoid) || '<span class="muted">—</span>'}</div></div>
      </section>
      <section class="panel panel-wide">
        <h2>Gostos e preferências</h2>
        ${filledPrefs.length ? `<dl class="pref-list">${filledPrefs.map(([k, l]) => `<div class="${k === 'naoGosto' || k === 'alergias' ? 'warn' : ''}"><dt>${l}</dt><dd>${esc(pr[k])}</dd></div>`).join('')}</dl>` : '<p class="muted">Nada preenchido ainda.</p>'}
      </section>
    </div>`;
}

function birthdayInfo(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return null;
  const [, mo, d] = iso.split('-').map(Number);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let next = new Date(today.getFullYear(), mo - 1, d);
  if (next < today) next = new Date(today.getFullYear() + 1, mo - 1, d);
  return {
    date: next.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }),
    days: Math.round((next - today) / 86400000),
  };
}

/* ───────────────────────── Modais e avisos ───────────────────────── */

function openModal(html) {
  const dlg = document.createElement('dialog');
  dlg.className = 'modal';
  dlg.innerHTML = `<button class="icon-btn modal-x" data-close aria-label="Fechar">${ICONS.close}</button>${html}`;
  document.body.appendChild(dlg);
  dlg.addEventListener('click', e => {
    if (e.target === dlg || e.target.closest('[data-close]')) closeModal(dlg);
  });
  dlg.addEventListener('close', () => dlg.remove());
  dlg.showModal();
  return dlg;
}

function closeModal(dlg) { if (dlg.open) dlg.close(); }

function confirmDialog(title, text, okLabel) {
  return new Promise(resolve => {
    const dlg = openModal(`
      <div class="confirm">
        <h2>${esc(title)}</h2><p>${esc(text)}</p>
        <footer class="modal-foot">
          <button class="btn btn-ghost" data-close>Cancelar</button>
          <button class="btn btn-danger" id="ok">${esc(okLabel)}</button>
        </footer>
      </div>`);
    dlg.classList.add('modal-sm');
    let result = false;
    $('#ok', dlg).addEventListener('click', () => { result = true; closeModal(dlg); });
    dlg.addEventListener('close', () => resolve(result));
  });
}

function toast(msg, kind = 'ok') {
  let box = $('#toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.className = 'toasts'; document.body.appendChild(box); }
  const t = document.createElement('div');
  t.className = `toast ${kind}`;
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(() => t.classList.add('out'), 3200);
  setTimeout(() => t.remove(), 3600);
}

window.addEventListener('beforeunload', e => { if (S.profileDirty) e.preventDefault(); });

init();
