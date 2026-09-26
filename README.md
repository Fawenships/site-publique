# WEBORA — Backend V1 (Boutique)

Boucle complète et fonctionnelle : formulaire → base de données → site généré et publié.

## Installation

```bash
npm install
cp .env.example .env
```

Ouvrez `.env` et renseignez votre `DATABASE_URL` (une base PostgreSQL, locale ou hébergée — ex. Supabase, Railway, Neon).

## Initialiser la base de données

```bash
npm run db:init
```

(ou copiez/collez le contenu de `schema.sql` dans votre client PostgreSQL habituel)

## Démarrer le serveur

```bash
npm start
```

Puis ouvrez **http://localhost:3000**

## Ce qui fonctionne déjà

1. Le formulaire (`/`) collecte : nom, description, contact, produits
2. `POST /api/sites` enregistre ces informations en base (table `sites`)
3. `GET /site/:slug` régénère le site à la volée à partir du template `templates/boutique-01.html` + des données stockées
4. Renvoyer le même `slug` deux fois **met à jour** le site existant (pas de doublon)

## Ce qui reste à faire (suite de la roadmap)

- Étape 12 — Authentification (pour l'instant, tout le monde peut créer/modifier n'importe quel slug)
- Étape 13-14 — Dashboard (lister/éditer/dépublier ses propres sites)
- Upload réel du logo et des photos produits (actuellement : couleurs de remplacement)
- Modèles Restaurant / Salon / Agence (même principe, un fichier par modèle dans `templates/`)
