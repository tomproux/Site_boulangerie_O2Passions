# O2Passions — Site web de boulangerie-pâtisserie

Implémentation complète du MVP décrit dans la documentation technique :
vitrine des produits, informations pratiques, compte client, panier,
commande en ligne avec paiement, et back-office de gestion.

**Stack :** HTML / CSS / JavaScript vanilla (front-end) · Python + Flask (API REST) ·
**PostgreSQL** (base de données) · Stripe (paiement) · pytest + Jest (tests) ·
GitHub Actions (CI/CD).

> **Écart assumé par rapport à la documentation d'origine :** la base de données est
> PostgreSQL et non SQLite. La migration prévue en section 11 (« Évolutions possibles »)
> est donc appliquée dès cette version : types natifs (`UUID`, `NUMERIC`, `BOOLEAN`,
> `TIMESTAMPTZ`, `DATE`, `JSONB`), contraintes `CHECK`, clés étrangères actives par
> défaut, et triggers pour `updated_at`. Les autres évolutions futures (fidélité,
> stocks temps réel, multi-boutiques, PWA…) ne sont pas incluses, conformément au
> périmètre du MVP.

## Arborescence

```
o2passions/
├── backend/                    # API Flask
│   ├── app.py                  # point d'entrée, enregistrement des blueprints
│   ├── config.py               # configuration via variables d'environnement
│   ├── database.py             # pool de connexions PostgreSQL (psycopg2)
│   ├── middleware.py           # décorateurs login_required / admin_required
│   ├── init_db.py              # application du schéma + création d'un admin
│   ├── schema.sql              # schéma PostgreSQL + données de démonstration
│   ├── models/                 # accès aux données (user, product, category, order…)
│   ├── services/               # logique métier (auth, produits, commandes, paiement)
│   ├── routes/                 # blueprints /api/auth, /api/products, /api/orders, /api/admin
│   └── tests/                  # tests pytest
└── frontend/                   # site public + back-office
    ├── index.html              # accueil (bannière, catégories, phares, horaires)
    ├── categorie.html          # liste des produits avec filtres
    ├── produit.html            # détail d'un produit
    ├── panier.html             # panier
    ├── checkout.html           # commande et paiement
    ├── compte.html             # profil et historique des commandes
    ├── connexion.html / inscription.html
    ├── admin/                  # back-office (tableau de bord, produits, commandes, paramètres)
    ├── css/style.css           # feuille de style commune (palette marron et blanc)
    ├── js/                     # api, auth, products, cart, checkout, account
    └── tests/                  # tests Jest
```

## Installation

### 1. Base de données PostgreSQL

```bash
createdb o2passions
```

### 2. Back-end

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows : .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env          # puis renseigner DATABASE_URL et JWT_SECRET
```

Initialisation du schéma et création d'un compte administrateur :

```bash
python init_db.py --admin --email admin@o2passions.fr --password votre-mot-de-passe
```

Lancement de l'API (port 5000) :

```bash
python app.py
```

### 3. Front-end

Les pages étant statiques, n'importe quel serveur HTTP convient :

```bash
cd frontend
python3 -m http.server 5500
```

Le site est alors accessible sur `http://localhost:5500` et le back-office sur
`http://localhost:5500/admin/index.html`.

L'URL de l'API est définie par `window.O2_API_BASE` en tête de chaque page
(`http://localhost:5000/api` par défaut). En production, remplacez cette valeur
par l'URL publique de l'API, et ajustez `FRONTEND_ORIGIN` côté back-end pour le CORS.

## Paiement Stripe

Sans `STRIPE_SECRET_KEY`, `payment_service.py` bascule en **mode simulé** : les
intentions de paiement sont générées localement et toujours acceptées. Cela permet
de dérouler le parcours de commande complet et de faire tourner les tests sans
compte Stripe.

Pour activer le paiement réel, renseignez `STRIPE_SECRET_KEY` côté back-end et
`window.O2_STRIPE_PUBLIC_KEY` dans `checkout.html`, puis chargez Stripe.js.

## Tests

```bash
# Back-end
cd backend && pytest -v          # 19 tests

# Front-end
cd frontend && npm install && npm test   # 14 tests
```

La CI (`.github/workflows/ci.yml`) exécute lint et tests sur les deux couches,
avec un service PostgreSQL éphémère, puis déclenche le déploiement staging sur
`develop` et production sur `main`.

## Couverture des User Stories

| US | Fonctionnalité | Où |
|---|---|---|
| US-01 | Vitrine et catalogue par catégorie | `index.html`, `categorie.html`, `produit.html`, `js/products.js` |
| US-02 | Horaires et localisation | section `#horaires` de `index.html`, table `shop_settings`, `admin/parametres.html` |
| US-03 | Création de compte | `inscription.html`, `POST /api/auth/register` |
| US-04 | Connexion / déconnexion | `connexion.html`, `POST /api/auth/login`, JWT |
| US-05 | Panier | `js/cart.js` (localStorage), `panier.html` |
| US-06 | Passer une commande + paiement | `checkout.html`, `POST /api/orders`, `payment_service.py` |
| US-07 | Suivi des commandes | `compte.html`, `GET /api/orders` |
| US-08 | Gestion du catalogue | `admin/produits.html`, `/api/admin/products` |
| US-09 | Gestion des commandes | `admin/commandes.html`, `/api/admin/orders` |

Les user stories Should Have (code promo, favoris, avis), Could Have (pré-commande
événement, newsletter) et Won't Have (fidélité) ne sont pas implémentées, conformément
à la priorisation MoSCoW du cahier des charges.

## Points de sécurité appliqués

- Mots de passe hachés (`werkzeug.security`, PBKDF2).
- Requêtes SQL systématiquement paramétrées (`%s`), aucune concaténation de chaîne.
- Routes admin protégées par vérification du rôle décodé depuis le JWT.
- **Total de commande recalculé côté serveur** à partir des prix en base : un prix
  falsifié par le client est ignoré (couvert par un test).
- Vérification que le client ne peut consulter que ses propres commandes (403 sinon).
- Échappement HTML de toutes les valeurs injectées dynamiquement dans le DOM
  (`echapper()` dans `js/api.js`).
- Secrets exclusivement en variables d'environnement, `.env` exclu du dépôt.
- CORS restreint à l'origine du front-end.

## Stratégie de branches

```
main                 version stable en production
└── develop          intégration des fonctionnalités validées
    ├── feature/*    développement d'une fonctionnalité
    └── fix/*        corrections de bugs
```

Pas de commit direct sur `main` ni `develop` : chaque contribution passe par une
Pull Request avec description, tests associés et au moins une revue de code, la CI
devant être verte.
