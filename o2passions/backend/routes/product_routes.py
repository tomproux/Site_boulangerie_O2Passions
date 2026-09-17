"""Blueprint public : /api/products, /api/categories, /api/shop-settings.

Correspond à US-01 (vitrine produits) et US-02 (horaires & localisation).
"""

from flask import Blueprint, request

from middleware import error_response, success_response
from models.shop_settings import ShopSettings
from services import product_service
from services.product_service import ProductError

product_bp = Blueprint("products", __name__, url_prefix="/api")


@product_bp.get("/categories")
def list_categories():
    return success_response(product_service.list_categories())


@product_bp.get("/products")
def list_products():
    category_id = request.args.get("categoryId")
    search = request.args.get("search")
    available = request.args.get("available")
    available_bool = None
    if available is not None:
        available_bool = available.lower() in ("1", "true", "yes")
    products = product_service.list_products(category_id, search, available_bool)
    return success_response(products)


@product_bp.get("/products/<slug>")
def get_product(slug):
    try:
        product = product_service.get_product(slug=slug)
    except ProductError as e:
        return error_response(e.code, e.message, e.status)
    return success_response(product)


@product_bp.get("/shop-settings")
def get_shop_settings():
    return success_response(ShopSettings.get())
