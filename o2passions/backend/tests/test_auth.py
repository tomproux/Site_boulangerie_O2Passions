"""Tests unitaires du service d'authentification (US-03, US-04).

Ces tests isolent la logique métier de la base de données en simulant
(`monkeypatch`) le modèle User, conformément à la stratégie de test décrite
en section 9.2 : les services peuvent être testés indépendamment des routes
HTTP et de la base de données.
"""

import pytest

from services import auth_service
from services.auth_service import AuthError


class FakeUserStore:
    def __init__(self):
        self.users = {}

    def create_user(self, email, password, first_name, last_name, phone=None, role="CUSTOMER"):
        from werkzeug.security import generate_password_hash

        user = {
            "id": "user-1",
            "email": email.lower(),
            "password_hash": generate_password_hash(password),
            "first_name": first_name,
            "last_name": last_name,
            "phone": phone,
            "role": role,
        }
        self.users[user["email"]] = user
        return user

    def find_by_email(self, email):
        return self.users.get(email.lower())

    def verify_password(self, user_row, plain_password):
        from werkzeug.security import check_password_hash

        return check_password_hash(user_row["password_hash"], plain_password)


@pytest.fixture
def fake_store(monkeypatch):
    store = FakeUserStore()
    monkeypatch.setattr(auth_service, "User", store)
    return store


def test_register_success(fake_store):
    user, token = auth_service.register(
        "test@example.com", "supersecret", "Alice", "Martin"
    )
    assert user["email"] == "test@example.com"
    assert token


def test_register_invalid_email(fake_store):
    with pytest.raises(AuthError) as exc:
        auth_service.register("not-an-email", "supersecret", "Alice", "Martin")
    assert exc.value.code == "INVALID_EMAIL"


def test_register_weak_password(fake_store):
    with pytest.raises(AuthError) as exc:
        auth_service.register("test@example.com", "short", "Alice", "Martin")
    assert exc.value.code == "WEAK_PASSWORD"


def test_register_duplicate_email(fake_store):
    auth_service.register("test@example.com", "supersecret", "Alice", "Martin")
    with pytest.raises(AuthError) as exc:
        auth_service.register("test@example.com", "supersecret2", "Bob", "Durand")
    assert exc.value.code == "EMAIL_ALREADY_USED"


def test_login_success(fake_store):
    auth_service.register("test@example.com", "supersecret", "Alice", "Martin")
    user, token = auth_service.login("test@example.com", "supersecret")
    assert user["email"] == "test@example.com"
    assert token


def test_login_wrong_password(fake_store):
    auth_service.register("test@example.com", "supersecret", "Alice", "Martin")
    with pytest.raises(AuthError) as exc:
        auth_service.login("test@example.com", "wrongpassword")
    assert exc.value.code == "INVALID_CREDENTIALS"


def test_token_roundtrip():
    token = auth_service.generate_token("user-1", "CUSTOMER")
    payload = auth_service.validate_token(token)
    assert payload["sub"] == "user-1"
    assert payload["role"] == "CUSTOMER"
