/**
 * admin-products.js — gestion du catalogue en back-office (US-08).
 */

import { api, ApiError, Session, formaterPrix, echapper, afficherMessage } from '../../js/api.js';

let categories = [];
let produitEnEdition = null;

export function exigerAdmin() {
  if (!Session.estConnecte() || !Session.estAdmin()) {
    window.location.href = '../connexion.html';
    return false;
  }
  return true;
}

export function initialiserNavigationAdmin() {
  const zone = document.querySelector('[data-zone-admin]');
  if (!zone) return;
  const utilisateur = Session.getUtilisateur();
  zone.innerHTML = `
    <span style="color:var(--brun-300);font-size:0.9rem">${echapper(utilisateur ? utilisateur.firstName || utilisateur.email : '')}</span>
    <a href="../index.html">Voir le site</a>
    <a href="#" data-deconnexion-admin>Déconnexion</a>`;
  zone.querySelector('[data-deconnexion-admin]').addEventListener('click', (e) => {
    e.preventDefault();
    Session.fermer();
    window.location.href = '../connexion.html';
  });
}

/* ---------------------------------------------- Liste des produits */

export async function chargerProduits() {
  const conteneur = document.getElementById('tableau-produits');
  if (!conteneur) return;

  conteneur.innerHTML = '<p class="chargement">Chargement…</p>';

  try {
    [categories] = await Promise.all([api.get('/categories')]);
    const produits = await api.get('/admin/products');

    if (produits.length === 0) {
      conteneur.innerHTML = '<p class="vide">Aucun produit. Commencez par en ajouter un.</p>';
      return;
    }

    const lignes = produits
      .map(
        (p) => `
        <tr>
          <td><strong>${echapper(p.name)}</strong></td>
          <td>${echapper(p.category_name || '')}</td>
          <td>${formaterPrix(p.price)}</td>
          <td>
            <span class="badge badge-${p.is_available ? 'READY' : 'CANCELLED'}">
              ${p.is_available ? 'Actif' : 'Inactif'}
            </span>
          </td>
          <td>
            <div class="barre-actions">
              <button class="btn btn-secondaire btn-petit" data-editer="${echapper(p.id)}">Éditer</button>
              <button class="btn btn-secondaire btn-petit" data-basculer="${echapper(p.id)}" data-etat="${p.is_available}">
                ${p.is_available ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          </td>
        </tr>`
      )
      .join('');

    conteneur.innerHTML = `
      <div class="tableau-defilant">
        <table class="tableau">
          <thead>
            <tr><th>Nom</th><th>Catégorie</th><th>Prix</th><th>Statut</th><th>Actions</th></tr>
          </thead>
          <tbody>${lignes}</tbody>
        </table>
      </div>`;

    conteneur.querySelectorAll('[data-editer]').forEach((bouton) => {
      bouton.addEventListener('click', () => {
        const produit = produits.find((p) => p.id === bouton.dataset.editer);
        ouvrirFormulaire(produit);
      });
    });

    conteneur.querySelectorAll('[data-basculer]').forEach((bouton) => {
      bouton.addEventListener('click', async () => {
        const actif = bouton.dataset.etat === 'true';
        try {
          await api.patch(`/admin/products/${bouton.dataset.basculer}`, { isAvailable: !actif });
          chargerProduits();
        } catch (erreur) {
          afficherMessage('#message', erreur instanceof ApiError ? erreur.message : 'Erreur inattendue.');
        }
      });
    });
  } catch (erreur) {
    conteneur.innerHTML = '<p class="vide">Impossible de charger les produits.</p>';
  }
}

/* ---------------------------------------------- Formulaire produit */

export function ouvrirFormulaire(produit = null) {
  produitEnEdition = produit;
  const modale = document.getElementById('modale-produit');
  const formulaire = document.getElementById('formulaire-produit');
  const titre = document.getElementById('titre-modale');

  titre.textContent = produit ? 'Modifier le produit' : 'Ajouter un produit';

  formulaire.categoryId.innerHTML = categories
    .map((c) => `<option value="${echapper(c.id)}">${echapper(c.name)}</option>`)
    .join('');

  formulaire.name.value = produit ? produit.name : '';
  formulaire.description.value = produit ? produit.description || '' : '';
  formulaire.price.value = produit ? produit.price : '';
  formulaire.categoryId.value = produit ? produit.category_id : (categories[0] || {}).id || '';
  formulaire.imageUrl.value = produit ? produit.image_url || '' : '';
  formulaire.isAvailable.checked = produit ? produit.is_available : true;

  modale.classList.remove('cache');
}

export function fermerFormulaire() {
  document.getElementById('modale-produit').classList.add('cache');
  produitEnEdition = null;
}

export function initialiserFormulaireProduit() {
  const formulaire = document.getElementById('formulaire-produit');
  if (!formulaire) return;

  document.getElementById('bouton-ajouter').addEventListener('click', () => ouvrirFormulaire(null));
  document.getElementById('bouton-annuler').addEventListener('click', fermerFormulaire);

  formulaire.addEventListener('submit', async (e) => {
    e.preventDefault();
    afficherMessage('#message-modale', '');

    const corps = {
      name: formulaire.name.value.trim(),
      description: formulaire.description.value.trim(),
      price: parseFloat(formulaire.price.value),
      categoryId: formulaire.categoryId.value,
      imageUrl: formulaire.imageUrl.value.trim() || null,
      isAvailable: formulaire.isAvailable.checked,
    };

    try {
      if (produitEnEdition) {
        await api.patch(`/admin/products/${produitEnEdition.id}`, corps);
      } else {
        await api.post('/admin/products', corps);
      }
      fermerFormulaire();
      chargerProduits();
    } catch (erreur) {
      afficherMessage('#message-modale', erreur instanceof ApiError ? erreur.message : 'Erreur inattendue.');
    }
  });
}
