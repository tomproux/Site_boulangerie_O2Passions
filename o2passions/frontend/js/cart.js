/**
 * cart.js — gestion du panier côté client (US-05).
 * Le panier est conservé en localStorage entre les pages, jusqu'à la
 * validation de la commande (cf. section 8.3 : pas d'endpoint /api/cart).
 */

import { formaterPrix, echapper } from './api.js';

const CLE_PANIER = 'o2p_panier';

export const Panier = {
  lire() {
    try {
      const brut = localStorage.getItem(CLE_PANIER);
      const articles = brut ? JSON.parse(brut) : [];
      return Array.isArray(articles) ? articles : [];
    } catch (e) {
      return [];
    }
  },

  ecrire(articles) {
    localStorage.setItem(CLE_PANIER, JSON.stringify(articles));
    Panier.rafraichirCompteur();
  },

  ajouter(produit, quantite = 1) {
    if (quantite <= 0) return Panier.lire();
    const articles = Panier.lire();
    const existant = articles.find((a) => a.productId === produit.id);
    if (existant) {
      existant.quantity += quantite;
    } else {
      articles.push({
        productId: produit.id,
        name: produit.name,
        slug: produit.slug,
        price: Number(produit.price),
        imageUrl: produit.image_url || null,
        quantity: quantite,
      });
    }
    Panier.ecrire(articles);
    return articles;
  },

  modifierQuantite(productId, quantite) {
    let articles = Panier.lire();
    if (quantite <= 0) return Panier.supprimer(productId);
    articles = articles.map((a) =>
      a.productId === productId ? { ...a, quantity: quantite } : a
    );
    Panier.ecrire(articles);
    return articles;
  },

  supprimer(productId) {
    const articles = Panier.lire().filter((a) => a.productId !== productId);
    Panier.ecrire(articles);
    return articles;
  },

  vider() {
    localStorage.removeItem(CLE_PANIER);
    Panier.rafraichirCompteur();
  },

  /** Total du panier, arrondi au centime. */
  total(articles = Panier.lire()) {
    const somme = articles.reduce((acc, a) => acc + Number(a.price) * a.quantity, 0);
    return Math.round(somme * 100) / 100;
  },

  nombreArticles(articles = Panier.lire()) {
    return articles.reduce((acc, a) => acc + a.quantity, 0);
  },

  /** Format attendu par POST /api/orders. */
  versPayload(articles = Panier.lire()) {
    return articles.map((a) => ({ productId: a.productId, quantity: a.quantity }));
  },

  rafraichirCompteur() {
    const compteurs = document.querySelectorAll('[data-compteur-panier]');
    const n = Panier.nombreArticles();
    compteurs.forEach((el) => {
      el.textContent = n;
      el.style.display = n > 0 ? 'inline-block' : 'none';
    });
  },
};

/* ---------------------------------------------- Rendu de la page panier */

export function afficherPanier(conteneurId = 'contenu-panier') {
  const conteneur = document.getElementById(conteneurId);
  if (!conteneur) return;

  const articles = Panier.lire();

  if (articles.length === 0) {
    conteneur.innerHTML = `
      <div class="vide">
        <h3>Votre panier est vide</h3>
        <p>Parcourez notre catalogue pour composer votre commande.</p>
        <a class="btn" href="categorie.html">Voir les produits</a>
      </div>`;
    return;
  }

  const lignes = articles
    .map(
      (a) => `
      <tr>
        <td>${echapper(a.name)}</td>
        <td>
          <div class="selecteur-quantite" style="margin:0">
            <button type="button" data-action="moins" data-id="${echapper(a.productId)}" aria-label="Diminuer">−</button>
            <input type="number" min="1" value="${a.quantity}" data-action="saisie" data-id="${echapper(a.productId)}" aria-label="Quantité">
            <button type="button" data-action="plus" data-id="${echapper(a.productId)}" aria-label="Augmenter">+</button>
          </div>
        </td>
        <td>${formaterPrix(a.price)}</td>
        <td><strong>${formaterPrix(a.price * a.quantity)}</strong></td>
        <td>
          <button class="btn btn-secondaire btn-petit" data-action="supprimer" data-id="${echapper(a.productId)}">Retirer</button>
        </td>
      </tr>`
    )
    .join('');

  conteneur.innerHTML = `
    <div class="tableau-defilant mb-24">
      <table class="tableau">
        <thead>
          <tr><th>Produit</th><th>Quantité</th><th>Prix unitaire</th><th>Total</th><th></th></tr>
        </thead>
        <tbody>${lignes}</tbody>
      </table>
    </div>
    <div class="encart" style="max-width:380px;margin-left:auto">
      <div class="total-ligne total-final">
        <span>Total</span><span>${formaterPrix(Panier.total(articles))}</span>
      </div>
      <div class="barre-actions" style="margin-top:18px">
        <a class="btn btn-secondaire" href="categorie.html">Continuer mes achats</a>
        <a class="btn" href="checkout.html">Commander</a>
      </div>
    </div>`;

  conteneur.querySelectorAll('[data-action]').forEach((el) => {
    const id = el.dataset.id;
    const action = el.dataset.action;

    if (action === 'saisie') {
      el.addEventListener('change', () => {
        Panier.modifierQuantite(id, parseInt(el.value, 10) || 1);
        afficherPanier(conteneurId);
      });
      return;
    }

    el.addEventListener('click', () => {
      const article = Panier.lire().find((a) => a.productId === id);
      if (!article) return;
      if (action === 'plus') Panier.modifierQuantite(id, article.quantity + 1);
      if (action === 'moins') Panier.modifierQuantite(id, article.quantity - 1);
      if (action === 'supprimer') Panier.supprimer(id);
      afficherPanier(conteneurId);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => Panier.rafraichirCompteur());
