"""Modèle Product — accès à la table `products`."""

from database import execute, execute_returning, fetch_all, fetch_one


class Product:
    BASE_SELECT = """
        SELECT p.*, c.name AS category_name, c.slug AS category_slug
        FROM products p
        JOIN categories c ON c.id = p.category_id
    """

    @staticmethod
    def create(name, slug, description, price, category_id, image_url=None, is_available=True):
        return execute_returning(
            """
            INSERT INTO products (name, slug, description, price, category_id, image_url, is_available)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (name, slug, description, price, category_id, image_url, is_available),
        )

    @staticmethod
    def find_all(category_id=None, search=None, only_available=None):
        query = Product.BASE_SELECT + " WHERE 1=1"
        params = []
        if category_id:
            query += " AND p.category_id = %s"
            params.append(category_id)
        if search:
            query += " AND (p.name ILIKE %s OR p.description ILIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])
        if only_available is not None:
            query += " AND p.is_available = %s"
            params.append(only_available)
        query += " ORDER BY p.name ASC"
        return fetch_all(query, tuple(params))

    @staticmethod
    def find_by_id(product_id):
        return fetch_one(Product.BASE_SELECT + " WHERE p.id = %s", (product_id,))

    @staticmethod
    def find_by_slug(slug):
        return fetch_one(Product.BASE_SELECT + " WHERE p.slug = %s", (slug,))

    @staticmethod
    def find_by_category(category_id):
        return fetch_all(
            Product.BASE_SELECT + " WHERE p.category_id = %s ORDER BY p.name ASC",
            (category_id,),
        )

    @staticmethod
    def update(product_id, **fields):
        allowed = {"name", "slug", "description", "price", "category_id", "image_url", "is_available"}
        set_clauses, params = [], []
        for key, value in fields.items():
            if key in allowed and value is not None:
                set_clauses.append(f"{key} = %s")
                params.append(value)
        if not set_clauses:
            return Product.find_by_id(product_id)
        params.append(product_id)
        return execute_returning(
            f"UPDATE products SET {', '.join(set_clauses)} WHERE id = %s RETURNING *",
            tuple(params),
        )

    @staticmethod
    def toggle_availability(product_id, is_available):
        return execute_returning(
            "UPDATE products SET is_available = %s WHERE id = %s RETURNING *",
            (is_available, product_id),
        )

    @staticmethod
    def delete(product_id):
        # Soft delete : on désactive plutôt que de supprimer, pour préserver
        # l'historique des commandes (cf. règles d'intégrité, section 6.3).
        execute("UPDATE products SET is_available = FALSE WHERE id = %s", (product_id,))
