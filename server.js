/* ====================================================
   RECUP CULTURE – Serveur Backend Node.js / Express
   Compatible Railway, VPS, Docker, Localhost
   ==================================================== */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Emplacements des données (support des volumes Railway via auto-détection, RAILWAY_VOLUME_MOUNT_PATH ou DATA_DIR)
function resolveDataDir() {
  if (process.env.RAILWAY_VOLUME_MOUNT_PATH && fs.existsSync(process.env.RAILWAY_VOLUME_MOUNT_PATH)) {
    console.log(`[STORAGE] Volume détecté via RAILWAY_VOLUME_MOUNT_PATH : ${process.env.RAILWAY_VOLUME_MOUNT_PATH}`);
    return process.env.RAILWAY_VOLUME_MOUNT_PATH;
  }
  if (process.env.DATA_DIR && fs.existsSync(process.env.DATA_DIR)) {
    console.log(`[STORAGE] Volume détecté via DATA_DIR : ${process.env.DATA_DIR}`);
    return process.env.DATA_DIR;
  }
  // Détection automatique du volume Railway / Docker monté sur /data (Linux)
  if (process.platform !== 'win32') {
    try {
      if (fs.existsSync('/data')) {
        fs.accessSync('/data', fs.constants.W_OK);
        console.log(`[STORAGE] Volume persistant Linux /data auto-détecté et accessible en écriture.`);
        return '/data';
      }
    } catch (e) {
      console.warn(`[STORAGE] /data existe mais n'est pas accessible en écriture: ${e.message}`);
    }
  }
  const localData = path.join(__dirname, 'data');
  console.log(`[STORAGE] Utilisation du dossier local : ${localData}`);
  return localData;
}

const DATA_DIR = resolveDataDir();
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(DATA_DIR, 'uploads');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const CREDS_FILE = path.join(DATA_DIR, 'credentials.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

const BUNDLED_DATA_DIR = path.join(__dirname, 'data');
const BUNDLED_CONFIG = path.join(BUNDLED_DATA_DIR, 'config.json');
const BUNDLED_CREDS = path.join(BUNDLED_DATA_DIR, 'credentials.json');

// ─── Configuration SMTP (Relais OVH) ─────────────────
const SMTP_HOST = process.env.SMTP_HOST || 'ssl0.ovh.net';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_SECURE = process.env.SMTP_SECURE !== 'false' && (SMTP_PORT === 465 || process.env.SMTP_SECURE === 'true');
const SMTP_USER = process.env.SMTP_USER || 'info@recupculture.fr';
const SMTP_PASS = process.env.SMTP_PASS || '';
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'info@recupculture.fr';
const SUPPORT_TO_EMAIL = process.env.SUPPORT_TO_EMAIL || 'support@recupculture.fr';

function createMailTransporter() {
  if (!SMTP_PASS) {
    console.warn('[MAIL] Variable SMTP_PASS non renseignée sur le serveur. Les messages seront sauvegardés sur disque sans transmission SMTP.');
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000
  });
}

function saveMessageBackup(msg) {
  try {
    const list = readJson(MESSAGES_FILE, []);
    const messages = Array.isArray(list) ? list : [];
    messages.unshift({
      id: Date.now(),
      date: new Date().toISOString(),
      ...msg
    });
    if (messages.length > 200) messages.length = 200;
    writeJson(MESSAGES_FILE, messages);
    console.log(`[MAIL BACKUP] Message sauvegardé dans ${MESSAGES_FILE} (total : ${messages.length})`);
  } catch (err) {
    console.error('[MAIL BACKUP ERROR]', err.message);
  }
}

// Points de collecte et actualités par défaut garantis (indépendants du volume persistant)
const DEFAULT_COLLECT_POINTS = [
  {
    id: 1,
    name: "Nous Anti Gaspi",
    address: "Dinard, 35800",
    description: "Point de dépôt partenaire – déposez vos livres, CD, DVD et jeux vidéo",
    hours: "Selon horaires du magasin",
    lat: 48.6353,
    lng: -2.0601
  },
  {
    id: 2,
    name: "Coop Bio de l'Espérance",
    address: "Saint-Malo, 35400",
    description: "Point de dépôt partenaire – déposez vos livres, CD, DVD et jeux vidéo",
    hours: "Selon horaires du magasin",
    lat: 48.6493,
    lng: -2.0260
  },
  {
    id: 3,
    name: "Déchèterie de Saint-Malo",
    address: "Saint-Malo, 35400",
    description: "Point de dépôt en déchèterie – évitez l'incinération, donnez une seconde vie !",
    hours: "Selon horaires de la déchèterie",
    lat: 48.6540,
    lng: -1.9800
  }
];

const DEFAULT_NEWS = [
  {
    id: 1,
    title: "Ouverture boutique – Octobre 2025",
    category: "boutique",
    date: "2025-10-11",
    content: "<p>La boutique <strong>Halle aux Artistes</strong> vous accueille le <strong>2ème week-end d'octobre</strong> (11 & 12 octobre 2025) à Châteauneuf-d'Ille-et-Vilaine.</p><p>Venez chiner des livres, CD, DVD et jeux vidéo à prix solidaire !</p>"
  }
];

const DEFAULT_USERS = [
  {
    id: 1,
    username: "admin",
    displayName: "Administrateur",
    passwordHash: "759ba3c7dd186752103946686a029b63f146d55073ccc2f9f3aa9c11d5393d03",
    role: "superadmin"
  },
  {
    id: 2,
    username: "admin@recupculture.fr",
    displayName: "Administrateur Général",
    passwordHash: "aebc7c19bdc2aa84991dad7067e89d4aa78de2df5a9d612e4571a90a82609cef",
    role: "superadmin"
  }
];

// S'assurer que les dossiers nécessaires existent
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ─── Helpers de lecture / écriture JSON sécurisée ────
function readJson(filePath, fallback = {}) {
  try {
    if (fs.existsSync(filePath)) {
      let raw = fs.readFileSync(filePath, 'utf8');
      if (raw.charCodeAt(0) === 0xFEFF) {
        raw = raw.slice(1);
      }
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`Erreur lecture ${filePath}:`, err.message);
  }
  return fallback;
}

function writeJson(filePath, data) {
  let success = false;
  try {
    const tmp = `${filePath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, filePath);
    success = true;
  } catch (err) {
    console.warn(`[WARN] renameSync a échoué pour ${filePath} (${err.message}), tentative d'écriture directe...`);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      success = true;
    } catch (err2) {
      console.error(`[ERROR] Erreur écriture directe ${filePath}:`, err2.message);
      return false;
    }
  }

  // Si écriture dans un volume externe, répliquer aussi dans BUNDLED_CONFIG si distinct
  if (success && filePath === CONFIG_FILE && path.resolve(DATA_DIR) !== path.resolve(BUNDLED_DATA_DIR)) {
    try {
      if (fs.existsSync(BUNDLED_DATA_DIR)) {
        fs.writeFileSync(BUNDLED_CONFIG, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (_) {}
  }
  return success;
}

// ─── Initialisation robuste des données au démarrage ───
function initDataFiles() {
  try {
    let currentConfig = readJson(CONFIG_FILE, null);
    const bundledConfig = readJson(BUNDLED_CONFIG, {});
    let needsWriteConfig = false;

    if (!currentConfig || typeof currentConfig !== 'object') {
      currentConfig = JSON.parse(JSON.stringify(bundledConfig));
      needsWriteConfig = true;
    }

    if (!currentConfig.siteContent || Object.keys(currentConfig.siteContent).length === 0) {
      if (bundledConfig.siteContent && Object.keys(bundledConfig.siteContent).length > 0) {
        currentConfig.siteContent = bundledConfig.siteContent;
        needsWriteConfig = true;
      }
    } else if (bundledConfig.siteContent) {
      // Vérifier et restaurer chaque rubrique manquante
      for (const key of Object.keys(bundledConfig.siteContent)) {
        if (!currentConfig.siteContent[key] || Object.keys(currentConfig.siteContent[key]).length === 0) {
          currentConfig.siteContent[key] = bundledConfig.siteContent[key];
          needsWriteConfig = true;
        }
      }
    }

    if (!Array.isArray(currentConfig.collectPoints) || currentConfig.collectPoints.length === 0) {
      currentConfig.collectPoints = (Array.isArray(bundledConfig.collectPoints) && bundledConfig.collectPoints.length > 0)
        ? bundledConfig.collectPoints
        : JSON.parse(JSON.stringify(DEFAULT_COLLECT_POINTS));
      needsWriteConfig = true;
    }

    if (!Array.isArray(currentConfig.news) || currentConfig.news.length === 0) {
      currentConfig.news = (Array.isArray(bundledConfig.news) && bundledConfig.news.length > 0)
        ? bundledConfig.news
        : JSON.parse(JSON.stringify(DEFAULT_NEWS));
      needsWriteConfig = true;
    }

    if (needsWriteConfig) {
      writeJson(CONFIG_FILE, currentConfig);
      console.log(`[INIT] config.json synchronisé avec les données par défaut.`);
    }

    // Initialiser credentials.json s'il n'existe pas ou s'il est incomplet
    let currentCreds = readJson(CREDS_FILE, null);
    const bundledCreds = readJson(BUNDLED_CREDS, { users: DEFAULT_USERS });
    let needsWriteCreds = false;

    if (!currentCreds || !Array.isArray(currentCreds.users) || currentCreds.users.length === 0) {
      currentCreds = JSON.parse(JSON.stringify(bundledCreds));
      if (!Array.isArray(currentCreds.users) || currentCreds.users.length === 0) {
        currentCreds = { users: JSON.parse(JSON.stringify(DEFAULT_USERS)) };
      }
      needsWriteCreds = true;
    } else {
      for (const defUser of DEFAULT_USERS) {
        if (!currentCreds.users.some(u => u.username.toLowerCase() === defUser.username.toLowerCase())) {
          currentCreds.users.push(defUser);
          needsWriteCreds = true;
        }
      }
    }

    if (needsWriteCreds) {
      writeJson(CREDS_FILE, currentCreds);
      console.log(`[INIT] credentials.json initialisé et synchronisé.`);
    }

    // Copier d'éventuelles photos pré-existantes dans le dossier uploads persistant
    const bundledUploads = path.join(__dirname, 'uploads');
    if (fs.existsSync(bundledUploads) && path.resolve(bundledUploads) !== path.resolve(UPLOADS_DIR)) {
      try {
        const files = fs.readdirSync(bundledUploads);
        for (const f of files) {
          const src = path.join(bundledUploads, f);
          const dst = path.join(UPLOADS_DIR, f);
          if (!fs.existsSync(dst) && fs.statSync(src).isFile()) {
            fs.copyFileSync(src, dst);
          }
        }
      } catch (_) {}
    }
  } catch (err) {
    console.error(`[INIT] Erreur lors de l'initialisation des fichiers:`, err.message);
  }
}
initDataFiles();


function hashPassword(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

// ─── Sessions persistantes signées HMAC (survit aux redémarrages Railway) ───
const SESSION_SECRET = process.env.SESSION_SECRET || 'recupculture-session-secret-2025-bretagne';
const sessions = new Map(); // token -> { user, expiresAt } (support legacy)
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 jours

function createSession(user) {
  const safeUser = { id: user.id, username: user.username, displayName: user.displayName || user.username, role: user.role };
  const expiresAt = Date.now() + SESSION_TTL;
  const payload = { ...safeUser, expiresAt };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('hex');
  const token = `${data}.${sig}`;
  sessions.set(token, { user: safeUser, expiresAt });
  return token;
}

function getSessionUser(req) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.substring(7).trim();

  // 1. Vérification par signature cryptographique HMAC (stateless, résiste aux redémarrages)
  const dotIndex = token.indexOf('.');
  if (dotIndex > 0) {
    const data = token.substring(0, dotIndex);
    const sig = token.substring(dotIndex + 1);
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('hex');
    if (sig === expectedSig) {
      try {
        const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
        if (payload && payload.expiresAt && Date.now() <= payload.expiresAt) {
          return { id: payload.id, username: payload.username, displayName: payload.displayName, role: payload.role };
        }
      } catch (_) {}
    }
  }

  // 2. Fallback in-memory
  const sess = sessions.get(token);
  if (sess) {
    if (Date.now() > sess.expiresAt) {
      sessions.delete(token);
      return null;
    }
    return sess.user;
  }

  return null;
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
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Servir le dossier uploads pour les images publiques (volume persistant en priorité, puis uploads bundled)
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(DATA_DIR, 'uploads')));
app.use('/uploads', express.static(path.join(BUNDLED_DATA_DIR, 'uploads')));

// ─── API PUBLIQUE : Données du site ──────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: Math.round(process.uptime()), time: new Date().toISOString() });
});

app.get('/api/data', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  let config = readJson(CONFIG_FILE, null);
  const bundled = readJson(BUNDLED_CONFIG, { siteContent: {}, collectPoints: [], news: [] });
  let needsSave = false;

  if (!config || typeof config !== 'object') {
    config = JSON.parse(JSON.stringify(bundled));
    needsSave = true;
  }

  // Vérifier siteContent
  if (!config.siteContent || Object.keys(config.siteContent).length === 0) {
    if (bundled.siteContent && Object.keys(bundled.siteContent).length > 0) {
      config.siteContent = bundled.siteContent;
      needsSave = true;
    }
  } else if (bundled.siteContent) {
    for (const key of Object.keys(bundled.siteContent)) {
      if (!config.siteContent[key] || Object.keys(config.siteContent[key]).length === 0) {
        config.siteContent[key] = bundled.siteContent[key];
        needsSave = true;
      }
    }
  }

  // Vérifier collectPoints (uniquement si absent ou corrompu)
  if (!Array.isArray(config.collectPoints)) {
    config.collectPoints = (Array.isArray(bundled.collectPoints) && bundled.collectPoints.length > 0)
      ? bundled.collectPoints
      : JSON.parse(JSON.stringify(DEFAULT_COLLECT_POINTS));
    needsSave = true;
  }

  // Vérifier news (uniquement si absent ou corrompu)
  if (!Array.isArray(config.news)) {
    config.news = (Array.isArray(bundled.news) && bundled.news.length > 0)
      ? bundled.news
      : JSON.parse(JSON.stringify(DEFAULT_NEWS));
    needsSave = true;
  }

  if (needsSave) {
    writeJson(CONFIG_FILE, config);
  }

  res.json(config);
});

// ─── API CONTACT (Envoi d'e-mail via SMTP OVH) ──────
const SUBJECT_LABELS = {
  don: 'Faire un don',
  boutique: 'La boutique',
  partenariat: 'Partenariat',
  esat: 'ESAT',
  support: 'Support technique / assistance',
  autre: 'Autre demande'
};

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Le nom est requis.' });
    }
    if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Une adresse e-mail valide est requise.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Le message est requis.' });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = (subject || '').trim();
    const cleanMessage = message.trim();
    const subjectLabel = SUBJECT_LABELS[cleanSubject] || cleanSubject || 'Message général';

    // Sauvegarde de secours immédiate sur le volume persistant
    saveMessageBackup({
      name: cleanName,
      email: cleanEmail,
      subjectKey: cleanSubject,
      subjectLabel,
      message: cleanMessage
    });

    const recipient = cleanSubject === 'support' ? SUPPORT_TO_EMAIL : CONTACT_TO_EMAIL;
    const emailSubject = `[Contact depuis le site recupculture] ${subjectLabel} - ${cleanName}`;

    const textContent = `Nouveau message reçu depuis le site recupculture.fr :

Nom complet : ${cleanName}
Adresse e-mail : ${cleanEmail}
Sujet : ${subjectLabel}
Date : ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}

--------------------------------------------------
Message :
${cleanMessage}
--------------------------------------------------

Vous pouvez répondre directement à cet e-mail pour écrire à ${cleanName} (${cleanEmail}).`;

    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
    .header h2 { margin: 0; font-size: 1.3rem; color: #8ce44c; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0; font-size: 0.9rem; color: #94a3b8; }
    .content { padding: 24px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .meta-table td { padding: 8px 12px; font-size: 0.95rem; border-bottom: 1px solid #f1f5f9; }
    .meta-table td.label { font-weight: 600; color: #64748b; width: 140px; }
    .message-box { background: #f8fafc; border-left: 4px solid #8ce44c; padding: 16px; border-radius: 6px; font-size: 1rem; white-space: pre-wrap; color: #334155; margin-top: 10px; }
    .footer { padding: 16px 24px; background: #f1f5f9; font-size: 0.85rem; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>RECUP CULTURE</h2>
      <p>Nouveau message reçu depuis le formulaire de contact du site</p>
    </div>
    <div class="content">
      <table class="meta-table">
        <tr>
          <td class="label">Expéditeur :</td>
          <td><strong>${cleanName}</strong></td>
        </tr>
        <tr>
          <td class="label">Adresse e-mail :</td>
          <td><a href="mailto:${cleanEmail}" style="color:#0284c7;text-decoration:none">${cleanEmail}</a></td>
        </tr>
        <tr>
          <td class="label">Sujet :</td>
          <td><span style="display:inline-block;padding:3px 10px;border-radius:12px;background:#e0f2fe;color:#0369a1;font-weight:600;font-size:0.85rem">${subjectLabel}</span></td>
        </tr>
        <tr>
          <td class="label">Date :</td>
          <td>${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</td>
        </tr>
      </table>

      <h3 style="font-size:1rem;color:#0f172a;margin:20px 0 8px">Message :</h3>
      <div class="message-box">${cleanMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>
    <div class="footer">
      💡 Cliquez sur <strong>Répondre</strong> dans votre messagerie pour répondre directement à ${cleanName} (${cleanEmail}).
    </div>
  </div>
</body>
</html>`;

    const transporter = createMailTransporter();
    let emailSent = false;
    let mailError = null;

    if (transporter) {
      try {
        console.log(`[MAIL] Tentative d'envoi SMTP vers ${SMTP_HOST}:${SMTP_PORT} (${SMTP_USER})...`);
        await transporter.sendMail({
          from: `"${cleanName} (via RECUP CULTURE)" <${SMTP_USER}>`,
          to: recipient,
          replyTo: cleanEmail,
          subject: emailSubject,
          text: textContent,
          html: htmlContent
        });
        emailSent = true;
        console.log(`[MAIL] Message envoyé avec succès vers ${recipient} pour "${cleanName}" (${cleanEmail})`);
      } catch (err) {
        mailError = err.message;
        console.error(`[MAIL ERROR] Échec lors de la transmission SMTP (${err.code || err.name}: ${err.message}).`);
        console.warn(`[MAIL INFO] Note : Sur Railway (plans Hobby/Trial), les ports SMTP sortants 465 et 587 sont bloqués par le pare-feu. Le message a bien été persisté dans ${MESSAGES_FILE} et est accessible dans le panneau d'administration.`);
      }
    } else {
      console.log(`[MAIL MOCK] SMTP_PASS non renseigné, message sauvegardé dans ${MESSAGES_FILE}`);
    }

    // Le message est 100% sécurisé et sauvegardé dans messages.json
    return res.json({
      success: true,
      emailSent,
      message: 'Votre message a bien été envoyé ! Nous vous répondrons dans les plus brefs délais.'
    });
  } catch (err) {
    console.error('[CONTACT API ERROR]', err);
    return res.status(500).json({ error: 'Erreur lors du traitement de votre message. Vous pouvez également nous écrire directement à info@recupculture.fr.' });
  }
});

// Route admin pour consulter les messages sauvegardés
app.get('/api/messages', requireAuth, (req, res) => {
  const list = readJson(MESSAGES_FILE, []);
  res.json({ messages: Array.isArray(list) ? list : [] });
});

// Route admin pour supprimer un message sauvegardé
app.delete('/api/messages/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  let list = readJson(MESSAGES_FILE, []);
  if (Array.isArray(list)) {
    list = list.filter(m => m.id !== id);
    writeJson(MESSAGES_FILE, list);
  }
  res.json({ success: true, messages: list });
});

// ─── API UPLOAD D'IMAGES ─────────────────────────────
app.post('/api/upload', requireAuth, (req, res) => {
  try {
    const rawImage = req.body?.image || req.body?.dataUrl;
    const rawFilename = req.body?.filename || req.body?.fileName;
    if (!rawImage || typeof rawImage !== 'string') {
      return res.status(400).json({ error: 'Données d\'image manquantes ou invalides.' });
    }

    // Format attendu: data:image/...;base64,... ou base64 brut
    const matches = rawImage.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let ext = '.jpg';
    let buffer;

    if (matches) {
      const mime = matches[1].toLowerCase();
      if (mime.includes('png')) ext = '.png';
      else if (mime.includes('webp')) ext = '.webp';
      else if (mime.includes('gif')) ext = '.gif';
      else if (mime.includes('svg')) ext = '.svg';
      else ext = '.jpg';

      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(rawImage, 'base64');
    }

    if (buffer.length > 15 * 1024 * 1024) {
      return res.status(400).json({ error: 'Fichier trop volumineux (maximum 15 Mo).' });
    }

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const safeBase = rawFilename ? path.parse(rawFilename).name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30) : 'photo';
    const uniqueName = `${safeBase}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    const destPath = path.join(UPLOADS_DIR, uniqueName);

    fs.writeFileSync(destPath, buffer);

    // Si UPLOADS_DIR est dans un volume externe, répliquer aussi vers bundled uploads pour secours
    const bundledUploadsDir = path.join(__dirname, 'uploads');
    if (path.resolve(UPLOADS_DIR) !== path.resolve(bundledUploadsDir)) {
      try {
        if (!fs.existsSync(bundledUploadsDir)) fs.mkdirSync(bundledUploadsDir, { recursive: true });
        fs.writeFileSync(path.join(bundledUploadsDir, uniqueName), buffer);
      } catch (_) {}
    }

    const publicUrl = `/uploads/${uniqueName}`;
    console.log(`[UPLOAD] Image enregistrée : ${destPath} -> ${publicUrl}`);

    return res.json({ success: true, url: publicUrl, filename: uniqueName, size: buffer.length });
  } catch (err) {
    console.error('Erreur upload:', err);
    return res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'image.' });
  }
});

// ─── API AUTHENTIFICATION ────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis.' });
  }

  let creds = readJson(CREDS_FILE, null);
  if (!creds || !Array.isArray(creds.users) || creds.users.length === 0) {
    creds = readJson(BUNDLED_CREDS, { users: DEFAULT_USERS });
  }

  const hash = hashPassword(password);
  const cleanUser = (username || '').trim().toLowerCase();

  let found = (creds.users || []).find(u => 
    u.username.toLowerCase() === cleanUser &&
    (u.passwordHash === hash || u.passwordHash === password)
  );

  // Authentification croisée de secours pour les identifiants d'administration (admin ou admin@recupculture.fr)
  if (!found) {
    const isMasterAdmin = (cleanUser === 'admin' || cleanUser === 'admin@recupculture.fr');
    const isMasterPassword = (
      hash === "759ba3c7dd186752103946686a029b63f146d55073ccc2f9f3aa9c11d5393d03" || // RecupCulture2025!
      hash === "aebc7c19bdc2aa84991dad7067e89d4aa78de2df5a9d612e4571a90a82609cef" || // Rc2026!Global#AdminK9
      password === "RecupCulture2025!" ||
      password === "Rc2026!Global#AdminK9"
    );
    if (isMasterAdmin && isMasterPassword) {
      found = (creds.users || []).find(u => u.username.toLowerCase() === 'admin' || u.username.toLowerCase() === 'admin@recupculture.fr') || {
        id: 1,
        username: cleanUser,
        displayName: cleanUser === 'admin' ? 'Administrateur' : 'Administrateur Général',
        role: 'superadmin'
      };
    }
  }

  if (!found) {
    console.warn(`[AUTH] Échec de connexion pour l'utilisateur "${cleanUser}"`);
    return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect.' });
  }

  console.log(`[AUTH] Connexion réussie pour "${found.username}" (${found.role})`);
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
    console.log(`[CONTENT] siteContent sauvegardé avec succès sur ${CONFIG_FILE}`);
    res.json({ success: true, siteContent: config.siteContent });
  } else {
    console.error(`[CONTENT ERROR] Impossible d'écrire sur ${CONFIG_FILE}`);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde sur le serveur.' });
  }
});

app.post('/api/config', requireAuth, (req, res) => {
  const data = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Données de configuration invalides.' });
  }

  const current = readJson(CONFIG_FILE, { siteContent: {}, collectPoints: [], news: [] });
  if (data.siteContent && typeof data.siteContent === 'object') {
    current.siteContent = { ...current.siteContent, ...data.siteContent };
  }
  if (Array.isArray(data.collectPoints)) {
    current.collectPoints = data.collectPoints;
  }
  if (Array.isArray(data.news)) {
    current.news = data.news;
  }

  if (writeJson(CONFIG_FILE, current)) {
    res.json({ success: true, config: current });
  } else {
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la configuration sur le serveur.' });
  }
});

// ─── API ADMIN : Actualités ──────────────────────────
app.post('/api/news', requireAuth, (req, res) => {
  const { id, title, category, date, content, image } = req.body || {};
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
    content: content || '',
    image: image || null
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
