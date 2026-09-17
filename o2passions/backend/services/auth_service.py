"""Service d'authentification — inscription, connexion, gestion des tokens JWT.

Correspond à US-03 (créer un compte) et US-04 (se connecter / déconnecter).
"""

import re
from datetime import datetime, timedelta, timezone

import jwt

from config import Config
from models.user import User

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class AuthError(Exception):
    def __init__(self, message, code="AUTH_ERROR", status=400):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status = status


def _validate_password(password):
    if len(password) < 8:
        raise AuthError(
            "Le mot de passe doit contenir au moins 8 caractères.",
            "WEAK_PASSWORD", 400,
        )


def _public_user(user):
    return {
        "id": user["id"],
        "email": user["email"],
        "firstName": user["first_name"],
        "lastName": user["last_name"],
        "phone": user["phone"],
        "role": user["role"],
    }


def register(email, password, first_name, last_name, phone=None):
    if not email or not EMAIL_RE.match(email):
        raise AuthError("Adresse e-mail invalide.", "INVALID_EMAIL", 400)
    if not first_name or not last_name:
        raise AuthError("Le prénom et le nom sont obligatoires.", "VALIDATION_ERROR", 400)
    _validate_password(password)

    if User.find_by_email(email):
        raise AuthError("Un compte existe déjà avec cet e-mail.", "EMAIL_ALREADY_USED", 409)

    user = User.create_user(email, password, first_name, last_name, phone)
    token = generate_token(user["id"], role="CUSTOMER")
    return _public_user(user), token


def login(email, password):
    user = User.find_by_email(email)
    if not user or not User.verify_password(user, password):
        raise AuthError("E-mail ou mot de passe incorrect.", "INVALID_CREDENTIALS", 401)

    token = generate_token(user["id"], role=user["role"])
    return _public_user(user), token


def generate_token(user_id, role):
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=Config.JWT_EXPIRES_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm=Config.JWT_ALGORITHM)


def validate_token(token):
    try:
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=[Config.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthError("Session expirée, merci de vous reconnecter.", "TOKEN_EXPIRED", 401)
    except jwt.InvalidTokenError:
        raise AuthError("Token invalide.", "INVALID_TOKEN", 401)
