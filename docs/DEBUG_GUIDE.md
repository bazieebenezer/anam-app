# Guide de Débogage Général pour l'Application

## 1. Introduction

Le débogage est une compétence essentielle pour tout développeur. Ce guide a pour but de fournir une série de stratégies, d'outils et de techniques spécifiques à cette application Ionic/Angular/Firebase pour vous aider à diagnostiquer et à résoudre les problèmes efficacement. Que vous travailliez sur des problèmes d'interface utilisateur, de logique métier, d'authentification ou d'interaction avec des API natives, ce document vous servira de référence.

Nous aborderons les outils de base, les techniques de traçage de l'état de l'application, le débogage des services Firebase, et nous finirons par une étude de cas concrète sur le débogage de la fonctionnalité de téléchargement d'images.

## 2. Outils de Débogage Essentiels

### 2.1. Outils de Développement du Navigateur (Chrome DevTools)

Lorsque vous lancez l'application localement avec `ionic serve`, votre principal outil de débogage est le navigateur. Les Chrome DevTools (accessibles avec F12 ou Ctrl+Shift+I) sont indispensables.

-   **Onglet `Console`**: C'est ici que tous les messages `console.log`, `console.warn`, et `console.error` apparaîtront. C'est aussi là que les erreurs JavaScript non interceptées sont affichées. Utilisez `console.log` généreusement pour tracer le flux d'exécution de votre code.
-   **Onglet `Network` (Réseau)**: Surveillez toutes les requêtes HTTP sortantes. C'est crucial pour déboguer les interactions avec des API externes. Vous pouvez inspecter les en-têtes, les corps de requête et les réponses.
-   **Onglet `Application`**: Permet d'inspecter le stockage local. Pour cette application, c'est utile pour voir les données stockées par Capacitor Preferences (qui utilise Local Storage sur le web). Vous pouvez y voir la clé `hasSeenOnboarding` par exemple.
-   **Onglet `Sources`**: Vous pouvez placer des points d'arrêt (`breakpoints`) directement dans votre code TypeScript. Lorsque le code s'exécute et atteint un point d'arrêt, l'exécution est mise en pause, vous permettant d'inspecter la valeur des variables à ce moment précis.

### 2.2. Débogage sur Appareil Physique

Les problèmes liés aux plugins Capacitor (comme la Caméra ou le Système de Fichiers) n'apparaissent souvent que sur un appareil mobile réel.

-   **Pour Android**: Connectez votre appareil en USB, activez le mode développeur et le débogage USB. Lancez l'application sur l'appareil via Android Studio ou avec `npx cap run android`. Ensuite, dans Chrome sur votre ordinateur, naviguez vers `chrome://inspect`. Vous y verrez votre appareil et pourrez ouvrir une session DevTools pour inspecter l'application en cours d'exécution.
-   **Pour iOS**: Le processus est similaire avec Safari. Connectez votre appareil, lancez l'application via Xcode, puis dans Safari sur votre Mac, allez dans le menu `Développement` et sélectionnez votre appareil pour ouvrir l'inspecteur web.

### 2.3. Angular DevTools

C'est une extension de navigateur pour Chrome et Firefox qui vous permet d'inspecter l'arborescence des composants de votre application Angular, de voir leurs états et de profiler les performances. C'est très utile pour comprendre la structure de votre UI et l'état de vos composants.

## 3. Stratégies de Débogage dans le Code

### 3.1. Tracer les Observables avec `tap`

Une grande partie de l'application utilise la programmation réactive avec RxJS (Observables). Le débogage des flux de données peut être complexe. L'opérateur `tap` est votre meilleur ami pour cela.

`tap` vous permet d'exécuter une action pour chaque événement de l'observable (émission de valeur, erreur, complétion) sans affecter le flux lui-même.

**Exemple : Déboguer `currentUser$` dans `AuthService`**
```typescript
this.currentUser$ = authState(this.auth).pipe(
  tap(user => console.log('Auth state changed:', user)), // Log 1: L'état de Firebase Auth a changé
  switchMap(user => {
    if (user) {
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      return from(getDoc(userDocRef)).pipe(
        tap(docSnap => console.log('Firestore doc snapshot:', docSnap.data())) // Log 2: Données lues depuis Firestore
      );
    } else {
      return of(null);
    }
  }),
  tap(appUser => console.log('Final AppUser:', appUser)) // Log 3: L'objet AppUser final
);
```
En ajoutant ces `tap`, vous pouvez suivre précisément le parcours des données, de Firebase Auth à Firestore, jusqu'à l'objet final `AppUser`.

### 3.2. La Console Firebase

Ne sous-estimez pas la puissance de la console web de Firebase.

-   **Firebase Authentication**: Vérifiez la liste des utilisateurs, leur UID, leur date de dernière connexion. C'est le premier endroit où regarder si un utilisateur ne peut pas se connecter.
-   **Firestore Database**: Parcourez vos collections et documents. Si un utilisateur n'a pas le bon rôle, allez voir son document dans la collection `users` et vérifiez la valeur du champ `isAdmin` ou `isInstitution`.
-   **Security Rules**: L'onglet `Rules` de Firestore vous permet de simuler des requêtes. Si des données ne s'affichent pas, il se peut qu'une règle de sécurité bloque la lecture ou l'écriture.

## 4. Étude de Cas : Déboguer le Téléchargement d'Images

Contrairement à ce que d'anciennes versions de ce guide pouvaient indiquer, le code de téléchargement d'images ne produit pas une longue liste de logs verbeux. Le débogage repose sur l'inspection des erreurs et la compréhension de la logique de la plateforme.

### 4.1. Comprendre le Flux

La méthode `downloadImage` dans `ImageDownloadService` est le point d'entrée. Voici sa logique simplifiée :
1.  Récupérer les informations de l'appareil avec `Device.getInfo()`.
2.  **Est-ce une plateforme web ou un émulateur ?**
    -   Si oui, appeler `downloadImageWeb()`.
    -   Si non (c'est un appareil mobile réel), continuer.
3.  **Vérifier les permissions** d'accès à la galerie avec `Camera.checkAndRequestPermissions()`.
    -   Si les permissions sont refusées, afficher un toast d'avertissement et arrêter.
4.  **Appeler `downloadImageToGallery()`**.
    -   Tenter de récupérer l'image avec `fetch`.
    -   Tenter d'utiliser l'API de partage native (`navigator.share`).
    -   Si le partage échoue, utiliser une méthode de secours (`saveImageFallback`).

### 4.2. Points de Débogage

1.  **Le téléchargement ne se déclenche pas du tout** :
    -   Vérifiez la console du navigateur pour des erreurs dans le composant `ImageViewerModalComponent`. La méthode `downloadImage()` de ce composant est appelée en premier.
    -   Placez un `console.log` au début de cette méthode pour vous assurer que le clic sur le bouton est bien enregistré.

2.  **Erreur "Image non accessible" ou "Impossible de récupérer l'image"** :
    -   Cela vient de l'appel `fetch(this.imageUrl)`. L'URL de l'image est probablement incorrecte, ou il y a un problème de **CORS** (Cross-Origin Resource Sharing). Le serveur qui héberge l'image doit autoriser les requêtes provenant de votre application.
    -   **Action** : Ouvrez l'onglet `Network` des DevTools, trouvez la requête `fetch` vers l'image et regardez son statut. Si c'est une erreur CORS, la console affichera une erreur très explicite.

3.  **Sur mobile, rien ne se passe après avoir cliqué** :
    -   Le problème vient très probablement des **permissions**. Le service tente de vérifier et de demander les permissions. Si l'utilisateur refuse, un toast "Permission refusée" devrait apparaître.
    -   **Action** : Allez dans les paramètres de votre téléphone, trouvez votre application, et vérifiez manuellement les permissions accordées. Essayez de les réinitialiser.
    -   Ajoutez des `console.log` dans la méthode `checkAndRequestPermissions` pour voir le statut des permissions avant et après la demande.

4.  **Le téléchargement fonctionne mais l'image n'apparaît pas dans la galerie** :
    -   Cela peut arriver si la méthode de secours (`saveImageFallback` ou `downloadImageWeb`) est utilisée. Cette méthode déclenche un téléchargement via le navigateur, qui peut enregistrer le fichier dans le dossier "Téléchargements" plutôt que dans la galerie de photos.
    -   La méthode `navigator.share` est plus fiable pour une intégration native. Si elle échoue, un `console.log` devrait apparaître avec le message "Erreur lors du partage, utilisation du fallback".

### 4.3. Logs à Surveiller

Plutôt que de chercher des logs qui n'existent pas, surveillez les `console.error` et ajoutez vos propres `console.log` aux points stratégiques :

-   Dans `ImageDownloadService`, au début de `downloadImage` pour voir l'URL et le nom du fichier.
-   Dans `checkAndRequestPermissions` pour voir le résultat de la demande de permission.
-   Dans les blocs `catch` pour voir les objets d'erreur complets (`console.error('Download error:', error)`).

En suivant cette approche structurée, vous serez en mesure de diagnostiquer la cause première du problème, qu'elle soit liée au réseau, aux permissions, à la plateforme ou à la logique applicative elle-même.