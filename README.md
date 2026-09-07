================================================================================
                           DOCUMENTATION TECHNIQUE
                        PROJET : SITE WEB O2 PASSIONS
================================================================================

Site web de consultation et de commande en ligne pour la boulangerie
"O2 Passions".

Cette documentation reprend le contenu fourni (presentation du projet et
User Stories) et le complete avec les elements techniques necessaires a la
realisation du MVP : maquettes, architecture, modele de donnees, diagrammes
de sequence, specifications API, strategies SCM et QA. Les choix
technologiques proposes sont des exemples adaptables selon les contraintes
reelles du projet.


================================================================================
1. PRESENTATION DU PROJET
================================================================================

--------------------------------------------------------------------------------
1.1 Objectif
--------------------------------------------------------------------------------
L'idee principale retenue pour ce projet consiste en la creation d'un site
web de consultation et de commande en ligne pour la boulangerie
"O2 Passions".

L'objectif du MVP est de proposer une version simple, fonctionnelle et
evolutive avec les fonctionnalites essentielles :

  - Creation de compte client
  - Connexion a l'aide de l'identifiant et du mot de passe du compte client
  - Consultation du catalogue des produits proposes par la boulangerie
    "O2 Passions"
  - Passage de commande en ligne avec un systeme de panier

Notes :
  - Pour la partie consultation, une presentation visuelle des differents
    produits (viennoiseries, pains, patisseries et ventes additionnelles)
    sera organisee par onglets.
  - Pour la partie commande, chaque utilisateur dispose d'un compte lui
    permettant de passer commande a partir du catalogue de produits.

--------------------------------------------------------------------------------
1.2 Types d'utilisateurs
--------------------------------------------------------------------------------
  Utilisateur     : Cree un compte, consulte le catalogue des produits,
                    passe une commande, modifie une commande, supprime une
                    commande.
  Administrateur  : Consulte l'etat general du systeme et peut gerer les
                    utilisateurs si cette fonctionnalite est activee.

--------------------------------------------------------------------------------
1.3 Perimetre du MVP
--------------------------------------------------------------------------------
Inclus dans le MVP :
  - Authentification par adresse e-mail et mot de passe
  - Gestion des utilisateurs
  - Apercu du catalogue des produits
  - Gestion des commandes via un panier

Exclu du MVP :
  - Paiement en ligne (extension future)
  - Application mobile (extension future)
  - Notifications push (extension future)


================================================================================
2. USER STORIES ET PRIORISATION
================================================================================

--------------------------------------------------------------------------------
2.1 MUST HAVE - Indispensable
--------------------------------------------------------------------------------

[US-01] Creation de compte
  En tant qu'utilisateur, je veux creer un compte, afin d'acceder a
  l'application.
  Criteres d'acceptation :
    - L'utilisateur saisit son prenom, son nom, son adresse e-mail et son
      mot de passe
    - L'adresse e-mail doit etre validee et unique
    - Le mot de passe doit respecter les regles de securite definies
    - Un compte est cree lorsque les donnees sont valides
    - Une erreur explicite est affichee en cas de donnees invalides

[US-02] Connexion
  En tant qu'utilisateur, je veux me connecter, afin d'acceder a mon
  espace client.
  Criteres d'acceptation :
    - L'utilisateur saisit son adresse e-mail et son mot de passe
    - Les identifiants sont verifies par le back-end
    - Un jeton d'authentification est retourne en cas de succes
    - L'utilisateur est redirige vers son espace client
    - Un message d'erreur apparait si les identifiants sont incorrects

[US-03] Creer une commande
  En tant qu'utilisateur connecte, je veux creer une commande, afin
  d'organiser mon travail.
  Criteres d'acceptation :
    - Le produit est disponible dans le catalogue des produits du magasin
    - Le nombre de personnes doit etre indique
    - La date ainsi que l'heure de la commande doivent etre indiquees
    - La commande doit etre effectuee 48h avant la recuperation de
      celle-ci

[US-04] Consulter mon panier
  En tant qu'utilisateur connecte, je veux consulter mon panier, afin de
  connaitre les commandes realisees.
  Criteres d'acceptation :
    - Un panier est cree si le nombre de commandes est superieur ou egal
      a 1
    - Le panier est consultable seulement par l'utilisateur l'ayant cree

[US-05] Modifier une commande
  En tant qu'utilisateur connecte, je veux modifier une commande, afin de
  modifier les commandes qui ne me plaisent plus.
  Criteres d'acceptation :
    - Avoir cette commande dans son panier
    - Le faire 48h avant la reception de la commande

[US-06] Supprimer une commande
  En tant qu'utilisateur connecte, je veux supprimer une commande, afin
  de retirer les commandes que je ne souhaite plus.
  Criteres d'acceptation :
    - Avoir cette commande dans son panier
    - Le faire 48h avant la reception de la commande

--------------------------------------------------------------------------------
2.2 SHOULD HAVE - Important
--------------------------------------------------------------------------------

[US-07] Rechercher une commande
  En tant qu'utilisateur connecte, je veux rechercher une commande par son
  titre, afin de la retrouver rapidement.
  Criteres d'acceptation :
    - La recherche s'effectue parmi les commandes du panier de
      l'utilisateur connecte
    - Le resultat s'affiche des la saisie des premieres lettres

[US-08] Consulter les commandes deja passees
  En tant qu'utilisateur connecte, je veux voir les commandes precedemment
  effectuees.
  Criteres d'acceptation :
    - Seules les commandes de l'utilisateur connecte sont affichees
    - Les commandes sont triees par date, de la plus recente a la plus
      ancienne

--------------------------------------------------------------------------------
2.3 COULD HAVE - Souhaitable
--------------------------------------------------------------------------------

[US-09] Ajouter une date limite
  En tant qu'utilisateur connecte, je veux ajouter une date limite a une
  commande, afin de mieux planifier celle-ci.
  Criteres d'acceptation :
    - La date limite doit respecter le delai de 48h avant la reception
      de la commande

[US-10] Paiement en ligne
  En tant qu'utilisateur connecte, je veux avoir acces a un paiement en
  ligne, afin de pouvoir payer a l'avance.

--------------------------------------------------------------------------------
2.4 WON'T HAVE - Hors perimetre du MVP
--------------------------------------------------------------------------------

[US-11] Application mobile
  En tant qu'utilisateur, je veux avoir acces a une application mobile,
  afin que le passage de commande puisse etre effectue depuis un
  smartphone.
  --> Fonctionnalite volontairement exclue de la premiere version.

[US-12] Notifications en temps reel
  En tant qu'utilisateur, je veux recevoir des notifications en temps
  reel, afin d'etre informe immediatement des changements.
  --> Fonctionnalite pouvant etre etudiee dans une version ulterieure.


================================================================================
3. MAQUETTES DES ECRANS
================================================================================

Le MVP possede une interface web. Des maquettes basse fidelite sont donc
prevues pour les ecrans principaux.

--------------------------------------------------------------------------------
3.1 Ecran de connexion
--------------------------------------------------------------------------------
    +--------------------------------------+
    |             O2 PASSIONS               |
    |                                       |
    |  Adresse e-mail                       |
    |  [____________________________]       |
    |                                       |
    |  Mot de passe                         |
    |  [____________________________]       |
    |                                       |
    |          [ Se connecter ]             |
    |                                       |
    |  Creer un compte                      |
    +--------------------------------------+

--------------------------------------------------------------------------------
3.2 Catalogue des produits
--------------------------------------------------------------------------------
    +------------------------------------------------+
    | O2 PASSIONS         Bonjour, Alice   Deconnexion|
    +------------------------------------------------+
    | [Viennoiseries] [Pains] [Patisseries] [Ventes   |
    |                                    additionnelles]|
    |                                                  |
    |  +-----------+  +-----------+  +-----------+     |
    |  | Croissant |  | Pain au   |  | Chausson  |     |
    |  | 1,20 EUR  |  | chocolat  |  | aux pommes|     |
    |  |[Ajouter]  |  | 1,30 EUR  |  | 1,50 EUR  |     |
    |  |           |  |[Ajouter]  |  |[Ajouter]  |     |
    |  +-----------+  +-----------+  +-----------+     |
    |                                                  |
    |                          [ Voir mon panier (3) ] |
    +------------------------------------------------+

--------------------------------------------------------------------------------
3.3 Panier / formulaire de commande
--------------------------------------------------------------------------------
    +--------------------------------------+
    | Mon panier                            |
    |                                       |
    | Produit           Nb pers.  Retrait   |
    | Croissant x4        4      12/09 08h  | [Modifier][Suppr.]
    | Tarte aux fraises   6      13/09 10h  | [Modifier][Suppr.]
    |                                       |
    | Nouvelle ligne de commande :          |
    | Produit *                             |
    | [ Selectionner un produit      v ]    |
    | Nombre de personnes *                 |
    | [____]                                |
    | Date de retrait *      Heure *        |
    | [__/__/____]            [__:__]       |
    |                                       |
    | [ Annuler ]        [ Valider commande]|
    +--------------------------------------+
    Note : la date/heure de retrait doit se situer au moins 48h apres la
    validation de la commande ; un message d'erreur est affiche sinon.

--------------------------------------------------------------------------------
3.4 Espace client - historique des commandes
--------------------------------------------------------------------------------
    +------------------------------------------------+
    | O2 PASSIONS         Bonjour, Alice   Deconnexion|
    +------------------------------------------------+
    | Mes commandes                                   |
    |                                                  |
    | [Rechercher_____________]                        |
    |                                                  |
    | Produit          Retrait      Statut             |
    | Croissant x4     12/09 08h    A venir            |
    | Baguette x2      05/09 09h    Recuperee          |
    +------------------------------------------------+

--------------------------------------------------------------------------------
3.5 Composants front-end
--------------------------------------------------------------------------------
  - App             : composant racine de l'application
  - Navbar          : navigation et deconnexion
  - LoginForm       : formulaire de connexion
  - RegisterForm    : formulaire d'inscription
  - CatalogPage     : affichage du catalogue par onglets de categorie
  - CategoryTabs    : onglets Viennoiseries / Pains / Patisseries /
                      Ventes additionnelles
  - ProductCard     : representation individuelle d'un produit
  - CartPage        : affichage du panier de l'utilisateur
  - CartItem        : ligne de commande dans le panier
  - OrderForm       : creation ou modification d'une ligne de commande
  - OrderHistory    : historique des commandes passees
  - Toast           : affichage des messages de succes ou d'erreur
  - ProtectedRoute  : protection des pages necessitant une authentification

Interactions principales :
  1. LoginForm envoie les identifiants au service d'authentification.
  2. CatalogPage demande la liste des produits au back-end.
  3. ProductCard ajoute un produit au panier via OrderForm.
  4. OrderForm valide la regle des 48h avant d'envoyer la commande.
  5. CartPage actualise l'affichage apres une operation reussie.


================================================================================
4. ARCHITECTURE DU SYSTEME
================================================================================

--------------------------------------------------------------------------------
4.1 Technologies retenues (proposition)
--------------------------------------------------------------------------------
  Front-end         : React avec TypeScript
                        -> Interface utilisateur interactive (catalogue,
                           panier, espace client)
  Back-end          : Node.js avec Express
                        -> API REST et logique metier (regle des 48h,
                           gestion du panier)
  Base de donnees   : PostgreSQL
                        -> Stockage structure des utilisateurs, produits
                           et commandes
  Authentification  : JWT avec mots de passe haches
                        -> Identification securisee des clients
  Tests front-end   : Jest et React Testing Library
  Tests API         : Jest / Supertest et Postman
  Deploiement       : Docker et GitHub Actions

--------------------------------------------------------------------------------
4.2 Diagramme d'architecture
--------------------------------------------------------------------------------
Vue simplifiee :

    Client (navigateur) --(HTTPS)--> Front-end React
    Front-end React --(REST/JSON)--> API Node.js / Express
    API --> Service d'authentification
    API --> PostgreSQL (base de donnees)
    API --> Service de journalisation
    API --(optionnel, hors MVP)--> Service de paiement en ligne

Diagramme (syntaxe Mermaid, a coller dans un editeur compatible comme
mermaid.live, Notion, GitHub ou un artefact Markdown) :

    flowchart LR
        U[Client] -->|HTTPS| FE[Front-end React]
        FE -->|REST/JSON| API[API Node.js / Express]
        API --> AUTH[Service d'authentification]
        API --> DB[(PostgreSQL)]
        API --> LOG[Service de journalisation]
        API -.->|hors MVP| PAY[Service de paiement en ligne]
        API --> MAIL[Service d'e-mail]

--------------------------------------------------------------------------------
4.3 Flux de donnees
--------------------------------------------------------------------------------
  1. L'utilisateur consulte le catalogue via l'application React.
  2. Le front-end envoie une requete HTTPS a l'API REST.
  3. Le middleware verifie le jeton JWT pour les actions necessitant une
     authentification (panier, commandes, espace client).
  4. Le controleur appelle le service metier approprie.
  5. Le service metier verifie les regles de gestion (produit disponible,
     delai de 48h) puis lit ou modifie les donnees PostgreSQL.
  6. L'API retourne une reponse JSON.
  7. Le front-end met a jour l'interface (catalogue, panier ou historique).

Les communications entre le navigateur et le serveur utilisent HTTPS.
Les echanges applicatifs utilisent JSON.


================================================================================
5. COMPOSANTS ET CLASSES BACK-END
================================================================================

--------------------------------------------------------------------------------
5.1 User
--------------------------------------------------------------------------------
Responsabilite : representer un client ou un administrateur du systeme.

Attributs :
  - id: UUID
  - firstName: string
  - lastName: string
  - email: string
  - passwordHash: string
  - role: UserRole (CLIENT | ADMIN)
  - createdAt: Date
  - updatedAt: Date

Methodes :
  - createUser()
  - findByEmail(email)
  - verifyPassword(password)
  - generateToken()

--------------------------------------------------------------------------------
5.2 Product
--------------------------------------------------------------------------------
Responsabilite : representer un produit du catalogue de la boulangerie.

Attributs :
  - id: UUID
  - name: string
  - description: string | null
  - price: number
  - category: ProductCategory (VIENNOISERIE | PAIN | PATISSERIE |
    VENTE_ADDITIONNELLE)
  - available: boolean
  - imageUrl: string | null
  - createdAt: Date
  - updatedAt: Date

Methodes :
  - findAll(filters)
  - findById(id)
  - findByCategory(category)

--------------------------------------------------------------------------------
5.3 Cart (Panier)
--------------------------------------------------------------------------------
Responsabilite : regrouper les lignes de commande en cours d'un
utilisateur.

Attributs :
  - id: UUID
  - userId: UUID
  - createdAt: Date
  - updatedAt: Date

Methodes :
  - findOrCreateForUser(userId)
  - getItems(cartId)

--------------------------------------------------------------------------------
5.4 OrderItem (Ligne de commande)
--------------------------------------------------------------------------------
Responsabilite : representer une commande d'un produit passee par un
utilisateur.

Attributs :
  - id: UUID
  - cartId: UUID
  - productId: UUID
  - numberOfPeople: number
  - pickupDate: Date
  - pickupTime: string
  - status: OrderStatus (PENDING | READY | COLLECTED | CANCELLED)
  - createdAt: Date
  - updatedAt: Date

Methodes :
  - create()
  - findById()
  - findByCartId()
  - findByUserId()
  - update()
  - delete()

--------------------------------------------------------------------------------
5.5 AuthController
--------------------------------------------------------------------------------
Responsabilite : gerer l'inscription et la connexion.

Methodes :
  - register(req, res)
  - login(req, res)
  - logout(req, res)  [si une strategie de revocation est utilisee]

--------------------------------------------------------------------------------
5.6 ProductController
--------------------------------------------------------------------------------
Responsabilite : recevoir les requetes HTTP relatives au catalogue.

Methodes :
  - listProducts(req, res)
  - getProduct(req, res)

--------------------------------------------------------------------------------
5.7 OrderController
--------------------------------------------------------------------------------
Responsabilite : recevoir les requetes HTTP relatives au panier et aux
commandes.

Methodes :
  - getCart(req, res)
  - createOrderItem(req, res)
  - updateOrderItem(req, res)
  - deleteOrderItem(req, res)
  - listOrderHistory(req, res)

--------------------------------------------------------------------------------
5.8 OrderService
--------------------------------------------------------------------------------
Responsabilite : contenir les regles metier des commandes.

Methodes :
  - validateOrderInput(data)
  - ensureProductAvailable(productId)
  - ensure48hDelay(pickupDate, pickupTime)
  - createOrderItem(userId, data)
  - getUserCart(userId)
  - updateOrderItem(userId, orderItemId, data)
  - deleteOrderItem(userId, orderItemId)
  - getOrderHistory(userId)

--------------------------------------------------------------------------------
5.9 AuthMiddleware
--------------------------------------------------------------------------------
Responsabilite : verifier le jeton JWT transmis dans la requete.

Methode :
  - authenticate(req, res, next)

--------------------------------------------------------------------------------
5.10 Organisation du back-end
--------------------------------------------------------------------------------
    src/
    |-- controllers/
    |   |-- auth.controller.ts
    |   |-- product.controller.ts
    |   `-- order.controller.ts
    |-- services/
    |   |-- auth.service.ts
    |   |-- product.service.ts
    |   `-- order.service.ts
    |-- models/
    |   |-- user.model.ts
    |   |-- product.model.ts
    |   |-- cart.model.ts
    |   `-- orderItem.model.ts
    |-- routes/
    |   |-- auth.routes.ts
    |   |-- product.routes.ts
    |   `-- order.routes.ts
    |-- middleware/
    |   |-- auth.middleware.ts
    |   `-- error.middleware.ts
    |-- validators/
    `-- app.ts

Cette separation distingue les routes HTTP, les controleurs, la logique
metier et l'acces aux donnees.


================================================================================
6. CONCEPTION DE LA BASE DE DONNEES
================================================================================

--------------------------------------------------------------------------------
6.1 Table "users"
--------------------------------------------------------------------------------
  Colonne          Type              Contraintes
  ---------------  ----------------  --------------------
  id               UUID              Cle primaire
  first_name       VARCHAR(100)      Obligatoire
  last_name        VARCHAR(100)      Obligatoire
  email            VARCHAR(255)      Obligatoire, unique
  password_hash    TEXT              Obligatoire
  role             VARCHAR(20)       Obligatoire, defaut 'CLIENT'
  created_at       TIMESTAMP         Obligatoire
  updated_at       TIMESTAMP         Obligatoire

--------------------------------------------------------------------------------
6.2 Table "products"
--------------------------------------------------------------------------------
  Colonne          Type              Contraintes
  ---------------  ----------------  --------------------
  id               UUID              Cle primaire
  name             VARCHAR(150)      Obligatoire
  description      TEXT              Facultatif
  price            NUMERIC(6,2)      Obligatoire
  category         VARCHAR(30)       Obligatoire
  available        BOOLEAN           Obligatoire, defaut true
  image_url        TEXT              Facultatif
  created_at       TIMESTAMP         Obligatoire
  updated_at       TIMESTAMP         Obligatoire

--------------------------------------------------------------------------------
6.3 Table "carts"
--------------------------------------------------------------------------------
  Colonne          Type              Contraintes
  ---------------  ----------------  ---------------------------
  id               UUID              Cle primaire
  user_id          UUID              Cle etrangere vers users.id,
                                     unique (un panier actif par
                                     utilisateur)
  created_at       TIMESTAMP         Obligatoire
  updated_at       TIMESTAMP         Obligatoire

--------------------------------------------------------------------------------
6.4 Table "order_items"
--------------------------------------------------------------------------------
  Colonne           Type              Contraintes
  ----------------  ----------------  -----------------------------
  id                UUID              Cle primaire
  cart_id           UUID              Cle etrangere vers carts.id
  product_id        UUID              Cle etrangere vers products.id
  number_of_people  INTEGER           Obligatoire, > 0
  pickup_date       DATE              Obligatoire
  pickup_time       TIME              Obligatoire
  status            VARCHAR(20)       Obligatoire, defaut 'PENDING'
  created_at        TIMESTAMP         Obligatoire
  updated_at        TIMESTAMP         Obligatoire

--------------------------------------------------------------------------------
6.5 Relations
--------------------------------------------------------------------------------
Vue simplifiee :

  USERS (1) ------- owns -------< (0..1) CARTS
  CARTS (1) ------- contains ----< (0..N) ORDER_ITEMS
  PRODUCTS (1) ---- referenced by < (0..N) ORDER_ITEMS

Un utilisateur possede au plus un panier actif. Un panier contient zero,
une ou plusieurs lignes de commande. Chaque ligne de commande fait
reference a un seul produit du catalogue.

Diagramme entite-relation (syntaxe Mermaid) :

    erDiagram
        USERS ||--o| CARTS : owns
        CARTS ||--o{ ORDER_ITEMS : contains
        PRODUCTS ||--o{ ORDER_ITEMS : referenced_by

        USERS {
            uuid id PK
            varchar first_name
            varchar last_name
            varchar email UK
            text password_hash
            varchar role
            timestamp created_at
            timestamp updated_at
        }

        CARTS {
            uuid id PK
            uuid user_id FK
            timestamp created_at
            timestamp updated_at
        }

        PRODUCTS {
            uuid id PK
            varchar name
            text description
            numeric price
            varchar category
            boolean available
            text image_url
            timestamp created_at
            timestamp updated_at
        }

        ORDER_ITEMS {
            uuid id PK
            uuid cart_id FK
            uuid product_id FK
            integer number_of_people
            date pickup_date
            time pickup_time
            varchar status
            timestamp created_at
            timestamp updated_at
        }

--------------------------------------------------------------------------------
6.6 Valeurs autorisees
--------------------------------------------------------------------------------
  role (users)      : CLIENT | ADMIN
  category (products): VIENNOISERIE | PAIN | PATISSERIE |
                        VENTE_ADDITIONNELLE
  status (order_items): PENDING | READY | COLLECTED | CANCELLED

--------------------------------------------------------------------------------
6.7 Regles d'integrite
--------------------------------------------------------------------------------
  - L'e-mail d'un utilisateur doit etre unique.
  - Une ligne de commande ne peut reference qu'un produit disponible
    (available = true) au moment de la creation.
  - La date/heure de retrait (pickup_date + pickup_time) doit etre au
    moins 48h posterieure a la date de creation de la ligne de commande.
  - Un utilisateur ne peut consulter ou modifier que son propre panier et
    ses propres commandes.
  - La suppression d'un utilisateur entraine la suppression de son
    panier et de ses lignes de commande, selon la regle
    ON DELETE CASCADE.
  - Les champs category et status doivent appartenir aux valeurs
    autorisees.


================================================================================
7. DIAGRAMMES DE SEQUENCE (description textuelle)
================================================================================

--------------------------------------------------------------------------------
7.1 Connexion d'un utilisateur
--------------------------------------------------------------------------------
  1. Utilisateur   -> Front-end   : saisit e-mail et mot de passe
  2. Front-end     -> API         : POST /api/auth/login
  3. API           -> AuthService : verifier les identifiants
  4. AuthService   -> PostgreSQL  : rechercher l'utilisateur par e-mail
  5. PostgreSQL    -> AuthService : donnees utilisateur
  6. AuthService   -> AuthService : comparer le mot de passe
  7. AuthService   -> API         : generer un JWT
  8. API           -> Front-end   : 200 + token
  9. Front-end     -> Utilisateur : afficher l'espace client

Diagramme (syntaxe Mermaid) :

    sequenceDiagram
        actor User as Utilisateur
        participant FE as Front-end React
        participant API as API Express
        participant Auth as AuthService
        participant DB as PostgreSQL

        User->>FE: Saisit e-mail et mot de passe
        FE->>API: POST /api/auth/login
        API->>Auth: Verifier les identifiants
        Auth->>DB: Rechercher l'utilisateur par e-mail
        DB-->>Auth: Donnees utilisateur
        Auth->>Auth: Comparer le mot de passe
        Auth-->>API: Generer un JWT
        API-->>FE: 200 + token
        FE-->>User: Afficher l'espace client

--------------------------------------------------------------------------------
7.2 Consultation du catalogue
--------------------------------------------------------------------------------
  1. Utilisateur   -> Front-end        : ouvre la page catalogue
  2. Front-end     -> API              : GET /api/products?category=...
  3. API           -> ProductService   : findByCategory(category)
  4. ProductService-> PostgreSQL       : SELECT products WHERE
                                         category = ... AND available =
                                         true
  5. PostgreSQL    -> ProductService   : liste des produits
  6. ProductService-> API              : produits filtres
  7. API           -> Front-end        : 200 + JSON
  8. Front-end     -> Utilisateur      : afficher les produits par onglet

Diagramme (syntaxe Mermaid) :

    sequenceDiagram
        actor User as Utilisateur
        participant FE as Front-end React
        participant API as API Express
        participant Service as ProductService
        participant DB as PostgreSQL

        User->>FE: Ouvre la page catalogue / choisit un onglet
        FE->>API: GET /api/products?category=...
        API->>Service: findByCategory(category)
        Service->>DB: SELECT products WHERE category = ... AND available = true
        DB-->>Service: Liste des produits
        Service-->>API: Produits filtres
        API-->>FE: 200 + JSON
        FE-->>User: Afficher les produits de la categorie

--------------------------------------------------------------------------------
7.3 Creation d'une commande (ajout au panier)
--------------------------------------------------------------------------------
  1. Utilisateur   -> Front-end     : remplit le formulaire de commande
                                       (produit, nb personnes, date, heure)
  2. Front-end     -> API           : POST /api/orders avec JSON et JWT
  3. API           -> AuthMiddleware: verifier le JWT
  4. AuthMiddleware-> API           : userId authentifie
  5. API           -> OrderService  : valider le produit et le delai de
                                       48h
  6. OrderService  -> PostgreSQL    : verifier la disponibilite du
                                       produit
  7. OrderService  -> PostgreSQL    : creer ou recuperer le panier de
                                       l'utilisateur
  8. OrderService  -> PostgreSQL    : INSERT INTO order_items
  9. PostgreSQL    -> OrderService  : ligne de commande creee
 10. OrderService  -> API           : objet commande
 11. API           -> Front-end     : 201 + JSON
 12. Front-end     -> Utilisateur   : afficher un message de succes et
                                       mettre a jour le panier

Si le delai de 48h n'est pas respecte ou si le produit n'est pas
disponible, l'API retourne une erreur 400 et aucune ecriture n'est
effectuee.

Diagramme (syntaxe Mermaid) :

    sequenceDiagram
        actor User as Utilisateur
        participant FE as Front-end React
        participant API as API Express
        participant MW as AuthMiddleware
        participant Service as OrderService
        participant DB as PostgreSQL

        User->>FE: Remplit le formulaire (produit, nb personnes, date, heure)
        FE->>API: POST /api/orders avec JSON et JWT
        API->>MW: Verifier le JWT
        MW-->>API: userId authentifie
        API->>Service: Valider produit disponible et delai de 48h
        Service->>DB: Verifier la disponibilite du produit
        Service->>DB: Creer ou recuperer le panier de l'utilisateur
        Service->>DB: INSERT INTO order_items
        DB-->>Service: Ligne de commande creee
        Service-->>API: Objet commande
        API-->>FE: 201 + JSON
        FE-->>User: Afficher un message de succes


================================================================================
8. APIs EXTERNES ET INTERNES
================================================================================

--------------------------------------------------------------------------------
8.1 APIs externes
--------------------------------------------------------------------------------
  API                                Utilisation                Justification
  ---------------------------------  -------------------------  --------------------------------
  Service d'e-mail (ex. SendGrid)    Confirmation de commande,   Evite de maintenir un serveur
                                     reinitialisation du mot     SMTP interne
                                     de passe
  Service de journalisation          Suivi des erreurs en        Facilite le diagnostic des
  (ex. Sentry)                       production                  incidents
  Service d'hebergement              Hebergement de l'API et     Permet un deploiement evolutif
  (ex. Render, AWS)                  de la base de donnees
  Service de paiement                Paiement en ligne           Hors perimetre du MVP (US-10),
  (ex. Stripe) - hors MVP            (extension future)          a integrer lors d'une version
                                                                  ulterieure

--------------------------------------------------------------------------------
8.2 Format general des reponses
--------------------------------------------------------------------------------
  Reponse reussie :
    {
      "data": {},
      "message": "Operation completed successfully"
    }

  Reponse d'erreur :
    {
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "La commande doit etre passee au moins 48h avant le
        retrait",
        "details": []
      }
    }

--------------------------------------------------------------------------------
8.3 Endpoints d'authentification
--------------------------------------------------------------------------------
  Methode  URL                    Entree                                Sortie
  -------  ---------------------  ------------------------------------  ------------------------
  POST     /api/auth/register     JSON: firstName, lastName, email,     Utilisateur cree + token
                                  password
  POST     /api/auth/login        JSON: email, password                 Token JWT + utilisateur
  GET      /api/auth/me           Header Authorization: Bearer          Utilisateur connecte

  Exemple - inscription :

    POST /api/auth/register
    Content-Type: application/json

    {
      "firstName": "Alice",
      "lastName": "Martin",
      "email": "alice@example.com",
      "password": "MotDePasseSecurise123!"
    }

  Reponse :

    {
      "data": {
        "user": {
          "id": "8f7c0e1e-1b8d-4bd1-8f82-123456789abc",
          "firstName": "Alice",
          "lastName": "Martin",
          "email": "alice@example.com"
        },
        "token": "jwt-token"
      },
      "message": "User registered successfully"
    }

--------------------------------------------------------------------------------
8.4 Endpoints du catalogue de produits
--------------------------------------------------------------------------------
  Methode  URL                  Entree                              Sortie
  -------  -------------------  ----------------------------------  ---------------------
  GET      /api/products        Query params facultatifs: category  Liste des produits
  GET      /api/products/:id    Identifiant dans l'URL               Produit detaille

--------------------------------------------------------------------------------
8.5 Endpoints du panier et des commandes
--------------------------------------------------------------------------------
  Methode  URL                    Entree                                 Sortie
  -------  ---------------------  -------------------------------------  ---------------------
  GET      /api/cart              Header Authorization: Bearer            Panier de l'utilisateur
  POST     /api/orders            JSON: productId, numberOfPeople,        Ligne de commande creee
                                  pickupDate, pickupTime
  PATCH    /api/orders/:id        JSON avec les champs a modifier         Ligne de commande modifiee
  DELETE   /api/orders/:id        Identifiant dans l'URL                  Confirmation de suppression
  GET      /api/orders/history    Query params facultatifs: search        Historique des commandes

  Exemple - creation d'une commande :

    POST /api/orders
    Authorization: Bearer jwt-token
    Content-Type: application/json

    {
      "productId": "c1a2b3c4-1111-4c75-8e2e-123456789abc",
      "numberOfPeople": 4,
      "pickupDate": "2026-09-15",
      "pickupTime": "08:00"
    }

  Reponse :

    {
      "data": {
        "id": "a3c5f5a3-0a19-4c75-8e2e-123456789abc",
        "productId": "c1a2b3c4-1111-4c75-8e2e-123456789abc",
        "numberOfPeople": 4,
        "pickupDate": "2026-09-15",
        "pickupTime": "08:00",
        "status": "PENDING"
      },
      "message": "Order created successfully"
    }

--------------------------------------------------------------------------------
8.6 Codes HTTP
--------------------------------------------------------------------------------
  200  Requete reussie
  201  Ressource creee
  400  Donnees invalides ou delai de 48h non respecte
  401  Authentification necessaire ou invalide
  403  Acces interdit
  404  Ressource inexistante
  409  Conflit, par exemple e-mail deja utilise
  500  Erreur interne du serveur


================================================================================
9. STRATEGIE SCM (GESTION DE VERSION)
================================================================================

--------------------------------------------------------------------------------
9.1 Outil
--------------------------------------------------------------------------------
Le projet utilise Git pour le controle de version et GitHub pour
l'hebergement du code, les Pull Requests et les pipelines CI/CD.

--------------------------------------------------------------------------------
9.2 Strategie de branches
--------------------------------------------------------------------------------
    main
    `-- development
        |-- feature/authentication
        |-- feature/catalog
        |-- feature/cart-and-orders
        `-- fix/validation-error

  Branche       Utilisation
  ------------  -------------------------------------------------
  main          Version stable et deployee en production
  development   Branche d'integration des fonctionnalites validees
  feature/*     Developpement d'une fonctionnalite isolee
  fix/*         Correction d'un defaut identifie
  release/*     Preparation d'une version, si necessaire

--------------------------------------------------------------------------------
9.3 Regles de contribution
--------------------------------------------------------------------------------
  - Un commit doit representer une modification coherente.
  - Les messages de commit suivent une convention (ex: "feat: add order
    creation").
  - Aucun developpement direct n'est effectue sur main.
  - Toute modification passe par une Pull Request.
  - Une Pull Request doit contenir une description et les tests associes.
  - Au moins une revue de code est requise avant fusion.
  - Le pipeline CI doit etre entierement valide.
  - Les secrets ne doivent jamais etre stockes dans Git.

--------------------------------------------------------------------------------
9.4 Cycle de developpement type
--------------------------------------------------------------------------------
   1. Creer une branche a partir de development.
   2. Implementer la fonctionnalite.
   3. Ajouter ou modifier les tests.
   4. Pousser la branche sur GitHub.
   5. Ouvrir une Pull Request.
   6. Effectuer la revue de code.
   7. Corriger les remarques eventuelles.
   8. Fusionner dans development.
   9. Deployer automatiquement en staging.
  10. Fusionner dans main apres validation.


================================================================================
10. STRATEGIE QA
================================================================================

--------------------------------------------------------------------------------
10.1 Niveaux de test
--------------------------------------------------------------------------------
  Type de test         Objectif                                    Outil
  --------------------  ------------------------------------------  --------------------------
  Tests unitaires       Verifier une fonction ou classe isolee      Jest
  Tests de composants   Verifier le comportement des composants     React Testing Library
                        React
  Tests d'integration   Verifier l'interaction API-base de donnees  Jest, Supertest
  Tests API             Verifier les endpoints et reponses HTTP     Postman ou Newman
  Tests end-to-end      Verifier les parcours utilisateurs complets Playwright
  Tests manuels         Valider l'ergonomie et les cas critiques    Environnement staging
  Analyse statique      Detecter les erreurs de style et de typage  ESLint, TypeScript

--------------------------------------------------------------------------------
10.2 Tests prioritaires
--------------------------------------------------------------------------------
Le MVP doit au minimum tester :
  - L'inscription avec des donnees valides.
  - Le rejet d'une adresse e-mail deja utilisee.
  - La connexion avec un mot de passe incorrect.
  - L'acces interdit a une route sans JWT.
  - L'affichage du catalogue filtre par categorie.
  - La creation d'une commande avec un delai de 48h respecte.
  - Le rejet d'une commande avec un delai inferieur a 48h.
  - Le rejet d'une commande sur un produit indisponible.
  - La modification et la suppression d'une commande dans le delai
    autorise.
  - L'impossibilite de consulter le panier d'un autre utilisateur.

--------------------------------------------------------------------------------
10.3 Pipeline QA et deploiement
--------------------------------------------------------------------------------
  Push / Pull Request
        v
  Installation des dependances
        v
  Lint et verification TypeScript
        v
  Tests unitaires
        v
  Tests d'integration
        v
  Build
        v
  Deploiement staging
        v
  Tests end-to-end
        v
  Validation metier
        v
  Deploiement production

--------------------------------------------------------------------------------
10.4 Environnements
--------------------------------------------------------------------------------
  Developpement :
    - Utilise par les developpeurs.
    - Base de donnees locale ou de test.
    - Catalogue de produits fictif.

  Staging :
    - Version proche de la production.
    - Tests d'integration et end-to-end.
    - Validation par les responsables de la boulangerie.

  Production :
    - Accessible aux clients de la boulangerie.
    - Sauvegardes activees.
    - Journalisation et surveillance des erreurs.


================================================================================
11. JUSTIFICATIONS TECHNIQUES
================================================================================

  React et TypeScript
    React convient a une interface composee de plusieurs ecrans
    (catalogue par onglets, panier, espace client) et de composants
    reutilisables (fiche produit, ligne de commande). TypeScript permet
    de detecter certaines erreurs avant l'execution.

  Node.js et Express
    Node.js permet d'utiliser JavaScript ou TypeScript cote serveur et
    cote client. Express fournit une structure simple pour creer une API
    REST, gerer les routes et centraliser la regle metier des 48h dans
    un middleware ou un service dedie.

  PostgreSQL
    PostgreSQL est adapte aux donnees structurees du projet. Les
    relations entre utilisateurs, panier, commandes et produits sont
    clairement modelisees par des cles etrangeres et des contraintes
    d'integrite.

  JWT
    JWT permet a l'API d'identifier un client lors de requetes
    successives sans conserver necessairement une session serveur
    classique. Les mots de passe doivent etre haches et ne doivent
    jamais etre stockes en clair.

  Docker
    Docker garantit que l'application s'execute dans des environnements
    coherents entre les postes de developpement, la staging et la
    production.

  Tests automatises
    Les tests unitaires et d'integration detectent rapidement les
    regressions, en particulier sur la regle critique du delai de 48h.
    Les tests end-to-end verifient que les principaux parcours (creation
    de compte, consultation du catalogue, commande) fonctionnent comme
    prevu.

  Architecture en couches
    La separation entre controleurs, services, modeles et middleware
    facilite la maintenance, les tests et l'evolution future du systeme,
    notamment l'ajout futur du paiement en ligne (US-10).


================================================================================
12. SECURITE ET EVOLUTIVITE
================================================================================

--------------------------------------------------------------------------------
12.1 Mesures de securite
--------------------------------------------------------------------------------
  - Utilisation obligatoire de HTTPS.
  - Hachage des mots de passe avec un algorithme adapte.
  - Validation des donnees entrantes, notamment la coherence des
    dates/heures de retrait.
  - Protection des routes privees (panier, commandes, espace client) par
    JWT.
  - Verification de la propriete du panier et des commandes.
  - Limitation du nombre de requetes sur les endpoints sensibles.
  - Stockage des secrets dans des variables d'environnement.
  - Protection contre les injections SQL grace aux requetes parametrees.
  - Journalisation des erreurs sans exposer d'informations sensibles.

--------------------------------------------------------------------------------
12.2 Evolutions possibles
--------------------------------------------------------------------------------
  - Integration d'un moyen de paiement en ligne (US-10).
  - Ajout d'une application mobile (US-11).
  - Ajout de notifications en temps reel sur l'etat des commandes
    (US-12).
  - Pagination et recherche avancee dans le catalogue.
  - Index sur user_id, category et pickup_date.
  - Gestion des stocks et de la disponibilite en temps reel des produits.
  - Interface d'administration pour la gestion du catalogue et des
    commandes.


================================================================================
13. CONCLUSION DU LIVRABLE
================================================================================

Cette documentation presente une conception technique complete pour le
MVP du site web "O2 Passions". Elle comprend les User Stories priorisees,
les maquettes principales (catalogue, panier, espace client),
l'architecture, les composants logiciels, le schema de base de donnees,
les diagrammes de sequence, les specifications API ainsi que les
strategies SCM et QA.

Les elements a valider ou adapter avec la boulangerie sont notamment
l'organisation exacte du catalogue par categories, la gestion des
horaires de retrait, le choix final des technologies et le calendrier
d'integration du paiement en ligne (US-10).

================================================================================
                                FIN DU DOCUMENT
================================================================================