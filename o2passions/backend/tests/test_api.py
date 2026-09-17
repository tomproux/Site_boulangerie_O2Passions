"""Tests d'intégration des endpoints Flask (section 9.2 — « Tests d'intégration API »).

Ces tests exercent les routes HTTP réelles via le client de test intégré à Flask :
format des réponses, codes HTTP, validation des entrées et protection des routes
par rôle. La couche d'accès aux données est simulée afin que la suite tourne sans
serveur PostgreSQL (la CI, elle, dispose d'un service PostgreSQL éphémère).
"""

import pytest

from services import auth_service


@pytest.fixture
def client(monkeypatch):
    # On neutralise l'initialisation du pool PostgreSQL au démarrage de l'app.
    import database

    monkeypatch.setattr(database, "init_pool", lambda *a, **k: None)

    from app import create_app

    application = create_app()
    application.config.update(TESTING=True)
    with application.test_client() as c:
        yield c


def _entete_auth(role="CUSTOMER", user_id="user-1"):
    token = auth_service.generate_token(user_id, role)
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------- Santé & format

def test_health(client):
    reponse = client.get("/api/health")
    assert reponse.status_code == 200
    assert reponse.get_json()["data"]["status"] == "ok"


def test_route_inconnue_renvoie_le_format_erreur(client):
    reponse = client.get("/api/inexistant")
    assert reponse.status_code == 404
    corps = reponse.get_json()
    assert corps["error"]["code"] == "NOT_FOUND"
    assert "message" in corps["error"]


# ---------------------------------------------------------------- Authentification

def test_register_rejette_un_email_invalide(client, monkeypatch):
    monkeypatch.setattr(auth_service.User, "find_by_email", lambda email: None)
    reponse = client.post(
        "/api/auth/register",
        json={"email": "pas-un-email", "password": "supersecret",
              "firstName": "Alice", "lastName": "Martin"},
    )
    assert reponse.status_code == 400
    assert reponse.get_json()["error"]["code"] == "INVALID_EMAIL"


def test_login_avec_identifiants_inconnus(client, monkeypatch):
    monkeypatch.setattr(auth_service.User, "find_by_email", lambda email: None)
    reponse = client.post("/api/auth/login", json={"email": "a@b.fr", "password": "x"})
    assert reponse.status_code == 401
    assert reponse.get_json()["error"]["code"] == "INVALID_CREDENTIALS"


# ---------------------------------------------------------------- Protection des routes

def test_commandes_sans_token(client):
    reponse = client.get("/api/orders")
    assert reponse.status_code == 401
    assert reponse.get_json()["error"]["code"] == "UNAUTHORIZED"


def test_commandes_avec_token_invalide(client):
    reponse = client.get("/api/orders", headers={"Authorization": "Bearer nimportequoi"})
    assert reponse.status_code == 401


def test_admin_refuse_un_client(client):
    reponse = client.get("/api/admin/products", headers=_entete_auth(role="CUSTOMER"))
    assert reponse.status_code == 403
    assert reponse.get_json()["error"]["code"] == "FORBIDDEN"


def test_admin_accepte_un_administrateur(client, monkeypatch):
    from services import product_service

    monkeypatch.setattr(product_service.Product, "find_all", lambda **k: [])
    reponse = client.get("/api/admin/products", headers=_entete_auth(role="ADMIN"))
    assert reponse.status_code == 200
    assert reponse.get_json()["data"] == []


# ---------------------------------------------------------------- Produits

def test_liste_produits_publique(client, monkeypatch):
    from services import product_service

    faux = [{"id": "p1", "name": "Baguette", "price": 1.2, "is_available": True}]
    monkeypatch.setattr(product_service.Product, "find_all", lambda **k: faux)

    reponse = client.get("/api/products")
    assert reponse.status_code == 200
    assert reponse.get_json()["data"][0]["name"] == "Baguette"


def test_produit_introuvable(client, monkeypatch):
    from services import product_service

    monkeypatch.setattr(product_service.Product, "find_by_slug", lambda slug: None)
    reponse = client.get("/api/products/inexistant")
    assert reponse.status_code == 404
    assert reponse.get_json()["error"]["code"] == "PRODUCT_NOT_FOUND"


# ---------------------------------------------------------------- Commandes

def test_creation_commande_panier_vide(client):
    reponse = client.post(
        "/api/orders",
        json={"items": [], "receptionMode": "PICKUP"},
        headers=_entete_auth(),
    )
    assert reponse.status_code == 400
    assert reponse.get_json()["error"]["code"] == "EMPTY_CART"


def test_creation_commande_reussie(client, monkeypatch):
    from services import order_service

    monkeypatch.setattr(
        order_service.Product, "find_by_id",
        lambda pid: {"id": "p1", "name": "Baguette", "price": 1.20, "is_available": True},
    )
    monkeypatch.setattr(order_service.Order, "create", lambda **k: {"id": "order-1", **k})
    monkeypatch.setattr(order_service.Order, "attach_payment_intent", lambda *a, **k: None)
    monkeypatch.setattr(order_service.OrderItem, "create", lambda *a, **k: None)

    reponse = client.post(
        "/api/orders",
        json={
            "items": [{"productId": "p1", "quantity": 2}],
            "receptionMode": "PICKUP",
            "scheduledDate": "2026-09-20",
            "scheduledTimeSlot": "10:00-11:00",
        },
        headers=_entete_auth(),
    )
    assert reponse.status_code == 201
    donnees = reponse.get_json()["data"]
    assert donnees["totalAmount"] == 2.40
    assert "clientSecret" in donnees
