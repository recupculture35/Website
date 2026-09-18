/* ====================================================
   RECUP CULTURE – Script principal (site public)
   ==================================================== */

(function () {
  'use strict';

  // ─── Utilitaires ───────────────────────────────────
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const DEFAULT_DATA = {
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
    // 1. Essayer localStorage
    const stored = localStorage.getItem('recupculture_data');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.collectPoints)) {
          appData = parsed;
          return;
        }
      } catch (e) { /* ignore */ }
    }
    // 2. Fallback : fichier config.json
    try {
      const res = await fetch('data/config.json');
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.collectPoints)) appData = json;
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

      card.innerHTML = `
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

  // ─── Écoute des mises à jour admin ─────────────────
  function listenForDataUpdates() {
    window.addEventListener('storage', e => {
      if (e.key === 'recupculture_data') {
        try {
          appData = JSON.parse(e.newValue);
          renderNews();
          renderMapPoints();
        } catch (_) {}
      }
    });
  }

  // ─── Initialisation ────────────────────────────────
  async function init() {
    await loadData();
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
