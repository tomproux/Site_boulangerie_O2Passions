/**
 * products.js — chargement et affichage des produits, catégories,
 * horaires et informations boutique (US-01, US-02).
 */

import { api, formaterPrix, echapper } from './api.js';
import { Panier } from './cart.js';

/* ---------------------------------------------- Rendu d'une carte produit */

export function carteProduit(produit) {
  const visuel = produit.image_url
    ? `<img src="${echapper(produit.image_url)}" alt="${echapper(produit.name)}" loading="lazy" onerror="this.remove()">`
    : `<span>${echapper(produit.name)}</span>`;

  const bouton = produit.is_available
    ? `<button class="btn btn-petit" data-ajouter="${echapper(produit.id)}">Ajouter au panier</button>`
    : '<span class="indisponible">Indisponible</span>';

  return `
    <article class="carte-produit">
      <a href="produit.html?slug=${encodeURIComponent(produit.slug)}" class="visuel">${visuel}</a>
      <div class="corps">
        <h3><a href="produit.html?slug=${encodeURIComponent(produit.slug)}">${echapper(produit.name)}</a></h3>
        <p class="description">${echapper((produit.description || '').slice(0, 90))}</p>
        <div class="entre-deux">
          <span class="prix">${formaterPrix(produit.price)}</span>
          ${bouton}
        </div>
      </div>
    </article>`;
}

function brancherBoutonsAjout(conteneur, produits) {
  conteneur.querySelectorAll('[data-ajouter]').forEach((bouton) => {
    bouton.addEventListener('click', () => {
      const produit = produits.find((p) => p.id === bouton.dataset.ajouter);
      if (!produit) return;
      Panier.ajouter(produit, 1);
      bouton.textContent = 'Ajouté ✓';
      setTimeout(() => { bouton.textContent = 'Ajouter au panier'; }, 1400);
    });
  });
}

/* ---------------------------------------------- Page d'accueil */

export async function chargerProduitsPhares(conteneurId = 'produits-phares', limite = 4) {
  const conteneur = document.getElementById(conteneurId);
  if (!conteneur) return;
  try {
    const produits = await api.get('/products?available=true');
    const selection = produits.slice(0, limite);
    conteneur.innerHTML = selection.map(carteProduit).join('');
    brancherBoutonsAjout(conteneur, selection);
  } catch (e) {
    conteneur.innerHTML = '<p class="vide">Impossible de charger les produits pour le moment.</p>';
  }
}

export async function chargerCategories(conteneurId = 'liste-categories') {
  const conteneur = document.getElementById(conteneurId);
  if (!conteneur) return [];
  try {
    const categories = await api.get('/categories');
    conteneur.innerHTML = categories
      .map(
        (c) => `<a class="puce-categorie" href="categorie.html?categorie=${encodeURIComponent(c.slug)}">${echapper(c.name)}</a>`
      )
      .join('');
    return categories;
  } catch (e) {
    conteneur.innerHTML = '';
    return [];
  }
}

export async function chargerInfosBoutique() {
  try {
    const infos = await api.get('/shop-settings');
    if (!infos) return;

    const adresse = document.querySelector('[data-boutique-adresse]');
    if (adresse) adresse.textContent = infos.address || '';

    const tel = document.querySelector('[data-boutique-telephone]');
    if (tel) tel.textContent = infos.phone || '';

    const apropos = document.querySelector('[data-boutique-apropos]');
    if (apropos) apropos.textContent = infos.about_text || '';

    document.querySelectorAll('[data-boutique-carte]').forEach((lien) => {
      if (infos.map_url) lien.href = infos.map_url;
    });

    const horaires = document.querySelector('[data-boutique-horaires]');
    if (horaires && infos.opening_hours) {
      const ordre = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
      horaires.innerHTML = ordre
        .filter((jour) => infos.opening_hours[jour])
        .map(
          (jour) =>
            `<li><span class="jour">${echapper(jour)}</span><span>${echapper(infos.opening_hours[jour])}</span></li>`
        )
        .join('');
    }
  } catch (e) {
    /* Les informations boutique sont non bloquantes pour l'affichage. */
  }
}

/* ---------------------------------------------- Page catégorie */

export async function initialiserPageCategorie() {
  const conteneur = document.getElementById('grille-produits');
  if (!conteneur) return;

  const params = new URLSearchParams(window.location.search);
  const slugCategorie = params.get('categorie');
  const titre = document.getElementById('titre-categorie');
  const filtres = document.getElementById('filtres-categories');

  let categories = [];
  try {
    categories = await api.get('/categories');
  } catch (e) {
    categories = [];
  }

  if (filtres) {
    const puces = [`<a class="puce-categorie ${!slugCategorie ? 'actif' : ''}" href="categorie.html">Tous</a>`]
      .concat(
        categories.map(
          (c) =>
            `<a class="puce-categorie ${c.slug === slugCategorie ? 'actif' : ''}" href="categorie.html?categorie=${encodeURIComponent(c.slug)}">${echapper(c.name)}</a>`
        )
      );
    filtres.innerHTML = puces.join('');
  }

  const categorie = categories.find((c) => c.slug === slugCategorie);
  if (titre) titre.textContent = categorie ? categorie.name : 'Tous nos produits';

  conteneur.innerHTML = '<p class="chargement">Chargement des produits…</p>';

  try {
    const requete = categorie ? `/products?categoryId=${encodeURIComponent(categorie.id)}` : '/products';
    const produits = await api.get(requete);
    if (produits.length === 0) {
      conteneur.innerHTML = '<p class="vide">Aucun produit dans cette catégorie pour le moment.</p>';
      return;
    }
    conteneur.innerHTML = produits.map(carteProduit).join('');
    brancherBoutonsAjout(conteneur, produits);
  } catch (e) {
    conteneur.innerHTML = '<p class="vide">Impossible de charger les produits.</p>';
  }
}

/* ---------------------------------------------- Page détail produit */

export async function initialiserPageProduit() {
  const conteneur = document.getElementById('detail-produit');
  if (!conteneur) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) {
    conteneur.innerHTML = '<p class="vide">Produit introuvable.</p>';
    return;
  }

  try {
    const produit = await api.get(`/products/${encodeURIComponent(slug)}`);
    const visuel = produit.image_url
      ? `<img src="${echapper(produit.image_url)}" alt="${echapper(produit.name)}" onerror="this.remove()">`
      : '';

    const zoneAchat = produit.is_available
      ? `
        <div class="selecteur-quantite">
          <button type="button" id="qte-moins" aria-label="Diminuer">−</button>
          <input type="number" id="qte" value="1" min="1" aria-label="Quantité">
          <button type="button" id="qte-plus" aria-label="Augmenter">+</button>
        </div>
        <button class="btn" id="ajouter-panier">Ajouter au panier</button>
        <p id="confirmation-ajout" class="message message-succes" style="display:none;margin-top:16px"></p>`
      : '<p class="indisponible">Ce produit est actuellement indisponible.</p>';

    conteneur.innerHTML = `
      <div class="visuel">${visuel}</div>
      <div>
        <p class="texte-doux" style="margin:0 0 6px">${echapper(produit.category_name || '')}</p>
        <h1 class="mt-0">${echapper(produit.name)}</h1>
        <p>${echapper(produit.description || '')}</p>
        <p class="prix" style="font-size:1.5rem;font-weight:700">${formaterPrix(produit.price)}</p>
        ${zoneAchat}
      </div>`;

    if (produit.is_available) {
      const champQte = document.getElementById('qte');
      document.getElementById('qte-moins').addEventListener('click', () => {
        champQte.value = Math.max(1, (parseInt(champQte.value, 10) || 1) - 1);
      });
      document.getElementById('qte-plus').addEventListener('click', () => {
        champQte.value = (parseInt(champQte.value, 10) || 1) + 1;
      });
      document.getElementById('ajouter-panier').addEventListener('click', () => {
        const quantite = parseInt(champQte.value, 10) || 1;
        Panier.ajouter(produit, quantite);
        const confirmation = document.getElementById('confirmation-ajout');
        confirmation.textContent = `${quantite} × ${produit.name} ajouté(s) au panier.`;
        confirmation.style.display = 'block';
      });
    }

    // Autres produits de la catégorie
    const similaires = document.getElementById('produits-similaires');
    if (similaires && produit.category_id) {
      const autres = (await api.get(`/products?categoryId=${encodeURIComponent(produit.category_id)}`))
        .filter((p) => p.id !== produit.id)
        .slice(0, 4);
      if (autres.length) {
        similaires.innerHTML = autres.map(carteProduit).join('');
        brancherBoutonsAjout(similaires, autres);
      } else {
        similaires.closest('.section')?.classList.add('cache');
      }
    }
  } catch (e) {
    conteneur.innerHTML = '<p class="vide">Produit introuvable.</p>';
  }
}
