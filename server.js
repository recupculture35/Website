/* ====================================================
   RECUP CULTURE – Serveur Backend Node.js / Express
   Compatible Railway, VPS, Docker, Localhost
   ==================================================== */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Emplacements des données (support des volumes Railway via DATA_DIR si configuré)
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const CREDS_FILE = path.join(DATA_DIR, 'credentials.json');

// S'assurer que le dossier data existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ─── Helpers de lecture / écriture JSON sécurisée ────
function readJson(filePath, fallback = {}) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`Erreur lecture ${filePath}:`, err.message);
  }
  return fallback;
}

function writeJson(filePath, data) {
  try {
    const tmp = `${filePath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, filePath);
    return true;
  } catch (err) {
    console.error(`Erreur écriture ${filePath}:`, err.message);
    return false;
  }
}

function hashPassword(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

// ─── Sessions en mémoire ─────────────────────────────
const sessions = new Map(); // token -> { user, expiresAt }
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 jours

function createSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const safeUser = { id: user.id, username: user.username, displayName: user.displayName, role: user.role };
  sessions.set(token, { user: safeUser, expiresAt: Date.now() + SESSION_TTL });
  return token;
}

function getSessionUser(req) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.substring(7).trim();
  const sess = sessions.get(token);
  if (!sess) return null;
  if (Date.now() > sess.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return sess.user;
}

function requireAuth(req, res, next) {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Session invalide ou expirée.' });
  }
  req.user = user;
  next();
}

// ─── Middlewares ─────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── API PUBLIQUE : Données du site ──────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: Math.round(process.uptime()), time: new Date().toISOString() });
});

app.get('/api/data', (req, res) => {
  const config = readJson(CONFIG_FILE, { siteContent: {}, collectPoints: [], news: [] });
  res.json(config);
});

// ─── API AUTHENTIFICATION ────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis.' });
  }

  const creds = readJson(CREDS_FILE, { users: [] });
  const hash = hashPassword(password);

  const found = (creds.users || []).find(u => 
    u.username.toLowerCase() === username.toLowerCase() &&
    (u.passwordHash === hash || u.passwordHash === password)
  );

  if (!found) {
    return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect.' });
  }

  const token = createSession(found);
  res.json({
    token,
    user: { id: found.id, username: found.username, displayName: found.displayName || found.username, role: found.role }
  });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', (req, res) => {
  const auth = req.headers['authorization'];
  if (auth && auth.startsWith('Bearer ')) {
    sessions.delete(auth.substring(7).trim());
  }
  res.json({ success: true });
});

// ─── API ADMIN : Textes & Rubriques (CMS) ────────────
app.put('/api/content', requireAuth, (req, res) => {
  const { siteContent } = req.body || {};
  if (!siteContent || typeof siteContent !== 'object') {
    return res.status(400).json({ error: 'Données siteContent invalides.' });
  }

  const config = readJson(CONFIG_FILE, { siteContent: {}, collectPoints: [], news: [] });
  config.siteContent = { ...config.siteContent, ...siteContent };

  if (writeJson(CONFIG_FILE, config)) {
    res.json({ success: true, siteContent: config.siteContent });
  } else {
    res.status(500).json({ error: 'Erreur lors de la sauvegarde sur le serveur.' });
  }
});

// ─── API ADMIN : Actualités ──────────────────────────
app.post('/api/news', requireAuth, (req, res) => {
  const { id, title, category, date, content } = req.body || {};
  if (!title || !date) {
    return res.status(400).json({ error: 'Titre et date requis.' });
  }

  const config = readJson(CONFIG_FILE, { siteContent: {}, collectPoints: [], news: [] });
  if (!Array.isArray(config.news)) config.news = [];

  const existingId = parseInt(id) || null;
  const item = {
    id: existingId || Date.now(),
    title: title.trim(),
    category: category || 'actualite',
    date,
    content: content || ''
  };

  if (existingId) {
    const idx = config.news.findIndex(n => n.id === existingId);
    if (idx > -1) config.news[idx] = item;
    else config.news.push(item);
  } else {
    config.news.unshift(item);
  }

  if (writeJson(CONFIG_FILE, config)) {
    res.json({ success: true, item, news: config.news });
  } else {
    res.status(500).json({ error: 'Erreur enregistrement actualité.' });
  }
});

app.delete('/api/news/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const config = readJson(CONFIG_FILE, { siteContent: {}, collectPoints: [], news: [] });
  config.news = (config.news || []).filter(n => n.id !== id);

  if (writeJson(CONFIG_FILE, config)) {
    res.json({ success: true, news: config.news });
  } else {
    res.status(500).json({ error: 'Erreur suppression actualité.' });
  }
});

// ─── API ADMIN : Points de collecte ──────────────────
app.post('/api/points', requireAuth, (req, res) => {
  const { id, name, address, description, hours, lat, lng } = req.body || {};
  if (!name || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
    return res.status(400).json({ error: 'Nom et coordonnées GPS valides requis.' });
  }

  const config = readJson(CONFIG_FILE, { siteContent: {}, collectPoints: [], news: [] });
  if (!Array.isArray(config.collectPoints)) config.collectPoints = [];

  const existingId = parseInt(id) || null;
  const pt = {
    id: existingId || Date.now(),
    name: name.trim(),
    address: (address || '').trim(),
    description: (description || '').trim(),
    hours: (hours || '').trim(),
    lat: parseFloat(lat),
    lng: parseFloat(lng)
  };

  if (existingId) {
    const idx = config.collectPoints.findIndex(p => p.id === existingId);
    if (idx > -1) config.collectPoints[idx] = pt;
    else config.collectPoints.push(pt);
  } else {
    config.collectPoints.push(pt);
  }

  if (writeJson(CONFIG_FILE, config)) {
    res.json({ success: true, point: pt, collectPoints: config.collectPoints });
  } else {
    res.status(500).json({ error: 'Erreur enregistrement point de collecte.' });
  }
});

app.delete('/api/points/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const config = readJson(CONFIG_FILE, { siteContent: {}, collectPoints: [], news: [] });
  config.collectPoints = (config.collectPoints || []).filter(p => p.id !== id);

  if (writeJson(CONFIG_FILE, config)) {
    res.json({ success: true, collectPoints: config.collectPoints });
  } else {
    res.status(500).json({ error: 'Erreur suppression point.' });
  }
});

// ─── API ADMIN : Utilisateurs ────────────────────────
app.get('/api/users', requireAuth, (req, res) => {
  const creds = readJson(CREDS_FILE, { users: [] });
  const safeUsers = (creds.users || []).map(u => ({
    id: u.id,
    username: u.username,
    displayName: u.displayName || u.username,
    role: u.role
  }));
  res.json({ users: safeUsers });
});

app.post('/api/users', requireAuth, (req, res) => {
  const { id, username, displayName, password, role } = req.body || {};
  if (!username) return res.status(400).json({ error: 'Identifiant requis.' });

  const creds = readJson(CREDS_FILE, { users: [] });
  if (!Array.isArray(creds.users)) creds.users = [];

  const existingId = parseInt(id) || null;

  if (existingId) {
    const idx = creds.users.findIndex(u => u.id === existingId);
    if (idx > -1) {
      creds.users[idx].username = username.trim();
      creds.users[idx].displayName = (displayName || username).trim();
      creds.users[idx].role = role || 'admin';
      if (password && password.trim()) {
        creds.users[idx].passwordHash = hashPassword(password);
      }
    }
  } else {
    if (!password) return res.status(400).json({ error: 'Mot de passe requis pour un nouvel utilisateur.' });
    if (creds.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ error: 'Cet identifiant existe déjà.' });
    }
    creds.users.push({
      id: Date.now(),
      username: username.trim(),
      displayName: (displayName || username).trim(),
      passwordHash: hashPassword(password),
      role: role || 'admin',
      createdAt: new Date().toISOString()
    });
  }

  if (writeJson(CREDS_FILE, creds)) {
    const safeUsers = creds.users.map(u => ({ id: u.id, username: u.username, displayName: u.displayName, role: u.role }));
    res.json({ success: true, users: safeUsers });
  } else {
    res.status(500).json({ error: 'Erreur enregistrement utilisateur.' });
  }
});

app.delete('/api/users/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const creds = readJson(CREDS_FILE, { users: [] });
  if ((creds.users || []).length <= 1) {
    return res.status(400).json({ error: 'Impossible de supprimer le dernier compte administrateur.' });
  }

  creds.users = (creds.users || []).filter(u => u.id !== id);
  if (writeJson(CREDS_FILE, creds)) {
    const safeUsers = creds.users.map(u => ({ id: u.id, username: u.username, displayName: u.displayName, role: u.role }));
    res.json({ success: true, users: safeUsers });
  } else {
    res.status(500).json({ error: 'Erreur suppression utilisateur.' });
  }
});

// ─── Fichiers Statiques (Site Web & Admin) ────────────
app.use(express.static(path.join(__dirname)));

// Route de secours vers index.html (compatible Express 4 et 5)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ─── Démarrage du serveur ────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 RECUP CULTURE – Serveur démarré`);
  console.log(`🌐 Port : ${PORT}`);
  console.log(`🏠 Site Public  : http://localhost:${PORT}`);
  console.log(`🔒 Administration: http://localhost:${PORT}/admin.html`);
  console.log(`====================================================`);
});
