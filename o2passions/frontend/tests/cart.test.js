/**
 * Tests unitaires du panier (US-05) — fonctions JavaScript critiques
 * identifiées en section 9.2 de la documentation.
 * Exécution : npm test (Jest en environnement jsdom).
 */

import { Panier } from '../js/cart.js';

const PRODUIT_A = { id: 'p1', name: 'Baguette tradition', slug: 'baguette', price: 1.20, image_url: null };
const PRODUIT_B = { id: 'p2', name: 'Éclair chocolat', slug: 'eclair', price: 3.50, image_url: null };

beforeEach(() => {
  localStorage.clear();
});

describe('Panier — ajout', () => {
  test('ajoute un produit avec sa quantité', () => {
    Panier.ajouter(PRODUIT_A, 2);
    const articles = Panier.lire();
    expect(articles).toHaveLength(1);
    expect(articles[0].quantity).toBe(2);
    expect(articles[0].productId).toBe('p1');
  });

  test('cumule les quantités pour un produit déjà présent', () => {
    Panier.ajouter(PRODUIT_A, 2);
    Panier.ajouter(PRODUIT_A, 3);
    const articles = Panier.lire();
    expect(articles).toHaveLength(1);
    expect(articles[0].quantity).toBe(5);
  });

  test('ignore une quantité nulle ou négative', () => {
    Panier.ajouter(PRODUIT_A, 0);
    expect(Panier.lire()).toHaveLength(0);
  });
});

describe('Panier — modification et suppression', () => {
  test('modifie la quantité d\'un article', () => {
    Panier.ajouter(PRODUIT_A, 1);
    Panier.modifierQuantite('p1', 4);
    expect(Panier.lire()[0].quantity).toBe(4);
  });

  test('supprime l\'article si la quantité tombe à zéro', () => {
    Panier.ajouter(PRODUIT_A, 1);
    Panier.modifierQuantite('p1', 0);
    expect(Panier.lire()).toHaveLength(0);
  });

  test('supprime un article ciblé sans toucher aux autres', () => {
    Panier.ajouter(PRODUIT_A, 1);
    Panier.ajouter(PRODUIT_B, 1);
    Panier.supprimer('p1');
    const articles = Panier.lire();
    expect(articles).toHaveLength(1);
    expect(articles[0].productId).toBe('p2');
  });

  test('vide entièrement le panier', () => {
    Panier.ajouter(PRODUIT_A, 1);
    Panier.ajouter(PRODUIT_B, 2);
    Panier.vider();
    expect(Panier.lire()).toHaveLength(0);
  });
});

describe('Panier — calculs', () => {
  test('calcule le total des articles', () => {
    Panier.ajouter(PRODUIT_A, 2); // 2,40
    Panier.ajouter(PRODUIT_B, 1); // 3,50
    expect(Panier.total()).toBe(5.90);
  });

  test('arrondit correctement le total au centime', () => {
    Panier.ajouter({ ...PRODUIT_A, price: 0.1 }, 3);
    expect(Panier.total()).toBe(0.3);
  });

  test('compte le nombre total d\'articles', () => {
    Panier.ajouter(PRODUIT_A, 2);
    Panier.ajouter(PRODUIT_B, 3);
    expect(Panier.nombreArticles()).toBe(5);
  });

  test('retourne un total de 0 pour un panier vide', () => {
    expect(Panier.total()).toBe(0);
    expect(Panier.nombreArticles()).toBe(0);
  });
});

describe('Panier — persistance et payload', () => {
  test('conserve le panier entre deux lectures (localStorage)', () => {
    Panier.ajouter(PRODUIT_A, 2);
    expect(Panier.lire()[0].name).toBe('Baguette tradition');
  });

  test('retourne un panier vide si le stockage est corrompu', () => {
    localStorage.setItem('o2p_panier', 'ceci-n-est-pas-du-json');
    expect(Panier.lire()).toEqual([]);
  });

  test('produit un payload limité à productId et quantity', () => {
    Panier.ajouter(PRODUIT_A, 2);
    expect(Panier.versPayload()).toEqual([{ productId: 'p1', quantity: 2 }]);
  });
});
