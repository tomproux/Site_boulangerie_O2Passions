"""Blueprint /api/auth — US-03 (inscription) et US-04 (connexion)."""

from flask import Blueprint, g, request

from middleware import error_response, login_required, success_response
from models.user import User
from services import auth_service
from services.auth_service import AuthError

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
def register():
    body = request.get_json(silent=True) or {}
    try:
        user, token = auth_service.register(
            email=body.get("email", ""),
            password=body.get("password", ""),
            first_name=body.get("firstName", ""),
            last_name=body.get("lastName", ""),
            phone=body.get("phone"),
        )
    except AuthError as e:
        return error_response(e.code, e.message, e.status)

    return success_response(
        {"user": user, "token": token}, "Compte créé avec succès.", 201
    )


@auth_bp.post("/login")
def login():
    body = request.get_json(silent=True) or {}
    try:
        user, token = auth_service.login(body.get("email", ""), body.get("password", ""))
    except AuthError as e:
        return error_response(e.code, e.message, e.status)

    return success_response({"user": user, "token": token}, "Connexion réussie.")


@auth_bp.get("/me")
@login_required
def me():
    user = User.find_by_id(g.user_id)
    if not user:
        return error_response("USER_NOT_FOUND", "Utilisateur introuvable.", 404)
    return success_response(user)


@auth_bp.patch("/me")
@login_required
def update_me():
    body = request.get_json(silent=True) or {}
    user = User.update_profile(
        g.user_id,
        first_name=body.get("firstName"),
        last_name=body.get("lastName"),
        phone=body.get("phone"),
    )
    return success_response(user, "Profil mis à jour.")
