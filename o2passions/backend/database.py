"""Connexion à la base PostgreSQL et utilitaires d'accès aux données.

Remplace le module `database.py` (SQLite) prévu initialement par une
connexion PostgreSQL via psycopg2, avec un pool de connexions simple.
Toutes les requêtes utilisent des requêtes paramétrées (jamais de
concaténation de chaînes) pour éviter les injections SQL.
"""

import psycopg2.extras
from psycopg2 import pool

from config import Config

_pool = None


def init_pool(minconn=1, maxconn=10):
    """Initialise le pool de connexions PostgreSQL (appelé au démarrage de l'app)."""
    global _pool
    if _pool is None:
        _pool = pool.SimpleConnectionPool(
            minconn, maxconn, dsn=Config.DATABASE_URL
        )
    return _pool


def get_pool():
    if _pool is None:
        init_pool()
    return _pool


class DBConnection:
    """Context manager: emprunte une connexion au pool et la restitue à la sortie.

    Utilisation :
        with DBConnection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT ...")
    """

    def __enter__(self):
        self.conn = get_pool().getconn()
        return self.conn

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            self.conn.commit()
        else:
            self.conn.rollback()
        get_pool().putconn(self.conn)


def dict_cursor(conn):
    """Retourne un curseur qui produit des lignes sous forme de dict."""
    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)


def fetch_one(query, params=None):
    with DBConnection() as conn:
        with dict_cursor(conn) as cur:
            cur.execute(query, params or ())
            row = cur.fetchone()
            return dict(row) if row else None


def fetch_all(query, params=None):
    with DBConnection() as conn:
        with dict_cursor(conn) as cur:
            cur.execute(query, params or ())
            rows = cur.fetchall()
            return [dict(r) for r in rows]


def execute(query, params=None):
    """Exécute une requête d'écriture (INSERT/UPDATE/DELETE) sans retour de lignes."""
    with DBConnection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params or ())


def execute_returning(query, params=None):
    """Exécute une requête avec clause RETURNING et renvoie la ligne produite."""
    with DBConnection() as conn:
        with dict_cursor(conn) as cur:
            cur.execute(query, params or ())
            row = cur.fetchone()
            return dict(row) if row else None
