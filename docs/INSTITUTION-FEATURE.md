# README : Implémentation des Fonctionnalités "Institution"

## Introduction

Ce document sert de documentation technique pour les tâches de développement réalisées le 24 août 2025. L'objectif principal de ces tâches était d'implémenter un système de rôles et de diffusion de contenu ciblé, désigné sous le nom de "Fonctionnalité d'Institution".

Ce système permet à des utilisateurs standards de s'élever au statut d'"Institution" via un code, et aux administrateurs de diffuser des bulletins d'information spécifiques à ces institutions, en plus des bulletins publics.

## Prérequis

Pour comprendre, maintenir ou étendre cette fonctionnalité, les éléments suivants sont nécessaires :

- **Environnement de développement :**
  - **Framework :** Ionic v7+ / Angular v17+
  - **Langage :** TypeScript
  - **Node.js :** v18 ou supérieure
- **Backend & Dépendances :**
  - **Firebase :** Un projet Firebase actif est requis.
    - **Firestore :** Utilisé comme base de données NoSQL.
    - **Firebase Authentication :** Utilisé pour la gestion des utilisateurs.
  - **AngularFire :** La bibliothèque officielle pour lier Angular à Firebase.
- **Outils :**
  - **Firebase CLI :** Nécessaire pour le déploiement des règles de sécurité Firestore.
  - **Angular CLI :** Pour la gestion du projet Angular.

## Procédures et Démarches

Voici la chronologie détaillée des opérations effectuées pour mettre en place la fonctionnalité.

### 1. Modification des Modèles de Données

La première étape a été d'étendre les modèles de données pour supporter le nouveau concept d'institution.

- **Modèle Utilisateur (`AppUser`) :** L'interface `AppUser` dans `src/app/services/auth/auth.service.ts` a été modifiée pour inclure un nouveau champ booléen.
  ```typescript
  export interface AppUser {
    // ... autres champs
    isInstitution?: boolean;
  }
  ```
- **Modèle Bulletin (`WeatherBulletin`) :** L'interface dans `src/app/model/bulletin.model.ts` a été modifiée pour permettre le ciblage.
  ```typescript
  export interface WeatherBulletin {
    // ... autres champs
    targetInstitutionId?: string;
  }
  ```

### 2. Implémentation du Flux "Devenir Institution"

Ce flux permet à un utilisateur de s'auto-assigner le rôle d'institution.

- **Interface :** Un bouton a été rendu cliquable dans `src/app/pages/settings/settings.page.html`.
- **Logique :** La méthode `promptBecomeInstitution()` dans `settings.page.ts` a été créée. Elle utilise le service `AlertController` d'Ionic pour demander un code (`95160`).
- **Mise à jour en base de données :** En cas de succès, la méthode `setUserAsInstitution()` du `AuthService` est appelée pour mettre à jour le document de l'utilisateur dans Firestore.

### 3. Implémentation du Ciblage des Bulletins

Les administrateurs doivent pouvoir sélectionner une institution lors de la création d'un bulletin.

- **Récupération des données :** Une méthode `getInstitutionUsers()` a été ajoutée à `auth.service.ts` pour lister tous les utilisateurs où `isInstitution` est `true`.
- **Interface du formulaire :** La page `add.page.ts` a été modifiée pour appeler cette méthode et stocker le résultat. Le template `add.page.html` utilise ces données pour peupler un `ion-select`, permettant à l'admin de choisir une institution cible.
- **Enregistrement des données :** La méthode `submitAlert()` a été modifiée pour inclure le `targetInstitutionId` dans l'objet bulletin envoyé à Firestore.

### 4. Affichage Filtré des Bulletins

La page d'accueil doit afficher les bulletins en fonction du statut de l'utilisateur.

- **Logique de filtrage :** La méthode `ngOnInit` de `home.page.ts` a été modifiée. Elle détermine si l'utilisateur est une institution et filtre la liste des bulletins pour n'afficher que les bulletins publics et ceux qui lui sont spécifiquement adressés.
- **Indicateur visuel :** Un `ion-badge` "Spécifique" a été ajouté à `home.page.html` pour différencier les bulletins ciblés.

## Techniques et Bonnes Pratiques

Plusieurs décisions techniques ont été prises pour assurer la qualité et la robustesse du code.

- **Robustesse des écritures Firestore :** L'utilisation de `setDoc(..., { merge: true })` a été préférée à `updateDoc` pour la mise à jour du statut d'institution. Cette approche prévient les erreurs si le document utilisateur n'existe pas encore, en le créant au lieu de retourner une erreur.
- **Intégrité des données à la connexion :** La fonction `loginWithEmailAndPassword` a été modifiée pour appeler systématiquement `updateUserData`. Cela garantit que le document Firestore de l'utilisateur est toujours synchronisé et complet, prévenant les bugs où des utilisateurs sans document en base de données pouvaient exister.
- **Sécurité par le moindre privilège :** Lors de la correction des règles de sécurité, l'accès en `list` à la collection `users` n'a été accordé qu'aux administrateurs, plutôt qu'à tous les utilisateurs authentifiés. Ceci est crucial pour protéger les données des utilisateurs.
- **Expérience utilisateur :** Pour l'affichage des institutions dans la liste déroulante, un fallback sur l'email (`displayName || email`) a été implémenté pour garantir qu'un identifiant soit toujours visible, même si le nom d'affichage n'est pas défini.

## Problèmes Rencontrés et Solutions

Le processus de développement a nécessité la résolution de plusieurs problèmes critiques.

1.  **Problème :** Permissions insuffisantes sur Firestore.
    - **Symptôme :** Erreur `FirebaseError: Missing or insufficient permissions` lors de la tentative de lister les institutions.
    - **Cause :** Les règles de sécurité n'autorisaient que la lecture de documents uniques (`allow read`) et non l'interrogation de listes (`allow list`).
    - **Solution :** Mise à jour du fichier `firestore.rules` pour accorder la permission `list` aux administrateurs sur la collection `users`.

2.  **Problème :** Requête invalide (`400 Bad Request`).
    - **Symptôme :** Erreur réseau sur le canal `Listen` de Firestore lors de l'écoute des institutions.
    - **Cause :** La requête `where('isInstitution', '==', true)` nécessitait un index qui n'était pas activé.
    - **Solution :** Réactivation de l'index à champ unique pour le champ `isInstitution` via l'interface de la console Firebase.

3.  **Problème :** Données manquantes pour certains utilisateurs.
    - **Symptôme :** Des lignes vides apparaissaient dans la liste des institutions.
    - **Cause :** Des documents utilisateurs dans Firestore étaient incomplets (sans `email` ou `displayName`). La cause racine était que la fonction de connexion par email/mot de passe ne créait/mettait pas à jour le document associé dans Firestore.
    - **Solution :** Modification de `loginWithEmailAndPassword` dans `auth.service.ts` pour y inclure l'appel à `updateUserData`.

## Résultat Final

À l'issue de ces tâches, l'application dispose d'une nouvelle fonctionnalité complète et fonctionnelle :

- Les utilisateurs peuvent devenir des "Institutions".
- Les administrateurs peuvent créer des bulletins publics ou ciblés vers une institution spécifique.
- La page d'accueil affiche une liste de bulletins personnalisée en fonction du statut de l'utilisateur.
- Les problèmes de sécurité et de configuration de la base de données sous-jacents ont été résolus, rendant l'application plus stable et sécurisée.

## Prochaines Étapes

Pour continuer à améliorer le projet, les actions suivantes sont recommandées :

- **Écrire des tests unitaires :** Ajouter des tests pour les nouvelles méthodes dans `auth.service.ts` et pour la logique de filtrage dans les composants afin de prévenir les régressions.
- **Renforcer la sécurité :** Les règles pour les collections `bulletins` et `events` sont actuellement très permissives (`allow read, write: if true;`). Il est recommandé de les restreindre pour n'autoriser l'écriture qu'aux administrateurs.
- **Améliorer l'UX :** Fournir un retour visuel (ex: un spinner) lors du chargement de la liste des institutions. Désactiver ou masquer le bouton "Devenir une institution" une fois que l'utilisateur a déjà ce statut, au lieu de simplement le rediriger.
