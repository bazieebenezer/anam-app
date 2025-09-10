# Documentation de la Fonctionnalité de Thème : Clair, Sombre et Système

## 1. Introduction : L'Importance de la Personnalisation du Thème

La personnalisation de l'apparence d'une application est devenue une attente standard pour les utilisateurs modernes. Offrir le choix entre un thème clair et un thème sombre n'est plus un simple gadget esthétique, mais une fonctionnalité essentielle qui répond à plusieurs besoins concrets :

-   **Confort Visuel** : Un thème sombre réduit la fatigue oculaire dans des conditions de faible luminosité (par exemple, la nuit), tandis qu'un thème clair offre une meilleure lisibilité en plein jour.
-   **Accessibilité** : Pour certains utilisateurs malvoyants, un thème à fort contraste (souvent le mode sombre) peut rendre le texte et les éléments d'interface plus faciles à distinguer.
-   **Autonomie de la Batterie** : Sur les appareils dotés d'écrans OLED ou AMOLED (majoritaires sur les smartphones modernes), un thème sombre consomme nettement moins d'énergie, car les pixels noirs sont simplement éteints. Offrir un thème sombre peut donc prolonger l'autonomie de la batterie.
-   **Préférence Personnelle et Intégration au Système** : Les utilisateurs aiment personnaliser leur environnement numérique. De plus, les systèmes d'exploitation (Windows, macOS, Android, iOS) proposent désormais un réglage de thème à l'échelle du système. Une application qui respecte ce choix donne l'impression d'être mieux intégrée et plus "native".

La version précédente de l'application ANAM permettait déjà de choisir manuellement entre un thème clair et un thème sombre. Cette mise à jour majeure introduit l'option "Système", qui aligne automatiquement le thème de l'application sur celui du système d'exploitation, offrant ainsi une expérience utilisateur plus fluide et intelligente.

## 2. Architecture de la Gestion de Thème

La fonctionnalité est centralisée dans un service unique pour une gestion propre et maintenable de l'état du thème à travers toute l'application.

-   **`ThemeService` (`src/app/services/theme.service.ts`)** : Ce service injectable est le cerveau de la fonctionnalité. Il est responsable de :
    1.  Initialiser le thème au démarrage de l'application en tenant compte des anciennes versions.
    2.  Lire et écrire la préférence de l'utilisateur dans le stockage local (`localStorage`).
    3.  Appliquer le thème choisi en manipulant les classes CSS du `document.body`.
    4.  Écouter les changements de thème au niveau du système d'exploitation pour une réactivité en temps réel.
    5.  Fournir des méthodes pour définir et obtenir le thème actuel.

-   **`SettingsPage` (`src/app/pages/settings/settings.page.ts`)** : Le composant d'interface qui permet à l'utilisateur de faire son choix. Il interagit avec le `ThemeService` pour lire l'état actuel et pour enregistrer les nouvelles préférences.

-   **CSS Variables (`src/theme/variables.scss`)** : Le cœur du système de thème d'Ionic. Ce fichier définit des variables CSS pour les couleurs. Il contient une section spéciale, `.dark`, qui redéfinit ces variables de couleur lorsque le thème sombre est actif.

## 3. Analyse Détaillée du `ThemeService`

### 3.1. Initialisation et Détection du Thème Système

Au démarrage du service, la méthode `initTheme()` est appelée. Elle est conçue pour être robuste, gérer la rétrocompatibilité et s'adapter aux préférences du système.

```typescript
private initTheme(): void {
  let initialTheme = (localStorage.getItem('theme') as Theme) || 'system';

  // Backward compatibility
  const legacyDarkMode = localStorage.getItem('darkMode');
  if (legacyDarkMode) {
    initialTheme = legacyDarkMode === 'true' ? 'dark' : 'light';
    localStorage.removeItem('darkMode'); // On supprime l'ancienne clé
  }
  
  this.setTheme(initialTheme);

  // On écoute les changements de thème du système
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  prefersDark.addEventListener('change', (mediaQuery) => {
    const storedTheme = localStorage.getItem('theme') as Theme;
    // On applique le thème système uniquement si l'utilisateur a choisi 'system'
    if (storedTheme === 'system' || !storedTheme) {
      this.applyTheme(mediaQuery.matches);
    }
  });
}
```
-   **Lecture et Rétrocompatibilité** : Le service lit d'abord la clé `theme` du `localStorage`. S'il ne la trouve pas, il utilise `'system'` par défaut. Il assure ensuite la rétrocompatibilité en vérifiant l'ancienne clé `darkMode`, la convertit au nouveau format (`'dark'` ou `'light'`) et la supprime.
-   **Détection en Temps Réel** : Le service utilise `window.matchMedia('(prefers-color-scheme: dark)')` pour détecter si le système d'exploitation est en mode sombre. Crucialement, il attache un écouteur d'événement (`change`) qui se déclenche à chaque fois que l'utilisateur modifie le paramètre de son OS. Si le thème de l'application est réglé sur `'system'`, le thème visuel est mis à jour automatiquement, sans rechargement.

### 3.2. Application et Gestion du Thème

Le service utilise trois méthodes principales pour gérer le cycle de vie du thème.

-   **`setTheme(theme: Theme)`** : C'est la méthode appelée par l'interface utilisateur. Elle enregistre le choix (`'light'`, `'dark'`, ou `'system'`) dans le `localStorage`. Ensuite, elle détermine quel thème appliquer : si le choix est `'system'`, elle se base sur la préférence du système d'exploitation ; sinon, elle applique directement `'dark'` ou `'light'`.

    ```typescript
    setTheme(theme: Theme): void {
      localStorage.setItem('theme', theme);
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        this.applyTheme(prefersDark.matches);
      } else {
        this.applyTheme(theme === 'dark');
      }
    }
    ```

-   **`applyTheme(isDark: boolean)`** : Cette méthode privée effectue le changement visuel. Elle met à jour un `BehaviorSubject` pour que d'autres parties de l'application puissent réagir au changement, et surtout, elle ajoute ou supprime la classe `dark` sur le `<body>` du document, ce qui active les bonnes variables CSS.

    ```typescript
    private applyTheme(isDark: boolean): void {
      this.darkMode$.next(isDark);
      document.body.classList.toggle('dark', isDark);
    }
    ```

-   **`getTheme(): Theme`** : Une simple méthode d'accès qui permet aux composants, comme la page des paramètres, de récupérer le thème actuellement stocké dans le `localStorage`.

    ```typescript
    getTheme(): Theme {
      return (localStorage.getItem('theme') as Theme) || 'system';
    }
    ```

### 3.3. Variables CSS

Le changement de thème est rendu possible par la puissance des variables CSS d'Ionic. Le fichier `variables.scss` définit les couleurs pour le mode clair, et la classe `.dark` les redéfinit pour le mode sombre.

```css
/* src/theme/variables.scss */

/* Thème sombre */
.dark {
  --ion-color-primary: #2196f3;

  /* En mode sombre, la variable --ion-color-light est utilisée pour le fond */
  --ion-color-light: #121212;
  
  /* La couleur du texte est définie par la variable de contraste */
  --ion-color-light-contrast: #ffffff;

  /* ... et toutes les autres variables de couleur pour le mode sombre */
}
```

## 4. Interface Utilisateur dans `SettingsPage`

L'interface dans la page des paramètres utilise un `ion-radio-group` pour présenter les trois options. Le code a été modernisé pour utiliser les dernières syntaxes d'Angular et Ionic.

```html
<!-- src/app/pages/settings/settings.page.html -->
<div class="appearence">
  <h3>Thème</h3>
  <ion-radio-group [value]="currentTheme" (ionChange)="themeChanged($event)">
    <ion-item class="ion-no-padding">
      <ion-radio value="light" labelPlacement="start">Clair</ion-radio><br />
    </ion-item>
    <ion-item class="ion-no-padding">
      <ion-radio value="dark" labelPlacement="start">Sombre</ion-radio><br />
    </ion-item>
    <ion-item class="ion-no-padding">
      <ion-radio value="system" labelPlacement="start">Système</ion-radio
      ><br />
    </ion-item>
  </ion-radio-group>
</div>
```
-   **`[value]="currentTheme"`** : La valeur du groupe de radios est liée à la variable `currentTheme` du composant. Dans `ngOnInit`, cette variable est initialisée en appelant `themeService.getTheme()`, assurant que le bon bouton est coché au chargement.
-   **`(ionChange)="themeChanged($event)"`** : Quand l'utilisateur fait un choix, l'événement `ionChange` déclenche la méthode `themeChanged`. Celle-ci récupère la nouvelle valeur et la passe à `themeService.setTheme()`, ce qui met à jour le `localStorage` et l'apparence de l'application.

## 5. Conclusion et Améliorations Futures

La fonctionnalité de thème de l'application ANAM est une implémentation moderne, robuste et conviviale. Elle offre non seulement la personnalisation attendue par les utilisateurs, mais le fait de manière intelligente en s'intégrant avec les préférences du système d'exploitation et en assurant une rétrocompatibilité pour les utilisateurs existants.

**Améliorations futures possibles :**
-   **Plus de Thèmes** : On pourrait étendre le système pour inclure d'autres thèmes, comme un thème "Sépia" pour une lecture confortable, ou des thèmes à fort contraste pour une meilleure accessibilité.
-   **Personnalisation des Couleurs d'Accentuation** : Permettre à l'utilisateur de choisir la couleur primaire de l'application (la couleur des boutons, des en-têtes, etc.) parmi une palette prédéfinie.
-   **Synchronisation via le Compte Utilisateur** : Pour les utilisateurs qui se connectent, on pourrait sauvegarder leur préférence de thème dans leur document utilisateur sur Firestore. Cela permettrait de synchroniser leur choix de thème sur tous leurs appareils.
