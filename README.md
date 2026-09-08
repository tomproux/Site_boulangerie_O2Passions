# Documentation technique — Site web O2Passions (boulangerie-pâtisserie)

**Projet :** O2Passions — Site web d'une boulangerie-pâtisserie permettant de présenter les produits, informer sur les horaires et la localisation, et passer des commandes en ligne (retrait en boutique).

**Objectif du MVP :** Offrir une vitrine numérique claire et permettre la prise de commande simple, tout en restant facile à maintenir et à faire évoluer.

## Sommaire

1. [Présentation du projet](#1-présentation-du-projet)
2. [User Stories et priorisation](#2-user-stories-et-priorisation)
3. [Maquettes des écrans principaux](#3-maquettes-des-écrans-principaux)
4. [Architecture du système](#4-architecture-du-système)
5. [Composants, classes et conception de la base de données](#5-composants-classes-et-conception-de-la-base-de-données)
6. [Conception de la base de données](#6-conception-de-la-base-de-données)
7. [Diagrammes de séquence](#7-diagrammes-de-séquence)
8. [APIs externes et spécifications des APIs internes](#8-apis-externes-et-spécifications-des-apis-internes)
9. [Stratégie SCM et QA](#9-stratégie-scm-et-qa)
10. [Justifications techniques](#10-justifications-techniques)
11. [Sécurité et évolutions futures](#11-sécurité-et-évolutions-futures)

---

## 1. Présentation du projet

### 1.1 Contexte

O2Passions est une boulangerie-pâtisserie qui souhaite :

- Présenter ses produits (pains, viennoiseries, pâtisseries, traiteur, etc.).
- Informer sur les horaires, l'adresse et les coordonnées.
- Permettre aux clients de commander en ligne pour :
  - Retrait en boutique.
  - Livraison locale (périmètre limité).

Le site doit être :

- Responsive (mobile, tablette, desktop).
- Simple à utiliser pour les clients.
- Facile à administrer pour l'équipe (mise à jour des produits, gestion des commandes).

### 1.2 Types d'utilisateurs

| Type d'utilisateur | Description |
|---|---|
| Visiteur | Consulte le site, les produits, les horaires et la localisation. |
| Client connecté | Crée un compte, passe et suit ses commandes, gère son profil. |
| Administrateur / Gérant | Gère le catalogue produits, les commandes, les horaires et le contenu du site. |

### 1.3 Périmètre du MVP

**Inclus :**

- Vitrine des produits par catégories.
- Pages d'information (À propos, Horaires & Localisation, Contact).
- Compte client (création, connexion, profil).
- Panier et commande en ligne.
- Paiement en ligne (carte bancaire).
- Back-office pour gérer produits et commandes.
- Tests automatisés et déploiement continu.

**Hors périmètre (pour une version ultérieure) :**

- Programme de fidélité avancé.
- Abonnements récurrents.
- Application mobile native.
- Chat en direct avec le personnel.
- Multi-boutiques.

---

## 2. User Stories et priorisation

Les User Stories sont rédigées selon le format : *« En tant que [type d'utilisateur], je veux [action], afin de [objectif]. »*

### 2.1 Must Have — Indispensable

**US-01 — Consulter la vitrine et les produits**

> En tant que visiteur, je veux consulter la liste des produits par catégorie, afin de découvrir l'offre de la boulangerie.

Critères d'acceptation :
- Les produits sont organisés par catégories (pains, viennoiseries, pâtisseries, etc.).
- Chaque produit affiche : nom, description courte, prix, image, disponibilité.
- La page est lisible sur mobile et desktop.

**US-02 — Voir les horaires et la localisation**

> En tant que visiteur, je veux voir les horaires d'ouverture et l'adresse de la boutique, afin de savoir quand et où me rendre.

Critères d'acceptation :
- Une page dédiée affiche les horaires par jour.
- L'adresse, le numéro de téléphone et un lien vers la carte (Google Maps) sont visibles.
- Les horaires peuvent être mis à jour par l'administrateur.

**US-03 — Créer un compte client**

> En tant que visiteur, je veux créer un compte client, afin de pouvoir commander en ligne et suivre mes commandes.

Critères d'acceptation :
- Formulaire d'inscription : nom, prénom, e-mail, mot de passe, téléphone (optionnel).
- Validation de l'e-mail (format et unicité).
- Mot de passe conforme aux règles de sécurité.
- Confirmation par e-mail (optionnelle dans le MVP, mais prévue).

**US-04 — Se connecter / se déconnecter**

> En tant que client, je veux me connecter et me déconnecter, afin d'accéder à mon espace personnel et à mes commandes.

Critères d'acceptation :
- Connexion par e-mail et mot de passe.
- Gestion de session sécurisée (JWT ou session serveur).
- Redirection vers le tableau de bord après connexion.
- Déconnexion claire et fonctionnelle.

**US-05 — Ajouter des produits au panier**

> En tant que client connecté ou non (selon choix), je veux ajouter des produits au panier, afin de préparer ma commande.

Critères d'acceptation :
- Sélection de la quantité par produit.
- Affichage du panier avec récapitulatif (produits, quantités, prix total).
- Possibilité de modifier ou supprimer un article du panier.
- Le panier est conservé entre les pages (session ou compte).

**US-06 — Passer une commande**

> En tant que client connecté, je veux passer une commande en ligne, afin de réserver mes produits pour retrait ou livraison.

Critères d'acceptation :
- Choix du mode de réception : retrait en boutique ou livraison.
- Sélection de la date et de l'horaire de retrait/livraison (plages définies).
- Saisie ou confirmation de l'adresse de livraison si applicable.
- Récapitulatif de la commande avant paiement.
- Paiement sécurisé par carte bancaire.
- Génération d'un numéro de commande et envoi d'un e-mail de confirmation.

**US-07 — Suivre ses commandes**

> En tant que client connecté, je veux consulter l'historique et le statut de mes commandes, afin de savoir où en est ma commande.

Critères d'acceptation :
- Liste des commandes passées par le client.
- Détail de chaque commande : produits, total, mode de réception, date, statut.
- Statuts possibles : en préparation, prête, en livraison, terminée, annulée.

**US-08 — Gérer le catalogue produits (back-office)**

> En tant qu'administrateur, je veux ajouter, modifier et désactiver des produits, afin de maintenir le catalogue à jour.

Critères d'acceptation :
- Création d'un produit : nom, description, prix, catégorie, image, disponibilité.
- Modification des informations d'un produit.
- Activation/désactivation d'un produit (sans suppression).
- Gestion des catégories.

**US-09 — Gérer les commandes (back-office)**

> En tant qu'administrateur, je veux consulter et mettre à jour le statut des commandes, afin de gérer la production et la livraison.

Critères d'acceptation :
- Liste des commandes avec filtres (statut, date, mode de réception).
- Détail d'une commande.
- Changement de statut (ex. « en préparation » → « prête »).
- Possibilité d'annuler une commande avec motif.

### 2.2 Should Have — Important

**US-10 — Code promotionnel**
> En tant que client, je veux saisir un code promotionnel lors de la commande, afin de bénéficier d'une réduction.

**US-11 — Favoris / produits préférés**
> En tant que client, je veux marquer des produits comme favoris, afin de les retrouver facilement.

**US-12 — Avis et notes sur les produits**
> En tant que client, je veux laisser un avis et une note sur un produit après achat, afin de partager mon expérience.

### 2.3 Could Have — Souhaitable

**US-13 — Pré-commande pour événements**
> En tant que client, je veux commander un gâteau personnalisé pour un événement, afin de préciser mes besoins (texte, décor, etc.).

**US-14 — Newsletter**
> En tant que visiteur, je veux m'inscrire à la newsletter, afin de recevoir les actualités et promotions.

### 2.4 Won't Have — Hors périmètre du MVP

**US-15 — Programme de fidélité complet**
> En tant que client, je veux cumuler des points et les convertir en avantages, afin de bénéficier d'un programme de fidélité.

Cette fonctionnalité est reportée à une version ultérieure.

---

## 3. Maquettes des écrans principaux

Le MVP inclut une interface client (site public) et une interface administrateur (back-office).

### 3.1 Page d'accueil (client)

```text
+----------------------------------------------------------+
| O2Passions                         [Panier] [Compte]      |
+----------------------------------------------------------+
| [Bannière : image de vitrine / spécialités]              |
+----------------------------------------------------------+
| Nos catégories                                           |
| [Pains] [Viennoiseries] [Pâtisseries] [Traiteur] [...]   |
+----------------------------------------------------------+
| Produits phares                                          |
| [Carte produit 1] [Carte produit 2] [Carte produit 3]    |
+----------------------------------------------------------+
| Horaires & Localisation                                  |
| Ouvert du mardi au dimanche, 7h-19h                       |
| 12 rue du Four, 75000 Ville                               |
| [Voir sur la carte]                                       |
+----------------------------------------------------------+
| À propos                                                 |
| Court texte sur l'histoire et les valeurs.                |
+----------------------------------------------------------+
| Footer : liens légaux, CGV, contact, réseaux sociaux      |
+----------------------------------------------------------+
```

### 3.2 Page catégorie / liste des produits

```text
+----------------------------------------------------------+
| O2Passions                         [Panier] [Compte]      |
+----------------------------------------------------------+
| Pains                                                     |
+----------------------------------------------------------+
| Filtres : [Tous] [Sans gluten] [Au levain] [...]          |
+----------------------------------------------------------+
| [Produit] [Produit] [Produit] [Produit]                   |
| - Image                                                   |
| - Nom                                                      |
| - Prix                                                     |
| - Bouton "Ajouter au panier"                               |
+----------------------------------------------------------+
```

### 3.3 Détail d'un produit

```text
+----------------------------------------------------------+
| O2Passions                         [Panier] [Compte]      |
+----------------------------------------------------------+
| [Image grande]                                            |
|                                                            |
| Nom du produit                                             |
| Description complète                                       |
| Prix : 3,50 EUR                                             |
|                                                            |
| Quantité : [ - ] [ 1 ] [ + ]                                |
| [ Ajouter au panier ]                                       |
|                                                            |
| Autres produits de la catégorie                             |
+----------------------------------------------------------+
```

### 3.4 Panier

```text
+----------------------------------------------------------+
| Mon panier                                                |
+----------------------------------------------------------+
| Produit            | Qté | Prix unit. | Total | Suppr.    |
| Baguette tradition |  2  |   1,20 EUR |2,40 EUR|   [X]    |
| Éclair chocolat    |  1  |   3,50 EUR |3,50 EUR|   [X]    |
+----------------------------------------------------------+
| Total : 5,90 EUR                                            |
| [ Continuer mes achats ]   [ Commander ]                    |
+----------------------------------------------------------+
```

### 3.5 Checkout (récapitulatif et paiement)

```text
+----------------------------------------------------------+
| Commander                                                 |
+----------------------------------------------------------+
| Récapitulatif de la commande                               |
| - Liste des produits                                       |
| - Total                                                     |
+----------------------------------------------------------+
| Mode de réception                                          |
| [ Retrait en boutique ]  [ Livraison ]                      |
+----------------------------------------------------------+
| Date et heure                                              |
| [Sélecteur de date] [Sélecteur d'horaire]                    |
+----------------------------------------------------------+
| Adresse (si livraison)                                      |
| [Formulaire d'adresse]                                       |
+----------------------------------------------------------+
| Paiement                                                    |
| [Payer par carte]                                            |
+----------------------------------------------------------+
| [ Confirmer la commande ]                                    |
+----------------------------------------------------------+
```

### 3.6 Espace client (mes commandes)

```text
+----------------------------------------------------------+
| Mon espace                                                |
+----------------------------------------------------------+
| Mes informations                                           |
| Nom, prénom, e-mail, téléphone                               |
| [Modifier]                                                   |
+----------------------------------------------------------+
| Mes commandes                                               |
| Date | N° commande | Total | Statut | [Voir détail]          |
+----------------------------------------------------------+
```

### 3.7 Back-office — Liste des produits

```text
+----------------------------------------------------------+
| Administration O2Passions                                  |
+----------------------------------------------------------+
| Produits                                                    |
+----------------------------------------------------------+
| [Ajouter un produit]                                         |
+----------------------------------------------------------+
| Nom | Catégorie | Prix | Statut | Actions                     |
| Baguette | Pains | 1,20 EUR | Actif | [Éditer] [Désactiver]   |
+----------------------------------------------------------+
```

### 3.8 Back-office — Détail d'une commande

```text
+----------------------------------------------------------+
| Commande #1234                                             |
+----------------------------------------------------------+
| Client : Alice Martin                                        |
| Date : 07/09/2026 10:30                                       |
| Mode : Livraison                                              |
| Statut : [En préparation v]                                    |
+----------------------------------------------------------+
| Produits                                                     |
| - 2 x Baguette tradition                                      |
| - 1 x Éclair chocolat                                          |
+----------------------------------------------------------+
| Adresse de livraison                                          |
| 10 avenue des Champs, 75000 Ville                               |
+----------------------------------------------------------+
| [Enregistrer le statut]  [Annuler la commande]                  |
+----------------------------------------------------------+
```

---

## 4. Architecture du système

### 4.1 Technologies retenues

| Couche | Technologie | Rôle |
|---|---|---|
| Front-end client | Next.js (React) + TypeScript | Site public, SEO, rendu serveur. |
| Front-end admin | Next.js ou React + TypeScript | Back-office pour gérants. |
| Back-end API | Node.js avec NestJS ou Express + TypeScript | API REST, logique métier. |
| Base de données | PostgreSQL | Stockage des produits, commandes, utilisateurs. |
| Authentification | JWT (ou sessions serveur) | Gestion des connexions clients et admin. |
| Paiement | Stripe (ou équivalent) | Paiement par carte bancaire. |
| Hébergement | Vercel / Netlify (front) + Render / AWS / Railway (API & DB) | Déploiement et scalabilité. |
| Tests | Jest, React Testing Library, Supertest, Playwright | Tests unitaires, intégration, end-to-end. |
| CI/CD | GitHub Actions | Build, tests, déploiement automatique. |

### 4.2 Diagramme d'architecture de haut niveau

<img src="diagrams/architecture.png" alt="Architecture de haut niveau O2Passions" width="850"/>

### 4.3 Flux de données principaux

1. Le client navigue sur le site Next.js.
2. Le front-end appelle l'API pour :
   - Récupérer les produits et catégories.
   - Créer / mettre à jour le panier.
   - Passer une commande.
3. L'API vérifie l'authentification (JWT).
4. L'API interagit avec PostgreSQL pour lire/écrire les données.
5. Pour le paiement, l'API communique avec Stripe.
6. Le back-office appelle les mêmes endpoints API avec des droits admin.

---

## 5. Composants, classes et conception de la base de données

### 5.1 Principaux composants front-end (client)

- `Layout` : structure commune (header, footer).
- `Navbar` : navigation, liens, icônes panier/compte.
- `HomePage` : page d'accueil avec sections.
- `CategoryPage` : liste des produits d'une catégorie.
- `ProductCard` : carte produit (image, nom, prix, bouton).
- `ProductDetailPage` : détail d'un produit.
- `CartPage` : affichage et gestion du panier.
- `CheckoutPage` : formulaire de commande et paiement.
- `AccountPage` : profil et historique des commandes.
- `LoginForm` / `RegisterForm` : authentification.
- `OrderList` / `OrderDetail` : historique et détail des commandes.

### 5.2 Principaux composants back-office

- `AdminLayout` : structure admin (menu latéral, header).
- `ProductList` / `ProductForm` : gestion des produits.
- `OrderList` / `OrderDetail` : gestion des commandes.
- `SettingsPage` : horaires, infos boutique, etc.

### 5.3 Classes / services back-end

**User**
- Attributs : `id`, `email`, `passwordHash`, `firstName`, `lastName`, `phone`, `role`, `createdAt`, `updatedAt`.
- Méthodes : `createUser()`, `findByEmail()`, `verifyPassword()`, `generateToken()`.

**Product**
- Attributs : `id`, `name`, `slug`, `description`, `price`, `categoryId`, `imageUrl`, `isAvailable`, `createdAt`, `updatedAt`.
- Méthodes : `create()`, `findAll()`, `findById()`, `update()`, `delete()`, `findByCategory()`.

**Category**
- Attributs : `id`, `name`, `slug`, `order`.
- Méthodes : `create()`, `findAll()`, `findById()`.

**Order**
- Attributs : `id`, `userId`, `status`, `receptionMode`, `scheduledDate`, `scheduledTimeSlot`, `deliveryAddress`, `totalAmount`, `paymentStatus`, `createdAt`, `updatedAt`.
- Méthodes : `create()`, `findById()`, `findByUserId()`, `findAllForAdmin()`, `updateStatus()`, `cancel()`.

**OrderItem**
- Attributs : `id`, `orderId`, `productId`, `quantity`, `unitPrice`, `totalPrice`.
- Méthodes : `create()`, `findByOrderId()`.

**AuthService**
- Méthodes : `register()`, `login()`, `validateToken()`, `refreshToken()` (optionnel).

**ProductService**
- Méthodes : `listProducts(filters)`, `getProduct(id)`, `createProduct(data)`, `updateProduct(id, data)`, `toggleAvailability(id)`.

**OrderService**
- Méthodes : `createOrder(userId, data)`, `getOrder(id)`, `getUserOrders(userId)`, `updateOrderStatus(orderId, status)`, `cancelOrder(orderId, reason)`.

**PaymentService**
- Méthodes : `createPaymentIntent(amount, currency)`, `confirmPayment(paymentIntentId)`, `handleWebhook(event)`.

---

## 6. Conception de la base de données

### 6.1 Schéma relationnel (ER)

**Table `users`**

| Colonne | Type | Contraintes |
|---|---|---|
| id | UUID | PK |
| email | VARCHAR(255) | Unique, obligatoire |
| password_hash | TEXT | Obligatoire |
| first_name | VARCHAR(100) | Obligatoire |
| last_name | VARCHAR(100) | Obligatoire |
| phone | VARCHAR(20) | Facultatif |
| role | VARCHAR(20) | CUSTOMER, ADMIN |
| created_at | TIMESTAMP | Obligatoire |
| updated_at | TIMESTAMP | Obligatoire |

**Table `categories`**

| Colonne | Type | Contraintes |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(100) | Obligatoire |
| slug | VARCHAR(100) | Unique |
| order | INTEGER | Facultatif (ordre d'affichage) |

**Table `products`**

| Colonne | Type | Contraintes |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(150) | Obligatoire |
| slug | VARCHAR(150) | Unique |
| description | TEXT | Facultatif |
| price | NUMERIC(10,2) | Obligatoire |
| category_id | UUID | FK → categories.id |
| image_url | TEXT | Facultatif |
| is_available | BOOLEAN | Défaut true |
| created_at | TIMESTAMP | Obligatoire |
| updated_at | TIMESTAMP | Obligatoire |

**Table `orders`**

| Colonne | Type | Contraintes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| status | VARCHAR(30) | Obligatoire |
| reception_mode | VARCHAR(20) | PICKUP, DELIVERY |
| scheduled_date | DATE | Obligatoire |
| scheduled_time_slot | VARCHAR(50) | Obligatoire |
| delivery_address | TEXT | Obligatoire si livraison |
| total_amount | NUMERIC(10,2) | Obligatoire |
| payment_status | VARCHAR(30) | PENDING, PAID, FAILED, REFUNDED |
| created_at | TIMESTAMP | Obligatoire |
| updated_at | TIMESTAMP | Obligatoire |

**Table `order_items`**

| Colonne | Type | Contraintes |
|---|---|---|
| id | UUID | PK |
| order_id | UUID | FK → orders.id |
| product_id | UUID | FK → products.id |
| quantity | INTEGER | Obligatoire, > 0 |
| unit_price | NUMERIC(10,2) | Obligatoire |
| total_price | NUMERIC(10,2) | Obligatoire |

### 6.2 Diagramme entité-association

<img src="diagrams/er-diagram.png" alt="Schéma entité-association O2Passions" width="850"/>

### 6.3 Règles d'intégrité

- Un produit appartient à une et une seule catégorie.
- Une commande appartient à un et un seul utilisateur.
- Les lignes de commande (`order_items`) référencent une commande et un produit existants.
- Le prix et la quantité sont toujours positifs.
- La suppression d'un produit n'efface pas les lignes de commande historiques (pas de `ON DELETE CASCADE` sur `products` → `order_items`, ou utilisation de soft delete).

---

## 7. Diagrammes de séquence

### 7.1 Consultation des produits

<img src="diagrams/seq-consultation-produits.png" alt="Diagramme de séquence - Consultation des produits" width="850"/>

### 7.2 Création d'une commande avec paiement

<img src="diagrams/seq-creation-commande-paiement.png" alt="Diagramme de séquence - Création d'une commande avec paiement" width="850"/>

Si le paiement échoue ou si le webhook Stripe signale un échec, l'API met la commande à jour avec `payment_status = FAILED` et aucune confirmation n'est envoyée au client.

### 7.3 Mise à jour du statut d'une commande (back-office)

<img src="diagrams/seq-maj-statut-commande.png" alt="Diagramme de séquence - Mise à jour du statut d'une commande" width="850"/>

---

## 8. APIs externes et spécifications des APIs internes

### 8.1 APIs externes

| API | Utilisation | Justification |
|---|---|---|
| Stripe | Paiement par carte bancaire (CB). | Solution éprouvée, documentation complète, conformité PCI déléguée. |
| Google Maps (optionnel) | Affichage de la localisation et calcul d'itinéraire. | Améliore l'expérience client pour se rendre en boutique. |
| Service d'envoi d'e-mails (ex. SendGrid, Mailgun) | Envoi des confirmations de commande, réinitialisation de mot de passe. | Évite de gérer un serveur SMTP, meilleure délivrabilité. |

Dans le MVP, Stripe est indispensable. Google Maps et le service d'e-mails peuvent être intégrés progressivement.

### 8.2 Format général des réponses API

**Réponse réussie**

```json
{
  "data": {},
  "message": "Operation completed successfully"
}
```

**Réponse d'erreur**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": []
  }
}
```

Codes HTTP principaux : `200`, `201`, `400`, `401`, `403`, `404`, `409`, `500`.

### 8.3 Endpoints publics (client)

**Authentification**

| Méthode | URL | Entrée | Sortie |
|---|---|---|---|
| POST | `/api/auth/register` | `{ firstName, lastName, email, password, phone? }` | Utilisateur créé + token |
| POST | `/api/auth/login` | `{ email, password }` | Token + profil utilisateur |
| GET | `/api/auth/me` | Header `Authorization: Bearer <token>` | Profil utilisateur connecté |

**Produits et catégories**

| Méthode | URL | Entrée | Sortie |
|---|---|---|---|
| GET | `/api/categories` | — | Liste des catégories |
| GET | `/api/products` | Query params : `categoryId?`, `search?`, `available?` | Liste des produits |
| GET | `/api/products/:slug` | — | Détail d'un produit |

**Panier** (si géré côté serveur — peut aussi être géré côté client via `localStorage` / état React, sans endpoints dédiés)

| Méthode | URL |
|---|---|
| GET | `/api/cart` |
| POST | `/api/cart/items` |
| PATCH | `/api/cart/items/:itemId` |
| DELETE | `/api/cart/items/:itemId` |

**Commandes**

| Méthode | URL | Entrée | Sortie |
|---|---|---|---|
| POST | `/api/orders` | `{ items: [{ productId, quantity }], receptionMode, scheduledDate, scheduledTimeSlot, deliveryAddress? }` | `{ orderId, clientSecret }` pour le paiement |
| GET | `/api/orders` | — | Liste des commandes de l'utilisateur connecté |
| GET | `/api/orders/:id` | — | Détail d'une commande |
| POST | `/api/orders/:id/confirm-payment` | `{ paymentIntentId }` | Confirmation de paiement |

### 8.4 Endpoints administrateur (back-office)

Tous protégés et réservés aux utilisateurs avec `role = ADMIN`.

| Méthode | URL | Entrée / Query | Sortie |
|---|---|---|---|
| GET | `/api/admin/products` | — | Liste des produits |
| POST | `/api/admin/products` | Données produit | Produit créé |
| GET | `/api/admin/products/:id` | — | Détail produit |
| PATCH | `/api/admin/products/:id` | Champs à modifier | Produit modifié |
| DELETE | `/api/admin/products/:id` | — | Suppression (ou soft delete) |
| GET | `/api/admin/orders` | `status?`, `receptionMode?`, `dateFrom?`, `dateTo?` | Liste des commandes |
| GET | `/api/admin/orders/:id` | — | Détail d'une commande |
| PATCH | `/api/admin/orders/:id` | `{ status?, paymentStatus? }` | Commande modifiée |
| POST | `/api/admin/orders/:id/cancel` | `{ reason }` | Confirmation d'annulation |

---

## 9. Stratégie SCM et QA

### 9.1 SCM (Source Control Management)

**Outil :** Git + GitHub.

**Stratégie de branches :**

```text
main
`-- develop
    |-- feature/auth
    |-- feature/products
    |-- feature/orders
    |-- feature/admin
    `-- fix/payment-webhook
```

| Branche | Utilisation |
|---|---|
| main | Version stable en production. |
| develop | Intégration des fonctionnalités validées. |
| feature/* | Développement d'une fonctionnalité isolée. |
| fix/* | Corrections de bugs. |
| release/* | Préparation d'une version (optionnel). |

**Règles de contribution :**

- Pas de commit direct sur `main` ni `develop`.
- Chaque fonctionnalité sur une branche `feature/*`.
- Pull Request obligatoire avec :
  - Description claire.
  - Tests associés.
  - Au moins une revue de code.
- CI obligatoire : lint, type-check, tests unitaires et d'intégration.
- Secrets et clés API dans des variables d'environnement, jamais dans Git.

### 9.2 QA (Quality Assurance)

**Types de tests :**

| Type | Objectif | Outils |
|---|---|---|
| Tests unitaires | Fonctions, services, utilitaires. | Jest |
| Tests de composants React | Rendu et interactions UI. | React Testing Library |
| Tests d'intégration API | Endpoints, validation, erreurs. | Jest + Supertest |
| Tests end-to-end | Parcours complets (commande, paiement test). | Playwright |
| Tests manuels | Validation ergonomique et cas limites. | Environnement staging |
| Analyse statique | Qualité du code, règles de style. | ESLint, Prettier, TypeScript |

**Couverture minimale cible (MVP) :**

- Services métier (auth, produits, commandes, paiement).
- Contrôleurs / routes principales.
- Composants critiques (panier, checkout, formulaire de commande).

**Pipeline CI/CD (GitHub Actions) :**

1. Déclenché à chaque push / PR.
2. Installation des dépendances.
3. Lint et vérification TypeScript.
4. Tests unitaires et d'intégration.
5. Build du front-end et de l'API.
6. Déploiement automatique en staging sur `develop`.
7. Déploiement en production depuis `main` après validation.

**Environnements :**

- **Dev** : local, avec base de données de test.
- **Staging** : miroir de la production, données fictives, utilisé pour les tests finaux.
- **Production** : accessible aux clients, avec sauvegardes et monitoring.

---

## 10. Justifications techniques

**Next.js (React + TypeScript)**
- Rendu serveur (SSR) et génération statique possibles, ce qui améliore le SEO et les performances.
- Écosystème React riche (composants, bibliothèques).
- TypeScript permet de détecter des erreurs de typage tôt et d'améliorer la maintenabilité.

**Node.js avec NestJS ou Express**
- Même langage (TypeScript/JavaScript) côté front et back.
- NestJS propose une architecture modulaire (controllers, services, modules) proche de celle d'Angular ou Spring, utile pour un projet qui peut grandir.
- Express reste une alternative plus légère si l'équipe le préfère.

**PostgreSQL**
- Base de données relationnelle mature, adaptée aux données structurées (utilisateurs, produits, commandes).
- Support des contraintes, transactions et requêtes complexes.
- Bonnes performances et évolutivité pour un commerce local.

**Stripe pour le paiement**
- Conforme aux normes de sécurité (PCI DSS).
- Intégration documentée et SDKs disponibles.
- Gestion des webhooks pour synchroniser les statuts de paiement.

**Architecture en couches**
- Séparation claire entre :
  - Contrôleurs (routes HTTP).
  - Services (logique métier).
  - Répositories / modèles (accès aux données).
- Facilite les tests, la maintenance et l'évolution (ajout de nouvelles fonctionnalités, refactorings).

**CI/CD et tests automatisés**
- Détection rapide des régressions.
- Déploiements plus sûrs et reproductibles.
- Réduction du risque d'erreurs humaines lors des mises en production.

---

## 11. Sécurité et évolutions futures

### Sécurité

- HTTPS obligatoire.
- Hachage des mots de passe (ex. bcrypt, argon2).
- Validation stricte des entrées (schema validation).
- Protection des routes admin par rôle.
- Limitation des tentatives de connexion (rate limiting).
- Requêtes paramétrées pour éviter les injections SQL.
- Gestion sécurisée des clés API et secrets (variables d'environnement).
- Journalisation des erreurs et des actions sensibles.

### Évolutions possibles

- Programme de fidélité (points, offres personnalisées).
- Gestion des stocks en temps réel.
- Pré-commandes pour événements (gâteaux personnalisés).
- Intégration avec un système de caisse en magasin.
- Multi-boutiques avec gestion par point de vente.
- Application mobile ou PWA pour une expérience mobile améliorée.

---
