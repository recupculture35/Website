/* ====================================================
   RECUP CULTURE – Admin JS
   Auth SHA-256, WYSIWYG Quill, Leaflet, CRUD
   ==================================================== */

(function () {
  'use strict';

  // ─── Constantes ──────────────────────────────────────
  const LS_DATA    = 'recupculture_data';
  const LS_CREDS   = 'recupculture_credentials';
  const LS_SESSION = 'recupculture_session';
  const LS_TOKEN   = 'recupculture_token';

  // ─── Utilitaires DOM ─────────────────────────────────
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  function escapeHtml(s) {
    if (typeof s !== 'string') return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ─── Token Auth (Serveur Node.js / Railway) ───────────
  function getAuthToken() { return localStorage.getItem(LS_TOKEN) || sessionStorage.getItem(LS_TOKEN); }
  function setAuthToken(token) {
    if (token) {
      localStorage.setItem(LS_TOKEN, token);
      sessionStorage.setItem(LS_TOKEN, token);
    }
  }
  function clearAuthToken() {
    localStorage.removeItem(LS_TOKEN);
    sessionStorage.removeItem(LS_TOKEN);
  }

  function getAuthHeaders() {
    const t = getAuthToken();
    return t ? { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  }

  // ─── SHA-256 (Web Crypto API - fallback local) ─────────
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
    siteContent: {
      hero: {
        badge: "Association solidaire d'économie circulaire & ESAT",
        subtitle: "Ensemble recyclons avec les ESAT &nbsp;·&nbsp; <strong>Livres · DVD · CD · Jeux vidéo</strong>",
        stats: [
          { num: "+15 000", label: "Articles sauvés" },
          { num: "100%", label: "Inclusion sociale & ESAT" },
          { num: "3 Dépôts", label: "Saint-Malo & Environs" }
        ]
      },
      mission: {
        tag: "Notre Mission",
        title: "Recycler, valoriser, partager la culture",
        description: "RECUP CULTURE récupère sous forme de dons des livres, DVD, CD et jeux vidéo voués à l'incinération pour leur donner une seconde vie, en partenariat avec les ESAT.",
        steps: [
          { title: "1. Collecter", desc: "Nous recueillons vos livres, DVD, CD et jeux vidéo dans nos points de dépôt partenaires autour de Saint-Malo et Dinard." },
          { title: "2. Trier", desc: "En partenariat avec l'ESAT de Châteauneuf, les articles sont triés, sélectionnés et conditionnés — une activité valorisante et inclusive." },
          { title: "3. Donner une vie", desc: "Revente solidaire, recyclage papier ou don humanitaire — chaque objet trouve sa meilleure destination." }
        ]
      },
      collecte: {
        tag: "Nous collectons",
        title: "Qu'est-ce que vous pouvez donner ?",
        description: "Tous vos biens culturels en bon état, voués à prendre la poussière ou à finir à la benne.",
        items: [
          { title: "Livres", desc: "Romans, bandes dessinées, documentaires, livres jeunesse… Toutes catégories, en bon état." },
          { title: "CD", desc: "Albums, compilations, musiques du monde — offrez une deuxième écoute à vos disques." },
          { title: "DVD & Blu-ray", desc: "Films, séries, documentaires — partagez vos soirées cinéma avec d'autres familles." },
          { title: "Jeux vidéo", desc: "Toutes consoles et générations — vos aventures virtuelles attendent de nouveaux joueurs." }
        ]
      },
      impact: {
        tag: "Notre Impact",
        title: "Ce que deviennent vos dons",
        description: "Pour chaque lot de 10 000 livres collectés, voici leur destination :",
        items: [
          { percent: 50, title: "Revente", desc: "Boutique solidaire & en ligne — accès à la culture à prix abordable", icon: "fa-store", color: "#8ce44c", active: true },
          { percent: 30, title: "Recyclage", desc: "Transformation en papier recyclé — zéro déchet pour la planète", icon: "fa-recycle", color: "#38bdf8", active: true },
          { percent: 20, title: "Humanitaire", desc: "Dons à des causes humanitaires — la culture au-delà des frontières", icon: "fa-globe-africa", color: "#f59e0b", active: true }
        ]
      },
      boutique: {
        tag: "Notre Boutique",
        title: "La Halle aux Artistes",
        lead: "Venez chiner et repartir avec vos nouvelles trouvailles culturelles à prix solidaire !",
        address: "3 place du Martray\nChâteauneuf-d'Ille-et-Vilaine",
        hours: "2ème week-end de chaque mois",
        prices: "Livres dès 0,50€ · DVD dès 1€ · CD dès 0,50€",
        photo: ""
      },
      esat: {
        tag: "Partenariat Solidaire & Social",
        title: "Notre Partenariat avec les ESAT",
        description: "L'économie circulaire au service de l'inclusion des personnes en situation de handicap.",
        partnerName: "ESAT de Châteauneuf-d'Ille-et-Vilaine",
        partnerDesc: "Le tri, le contrôle qualité et le reconditionnement de l'ensemble des biens culturels collectés sont réalisés par les travailleurs de l'ESAT, leur offrant une activité valorisante et stimulante.",
        photo: "",
        items: [
          { title: "Activité valorisante", desc: "Le tri des articles collectés est réalisé par les travailleurs de l'ESAT de Châteauneuf — une activité concrète et valorisante pour des personnes en situation de handicap." },
          { title: "Économie circulaire", desc: "En associant l'inclusion sociale et le réemploi culturel, RECUP CULTURE crée un modèle innovant où l'écologie et le social avancent ensemble." },
          { title: "Impact territorial", desc: "Ancrée dans le bassin de Saint-Malo, notre association soutient l'économie locale et crée des liens entre différents acteurs du territoire." }
        ]
      },
      equipe: {
        tag: "L'Équipe",
        title: "Les fondateurs",
        description: "Deux passionnés engagés pour une culture accessible et un monde plus solidaire.",
        members: [
          { name: "Fabien Lemoine", role: "Co-fondateur", bio: "15 ans d'expérience dans le domaine du patrimoine culturel. Passionné par la préservation et le partage de la culture sous toutes ses formes.", photo: "" },
          { name: "François-Xavier Mahoïc", role: "Co-fondateur", bio: "Plus de 15 ans d'expérience dans l'accompagnement des ESAT et du handicap psychique. Convaincu que l'inclusion sociale est un levier de transformation.", photo: "" }
        ]
      },
      contact: {
        tag: "Contact",
        title: "Vous avez une question ?",
        description: "Nous sommes disponibles pour tout renseignement sur nos points de collecte, notre boutique ou notre association.",
        email: "info@recupculture.fr",
        supportEmail: "support@recupculture.fr",
        instagram: "@RECUPCULTURE sur Instagram",
        facebook: "@RECUPCULTURE sur Facebook",
        website: "recupculture.fr"
      }
    },
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

  // Helper pour fusionner en profondeur sans écraser par du vide
  function deepMerge(target, source) {
    if (!source || typeof source !== 'object') return target;
    const output = JSON.parse(JSON.stringify(target || {}));
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (Object.keys(source[key]).length === 0 && output[key] && Object.keys(output[key]).length > 0) {
          continue;
        }
        output[key] = deepMerge(output[key] || {}, source[key]);
      } else if (Array.isArray(source[key])) {
        // Si le tableau source est vide mais que la cible a des éléments par défaut, ne pas écraser
        if (source[key].length === 0 && Array.isArray(output[key]) && output[key].length > 0) {
          continue;
        }
        output[key] = source[key];
      } else if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
        output[key] = source[key];
      }
    }
    return output;
  }

  let appData = JSON.parse(JSON.stringify(DEFAULT_DATA));
  let credentials = JSON.parse(JSON.stringify(DEFAULT_CREDS));

  async function loadData() {
    // 1. Tenter l'API backend (/api/data)
    let dataLoaded = false;
    try {
      const res = await fetch('/api/data', { cache: 'no-cache' });
      if (res.ok) {
        const json = await res.json();
        if (json && (Array.isArray(json.collectPoints) || json.siteContent || Array.isArray(json.news))) {
          appData = deepMerge(DEFAULT_DATA, json);
          dataLoaded = true;
        }
      }
    } catch (_) {}

    // 2. Vérifier le cache localStorage
    if (!dataLoaded) {
      const d = localStorage.getItem(LS_DATA);
      if (d) {
        try {
          const parsed = JSON.parse(d);
          if (parsed && (Array.isArray(parsed.collectPoints) || parsed.siteContent || Array.isArray(parsed.news))) {
            appData = deepMerge(DEFAULT_DATA, parsed);
            dataLoaded = true;
          }
        } catch(_) {}
      }
    }

    // 3. Fallback direct vers data/config.json
    if (!dataLoaded) {
      try {
        const r = await fetch('data/config.json');
        if (r.ok) {
          const json = await r.json();
          if (json && (Array.isArray(json.collectPoints) || json.siteContent || Array.isArray(json.news))) {
            appData = deepMerge(DEFAULT_DATA, json);
          }
        }
      } catch(_) {}
    }

    // Sécurisation stricte : garantir que rien n'est vide
    if (!appData.siteContent || Object.keys(appData.siteContent).length === 0) {
      appData.siteContent = JSON.parse(JSON.stringify(DEFAULT_DATA.siteContent));
    }
    if (!Array.isArray(appData.collectPoints) || appData.collectPoints.length === 0) {
      appData.collectPoints = JSON.parse(JSON.stringify(DEFAULT_DATA.collectPoints));
    }
    if (!Array.isArray(appData.news) || appData.news.length === 0) {
      appData.news = JSON.parse(JSON.stringify(DEFAULT_DATA.news));
    }
    saveData();

    // Utilisateurs
    const token = getAuthToken();
    if (token) {
      try {
        const rUsers = await fetch('/api/users', { headers: getAuthHeaders() });
        if (rUsers.ok) {
          const jsonUsers = await rUsers.json();
          if (jsonUsers && Array.isArray(jsonUsers.users)) {
            credentials.users = jsonUsers.users;
            saveCredentials();
          }
        }
      } catch (_) {}
    }

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
    const s = localStorage.getItem(LS_SESSION) || sessionStorage.getItem(LS_SESSION);
    if (!s) return null;
    try { return JSON.parse(s); } catch(_) { return null; }
  }
  function setSession(user) {
    const data = JSON.stringify({ username: user.username, displayName: user.displayName, role: user.role });
    localStorage.setItem(LS_SESSION, data);
    sessionStorage.setItem(LS_SESSION, data);
    currentUser = user;
  }
  function clearSession() {
    const token = getAuthToken();
    if (token) {
      try { fetch('/api/auth/logout', { method: 'POST', headers: getAuthHeaders() }); } catch (_) {}
    }
    clearAuthToken();
    localStorage.removeItem(LS_SESSION);
    sessionStorage.removeItem(LS_SESSION);
    currentUser = null;
  }

  // ─── AUTH ─────────────────────────────────────────────
  async function tryLogin(username, password) {
    // 1. Tenter l'API backend (/api/auth/login)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.token && json.user) {
          setAuthToken(json.token);
          return json.user;
        }
      }
    } catch (_) {
      // Backend non accessible -> fallback local
    }

    // 2. Fallback local avec Web Crypto SHA-256
    const hash = await sha256(password);
    const user = credentials.users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      (u.passwordHash === hash || u.passwordHash === password)
    );
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
    const token = getAuthToken();
    if (session) {
      if (!token) {
        console.warn('Session trouvée mais token absent : reconnexion requise pour sauvegarder sur le serveur');
        clearSession();
        showLoginScreen();
        return;
      }
      const user = credentials.users.find(u => u.username === session.username) || session;
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

    $$('.mobile-nav-btn[data-section]').forEach(btn => {
      btn.addEventListener('click', () => switchSection(btn.dataset.section));
    });
  }

  function switchSection(name, targetTab) {
    currentSection = name;
    $$('.sidebar-item').forEach(i => i.classList.remove('active'));
    $$('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
    $$('.admin-section').forEach(s => s.classList.remove('active'));

    // Support si jamais 'esat' ou 'equipe' est demandé directement
    if (name === 'esat' || name === 'equipe') {
      targetTab = targetTab || name;
      name = 'content';
    }

    const item = $(`.sidebar-item[data-section="${name}"]`);
    if (item) { item.classList.add('active'); item.setAttribute('aria-current','page'); }
    const mobBtn = $(`.mobile-nav-btn[data-section="${name}"]`);
    if (mobBtn) { mobBtn.classList.add('active'); }

    const sec = $(`#section-${name}`);
    if (sec) sec.classList.add('active');

    if (name === 'map') {
      initAdminMap();
      renderAdminMapPoints();
    }
    if (name === 'content') {
      populateContentForm();
      if (targetTab) {
        switchCmsTab(targetTab);
      }
    }
  }

  function switchCmsTab(tabName) {
    $$('.cms-tab').forEach(t => t.classList.remove('active'));
    $$('.cms-pane').forEach(p => p.classList.remove('active'));
    const tab = $(`.cms-tab[data-tab="${tabName}"]`);
    const pane = $(`#pane-${tabName}`);
    if (tab) {
      tab.classList.add('active');
      tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    if (pane) {
      pane.classList.add('active');
    }
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
      const img = item.image || '';
      if ($('#newsPhoto')) $('#newsPhoto').value = img;
      updatePhotoPreviewBox($('#newsPhotoPreview'), img);
      if ($('#btnRemoveNewsPhoto')) $('#btnRemoveNewsPhoto').style.display = img ? 'inline-flex' : 'none';
    } else {
      title.textContent = 'Nouvel article';
      $('#newsId').value = '';
      $('#newsForm').reset();
      quill.root.innerHTML = '';
      // Date par défaut = aujourd'hui
      $('#newsDate').value = new Date().toISOString().split('T')[0];
      if ($('#newsPhoto')) $('#newsPhoto').value = '';
      updatePhotoPreviewBox($('#newsPhotoPreview'), '');
      if ($('#btnRemoveNewsPhoto')) $('#btnRemoveNewsPhoto').style.display = 'none';
    }
    modal.classList.add('open');
    $('#newsTitle').focus();
  }

  function closeNewsModal() { $('#modalNews').classList.remove('open'); }

  // ─── GESTION DES UPLOADS D'IMAGES ─────────────────────
  async function uploadImageFile(file) {
    if (!file) return null;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target.result;
        const token = getAuthToken();
        if (token) {
          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({
                image: dataUrl,
                dataUrl: dataUrl,
                filename: file.name,
                fileName: file.name
              })
            });
            if (res.ok) {
              const json = await res.json();
              if (json && json.url) {
                return resolve(json.url);
              }
            }
          } catch (err) {
            console.warn('API Upload inaccessible, fallback dataUrl:', err);
          }
        }
        resolve(dataUrl);
      };
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier image'));
      reader.readAsDataURL(file);
    });
  }

  function updatePhotoPreviewBox(previewEl, photoUrl, isRound = false) {
    if (!previewEl) return;
    if (photoUrl) {
      previewEl.innerHTML = `<img src="${escapeHtml(photoUrl)}" alt="Aperçu" style="width:100%;height:100%;object-fit:cover;${isRound ? 'border-radius:50%;' : ''}">`;
    } else {
      previewEl.innerHTML = `<i class="fas fa-image" style="font-size:1.6rem;margin-bottom:6px"></i><span>Aucune photo</span>`;
    }
  }

  // Équipe dynamique state
  // ─── GESTION DYNAMIQUE DES PARTS D'IMPACT ───────────
  let currentImpactItems = [];

  function updateImpactTotalBadge() {
    const badge = $('#impactTotalBadge');
    if (!badge) return;
    const activeItems = currentImpactItems.filter(it => it.active !== false);
    const total = activeItems.reduce((acc, it) => acc + (parseFloat(it.percent) || 0), 0);
    const roundedTotal = Math.round(total * 10) / 10;

    if (roundedTotal === 100) {
      badge.className = 'impact-total-badge optimal';
      badge.innerHTML = `<i class="fas fa-check-circle"></i> Total actif : ${roundedTotal}% (${activeItems.length} part(s) active(s))`;
    } else {
      badge.className = 'impact-total-badge warning';
      badge.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Total actif : ${roundedTotal}% (Cible idéale : 100%)`;
    }
  }

  function syncImpactItemsFromDom() {
    currentImpactItems = currentImpactItems.map((it, idx) => {
      const pVal = $(`#impactPercent_${idx}`)?.value;
      const p = parseFloat(pVal);
      return {
        ...it,
        percent: !isNaN(p) ? p : (it.percent || 0),
        title: $(`#impactTitle_${idx}`) ? $(`#impactTitle_${idx}`).value.trim() : (it.title || ''),
        desc: $(`#impactDesc_${idx}`) ? $(`#impactDesc_${idx}`).value.trim() : (it.desc || ''),
        icon: $(`#impactIcon_${idx}`) ? $(`#impactIcon_${idx}`).value : (it.icon || 'fa-chart-pie'),
        active: $(`#impactActive_${idx}`) ? $(`#impactActive_${idx}`).checked : (it.active !== false)
      };
    });
  }

  function renderImpactItemsAdmin() {
    const list = $('#impactItemsList');
    if (!list) return;
    list.innerHTML = '';

    if (!currentImpactItems.length) {
      list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--gray-400);background:rgba(255,255,255,0.02);border-radius:8px;border:1px dashed var(--gray-700)">Aucune part configurée. Cliquez sur "Ajouter une part" pour commencer.</div>';
      updateImpactTotalBadge();
      return;
    }

    const PRESET_COLORS = ['#8ce44c', '#38bdf8', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6'];
    const PRESET_ICONS = [
      { id: 'fa-store', label: 'Boutique / Revente' },
      { id: 'fa-recycle', label: 'Recyclage / Écologie' },
      { id: 'fa-globe-africa', label: 'Humanitaire / Solidarité' },
      { id: 'fa-book-reader', label: 'Lecture / Éducation' },
      { id: 'fa-hands-helping', label: 'Partenariat / Entraide' },
      { id: 'fa-heart', label: 'Cœur / Don' },
      { id: 'fa-boxes', label: 'Stock / Logistique' },
      { id: 'fa-seedling', label: 'Environnement' }
    ];

    currentImpactItems.forEach((item, index) => {
      const card = document.createElement('div');
      const isActive = item.active !== false;
      card.className = `impact-item-admin-card ${isActive ? '' : 'inactive'}`;
      card.dataset.index = index;

      const color = item.color || PRESET_COLORS[index % PRESET_COLORS.length];
      item.color = color;
      const icon = item.icon || 'fa-chart-pie';

      card.innerHTML = `
        <div class="impact-item-header">
          <div class="impact-item-title-badge">
            <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${color};box-shadow:0 0 6px ${color}88"></span>
            <span>Part #${index + 1} &nbsp;—&nbsp; <strong id="impactCardTitleText_${index}">${escapeHtml(item.title || 'Nouvelle part')}</strong></span>
            <span id="impactCardPercentBadge_${index}" style="font-size:0.8rem;padding:2px 8px;border-radius:10px;background:rgba(0,0,0,0.06);color:var(--gray-600);font-weight:600">
              ${item.percent || 0}%
            </span>
          </div>
          <div class="impact-item-header-actions">
            <label class="impact-status-toggle" title="Activer ou désactiver cette part">
              <input type="checkbox" id="impactActive_${index}" ${isActive ? 'checked' : ''}>
              <span>${isActive ? 'Active' : 'Désactivée'}</span>
            </label>
            <button type="button" class="btn btn-danger btn-sm btn-delete-impact" data-index="${index}" aria-label="Supprimer cette part">
              <i class="fas fa-trash"></i> Supprimer
            </button>
          </div>
        </div>
        <div class="form-row" style="grid-template-columns: 140px 1fr 200px;">
          <div class="form-group-admin">
            <label for="impactPercent_${index}">Pourcentage (%) *</label>
            <input type="number" id="impactPercent_${index}" min="0" max="100" step="1" value="${item.percent ?? 0}" required placeholder="Ex: 50">
          </div>
          <div class="form-group-admin">
            <label for="impactTitle_${index}">Titre de la destination *</label>
            <input type="text" id="impactTitle_${index}" value="${escapeHtml(item.title || '')}" placeholder="Ex : Revente solidaire">
          </div>
          <div class="form-group-admin">
            <label for="impactIcon_${index}">Icône</label>
            <select id="impactIcon_${index}">
              ${PRESET_ICONS.map(ic => `
                <option value="${ic.id}" ${ic.id === icon ? 'selected' : ''}>${ic.label}</option>
              `).join('')}
            </select>
          </div>
        </div>
        <div class="form-group-admin" style="margin-bottom:0">
          <label for="impactDesc_${index}">Description</label>
          <input type="text" id="impactDesc_${index}" value="${escapeHtml(item.desc || '')}" placeholder="Ex : Boutique solidaire & en ligne — accès à la culture à prix abordable">
        </div>
      `;

      list.appendChild(card);

      const percentInput = $(`#impactPercent_${index}`, card);
      const titleInput = $(`#impactTitle_${index}`, card);
      const descInput = $(`#impactDesc_${index}`, card);
      const iconSelect = $(`#impactIcon_${index}`, card);
      const activeCheckbox = $(`#impactActive_${index}`, card);
      const btnDelete = $(`.btn-delete-impact[data-index="${index}"]`, card);

      if (percentInput) {
        percentInput.addEventListener('input', e => {
          item.percent = parseFloat(e.target.value) || 0;
          const badgeEl = $(`#impactCardPercentBadge_${index}`, card);
          if (badgeEl) badgeEl.textContent = `${item.percent}%`;
          updateImpactTotalBadge();
        });
      }
      if (titleInput) {
        titleInput.addEventListener('input', e => {
          item.title = e.target.value;
          const titleTextEl = $(`#impactCardTitleText_${index}`, card);
          if (titleTextEl) titleTextEl.textContent = item.title || 'Nouvelle part';
        });
      }
      if (descInput) {
        descInput.addEventListener('input', e => {
          item.desc = e.target.value;
        });
      }
      if (iconSelect) {
        iconSelect.addEventListener('change', e => {
          item.icon = e.target.value;
        });
      }
      if (activeCheckbox) {
        activeCheckbox.addEventListener('change', async e => {
          item.active = e.target.checked;
          const statusText = activeCheckbox.parentElement.querySelector('span');
          if (statusText) statusText.textContent = item.active ? 'Active' : 'Désactivée';
          card.classList.toggle('inactive', !item.active);
          updateImpactTotalBadge();
          syncImpactItemsFromDom();
          await saveContentForm(false);
          toast(item.active ? 'Part activée et enregistrée !' : 'Part désactivée et enregistrée !');
        });
      }
      if (btnDelete) {
        btnDelete.addEventListener('click', async () => {
          if (confirm(`Supprimer la part "${item.title || `#${index + 1}`}" ?`)) {
            syncImpactItemsFromDom();
            currentImpactItems.splice(index, 1);
            renderImpactItemsAdmin();
            await saveContentForm(false);
            toast('Part supprimée et enregistrée !');
          }
        });
      }
    });

    updateImpactTotalBadge();
  }

  let currentTeamMembers = [];

  function syncTeamMembersFromDom() {
    currentTeamMembers = currentTeamMembers.map((m, idx) => ({
      name: $(`#teamMemberName_${idx}`) ? $(`#teamMemberName_${idx}`).value.trim() : (m.name || ''),
      role: $(`#teamMemberRole_${idx}`) ? $(`#teamMemberRole_${idx}`).value.trim() : (m.role || ''),
      bio: $(`#teamMemberBio_${idx}`) ? $(`#teamMemberBio_${idx}`).value.trim() : (m.bio || ''),
      photo: m.photo || ''
    }));
  }

  function renderTeamMembersAdmin() {
    const list = $('#teamMembersList');
    if (!list) return;
    list.innerHTML = '';

    if (!currentTeamMembers.length) {
      list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--gray-400);background:rgba(255,255,255,0.02);border-radius:8px;border:1px dashed var(--gray-700)">Aucun membre dans l\'équipe. Cliquez sur "Ajouter un membre".</div>';
      return;
    }

    currentTeamMembers.forEach((member, index) => {
      const card = document.createElement('div');
      card.className = 'team-member-admin-card';
      card.dataset.index = index;

      const avatarContent = member.photo 
        ? `<img src="${escapeHtml(member.photo)}" alt="${escapeHtml(member.name || 'Membre')}">`
        : `<i class="fas fa-user"></i>`;

      card.innerHTML = `
        <div class="team-member-header">
          <span class="team-member-number"><i class="fas fa-user-circle"></i> Membre #${index + 1}</span>
          <button type="button" class="btn btn-danger btn-sm btn-delete-member" data-index="${index}">
            <i class="fas fa-trash"></i> Supprimer
          </button>
        </div>
        <div class="photo-upload-row" style="margin-bottom:14px">
          <div class="photo-preview-box round" id="memberPreview_${index}">
            ${avatarContent}
          </div>
          <div class="photo-upload-actions">
            <input type="file" id="memberPhotoInput_${index}" accept="image/*" style="display:none">
            <button type="button" class="btn btn-secondary-admin btn-sm btn-upload-member-photo" data-index="${index}">
              <i class="fas fa-upload"></i> Photo
            </button>
            <button type="button" class="btn btn-danger btn-sm btn-remove-member-photo" data-index="${index}" style="${member.photo ? 'display:inline-flex;' : 'display:none;'}">
              <i class="fas fa-trash"></i> Retirer
            </button>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group-admin">
            <label for="teamMemberName_${index}">Nom complet *</label>
            <input type="text" id="teamMemberName_${index}" value="${escapeHtml(member.name || '')}" placeholder="Ex : Marie Dupont">
          </div>
          <div class="form-group-admin">
            <label for="teamMemberRole_${index}">Rôle / Titre *</label>
            <input type="text" id="teamMemberRole_${index}" value="${escapeHtml(member.role || '')}" placeholder="Ex : Bénévole référente">
          </div>
        </div>
        <div class="form-group-admin" style="margin-bottom:0">
          <label for="teamMemberBio_${index}">Biographie / Présentation</label>
          <textarea id="teamMemberBio_${index}" rows="2" placeholder="Quelques mots sur son parcours et engagement…">${escapeHtml(member.bio || '')}</textarea>
        </div>
      `;

      list.appendChild(card);

      // Event listeners for inputs to sync state
      const nameInput = $(`#teamMemberName_${index}`, card);
      const roleInput = $(`#teamMemberRole_${index}`, card);
      const bioInput  = $(`#teamMemberBio_${index}`, card);
      if (nameInput) nameInput.addEventListener('input', e => { member.name = e.target.value; });
      if (roleInput) roleInput.addEventListener('input', e => { member.role = e.target.value; });
      if (bioInput) bioInput.addEventListener('input', e => { member.bio = e.target.value; });

      // Photo upload
      const fileInput = $(`#memberPhotoInput_${index}`, card);
      const btnUpload = $(`.btn-upload-member-photo[data-index="${index}"]`, card);
      const btnRemove = $(`.btn-remove-member-photo[data-index="${index}"]`, card);
      const previewBox = $(`#memberPreview_${index}`, card);

      if (btnUpload && fileInput) {
        btnUpload.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', async () => {
          const file = fileInput.files[0];
          if (!file) return;
          try {
            btnUpload.disabled = true;
            btnUpload.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Upload…';
            const url = await uploadImageFile(file);
            member.photo = url;
            previewBox.innerHTML = `<img src="${escapeHtml(url)}" alt="${escapeHtml(member.name || 'Membre')}">`;
            btnRemove.style.display = 'inline-flex';
            toast('Photo du membre ajoutée.');
          } catch (err) {
            toast('Échec de l\'envoi de la photo.', true);
          } finally {
            btnUpload.disabled = false;
            btnUpload.innerHTML = '<i class="fas fa-upload"></i> Photo';
            fileInput.value = '';
          }
        });
      }

      if (btnRemove) {
        btnRemove.addEventListener('click', () => {
          member.photo = '';
          previewBox.innerHTML = '<i class="fas fa-user"></i>';
          btnRemove.style.display = 'none';
          toast('Photo retirée.');
        });
      }

      // Delete member
      const btnDelete = $(`.btn-delete-member[data-index="${index}"]`, card);
      if (btnDelete) {
        btnDelete.addEventListener('click', async () => {
          if (confirm(`Supprimer ${member.name ? `le membre "${member.name}"` : 'ce membre'} de l\'équipe ?`)) {
            syncTeamMembersFromDom();
            currentTeamMembers.splice(index, 1);
            renderTeamMembersAdmin();
            await saveContentForm(false);
            toast('Membre supprimé et enregistré !');
          }
        });
      }
    });
  }

  // ─── CONTENUS DU SITE (CMS) ─────────────────────────
  function populateContentForm() {
    // S'assurer que appData.siteContent est fusionné avec les valeurs par défaut
    appData.siteContent = deepMerge(DEFAULT_DATA.siteContent, appData.siteContent || {});
    const c = appData.siteContent;
    const def = DEFAULT_DATA.siteContent;

    // Hero
    const hero = c.hero || def.hero;
    if ($('#contentHeroBadge')) $('#contentHeroBadge').value = hero.badge || def.hero.badge;
    if ($('#contentHeroSubtitle')) $('#contentHeroSubtitle').value = hero.subtitle || def.hero.subtitle;
    const stats = (hero.stats && hero.stats.length) ? hero.stats : def.hero.stats;
    if ($('#contentHeroStatNum1')) $('#contentHeroStatNum1').value = stats[0]?.num || def.hero.stats[0].num;
    if ($('#contentHeroStatLabel1')) $('#contentHeroStatLabel1').value = stats[0]?.label || def.hero.stats[0].label;
    if ($('#contentHeroStatNum2')) $('#contentHeroStatNum2').value = stats[1]?.num || def.hero.stats[1].num;
    if ($('#contentHeroStatLabel2')) $('#contentHeroStatLabel2').value = stats[1]?.label || def.hero.stats[1].label;
    if ($('#contentHeroStatNum3')) $('#contentHeroStatNum3').value = stats[2]?.num || def.hero.stats[2].num;
    if ($('#contentHeroStatLabel3')) $('#contentHeroStatLabel3').value = stats[2]?.label || def.hero.stats[2].label;

    // Mission
    const mission = c.mission || def.mission;
    if ($('#contentMissionTag')) $('#contentMissionTag').value = mission.tag || def.mission.tag;
    if ($('#contentMissionTitle')) $('#contentMissionTitle').value = mission.title || def.mission.title;
    if ($('#contentMissionDesc')) $('#contentMissionDesc').value = mission.description || def.mission.description;
    const steps = (mission.steps && mission.steps.length) ? mission.steps : def.mission.steps;
    if ($('#contentMissionStep1Title')) $('#contentMissionStep1Title').value = steps[0]?.title || def.mission.steps[0].title;
    if ($('#contentMissionStep1Desc')) $('#contentMissionStep1Desc').value = steps[0]?.desc || def.mission.steps[0].desc;
    if ($('#contentMissionStep2Title')) $('#contentMissionStep2Title').value = steps[1]?.title || def.mission.steps[1].title;
    if ($('#contentMissionStep2Desc')) $('#contentMissionStep2Desc').value = steps[1]?.desc || def.mission.steps[1].desc;
    if ($('#contentMissionStep3Title')) $('#contentMissionStep3Title').value = steps[2]?.title || def.mission.steps[2].title;
    if ($('#contentMissionStep3Desc')) $('#contentMissionStep3Desc').value = steps[2]?.desc || def.mission.steps[2].desc;

    // Collecte
    const col = c.collecte || def.collecte;
    if ($('#contentCollecteTag')) $('#contentCollecteTag').value = col.tag || def.collecte.tag;
    if ($('#contentCollecteTitle')) $('#contentCollecteTitle').value = col.title || def.collecte.title;
    if ($('#contentCollecteDesc')) $('#contentCollecteDesc').value = col.description || def.collecte.description;
    const cItems = (col.items && col.items.length) ? col.items : def.collecte.items;
    if ($('#contentCollecteItem1Title')) $('#contentCollecteItem1Title').value = cItems[0]?.title || def.collecte.items[0].title;
    if ($('#contentCollecteItem1Desc')) $('#contentCollecteItem1Desc').value = cItems[0]?.desc || def.collecte.items[0].desc;
    if ($('#contentCollecteItem2Title')) $('#contentCollecteItem2Title').value = cItems[1]?.title || def.collecte.items[1].title;
    if ($('#contentCollecteItem2Desc')) $('#contentCollecteItem2Desc').value = cItems[1]?.desc || def.collecte.items[1].desc;
    if ($('#contentCollecteItem3Title')) $('#contentCollecteItem3Title').value = cItems[2]?.title || def.collecte.items[2].title;
    if ($('#contentCollecteItem3Desc')) $('#contentCollecteItem3Desc').value = cItems[2]?.desc || def.collecte.items[2].desc;
    if ($('#contentCollecteItem4Title')) $('#contentCollecteItem4Title').value = cItems[3]?.title || def.collecte.items[3].title;
    if ($('#contentCollecteItem4Desc')) $('#contentCollecteItem4Desc').value = cItems[3]?.desc || def.collecte.items[3].desc;

    // Impact
    const impact = c.impact || def.impact;
    if ($('#contentImpactTag')) $('#contentImpactTag').value = impact.tag || def.impact.tag;
    if ($('#contentImpactTitle')) $('#contentImpactTitle').value = impact.title || def.impact.title;
    if ($('#contentImpactDesc')) $('#contentImpactDesc').value = impact.description || def.impact.description;
    if (impact.items && Array.isArray(impact.items) && impact.items.length) {
      currentImpactItems = JSON.parse(JSON.stringify(impact.items));
    } else {
      currentImpactItems = JSON.parse(JSON.stringify(def.impact.items));
    }
    renderImpactItemsAdmin();

    // Boutique
    const b = c.boutique || def.boutique;
    if ($('#contentBoutiqueTag')) $('#contentBoutiqueTag').value = b.tag || def.boutique.tag;
    if ($('#contentBoutiqueTitle')) $('#contentBoutiqueTitle').value = b.title || def.boutique.title;
    if ($('#contentBoutiqueLead')) $('#contentBoutiqueLead').value = b.lead || def.boutique.lead;
    if ($('#contentBoutiqueAddress')) $('#contentBoutiqueAddress').value = b.address || def.boutique.address;
    if ($('#contentBoutiqueHours')) $('#contentBoutiqueHours').value = b.hours || def.boutique.hours;
    if ($('#contentBoutiquePrices')) $('#contentBoutiquePrices').value = b.prices || def.boutique.prices;
    const bPhoto = b.photo || '';
    if ($('#contentBoutiquePhoto')) $('#contentBoutiquePhoto').value = bPhoto;
    updatePhotoPreviewBox($('#boutiquePhotoPreview'), bPhoto);
    if ($('#btnRemoveBoutiquePhoto')) $('#btnRemoveBoutiquePhoto').style.display = bPhoto ? 'inline-flex' : 'none';

    // ESAT
    const esat = c.esat || def.esat;
    if ($('#contentEsatTag')) $('#contentEsatTag').value = esat.tag || def.esat.tag;
    if ($('#contentEsatTitle')) $('#contentEsatTitle').value = esat.title || def.esat.title;
    if ($('#contentEsatDesc')) $('#contentEsatDesc').value = esat.description || def.esat.description;
    if ($('#contentEsatPartnerName')) $('#contentEsatPartnerName').value = esat.partnerName || def.esat.partnerName;
    if ($('#contentEsatPartnerDesc')) $('#contentEsatPartnerDesc').value = esat.partnerDesc || def.esat.partnerDesc;
    const esatPhoto = esat.photo || '';
    if ($('#contentEsatPhoto')) $('#contentEsatPhoto').value = esatPhoto;
    updatePhotoPreviewBox($('#esatPhotoPreview'), esatPhoto);
    if ($('#btnRemoveEsatPhoto')) $('#btnRemoveEsatPhoto').style.display = esatPhoto ? 'inline-flex' : 'none';

    const esatItems = (esat.items && esat.items.length) ? esat.items : def.esat.items;
    if ($('#contentEsatItem1Title')) $('#contentEsatItem1Title').value = esatItems[0]?.title || def.esat.items[0].title;
    if ($('#contentEsatItem1Desc')) $('#contentEsatItem1Desc').value = esatItems[0]?.desc || def.esat.items[0].desc;
    if ($('#contentEsatItem2Title')) $('#contentEsatItem2Title').value = esatItems[1]?.title || def.esat.items[1].title;
    if ($('#contentEsatItem2Desc')) $('#contentEsatItem2Desc').value = esatItems[1]?.desc || def.esat.items[1].desc;
    if ($('#contentEsatItem3Title')) $('#contentEsatItem3Title').value = esatItems[2]?.title || def.esat.items[2].title;
    if ($('#contentEsatItem3Desc')) $('#contentEsatItem3Desc').value = esatItems[2]?.desc || def.esat.items[2].desc;

    // Équipe
    const eq = c.equipe || def.equipe;
    if ($('#contentEquipeTag')) $('#contentEquipeTag').value = eq.tag || def.equipe.tag;
    if ($('#contentEquipeTitle')) $('#contentEquipeTitle').value = eq.title || def.equipe.title;
    if ($('#contentEquipeDesc')) $('#contentEquipeDesc').value = eq.description || def.equipe.description;
    if (Array.isArray(eq.members) && eq.members.length) {
      currentTeamMembers = JSON.parse(JSON.stringify(eq.members));
    } else {
      currentTeamMembers = JSON.parse(JSON.stringify(def.equipe.members));
    }
    renderTeamMembersAdmin();

    // Contact
    const ct = c.contact || def.contact;
    if ($('#contentContactTag')) $('#contentContactTag').value = ct.tag || def.contact.tag;
    if ($('#contentContactTitle')) $('#contentContactTitle').value = ct.title || def.contact.title;
    if ($('#contentContactDesc')) $('#contentContactDesc').value = ct.description || def.contact.description;
    if ($('#contentContactEmail')) $('#contentContactEmail').value = ct.email || def.contact.email;
    if ($('#contentContactSupportEmail')) $('#contentContactSupportEmail').value = ct.supportEmail || def.contact.supportEmail;
    if ($('#contentContactInstagram')) $('#contentContactInstagram').value = ct.instagram || def.contact.instagram;
    if ($('#contentContactFacebook')) $('#contentContactFacebook').value = ct.facebook || def.contact.facebook;
    if ($('#contentContactWebsite')) $('#contentContactWebsite').value = ct.website || def.contact.website;
  }

  async function saveContentForm(showToast = true) {
    syncImpactItemsFromDom();
    syncTeamMembersFromDom();

    const token = getAuthToken();
    if (!token) {
      toast('Session non authentifiée avec le serveur. Veuillez vous reconnecter.', true);
      clearSession();
      showLoginScreen();
      return;
    }

    const newSiteContent = {
      hero: {
        badge: $('#contentHeroBadge').value.trim(),
        subtitle: $('#contentHeroSubtitle').value.trim(),
        stats: [
          { num: $('#contentHeroStatNum1').value.trim(), label: $('#contentHeroStatLabel1').value.trim() },
          { num: $('#contentHeroStatNum2').value.trim(), label: $('#contentHeroStatLabel2').value.trim() },
          { num: $('#contentHeroStatNum3').value.trim(), label: $('#contentHeroStatLabel3').value.trim() }
        ]
      },
      mission: {
        tag: $('#contentMissionTag').value.trim(),
        title: $('#contentMissionTitle').value.trim(),
        description: $('#contentMissionDesc').value.trim(),
        steps: [
          { title: $('#contentMissionStep1Title').value.trim(), desc: $('#contentMissionStep1Desc').value.trim() },
          { title: $('#contentMissionStep2Title').value.trim(), desc: $('#contentMissionStep2Desc').value.trim() },
          { title: $('#contentMissionStep3Title').value.trim(), desc: $('#contentMissionStep3Desc').value.trim() }
        ]
      },
      collecte: {
        tag: $('#contentCollecteTag').value.trim(),
        title: $('#contentCollecteTitle').value.trim(),
        description: $('#contentCollecteDesc').value.trim(),
        items: [
          { title: $('#contentCollecteItem1Title').value.trim(), desc: $('#contentCollecteItem1Desc').value.trim() },
          { title: $('#contentCollecteItem2Title').value.trim(), desc: $('#contentCollecteItem2Desc').value.trim() },
          { title: $('#contentCollecteItem3Title').value.trim(), desc: $('#contentCollecteItem3Desc').value.trim() },
          { title: $('#contentCollecteItem4Title').value.trim(), desc: $('#contentCollecteItem4Desc').value.trim() }
        ]
      },
      impact: {
        tag: $('#contentImpactTag').value.trim(),
        title: $('#contentImpactTitle').value.trim(),
        description: $('#contentImpactDesc').value.trim(),
        items: currentImpactItems.map((it, idx) => {
          const pVal = $(`#impactPercent_${idx}`)?.value;
          const p = parseFloat(pVal);
          return {
            percent: !isNaN(p) ? p : (it.percent || 0),
            title: $(`#impactTitle_${idx}`) ? $(`#impactTitle_${idx}`).value.trim() : (it.title || ''),
            desc: $(`#impactDesc_${idx}`) ? $(`#impactDesc_${idx}`).value.trim() : (it.desc || ''),
            icon: $(`#impactIcon_${idx}`) ? $(`#impactIcon_${idx}`).value : (it.icon || 'fa-chart-pie'),
            color: it.color || '#8ce44c',
            active: $(`#impactActive_${idx}`) ? $(`#impactActive_${idx}`).checked : (it.active !== false)
          };
        })
      },
      boutique: {
        tag: $('#contentBoutiqueTag').value.trim(),
        title: $('#contentBoutiqueTitle').value.trim(),
        lead: $('#contentBoutiqueLead').value.trim(),
        address: $('#contentBoutiqueAddress').value.trim(),
        hours: $('#contentBoutiqueHours').value.trim(),
        prices: $('#contentBoutiquePrices').value.trim(),
        photo: $('#contentBoutiquePhoto') ? $('#contentBoutiquePhoto').value.trim() : ''
      },
      esat: {
        tag: $('#contentEsatTag').value.trim(),
        title: $('#contentEsatTitle').value.trim(),
        description: $('#contentEsatDesc').value.trim(),
        partnerName: $('#contentEsatPartnerName') ? $('#contentEsatPartnerName').value.trim() : 'ESAT de Châteauneuf-d\'Ille-et-Vilaine',
        partnerDesc: $('#contentEsatPartnerDesc') ? $('#contentEsatPartnerDesc').value.trim() : '',
        photo: $('#contentEsatPhoto') ? $('#contentEsatPhoto').value.trim() : '',
        items: [
          { title: $('#contentEsatItem1Title').value.trim(), desc: $('#contentEsatItem1Desc').value.trim() },
          { title: $('#contentEsatItem2Title').value.trim(), desc: $('#contentEsatItem2Desc').value.trim() },
          { title: $('#contentEsatItem3Title').value.trim(), desc: $('#contentEsatItem3Desc').value.trim() }
        ]
      },
      equipe: {
        tag: $('#contentEquipeTag').value.trim(),
        title: $('#contentEquipeTitle').value.trim(),
        description: $('#contentEquipeDesc').value.trim(),
        members: currentTeamMembers.map((m, idx) => ({
          name: $(`#teamMemberName_${idx}`) ? $(`#teamMemberName_${idx}`).value.trim() : (m.name || ''),
          role: $(`#teamMemberRole_${idx}`) ? $(`#teamMemberRole_${idx}`).value.trim() : (m.role || ''),
          bio: $(`#teamMemberBio_${idx}`) ? $(`#teamMemberBio_${idx}`).value.trim() : (m.bio || ''),
          photo: m.photo || ''
        }))
      },
      contact: {
        tag: $('#contentContactTag').value.trim(),
        title: $('#contentContactTitle').value.trim(),
        description: $('#contentContactDesc').value.trim(),
        email: $('#contentContactEmail') ? $('#contentContactEmail').value.trim() : 'info@recupculture.fr',
        supportEmail: $('#contentContactSupportEmail') ? $('#contentContactSupportEmail').value.trim() : 'support@recupculture.fr',
        instagram: $('#contentContactInstagram').value.trim(),
        facebook: $('#contentContactFacebook').value.trim(),
        website: $('#contentContactWebsite').value.trim()
      }
    };

    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ siteContent: newSiteContent })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.siteContent) appData.siteContent = json.siteContent;
      } else if (res.status === 401) {
        toast('Session expirée. Veuillez vous reconnecter.', true);
        clearSession();
        showLoginScreen();
        return;
      } else {
        toast('Erreur lors de la sauvegarde sur le serveur.', true);
        return;
      }
    } catch (err) {
      console.warn('Sauvegarde serveur échouée:', err);
      toast('Impossible de joindre le serveur.', true);
      return;
    }

    appData.siteContent = newSiteContent;
    saveData();
    if (showToast) {
      toast('Contenus du site enregistrés avec succès !');
    }
  }

  function initContentSection() {
    // Tabs
    $$('.cms-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        switchCmsTab(target);
      });
    });

    // Form submits
    $('#contentForm').addEventListener('submit', e => {
      e.preventDefault();
      saveContentForm();
    });

    const btnTop = $('#btnSaveContentTop');
    if (btnTop) btnTop.addEventListener('click', () => saveContentForm());

    // Upload photo Boutique
    const btnUploadBoutique = $('#btnUploadBoutiquePhoto');
    const inputBoutiquePhoto = $('#contentBoutiquePhotoInput');
    const btnRemoveBoutique = $('#btnRemoveBoutiquePhoto');
    if (btnUploadBoutique && inputBoutiquePhoto) {
      btnUploadBoutique.addEventListener('click', () => inputBoutiquePhoto.click());
      inputBoutiquePhoto.addEventListener('change', async () => {
        const file = inputBoutiquePhoto.files[0];
        if (!file) return;
        try {
          btnUploadBoutique.disabled = true;
          btnUploadBoutique.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Upload…';
          const url = await uploadImageFile(file);
          if ($('#contentBoutiquePhoto')) $('#contentBoutiquePhoto').value = url;
          updatePhotoPreviewBox($('#boutiquePhotoPreview'), url);
          if (btnRemoveBoutique) btnRemoveBoutique.style.display = 'inline-flex';
          toast('Photo de la boutique ajoutée.');
        } catch (err) {
          toast('Échec de l\'envoi de la photo.', true);
        } finally {
          btnUploadBoutique.disabled = false;
          btnUploadBoutique.innerHTML = '<i class="fas fa-upload"></i> Choisir une photo';
          inputBoutiquePhoto.value = '';
        }
      });
    }
    if (btnRemoveBoutique) {
      btnRemoveBoutique.addEventListener('click', () => {
        if ($('#contentBoutiquePhoto')) $('#contentBoutiquePhoto').value = '';
        updatePhotoPreviewBox($('#boutiquePhotoPreview'), '');
        btnRemoveBoutique.style.display = 'none';
        toast('Photo de la boutique retirée.');
      });
    }

    // Upload photo ESAT
    const btnUploadEsat = $('#btnUploadEsatPhoto');
    const inputEsatPhoto = $('#contentEsatPhotoInput');
    const btnRemoveEsat = $('#btnRemoveEsatPhoto');
    if (btnUploadEsat && inputEsatPhoto) {
      btnUploadEsat.addEventListener('click', () => inputEsatPhoto.click());
      inputEsatPhoto.addEventListener('change', async () => {
        const file = inputEsatPhoto.files[0];
        if (!file) return;
        try {
          btnUploadEsat.disabled = true;
          btnUploadEsat.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Upload…';
          const url = await uploadImageFile(file);
          if ($('#contentEsatPhoto')) $('#contentEsatPhoto').value = url;
          updatePhotoPreviewBox($('#esatPhotoPreview'), url);
          if (btnRemoveEsat) btnRemoveEsat.style.display = 'inline-flex';
          toast('Photo de l\'ESAT ajoutée.');
        } catch (err) {
          toast('Échec de l\'envoi de la photo.', true);
        } finally {
          btnUploadEsat.disabled = false;
          btnUploadEsat.innerHTML = '<i class="fas fa-upload"></i> Choisir une photo';
          inputEsatPhoto.value = '';
        }
      });
    }
    if (btnRemoveEsat) {
      btnRemoveEsat.addEventListener('click', () => {
        if ($('#contentEsatPhoto')) $('#contentEsatPhoto').value = '';
        updatePhotoPreviewBox($('#esatPhotoPreview'), '');
        btnRemoveEsat.style.display = 'none';
        toast('Photo de l\'ESAT retirée.');
      });
    }

    // Bouton ajouter part impact
    const btnAddImpact = $('#btnAddImpactItem');
    if (btnAddImpact) {
      btnAddImpact.addEventListener('click', async () => {
        syncImpactItemsFromDom();
        const PRESET_COLORS = ['#8ce44c', '#38bdf8', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6'];
        const nextColor = PRESET_COLORS[currentImpactItems.length % PRESET_COLORS.length];
        currentImpactItems.push({
          percent: 10,
          title: '',
          desc: '',
          icon: 'fa-chart-pie',
          color: nextColor,
          active: true
        });
        renderImpactItemsAdmin();
        const newIndex = currentImpactItems.length - 1;
        const titleField = $(`#impactTitle_${newIndex}`);
        if (titleField) titleField.focus();
        await saveContentForm(false);
        toast('Nouvelle part ajoutée et enregistrée.');
      });
    }

    const btnSaveImpact = $('#btnSaveImpactTab');
    if (btnSaveImpact) {
      btnSaveImpact.addEventListener('click', () => saveContentForm());
    }

    // Bouton ajouter membre équipe
    const btnAddMember = $('#btnAddTeamMember');
    if (btnAddMember) {
      btnAddMember.addEventListener('click', async () => {
        syncTeamMembersFromDom();
        currentTeamMembers.push({ name: '', role: '', bio: '', photo: '' });
        renderTeamMembersAdmin();
        const newIndex = currentTeamMembers.length - 1;
        const nameField = $(`#teamMemberName_${newIndex}`);
        if (nameField) nameField.focus();
        await saveContentForm(false);
        toast('Nouveau membre ajouté et enregistré.');
      });
    }

    const btnSaveTeam = $('#btnSaveTeamTab');
    if (btnSaveTeam) {
      btnSaveTeam.addEventListener('click', () => saveContentForm());
    }

    populateContentForm();
  }

  function initNewsSection() {
    $('#btnAddNews').addEventListener('click', () => openNewsModal());
    $('#modalNewsClose').addEventListener('click', closeNewsModal);
    $('#modalNewsCancelBtn').addEventListener('click', closeNewsModal);
    $('#modalNews').addEventListener('click', e => { if(e.target===$('#modalNews')) closeNewsModal(); });

    // Photo News Upload
    const btnUploadNews = $('#btnUploadNewsPhoto');
    const inputNewsPhoto = $('#newsPhotoInput');
    const btnRemoveNews = $('#btnRemoveNewsPhoto');
    if (btnUploadNews && inputNewsPhoto) {
      btnUploadNews.addEventListener('click', () => inputNewsPhoto.click());
      inputNewsPhoto.addEventListener('change', async () => {
        const file = inputNewsPhoto.files[0];
        if (!file) return;
        try {
          btnUploadNews.disabled = true;
          btnUploadNews.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Upload…';
          const url = await uploadImageFile(file);
          if ($('#newsPhoto')) $('#newsPhoto').value = url;
          updatePhotoPreviewBox($('#newsPhotoPreview'), url);
          if (btnRemoveNews) btnRemoveNews.style.display = 'inline-flex';
          toast('Image d\'illustration ajoutée.');
        } catch (err) {
          toast('Échec de l\'envoi de l\'image.', true);
        } finally {
          btnUploadNews.disabled = false;
          btnUploadNews.innerHTML = '<i class="fas fa-upload"></i> Choisir une image';
          inputNewsPhoto.value = '';
        }
      });
    }
    if (btnRemoveNews) {
      btnRemoveNews.addEventListener('click', () => {
        if ($('#newsPhoto')) $('#newsPhoto').value = '';
        updatePhotoPreviewBox($('#newsPhotoPreview'), '');
        btnRemoveNews.style.display = 'none';
      });
    }

    $('#newsForm').addEventListener('submit', async e => {
      e.preventDefault();
      const title = $('#newsTitle').value.trim();
      const cat   = $('#newsCategory').value;
      const date  = $('#newsDate').value;
      const content = quill ? quill.root.innerHTML : '';
      const image = $('#newsPhoto') ? $('#newsPhoto').value.trim() : '';

      if (!title || !date) { toast('Veuillez remplir les champs obligatoires.', true); return; }

      const id = parseInt($('#newsId').value) || null;
      const token = getAuthToken();
      if (token) {
        try {
          const res = await fetch('/api/news', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ id, title, category: cat, date, content, image })
          });
          if (res.ok) {
            const json = await res.json();
            if (json.news) appData.news = json.news;
          }
        } catch (_) {}
      }

      if (!token) {
        if (id) {
          const idx = (appData.news||[]).findIndex(n => n.id===id);
          if (idx > -1) { appData.news[idx] = { id, title, category:cat, date, content, image }; }
        } else {
          if (!appData.news) appData.news = [];
          const newId = Date.now();
          appData.news.unshift({ id:newId, title, category:cat, date, content, image });
        }
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
    if (adminMap) {
      adminMap.invalidateSize();
      renderAdminMapPoints();
      return;
    }

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

    $('#pointForm').addEventListener('submit', async e => {
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
      const token = getAuthToken();
      if (token) {
        try {
          const res = await fetch('/api/points', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ id, name, address, description: desc, hours, lat, lng })
          });
          if (res.ok) {
            const json = await res.json();
            if (json.collectPoints) appData.collectPoints = json.collectPoints;
          }
        } catch (_) {}
      }

      if (!token) {
        const pt = { id: id||Date.now(), name, address, description:desc, hours, lat, lng };
        if (id) {
          const idx = (appData.collectPoints||[]).findIndex(p => p.id===id);
          if (idx > -1) appData.collectPoints[idx] = pt;
        } else {
          if (!appData.collectPoints) appData.collectPoints = [];
          appData.collectPoints.push(pt);
        }
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

  function openUserModal(u = null) {
    const modal    = $('#modalUser');
    const title    = $('#modalUserTitle');
    const pwdHint  = $('#userPasswordHint');
    const pwdLabel = $('#userPasswordLabel');

    if (u) {
      title.textContent = 'Modifier l\'utilisateur';
      $('#userId').value = u.id;
      $('#userDisplayName').value = u.displayName || u.username;
      $('#userUsername').value = u.username;
      $('#userPassword').value = '';
      $('#userPassword').required = false;
      $('#userRole').value = u.role || 'admin';
      pwdHint.style.display = 'block';
      pwdLabel.textContent = 'Nouveau mot de passe (optionnel)';
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

      const token = getAuthToken();
      if (token) {
        try {
          const res = await fetch('/api/users', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ id, username, displayName, password, role })
          });
          if (res.ok) {
            const json = await res.json();
            if (json.users) credentials.users = json.users;
          }
        } catch (_) {}
      }

      if (!token) {
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
    async deleteNews(id) {
      if (!confirm('Supprimer cet article ?')) return;
      const token = getAuthToken();
      if (token) {
        try {
          const res = await fetch(`/api/news/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
          if (res.ok) {
            const json = await res.json();
            if (json.news) appData.news = json.news;
          }
        } catch (_) {}
      }
      if (!token) {
        appData.news = (appData.news||[]).filter(n => n.id!==id);
      }
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
    async deletePoint(id) {
      if (!confirm('Supprimer ce point de collecte ?')) return;
      const token = getAuthToken();
      if (token) {
        try {
          const res = await fetch(`/api/points/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
          if (res.ok) {
            const json = await res.json();
            if (json.collectPoints) appData.collectPoints = json.collectPoints;
          }
        } catch (_) {}
      }
      if (!token) {
        appData.collectPoints = (appData.collectPoints||[]).filter(p => p.id!==id);
      }
      saveData();
      renderAdminMapPoints();
      toast('Point supprimé.');
    },
    editUser(id) {
      const u = (credentials.users||[]).find(u => u.id===id);
      if (u) openUserModal(u);
    },
    async deleteUser(id) {
      if (credentials.users.length <= 1) { toast('Impossible de supprimer le dernier administrateur.', true); return; }
      if (!confirm('Supprimer cet utilisateur ?')) return;

      const token = getAuthToken();
      if (token) {
        try {
          const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
          if (res.ok) {
            const json = await res.json();
            if (json.users) credentials.users = json.users;
          }
        } catch (_) {}
      }

      if (!token) {
        credentials.users = credentials.users.filter(u => u.id!==id);
      }

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
    initContentSection();
    initNewsSection();
    initMapSection();
    initUsersSection();
    initIOSection();

    // Rendre les données initiales
    renderNewsTable();
    renderUsersTable();
    renderPointsTable();
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
