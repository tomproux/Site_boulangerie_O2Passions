"""Modèle OrderItem — accès à la table `order_items`."""

from database import execute_returning, fetch_all


class OrderItem:
    @staticmethod
    def create(order_id, product_id, quantity, unit_price):
        total_price = round(quantity * unit_price, 2)
        return execute_returning(
            """
            INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *
            """,
            (order_id, product_id, quantity, unit_price, total_price),
        )

    @staticmethod
    def find_by_order_id(order_id):
        return fetch_all(
            """
            SELECT oi.*, p.name AS product_name, p.slug AS product_slug, p.image_url
            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = %s
            """,
            (order_id,),
        )
