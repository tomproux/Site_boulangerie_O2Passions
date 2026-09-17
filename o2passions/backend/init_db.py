"""Script d'initialisation : crée le schéma PostgreSQL et un compte administrateur.

Usage :
    python init_db.py                       # applique schema.sql
    python init_db.py --admin               # applique le schéma + crée un admin
    python init_db.py --admin --email a@b.c --password motdepasse

Le mot de passe peut aussi être fourni via la variable d'environnement
ADMIN_PASSWORD, pour éviter de le laisser dans l'historique du shell.
"""

import argparse
import os
import sys

import psycopg2

from config import Config
from models.user import User


def appliquer_schema():
    chemin = os.path.join(os.path.dirname(__file__), "schema.sql")
    with open(chemin, "r", encoding="utf-8") as fichier:
        sql = fichier.read()

    conn = psycopg2.connect(Config.DATABASE_URL)
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()
        print("Schéma PostgreSQL appliqué (tables, contraintes, jeu de données de démonstration).")
    finally:
        conn.close()


def creer_admin(email, password, first_name, last_name):
    if User.find_by_email(email):
        print(f"Un compte existe déjà avec l'adresse {email}. Aucun compte créé.")
        return

    if len(password) < 8:
        print("Le mot de passe doit contenir au moins 8 caractères.")
        sys.exit(1)

    User.create_user(email, password, first_name, last_name, role="ADMIN")
    print(f"Compte administrateur créé : {email}")


def main():
    parseur = argparse.ArgumentParser(description="Initialisation de la base O2Passions.")
    parseur.add_argument("--admin", action="store_true", help="Créer un compte administrateur.")
    parseur.add_argument("--email", default="admin@o2passions.fr")
    parseur.add_argument("--password", default=os.environ.get("ADMIN_PASSWORD", ""))
    parseur.add_argument("--prenom", default="Admin")
    parseur.add_argument("--nom", default="O2Passions")
    parseur.add_argument("--schema-seulement", action="store_true", help="Appliquer uniquement le schéma.")
    args = parseur.parse_args()

    appliquer_schema()

    if args.admin and not args.schema_seulement:
        if not args.password:
            print("Fournissez un mot de passe via --password ou la variable ADMIN_PASSWORD.")
            sys.exit(1)
        creer_admin(args.email, args.password, args.prenom, args.nom)


if __name__ == "__main__":
    main()
