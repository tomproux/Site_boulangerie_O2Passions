"""Modèle Order — accès à la table `orders`."""

from database import execute_returning, fetch_all, fetch_one


class Order:
    @staticmethod
    def create(user_id, reception_mode, scheduled_date, scheduled_time_slot,
               total_amount, delivery_address=None):
        return execute_returning(
            """
            INSERT INTO orders
                (user_id, reception_mode, scheduled_date, scheduled_time_slot,
                 delivery_address, total_amount)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING *
            """,
            (user_id, reception_mode, scheduled_date, scheduled_time_slot,
             delivery_address, total_amount),
        )

    @staticmethod
    def find_by_id(order_id):
        return fetch_one("SELECT * FROM orders WHERE id = %s", (order_id,))

    @staticmethod
    def find_by_user_id(user_id):
        return fetch_all(
            "SELECT * FROM orders WHERE user_id = %s ORDER BY created_at DESC", (user_id,)
        )

    @staticmethod
    def find_all_for_admin(status=None, reception_mode=None, date_from=None, date_to=None):
        query = (
            "SELECT o.*, u.first_name, u.last_name, u.email "
            "FROM orders o JOIN users u ON u.id = o.user_id WHERE 1=1"
        )
        params = []
        if status:
            query += " AND o.status = %s"
            params.append(status)
        if reception_mode:
            query += " AND o.reception_mode = %s"
            params.append(reception_mode)
        if date_from:
            query += " AND o.scheduled_date >= %s"
            params.append(date_from)
        if date_to:
            query += " AND o.scheduled_date <= %s"
            params.append(date_to)
        query += " ORDER BY o.created_at DESC"
        return fetch_all(query, tuple(params))

    @staticmethod
    def update_status(order_id, status):
        return execute_returning(
            "UPDATE orders SET status = %s WHERE id = %s RETURNING *", (status, order_id)
        )

    @staticmethod
    def update_payment_status(order_id, payment_status, stripe_payment_intent=None):
        return execute_returning(
            """
            UPDATE orders
            SET payment_status = %s,
                stripe_payment_intent = COALESCE(%s, stripe_payment_intent)
            WHERE id = %s
            RETURNING *
            """,
            (payment_status, stripe_payment_intent, order_id),
        )

    @staticmethod
    def cancel(order_id, reason):
        return execute_returning(
            "UPDATE orders SET status = 'CANCELLED', cancel_reason = %s WHERE id = %s RETURNING *",
            (reason, order_id),
        )

    @staticmethod
    def attach_payment_intent(order_id, payment_intent_id):
        return execute_returning(
            "UPDATE orders SET stripe_payment_intent = %s WHERE id = %s RETURNING *",
            (payment_intent_id, order_id),
        )
