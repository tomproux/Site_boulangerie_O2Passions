"""Modèle ShopSettings — informations boutique et horaires (US-02)."""

import json

from database import execute_returning, fetch_one


class ShopSettings:
    @staticmethod
    def get():
        row = fetch_one("SELECT * FROM shop_settings WHERE id = 1")
        if row and isinstance(row.get("opening_hours"), str):
            row["opening_hours"] = json.loads(row["opening_hours"])
        return row

    @staticmethod
    def update(**fields):
        allowed = {"shop_name", "address", "phone", "map_url", "opening_hours", "about_text"}
        set_clauses, params = [], []
        for key, value in fields.items():
            if key in allowed and value is not None:
                set_clauses.append(f"{key} = %s")
                params.append(json.dumps(value) if key == "opening_hours" else value)
        if not set_clauses:
            return ShopSettings.get()
        return execute_returning(
            f"UPDATE shop_settings SET {', '.join(set_clauses)} WHERE id = 1 RETURNING *",
            tuple(params),
        )
