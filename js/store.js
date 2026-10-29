// Camada de dados do Keru.
// Dois "backends" com a mesma interface:
//  - firebase: dados compartilhados na nuvem (Firestore + Auth)
//  - local:    modo demonstração, tudo no localStorage deste navegador

import { firebaseConfig } from './config.js';

const FIREBASE_VERSION = '10.12.2';

export const isFirebaseConfigured =
  !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'COLE_AQUI' && !!firebaseConfig.projectId;

export function createStore() {
  return isFirebaseConfigured ? createFirebaseStore() : Promise.resolve(createLocalStore());
}

/* ───────────────────────── Firebase ───────────────────────── */

async function createFirebaseStore() {
  const base = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
  const [appMod, A, F] = await Promise.all([
    import(`${base}/firebase-app.js`),
    import(`${base}/firebase-auth.js`),
    import(`${base}/firebase-firestore.js`),
  ]);
  const app = appMod.initializeApp(firebaseConfig);
  const auth = A.getAuth(app);
  const db = F.getFirestore(app);

  const toUser = u => (u ? { uid: u.uid, email: (u.email || '').toLowerCase(), name: u.displayName || '' } : null);
  const listOf = snap => snap.docs.map(d => ({ id: d.id, ...d.data() }));

  return {
    mode: 'firebase',
    onAuth: cb => A.onAuthStateChanged(auth, u => cb(toUser(u))),
    async signIn(email, password) {
      await A.signInWithEmailAndPassword(auth, email, password);
    },
    async signUp(name, email, password) {
      const cred = await A.createUserWithEmailAndPassword(auth, email, password);
      await A.updateProfile(cred.user, { displayName: name });
      // O login dispara antes do nome ser gravado; garante o nome certo no perfil
      await F.setDoc(F.doc(db, 'profiles', cred.user.uid), { name, email: (cred.user.email || '').toLowerCase() }, { merge: true });
    },
    signOut: () => A.signOut(auth),
    resetPassword: email => A.sendPasswordResetEmail(auth, email),

    subscribeItems: (cb, onError) => F.onSnapshot(F.collection(db, 'items'), s => cb(listOf(s)), onError),
    subscribeProfiles: (cb, onError) => F.onSnapshot(F.collection(db, 'profiles'), s => cb(listOf(s)), onError),

    async saveItem({ id, ...data }) {
      if (id) await F.setDoc(F.doc(db, 'items', id), data, { merge: true });
      else await F.addDoc(F.collection(db, 'items'), data);
    },
    deleteItem: id => F.deleteDoc(F.doc(db, 'items', id)),
    saveProfile: (uid, data) => F.setDoc(F.doc(db, 'profiles', uid), data, { merge: true }),
  };
}

/* ──────────────────── Modo demonstração ──────────────────── */

const DB_KEY = 'keru-demo-db-v1';
const SESSION_KEY = 'keru-demo-session';

function createLocalStore() {
  let db = readDb() || seedDb();
  const listeners = { auth: new Set(), items: new Set(), profiles: new Set() };

  const session = () => {
    try { return sessionStorage.getItem(SESSION_KEY); } catch { return null; }
  };
  const setSession = uid => {
    try { uid ? sessionStorage.setItem(SESSION_KEY, uid) : sessionStorage.removeItem(SESSION_KEY); } catch { /* ignora */ }
  };
  const currentUser = () => {
    const u = Object.values(db.users).find(x => x.uid === session());
    return u ? { uid: u.uid, email: u.email, name: u.name } : null;
  };
  const emit = kind => {
    if (kind === 'items') listeners.items.forEach(cb => cb(Object.values(db.items)));
    if (kind === 'profiles') listeners.profiles.forEach(cb => cb(Object.values(db.profiles)));
    if (kind === 'auth') listeners.auth.forEach(cb => cb(currentUser()));
  };
  const commit = (...kinds) => {
    try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch { /* ignora */ }
    kinds.forEach(emit);
  };

  // Mantém abas diferentes do mesmo navegador sincronizadas
  window.addEventListener('storage', e => {
    if (e.key !== DB_KEY) return;
    db = readDb() || db;
    emit('items');
    emit('profiles');
  });

  const later = fn => setTimeout(fn, 0);
  const fail = (code, msg) => Object.assign(new Error(msg), { code });

  return {
    mode: 'local',
    onAuth(cb) {
      listeners.auth.add(cb);
      later(() => cb(currentUser()));
      return () => listeners.auth.delete(cb);
    },
    async signIn(email, password) {
      const u = db.users[email.toLowerCase()];
      if (!u || u.password !== password) throw fail('auth/invalid-credential', 'credenciais inválidas');
      setSession(u.uid);
      emit('auth');
    },
    async signUp(name, email, password) {
      email = email.toLowerCase();
      if (db.users[email]) throw fail('auth/email-already-in-use', 'e-mail em uso');
      if (password.length < 6) throw fail('auth/weak-password', 'senha fraca');
      const uid = 'u_' + Math.random().toString(36).slice(2, 10);
      db.users[email] = { uid, email, name, password };
      commit();
      setSession(uid);
      emit('auth');
    },
    async signOut() {
      setSession(null);
      emit('auth');
    },
    async resetPassword() {
      throw fail('demo', 'No modo demonstração não há envio de e-mail.');
    },
    subscribeItems(cb) {
      listeners.items.add(cb);
      later(() => cb(Object.values(db.items)));
      return () => listeners.items.delete(cb);
    },
    subscribeProfiles(cb) {
      listeners.profiles.add(cb);
      later(() => cb(Object.values(db.profiles)));
      return () => listeners.profiles.delete(cb);
    },
    async saveItem({ id, ...data }) {
      id = id || 'i_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      db.items[id] = { ...(db.items[id] || {}), ...data, id };
      commit('items');
    },
    async deleteItem(id) {
      delete db.items[id];
      commit('items');
    },
    async saveProfile(uid, data) {
      db.profiles[uid] = { ...(db.profiles[uid] || {}), ...data, id: uid };
      commit('profiles');
    },
  };
}

function readDb() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)); } catch { return null; }
}

// Dados de exemplo para conhecer o Keru antes de configurar o Firebase
function seedDb() {
  const now = Date.now();
  const day = 86400000;
  const A = 'u_ana', L = 'u_leo';
  const item = (id, owner, data, ago) => [id, { id, owner, status: 'desejo', priority: 2, createdBy: owner === 'nos' ? A : owner, createdAt: now - ago * day, ...data }];
  return {
    users: {
      'ana@keru.demo': { uid: A, email: 'ana@keru.demo', name: 'Ana', password: 'keru123' },
      'leo@keru.demo': { uid: L, email: 'leo@keru.demo', name: 'Leo', password: 'keru123' },
    },
    profiles: {
      [A]: {
        id: A, name: 'Ana', email: 'ana@keru.demo', birthday: '1998-03-14',
        measures: { altura: '165', cintura: '68', camiseta: 'M', calca: '38', calcado: '36', anel: '14', vestido: '38' },
        favColors: ['#E2725B', '#8FA889', '#F4D35E', '#2A1A2C'], avoidColors: ['#FF00AA'],
        prefs: { estilo: 'Confortável, linho, tons terrosos', aromas: 'Baunilha, flor de laranjeira', flores: 'Girassol e peônias', naoGosto: 'Coisas muito brilhantes', alergias: 'Amendoim' },
      },
      [L]: {
        id: L, name: 'Leo', email: 'leo@keru.demo', birthday: '1996-11-30',
        measures: { altura: '180', camiseta: 'G', camisa: '3', calca: '42', calcado: '42', torax: '100' },
        favColors: ['#1F3A5F', '#556B2F', '#F5F0E6'],
        dates: [{ label: 'Aniversário de namoro', date: '2022-11-12', yearly: true }, { label: 'Formatura', date: '2026-12-18', yearly: false }],
        prefs: { estilo: 'Básico, minimalista', marcas: 'Reserva, Adidas', comidas: 'Ramen e café especial', hobbies: 'Corrida, vinil, games' },
      },
    },
    items: Object.fromEntries([
      item('d1', A, { title: 'Kindle Paperwhite', category: 'tecnologia', price: 899, link: 'https://www.amazon.com.br/', priority: 3, notes: 'Versão 16 GB, cor verde-oliva' }, 3),
      item('d2', A, { title: 'Aula de cerâmica', category: 'experiencias', price: 280, notes: 'Ateliê perto de casa, aos sábados' }, 6),
      item('d3', A, { title: 'Vela de baunilha', category: 'casa', price: 69.9, priority: 1 }, 9),
      item('d4', A, { title: 'Tênis de corrida', category: 'moda', price: 650, status: 'fora', outReason: 'ganhar', outNote: 'Minha mãe vai me dar no Natal' }, 12),
      item('d5', L, { title: 'Fone com cancelamento de ruído', category: 'tecnologia', price: 1499, priority: 3, link: 'https://www.mercadolivre.com.br/' }, 2),
      item('d6', L, { title: 'Disco "Clube da Esquina"', category: 'livros', price: 220, notes: 'Prensagem nova, 180 g', reservedBy: A }, 4),
      item('d7', L, { title: 'Moedor de café manual', category: 'casa', price: 340, priority: 1 }, 7),
      item('d8', L, { title: 'Jaqueta corta-vento', category: 'moda', price: 390, status: 'fora', outReason: 'comprar', outNote: 'Vou comprar na Black Friday' }, 10),
      item('d9', 'nos', { title: 'Fim de semana em Monte Verde', category: 'viagens', price: 2400, priority: 3, notes: 'Chalé com lareira, em julho' }, 1),
      item('d10', 'nos', { title: 'Jantar no restaurante japonês do centro', category: 'comida', price: 450 }, 5),
      item('d11', 'nos', { title: 'Show no Allianz', category: 'experiencias', price: 780, status: 'realizado', doneNote: 'Foi incrível!' }, 30),
      item('d12', 'nos', { title: 'Piquenique no Ibirapuera', category: 'lugares', price: 80, priority: 1 }, 8),
    ]),
  };
}
