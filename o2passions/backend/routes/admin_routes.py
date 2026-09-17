"""Blueprint /api/admin — US-08 (catalogue) et US-09 (commandes), réservé au rôle ADMIN."""

from flask import Blueprint, request

from middleware import admin_required, error_response, success_response
from models.product import Product
from models.shop_settings import ShopSettings
from services import order_service, product_service
from services.order_service import OrderError
from services.product_service import ProductError

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


# ---------------------------------------------------------------- Produits

@admin_bp.get("/products")
@admin_required
def list_products():
    return success_response(product_service.list_products())


@admin_bp.post("/products")
@admin_required
def create_product():
    body = request.get_json(silent=True) or {}
    try:
        product = product_service.create_product(body)
    except ProductError as e:
        return error_response(e.code, e.message, e.status)
    return success_response(product, "Produit créé.", 201)


@admin_bp.get("/products/<product_id>")
@admin_required
def get_product(product_id):
    try:
        product = product_service.get_product(product_id=product_id)
    except ProductError as e:
        return error_response(e.code, e.message, e.status)
    return success_response(product)


@admin_bp.patch("/products/<product_id>")
@admin_required
def update_product(product_id):
    body = request.get_json(silent=True) or {}
    try:
        product = product_service.update_product(product_id, body)
    except ProductError as e:
        return error_response(e.code, e.message, e.status)
    return success_response(product, "Produit modifié.")


@admin_bp.delete("/products/<product_id>")
@admin_required
def delete_product(product_id):
    try:
        product_service.get_product(product_id=product_id)
    except ProductError as e:
        return error_response(e.code, e.message, e.status)
    Product.delete(product_id)
    return success_response(None, "Produit désactivé.")


# ---------------------------------------------------------------- Commandes

@admin_bp.get("/orders")
@admin_required
def list_orders():
    orders = order_service.get_all_orders_for_admin(
        status=request.args.get("status"),
        reception_mode=request.args.get("receptionMode"),
        date_from=request.args.get("dateFrom"),
        date_to=request.args.get("dateTo"),
    )
    return success_response(orders)


@admin_bp.get("/orders/<order_id>")
@admin_required
def get_order(order_id):
    try:
        order = order_service.get_order(order_id, is_admin=True)
    except OrderError as e:
        return error_response(e.code, e.message, e.status)
    return success_response(order)


@admin_bp.patch("/orders/<order_id>")
@admin_required
def update_order(order_id):
    body = request.get_json(silent=True) or {}
    if "status" not in body:
        return error_response("VALIDATION_ERROR", "Aucun statut à mettre à jour.", 400)
    try:
        order = order_service.update_order_status(order_id, body["status"])
    except OrderError as e:
        return error_response(e.code, e.message, e.status)
    return success_response(order, "Commande mise à jour.")


@admin_bp.post("/orders/<order_id>/cancel")
@admin_required
def cancel_order(order_id):
    body = request.get_json(silent=True) or {}
    try:
        order = order_service.cancel_order(order_id, body.get("reason"))
    except OrderError as e:
        return error_response(e.code, e.message, e.status)
    return success_response(order, "Commande annulée.")


# ---------------------------------------------------------------- Paramètres boutique

@admin_bp.get("/shop-settings")
@admin_required
def get_shop_settings():
    return success_response(ShopSettings.get())


@admin_bp.patch("/shop-settings")
@admin_required
def update_shop_settings():
    body = request.get_json(silent=True) or {}
    settings = ShopSettings.update(
        shop_name=body.get("shopName"),
        address=body.get("address"),
        phone=body.get("phone"),
        map_url=body.get("mapUrl"),
        opening_hours=body.get("openingHours"),
        about_text=body.get("aboutText"),
    )
    return success_response(settings, "Paramètres mis à jour.")
