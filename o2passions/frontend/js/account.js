/**
 * account.js — profil client et historique des commandes (US-07).
 */

import {
  api, ApiError, formaterPrix, formaterDate, formaterDateHeure, echapper,
  afficherMessage, LIBELLES_STATUT, LIBELLES_PAIEMENT, LIBELLES_RECEPTION,
} from './api.js';
import { exigerConnexion } from './auth.js';

async function chargerProfil() {
  const formulaire = document.getElementById('formulaire-profil');
  if (!formulaire) return;

  try {
    const profil = await api.get('/auth/me');
    formulaire.firstName.value = profil.first_name || '';
    formulaire.lastName.value = profil.last_name || '';
    formulaire.phone.value = profil.phone || '';
    const email = document.getElementById('email-profil');
    if (email) email.textContent = profil.email;
  } catch (e) {
    afficherMessage('#message-profil', 'Impossible de charger votre profil.');
  }

  formulaire.addEventListener('submit', async (e) => {
    e.preventDefault();
    afficherMessage('#message-profil', '');
    try {
      await api.patch('/auth/me', {
        firstName: formulaire.firstName.value.trim(),
        lastName: formulaire.lastName.value.trim(),
        phone: formulaire.phone.value.trim() || null,
      });
      afficherMessage('#message-profil', 'Profil mis à jour.', 'succes');
    } catch (erreur) {
      afficherMessage('#message-profil', erreur instanceof ApiError ? erreur.message : 'Erreur inattendue.');
    }
  });
}

function detailCommande(commande) {
  const produits = (commande.items || [])
    .map((i) => `<li>${i.quantity} × ${echapper(i.product_name)} — ${formaterPrix(i.total_price)}</li>`)
    .join('');

  const adresse = commande.reception_mode === 'DELIVERY' && commande.delivery_address
    ? `<p class="texte-doux" style="margin:8px 0 0">Livraison à : ${echapper(commande.delivery_address)}</p>`
    : '';

  return `
    <ul style="margin:0;padding-left:20px">${produits}</ul>
    <p class="texte-doux" style="margin:10px 0 0">
      ${echapper(LIBELLES_RECEPTION[commande.reception_mode] || commande.reception_mode)}
      le ${formaterDate(commande.scheduled_date)} — créneau ${echapper(commande.scheduled_time_slot)}
    </p>
    ${adresse}
    <p class="texte-doux" style="margin:6px 0 0">Paiement : ${echapper(LIBELLES_PAIEMENT[commande.payment_status] || commande.payment_status)}</p>`;
}

async function chargerCommandes() {
  const conteneur = document.getElementById('liste-commandes');
  if (!conteneur) return;

  conteneur.innerHTML = '<p class="chargement">Chargement de vos commandes…</p>';

  try {
    const commandes = await api.get('/orders');

    if (commandes.length === 0) {
      conteneur.innerHTML = `
        <div class="vide">
          <p>Vous n'avez pas encore passé de commande.</p>
          <a class="btn" href="categorie.html">Découvrir nos produits</a>
        </div>`;
      return;
    }

    const lignes = commandes
      .map(
        (c) => `
        <tr>
          <td>${formaterDateHeure(c.created_at)}</td>
          <td><code>${echapper(String(c.id).slice(0, 8))}</code></td>
          <td>${formaterPrix(c.total_amount)}</td>
          <td><span class="badge badge-${echapper(c.status)}">${echapper(LIBELLES_STATUT[c.status] || c.status)}</span></td>
          <td><button class="btn btn-secondaire btn-petit" data-detail="${echapper(c.id)}">Voir le détail</button></td>
        </tr>
        <tr class="cache" data-ligne-detail="${echapper(c.id)}">
          <td colspan="5" style="background:var(--brun-100)">${detailCommande(c)}</td>
        </tr>`
      )
      .join('');

    conteneur.innerHTML = `
      <div class="tableau-defilant">
        <table class="tableau">
          <thead>
            <tr><th>Date</th><th>N° commande</th><th>Total</th><th>Statut</th><th></th></tr>
          </thead>
          <tbody>${lignes}</tbody>
        </table>
      </div>`;

    conteneur.querySelectorAll('[data-detail]').forEach((bouton) => {
      bouton.addEventListener('click', () => {
        const ligne = conteneur.querySelector(`[data-ligne-detail="${bouton.dataset.detail}"]`);
        const ouvert = !ligne.classList.contains('cache');
        ligne.classList.toggle('cache', ouvert);
        bouton.textContent = ouvert ? 'Voir le détail' : 'Masquer';
      });
    });

    // Si on arrive depuis le checkout, on déplie la commande concernée.
    const params = new URLSearchParams(window.location.search);
    const commandeCible = params.get('commande');
    if (commandeCible) {
      afficherMessage('#message-commande', 'Votre commande a bien été enregistrée. Un e-mail de confirmation vous a été envoyé.', 'succes');
      const bouton = conteneur.querySelector(`[data-detail="${commandeCible}"]`);
      if (bouton) bouton.click();
    }
  } catch (erreur) {
    conteneur.innerHTML = '<p class="vide">Impossible de charger vos commandes.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!exigerConnexion('compte.html')) return;
  chargerProfil();
  chargerCommandes();
});
