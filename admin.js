/* ====================================================
   RECUP CULTURE – Admin JS
   Auth SHA-256, WYSIWYG Quill, Leaflet, CRUD
   ==================================================== */

(function () {
  'use strict';

  // ─── Constantes ──────────────────────────────────────
  const LS_DATA  = 'recupculture_data';
  const LS_CREDS = 'recupculture_credentials';
  const LS_SESSION = 'recupculture_session';

  // ─── Utilitaires DOM ─────────────────────────────────
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  function escapeHtml(s) {
    if (typeof s !== 'string') return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ─── SHA-256 (Web Crypto API) ────────────────────────
  async function sha256(str) {
    const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  // ─── Toasts ──────────────────────────────────────────
  function toast(msg, isError = false) {
    const c = $('#toastContainer');
    const el = document.createElement('div');
    el.className = 'toast' + (isError ? ' error' : '');
    el.innerHTML = `<i class="fas fa-${isError ? 'exclamation-circle' : 'check-circle'}" aria-hidden="true"></i><span>${escapeHtml(msg)}</span>`;
    c.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; el.style.transition = '0.3s'; setTimeout(() => el.remove(), 300); }, 3500);
  }

  // ─── DONNÉES PAR DÉFAUT (Fonctionnement garanti y compris sous file://) ───
  const DEFAULT_DATA = {
    collectPoints: [
      { id: 1, name: "Nous Anti Gaspi", address: "Dinard, 35800", description: "Point de dépôt partenaire – déposez vos livres, CD, DVD et jeux vidéo", hours: "Selon horaires du magasin", lat: 48.6353, lng: -2.0601 },
      { id: 2, name: "Coop Bio de l'Espérance", address: "Saint-Malo, 35400", description: "Point de dépôt partenaire – déposez vos livres, CD, DVD et jeux vidéo", hours: "Selon horaires du magasin", lat: 48.6493, lng: -2.0260 },
      { id: 3, name: "Déchèterie de Saint-Malo", address: "Saint-Malo, 35400", description: "Point de dépôt en déchèterie – évitez l'incinération, donnez une seconde vie !", hours: "Selon horaires de la déchèterie", lat: 48.6540, lng: -1.9800 }
    ],
    news: [
      { id: 1, title: "Ouverture boutique – Octobre 2025", category: "boutique", date: "2025-10-11", content: "<p>La boutique <strong>Halle aux Artistes</strong> vous accueille le <strong>2ème week-end d'octobre</strong> (11 & 12 octobre 2025) à Châteauneuf-d'Ille-et-Vilaine.</p><p>Venez chiner des livres, CD, DVD et jeux vidéo à prix solidaire !</p>" }
    ]
  };

  const DEFAULT_CREDS = {
    users: [
      {
        id: 1,
        username: "admin",
        passwordHash: "759ba3c7dd186752103946686a029b63f146d55073ccc2f9f3aa9c11d5393d03",
        role: "admin",
        createdAt: "2025-01-01T00:00:00.000Z"
      }
    ]
  };

  let appData = JSON.parse(JSON.stringify(DEFAULT_DATA));
  let credentials = JSON.parse(JSON.stringify(DEFAULT_CREDS));

  async function loadData() {
    // Data
    const d = localStorage.getItem(LS_DATA);
    if (d) {
      try {
        const parsed = JSON.parse(d);
        if (parsed && Array.isArray(parsed.collectPoints)) appData = parsed;
      } catch(_) {}
    } else {
      try {
        const r = await fetch('data/config.json');
        if (r.ok) {
          const json = await r.json();
          if (json && Array.isArray(json.collectPoints)) appData = json;
        }
      } catch(_) {}
    }
    // Credentials
    const cr = localStorage.getItem(LS_CREDS);
    if (cr) {
      try {
        const parsed = JSON.parse(cr);
        if (parsed && Array.isArray(parsed.users)) credentials = parsed;
      } catch(_) {}
    } else {
      try {
        const r = await fetch('data/credentials.json');
        if (r.ok) {
          credentials = await r.json();
          saveCredentials();
        }
      } catch(_) {}
    }
  }

  function saveData() {
    localStorage.setItem(LS_DATA, JSON.stringify(appData));
  }
  function saveCredentials() {
    localStorage.setItem(LS_CREDS, JSON.stringify(credentials));
  }

  // ─── SESSION ─────────────────────────────────────────
  let currentUser = null;

  function getSession() {
    const s = sessionStorage.getItem(LS_SESSION);
    if (!s) return null;
    try { return JSON.parse(s); } catch(_) { return null; }
  }
  function setSession(user) {
    sessionStorage.setItem(LS_SESSION, JSON.stringify({ username: user.username, displayName: user.displayName, role: user.role }));
    currentUser = user;
  }
  function clearSession() {
    sessionStorage.removeItem(LS_SESSION);
    currentUser = null;
  }

  // ─── AUTH ─────────────────────────────────────────────
  async function tryLogin(username, password) {
    const hash = await sha256(password);
    const user = credentials.users.find(u => u.username === username && u.passwordHash === hash);
    return user || null;
  }

  function showLoginScreen() {
    $('#loginScreen').classList.remove('hidden');
    $('#adminPanel').classList.remove('visible');
  }
  function showAdminPanel(user) {
    $('#loginScreen').classList.add('hidden');
    $('#adminPanel').classList.add('visible');
    $('#adminDisplayName').textContent = user.displayName || user.username;
    $('#adminAvatar').innerHTML = `<i class="fas fa-user" aria-hidden="true"></i>`;
  }

  function initAuth() {
    const form = $('#loginForm');
    const err  = $('#loginError');
    const msg  = $('#loginErrorMsg');
    const btn  = $('#loginBtn');

    // Check existing session
    const session = getSession();
    if (session) {
      const user = credentials.users.find(u => u.username === session.username);
      if (user) { currentUser = user; showAdminPanel(user); initAdmin(); return; }
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const uname = $('#loginUsername').value.trim();
      const pwd   = $('#loginPassword').value;
      if (!uname || !pwd) return;

      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion…';
      err.classList.remove('show');

      const user = await tryLogin(uname, pwd);
      if (user) {
        setSession(user);
        showAdminPanel(user);
        initAdmin();
      } else {
        msg.textContent = 'Identifiant ou mot de passe incorrect.';
        err.classList.add('show');
        $('#loginPassword').value = '';
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Se connecter';
      }
    });

    $('#logoutBtn').addEventListener('click', () => {
      if (confirm('Voulez-vous vous déconnecter ?')) {
        clearSession();
        // Reset UI
        $('#adminPanel').classList.remove('visible');
        $('#loginScreen').classList.remove('hidden');
        if (adminMap) { adminMap.remove(); adminMap = null; }
        quill = null;
        $('#loginForm').reset();
        $('#loginError').classList.remove('show');
        $('#loginBtn').disabled = false;
        $('#loginBtn').innerHTML = '<i class="fas fa-sign-in-alt"></i> Se connecter';
      }
    });

    $('#viewSiteBtn').addEventListener('click', () => window.open('index.html','_blank'));
  }

  // ─── NAVIGATION ADMIN ────────────────────────────────
  let currentSection = 'news';

  function initSidebar() {
    $$('.sidebar-item[data-section]').forEach(item => {
      item.addEventListener('click', () => switchSection(item.dataset.section));
      item.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') switchSection(item.dataset.section); });
    });
  }

  function switchSection(name) {
    currentSection = name;
    $$('.sidebar-item').forEach(i => i.classList.remove('active'));
    $$('.admin-section').forEach(s => s.classList.remove('active'));
    const item = $(`.sidebar-item[data-section="${name}"]`);
    if (item) { item.classList.add('active'); item.setAttribute('aria-current','page'); }
    const sec = $(`#section-${name}`);
    if (sec) sec.classList.add('active');

    if (name === 'map') initAdminMap();
  }

  // ─── QUILL WYSIWYG ──────────────────────────────────
  let quill = null;

  function initQuill() {
    if (quill) return;
    quill = new Quill('#newsEditor', {
      theme: 'snow',
      placeholder: 'Rédigez votre article ici…',
      modules: {
        toolbar: [
          [{ header: [2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link'],
          ['clean']
        ]
      }
    });
  }

  // ─── ACTUALITÉS ──────────────────────────────────────
  const CATS = { boutique:'Boutique', evenement:'Événement', actualite:'Actualité' };

  function formatDate(ds) {
    if (!ds) return '';
    const d = new Date(ds);
    return isNaN(d) ? ds : d.toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });
  }

  function renderNewsTable() {
    const tbody = $('#newsTableBody');
    const count = $('#newsCount');
    const news  = appData.news || [];
    count.textContent = `${news.length} article(s)`;

    if (!news.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="table-empty"><i class="fas fa-newspaper" aria-hidden="true"></i>Aucun article.</td></tr>`;
      return;
    }

    tbody.innerHTML = news.slice().sort((a,b) => new Date(b.date)-new Date(a.date)).map(item => `
      <tr>
        <td><strong>${escapeHtml(item.title)}</strong></td>
        <td><span class="badge badge-${item.category}">${escapeHtml(CATS[item.category]||item.category)}</span></td>
        <td>${formatDate(item.date)}</td>
        <td>
          <div class="actions">
            <button class="btn btn-warning btn-sm" onclick="adminApp.editNews(${item.id})" aria-label="Modifier l'article">
              <i class="fas fa-edit" aria-hidden="true"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="adminApp.deleteNews(${item.id})" aria-label="Supprimer l'article">
              <i class="fas fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function openNewsModal(item = null) {
    initQuill();
    const modal = $('#modalNews');
    const title = $('#modalNewsTitle');

    if (item) {
      title.textContent = 'Modifier l\'article';
      $('#newsId').value = item.id;
      $('#newsTitle').value = item.title || '';
      $('#newsCategory').value = item.category || 'actualite';
      $('#newsDate').value = item.date || '';
      quill.root.innerHTML = item.content || '';
    } else {
      title.textContent = 'Nouvel article';
      $('#newsId').value = '';
      $('#newsForm').reset();
      quill.root.innerHTML = '';
      // Date par défaut = aujourd'hui
      $('#newsDate').value = new Date().toISOString().split('T')[0];
    }
    modal.classList.add('open');
    $('#newsTitle').focus();
  }

  function closeNewsModal() { $('#modalNews').classList.remove('open'); }

  function initNewsSection() {
    $('#btnAddNews').addEventListener('click', () => openNewsModal());
    $('#modalNewsClose').addEventListener('click', closeNewsModal);
    $('#modalNewsCancelBtn').addEventListener('click', closeNewsModal);
    $('#modalNews').addEventListener('click', e => { if(e.target===$('#modalNews')) closeNewsModal(); });

    $('#newsForm').addEventListener('submit', e => {
      e.preventDefault();
      const title = $('#newsTitle').value.trim();
      const cat   = $('#newsCategory').value;
      const date  = $('#newsDate').value;
      const content = quill ? quill.root.innerHTML : '';

      if (!title || !date) { toast('Veuillez remplir les champs obligatoires.', true); return; }

      const id = parseInt($('#newsId').value) || null;
      if (id) {
        const idx = (appData.news||[]).findIndex(n => n.id===id);
        if (idx > -1) { appData.news[idx] = { id, title, category:cat, date, content }; }
      } else {
        if (!appData.news) appData.news = [];
        const newId = Date.now();
        appData.news.push({ id:newId, title, category:cat, date, content });
      }

      saveData();
      renderNewsTable();
      closeNewsModal();
      toast(id ? 'Article modifié avec succès.' : 'Article créé avec succès.');
    });
  }

  // ─── CARTE ADMIN ─────────────────────────────────────
  let adminMap = null;
  let adminMarkers = [];
  let pendingClick = null; // marker temporaire pour nouveau point

  function initAdminMap() {
    if (adminMap) { adminMap.invalidateSize(); return; }

    adminMap = L.map('adminMap', {
      center: [48.644, -2.010],
      zoom: 12,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20
    }).addTo(adminMap);

    renderAdminMapPoints();

    // Clic sur la carte → pré-remplir les coords dans le modal
    adminMap.on('click', e => {
      const { lat, lng } = e.latlng;

      // Marqueur temporaire
      if (pendingClick) adminMap.removeLayer(pendingClick);
      pendingClick = L.marker([lat, lng]).addTo(adminMap)
        .bindPopup('Nouveau point (non enregistré)').openPopup();

      // Ouvrir le modal pré-rempli
      openPointModal(null, lat.toFixed(6), lng.toFixed(6));
    });
  }

  function getAdminIcon(color='#2e7d32') {
    return L.divIcon({
      className:'',
      html:`<div style="width:30px;height:30px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 8px rgba(0,0,0,0.3);border:2px solid white"></div>`,
      iconSize:[30,30],iconAnchor:[15,30],popupAnchor:[0,-34]
    });
  }

  function renderAdminMapPoints() {
    if (!adminMap) return;
    adminMarkers.forEach(m => adminMap.removeLayer(m));
    adminMarkers = [];
    renderPointsTable();

    (appData.collectPoints||[]).forEach(pt => {
      if(!pt.lat||!pt.lng) return;
      const m = L.marker([pt.lat,pt.lng], {icon:getAdminIcon()})
        .addTo(adminMap)
        .bindPopup(`<strong>${escapeHtml(pt.name)}</strong><br><small>${escapeHtml(pt.address||'')}</small>`);
      adminMarkers.push(m);
    });
  }

  function renderPointsTable() {
    const tbody = $('#pointsTableBody');
    const count = $('#pointsCount');
    const pts   = appData.collectPoints || [];
    count.textContent = `${pts.length} point(s)`;

    if (!pts.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="table-empty"><i class="fas fa-map-marked-alt" aria-hidden="true"></i>Aucun point.</td></tr>`;
      return;
    }
    tbody.innerHTML = pts.map(pt => `
      <tr>
        <td><strong>${escapeHtml(pt.name)}</strong></td>
        <td>${escapeHtml(pt.address||'')}</td>
        <td style="font-size:0.8rem;color:var(--gray-500)">${pt.lat?.toFixed?.(4)||''}  /  ${pt.lng?.toFixed?.(4)||''}</td>
        <td>
          <div class="actions">
            <button class="btn btn-warning btn-sm" onclick="adminApp.editPoint(${pt.id})" aria-label="Modifier">
              <i class="fas fa-edit" aria-hidden="true"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="adminApp.deletePoint(${pt.id})" aria-label="Supprimer">
              <i class="fas fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function openPointModal(pt = null, preLat = '', preLng = '') {
    const modal = $('#modalPoint');
    const title = $('#modalPointTitle');

    if (pt) {
      title.textContent = 'Modifier le point';
      $('#pointId').value = pt.id;
      $('#pointName').value = pt.name || '';
      $('#pointAddress').value = pt.address || '';
      $('#pointDesc').value = pt.description || '';
      $('#pointHours').value = pt.hours || '';
      $('#pointLat').value = pt.lat || '';
      $('#pointLng').value = pt.lng || '';
    } else {
      title.textContent = 'Nouveau point de collecte';
      $('#pointId').value = '';
      $('#pointForm').reset();
      if (preLat) $('#pointLat').value = preLat;
      if (preLng) $('#pointLng').value = preLng;
    }
    modal.classList.add('open');
    $('#pointName').focus();
  }

  function closePointModal() {
    $('#modalPoint').classList.remove('open');
    if (pendingClick) { adminMap && adminMap.removeLayer(pendingClick); pendingClick = null; }
  }

  function initMapSection() {
    $('#btnAddPoint').addEventListener('click', () => openPointModal());
    $('#modalPointClose').addEventListener('click', closePointModal);
    $('#modalPointCancelBtn').addEventListener('click', closePointModal);
    $('#modalPoint').addEventListener('click', e => { if(e.target===$('#modalPoint')) closePointModal(); });

    // Sync coords → preview sur la carte au fil de la saisie
    ['pointLat','pointLng'].forEach(id => {
      $(id) && $(id) === null || document.getElementById(id)?.addEventListener('input', () => {
        const lat = parseFloat($('#pointLat').value);
        const lng = parseFloat($('#pointLng').value);
        if (!isNaN(lat) && !isNaN(lng) && adminMap) {
          if (pendingClick) adminMap.removeLayer(pendingClick);
          pendingClick = L.marker([lat,lng]).addTo(adminMap).bindPopup('Position').openPopup();
          adminMap.setView([lat,lng],14);
        }
      });
    });

    $('#pointForm').addEventListener('submit', e => {
      e.preventDefault();
      const name    = $('#pointName').value.trim();
      const address = $('#pointAddress').value.trim();
      const desc    = $('#pointDesc').value.trim();
      const hours   = $('#pointHours').value.trim();
      const lat     = parseFloat($('#pointLat').value);
      const lng     = parseFloat($('#pointLng').value);

      if (!name) { toast('Le nom du lieu est obligatoire.', true); return; }
      if (isNaN(lat) || isNaN(lng)) { toast('Coordonnées GPS invalides.', true); return; }

      const id = parseInt($('#pointId').value) || null;
      const pt = { id: id||Date.now(), name, address, description:desc, hours, lat, lng };

      if (id) {
        const idx = (appData.collectPoints||[]).findIndex(p => p.id===id);
        if (idx > -1) appData.collectPoints[idx] = pt;
      } else {
        if (!appData.collectPoints) appData.collectPoints = [];
        appData.collectPoints.push(pt);
      }

      saveData();
      if (pendingClick) { adminMap && adminMap.removeLayer(pendingClick); pendingClick = null; }
      renderAdminMapPoints();
      closePointModal();
      toast(id ? 'Point modifié.' : 'Point ajouté.');
    });
  }

  // ─── UTILISATEURS ─────────────────────────────────────
  function renderUsersTable() {
    const tbody = $('#usersTableBody');
    const users = credentials.users || [];

    tbody.innerHTML = users.map(u => `
      <tr>
        <td>
          <div class="user-row">
            <div class="user-avatar-sm" aria-hidden="true"><i class="fas fa-user"></i></div>
            <div>
              <div class="user-name">${escapeHtml(u.displayName||u.username)}</div>
              <div class="user-role">@${escapeHtml(u.username)}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-boutique">${escapeHtml(u.role)}</span></td>
        <td>
          <div class="actions">
            <button class="btn btn-warning btn-sm" onclick="adminApp.editUser(${u.id})" aria-label="Modifier ${escapeHtml(u.displayName||u.username)}">
              <i class="fas fa-edit" aria-hidden="true"></i>
            </button>
            ${users.length > 1 ? `<button class="btn btn-danger btn-sm" onclick="adminApp.deleteUser(${u.id})" aria-label="Supprimer ${escapeHtml(u.displayName||u.username)}">
              <i class="fas fa-trash" aria-hidden="true"></i>
            </button>` : '<span title="Impossible de supprimer le dernier admin" style="padding:6px;color:var(--gray-300)"><i class="fas fa-lock" aria-hidden="true"></i></span>'}
          </div>
        </td>
      </tr>
    `).join('');
  }

  function openUserModal(user = null) {
    const modal = $('#modalUser');
    const title = $('#modalUserTitle');
    const pwdHint = $('#userPasswordHint');
    const pwdLabel = $('#userPasswordLabel');

    if (user) {
      title.textContent = 'Modifier l\'utilisateur';
      $('#userId').value = user.id;
      $('#userDisplayName').value = user.displayName || '';
      $('#userUsername').value = user.username || '';
      $('#userPassword').value = '';
      $('#userPassword').required = false;
      $('#userRole').value = user.role || 'superadmin';
      pwdHint.style.display = 'block';
      pwdLabel.textContent = 'Nouveau mot de passe';
    } else {
      title.textContent = 'Ajouter un utilisateur';
      $('#userId').value = '';
      $('#userForm').reset();
      $('#userPassword').required = true;
      pwdHint.style.display = 'none';
      pwdLabel.textContent = 'Mot de passe *';
    }
    modal.classList.add('open');
    $('#userDisplayName').focus();
  }

  function closeUserModal() { $('#modalUser').classList.remove('open'); }

  function initUsersSection() {
    $('#btnAddUser').addEventListener('click', () => openUserModal());
    $('#modalUserClose').addEventListener('click', closeUserModal);
    $('#modalUserCancelBtn').addEventListener('click', closeUserModal);
    $('#modalUser').addEventListener('click', e => { if(e.target===$('#modalUser')) closeUserModal(); });

    $('#userForm').addEventListener('submit', async e => {
      e.preventDefault();
      const displayName = $('#userDisplayName').value.trim();
      const username    = $('#userUsername').value.trim().toLowerCase();
      const password    = $('#userPassword').value;
      const role        = $('#userRole').value;
      const id          = parseInt($('#userId').value) || null;

      if (!displayName || !username) { toast('Veuillez remplir tous les champs obligatoires.', true); return; }
      if (!id && !password) { toast('Le mot de passe est requis pour un nouvel utilisateur.', true); return; }
      if (password && password.length < 8) { toast('Le mot de passe doit comporter au moins 8 caractères.', true); return; }

      // Vérifier unicité du username (sauf édition du même)
      const existing = credentials.users.find(u => u.username === username && u.id !== id);
      if (existing) { toast('Cet identifiant est déjà utilisé.', true); return; }

      // Soumettre en désactivant le bouton
      const submitBtn = $('#userForm').querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement…';

      const hash = password ? await sha256(password) : null;

      if (id) {
        const idx = credentials.users.findIndex(u => u.id===id);
        if (idx > -1) {
          credentials.users[idx].displayName = displayName;
          credentials.users[idx].username    = username;
          credentials.users[idx].role        = role;
          if (hash) credentials.users[idx].passwordHash = hash;
        }
      } else {
        credentials.users.push({ id: Date.now(), username, displayName, passwordHash: hash, role });
      }

      saveCredentials();
      renderUsersTable();
      closeUserModal();
      toast(id ? 'Utilisateur modifié.' : 'Utilisateur créé.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-save"></i> Enregistrer';
    });
  }

  // ─── IMPORT / EXPORT ─────────────────────────────────
  function downloadJson(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast(`${filename} téléchargé.`);
  }

  function initIOSection() {
    // Export data
    $('#btnExportData').addEventListener('click', () => downloadJson(appData, 'config.json'));

    // Export credentials
    $('#btnExportCreds').addEventListener('click', () => downloadJson(credentials, 'credentials.json'));

    // Import data
    $('#importDataFile').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data.collectPoints && !data.news) throw new Error('Format invalide');
          if (!confirm('Importer ces données ? Cela remplacera les données actuelles.')) return;
          appData = data;
          saveData();
          renderNewsTable();
          renderAdminMapPoints();
          toast('Données importées avec succès.');
        } catch (err) {
          toast('Fichier JSON invalide : ' + err.message, true);
        }
        e.target.value = '';
      };
      reader.readAsText(file);
    });

    // Reset
    $('#btnReset').addEventListener('click', () => {
      if (!confirm('⚠️ Réinitialiser toutes les données ? Cette action est irréversible.')) return;
      localStorage.removeItem(LS_DATA);
      location.reload();
    });
  }

  // ─── API publique pour les onclick HTML ───────────────
  window.adminApp = {
    editNews(id) {
      const item = (appData.news||[]).find(n => n.id===id);
      if (item) openNewsModal(item);
    },
    deleteNews(id) {
      if (!confirm('Supprimer cet article ?')) return;
      appData.news = (appData.news||[]).filter(n => n.id!==id);
      saveData();
      renderNewsTable();
      toast('Article supprimé.');
    },
    editPoint(id) {
      const pt = (appData.collectPoints||[]).find(p => p.id===id);
      if (pt) {
        switchSection('map');
        setTimeout(() => { initAdminMap(); openPointModal(pt); }, 300);
      }
    },
    deletePoint(id) {
      if (!confirm('Supprimer ce point de collecte ?')) return;
      appData.collectPoints = (appData.collectPoints||[]).filter(p => p.id!==id);
      saveData();
      renderAdminMapPoints();
      toast('Point supprimé.');
    },
    editUser(id) {
      const u = (credentials.users||[]).find(u => u.id===id);
      if (u) openUserModal(u);
    },
    deleteUser(id) {
      if (credentials.users.length <= 1) { toast('Impossible de supprimer le dernier administrateur.', true); return; }
      if (!confirm('Supprimer cet utilisateur ?')) return;
      credentials.users = credentials.users.filter(u => u.id!==id);
      saveCredentials();
      renderUsersTable();
      toast('Utilisateur supprimé.');
    }
  };

  // ─── INIT ADMIN ──────────────────────────────────────
  let adminInitialized = false;

  function initAdmin() {
    if (adminInitialized) return;
    adminInitialized = true;

    initSidebar();
    initNewsSection();
    initMapSection();
    initUsersSection();
    initIOSection();

    // Rendre les données initiales
    renderNewsTable();
    renderUsersTable();
  }

  // ─── BOOT ────────────────────────────────────────────
  async function boot() {
    await loadData();
    initAuth();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
