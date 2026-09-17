"""Point d'entrée de l'application Flask — enregistrement des blueprints.

Lancement en local :
    export FLASK_APP=app.py
    flask run --debug

ou simplement :
    python app.py
"""

from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from database import init_pool
from middleware import error_response
from routes.admin_routes import admin_bp
from routes.auth_routes import auth_bp
from routes.order_routes import order_bp
from routes.product_routes import product_bp
from services.auth_service import AuthError
from services.order_service import OrderError
from services.product_service import ProductError


def create_app():
    app = Flask(__name__)
    CORS(app, origins=[Config.FRONTEND_ORIGIN], supports_credentials=True)

    init_pool()

    app.register_blueprint(auth_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(admin_bp)

    @app.get("/api/health")
    def health():
        return jsonify({"data": {"status": "ok"}, "message": "O2Passions API"})

    @app.errorhandler(404)
    def not_found(_e):
        return error_response("NOT_FOUND", "Ressource introuvable.", 404)

    @app.errorhandler(405)
    def method_not_allowed(_e):
        return error_response("METHOD_NOT_ALLOWED", "Méthode non autorisée.", 405)

    @app.errorhandler(AuthError)
    def handle_auth_error(e):
        return error_response(e.code, e.message, e.status)

    @app.errorhandler(ProductError)
    def handle_product_error(e):
        return error_response(e.code, e.message, e.status)

    @app.errorhandler(OrderError)
    def handle_order_error(e):
        return error_response(e.code, e.message, e.status)

    @app.errorhandler(Exception)
    def handle_unexpected_error(e):
        app.logger.exception(e)
        return error_response("INTERNAL_ERROR", "Une erreur inattendue est survenue.", 500)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=Config.DEBUG, port=5000)
