================================================================================
                           DOCUMENTATION TECHNIQUE
                        PROJET : Site Web Ô2 Passions
================================================================================

Cette documentation technique montre les différents point de la fabrication du Site Web “Ô2 Passions”.

================================================================================
1. PRESENTATION DU PROJET
================================================================================

--------------------------------------------------------------------------------
1.1 Objectif
--------------------------------------------------------------------------------
L’idée principale retenue de ce projet consiste à la création d’un site web de consultation et de commande en ligne pour la boulangerie “Ô2 Passions”.

L'objectif du MVP est de proposer une version simple, fonctionnelle et evolutive avec les fonctionnalités essentielles :

  - Création de compte client
  - Connexion à l'aide de l'identifiant et du mot de passe du compte client 
  - Consultation du catalogue des produits proposés par la boulangerie "Ô2 Passions"
  - Passage de commande en ligne avec un système de paniers

    Notes:
      - Pour la partie consultation il y aura une partie    visuelle sur les différents produits (viennoiseries, pains, pâtisseries et ventes additionnelles) à partir de différents onglets.
      - Pour la partie commande, il y aura un compte pour chaque utilisateur sur lequel ils pourront passer commande à partir du catalogue de produit.


--------------------------------------------------------------------------------
1.2 Types d'utilisateurs
--------------------------------------------------------------------------------
  - Utilisateur: Crée un compte, consulte le catalogue des produits, passe une commande, modifie une commande, la supprimme une commande
  - Administrateur: Consulte l'etat general du systeme et peut gerer les utilisateurs si cette fonctionnalite est activée.

--------------------------------------------------------------------------------
1.3 Périmètre du MVP
--------------------------------------------------------------------------------
Inclus dans le MVP :
  - Authentification par adresse e-mail et mot de passe
  - Gestion des utilisateurs
  - Aperçu du catalogue des produits
  - Gestion des commandes via un panier

Exclu du MVP :
  - Paiement en ligne
  - Application mobile (extension future)
  - Notifications push (extension future)


================================================================================
2. USER STORIES ET PRIORISATION
================================================================================

--------------------------------------------------------------------------------
2.1 MUST HAVE - Indispensable
--------------------------------------------------------------------------------

[US-01] Création de compte
  En tant qu'utilisateur, je veux creer un compte, afin d'accéder à l'application.
  Critères d'acceptation :
    - L'utilisateur saisit son prénom, son nom, son adresse e-mail et son mot de passe
    - L'adresse e-mail doit être validé et unique
    - Le mot de passe doit respecter les règles de sécurité definies
    - Un compte est créé lorsque les données sont valides
    - Une erreur explicite est affichée en cas de données invalides

[US-02] Connexion
  En tant qu'utilisateur, je veux me connecter, afin d'accéder à mon espace client.
  Critères d'acceptation :
    - L'utilisateur saisit son adresse e-mail et son mot de passe
    - Les identifiants sont verifiés par le back-end
    - Un jeton d'authentification est retourné en cas de succès
    - L'utilisateur est redirigé vers son espace client
    - Un message d'erreur apparait si les identifiants sont incorrects

[US-03] Creer une tache
  En tant qu'utilisateur connecte, je veux creer une tache, afin d'organiser
  mon travail.
  Criteres d'acceptation :
    - Le titre de la tache est obligatoire
    - La description est facultative
    - Le statut par defaut est TODO
    - La priorite par defaut est MEDIUM
    - La tache est associee a l'utilisateur connecte

[US-04] Consulter mes taches
  En tant qu'utilisateur connecte, je veux consulter mes taches, afin de
  connaitre les elements a realiser.
  Criteres d'acceptation :
    - Seules les taches de l'utilisateur connecte sont affichees
    - Les taches sont triees par date de creation
    - Le titre, le statut, la priorite et la date de creation sont visibles
    - Un message est affiche si aucune tache n'existe

[US-05] Modifier une tache
  En tant qu'utilisateur connecte, je veux modifier une tache, afin de
  maintenir ses informations a jour.
  Criteres d'acceptation :
    - L'utilisateur peut modifier le titre et la description
    - L'utilisateur peut modifier le statut et la priorite
    - Une tache appartenant a un autre utilisateur ne peut pas etre modifiee
    - Les modifications sont enregistrees en base de donnees

[US-06] Supprimer une tache
  En tant qu'utilisateur connecte, je veux supprimer une tache, afin de
  retirer les elements devenus inutiles.
  Criteres d'acceptation :
    - Une confirmation est demandee avant la suppression
    - La tache est supprimee uniquement si elle appartient a l'utilisateur
    - La tache ne s'affiche plus apres sa suppression

--------------------------------------------------------------------------------
2.2 SHOULD HAVE - Important
--------------------------------------------------------------------------------

[US-07] Filtrer les taches
  En tant qu'utilisateur connecte, je veux filtrer mes taches par statut ou
  priorite, afin de trouver rapidement une tache particuliere.

[US-08] Rechercher une tache
  En tant qu'utilisateur connecte, je veux rechercher une tache par son
  titre, afin de la retrouver rapidement.

[US-09] Consulter les statistiques
  En tant qu'utilisateur connecte, je veux voir le nombre de taches
  terminees et en cours, afin de suivre ma progression.

--------------------------------------------------------------------------------
2.3 COULD HAVE - Souhaitable
--------------------------------------------------------------------------------

[US-10] Ajouter une date limite
  En tant qu'utilisateur connecte, je veux ajouter une date limite a une
  tache, afin de mieux planifier mon travail.

[US-11] Categoriser une tache
  En tant qu'utilisateur connecte, je veux associer une categorie a une
  tache, afin de classer mon travail.

--------------------------------------------------------------------------------
2.4 WON'T HAVE - Hors perimetre du MVP
--------------------------------------------------------------------------------

[US-12] Collaboration
  En tant qu'utilisateur, je veux partager une tache avec d'autres
  utilisateurs, afin de travailler en equipe.
  --> Fonctionnalite volontairement exclue de la premiere version.

[US-13] Notifications en temps reel
  En tant qu'utilisateur, je veux recevoir des notifications en temps reel,
  afin d'etre informe immediatement des changements.
  --> Fonctionnalite pouvant etre etudiee dans une version ulterieure.


================================================================================
3. MAQUETTES DES ECRANS
================================================================================

Le MVP possede une interface web. Des maquettes basse fidelite sont donc
prevues pour les ecrans principaux.

--------------------------------------------------------------------------------
3.1 Ecran de connexion
--------------------------------------------------------------------------------
    +---------------------------------------+
    |              TASKFLOW                 |
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
    +---------------------------------------+

--------------------------------------------------------------------------------
3.2 Tableau de bord
--------------------------------------------------------------------------------
    +------------------------------------------------+
    | TASKFLOW          Bonjour, Alice   Deconnexion  |
    +------------------------------------------------+
    | Mes taches                                      |
    |                                                  |
    | [ + Nouvelle tache ]  [ Rechercher_________ ]    |
    |                                                  |
    | Filtre : [Toutes] [A faire] [En cours] [Terminees]
    |                                                  |
    | Titre                Priorite   Statut   Actions |
    | Acheter du pain       Haute     A faire  Modifier|
    | Preparer le rapport   Moyenne   En cours Modifier|
    |                                                  |
    | Total : 2         Terminees : 0                  |
    +------------------------------------------------+

--------------------------------------------------------------------------------
3.3 Formulaire de creation ou modification
--------------------------------------------------------------------------------
    +--------------------------------------+
    | Nouvelle tache                        |
    |                                       |
    | Titre *                               |
    | [____________________________]        |
    |                                       |
    | Description                           |
    | [____________________________]        |
    | [____________________________]        |
    |                                       |
    | Priorite                              |
    | [ Moyenne                  v ]        |
    |                                       |
    | Statut                                |
    | [ A faire                  v ]        |
    |                                       |
    | [ Annuler ]        [ Enregistrer ]    |
    +--------------------------------------+

--------------------------------------------------------------------------------
3.4 Composants front-end
--------------------------------------------------------------------------------
  - App           : composant racine de l'application
  - Navbar        : navigation et deconnexion
  - LoginForm     : formulaire de connexion
  - RegisterForm  : formulaire d'inscription
  - Dashboard     : affichage principal des taches
  - TaskList      : liste des taches
  - TaskCard      : representation individuelle d'une tache
  - TaskForm      : creation et modification d'une tache
  - FilterBar     : filtrage par statut et priorite
  - Toast         : affichage des messages de succes ou d'erreur
  - ProtectedRoute: protection des pages necessitant une authentification

Interactions principales :
  1. LoginForm envoie les identifiants au service d'authentification.
  2. Dashboard demande les taches au back-end.
  3. TaskForm cree ou modifie une tache.
  4. TaskList actualise l'affichage apres une operation reussie.
  5. FilterBar applique les parametres de recherche a la liste.


================================================================================
4. ARCHITECTURE DU SYSTEME
================================================================================

--------------------------------------------------------------------------------
4.1 Technologies retenues
--------------------------------------------------------------------------------
  Front-end         : React avec TypeScript
                        -> Interface utilisateur interactive
  Back-end          : Node.js avec Express
                        -> API REST et logique metier
  Base de donnees   : PostgreSQL
                        -> Stockage structure des utilisateurs et des taches
  Authentification  : JWT avec mots de passe haches
                        -> Identification securisee des utilisateurs
  Tests front-end   : Jest et React Testing Library
                        -> Tests des composants et comportements
  Tests API         : Jest / Supertest et Postman
                        -> Tests automatises et tests manuels
  Deploiement       : Docker et GitHub Actions
                        -> Reproductibilite et integration continue

--------------------------------------------------------------------------------
4.2 Diagramme d'architecture
--------------------------------------------------------------------------------
    Utilisateur --(HTTPS)--> Front-end React
    Front-end React --(REST/JSON)--> API Node.js / Express
    API --> Service d'authentification
    API --> PostgreSQL (base de donnees)
    API --> Service de journalisation
    API --(optionnel)--> API externe

--------------------------------------------------------------------------------
4.3 Flux de donnees
--------------------------------------------------------------------------------
  1. L'utilisateur interagit avec l'application React.
  2. Le front-end envoie une requete HTTPS a l'API REST.
  3. Le middleware verifie le jeton JWT.
  4. Le controleur appelle le service metier approprie.
  5. Le service metier lit ou modifie les donnees PostgreSQL.
  6. L'API retourne une reponse JSON.
  7. Le front-end met a jour l'interface.

Les communications entre le navigateur et le serveur utilisent HTTPS.
Les echanges applicatifs utilisent JSON.


================================================================================
5. COMPOSANTS ET CLASSES BACK-END
================================================================================

--------------------------------------------------------------------------------
5.1 User
--------------------------------------------------------------------------------
Responsabilite : representer un utilisateur du systeme.

Attributs :
  - id: UUID
  - name: string
  - email: string
  - passwordHash: string
  - createdAt: Date
  - updatedAt: Date

Methodes :
  - createUser()
  - findByEmail(email)
  - verifyPassword(password)
  - generateToken()

--------------------------------------------------------------------------------
5.2 Task
--------------------------------------------------------------------------------
Responsabilite : representer une tache appartenant a un utilisateur.

Attributs :
  - id: UUID
  - userId: UUID
  - title: string
  - description: string | null
  - status: TaskStatus
  - priority: TaskPriority
  - dueDate: Date | null
  - createdAt: Date
  - updatedAt: Date

Methodes :
  - create()
  - findById()
  - findByUserId()
  - update()
  - delete()

--------------------------------------------------------------------------------
5.3 AuthController
--------------------------------------------------------------------------------
Responsabilite : gerer l'inscription et la connexion.

Methodes :
  - register(req, res)
  - login(req, res)
  - logout(req, res)  [si une strategie de revocation est utilisee]

--------------------------------------------------------------------------------
5.4 TaskController
--------------------------------------------------------------------------------
Responsabilite : recevoir les requetes HTTP relatives aux taches.

Methodes :
  - listTasks(req, res)
  - getTask(req, res)
  - createTask(req, res)
  - updateTask(req, res)
  - deleteTask(req, res)

--------------------------------------------------------------------------------
5.5 TaskService
--------------------------------------------------------------------------------
Responsabilite : contenir les regles metier des taches.

Methodes :
  - validateTaskInput(data)
  - createTask(userId, data)
  - getUserTasks(userId, filters)
  - updateTask(userId, taskId, data)
  - deleteTask(userId, taskId)

--------------------------------------------------------------------------------
5.6 AuthMiddleware
--------------------------------------------------------------------------------
Responsabilite : verifier le jeton JWT transmis dans la requete.

Methode :
  - authenticate(req, res, next)

--------------------------------------------------------------------------------
5.7 Organisation du back-end
--------------------------------------------------------------------------------
    src/
    |-- controllers/
    |   |-- auth.controller.ts
    |   `-- task.controller.ts
    |-- services/
    |   |-- auth.service.ts
    |   `-- task.service.ts
    |-- models/
    |   |-- user.model.ts
    |   `-- task.model.ts
    |-- routes/
    |   |-- auth.routes.ts
    |   `-- task.routes.ts
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
  name             VARCHAR(100)      Obligatoire
  email            VARCHAR(255)      Obligatoire, unique
  password_hash    TEXT              Obligatoire
  created_at       TIMESTAMP         Obligatoire
  updated_at       TIMESTAMP         Obligatoire

--------------------------------------------------------------------------------
6.2 Table "tasks"
--------------------------------------------------------------------------------
  Colonne          Type              Contraintes
  ---------------  ----------------  ---------------------------
  id               UUID              Cle primaire
  user_id          UUID              Cle etrangere vers users.id
  title            VARCHAR(150)      Obligatoire
  description      TEXT              Facultatif
  status           VARCHAR(20)       Obligatoire
  priority         VARCHAR(20)       Obligatoire
  due_date         DATE              Facultatif
  created_at       TIMESTAMP         Obligatoire
  updated_at       TIMESTAMP         Obligatoire

--------------------------------------------------------------------------------
6.3 Relation
--------------------------------------------------------------------------------
  USERS (1) ------- owns -------< (0..N) TASKS

Un utilisateur peut posseder zero, une ou plusieurs taches. Chaque tache
appartient a un seul utilisateur.

--------------------------------------------------------------------------------
6.4 Valeurs autorisees
--------------------------------------------------------------------------------
  status   : TODO | IN_PROGRESS | DONE
  priority : LOW | MEDIUM | HIGH

--------------------------------------------------------------------------------
6.5 Regles d'integrite
--------------------------------------------------------------------------------
  - L'e-mail d'un utilisateur doit etre unique.
  - Une tache ne peut pas etre creee sans utilisateur associe.
  - Un utilisateur ne peut consulter que ses propres taches.
  - La suppression d'un utilisateur entraine la suppression de ses taches
    (regle ON DELETE CASCADE).
  - Les champs status et priority doivent appartenir aux valeurs autorisees.


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
  9. Front-end     -> Utilisateur : afficher le tableau de bord

--------------------------------------------------------------------------------
7.2 Recuperation des taches
--------------------------------------------------------------------------------
  1. Utilisateur   -> Front-end     : ouvre le tableau de bord
  2. Front-end     -> API           : GET /api/tasks avec JWT
  3. API           -> AuthMiddleware: verifier le JWT
  4. AuthMiddleware-> API           : userId authentifie
  5. API           -> TaskService   : getUserTasks(userId, filters)
  6. TaskService   -> PostgreSQL    : SELECT tasks WHERE user_id = userId
  7. PostgreSQL    -> TaskService   : liste des taches
  8. TaskService   -> API           : taches filtrees
  9. API           -> Front-end     : 200 + JSON
 10. Front-end     -> Utilisateur   : afficher les taches

--------------------------------------------------------------------------------
7.3 Creation d'une tache
--------------------------------------------------------------------------------
  1. Utilisateur   -> Front-end     : remplit le formulaire
  2. Front-end     -> API           : POST /api/tasks avec JSON et JWT
  3. API           -> AuthMiddleware: verifier le JWT
  4. AuthMiddleware-> API           : userId authentifie
  5. API           -> TaskService   : valider et creer la tache
  6. TaskService   -> PostgreSQL    : INSERT INTO tasks
  7. PostgreSQL    -> TaskService   : tache creee
  8. TaskService   -> API           : objet tache
  9. API           -> Front-end     : 201 + JSON
 10. Front-end     -> Utilisateur   : afficher un message de succes


================================================================================
8. APIs EXTERNES ET INTERNES
================================================================================

--------------------------------------------------------------------------------
8.1 APIs externes
--------------------------------------------------------------------------------
  API                                Utilisation                Justification
  ---------------------------------  -------------------------  --------------------------------
  Service d'e-mail (ex. SendGrid)    Reinitialisation du mot     Evite de maintenir un serveur
                                     de passe, e-mails systeme   SMTP interne
  Service de journalisation          Suivi des erreurs en        Facilite le diagnostic des
  (ex. Sentry)                       production                  incidents
  Service d'hebergement              Hebergement de l'API et     Permet un deploiement evolutif
  (ex. Render, AWS)                  de la base de donnees

Dans le MVP, les services d'e-mail et de journalisation peuvent etre
integres progressivement. Aucune API metier externe n'est obligatoire.

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
        "message": "The title is required",
        "details": []
      }
    }

--------------------------------------------------------------------------------
8.3 Endpoints d'authentification
--------------------------------------------------------------------------------
  Methode  URL                    Entree                       Sortie
  -------  ---------------------  ---------------------------  ------------------------
  POST     /api/auth/register     JSON: name, email, password  Utilisateur cree + token
  POST     /api/auth/login        JSON: email, password        Token JWT + utilisateur
  GET      /api/auth/me           Header Authorization: Bearer Utilisateur connecte

  Exemple - inscription :

    POST /api/auth/register
    Content-Type: application/json

    {
      "name": "Alice Martin",
      "email": "alice@example.com",
      "password": "MotDePasseSecurise123!"
    }

  Reponse :

    {
      "data": {
        "user": {
          "id": "8f7c0e1e-1b8d-4bd1-8f82-123456789abc",
          "name": "Alice Martin",
          "email": "alice@example.com"
        },
        "token": "jwt-token"
      },
      "message": "User registered successfully"
    }

--------------------------------------------------------------------------------
8.4 Endpoints de gestion des taches
--------------------------------------------------------------------------------
  Methode  URL              Entree                                    Sortie
  -------  ---------------  ----------------------------------------  ---------------------
  GET      /api/tasks       Query params: status, priority, search    Liste des taches
  GET      /api/tasks/:id   Identifiant dans l'URL                    Tache detaillee
  POST     /api/tasks       JSON: title, description, status,         Tache creee
                            priority, dueDate
  PATCH    /api/tasks/:id   JSON avec les champs a modifier           Tache modifiee
  DELETE   /api/tasks/:id   Identifiant dans l'URL                    Confirmation

  Exemple - creation d'une tache :

    POST /api/tasks
    Authorization: Bearer jwt-token
    Content-Type: application/json

    {
      "title": "Preparer la presentation",
      "description": "Finaliser les diapositives.",
      "priority": "HIGH",
      "status": "TODO",
      "dueDate": "2026-09-15"
    }

  Reponse :

    {
      "data": {
        "id": "a3c5f5a3-0a19-4c75-8e2e-123456789abc",
        "title": "Preparer la presentation",
        "description": "Finaliser les diapositives.",
        "priority": "HIGH",
        "status": "TODO",
        "dueDate": "2026-09-15"
      },
      "message": "Task created successfully"
    }

--------------------------------------------------------------------------------
8.5 Codes HTTP
--------------------------------------------------------------------------------
  200  Requete reussie
  201  Ressource creee
  400  Donnees invalides
  401  Authentification necessaire ou invalide
  403  Acces interdit
  404  Ressource inexistante
  409  Conflit (ex. e-mail deja utilise)
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
        |-- feature/task-management
        |-- feature/task-filters
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
  - Les messages de commit suivent une convention (ex: "feat: add task
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
  - La creation d'une tache.
  - La validation d'un titre vide.
  - La recuperation des taches d'un utilisateur.
  - L'impossibilite de consulter la tache d'un autre utilisateur.
  - La modification d'une tache.
  - La suppression d'une tache.

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
    - Donnees fictives.

  Staging :
    - Version proche de la production.
    - Tests d'integration et end-to-end.
    - Validation par les responsables du projet.

  Production :
    - Accessible aux utilisateurs finaux.
    - Sauvegardes activees.
    - Journalisation et surveillance des erreurs.


================================================================================
11. JUSTIFICATIONS TECHNIQUES
================================================================================

  React et TypeScript
    React convient a une interface composee de plusieurs ecrans et
    composants reutilisables. TypeScript permet de detecter certaines
    erreurs avant l'execution et ameliore la lisibilite du code.

  Node.js et Express
    Node.js permet d'utiliser JavaScript ou TypeScript cote serveur et
    cote client. Express fournit une structure simple pour creer une API
    REST, gerer les routes et ajouter des middlewares.

  PostgreSQL
    PostgreSQL est adapte aux donnees structurees du projet. Les relations
    entre utilisateurs et taches sont clairement modelisees par des cles
    etrangeres et des contraintes d'integrite.

  JWT
    JWT permet a l'API d'identifier un utilisateur lors de requetes
    successives sans conserver necessairement une session serveur
    classique. Les mots de passe doivent etre haches et ne doivent jamais
    etre stockes en clair.

  Docker
    Docker garantit que l'application s'execute dans des environnements
    coherents entre les postes de developpement, la staging et la
    production.

  Tests automatises
    Les tests unitaires et d'integration detectent rapidement les
    regressions. Les tests end-to-end verifient que les principaux
    parcours fonctionnent comme prevu.

  Architecture en couches
    La separation entre controleurs, services, modeles et middleware
    facilite la maintenance, les tests et l'evolution future du systeme.


================================================================================
12. SECURITE ET EVOLUTIVITE
================================================================================

--------------------------------------------------------------------------------
12.1 Mesures de securite
--------------------------------------------------------------------------------
  - Utilisation obligatoire de HTTPS.
  - Hachage des mots de passe avec un algorithme adapte.
  - Validation des donnees entrantes.
  - Protection des routes privees par JWT.
  - Verification de la propriete des taches.
  - Limitation du nombre de requetes sur les endpoints sensibles.
  - Stockage des secrets dans des variables d'environnement.
  - Protection contre les injections SQL grace aux requetes parametrees.
  - Journalisation des erreurs sans exposer d'informations sensibles.

--------------------------------------------------------------------------------
12.2 Evolutions possibles
--------------------------------------------------------------------------------
  - Ajout d'un cache Redis.
  - Pagination des taches.
  - Index sur user_id, status et priority.
  - Separation du front-end et du back-end en services independants.
  - Ajout d'une file de messages pour les notifications.
  - Mise en place de plusieurs instances de l'API derriere un
    repartiteur de charge.


================================================================================
13. CONCLUSION DU LIVRABLE
================================================================================

Cette documentation presente une conception technique complete pour un MVP
de gestion de taches. Elle comprend les User Stories priorisees, les
maquettes principales, l'architecture, les composants logiciels, le schema
de base de donnees, les diagrammes de sequence, les specifications API
ainsi que les strategies SCM et QA.

Les elements qui doivent etre adaptes au projet reel sont notamment le
domaine metier, les types d'utilisateurs, les fonctionnalites du MVP, les
APIs externes et les choix technologiques.

================================================================================
                                FIN DU DOCUMENT
================================================================================