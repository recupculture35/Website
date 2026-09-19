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
          { percent: 50, title: "Revente", desc: "Boutique solidaire & en ligne — accès à la culture à prix abordable" },
          { percent: 30, title: "Recyclage", desc: "Transformation en papier recyclé — zéro déchet pour la planète" },
          { percent: 20, title: "Humanitaire", desc: "Dons à des causes humanitaires — la culture au-delà des frontières" }
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
        instagram: "@RECUPCULTURE sur Instagram",
        facebook: "@RECUPCULTURE sur Facebook",
        website: "recupculture.org"
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

  let appData = JSON.parse(JSON.stringify(DEFAULT_DATA));

  async function loadData() {
    // 1. Essayer l'API backend (/api/data) en premier si servi par le serveur Node.js / Railway
    try {
      const res = await fetch('/api/data', { cache: 'no-cache' });
      if (res.ok) {
        const json = await res.json();
        if (json && (Array.isArray(json.collectPoints) || json.siteContent)) {
          appData = Object.assign({}, DEFAULT_DATA, json);
          try { localStorage.setItem('recupculture_data', JSON.stringify(appData)); } catch (_) {}
          return;
        }
      }
    } catch (_) {
      // Pas de backend actif (ouverture file:// ou statique direct)
    }

    // 2. Essayer localStorage (cache navigateur / admin local)
    const stored = localStorage.getItem('recupculture_data');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && (Array.isArray(parsed.collectPoints) || parsed.siteContent)) {
          appData = Object.assign({}, DEFAULT_DATA, parsed);
          return;
        }
      } catch (e) { /* ignore */ }
    }

    // 3. Fallback : fichier statique data/config.json
    try {
      const res = await fetch('data/config.json');
      if (res.ok) {
        const json = await res.json();
        if (json && (Array.isArray(json.collectPoints) || json.siteContent)) {
          appData = Object.assign({}, DEFAULT_DATA, json);
        }
      }
    } catch (e) {
      // Sous file://, fetch est bloqué par sécurité browser : DEFAULT_DATA est déjà actif
    }
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
    }, { threshold: 0.12 });

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

  function initImpactCounters() {
    const impactSection = $('#impact');
    if (!impactSection) return;

    let triggered = false;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !triggered) {
        triggered = true;

        // Compteurs chiffres
        $$('.impact-percent').forEach(el => {
          const target = parseInt(el.dataset.target, 10);
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
      }
    }, { threshold: 0.3 });

    observer.observe(impactSection);
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

      const marker = L.marker([pt.lat, pt.lng], { icon: getCustomIcon() })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:'Inter',sans-serif;min-width:180px">
            <strong style="font-family:'Outfit',sans-serif;font-size:1rem">${escapeHtml(pt.name)}</strong><br>
            <span style="color:#718096;font-size:0.85rem">${escapeHtml(pt.address)}</span>
            ${pt.description ? `<p style="margin:8px 0 4px;font-size:0.85rem">${escapeHtml(pt.description)}</p>` : ''}
            ${pt.hours ? `<span style="color:#2e7d32;font-size:0.82rem"><i class="fas fa-clock"></i> ${escapeHtml(pt.hours)}</span>` : ''}
          </div>
        `);

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
            <div class="point-card-icon" aria-hidden="true"><i class="fas fa-map-marker-alt"></i></div>
            <div>
              <h4>${escapeHtml(pt.name)}</h4>
              <span class="point-address">${escapeHtml(pt.address)}</span>
            </div>
          </div>
          ${pt.description ? `<p class="point-desc">${escapeHtml(pt.description)}</p>` : ''}
          ${pt.hours ? `<p class="point-hours"><i class="fas fa-clock" aria-hidden="true"></i>${escapeHtml(pt.hours)}</p>` : ''}
        `;

        const focusPoint = () => {
          map.setView([pt.lat, pt.lng], 15);
          marker.openPopup();
          $$('.point-card').forEach(c => c.classList.remove('active'));
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
      const excerpt = stripHtml(item.content || '').substring(0, 120) + (stripHtml(item.content || '').length > 120 ? '…' : '');
      const mediaHtml = item.image ? `
        <div class="news-card-media">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}">
        </div>
      ` : '';

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
      grid.insertBefore(card, empty);
    });
  }

  // ─── Formulaire de contact ─────────────────────────
  function initContactForm() {
    const form    = $('#contactForm');
    const success = $('#formSuccess');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();

      // Validation basique
      const name  = $('#contactName').value.trim();
      const email = $('#contactEmail').value.trim();
      const msg   = $('#contactMessage').value.trim();

      if (!name || !email || !msg) {
        alert('Veuillez remplir tous les champs obligatoires (*).');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Veuillez saisir une adresse e-mail valide.');
        return;
      }

      // Simulation envoi (site statique – mailto ou EmailJS possible)
      const btn = $('#contactSubmit');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Envoi en cours…</span>';

      setTimeout(() => {
        form.reset();
        if (success) success.classList.add('show');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> <span>Envoyer le message</span>';

        setTimeout(() => { if (success) success.classList.remove('show'); }, 6000);
      }, 1200);
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
    const c = appData.siteContent;
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
            <div class="mission-step reveal active" style="--delay: ${i * 0.15}s">
              <div class="step-icon" style="--color: ${colors[i % colors.length]}" aria-hidden="true">
                <i class="fas ${icons[i % icons.length]}"></i>
              </div>
              <h3>${escapeHtml(st.title)}</h3>
              <p>${escapeHtml(st.desc)}</p>
            </div>
          `).join('');
        }
      }
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
            <div class="collect-card reveal active" style="--delay: ${i * 0.1}s">
              <div class="collect-icon" aria-hidden="true"><i class="fas ${icons[i % icons.length]}"></i></div>
              <h3>${escapeHtml(it.title)}</h3>
              <p>${escapeHtml(it.desc)}</p>
            </div>
          `).join('');
        }
      }
    }

    // Impact
    if (c.impact) {
      if (c.impact.tag && $('#impactTag')) $('#impactTag').textContent = c.impact.tag;
      if (c.impact.title && $('#impact-title')) $('#impact-title').textContent = c.impact.title;
      if (c.impact.description && $('#impactDesc')) $('#impactDesc').textContent = c.impact.description;
    }

    // Boutique
    if (c.boutique) {
      if (c.boutique.tag && $('#boutiqueTag')) $('#boutiqueTag').textContent = c.boutique.tag;
      if (c.boutique.title && $('#boutique-title')) $('#boutique-title').textContent = c.boutique.title;
      if (c.boutique.lead && $('#boutiqueLead')) $('#boutiqueLead').textContent = c.boutique.lead;
      if (c.boutique.address && $('#boutiqueAddress')) $('#boutiqueAddress').innerHTML = escapeHtml(c.boutique.address).replace(/\n/g, '<br>');
      if (c.boutique.hours && $('#boutiqueHours')) $('#boutiqueHours').textContent = c.boutique.hours;
      if (c.boutique.prices && $('#boutiquePrices')) $('#boutiquePrices').textContent = c.boutique.prices;

      const visualContainer = $('#boutiqueVisual');
      if (visualContainer) {
        if (c.boutique.photo) {
          visualContainer.innerHTML = `
            <div class="boutique-photo-wrapper">
              <img src="${escapeHtml(c.boutique.photo)}" alt="${escapeHtml(c.boutique.title || 'La Halle aux Artistes')}">
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
    }

    // ESAT
    if (c.esat) {
      if (c.esat.tag && $('#esatTag')) $('#esatTag').innerHTML = `<i class="fas fa-hands-helping" aria-hidden="true"></i> ${escapeHtml(c.esat.tag)}`;
      if (c.esat.title && $('#esat-title')) $('#esat-title').textContent = c.esat.title;
      if (c.esat.description && $('#esatDesc')) $('#esatDesc').textContent = c.esat.description;
      if (c.esat.partnerName && $('#esatPartnerName')) $('#esatPartnerName').textContent = c.esat.partnerName;
      if (c.esat.partnerDesc && $('#esatPartnerDesc')) $('#esatPartnerDesc').textContent = c.esat.partnerDesc;

      const photoContainer = $('#esatPhotoContainer');
      if (photoContainer) {
        if (c.esat.photo) {
          photoContainer.innerHTML = `
            <div class="esat-photo-frame">
              <img src="${escapeHtml(c.esat.photo)}" alt="${escapeHtml(c.esat.partnerName || 'Atelier de tri solidaire ESAT')}">
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
            <div class="esat-card reveal active" style="--delay: ${i * 0.15}s">
              <div class="esat-icon" aria-hidden="true"><i class="fas ${icons[i % icons.length]}"></i></div>
              <h3>${escapeHtml(it.title)}</h3>
              <p>${escapeHtml(it.desc)}</p>
            </div>
          `).join('');
        }
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
              <div class="team-card reveal active" style="--delay: ${i * 0.15}s">
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

    // Contact
    if (c.contact) {
      if (c.contact.tag && $('#contactTag')) $('#contactTag').textContent = c.contact.tag;
      if (c.contact.title && $('#contact-title')) $('#contact-title').textContent = c.contact.title;
      if (c.contact.description && $('#contactDesc')) $('#contactDesc').textContent = c.contact.description;
      if (c.contact.instagram && $('#contactInstaText')) $('#contactInstaText').textContent = c.contact.instagram;
      if (c.contact.facebook && $('#contactFbText')) $('#contactFbText').textContent = c.contact.facebook;
      if (c.contact.website && $('#contactWebText')) $('#contactWebText').textContent = c.contact.website;
    }
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
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
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
    initContactForm();
    listenForDataUpdates();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
