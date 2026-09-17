"""Modèle User — accès à la table `users`.

Attributs : id, email, password_hash, first_name, last_name, phone,
role, created_at, updated_at (cf. section 5.3 de la documentation).
"""

from werkzeug.security import check_password_hash, generate_password_hash

from database import execute_returning, fetch_all, fetch_one


class User:
    @staticmethod
    def create_user(email, password, first_name, last_name, phone=None, role="CUSTOMER"):
        password_hash = generate_password_hash(password)
        return execute_returning(
            """
            INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, email, first_name, last_name, phone, role, created_at
            """,
            (email.lower().strip(), password_hash, first_name, last_name, phone, role),
        )

    @staticmethod
    def find_by_email(email):
        return fetch_one("SELECT * FROM users WHERE email = %s", (email.lower().strip(),))

    @staticmethod
    def find_by_id(user_id):
        return fetch_one(
            "SELECT id, email, first_name, last_name, phone, role, created_at, updated_at "
            "FROM users WHERE id = %s",
            (user_id,),
        )

    @staticmethod
    def find_all_admins():
        return fetch_all("SELECT id, email FROM users WHERE role = 'ADMIN'")

    @staticmethod
    def verify_password(user_row, plain_password):
        return check_password_hash(user_row["password_hash"], plain_password)

    @staticmethod
    def update_profile(user_id, first_name=None, last_name=None, phone=None):
        fields, params = [], []
        if first_name is not None:
            fields.append("first_name = %s")
            params.append(first_name)
        if last_name is not None:
            fields.append("last_name = %s")
            params.append(last_name)
        if phone is not None:
            fields.append("phone = %s")
            params.append(phone)
        if not fields:
            return User.find_by_id(user_id)
        params.append(user_id)
        return execute_returning(
            f"UPDATE users SET {', '.join(fields)} WHERE id = %s "
            "RETURNING id, email, first_name, last_name, phone, role",
            tuple(params),
        )
