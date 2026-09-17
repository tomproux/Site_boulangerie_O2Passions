"""Configuration de l'application Flask, chargée depuis les variables d'environnement.

Aucune clé secrète n'est codée en dur ici : tout provient de l'environnement
(.env en local, variables d'environnement du service d'hébergement en
production). Voir .env.example pour la liste des clés attendues.
"""

import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    # Base de données PostgreSQL (remplace le SQLite du MVP initial,
    # cf. section 11 du cahier des charges — migration anticipée).
    DATABASE_URL = os.environ.get(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/o2passions"
    )

    # Authentification JWT
    JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-me")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRES_HOURS = int(os.environ.get("JWT_EXPIRES_HOURS", "24"))

    # Stripe (paiement carte bancaire)
    STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
    STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

    # CORS : origine autorisée pour le front-end (statique, servi séparément)
    FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5500")

    # Divers
    ENV = os.environ.get("FLASK_ENV", "development")
    DEBUG = ENV == "development"
