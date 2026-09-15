# Ô2 Passions

Site vitrine et prise de commande pour une boulangerie-pâtisserie artisanale. Le projet comprend un front-end HTML/CSS/JavaScript natif et une API Flask connectée à PostgreSQL.

## Fonctionnalités livrées

- Accueil éditorial marron et blanc, horaires, adresse et contact.
- Catalogue par catégories : pains, viennoiseries, pâtisseries et ventes additionnelles.
- Fiche produit, prix et disponibilité.
- Panier conservé dans `localStorage` avec quantités et suppression.
- Création de compte, connexion JWT et espace client.
- Commande pour retrait en boutique ou livraison locale.
- Historique des commandes côté client.
- Tableau d’administration protégé par rôle pour consulter les produits et commandes.
- Validation serveur, recalcul du total à partir des prix PostgreSQL et contrôles de disponibilité.

## Architecture

```text
Back-end/
  app.py            API Flask et service des fichiers statiques
  schema.sql        schéma PostgreSQL et données initiales
  requirements.txt  dépendances Python
  .env.example      variables d’environnement
Front-end/
  O2Passions.html  accueil
  O2Passions.js    rendu partagé et appels API
  style.css        système visuel responsive marron/blanc
  catalogue.html, produit.html, panier.html
  connexion.html, inscription.html, checkout.html, compte.html, admin.html
```

## Lancer le projet

Pré-requis : Python 3.11+, PostgreSQL 14+.

```bash
cd Back-end
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
createdb o2passions
psql "$DATABASE_URL" -f schema.sql
python app.py
```

Ouvrir ensuite http://localhost:5000. Flask sert le front-end et expose l’API sous `/api`.

## PostgreSQL

La variable `DATABASE_URL` doit pointer vers la base PostgreSQL. Le schéma utilise des UUID, des contraintes `CHECK`, des relations étrangères et `NUMERIC(10, 2)` pour les montants.

```env
DATABASE_URL=postgresql://o2passions:o2passions@localhost:5432/o2passions
JWT_SECRET=une-valeur-longue-et-aleatoire
PORT=5000
```

Ne jamais utiliser les secrets d’exemple en production.

## Administration

Créer un compte via `inscription.html`, puis promouvoir son rôle dans PostgreSQL :

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

Ouvrir ensuite `http://localhost:5000/admin.html`.

## API principale

- `GET /api/health`
- `GET /api/categories`
- `GET /api/products` et `GET /api/products/<slug>`
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `POST /api/orders`, `GET /api/orders`, `GET /api/orders/<id>`
- `GET /api/admin/products`, `POST /api/admin/products`, `PATCH /api/admin/products/<id>`
- `GET /api/admin/orders`, `PATCH /api/admin/orders/<id>`

Le paiement réel Stripe reste à brancher sur le point d’intégration prévu : les commandes sont créées en statut `PENDING` et ne simulent aucun paiement.
