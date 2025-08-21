# Processus d'attribution du rôle d'administrateur

Ce document explique le fonctionnement de l'attribution du rôle d'administrateur dans l'application.

## 1. Interface utilisateur

Un utilisateur authentifié qui n'est pas déjà administrateur verra un bouton "Devenir administrateur" sur la page des paramètres (`src/app/pages/settings`).

Lorsque l'utilisateur clique sur ce bouton, une boîte de dialogue (popup) s'affiche, lui demandant d'entrer un code de vérification.

## 2. Code de vérification

Le code de vérification est actuellement codé en dur dans l'application. Le code est `02112`.

Ce code est vérifié dans la méthode `promptBecomeAdmin()` du fichier `src/app/pages/settings/settings.page.ts`.

## 3. Logique d'attribution du rôle

Si l'utilisateur entre le bon code de vérification, la méthode `setUserAsAdmin()` du service `AuthService` (`src/app/services/auth/auth.service.ts`) est appelée.

Cette méthode met à jour le document de l'utilisateur dans la collection `users` de la base de données Firestore. Plus précisément, elle met le champ `isAdmin` à `true`.

## 4. Persistance du rôle

Le rôle d'administrateur est persistant. Une fois qu'un utilisateur est administrateur, il le restera lors de ses prochaines connexions.

Ceci est géré par la méthode `updateUserData()` dans `AuthService`. Cette méthode est appelée lors de la création d'un compte ou lors de la connexion avec Google. Elle vérifie si un document utilisateur existe déjà. Si c'est le cas, elle ne modifie pas le champ `isAdmin`, préservant ainsi le statut d'administrateur.

## 5. Affichage conditionnel

L'affichage du bouton "Devenir administrateur" est géré par une condition `*ngIf` dans le template `src/app/pages/settings/settings.page.html`.

Le bouton n'est affiché que si l'utilisateur est connecté et que son champ `isAdmin` est `false`.

**Note importante sur la version actuelle :**

La version actuelle du code utilise `getDoc` pour récupérer les informations de l'utilisateur. Cela signifie que l'interface utilisateur ne se met pas à jour en temps réel. Après être devenu administrateur, l'utilisateur devra quitter la page des paramètres et y revenir pour que le bouton "Devenir administrateur" disparaisse.

Pour une mise à jour en temps réel, il faudrait utiliser `docData` dans l'observable `currentUser$` du service `AuthService`.
