/**
 * checkout.js — récapitulatif de commande, choix du mode de réception,
 * créneau, adresse et paiement Stripe (US-06).
 */

import { api, ApiError, formaterPrix, echapper, afficherMessage } from './api.js';
import { Panier } from './cart.js';
import { exigerConnexion } from './auth.js';

const CRENEAUX = [
  '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00',
];

function dateMinimale() {
  const demain = new Date();
  demain.setDate(demain.getDate() + 1);
  return demain.toISOString().split('T')[0];
}

function afficherRecapitulatif() {
  const conteneur = document.getElementById('recapitulatif');
  if (!conteneur) return;

  const articles = Panier.lire();
  const lignes = articles
    .map(
      (a) => `
      <div class="total-ligne">
        <span>${a.quantity} × ${echapper(a.name)}</span>
        <span>${formaterPrix(a.price * a.quantity)}</span>
      </div>`
    )
    .join('');

  conteneur.innerHTML = `
    ${lignes}
    <div class="total-ligne total-final">
      <span>Total</span><span>${formaterPrix(Panier.total(articles))}</span>
    </div>`;
}

export async function initialiserCheckout() {
  const formulaire = document.getElementById('formulaire-commande');
  if (!formulaire) return;

  if (!exigerConnexion('checkout.html')) return;

  const articles = Panier.lire();
  if (articles.length === 0) {
    document.getElementById('zone-checkout').innerHTML = `
      <div class="vide">
        <h3>Votre panier est vide</h3>
        <p>Ajoutez des produits avant de passer commande.</p>
        <a class="btn" href="categorie.html">Voir les produits</a>
      </div>`;
    return;
  }

  afficherRecapitulatif();

  // Créneaux et date minimale (commande la veille pour la production)
  const champDate = formulaire.scheduledDate;
  champDate.min = dateMinimale();
  champDate.value = dateMinimale();

  formulaire.scheduledTimeSlot.innerHTML =
    '<option value="">Choisir un créneau</option>' +
    CRENEAUX.map((c) => `<option value="${c}">${c.replace('-', ' à ')}</option>`).join('');

  // Affichage conditionnel de l'adresse de livraison
  const zoneAdresse = document.getElementById('zone-adresse');
  formulaire.querySelectorAll('input[name="receptionMode"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const livraison = formulaire.receptionMode.value === 'DELIVERY';
      zoneAdresse.classList.toggle('cache', !livraison);
      formulaire.deliveryAddress.required = livraison;
    });
  });

  // Pré-remplissage de l'adresse avec le profil si disponible
  try {
    const profil = await api.get('/auth/me');
    const nom = document.getElementById('nom-client');
    if (nom && profil) nom.textContent = `${profil.first_name} ${profil.last_name}`;
  } catch (e) {
    /* non bloquant */
  }

  formulaire.addEventListener('submit', async (e) => {
    e.preventDefault();
    afficherMessage('#message', '');

    const mode = formulaire.receptionMode.value;
    if (!mode) {
      afficherMessage('#message', 'Choisissez un mode de réception.');
      return;
    }
    if (!formulaire.scheduledTimeSlot.value) {
      afficherMessage('#message', 'Choisissez un créneau horaire.');
      return;
    }
    if (mode === 'DELIVERY' && !formulaire.deliveryAddress.value.trim()) {
      afficherMessage('#message', 'Renseignez une adresse de livraison.');
      return;
    }

    const bouton = document.getElementById('bouton-payer');
    bouton.disabled = true;
    bouton.textContent = 'Traitement en cours…';

    try {
      // 1. Création de la commande côté serveur (le total est recalculé par l'API)
      const commande = await api.post('/orders', {
        items: Panier.versPayload(),
        receptionMode: mode,
        scheduledDate: formulaire.scheduledDate.value,
        scheduledTimeSlot: formulaire.scheduledTimeSlot.value,
        deliveryAddress: mode === 'DELIVERY' ? formulaire.deliveryAddress.value.trim() : null,
      });

      // 2. Paiement via Stripe.js si la clé publique est configurée,
      //    sinon confirmation directe (mode démonstration).
      const paymentIntentId = await reglerPaiement(commande.clientSecret);

      // 3. Confirmation côté serveur
      await api.post(`/orders/${commande.orderId}/confirm-payment`, { paymentIntentId });

      Panier.vider();
      window.location.href = `compte.html?commande=${encodeURIComponent(commande.orderId)}`;
    } catch (erreur) {
      afficherMessage('#message', erreur instanceof ApiError ? erreur.message : 'Le paiement a échoué.');
      bouton.disabled = false;
      bouton.textContent = 'Confirmer et payer';
    }
  });
}

/**
 * Règle le paiement. Si Stripe.js est chargé et qu'une clé publique est
 * fournie (window.O2_STRIPE_PUBLIC_KEY), le paiement passe par Stripe
 * Elements. Sinon, on renvoie l'identifiant simulé fourni par l'API,
 * ce qui permet de faire tourner le parcours complet en développement.
 */
async function reglerPaiement(clientSecret) {
  const clePublique = window.O2_STRIPE_PUBLIC_KEY;

  if (!clePublique || typeof window.Stripe === 'undefined') {
    return clientSecret.split('_secret')[0];
  }

  const stripe = window.Stripe(clePublique);
  const resultat = await stripe.confirmCardPayment(clientSecret, {
    payment_method: { card: window.O2_CARD_ELEMENT },
  });

  if (resultat.error) {
    throw new ApiError(resultat.error.message, 'STRIPE_ERROR', 402);
  }
  return resultat.paymentIntent.id;
}

document.addEventListener('DOMContentLoaded', initialiserCheckout);
