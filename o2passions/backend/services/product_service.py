"""Service produits — logique métier du catalogue (US-01, US-08)."""

import re
import unicodedata

from models.category import Category
from models.product import Product


class ProductError(Exception):
    def __init__(self, message, code="VALIDATION_ERROR", status=400):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status = status


def slugify(text):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text


def list_products(category_id=None, search=None, available=None):
    return Product.find_all(category_id=category_id, search=search, only_available=available)


def get_product(product_id=None, slug=None):
    product = Product.find_by_id(product_id) if product_id else Product.find_by_slug(slug)
    if not product:
        raise ProductError("Produit introuvable.", "PRODUCT_NOT_FOUND", 404)
    return product


def create_product(data):
    name = data.get("name", "").strip()
    price = data.get("price")
    category_id = data.get("categoryId")

    if not name:
        raise ProductError("Le nom du produit est obligatoire.")
    if price is None or float(price) < 0:
        raise ProductError("Le prix doit être un nombre positif.")
    if not category_id or not Category.find_by_id(category_id):
        raise ProductError("Catégorie invalide.", "INVALID_CATEGORY", 400)

    slug = data.get("slug") or slugify(name)
    return Product.create(
        name=name,
        slug=slug,
        description=data.get("description", ""),
        price=price,
        category_id=category_id,
        image_url=data.get("imageUrl"),
        is_available=data.get("isAvailable", True),
    )


def update_product(product_id, data):
    get_product(product_id=product_id)  # 404 si inexistant
    fields = {}
    if "name" in data:
        fields["name"] = data["name"]
    if "description" in data:
        fields["description"] = data["description"]
    if "price" in data:
        if float(data["price"]) < 0:
            raise ProductError("Le prix doit être un nombre positif.")
        fields["price"] = data["price"]
    if "categoryId" in data:
        if not Category.find_by_id(data["categoryId"]):
            raise ProductError("Catégorie invalide.", "INVALID_CATEGORY", 400)
        fields["category_id"] = data["categoryId"]
    if "imageUrl" in data:
        fields["image_url"] = data["imageUrl"]
    if "isAvailable" in data:
        fields["is_available"] = data["isAvailable"]
    return Product.update(product_id, **fields)


def toggle_availability(product_id, is_available):
    get_product(product_id=product_id)
    return Product.toggle_availability(product_id, is_available)


def list_categories():
    return Category.find_all()
