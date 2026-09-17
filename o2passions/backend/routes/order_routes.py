"""Blueprint /api/orders — US-05 (panier), US-06 (commander), US-07 (suivi).

Le panier est géré côté client en JavaScript (localStorage, cf. js/cart.js),
conformément à la note de la section 8.3 de la documentation : aucun
endpoint dédié /api/cart n'est donc nécessaire dans ce MVP.
"""

from flask import Blueprint, g, request

from middleware import error_response, login_required, success_response
from services import order_service
from services.order_service import OrderError

order_bp = Blueprint("orders", __name__, url_prefix="/api/orders")


@order_bp.post("")
@login_required
def create_order():
    body = request.get_json(silent=True) or {}
    try:
        result = order_service.create_order(g.user_id, body)
    except OrderError as e:
        return error_response(e.code, e.message, e.status)
    return success_response(result, "Commande créée, en attente de paiement.", 201)


@order_bp.get("")
@login_required
def list_my_orders():
    orders = order_service.get_user_orders(g.user_id)
    return success_response(orders)


@order_bp.get("/<order_id>")
@login_required
def get_order(order_id):
    try:
        order = order_service.get_order(order_id, user_id=g.user_id, is_admin=(g.user_role == "ADMIN"))
    except OrderError as e:
        return error_response(e.code, e.message, e.status)
    return success_response(order)


@order_bp.post("/<order_id>/confirm-payment")
@login_required
def confirm_payment(order_id):
    body = request.get_json(silent=True) or {}
    try:
        order = order_service.confirm_payment(order_id, body.get("paymentIntentId", ""))
    except OrderError as e:
        return error_response(e.code, e.message, e.status)
    return success_response(order, "Paiement confirmé, commande validée.")
