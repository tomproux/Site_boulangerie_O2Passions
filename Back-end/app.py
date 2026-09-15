import os
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from functools import wraps

import jwt
import psycopg
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(ROOT_DIR, "Front-end")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://o2passions:o2passions@localhost:5432/o2passions")
JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production")

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
CORS(app, resources={r"/api/*": {"origins": os.getenv("FRONTEND_ORIGIN", "*")}})


def db_connection():
    return psycopg.connect(DATABASE_URL, row_factory=psycopg.rows.dict_row)


def json_value(value):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime,)):
        return value.isoformat()
    return value


def serialize(row):
    return {key: json_value(value) for key, value in row.items()}


def token_for(user):
    payload = {
        "sub": str(user["id"]),
        "role": user["role"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def current_user():
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    try:
        payload = jwt.decode(header[7:], JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None
    with db_connection() as connection:
        return connection.execute(
            "SELECT id, email, first_name, last_name, phone, role FROM users WHERE id = %s",
            (payload["sub"],),
        ).fetchone()


def auth_required(admin=False):
    def decorator(function):
        @wraps(function)
        def wrapped(*args, **kwargs):
            user = current_user()
            if not user:
                return error("AUTH_REQUIRED", "Authentification requise", 401)
            if admin and user["role"] != "ADMIN":
                return error("FORBIDDEN", "Accès administrateur requis", 403)
            return function(user, *args, **kwargs)

        return wrapped

    return decorator


def error(code, message, status=400, details=None):
    return jsonify({"error": {"code": code, "message": message, "details": details or []}}), status


def product_query(where="", params=()):
    sql = """
        SELECT p.id, p.name, p.slug, p.description, p.price, p.image_url,
               p.is_available, c.name AS category_name, c.slug AS category_slug
        FROM products p JOIN categories c ON c.id = p.category_id
    """
    if where:
        sql += f" WHERE {where}"
    sql += " ORDER BY c.sort_order, p.name"
    with db_connection() as connection:
        return [serialize(row) for row in connection.execute(sql, params).fetchall()]


@app.get("/api/health")
def health():
    try:
        with db_connection() as connection:
            connection.execute("SELECT 1")
        return jsonify({"data": {"status": "ok", "database": "postgresql"}})
    except psycopg.Error as exc:
        return error("DATABASE_UNAVAILABLE", str(exc), 503)


@app.get("/api/categories")
def categories():
    with db_connection() as connection:
        rows = connection.execute("SELECT id, name, slug, sort_order FROM categories ORDER BY sort_order, name").fetchall()
    return jsonify({"data": [serialize(row) for row in rows]})


@app.get("/api/products")
def products():
    filters = ["p.is_available = TRUE"]
    params = []
    category = request.args.get("categoryId") or request.args.get("category")
    search = request.args.get("search")
    if category:
        filters.append("(c.id::text = %s OR c.slug = %s)")
        params.extend([category, category])
    if search:
        filters.append("(p.name ILIKE %s OR p.description ILIKE %s)")
        params.extend([f"%{search}%", f"%{search}%"])
    return jsonify({"data": product_query(" AND ".join(filters), params)})


@app.get("/api/products/<slug>")
def product(slug):
    rows = product_query("p.slug = %s", (slug,))
    if not rows:
        return error("NOT_FOUND", "Produit introuvable", 404)
    return jsonify({"data": rows[0]})


@app.post("/api/auth/register")
def register():
    data = request.get_json(silent=True) or {}
    required = ["firstName", "lastName", "email", "password"]
    if any(not str(data.get(field, "")).strip() for field in required):
        return error("VALIDATION_ERROR", "Prénom, nom, e-mail et mot de passe sont requis", 422)
    if len(data["password"]) < 8:
        return error("VALIDATION_ERROR", "Le mot de passe doit contenir au moins 8 caractères", 422)
    with db_connection() as connection:
        try:
            user = connection.execute(
                """INSERT INTO users (email, password_hash, first_name, last_name, phone)
                   VALUES (%s, %s, %s, %s, %s)
                   RETURNING id, email, first_name, last_name, phone, role""",
                (data["email"].strip().lower(), generate_password_hash(data["password"]), data["firstName"].strip(), data["lastName"].strip(), data.get("phone")),
            ).fetchone()
            connection.commit()
        except psycopg.errors.UniqueViolation:
            connection.rollback()
            return error("EMAIL_EXISTS", "Cette adresse e-mail est déjà utilisée", 409)
    return jsonify({"data": {"user": serialize(user), "token": token_for(user)}, "message": "Compte créé"}), 201


@app.post("/api/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    with db_connection() as connection:
        user = connection.execute("SELECT * FROM users WHERE email = %s", (str(data.get("email", "")).strip().lower(),)).fetchone()
    if not user or not check_password_hash(user["password_hash"], data.get("password", "")):
        return error("INVALID_CREDENTIALS", "E-mail ou mot de passe incorrect", 401)
    return jsonify({"data": {"user": serialize({key: user[key] for key in ["id", "email", "first_name", "last_name", "phone", "role"]}), "token": token_for(user)}})


@app.get("/api/auth/me")
@auth_required()
def me(user):
    return jsonify({"data": serialize(user)})


@app.post("/api/orders")
@auth_required()
def create_order(user):
    data = request.get_json(silent=True) or {}
    items = data.get("items") or []
    mode = data.get("receptionMode")
    if not items or mode not in ["PICKUP", "DELIVERY"] or not data.get("scheduledDate") or not data.get("scheduledTimeSlot"):
        return error("VALIDATION_ERROR", "Les articles, le mode et le créneau sont requis", 422)
    if mode == "DELIVERY" and not str(data.get("deliveryAddress", "")).strip():
        return error("VALIDATION_ERROR", "L'adresse de livraison est requise", 422)
    with db_connection() as connection:
        product_ids = [item.get("productId") for item in items]
        rows = connection.execute("SELECT * FROM products WHERE id = ANY(%s::uuid[]) AND is_available = TRUE", (product_ids,)).fetchall()
        by_id = {str(row["id"]): row for row in rows}
        if len(by_id) != len(set(product_ids)):
            return error("PRODUCT_UNAVAILABLE", "Un produit n'est plus disponible", 409)
        normalized = []
        total = Decimal("0")
        for item in items:
            quantity = int(item.get("quantity", 0))
            product_row = by_id.get(str(item.get("productId")))
            if quantity < 1 or quantity > 50 or not product_row:
                return error("VALIDATION_ERROR", "Quantité ou produit invalide", 422)
            line_total = product_row["price"] * quantity
            total += line_total
            normalized.append((product_row, quantity, line_total))
        order = connection.execute(
            """INSERT INTO orders (user_id, status, reception_mode, scheduled_date, scheduled_time_slot,
               delivery_address, total_amount, payment_status) VALUES (%s, 'PENDING', %s, %s, %s, %s, %s, 'PENDING') RETURNING id""",
            (user["id"], mode, data["scheduledDate"], data["scheduledTimeSlot"], data.get("deliveryAddress"), total),
        ).fetchone()
        for product_row, quantity, line_total in normalized:
            connection.execute(
                "INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (%s, %s, %s, %s, %s)",
                (order["id"], product_row["id"], quantity, product_row["price"], line_total),
            )
        connection.commit()
    return jsonify({"data": {"orderId": str(order["id"]), "totalAmount": float(total), "paymentStatus": "PENDING"}, "message": "Commande enregistrée"}), 201


@app.get("/api/orders")
@auth_required()
def orders(user):
    with db_connection() as connection:
        rows = connection.execute("SELECT * FROM orders WHERE user_id = %s ORDER BY created_at DESC", (user["id"],)).fetchall()
    return jsonify({"data": [serialize(row) for row in rows]})


@app.get("/api/orders/<order_id>")
@auth_required()
def order_detail(user, order_id):
    with db_connection() as connection:
        order = connection.execute("SELECT * FROM orders WHERE id = %s AND user_id = %s", (order_id, user["id"])).fetchone()
        if not order:
            return error("NOT_FOUND", "Commande introuvable", 404)
        items = connection.execute("""SELECT oi.*, p.name, p.image_url FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = %s""", (order_id,)).fetchall()
    return jsonify({"data": {**serialize(order), "items": [serialize(row) for row in items]}})


@app.get("/api/admin/products")
@auth_required(admin=True)
def admin_products(user):
    return jsonify({"data": product_query()})


@app.post("/api/admin/products")
@auth_required(admin=True)
def admin_create_product(user):
    data = request.get_json(silent=True) or {}
    required = ["name", "slug", "price", "categoryId"]
    if any(data.get(key) in [None, ""] for key in required):
        return error("VALIDATION_ERROR", "Nom, slug, prix et catégorie sont requis", 422)
    with db_connection() as connection:
        try:
            row = connection.execute("""INSERT INTO products (name, slug, description, price, category_id, image_url, is_available)
                VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id""", (data["name"], data["slug"], data.get("description"), data["price"], data["categoryId"], data.get("imageUrl"), data.get("isAvailable", True))).fetchone()
            connection.commit()
        except psycopg.errors.UniqueViolation:
            connection.rollback()
            return error("CONFLICT", "Le slug existe déjà", 409)
    return jsonify({"data": {"id": str(row["id"])} }), 201


@app.patch("/api/admin/products/<product_id>")
@auth_required(admin=True)
def admin_update_product(user, product_id):
    data = request.get_json(silent=True) or {}
    allowed = {"name", "description", "price", "category_id", "image_url", "is_available"}
    fields = {key: value for key, value in data.items() if key in allowed}
    if not fields:
        return error("VALIDATION_ERROR", "Aucun champ à modifier", 422)
    assignments = ", ".join(f"{key} = %s" for key in fields)
    with db_connection() as connection:
        row = connection.execute(f"UPDATE products SET {assignments}, updated_at = NOW() WHERE id = %s RETURNING id", (*fields.values(), product_id)).fetchone()
        connection.commit()
    if not row:
        return error("NOT_FOUND", "Produit introuvable", 404)
    return jsonify({"data": {"id": str(row["id"]), "updated": True}})


@app.get("/api/admin/orders")
@auth_required(admin=True)
def admin_orders(user):
    status = request.args.get("status")
    query = "SELECT o.*, u.first_name, u.last_name, u.email FROM orders o JOIN users u ON u.id = o.user_id"
    params = []
    if status:
        query += " WHERE o.status = %s"
        params.append(status)
    query += " ORDER BY o.created_at DESC"
    with db_connection() as connection:
        rows = connection.execute(query, params).fetchall()
    return jsonify({"data": [serialize(row) for row in rows]})


@app.patch("/api/admin/orders/<order_id>")
@auth_required(admin=True)
def admin_update_order(user, order_id):
    data = request.get_json(silent=True) or {}
    allowed_status = ["PENDING", "PREPARING", "READY", "DELIVERING", "COMPLETED", "CANCELLED"]
    if data.get("status") not in allowed_status:
        return error("VALIDATION_ERROR", "Statut invalide", 422)
    with db_connection() as connection:
        row = connection.execute("UPDATE orders SET status = %s, updated_at = NOW() WHERE id = %s RETURNING id, status", (data["status"], order_id)).fetchone()
        connection.commit()
    if not row:
        return error("NOT_FOUND", "Commande introuvable", 404)
    return jsonify({"data": serialize(row)})


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def frontend(path):
    requested = os.path.join(FRONTEND_DIR, path)
    if path and os.path.isfile(requested):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, "O2Passions.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=os.getenv("FLASK_DEBUG") == "1")
