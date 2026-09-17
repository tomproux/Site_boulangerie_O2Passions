/**
 * api.js — centralise les appels fetch() vers l'API O2Passions.
 * Gère l'URL de base, le token JWT et le format d'erreur commun.
 */

const API_BASE = window.O2_API_BASE || 'http://localhost:5000/api';
const CLE_TOKEN = 'o2p_token';
const CLE_UTILISATEUR = 'o2p_user';

export const Session = {
  getToken() {
    return localStorage.getItem(CLE_TOKEN);
  },
  getUtilisateur() {
    const brut = localStorage.getItem(CLE_UTILISATEUR);
    return brut ? JSON.parse(brut) : null;
  },
  ouvrir(token, utilisateur) {
    localStorage.setItem(CLE_TOKEN, token);
    localStorage.setItem(CLE_UTILISATEUR, JSON.stringify(utilisateur));
  },
  fermer() {
    localStorage.removeItem(CLE_TOKEN);
    localStorage.removeItem(CLE_UTILISATEUR);
  },
  estConnecte() {
    return Boolean(localStorage.getItem(CLE_TOKEN));
  },
  estAdmin() {
    const u = Session.getUtilisateur();
    return Boolean(u && u.role === 'ADMIN');
  },
};

export class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function requete(chemin, options = {}) {
  const entetes = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = Session.getToken();
  if (token) entetes.Authorization = `Bearer ${token}`;

  let reponse;
  try {
    reponse = await fetch(`${API_BASE}${chemin}`, { ...options, headers: entetes });
  } catch (e) {
    throw new ApiError('Impossible de joindre le serveur. Réessayez plus tard.', 'NETWORK_ERROR', 0);
  }

  let corps = null;
  const texte = await reponse.text();
  if (texte) {
    try {
      corps = JSON.parse(texte);
    } catch (e) {
      corps = null;
    }
  }

  if (!reponse.ok) {
    const erreur = (corps && corps.error) || {};
    // Session expirée : on nettoie et on renvoie vers la connexion.
    if (reponse.status === 401 && Session.estConnecte()) {
      Session.fermer();
    }
    throw new ApiError(
      erreur.message || 'Une erreur est survenue.',
      erreur.code || 'UNKNOWN_ERROR',
      reponse.status
    );
  }

  return corps ? corps.data : null;
}

export const api = {
  get: (chemin) => requete(chemin, { method: 'GET' }),
  post: (chemin, corps) => requete(chemin, { method: 'POST', body: JSON.stringify(corps || {}) }),
  patch: (chemin, corps) => requete(chemin, { method: 'PATCH', body: JSON.stringify(corps || {}) }),
  delete: (chemin) => requete(chemin, { method: 'DELETE' }),
};

/* ---------------------------------------------- Helpers d'affichage */

export function formaterPrix(montant) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
    .format(Number(montant));
}

export function formaterDate(valeur) {
  if (!valeur) return '';
  const d = new Date(valeur);
  if (Number.isNaN(d.getTime())) return valeur;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formaterDateHeure(valeur) {
  if (!valeur) return '';
  const d = new Date(valeur);
  if (Number.isNaN(d.getTime())) return valeur;
  return d.toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export const LIBELLES_STATUT = {
  PENDING: 'En attente de paiement',
  IN_PREPARATION: 'En préparation',
  READY: 'Prête',
  IN_DELIVERY: 'En livraison',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
};

export const LIBELLES_PAIEMENT = {
  PENDING: 'En attente',
  PAID: 'Payée',
  FAILED: 'Échec',
  REFUNDED: 'Remboursée',
};

export const LIBELLES_RECEPTION = {
  PICKUP: 'Retrait en boutique',
  DELIVERY: 'Livraison',
};

/** Échappe le HTML pour éviter toute injection lors des rendus dynamiques. */
export function echapper(texte) {
  const div = document.createElement('div');
  div.textContent = texte == null ? '' : String(texte);
  return div.innerHTML;
}

export function afficherMessage(selecteur, texte, type = 'erreur') {
  const el = document.querySelector(selecteur);
  if (!el) return;
  el.className = `message message-${type}`;
  el.textContent = texte;
  el.style.display = texte ? 'block' : 'none';
}
