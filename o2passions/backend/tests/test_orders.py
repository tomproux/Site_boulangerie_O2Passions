"""Tests unitaires du service commandes (US-06, US-07, US-09)."""

import pytest

from services import order_service
from services.order_service import OrderError


FAKE_PRODUCT = {
    "id": "prod-1",
    "name": "Baguette tradition",
    "price": 1.20,
    "is_available": True,
}


def _patch_common(monkeypatch):
    monkeypatch.setattr(order_service.Product, "find_by_id", lambda pid: FAKE_PRODUCT)
    monkeypatch.setattr(
        order_service.payment_service,
        "create_payment_intent",
        lambda amount, currency="eur": {"id": "pi_mock_1", "client_secret": "secret_1"},
    )
    monkeypatch.setattr(order_service.OrderItem, "create", lambda *a, **k: None)
    monkeypatch.setattr(order_service.Order, "attach_payment_intent", lambda *a, **k: None)


def test_create_order_empty_cart(monkeypatch):
    _patch_common(monkeypatch)
    with pytest.raises(OrderError) as exc:
        order_service.create_order("user-1", {"items": [], "receptionMode": "PICKUP"})
    assert exc.value.code == "EMPTY_CART"


def test_create_order_delivery_without_address(monkeypatch):
    _patch_common(monkeypatch)
    with pytest.raises(OrderError) as exc:
        order_service.create_order(
            "user-1",
            {
                "items": [{"productId": "prod-1", "quantity": 2}],
                "receptionMode": "DELIVERY",
                "scheduledDate": "2026-09-20",
                "scheduledTimeSlot": "10:00-10:30",
            },
        )
    assert exc.value.code == "MISSING_ADDRESS"


def test_create_order_success_computes_total_server_side(monkeypatch):
    _patch_common(monkeypatch)
    monkeypatch.setattr(
        order_service.Order,
        "create",
        lambda **kwargs: {"id": "order-1", **kwargs},
    )

    result = order_service.create_order(
        "user-1",
        {
            # Prix falsifié côté client : doit être ignoré, le total est
            # recalculé à partir du prix réel du produit en base.
            "items": [{"productId": "prod-1", "quantity": 3, "price": 0.01}],
            "receptionMode": "PICKUP",
            "scheduledDate": "2026-09-20",
            "scheduledTimeSlot": "10:00-10:30",
        },
    )
    assert result["totalAmount"] == 3.60
    assert result["orderId"] == "order-1"


def test_update_order_status_invalid(monkeypatch):
    with pytest.raises(OrderError) as exc:
        order_service.update_order_status("order-1", "NOT_A_STATUS")
    assert exc.value.code == "INVALID_STATUS"


def test_update_order_status_not_found(monkeypatch):
    monkeypatch.setattr(order_service.Order, "update_status", lambda oid, status: None)
    with pytest.raises(OrderError) as exc:
        order_service.update_order_status("order-1", "READY")
    assert exc.value.code == "ORDER_NOT_FOUND"


def test_get_order_forbidden_for_other_user(monkeypatch):
    monkeypatch.setattr(
        order_service.Order,
        "find_by_id",
        lambda oid: {"id": oid, "user_id": "owner-1"},
    )
    with pytest.raises(OrderError) as exc:
        order_service.get_order("order-1", user_id="someone-else", is_admin=False)
    assert exc.value.code == "FORBIDDEN"
