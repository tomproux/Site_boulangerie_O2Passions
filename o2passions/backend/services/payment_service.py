"""Service paiement — intégration Stripe (US-06).

En l'absence de clé Stripe configurée (environnement de développement/tests),
un mode simulé (« mock ») est utilisé afin que le reste de l'application
(création de commande, tests automatisés) fonctionne sans dépendre d'un
compte Stripe réel.
"""

import uuid

import stripe

from config import Config

stripe.api_key = Config.STRIPE_SECRET_KEY


def _mock_mode():
    return not Config.STRIPE_SECRET_KEY


def create_payment_intent(amount, currency="eur"):
    """Crée une intention de paiement pour le montant donné (en euros)."""
    amount_cents = int(round(amount * 100))

    if _mock_mode():
        return {
            "id": f"pi_mock_{uuid.uuid4().hex[:16]}",
            "client_secret": f"pi_mock_{uuid.uuid4().hex[:16]}_secret",
            "status": "requires_confirmation",
        }

    intent = stripe.PaymentIntent.create(amount=amount_cents, currency=currency)
    return {
        "id": intent["id"],
        "client_secret": intent["client_secret"],
        "status": intent["status"],
    }


def confirm_payment(payment_intent_id):
    if _mock_mode() or payment_intent_id.startswith("pi_mock_"):
        # En mode simulé, tout paiement est considéré comme réussi.
        return {"id": payment_intent_id, "status": "succeeded"}

    intent = stripe.PaymentIntent.retrieve(payment_intent_id)
    return {"id": intent["id"], "status": intent["status"]}


def handle_webhook(payload, sig_header):
    """Vérifie et traite un événement webhook Stripe.

    Retourne un tuple (event_type, order_related_data) que la route peut
    utiliser pour mettre à jour le statut de paiement de la commande.
    """
    if _mock_mode():
        return None

    event = stripe.Webhook.construct_event(payload, sig_header, Config.STRIPE_WEBHOOK_SECRET)
    return event
