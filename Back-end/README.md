# API Ô2 Passions

API Flask du site Ô2 Passions. La base de données cible est PostgreSQL.

## Démarrage local

Pré-requis : Python 3.11+ et PostgreSQL 14+.

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

L’application est disponible sur http://localhost:5000 et sert également les fichiers de `Front-end/`.

## Configuration

- `DATABASE_URL` : URL PostgreSQL complète.
- `JWT_SECRET` : secret long et aléatoire pour les tokens.
- `FRONTEND_ORIGIN` : origine autorisée pour CORS.
- `PORT` : port HTTP, 5000 par défaut.

Ne pas utiliser les valeurs de `.env.example` en production.

## API livrée

- `GET /api/health`
- `GET /api/categories`, `GET /api/products`, `GET /api/products/<slug>`
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `POST /api/orders`, `GET /api/orders`, `GET /api/orders/<id>`
- Routes administrateur produits et commandes sous `/api/admin/*`

Les commandes recalculent le montant avec les prix stockés en base et vérifient la disponibilité côté serveur.

## Compte administrateur

Créer un compte normal via l'interface, puis promouvoir son rôle dans PostgreSQL :

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

Le paiement carte Stripe reste un point d’intégration : le MVP enregistre la commande en `PENDING`; aucun paiement réel ne doit être simulé en production.
