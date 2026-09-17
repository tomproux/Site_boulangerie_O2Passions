"""Service commandes — création, consultation, mise à jour de statut.

Correspond à US-06 (passer une commande), US-07 (suivre ses commandes) et
US-09 (gérer les commandes en back-office).
"""

from models.order import Order
from models.order_item import OrderItem
from models.product import Product
from services import payment_service

VALID_STATUSES = {"PENDING", "IN_PREPARATION", "READY", "IN_DELIVERY", "COMPLETED", "CANCELLED"}


class OrderError(Exception):
    def __init__(self, message, code="VALIDATION_ERROR", status=400):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status = status


def create_order(user_id, data):
    items = data.get("items") or []
    reception_mode = data.get("receptionMode")
    scheduled_date = data.get("scheduledDate")
    scheduled_time_slot = data.get("scheduledTimeSlot")
    delivery_address = data.get("deliveryAddress")

    if not items:
        raise OrderError("Le panier est vide.", "EMPTY_CART", 400)
    if reception_mode not in ("PICKUP", "DELIVERY"):
        raise OrderError("Mode de réception invalide.", "INVALID_RECEPTION_MODE", 400)
    if reception_mode == "DELIVERY" and not delivery_address:
        raise OrderError("Une adresse de livraison est requise.", "MISSING_ADDRESS", 400)
    if not scheduled_date or not scheduled_time_slot:
        raise OrderError("Merci de choisir une date et un horaire.", "MISSING_SCHEDULE", 400)

    # Vérification des produits et calcul du total côté serveur
    # (jamais de confiance dans les prix envoyés par le client).
    resolved_items = []
    total = 0.0
    for item in items:
        product = Product.find_by_id(item.get("productId"))
        try:
            quantity = int(item.get("quantity", 0))
        except (TypeError, ValueError):
            raise OrderError("Quantité invalide.", "INVALID_QUANTITY", 400)
        if not product:
            raise OrderError("Un produit du panier est introuvable.", "PRODUCT_NOT_FOUND", 404)
        if not product["is_available"]:
            raise OrderError(f"{product['name']} n'est plus disponible.", "PRODUCT_UNAVAILABLE", 409)
        if quantity <= 0:
            raise OrderError("Quantité invalide.", "INVALID_QUANTITY", 400)
        unit_price = float(product["price"])
        total += unit_price * quantity
        resolved_items.append((product["id"], quantity, unit_price))

    total = round(total, 2)
    order = Order.create(
        user_id=user_id,
        reception_mode=reception_mode,
        scheduled_date=scheduled_date,
        scheduled_time_slot=scheduled_time_slot,
        total_amount=total,
        delivery_address=delivery_address if reception_mode == "DELIVERY" else None,
    )

    for product_id, quantity, unit_price in resolved_items:
        OrderItem.create(order["id"], product_id, quantity, unit_price)

    payment_intent = payment_service.create_payment_intent(total, currency="eur")
    Order.attach_payment_intent(order["id"], payment_intent["id"])

    return {
        "orderId": order["id"],
        "clientSecret": payment_intent["client_secret"],
        "totalAmount": total,
    }


def get_order(order_id, user_id=None, is_admin=False):
    order = Order.find_by_id(order_id)
    if not order:
        raise OrderError("Commande introuvable.", "ORDER_NOT_FOUND", 404)
    if not is_admin and str(order["user_id"]) != str(user_id):
        raise OrderError("Accès refusé à cette commande.", "FORBIDDEN", 403)
    order["items"] = OrderItem.find_by_order_id(order_id)
    return order


def get_user_orders(user_id):
    orders = Order.find_by_user_id(user_id)
    for order in orders:
        order["items"] = OrderItem.find_by_order_id(order["id"])
    return orders


def get_all_orders_for_admin(status=None, reception_mode=None, date_from=None, date_to=None):
    orders = Order.find_all_for_admin(status, reception_mode, date_from, date_to)
    for order in orders:
        order["items"] = OrderItem.find_by_order_id(order["id"])
    return orders


def update_order_status(order_id, status):
    if status not in VALID_STATUSES:
        raise OrderError("Statut invalide.", "INVALID_STATUS", 400)
    order = Order.update_status(order_id, status)
    if not order:
        raise OrderError("Commande introuvable.", "ORDER_NOT_FOUND", 404)
    return order


def cancel_order(order_id, reason):
    order = Order.cancel(order_id, reason or "Non précisé")
    if not order:
        raise OrderError("Commande introuvable.", "ORDER_NOT_FOUND", 404)
    return order


def confirm_payment(order_id, payment_intent_id):
    order = Order.find_by_id(order_id)
    if not order:
        raise OrderError("Commande introuvable.", "ORDER_NOT_FOUND", 404)

    result = payment_service.confirm_payment(payment_intent_id)
    if result["status"] == "succeeded":
        return Order.update_payment_status(order_id, "PAID", payment_intent_id)

    Order.update_payment_status(order_id, "FAILED", payment_intent_id)
    raise OrderError("Le paiement a échoué.", "PAYMENT_FAILED", 402)
