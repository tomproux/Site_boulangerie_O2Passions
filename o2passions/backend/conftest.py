"""Ajoute le dossier backend/ au sys.path pour les imports des tests
(`from services import ...`, `from models import ...`), et neutralise la
connexion PostgreSQL réelle pendant les tests unitaires (les services sont
testés avec des modèles simulés via monkeypatch, cf. tests/test_*.py)."""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5432/test")
os.environ.setdefault("JWT_SECRET", "test-secret")
os.environ.setdefault("STRIPE_SECRET_KEY", "")
