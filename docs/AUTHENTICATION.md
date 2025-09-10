# Documentation Complète et Approfondie du Système d'Authentification

## 1. Introduction et Architecture Générale

Le système d'authentification est la pierre angulaire de la sécurité et de la personnalisation de l'application Météo Burkina. Il est conçu pour gérer l'identité des utilisateurs, sécuriser l'accès aux différentes sections et lier chaque utilisateur à ses données et rôles spécifiques.

L'architecture repose sur une intégration profonde avec **Firebase** et une approche hybride pour l'authentification Google, garantissant une expérience utilisateur optimale sur toutes les plateformes.

-   **Firebase Authentication** : Service principal pour la gestion des sessions. Il gère la création de comptes par email/mot de passe et sert de backend pour l'authentification Google.
-   **`@capgo/capacitor-social-login`** : Un plugin Capacitor qui gère l'interaction native avec le SDK Google Sign-In sur Android et iOS. Cela permet une expérience de connexion fluide et intégrée à l'écosystème de l'appareil, plutôt que de reposer sur une vue web.
-   **Firestore** : Base de données NoSQL utilisée comme source de vérité pour les profils utilisateur étendus (rôles `isAdmin`, `isInstitution`, etc.).
-   **AngularFire (`@angular/fire`)** : Bibliothèque officielle pour l'intégration d'Angular avec Firebase, fournissant des outils réactifs (observables RxJS) pour gérer l'état d'authentification et les données.

La logique est centralisée dans `AuthService` pour une meilleure maintenabilité, tandis que les composants de l'interface utilisateur (`signin`, `signup`) et les gardiens de route (`AuthGuard`, `AdminGuard`) complètent le système.

## 2. Configuration et Initialisation

Une configuration correcte est la première étape indispensable.

### 2.1. Fichiers d'Environnement

Les clés du projet Firebase sont stockées dans `src/environments/environment.ts` et `src/environments/environment.prod.ts`.

### 2.2. Configuration de l'Authentification Google

La connexion Google nécessite une configuration à plusieurs niveaux :

1.  **Console Google Cloud** :
    *   Un **ID client OAuth de type "Application Web"** doit être créé. Cet ID (`webClientId`) est crucial, car il est utilisé à la fois pour l'authentification web et comme identifiant serveur pour la plateforme Android.
    *   Un **ID client OAuth de type "Android"** doit également être créé, en utilisant le nom du package de l'application et l'empreinte de certificat SHA-1. Cet ID est utilisé pour configurer le projet Android dans la console Google mais n'est pas directement utilisé dans le code de l'application.

2.  **Configuration dans le projet Ionic/Angular** :
    *   **`capacitor.config.ts`** : Le plugin `@capgo/capacitor-social-login` est configuré ici, en spécifiant uniquement le `webClientId`.

        ```typescript
        // capacitor.config.ts
        plugins: {
          CapacitorSocialLogin: {
            google: {
              webClientId: 'VOTRE_WEB_CLIENT_ID.apps.googleusercontent.com',
              scopes: ['profile', 'email'],
              forceCodeForRefreshToken: true,
            },
          },
        },
        ```

    *   **`android/app/src/main/res/values/strings.xml`** : Le `webClientId` doit être ajouté comme `server_client_id` pour que le SDK natif Google puisse s'authentifier auprès de votre backend Firebase.

        ```xml
        <!-- android/app/src/main/res/values/strings.xml -->
        <string name="server_client_id">VOTRE_WEB_CLIENT_ID.apps.googleusercontent.com</string>
        ```

### 2.3. Initialisation dans `app.component.ts`

Au démarrage de l'application, le plugin social est initialisé s'il s'agit d'une plateforme native.

```typescript
// src/app/app.component.ts
import { SocialLogin } from '@capgo/capacitor-social-login';
import { Capacitor } from '@capacitor/core';

// ...
async initializeApp() {
  if (Capacitor.isNativePlatform()) {
    await SocialLogin.initialize({
      google: {
        webClientId: 'VOTRE_WEB_CLIENT_ID.apps.googleusercontent.com',
      },
    });
  }
  // ...
}
```

## 3. Le Cœur du Système : `AuthService`

Le service `src/app/services/auth/auth.service.ts` est la pièce maîtresse de l'authentification.

### 3.1. Suivi de l'État de l'Utilisateur : `currentUser$`

Le service expose un observable public, `currentUser$`, qui est la source de vérité pour l'état de l'utilisateur connecté. Il fusionne les données de Firebase Auth et de Firestore en temps réel grâce à l'utilisation de `docData` de AngularFire, garantissant que les changements de rôle sont immédiatement reflétés dans l'application.

### 3.2. Méthode `loginWithGoogle()` : Une Approche Hybride

La méthode `loginWithGoogle` est l'exemple parfait de l'approche multiplateforme de l'application.

```typescript
// src/app/services/auth/auth.service.ts
loginWithGoogle() {
  if (Capacitor.isNativePlatform()) {
    // Flux Natif (Android/iOS)
    return from(SocialLogin.login({ provider: 'google', options: {} })).pipe(
      switchMap((result: any) => {
        if (result.result && result.result.idToken) {
          const credential = GoogleAuthProvider.credential(result.result.idToken);
          return from(signInWithCredential(this.auth, credential));
        } else {
          // Gérer l'erreur
        }
      }),
      tap(credential => { this.updateUserData(credential.user); })
    );
  } else {
    // Flux Web
    return from(signInWithPopup(this.auth, new GoogleAuthProvider())).pipe(
      tap(credential => { this.updateUserData(credential.user); })
    );
  }
}
```

-   **Sur une plateforme native** :
    1.  `SocialLogin.login()` est appelé, ce qui déclenche le SDK natif de Google.
    2.  L'utilisateur se connecte via son compte Google directement sur l'appareil.
    3.  Le plugin retourne un `idToken`.
    4.  Ce `idToken` est utilisé pour créer une `AuthCredential` Firebase.
    5.  `signInWithCredential` connecte l'utilisateur à Firebase en utilisant ce credential, sans que l'utilisateur ait à se reconnecter.

-   **Sur le web** :
    1.  La méthode standard `signInWithPopup` de Firebase est utilisée, ouvrant une fenêtre pop-up pour le flux de connexion Google.

Cette approche offre la meilleure expérience utilisateur possible sur chaque plateforme.

## 4. Faille de Sécurité Critique : Absence de Gardiens de Route Actifs

L'analyse du code révèle une faille de sécurité majeure : **aucune route n'est actuellement protégée par un gardien d'authentification ou de rôle.**

-   Le fichier `src/app/guards/auth.guard.ts` est **entièrement commenté et donc inactif**.
-   Le fichier de routage `src/app/app.routes.ts` n'applique **aucun garde** pour vérifier si un utilisateur est connecté ou s'il a le rôle d'administrateur.

**Conséquence :** La page "Ajouter" (`/tabs/add`), qui est destinée à la création de bulletins et d'événements par les administrateurs, est accessible par **n'importe quel utilisateur** ayant simplement terminé l'onboarding.

### 4.1. Solution : Activer `AuthGuard` et Créer `AdminGuard`

Il est impératif de corriger cette faille. La procédure détaillée ci-dessous doit être appliquée.

#### Étape 1 : Réactiver et Moderniser `AuthGuard`

Créez/modifiez le fichier `src/app/guards/auth.guard.ts` pour utiliser une fonction de garde moderne.

```typescript
// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      } else {
        router.navigate(['/signin']);
        return false;
      }
    })
  );
};
```

#### Étape 2 : Créer un `AdminGuard`

Créez un nouveau fichier `src/app/guards/admin.guard.ts` pour protéger les routes d'administration.

```typescript
// src/app/guards/admin.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { map } from 'rxjs/operators';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    map(user => {
      if (user && user.isAdmin) {
        return true;
      } else {
        router.navigate(['/tabs/home']);
        return false;
      }
    })
  );
};
```

#### Étape 3 : Appliquer les Gardiens aux Routes

Modifiez `src/app/app.routes.ts` pour appliquer ces gardiens.

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { onboardingGuard } from './guards/onboarding.guard';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    canActivate: [onboardingGuard, authGuard], // Protège toutes les pages internes
    children: [
      // ...
      {
        path: 'add',
        loadComponent: () => import('./pages/add/add.page').then((m) => m.AddPage),
        canActivate: [adminGuard] // Protège spécifiquement la page d'ajout
      },
      // ...
    ],
  },
  // ...
];
```

## 5. Conclusion et Recommandations

Le système d'authentification est maintenant robuste et optimisé pour une expérience multiplateforme. Cependant, il présente une **faille de sécurité critique** due à l'absence de gardiens de route actifs.

**Actions Impératives :**
1.  **Implémenter les gardiens `authGuard` et `adminGuard`** comme décrit ci-dessus.
2.  **Appliquer ces gardiens** aux routes appropriées dans `app.routes.ts` pour sécuriser l'application.

En corrigeant cette faille, l'application garantira que seuls les utilisateurs authentifiés peuvent accéder au contenu privé et que seuls les administrateurs peuvent accéder aux fonctionnalités de gestion.