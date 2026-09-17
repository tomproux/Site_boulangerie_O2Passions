/**
 * auth.js — formulaires de connexion / inscription et navigation (US-03, US-04).
 */

import { api, Session, ApiError, afficherMessage } from './api.js';
import { Panier } from './cart.js';

/** Met à jour la barre de navigation selon l'état de connexion. */
export function initialiserNavigation() {
  const zone = document.querySelector('[data-zone-compte]');
  Panier.rafraichirCompteur();
  if (!zone) return;

  const utilisateur = Session.getUtilisateur();

  if (Session.estConnecte() && utilisateur) {
    const lienAdmin = utilisateur.role === 'ADMIN'
      ? '<a href="admin/index.html">Administration</a>'
      : '';
    zone.innerHTML = `
      ${lienAdmin}
      <a href="compte.html">Mon espace</a>
      <a href="#" data-deconnexion>Déconnexion</a>`;

    const lien = zone.querySelector('[data-deconnexion]');
    lien.addEventListener('click', (e) => {
      e.preventDefault();
      Session.fermer();
      Panier.vider();
      window.location.href = 'index.html';
    });
  } else {
    zone.innerHTML = '<a href="connexion.html">Connexion</a>';
  }
}

/** Redirige vers la connexion si l'utilisateur n'est pas authentifié. */
export function exigerConnexion(retour) {
  if (!Session.estConnecte()) {
    const cible = retour || window.location.pathname.split('/').pop();
    window.location.href = `connexion.html?retour=${encodeURIComponent(cible)}`;
    return false;
  }
  return true;
}

function urlRetour() {
  const params = new URLSearchParams(window.location.search);
  const retour = params.get('retour');
  // On n'accepte qu'un nom de page local, jamais une URL externe.
  if (retour && /^[a-zA-Z0-9_-]+\.html$/.test(retour)) return retour;
  return 'compte.html';
}

/* ---------------------------------------------- Connexion */

export function initialiserConnexion() {
  const formulaire = document.getElementById('formulaire-connexion');
  if (!formulaire) return;

  formulaire.addEventListener('submit', async (e) => {
    e.preventDefault();
    afficherMessage('#message', '');
    const bouton = formulaire.querySelector('button[type="submit"]');
    bouton.disabled = true;

    try {
      const donnees = await api.post('/auth/login', {
        email: formulaire.email.value.trim(),
        password: formulaire.password.value,
      });
      Session.ouvrir(donnees.token, donnees.user);
      window.location.href = donnees.user.role === 'ADMIN' ? 'admin/index.html' : urlRetour();
    } catch (erreur) {
      afficherMessage('#message', erreur instanceof ApiError ? erreur.message : 'Erreur inattendue.');
      bouton.disabled = false;
    }
  });
}

/* ---------------------------------------------- Inscription */

export function initialiserInscription() {
  const formulaire = document.getElementById('formulaire-inscription');
  if (!formulaire) return;

  formulaire.addEventListener('submit', async (e) => {
    e.preventDefault();
    afficherMessage('#message', '');

    const motDePasse = formulaire.password.value;
    if (motDePasse.length < 8) {
      afficherMessage('#message', 'Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (motDePasse !== formulaire.passwordConfirm.value) {
      afficherMessage('#message', 'Les deux mots de passe ne correspondent pas.');
      return;
    }

    const bouton = formulaire.querySelector('button[type="submit"]');
    bouton.disabled = true;

    try {
      const donnees = await api.post('/auth/register', {
        firstName: formulaire.firstName.value.trim(),
        lastName: formulaire.lastName.value.trim(),
        email: formulaire.email.value.trim(),
        password: motDePasse,
        phone: formulaire.phone.value.trim() || null,
      });
      Session.ouvrir(donnees.token, {
        id: donnees.user.id,
        email: donnees.user.email,
        firstName: donnees.user.first_name,
        lastName: donnees.user.last_name,
        role: donnees.user.role,
      });
      window.location.href = urlRetour();
    } catch (erreur) {
      afficherMessage('#message', erreur instanceof ApiError ? erreur.message : 'Erreur inattendue.');
      bouton.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initialiserNavigation();
  initialiserConnexion();
  initialiserInscription();
});
