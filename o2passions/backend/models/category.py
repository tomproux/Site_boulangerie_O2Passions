"""Modèle Category — accès à la table `categories`."""

from database import execute_returning, fetch_all, fetch_one


class Category:
    @staticmethod
    def create(name, slug, sort_order=0):
        return execute_returning(
            "INSERT INTO categories (name, slug, sort_order) VALUES (%s, %s, %s) "
            "RETURNING id, name, slug, sort_order",
            (name, slug, sort_order),
        )

    @staticmethod
    def find_all():
        return fetch_all("SELECT * FROM categories ORDER BY sort_order ASC, name ASC")

    @staticmethod
    def find_by_id(category_id):
        return fetch_one("SELECT * FROM categories WHERE id = %s", (category_id,))

    @staticmethod
    def find_by_slug(slug):
        return fetch_one("SELECT * FROM categories WHERE slug = %s", (slug,))
