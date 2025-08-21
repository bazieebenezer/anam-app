# Processus d'authentification

Ce document explique le processus d'authentification implémenté dans l'application.

## Installation

L'authentification utilise Firebase. Pour l'installer, exécutez les commandes suivantes :

```bash
npm install firebase @angular/fire --legacy-peer-deps
```

## Configuration

1.  **Ajoutez votre configuration Firebase dans les fichiers d'environnement :**

    *   `src/environments/environment.ts`
    *   `src/environments/environment.prod.ts`

    ```typescript
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

2.  **Initialisez Firebase dans `src/main.ts` :**

    ```typescript
    import { bootstrapApplication } from '@angular/platform-browser';
    import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
    import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

    import { routes } from './app/app.routes';
    import { AppComponent } from './app/app.component';
    import { environment } from './environments/environment';

    import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
    import { provideAuth, getAuth } from '@angular/fire/auth';

    bootstrapApplication(AppComponent, {
      providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideIonicAngular(),
        provideRouter(routes, withPreloading(PreloadAllModules)),
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAuth(() => getAuth()),
      ],
    });
    ```

## AuthService

Le service `src/app/services/auth/auth.service.ts` gère toute la logique d'authentification.

*   `isAuthenticated$`: Un observable qui émet l'état d'authentification de l'utilisateur.
*   `loginWithEmailAndPassword(email, password)`: Connecte un utilisateur avec son email et son mot de passe.
*   `loginWithGoogle()`: Connecte un utilisateur avec son compte Google.
*   `createUserWithEmailAndPassword(email, password)`: Crée un nouvel utilisateur avec son email et son mot de passe.
*   `logout()`: Déconnecte l'utilisateur actuel.

## Pages de connexion et d'inscription

Les pages `signin` et `signup` dans `src/app/pages/auth` utilisent le `AuthService` pour authentifier les utilisateurs. Elles affichent également des messages toast pour informer l'utilisateur du succès ou de l'échec de la tentative de connexion/inscription.

## AuthGuard

Le `src/app/guards/auth.guard.ts` protège les routes de l'application. Si un utilisateur non authentifié tente d'accéder à une route protégée, il est redirigé vers la page de connexion.

## Déconnexion

La page des paramètres (`src/app/pages/settings`) contient un bouton de déconnexion qui appelle la méthode `logout` du `AuthService`.

## Interface utilisateur conditionnelle

L'interface utilisateur de la page des paramètres s'adapte en fonction de l'état d'authentification de l'utilisateur. Les boutons "Changer de mot de passe" et "Se déconnecter" ne sont affichés que si un utilisateur est connecté. Le bouton "Créer un compte" n'est affiché que si aucun utilisateur n'est connecté.
