# Documentation Complète et Approfondie du Système d'Authentification

## 1. Introduction et Architecture Générale

Le système d'authentification est la pierre angulaire de la sécurité et de la personnalisation de l'application Météo Burkina. Il est conçu pour gérer l'identité des utilisateurs, sécuriser l'accès aux différentes sections de l'application, et lier chaque utilisateur à ses données et rôles spécifiques dans la base de données. Ce document fournit une analyse technique exhaustive de son implémentation, met en lumière une faille de sécurité critique existante et propose des solutions détaillées pour la corriger.

L'architecture repose sur une intégration profonde avec **Firebase**, en utilisant plusieurs de ses services de manière coordonnée :

-   **Firebase Authentication** : Le service principal pour la gestion des sessions utilisateur. Il gère la création de comptes par email/mot de passe et l'authentification via des fournisseurs tiers comme Google, en s'occupant de la complexité des flux OAuth 2.0.
-   **Firestore** : La base de données NoSQL utilisée comme "source de vérité" pour les profils utilisateur étendus. Pour chaque utilisateur créé dans Firebase Authentication, un document correspondant est maintenu dans une collection `users` de Firestore. Ce document stocke des informations qui ne font pas partie du modèle d'authentification de base, comme les rôles (`isAdmin`, `isInstitution`).
-   **AngularFire (`@angular/fire`)** : La bibliothèque officielle pour l'intégration d'Angular avec Firebase. Elle fournit des outils puissants, notamment des observables RxJS, pour gérer de manière réactive l'état d'authentification et les données en temps réel de Firestore.

La logique applicative est structurée de manière modulaire pour assurer la séparation des préoccupations :

-   **`AuthService`**: Un service Angular central qui encapsule **toute** la logique d'interaction avec Firebase. C'est le seul endroit de l'application qui communique directement avec les services d'authentification et la collection `users` de Firestore. Cette centralisation rend le code plus maintenable et plus facile à déboguer.
-   **Pages d'Authentification (`signin`, `signup`)**: Des composants Angular dédiés qui fournissent l'interface utilisateur pour la connexion et l'inscription. Ils utilisent les `ReactiveFormsModule` d'Angular pour une gestion robuste des formulaires.
-   **Gardiens de Route (`AuthGuard`, `AdminGuard`)**: Des mécanismes de contrôle d'accès d'Angular. Un `AuthGuard` est destiné à protéger les routes qui ne devraient être accessibles qu'aux utilisateurs connectés. Un `AdminGuard` (à créer) est nécessaire pour protéger les zones réservées aux administrateurs.
-   **Initialisation (`main.ts`)**: Le point d'entrée de l'application où Firebase est configuré et ses services sont fournis à l'ensemble de l'application via l'injection de dépendances d'Angular.

## 2. Configuration et Initialisation de Firebase

Une configuration correcte est la première étape indispensable.

### 2.1. Fichiers d'Environnement

Les informations de configuration de votre projet Firebase (clés API, ID de projet, etc.) sont stockées dans les fichiers d'environnement d'Angular pour séparer la configuration du code.

-   `src/environments/environment.ts` (pour le développement local)
-   `src/environments/environment.prod.ts` (pour la production)

```typescript
// Exemple de configuration
export const environment = {
  production: false,
  firebase: {
    apiKey: 'VOTRE_API_KEY',
    authDomain: 'VOTRE_AUTH_DOMAIN',
    projectId: 'VOTRE_PROJECT_ID',
    storageBucket: 'VOTRE_STORAGE_BUCKET',
    messagingSenderId: 'VOTRE_MESSAGING_SENDER_ID',
    appId: 'VOTRE_APP_ID'
  }
};
```

### 2.2. Initialisation dans `main.ts`

L'application utilise l'approche moderne de `bootstrapApplication` avec des `providers` pour l'initialisation.

```typescript
// src/main.ts
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';

bootstrapApplication(AppComponent, {
  providers: [
    // ... autres providers
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    // ...
  ],
});
```
-   `provideFirebaseApp`: Initialise la connexion à Firebase.
-   `provideFirestore`: Fournit une instance du service Firestore.
-   `provideAuth`: Fournit une instance du service Firebase Authentication.

Cette configuration via l'injection de dépendances garantit que les services Firebase sont des singletons disponibles dans toute l'application.

## 3. Le Cœur du Système : `AuthService`

Le service `src/app/services/auth/auth.service.ts` est la pièce maîtresse de l'authentification.

### 3.1. Suivi de l'État de l'Utilisateur : `currentUser$`

Le service expose un observable public, `currentUser$`, qui est la source de vérité pour l'état de l'utilisateur connecté.

```typescript
export interface AppUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isAdmin?: boolean;
  isInstitution?: boolean;
}

// ... dans AuthService
public currentUser$: Observable<AppUser | null>;
```

Cet observable émet un objet `AppUser` complet, fusionnant les informations de Firebase Auth avec les rôles de Firestore, ou `null` si personne n'est connecté.

**Implémentation détaillée de `currentUser$` :**
```typescript
this.currentUser$ = authState(this.auth).pipe(
  switchMap(user => {
    if (user) {
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      // Utilise docData pour une écoute en temps réel
      return docData(userDocRef, { idField: 'uid' }).pipe(
        map(userDoc => {
          if (userDoc) {
            return userDoc as AppUser;
          } else {
            // Crée un profil de base si inexistant
            const newUser: AppUser = { uid: user.uid, email: user.email || '', displayName: user.displayName || '', photoURL: user.photoURL || '' };
            setDoc(userDocRef, newUser, { merge: true });
            return newUser;
          }
        })
      );
    } else {
      return of(null);
    }
  })
);
```
**Analyse de l'implémentation (Mise à jour recommandée) :**
L'implémentation actuelle utilise `getDoc`, qui effectue une lecture unique. Cela signifie que si le rôle d'un utilisateur (`isAdmin`, par exemple) est modifié dans la base de données, l'application ne le saura pas avant la prochaine connexion. Pour une réactivité complète, il est **fortement recommandé** de remplacer `from(getDoc(userDocRef))` par `docData(userDocRef, { idField: 'uid' })`. `docData` retourne un observable qui écoute les changements en temps réel, garantissant que l'interface utilisateur reflète toujours l'état le plus récent du profil utilisateur.

### 3.2. Méthodes d'Authentification

-   **`loginWithEmailAndPassword(email, password)`**: Utilise `signInWithEmailAndPassword` de Firebase.
-   **`createUserWithEmailAndPassword(email, password)`**: Utilise `createUserWithEmailAndPassword`. Un `tap` appelle `updateUserData` pour créer le document Firestore associé.
-   **`loginWithGoogle()`**: Gère la connexion Google de manière multiplateforme. Sur le web, elle utilise `signInWithRedirect` pour éviter les problèmes de bloqueurs de pop-up. Sur mobile (via Capacitor), elle utilise `signInWithPopup`, qui ouvre une vue web native pour le flux OAuth de Google.
-   **`logout()`**: Appelle `this.auth.signOut()` et se désabonne des topics de notification FCM spécifiques à l'utilisateur.

## 4. Faille de Sécurité Critique : Absence de Gardiens de Route Actifs

L'analyse du code révèle une faille de sécurité majeure : **aucune route n'est actuellement protégée par un gardien d'authentification ou de rôle.**

-   Le fichier `src/app/guards/auth.guard.ts` est **entièrement commenté et donc inactif**.
-   Le fichier de routage `src/app/app.routes.ts` n'applique **aucun garde** pour vérifier si un utilisateur est connecté ou s'il a le rôle d'administrateur.

**Conséquence :** La page "Ajouter" (`/tabs/add`), qui est destinée à la création de bulletins et d'événements par les administrateurs, est accessible par **n'importe quel utilisateur** ayant simplement terminé l'onboarding. Un utilisateur standard peut naviguer vers cette URL et accéder à des fonctionnalités d'administration.

### 4.1. Solution : Activer `AuthGuard` et Créer `AdminGuard`

Il est impératif de corriger cette faille. Voici la procédure détaillée.

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
    take(1), // Prend la première valeur émise pour éviter de garder le garde actif
    map(user => {
      if (user) {
        return true; // Utilisateur connecté, autorise l'accès
      } else {
        // Utilisateur non connecté, redirection vers la page de connexion
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
        return true; // Utilisateur est un admin, autorise l'accès
      } else {
        // Pas un admin, redirection vers la page d'accueil
        router.navigate(['/tabs/home']);
        return false;
      }
    })
  );
};
```
*Note :* Contrairement à `authGuard`, `adminGuard` n'utilise pas `take(1)`. Cela permet au garde de réévaluer l'accès si le statut `isAdmin` de l'utilisateur change en temps réel (à condition d'utiliser `docData` dans `AuthService`).

#### Étape 3 : Appliquer les Gardiens aux Routes

Modifiez `src/app/app.routes.ts` pour appliquer ces gardiens.

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { onboardingGuard } from './guards/onboarding.guard';
import { authGuard } from './guards/auth.guard';       // Importer le garde
import { adminGuard } from './guards/admin.guard';       // Importer le garde

export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    canActivate: [onboardingGuard, authGuard], // Protège toutes les pages internes
    children: [
      // ... autres routes enfants
      {
        path: 'add',
        loadComponent: () => import('./pages/add/add.page').then((m) => m.AddPage),
        canActivate: [adminGuard] // Protège spécifiquement la page d'ajout
      },
      // ...
    ],
  },
  // ... autres routes
];
```

## 5. Conclusion et Recommandations

Le système d'authentification actuel est fonctionnel pour la gestion des comptes et des profils, mais il présente une **faille de sécurité critique** due à l'absence de gardiens de route actifs. Cette lacune expose des fonctionnalités d'administration à tous les utilisateurs.

**Actions Impératives :**
1.  **Implémenter les gardiens `authGuard` et `adminGuard`** comme décrit ci-dessus.
2.  **Appliquer ces gardiens** aux routes appropriées dans `app.routes.ts` pour sécuriser l'application.
3.  **Mettre à jour `AuthService` pour utiliser `docData`** au lieu de `getDoc` afin d'assurer une réactivité en temps réel des changements de rôle, ce qui renforce l'efficacité du `adminGuard`.

En corrigeant cette faille, l'application garantira que seuls les utilisateurs authentifiés peuvent accéder au contenu privé et que seuls les administrateurs peuvent accéder aux fonctionnalités de gestion, restaurant ainsi l'intégrité et la sécurité du système.
