# RECUP CULTURE – Site Vitrine Officiel

> **Donnez une seconde vie à la culture** · Ensemble recyclons avec les ESAT (Saint-Malo, Dinard et environs).

Site vitrine 100% statique de l'association **RECUP CULTURE**, dédié à la collecte solidaire de livres, CD, DVD et jeux vidéo voués à l'incinération, triés et valorisés en partenariat avec les ESAT.

---

## 🌟 Fonctionnalités

- **Accueil immersif (Dark Mode)** : Valorisation du logo officiel, compteurs d'impact et navigation fluide.
- **Cartographie interactive** : Carte Leaflet basée sur OpenStreetMap France présentant les points de dépôt partenaires (Saint-Malo, Dinard...).
- **Présentation de la mission & de la boutique** : Horaires et adresse de *La Halle aux Artistes* à Châteauneuf-d'Ille-et-Vilaine.
- **Panneau d'administration intégré (`admin.html`)** :
  - Accès sécurisé par identifiant / mot de passe chiffré en **SHA-256**.
  - Gestion WYSIWYG des actualités et événements (Quill.js).
  - Gestion des points de collecte sur la carte avec coordonnées GPS interactives.
  - Sauvegarde locale (`localStorage`) avec import / export en fichier JSON (`config.json`).
- **Formulaire de contact** fonctionnel côté client.

---

## 🚀 Déploiement sur GitHub Pages

Ce site est 100% statique (HTML5, Vanilla CSS, JavaScript) : aucun serveur ni base de données requis.

### Pour l'activer sur GitHub :
1. Créez un dépôt sur GitHub (ex: `SiteRecupCulture` ou `recupculture.github.io`).
2. Poussez ce code sur la branche `main`.
3. Allez dans **Settings** du dépôt > **Pages**.
4. Dans **Source**, sélectionnez **Deploy from a branch** > **main** / **/(root)** > **Save**.
5. Votre site sera automatiquement en ligne à l'adresse :
   - `https://<compte>.github.io/<nom-du-depot>/` (ou directement sur votre nom de domaine personnalisé).

---

## 📂 Structure du projet

```
SiteRecupCulture/
├── index.html            # Page d'accueil publique
├── style.css             # Design system Dark & styles
├── script.js             # Interactions, carte Leaflet & filtres
├── admin.html            # Interface d'administration
├── admin.css             # Styles de l'administration
├── admin.js              # Moteur auth SHA-256, Quill WYSIWYG, CRUD
├── assets/
│   ├── logo.png          # Logo officiel détouré transparent HD
├── data/
│   ├── config.json       # Points de collecte & actualités par défaut
│   └── credentials.json  # Structure des comptes administrateurs
├── .gitignore
└── README.md
```
