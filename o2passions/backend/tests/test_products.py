"""Tests unitaires du service produits (US-01, US-08)."""

import pytest

from services import product_service
from services.product_service import ProductError, slugify


def test_slugify_removes_accents_and_spaces():
    assert slugify("Éclair au Chocolat !") == "eclair-au-chocolat"


def test_create_product_requires_name(monkeypatch):
    monkeypatch.setattr(
        product_service.Category, "find_by_id", lambda cid: {"id": cid}
    )
    with pytest.raises(ProductError):
        product_service.create_product({"name": "", "price": 3, "categoryId": "cat-1"})


def test_create_product_rejects_negative_price(monkeypatch):
    monkeypatch.setattr(
        product_service.Category, "find_by_id", lambda cid: {"id": cid}
    )
    with pytest.raises(ProductError):
        product_service.create_product(
            {"name": "Baguette", "price": -1, "categoryId": "cat-1"}
        )


def test_create_product_rejects_invalid_category(monkeypatch):
    monkeypatch.setattr(product_service.Category, "find_by_id", lambda cid: None)
    with pytest.raises(ProductError) as exc:
        product_service.create_product(
            {"name": "Baguette", "price": 1.2, "categoryId": "unknown"}
        )
    assert exc.value.code == "INVALID_CATEGORY"


def test_create_product_success(monkeypatch):
    monkeypatch.setattr(
        product_service.Category, "find_by_id", lambda cid: {"id": cid}
    )
    created = {}

    def fake_create(**kwargs):
        created.update(kwargs)
        return {"id": "prod-1", **kwargs}

    monkeypatch.setattr(product_service.Product, "create", fake_create)

    result = product_service.create_product(
        {"name": "Baguette tradition", "price": 1.2, "categoryId": "cat-1"}
    )
    assert result["id"] == "prod-1"
    assert created["slug"] == "baguette-tradition"


def test_get_product_not_found(monkeypatch):
    monkeypatch.setattr(product_service.Product, "find_by_slug", lambda slug: None)
    with pytest.raises(ProductError) as exc:
        product_service.get_product(slug="inexistant")
    assert exc.value.code == "PRODUCT_NOT_FOUND"
