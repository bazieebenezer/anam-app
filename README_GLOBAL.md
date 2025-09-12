# Documentation Globale et Technique du Projet ANAM

## 1. Introduction Générale

Ce document constitue la synthèse technique complète de l'application ANAM, une plateforme multi-canal (Web, iOS, Android) de diffusion d'informations météorologiques et événementielles. Conçue pour servir à la fois le grand public et des entités institutionnelles spécifiques, l'application a pour vocation de fournir des bulletins, des alertes et des comptes rendus d'événements de manière fiable, rapide et sécurisée.

L'objectif de ce document est de fournir une vue d'ensemble architecturale, une analyse approfondie de chaque fonctionnalité, une description des flux de données et des processus, ainsi qu'une feuille de route pour les améliorations futures. Il s'adresse aux développeurs, aux architectes logiciels et aux chefs de projet impliqués dans la maintenance et l'évolution de l'application.

### 1.1. Philosophie et Architecture d'Ensemble

Le projet est construit sur une stack technologique moderne et éprouvée, favorisant le développement multiplateforme et la maintenabilité :

-   **Framework Frontend** : **Ionic/Angular**, qui permet de construire une base de code unique pour le web, iOS et Android, tout en offrant une expérience utilisateur riche et performante.
-   **Intégration Native** : **Capacitor**, le successeur de Cordova, qui sert de pont entre la couche web de l'application et les API natives des appareils mobiles (système de fichiers, caméra, partage, etc.).
-   **Backend et Base de Données** : **Firebase**, la suite de services de Google, est au cœur de l'architecture backend. Elle est utilisée pour :
    -   **Firebase Authentication** : Gestion des identités et des sessions utilisateur.
    -   **Firestore** : Base de données NoSQL en temps réel pour le stockage des données (utilisateurs, bulletins, événements).
    -   **Firebase Cloud Storage** : Stockage d'objets pour les fichiers lourds comme les images (architecture recommandée).
    -   **Firebase Cloud Messaging (FCM)** : Envoi de notifications push.
-   **Serveur de Notifications** : Un micro-service **Node.js** (`anam-server`) est déployé pour écouter les changements dans la base de données et déclencher les notifications push de manière proactive.

Cette architecture découplée permet une grande flexibilité et scalabilité, tout en s'appuyant sur des services managés pour minimiser la charge de maintenance de l'infrastructure.

---

## 2. Analyse Approfondie des Fonctionnalités

Chaque fonctionnalité est analysée selon son objectif, son scénario d'utilisation typique (diagramme de séquence implicite), son implémentation technique et les classes/services impliqués.

### 2.1. Onboarding : La Première Expérience Utilisateur

-   **Objectif** : Accueillir un nouvel utilisateur lors de son tout premier lancement de l'application, lui présenter le but de l'application et ne plus jamais réapparaître par la suite.

-   **Scénario d'Action (Séquence)** :
    1.  **Utilisateur** : Lance l'application pour la première fois.
    2.  **Routeur Angular** : Tente de naviguer vers la route principale (`/tabs`).
    3.  **`onboardingGuard`** : Intercepte la navigation. Il appelle `OnboardingService`.
    4.  **`OnboardingService`** : Interroge le stockage de l'appareil via `@capacitor/preferences` pour la clé `hasSeenOnboarding`.
    5.  **Stockage Appareil** : Ne trouve pas la clé et retourne `null`.
    6.  **`onboardingGuard`** : Reçoit `false`, annule la navigation vers `/tabs` et redirige l'utilisateur vers la page `/onboarding`.
    7.  **`OnboardingPage`** : S'affiche. L'utilisateur lit le message et clique sur "Commencer".
    8.  **`OnboardingPage`** : Appelle `onboardingService.setOnboardingComplete()`.
    9.  **`OnboardingService`** : Écrit la clé `hasSeenOnboarding` avec la valeur `'true'` dans le stockage de l'appareil.
    10. **Routeur Angular** : Navigue vers `/tabs`. Le `onboardingGuard` s'exécute à nouveau, mais cette fois, il reçoit `true` et autorise la navigation.

-   **Détails Techniques et Classes Impliquées** :
    -   **`OnboardingService`**: Service singleton qui abstrait la logique de persistance. Il utilise `@capacitor/preferences` pour une compatibilité multiplateforme du stockage clé-valeur.
    -   **`onboardingGuard`**: Un `CanActivateFn` Angular moderne qui protège les routes principales. Il utilise l'injection de dépendances (`inject()`) pour accéder au service et au routeur.
    -   **`OnboardingPage`**: Le composant d'interface qui gère l'interaction utilisateur et déclenche la complétion du processus.

### 2.2. Système d'Authentification Hybride

-   **Objectif** : Permettre aux utilisateurs de se connecter via des fournisseurs d'identité (Google) avec une expérience optimale sur chaque plateforme.

-   **Scénario d'Action (Connexion Google sur Android/iOS)** :
    1.  **Utilisateur** : Sur la `SigninPage`, clique sur "Se connecter avec Google".
    2.  **`SigninPage`** : Appelle `authService.loginWithGoogle()`.
    3.  **`AuthService`** : Détecte une plateforme native (`Capacitor.isNativePlatform()`).
    4.  **`AuthService`** : Appelle `SocialLogin.login({ provider: 'google' })` du plugin `@capgo/capacitor-social-login`.
    5.  **Plugin `@capgo/capacitor-social-login`** : Déclenche le SDK natif de Google Sign-In.
    6.  **OS (Android/iOS)** : Affiche la boîte de dialogue native de sélection de compte Google.
    7.  **Utilisateur** : Sélectionne son compte.
    8.  **Plugin** : Reçoit un `idToken` de Google et le retourne à l'application.
    9.  **`AuthService`** : Crée une `AuthCredential` Firebase avec ce token (`GoogleAuthProvider.credential(idToken)`).
    10. **`AuthService`** : Appelle `signInWithCredential()` pour connecter l'utilisateur à Firebase.
    11. **`AuthService`** : Appelle `updateUserData()` pour créer/mettre à jour le profil de l'utilisateur dans la collection `users` de Firestore.

-   **Détails Techniques et Classes Impliquées** :
    -   **`AuthService`**: Le service central qui orchestre l'authentification. Il expose un `Observable<AppUser>` (`currentUser$`) qui fusionne les données de Firebase Auth et de Firestore en temps réel.
    -   **`@capgo/capacitor-social-login`**: Plugin Capacitor essentiel pour une expérience de connexion Google native.
    -   **`AppUser` (Interface)** : Modèle de données pour le profil utilisateur étendu stocké dans Firestore (incluant les rôles).
    -   **`auth.guard.ts` et `admin.guard.ts`**: **(Recommandation Critique)** Les documentations révèlent que ces gardiens sont inactifs. Il est impératif de les activer pour protéger les routes. `authGuard` doit vérifier si un utilisateur est connecté, et `adminGuard` doit vérifier si `user.isAdmin` est `true`.

### 2.3. Contrôle d'Accès Basé sur les Rôles (RBAC)

-   **Objectif** : Accorder des privilèges spéciaux ("Administrateur", "Institution") à certains utilisateurs pour accéder à des fonctionnalités restreintes (création de contenu, réception de bulletins ciblés).

-   **Scénario d'Action (Devenir Administrateur)** :
    1.  **Utilisateur** : Navigue vers la `SettingsPage`.
    2.  **`SettingsPage`** : Le bouton "Devenir administrateur" est visible car `(currentUser$ | async).isAdmin` est `false`.
    3.  **Utilisateur** : Clique sur le bouton, déclenchant `promptBecomeAdmin()`.
    4.  **`AlertController`** : Affiche une boîte de dialogue demandant un code.
    5.  **Utilisateur** : Entre le code secret.
    6.  **`SettingsPage`** : Valide le code en le comparant à une chaîne de caractères codée en dur (`'02112'`).
    7.  **`SettingsPage`** : Si le code est correct, appelle `authService.setUserAsAdmin()`.
    8.  **`AuthService`** : Récupère l'UID de l'utilisateur courant et utilise `updateDoc` de Firestore pour mettre à jour le document `users/{uid}` avec le champ `{ isAdmin: true }`.

-   **Détails Techniques et Critiques** :
    -   **`SettingsPage`**: Le composant d'interface qui sert de point d'entrée pour l'élévation de privilèges.
    -   **`AuthService`**: Contient la logique de mise à jour de la base de données.
    -   **Faille de Sécurité** : Le code secret est codé en dur côté client, ce qui est une mauvaise pratique. Un utilisateur malveillant peut le trouver en inspectant le code source de l'application.
    -   **Manque de Réactivité** : L'interface ne se met pas à jour en temps réel après l'obtention du rôle.
    -   **Recommandations** :
        1.  **Déplacer la validation du code côté serveur** via une **Fonction Cloud Firebase**.
        2.  Utiliser les **Custom Claims** de Firebase Authentication pour une gestion des rôles plus sécurisée et performante, au lieu d'un champ dans Firestore.
        3.  Utiliser `docData` au lieu de `getDoc` dans `AuthService` pour rendre l'interface réactive aux changements de rôle.

### 2.4. Création de Contenu et Gestion des Images

-   **Objectif** : Permettre aux administrateurs de créer des événements et des bulletins, y compris des images.

-   **Scénario d'Action (Architecture Actuelle et Problématique)** :
    1.  **Admin** : Sur la `AddPage`, remplit un formulaire et sélectionne une image.
    2.  **`AddPage`** : Utilise le plugin `@capacitor/camera` pour obtenir le chemin de l'image.
    3.  **`AddPage`** : Lit le fichier image et le convertit en une **chaîne de caractères Base64** (Data URL).
    4.  **`AddPage`** : Stocke cette longue chaîne dans un tableau `selectedImages`.
    5.  **Admin** : Clique sur "Publier".
    6.  **`AddPage`** : Crée un objet `AnamEvent` ou `WeatherBulletin` et assigne le tableau de chaînes Base64 au champ `images`.
    7.  **`AddPage`** : Appelle `eventService.addEvent()` ou `publicationService.addAlert()`.
    8.  **Service** : Utilise `addDoc` pour enregistrer l'objet entier, y compris les images encodées, dans un **unique document Firestore**.

-   **Détails Techniques et Dette Technique Majeure** :
    -   **`AddPage`**: Le composant central qui gère la logique de formulaire et de traitement d'image.
    -   **`EventService`, `PublicationService`**: Services CRUD pour les collections Firestore.
    -   **Problèmes Critiques de l'Approche Base64** :
        -   **Performance** : Les documents Firestore deviennent extrêmement volumineux, ce qui ralentit les lectures et les écritures.
        -   **Coûts** : Les coûts de Firestore sont basés sur la taille des données. Cette approche est très coûteuse.
        -   **Limite de Taille** : Un document Firestore ne peut pas dépasser 1 Mo. Quelques images en haute résolution peuvent faire échouer la publication.
        -   **Scalabilité** : L'approche n'est pas scalable.
    -   **Architecture Recommandée (Impérative)** :
        1.  Créer un `ImageUploadService`.
        2.  Dans `AddPage`, lors de la sélection d'une image, l'uploader directement vers **Firebase Cloud Storage**.
        3.  Cloud Storage retourne une **URL publique**.
        4.  Stocker uniquement ce **tableau d'URLs** (chaînes de caractères courtes) dans le document Firestore.

### 2.5. Notifications Push Ciblées

-   **Objectif** : Informer les utilisateurs de manière proactive des nouveaux contenus, en ciblant des groupes spécifiques si nécessaire.

-   **Scénario d'Action (Bulletin Ciblé pour une Institution)** :
    1.  **Admin** : Crée un bulletin sur la `AddPage` et sélectionne une institution spécifique dans un menu déroulant.
    2.  **`AddPage`** : Soumet le bulletin avec le champ `targetInstitutionId` contenant l'UID de l'institution.
    3.  **`anam-server` (Node.js)** : Son listener `onSnapshot` sur la collection `bulletins` détecte le nouveau document.
    4.  **`anam-server`** : Lit le document, voit que `targetInstitutionId` est défini.
    5.  **`anam-server`** : Construit un nom de topic FCM unique : `institution_{targetInstitutionId}`.
    6.  **`anam-server`** : Utilise le SDK Admin Firebase pour envoyer une notification à ce topic spécifique.
    7.  **FCM** : Distribue la notification uniquement aux appareils abonnés à ce topic.
    8.  **Appareil de l'Utilisateur Institutionnel** : L'utilisateur, lors de sa connexion, a été abonné à ce topic par `AuthService`. Il reçoit la notification.

-   **Détails Techniques et Classes Impliquées** :
    -   **`anam-server/index.js`**: Le backend Node.js qui écoute Firestore et envoie les notifications. Il utilise le SDK Admin Firebase.
    -   **`FcmService`**: Service Angular qui encapsule les interactions techniques avec les plugins Capacitor (`@capacitor/push-notifications`, `@capacitor-community/fcm`).
    -   **`AuthService`**: Orchestre la logique d'abonnement. Il abonne tous les utilisateurs au topic public `newPosts` et gère dynamiquement l'abonnement/désabonnement aux topics d'institution en fonction du statut de l'utilisateur.

### 2.6. Génération de PDF Côté Client

-   **Objectif** : Permettre aux utilisateurs de télécharger une version PDF portable et professionnelle des bulletins.

-   **Scénario d'Action** :
    1.  **Utilisateur** : Sur la page de détail d'un bulletin, clique sur "Télécharger en PDF".
    2.  **`PdfGenerationService`** : Est appelé. Il crée dynamiquement un `<div>` HTML invisible, stylisé pour ressembler à un document A4.
    3.  **`PdfGenerationService`** : Remplit ce `<div>` avec les données du bulletin (titre, images, texte).
    4.  **`PdfGenerationService`** : Attend que toutes les images à l'intérieur du `<div>` soient complètement chargées (`Promise.all`).
    5.  **`html2canvas`** : "Capture" le `<div>` et le transforme en une image sur un élément `<canvas>`.
    6.  **`jsPDF`** : Crée un nouveau document PDF. L'image du canvas est ajoutée, et une logique de pagination manuelle la "découpe" sur plusieurs pages si nécessaire.
    7.  **`PdfGenerationService`** :
        -   Sur le **web**, appelle `pdf.save()` pour déclencher un téléchargement.
        -   Sur **mobile**, convertit le PDF en Base64, l'écrit dans un fichier temporaire avec `@capacitor/filesystem`, puis utilise `@capacitor-community/file-opener` pour demander au système d'ouvrir le fichier.

-   **Détails Techniques et Bibliothèques Clés** :
    -   **`PdfGenerationService`**: Le service central qui orchestre tout le processus.
    -   **`jsPDF`**: Bibliothèque pour la création de PDF en JavaScript.
    -   **`html2canvas`**: Bibliothèque pour la capture de DOM en canvas.

---

## 3. Patrons d'Interface et d'Expérience Utilisateur (UI/UX)

### 3.1. Thème Adaptatif (Clair / Sombre / Système)

-   **Objectif** : Améliorer le confort visuel et l'intégration avec le système d'exploitation.
-   **Implémentation** :
    -   **`ThemeService`**: Gère l'état du thème. Il utilise `localStorage` pour la persistance du choix de l'utilisateur et `window.matchMedia('(prefers-color-scheme: dark)')` pour détecter et écouter les changements de thème du système.
    -   Le service applique le thème en basculant (`toggle`) la classe `.dark` sur le `<body>` du document.
    -   **`variables.scss`**: Le fichier de style d'Ionic qui définit les couleurs par défaut et les redéfinit à l'intérieur d'un sélecteur `.dark { ... }`.

### 3.2. Chargement Squelette (Skeleton Loading)

-   **Objectif** : Améliorer la performance perçue en affichant une prévisualisation de la mise en page pendant le chargement des données.
-   **Implémentation** :
    -   Un drapeau booléen `isLoading` est utilisé dans le composant (ex: `HomePage`).
    -   Le template HTML utilise `@if (isLoading)` pour afficher une série de composants `<ion-skeleton-text>` qui miment la structure du contenu à venir.
    -   Lorsque les données sont reçues de l'observable, le drapeau `isLoading` passe à `false`, et le contenu réel est affiché à la place du squelette.

### 3.3. Boutons avec État de Chargement (Loading Buttons)

-   **Objectif** : Fournir un retour visuel immédiat lors d'une action asynchrone (soumission de formulaire) et empêcher les soumissions multiples.
-   **Implémentation** :
    -   Un drapeau booléen `isSubmitting` est utilisé dans le composant (ex: `AddPage`).
    -   Le bouton dans le template est désactivé conditionnellement : `[disabled]="form.invalid || isSubmitting"`.
    -   Le contenu du bouton change également en fonction du drapeau : `{{ isSubmitting ? 'Publication...' : 'Publier' }}`.
    -   La méthode de soumission enveloppe l'appel asynchrone dans un bloc `try...finally`, garantissant que `isSubmitting` est remis à `false` même en cas d'erreur.

---

## 4. Conclusion et Recommandations Stratégiques

L'application ANAM est une plateforme fonctionnelle et bien architecturée, tirant parti des forces d'Ionic/Angular pour le frontend et de Firebase pour le backend. Cependant, l'analyse des documentations révèle plusieurs points critiques qui nécessitent une attention prioritaire pour garantir la performance, la sécurité et la scalabilité à long terme.

**Actions Impératives Recommandées :**

1.  **Refactorisation du Stockage des Images (Priorité #1)** : Abandonner immédiatement l'approche Base64/Firestore. Migrer vers une architecture où les images sont uploadées sur **Firebase Cloud Storage** et où seules leurs URLs sont stockées dans Firestore. C'est essentiel pour la performance, les coûts et la stabilité de l'application.

2.  **Activation des Gardiens de Route (Priorité #2)** : Activer et configurer `authGuard` et `adminGuard` pour sécuriser les routes de l'application. C'est une faille de sécurité critique qui rend les pages d'administration accessibles à des utilisateurs non autorisés.

3.  **Sécurisation de l'Élévation de Rôles** : Remplacer la validation par code secret côté client par une solution backend utilisant les **Fonctions Cloud Firebase** et les **Custom Claims**.

En adressant ces points, le projet ANAM se dotera d'une base technique solide, prête à évoluer et à servir ses utilisateurs de manière fiable et performante.
