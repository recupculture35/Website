/* ====================================================
   RECUP CULTURE – Script principal (site public)
   ==================================================== */

(function () {
  'use strict';

  // ─── Utilitaires ───────────────────────────────────
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

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
          { name: "François-Xavier Mahoïc", role: "Co-fondateur", bio: "Plus de 15 ans d'expérience dans l'accompagnement des ESAT et du handicap psychique. Convaincu que l'inclusion sociale est un levier de transformation.", photo: "" },
          { name: "Sophie Martin", role: "Responsable logistique & dons", bio: "", photo: "" },
          { name: "Camille Dubois", role: "Bénévole engagée", bio: "Animation des ateliers lecture et tri solidaire.", photo: "" }
        ]
      },
      faq: {
        tag: "Questions Fréquentes",
        title: "Tout ce que vous devez savoir",
        description: "Retrouvez les réponses aux questions les plus courantes sur nos collectes, nos dépôts et nos actions solidaires.",
        items: [
          {
            question: "Quels types de livres et articles culturels sont acceptés ?",
            answer: "Nous acceptons tous types de livres (romans, BD, mangas, documentaires, livres jeunesse, beaux livres), ainsi que les CD musicaux, DVD & Blu-ray, et jeux vidéo toutes générations. Les articles doivent être en bon état d'usage."
          },
          {
            question: "Quels sont les articles refusés ?",
            answer: "Nous ne pouvons pas accepter les encyclopédies volumineuses obsolètes, les manuels scolaires périmés, les revues/magazines, ainsi que les livres ou boîtiers moisis, déchirés ou très abîmés."
          },
          {
            question: "Où et comment puis-je déposer mes dons ?",
            answer: "Vous pouvez déposer vos dons dans nos bacs de collecte partenaires situés à Saint-Malo, Dinard et Châteauneuf-d'Ille-et-Vilaine. Consultez la carte interactive des points de dépôt sur ce site pour retrouver adresses et horaires."
          },
          {
            question: "Que deviennent les articles collectés et quel est le rôle de l'ESAT ?",
            answer: "Vos dons sont acheminés vers l'ESAT de Châteauneuf-d'Ille-et-Vilaine où les travailleurs en situation de handicap réalisent le tri, le nettoyage et le reconditionnement. Environ 50% sont remis en circulation via notre boutique solidaire à prix modique, 30% sont recyclés en pâte à papier, et 20% sont donnés lors d'actions humanitaires."
          },
          {
            question: "Où et quand puis-je acheter des livres à la boutique solidaire ?",
            answer: "Notre boutique 'La Halle aux Artistes' située au 3 place du Martray à Châteauneuf-d'Ille-et-Vilaine ouvre chaque 2ème week-end du mois, avec des livres dès 0,50€, des CD dès 0,50€ et des DVD dès 1€."
          },
          {
            question: "Puis-je devenir bénévole ou proposer un partenariat ?",
            answer: "Avec grand plaisir ! Que vous soyez un particulier souhaitant donner un coup de main lors d'une collecte ou une entreprise/commerce désireux d'accueillir un bac de dépôt, écrivez-nous via le formulaire de contact ci-dessous ou directement à info@recupculture.fr."
          }
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
    ],
    news: [
      {
        id: 1,
        title: "Ouverture boutique – Octobre 2025",
        category: "boutique",
        date: "2025-10-11",
        content: "<p>La boutique <strong>Halle aux Artistes</strong> vous accueille le <strong>2ème week-end d'octobre</strong> (11 & 12 octobre 2025) à Châteauneuf-d'Ille-et-Vilaine.</p><p>Venez chiner des livres, CD, DVD et jeux vidéo à prix solidaire !</p>"
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
        output[key] = source[key];
      } else if (source[key] !== undefined && source[key] !== null) {
        output[key] = source[key];
      }
    }
    return output;
  }

  let appData = JSON.parse(JSON.stringify(DEFAULT_DATA));

  async function loadData() {
    let dataLoaded = false;
    // 1. Essayer l'API backend (/api/data) en premier si servi par le serveur Node.js / Railway
    try {
      const res = await fetch(`/api/data?_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json && (Array.isArray(json.collectPoints) || json.siteContent || Array.isArray(json.news))) {
          appData = deepMerge(DEFAULT_DATA, json);
          dataLoaded = true;
        }
      }
    } catch (_) {
      // Pas de backend actif (ouverture file:// ou statique direct)
    }

    // 2. Essayer localStorage (cache navigateur / admin local)
    if (!dataLoaded) {
      const stored = localStorage.getItem('recupculture_data');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && (Array.isArray(parsed.collectPoints) || parsed.siteContent || Array.isArray(parsed.news))) {
            appData = deepMerge(DEFAULT_DATA, parsed);
            dataLoaded = true;
          }
        } catch (e) { /* ignore */ }
      }
    }

    // 3. Fallback : fichier statique data/config.json
    if (!dataLoaded) {
      try {
        const res = await fetch('data/config.json');
        if (res.ok) {
          const json = await res.json();
          if (json && (Array.isArray(json.collectPoints) || json.siteContent || Array.isArray(json.news))) {
            appData = deepMerge(DEFAULT_DATA, json);
          }
        }
      } catch (e) {
        // Sous file://, fetch est bloqué par sécurité browser : DEFAULT_DATA est déjà actif
      }
    }

    // Sécurisation stricte des points et news
    if (!Array.isArray(appData.collectPoints) || appData.collectPoints.length === 0) {
      appData.collectPoints = JSON.parse(JSON.stringify(DEFAULT_DATA.collectPoints));
    }
    if (!Array.isArray(appData.news) || appData.news.length === 0) {
      appData.news = JSON.parse(JSON.stringify(DEFAULT_DATA.news));
    }
    try { localStorage.setItem('recupculture_data', JSON.stringify(appData)); } catch (_) {}
  }

  // ─── Navigation ────────────────────────────────────
  function initNavbar() {
    const navbar = $('#navbar');
    const toggle = $('#navToggle');
    const links  = $('#navLinks');

    // Scroll → apparence navbar
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Menu burger (mobile)
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    // Fermer menu au clic sur un lien
    $$('a', links).forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Active link au scroll
    const sections = $$('section[id]');
    const navLinks = $$('#navLinks a[href^="#"]');

    const observerNav = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
        }
      });
    }, { rootMargin: '-50% 0px -50% 0px' });

    sections.forEach(s => observerNav.observe(s));
  }

  // ─── Animations Scroll (reveal) ────────────────────
  function initReveal() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    $$('.reveal').forEach(el => observer.observe(el));
  }

  // ─── Compteurs animés ──────────────────────────────
  function animateCounter(el, target, duration = 1800) {
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  let impactObserver = null;

  function initImpactCounters() {
    const impactSection = $('#impact');
    if (!impactSection) return;

    if (impactObserver) {
      impactObserver.disconnect();
    }

    const runAnimations = () => {
      // Compteurs chiffres
      $$('.impact-percent').forEach(el => {
        const target = parseInt(el.dataset.target, 10) || 0;
        animateCounter(el, target, 1800);
      });

      // Anneaux SVG
      $$('.ring-progress').forEach(ring => {
        const offset = parseInt(ring.dataset.offset, 10);
        ring.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)';
        requestAnimationFrame(() => {
          ring.style.strokeDashoffset = offset;
        });
      });
    };

    // Si la section est déjà visible à l'écran, déclencher directement
    const rect = impactSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      runAnimations();
      return;
    }

    let triggered = false;
    impactObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !triggered) {
        triggered = true;
        runAnimations();
      }
    }, { threshold: 0.2 });

    impactObserver.observe(impactSection);
  }

  // ─── Carte Leaflet ─────────────────────────────────
  let map = null;
  const markers = [];

  function initMap() {
    const mapEl = $('#collectMap');
    if (!mapEl || typeof L === 'undefined') return;

    const isMobile = window.innerWidth <= 768;
    const initialCenter = isMobile ? [48.6493, -2.0150] : [48.644, -2.010];

    // Centre sur Saint-Malo (mobile) ou région (desktop)
    map = L.map('collectMap', {
      center: initialCenter,
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20
    }).addTo(map);

    renderMapPoints();
  }

  function getCustomIcon() {
    return L.divIcon({
      className: '',
      html: `<div style="
        width:36px;height:36px;
        background:linear-gradient(135deg,#77b841,#1e88e5);
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 0 16px rgba(119,184,65,0.6), 0 4px 12px rgba(0,0,0,0.5);
        border:2.5px solid white;
      "></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -40]
    });
  }

  function renderMapPoints() {
    if (!map) return;

    // Supprimer anciens marqueurs
    markers.forEach(m => map.removeLayer(m));
    markers.length = 0;

    const listEl = $('#collectPointsList');
    if (listEl) listEl.innerHTML = '';

    const points = appData.collectPoints || [];

    if (points.length === 0) {
      if (listEl) listEl.innerHTML = '<p style="color:var(--gray-400);text-align:center;padding:20px">Aucun point de collecte configuré.</p>';
      return;
    }

    const bounds = [];

    points.forEach((pt, i) => {
      if (!pt.lat || !pt.lng) return;

      const popupHtml = `
        <div class="map-popup-card">
          ${pt.image ? `
            <div class="map-popup-image-wrapper">
              <img src="${escapeHtml(pt.image)}" alt="${escapeHtml(pt.name)}" class="map-popup-img" loading="lazy">
            </div>
          ` : ''}
          <div class="map-popup-body">
            <h4 class="map-popup-title">${escapeHtml(pt.name)}</h4>
            <div class="map-popup-address"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> <span>${escapeHtml(pt.address || '')}</span></div>
            ${pt.description ? `<p class="map-popup-desc">${escapeHtml(pt.description)}</p>` : ''}
            ${pt.hours ? `<div class="map-popup-hours"><i class="fas fa-clock" aria-hidden="true"></i> <span>${escapeHtml(pt.hours)}</span></div>` : ''}
          </div>
        </div>
      `;

      const marker = L.marker([pt.lat, pt.lng], { icon: getCustomIcon() })
        .addTo(map)
        .bindPopup(popupHtml, {
          maxWidth: 290,
          minWidth: 230,
          className: 'custom-leaflet-popup'
        });

      // Ouverture au survol de la souris sur le marqueur
      marker.on('mouseover', function () {
        this.openPopup();
        if (listEl) {
          const cards = listEl.querySelectorAll('.point-card');
          cards.forEach((c, idx) => {
            if (idx === i) c.classList.add('hover-highlight');
            else c.classList.remove('hover-highlight');
          });
        }
      });

      marker.on('mouseout', function () {
        if (listEl) {
          listEl.querySelectorAll('.point-card').forEach(c => c.classList.remove('hover-highlight'));
        }
      });

      // Synchronisation au clic sur le marqueur
      marker.on('click', function () {
        this.openPopup();
        if (listEl) {
          const cards = listEl.querySelectorAll('.point-card');
          cards.forEach(c => c.classList.remove('active'));
          if (cards[i]) {
            cards[i].classList.add('active');
            cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      });

      markers.push(marker);
      bounds.push([pt.lat, pt.lng]);

      // Carte latérale
      if (listEl) {
        const card = document.createElement('div');
        card.className = 'point-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Point de collecte : ${pt.name}`);
        card.innerHTML = `
          <div class="point-card-header">
            ${pt.image ? `
              <div class="point-card-thumb" aria-hidden="true">
                <img src="${escapeHtml(pt.image)}" alt="${escapeHtml(pt.name)}" loading="lazy">
              </div>
            ` : `
              <div class="point-card-icon" aria-hidden="true"><i class="fas fa-map-marker-alt"></i></div>
            `}
            <div>
              <h4>${escapeHtml(pt.name)}</h4>
              <span class="point-address">${escapeHtml(pt.address || '')}</span>
            </div>
          </div>
          ${pt.description ? `<p class="point-desc">${escapeHtml(pt.description)}</p>` : ''}
          ${pt.hours ? `<p class="point-hours"><i class="fas fa-clock" aria-hidden="true"></i>${escapeHtml(pt.hours)}</p>` : ''}
        `;

        const focusPoint = () => {
          map.setView([pt.lat, pt.lng], 15);
          marker.openPopup();
          listEl.querySelectorAll('.point-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
        };

        card.addEventListener('click', focusPoint);
        card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') focusPoint(); });
        listEl.appendChild(card);
      }
    });

    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      // Sur mobile, centrer expressément sur Saint-Malo
      map.setView([48.6493, -2.0150], 12);
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    }
  }

  // ─── Actualités ────────────────────────────────────
  const CATEGORY_LABELS = {
    boutique:  { label: 'Boutique',  cls: 'boutique'  },
    evenement: { label: 'Événement', cls: 'evenement' },
    actualite: { label: 'Actualité', cls: 'actualite' }
  };

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  // ─── GESTION DES GALERIES PHOTOS DE SECTIONS (1 À 4 PHOTOS) ───
  function renderSectionGallery(containerId, photos) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const list = Array.isArray(photos)
      ? photos.filter(p => typeof p === 'string' && p.trim()).slice(0, 4)
      : (typeof photos === 'string' && photos.trim() ? [photos.trim()] : []);

    if (list.length === 0) {
      container.innerHTML = '';
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    container.innerHTML = `
      <div class="gallery-grid reveal visible active" data-count="${list.length}">
        ${list.map((src, idx) => `
          <div class="gallery-item item-${idx + 1}" data-src="${escapeHtml(src)}" role="button" tabindex="0" aria-label="Agrandir la photo ${idx + 1}">
            <img src="${escapeHtml(src)}" alt="Illustration photo ${idx + 1}" loading="lazy">
            <div class="gallery-item-overlay" aria-hidden="true">
              <i class="fas fa-search-plus"></i>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.gallery-item').forEach(item => {
      const open = () => openLightbox(item.dataset.src);
      item.addEventListener('click', open);
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });
    });
  }

  // ─── LIGHTBOX (AGRANDISSEMENT PHOTO EN PLEIN ÉCRAN) ───
  function openLightbox(src) {
    if (!src) return;
    const modal = document.getElementById('siteLightboxModal');
    const img = document.getElementById('siteLightboxImg');
    if (!modal || !img) return;
    img.src = src;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const modal = document.getElementById('siteLightboxModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // ─── MODALE LECTURE ARTICLE ACTUALITÉS ─────────────────
  function openArticleModal(item) {
    if (!item) return;
    const modal = document.getElementById('articleModal');
    const body = document.getElementById('articleModalBody');
    if (!modal || !body) return;

    const cat = CATEGORY_LABELS[item.category] || { label: item.category || 'Actualité', cls: 'actualite' };
    const photos = Array.isArray(item.photos) && item.photos.length > 0
      ? item.photos.filter(p => typeof p === 'string' && p.trim()).slice(0, 4)
      : (item.image ? [item.image] : []);

    let galleryHtml = '';
    if (photos.length > 0) {
      galleryHtml = `
        <div class="article-modal-gallery">
          <div class="gallery-grid" data-count="${photos.length}">
            ${photos.map((src, idx) => `
              <div class="gallery-item item-${idx + 1}" data-src="${escapeHtml(src)}" role="button" tabindex="0" aria-label="Agrandir la photo ${idx + 1}">
                <img src="${escapeHtml(src)}" alt="${escapeHtml(item.title)} - ${idx + 1}" loading="lazy">
                <div class="gallery-item-overlay" aria-hidden="true"><i class="fas fa-search-plus"></i></div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    body.innerHTML = `
      <div class="article-modal-header">
        <div class="article-modal-meta">
          <span class="news-badge ${cat.cls}">${escapeHtml(cat.label)}</span>
          <span class="news-date">${formatDate(item.date)}</span>
        </div>
        <h2 class="article-modal-title" id="articleModalTitle">${escapeHtml(item.title)}</h2>
      </div>
      ${galleryHtml}
      <div class="article-modal-content ql-editor-content">
        ${item.content || ''}
      </div>
    `;

    body.querySelectorAll('.gallery-item').forEach(el => {
      el.addEventListener('click', () => openLightbox(el.dataset.src));
    });

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeArticleModal() {
    const modal = document.getElementById('articleModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function initModals() {
    const lbClose = document.getElementById('siteLightboxClose');
    const lbModal = document.getElementById('siteLightboxModal');
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lbModal) lbModal.addEventListener('click', e => {
      if (e.target === lbModal || e.target.classList.contains('site-lightbox-content')) closeLightbox();
    });

    const artClose = document.getElementById('articleModalClose');
    const artModal = document.getElementById('articleModal');
    if (artClose) artClose.addEventListener('click', closeArticleModal);
    if (artModal) artModal.addEventListener('click', e => {
      if (e.target === artModal) closeArticleModal();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeLightbox();
        closeArticleModal();
      }
    });
  }

  // ─── AFFICHAGE DES ACTUALITÉS ─────────────────────────
  function renderNews() {
    const grid  = $('#newsGrid');
    const empty = $('#newsEmpty');
    if (!grid) return;

    const news = (appData.news || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));

    // Supprimer anciennes cards (garder #newsEmpty)
    $$('.news-card', grid).forEach(c => c.remove());

    if (news.length === 0) {
      if (empty) empty.style.display = 'flex';
      return;
    }

    if (empty) empty.style.display = 'none';

    news.forEach(item => {
      const cat  = CATEGORY_LABELS[item.category] || { label: item.category, cls: 'actualite' };
      const card = document.createElement('article');
      card.className = 'news-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Lire l'article : ${item.title}`);

      const excerpt = stripHtml(item.content || '').substring(0, 120) + (stripHtml(item.content || '').length > 120 ? '…' : '');
      const photos = Array.isArray(item.photos) && item.photos.length > 0
        ? item.photos.filter(p => typeof p === 'string' && p.trim()).slice(0, 4)
        : (item.image ? [item.image] : []);

      let mediaHtml = '';
      if (photos.length === 1) {
        mediaHtml = `
          <div class="news-card-media">
            <img src="${escapeHtml(photos[0])}" alt="${escapeHtml(item.title)}">
          </div>
        `;
      } else if (photos.length > 1) {
        mediaHtml = `
          <div class="news-media-grid" data-count="${photos.length}">
            ${photos.map((src, i) => `
              <div class="news-media-thumb">
                <img src="${escapeHtml(src)}" alt="${escapeHtml(item.title)} - ${i + 1}">
              </div>
            `).join('')}
            <span class="news-photos-badge"><i class="fas fa-camera"></i> ${photos.length} photos</span>
          </div>
        `;
      }

      card.innerHTML = `
        ${mediaHtml}
        <div class="news-card-header">
          <span class="news-badge ${cat.cls}">${escapeHtml(cat.label)}</span>
          <span class="news-date">${formatDate(item.date)}</span>
        </div>
        <div class="news-card-body">
          <h3>${escapeHtml(item.title)}</h3>
          <p class="news-excerpt">${escapeHtml(excerpt)}</p>
        </div>
      `;

      card.addEventListener('click', () => openArticleModal(item));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openArticleModal(item);
        }
      });

      grid.insertBefore(card, empty);
    });
  }

  // ─── Formulaire de contact ─────────────────────────
  function initContactForm() {
    const form      = $('#contactForm');
    const success   = $('#formSuccess');
    const errorBox  = $('#formError');
    const errorText = $('#formErrorText');
    if (!form) return;

    function hideNotifications() {
      if (success) success.classList.remove('show');
      if (errorBox) errorBox.classList.remove('show');
    }

    function showError(message) {
      if (success) success.classList.remove('show');
      if (errorBox) {
        if (errorText) errorText.textContent = message;
        errorBox.classList.add('show');
      } else {
        alert(message);
      }
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      hideNotifications();

      // Validation des champs
      const name    = ($('#contactName')?.value || '').trim();
      const email   = ($('#contactEmail')?.value || '').trim();
      const subject = ($('#contactSubject')?.value || '').trim();
      const message = ($('#contactMessage')?.value || '').trim();

      if (!name || !email || !message) {
        showError('Veuillez remplir tous les champs obligatoires (*).');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('Veuillez saisir une adresse e-mail valide.');
        return;
      }

      const btn = $('#contactSubmit');
      const originalHtml = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Envoi en cours…</span>';
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message }),
          signal: controller.signal
        });
        clearTimeout(timer);

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || 'Une erreur est survenue lors de l\'envoi du message.');
        }

        form.reset();
        if (success) {
          const successP = success.querySelector('p');
          if (successP) {
            successP.textContent = data.message || 'Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.';
          }
          success.classList.add('show');
        }

        setTimeout(() => {
          if (success) success.classList.remove('show');
        }, 8000);
      } catch (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
          showError('Le délai de transmission a expiré. Vous pouvez également nous contacter directement par e-mail à info@recupculture.fr.');
        } else {
          showError(err.message || 'Une erreur est survenue. Vous pouvez également nous contacter par e-mail à info@recupculture.fr.');
        }
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalHtml || '<i class="fas fa-paper-plane"></i> <span>Envoyer le message</span>';
        }
      }
    });
  }

  // ─── Utilitaire sécurité XSS ───────────────────────
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ─── Rendu dynamique des contenus de rubriques (CMS) ─
  function renderSiteContent() {
    const c = deepMerge(DEFAULT_DATA.siteContent, appData.siteContent || {});
    if (!c) return;

    // Hero
    if (c.hero) {
      if (c.hero.badge && $('#heroBadgeText')) $('#heroBadgeText').textContent = c.hero.badge;
      if (c.hero.subtitle && $('#heroSubtitle')) $('#heroSubtitle').innerHTML = c.hero.subtitle;
      if (Array.isArray(c.hero.stats)) {
        c.hero.stats.forEach((st, i) => {
          const numEl = $(`#heroStatNum${i + 1}`);
          const lblEl = $(`#heroStatLabel${i + 1}`);
          if (numEl && st.num) numEl.textContent = st.num;
          if (lblEl && st.label) lblEl.textContent = st.label;
        });
      }
    }

    // Mission
    if (c.mission) {
      if (c.mission.tag && $('#missionTag')) $('#missionTag').textContent = c.mission.tag;
      if (c.mission.title && $('#mission-title')) $('#mission-title').textContent = c.mission.title;
      if (c.mission.description && $('#missionDesc')) $('#missionDesc').textContent = c.mission.description;
      if (Array.isArray(c.mission.steps) && c.mission.steps.length) {
        const icons = ['fa-box-open', 'fa-sort-amount-down', 'fa-heart'];
        const colors = ['#2e7d32', '#1565c0', '#c0392b'];
        const stepsContainer = $('#missionSteps');
        if (stepsContainer) {
          stepsContainer.innerHTML = c.mission.steps.map((st, i) => `
            <div class="mission-step reveal visible active" style="--delay: ${i * 0.15}s">
              <div class="step-icon" style="--color: ${colors[i % colors.length]}" aria-hidden="true">
                <i class="fas ${icons[i % icons.length]}"></i>
              </div>
              <h3>${escapeHtml(st.title)}</h3>
              <p>${escapeHtml(st.desc)}</p>
            </div>
          `).join('');
        }
      }
      renderSectionGallery('missionGallery', c.mission.photos);
    }

    // Collecte
    if (c.collecte) {
      if (c.collecte.tag && $('#collecteTag')) $('#collecteTag').textContent = c.collecte.tag;
      if (c.collecte.title && $('#collecte-title')) $('#collecte-title').textContent = c.collecte.title;
      if (c.collecte.description && $('#collecteDesc')) $('#collecteDesc').textContent = c.collecte.description;
      if (Array.isArray(c.collecte.items) && c.collecte.items.length) {
        const icons = ['fa-book', 'fa-compact-disc', 'fa-film', 'fa-gamepad'];
        const grid = $('#collectGrid');
        if (grid) {
          grid.innerHTML = c.collecte.items.map((it, i) => `
            <div class="collect-card reveal visible active" style="--delay: ${i * 0.1}s">
              <div class="collect-icon" aria-hidden="true"><i class="fas ${icons[i % icons.length]}"></i></div>
              <h3>${escapeHtml(it.title)}</h3>
              <p>${escapeHtml(it.desc)}</p>
            </div>
          `).join('');
        }
      }
      renderSectionGallery('collecteGallery', c.collecte.photos);
    }

    // Impact
    if (c.impact) {
      if (c.impact.tag && $('#impactTag')) $('#impactTag').textContent = c.impact.tag;
      if (c.impact.title && $('#impact-title')) $('#impact-title').textContent = c.impact.title;
      if (c.impact.description && $('#impactDesc')) $('#impactDesc').textContent = c.impact.description;

      const grid = $('#impactGrid');
      if (grid && Array.isArray(c.impact.items)) {
        const activeItems = c.impact.items.filter(it => it.active !== false);
        if (activeItems.length > 0) {
          const PRESET_COLORS = ['#8ce44c', '#38bdf8', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6'];
          grid.innerHTML = activeItems.map((it, idx) => {
            const pct = Math.max(0, Math.min(100, parseFloat(it.percent) || 0));
            const offset = Math.round(314 * (1 - pct / 100));
            const color = it.color || PRESET_COLORS[idx % PRESET_COLORS.length];
            const icon = it.icon || 'fa-chart-pie';
            return `
              <div class="impact-card reveal visible active" style="--delay: ${idx * 0.15}s">
                <div class="impact-ring" role="img" aria-label="${pct}% ${escapeHtml(it.title || '')}">
                  <svg viewBox="0 0 120 120" aria-hidden="true">
                    <circle cx="60" cy="60" r="50" fill="none" class="ring-bg" stroke="rgba(255,255,255,0.1)" stroke-width="12"/>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="${color}" stroke-width="12"
                      stroke-dasharray="314" stroke-dashoffset="314" class="ring-progress" data-offset="${offset}"/>
                  </svg>
                  <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:2px">
                    <span class="impact-percent" data-target="${pct}" aria-label="${pct} pourcent">0</span>
                    <span class="impact-unit">%</span>
                  </div>
                </div>
                <div class="impact-info">
                  <i class="fas ${escapeHtml(icon)}" aria-hidden="true"></i>
                  <h3>${escapeHtml(it.title || '')}</h3>
                  <p>${escapeHtml(it.desc || '')}</p>
                </div>
              </div>
            `;
          }).join('');

          initImpactCounters();
        }
      }
      renderSectionGallery('impactGallery', c.impact.photos);
    }

    // Boutique
    if (c.boutique) {
      if (c.boutique.tag && $('#boutiqueTag')) $('#boutiqueTag').textContent = c.boutique.tag;
      if (c.boutique.title && $('#boutique-title')) $('#boutique-title').textContent = c.boutique.title;
      if (c.boutique.lead && $('#boutiqueLead')) $('#boutiqueLead').textContent = c.boutique.lead;
      if (c.boutique.address && $('#boutiqueAddress')) $('#boutiqueAddress').innerHTML = escapeHtml(c.boutique.address).replace(/\n/g, '<br>');
      if (c.boutique.hours && $('#boutiqueHours')) $('#boutiqueHours').textContent = c.boutique.hours;
      if (c.boutique.prices && $('#boutiquePrices')) $('#boutiquePrices').textContent = c.boutique.prices;

      const bPhotos = (Array.isArray(c.boutique.photos) && c.boutique.photos.length) 
        ? c.boutique.photos 
        : (c.boutique.photo ? [c.boutique.photo] : []);
      const primaryPhoto = bPhotos.length > 0 ? bPhotos[0] : (c.boutique.photo || '');

      const visualContainer = $('#boutiqueVisual');
      if (visualContainer) {
        if (primaryPhoto) {
          visualContainer.innerHTML = `
            <div class="boutique-photo-wrapper">
              <img src="${escapeHtml(primaryPhoto)}" alt="${escapeHtml(c.boutique.title || 'La Halle aux Artistes')}">
            </div>
          `;
        } else {
          visualContainer.innerHTML = `
            <div class="boutique-card-visual" id="boutiqueCardVisual">
              <i class="fas fa-store-alt"></i>
              <p>${escapeHtml(c.boutique.title || 'Halle aux Artistes')}</p>
              <span>Châteauneuf-d'Ille-et-Vilaine</span>
            </div>
          `;
        }
      }

      if (bPhotos.length > 1) {
        renderSectionGallery('boutiqueGallery', bPhotos);
      } else {
        renderSectionGallery('boutiqueGallery', []);
      }
    }

    // ESAT
    if (c.esat) {
      if (c.esat.tag && $('#esatTag')) $('#esatTag').innerHTML = `<i class="fas fa-hands-helping" aria-hidden="true"></i> ${escapeHtml(c.esat.tag)}`;
      if (c.esat.title && $('#esat-title')) $('#esat-title').textContent = c.esat.title;
      if (c.esat.description && $('#esatDesc')) $('#esatDesc').textContent = c.esat.description;
      if (c.esat.partnerName && $('#esatPartnerName')) $('#esatPartnerName').textContent = c.esat.partnerName;
      if (c.esat.partnerDesc && $('#esatPartnerDesc')) $('#esatPartnerDesc').textContent = c.esat.partnerDesc;

      const esatPhotos = (Array.isArray(c.esat.photos) && c.esat.photos.length)
        ? c.esat.photos
        : (c.esat.photo ? [c.esat.photo] : []);
      const primaryEsatPhoto = esatPhotos.length > 0 ? esatPhotos[0] : (c.esat.photo || '');

      const photoContainer = $('#esatPhotoContainer');
      if (photoContainer) {
        if (primaryEsatPhoto) {
          photoContainer.innerHTML = `
            <div class="esat-photo-frame">
              <img src="${escapeHtml(primaryEsatPhoto)}" alt="${escapeHtml(c.esat.partnerName || 'Atelier de tri solidaire ESAT')}">
            </div>
          `;
        } else {
          photoContainer.innerHTML = `
            <div class="esat-photo-fallback" id="esatDefaultVisual">
              <div class="esat-fallback-icon" aria-hidden="true"><i class="fas fa-hands-helping"></i></div>
              <h4>Atelier de tri solidaire</h4>
              <p>Valorisation culturelle &amp; inclusion par le travail</p>
              <span class="esat-fallback-tag"><i class="fas fa-check-circle" aria-hidden="true"></i> ${escapeHtml(c.esat.partnerName || "Châteauneuf-d'Ille-et-Vilaine")}</span>
            </div>
          `;
        }
      }

      if (Array.isArray(c.esat.items) && c.esat.items.length) {
        const icons = ['fa-hands-helping', 'fa-leaf', 'fa-balance-scale'];
        const grid = $('#esatGrid');
        if (grid) {
          grid.innerHTML = c.esat.items.map((it, i) => `
            <div class="esat-card reveal visible active" style="--delay: ${i * 0.15}s">
              <div class="esat-icon" aria-hidden="true"><i class="fas ${icons[i % icons.length]}"></i></div>
              <h3>${escapeHtml(it.title)}</h3>
              <p>${escapeHtml(it.desc)}</p>
            </div>
          `).join('');
        }
      }

      if (esatPhotos.length > 1) {
        renderSectionGallery('esatGallery', esatPhotos);
      } else {
        renderSectionGallery('esatGallery', []);
      }
    }

    // Équipe
    if (c.equipe) {
      if (c.equipe.tag && $('#equipeTag')) $('#equipeTag').textContent = c.equipe.tag;
      if (c.equipe.title && $('#equipe-title')) $('#equipe-title').textContent = c.equipe.title;
      if (c.equipe.description && $('#equipeDesc')) $('#equipeDesc').textContent = c.equipe.description;
      if (Array.isArray(c.equipe.members) && c.equipe.members.length) {
        const grid = $('#equipeGrid');
        if (grid) {
          grid.innerHTML = c.equipe.members.map((m, i) => {
            const avatarHtml = m.photo 
              ? `<img src="${escapeHtml(m.photo)}" alt="${escapeHtml(m.name)}">`
              : `<i class="fas fa-user"></i>`;
            return `
              <div class="team-card reveal visible active" style="--delay: ${i * 0.15}s">
                <div class="team-avatar" aria-hidden="true">${avatarHtml}</div>
                <h3>${escapeHtml(m.name)}</h3>
                <span class="team-role">${escapeHtml(m.role)}</span>
                <p>${escapeHtml(m.bio)}</p>
              </div>
            `;
          }).join('');
        }
      }
    }

    // FAQ
    if (c.faq) {
      if (c.faq.tag && $('#faqTag')) $('#faqTag').textContent = c.faq.tag;
      if (c.faq.title && $('#faq-title')) $('#faq-title').textContent = c.faq.title;
      if (c.faq.description && $('#faqDesc')) $('#faqDesc').textContent = c.faq.description;

      const accordion = $('#faqAccordion');
      const faqSec = $('#faq');
      if (accordion && Array.isArray(c.faq.items)) {
        if (c.faq.items.length === 0) {
          if (faqSec) faqSec.style.display = 'none';
        } else {
          if (faqSec) faqSec.style.display = '';
          accordion.innerHTML = c.faq.items.map((item, idx) => `
            <div class="faq-item reveal visible active" style="--delay: ${idx * 0.08}s">
              <button class="faq-question" type="button" aria-expanded="false" aria-controls="faq-ans-${idx}">
                <span>${escapeHtml(item.question)}</span>
                <span class="faq-icon" aria-hidden="true"><i class="fas fa-chevron-down"></i></span>
              </button>
              <div class="faq-answer" id="faq-ans-${idx}" role="region">
                <p>${escapeHtml(item.answer)}</p>
              </div>
            </div>
          `).join('');

          // Écouteurs d'ouverture / fermeture d'accordéon
          const faqItems = accordion.querySelectorAll('.faq-item');
          faqItems.forEach(item => {
          const btn = item.querySelector('.faq-question');
          if (!btn) return;
          btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');
            // Ferme les autres questions pour une lecture épurée
            faqItems.forEach(other => {
              if (other !== item) {
                other.classList.remove('active');
                const otherBtn = other.querySelector('.faq-question');
                if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
              }
            });
            if (isOpen) {
              item.classList.remove('active');
              btn.setAttribute('aria-expanded', 'false');
            } else {
              item.classList.add('active');
              btn.setAttribute('aria-expanded', 'true');
            }
          });
        });

          // Enrichissement dynamique du JSON-LD Schema.org pour Google
          updateSchemaOrgFaq(c.faq.items);
        }
      }
    }

    // Contact
    if (c.contact) {
      if (c.contact.tag && $('#contactTag')) $('#contactTag').textContent = c.contact.tag;
      if (c.contact.title && $('#contact-title')) $('#contact-title').textContent = c.contact.title;
      if (c.contact.description && $('#contactDesc')) $('#contactDesc').textContent = c.contact.description;
      if (c.contact.email) {
        if ($('#contactEmailText')) $('#contactEmailText').textContent = c.contact.email;
        if ($('#link-email')) $('#link-email').href = `mailto:${c.contact.email}`;
      }
      if (c.contact.supportEmail) {
        if ($('#contactSupportEmailText')) $('#contactSupportEmailText').textContent = `${c.contact.supportEmail} (Support)`;
        if ($('#link-support-email')) $('#link-support-email').href = `mailto:${c.contact.supportEmail}`;
      }
      if (c.contact.instagram && $('#contactInstaText')) $('#contactInstaText').textContent = c.contact.instagram;
      if (c.contact.facebook && $('#contactFbText')) $('#contactFbText').textContent = c.contact.facebook;
      if (c.contact.website) {
        if ($('#contactWebText')) $('#contactWebText').textContent = c.contact.website;
        const webUrl = c.contact.website.startsWith('http') ? c.contact.website : `https://${c.contact.website}`;
        if ($('#link-website')) $('#link-website').href = webUrl;
        if ($('#footer-website')) {
          $('#footer-website').href = webUrl;
          $('#footer-website').innerHTML = `<i class="fas fa-globe" aria-hidden="true"></i> ${escapeHtml(c.contact.website)}`;
        }
      }
    }

    // Réinitialiser les animations d'apparition pour les nouveaux éléments
    initReveal();
  }

  // ─── Mise à jour dynamique du schéma JSON-LD pour Google ───
  function updateSchemaOrgFaq(items) {
    if (!Array.isArray(items) || !items.length) return;
    try {
      const scriptEl = $('#schema-org-data');
      if (!scriptEl) return;
      const data = JSON.parse(scriptEl.textContent || '{}');
      if (!Array.isArray(data['@graph'])) data['@graph'] = [];
      data['@graph'] = data['@graph'].filter(node => node['@type'] !== 'FAQPage');
      data['@graph'].push({
        '@type': 'FAQPage',
        '@id': 'https://recupculture.fr/#faq',
        'mainEntity': items.map(it => ({
          '@type': 'Question',
          'name': it.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': it.answer
          }
        }))
      });
      scriptEl.textContent = JSON.stringify(data, null, 2);
    } catch (_) {}
  }

  // ─── Gestion du Thème (Clair / Sombre) ───────────────
  function initTheme() {
    const toggleBtn = $('#themeToggle');
    const root = document.documentElement;

    function getPreferredTheme() {
      try {
        const saved = localStorage.getItem('recupculture_theme');
        if (saved === 'light' || saved === 'dark') return saved;
      } catch (_) {}
      return 'light'; // Thème clair sélectionné par défaut
    }

    function applyTheme(theme, save = true) {
      root.setAttribute('data-theme', theme);
      if (save) {
        try {
          localStorage.setItem('recupculture_theme', theme);
        } catch (_) {}
      }
      if (toggleBtn) {
        const isDark = theme === 'dark';
        toggleBtn.setAttribute('aria-checked', isDark ? 'true' : 'false');
        const titleText = isDark ? 'Passer au mode clair' : 'Passer au mode sombre';
        toggleBtn.setAttribute('title', titleText);
        toggleBtn.setAttribute('aria-label', titleText);
      }
    }

    // Synchroniser l'état initial
    const initialTheme = root.getAttribute('data-theme') || getPreferredTheme();
    applyTheme(initialTheme, false);

    // Événement clic sur le switcher
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const current = root.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next, true);
      });
    }

    // Écouter le changement de préférence système si aucun choix manuel n'a été mémorisé
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
        try {
          if (!localStorage.getItem('recupculture_theme')) {
            applyTheme(e.matches ? 'light' : 'dark', false);
          }
        } catch (_) {}
      });
    }
  }

  // ─── Écoute des mises à jour admin ─────────────────
  function listenForDataUpdates() {
    window.addEventListener('storage', e => {
      if (e.key === 'recupculture_data') {
        try {
          appData = JSON.parse(e.newValue);
          renderSiteContent();
          renderNews();
          renderMapPoints();
        } catch (_) {}
      }
    });
  }

  // ─── Initialisation ────────────────────────────────
  async function init() {
    initTheme();
    await loadData();
    renderSiteContent();
    initNavbar();
    initReveal();
    initImpactCounters();
    initMap();
    renderNews();
    initModals();
    initContactForm();
    listenForDataUpdates();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
