"""Décorateurs de protection des routes : authentification et rôle admin."""

from functools import wraps

from flask import g, jsonify, request

from services.auth_service import AuthError, validate_token


def error_response(code, message, status, details=None):
    return jsonify({"error": {"code": code, "message": message, "details": details or []}}), status


def success_response(data, message="Opération effectuée avec succès", status=200):
    return jsonify({"data": data, "message": message}), status


def _extract_token():
    header = request.headers.get("Authorization", "")
    if header.startswith("Bearer "):
        return header[len("Bearer "):]
    return None


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = _extract_token()
        if not token:
            return error_response("UNAUTHORIZED", "Authentification requise.", 401)
        try:
            payload = validate_token(token)
        except AuthError as e:
            return error_response(e.code, e.message, e.status)
        g.user_id = payload["sub"]
        g.user_role = payload["role"]
        return fn(*args, **kwargs)
    return wrapper


def admin_required(fn):
    @wraps(fn)
    @login_required
    def wrapper(*args, **kwargs):
        if g.user_role != "ADMIN":
            return error_response("FORBIDDEN", "Accès réservé aux administrateurs.", 403)
        return fn(*args, **kwargs)
    return wrapper
