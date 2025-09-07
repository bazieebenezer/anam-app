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
    1.  Initialiser le thème au démarrage de l'application.
    2.  Lire et écrire la préférence de l'utilisateur dans le stockage persistant du navigateur (`localStorage`).
    3.  Appliquer le thème choisi en manipulant les classes CSS du `document.body`.
    4.  Écouter les changements de thème au niveau du système d'exploitation.
    5.  Gérer la rétrocompatibilité avec l'ancienne méthode de stockage.

-   **`SettingsPage` (`src/app/pages/settings/settings.page.ts`)** : Le composant d'interface qui permet à l'utilisateur de faire son choix. Il interagit avec le `ThemeService` pour lire l'état actuel et pour enregistrer les nouvelles préférences.

-   **CSS Variables (`src/theme/variables.scss`)** : Le cœur du système de thème d'Ionic. Ce fichier définit des variables CSS pour les couleurs, les polices, etc. Il contient une section spéciale, `body.dark`, qui redéfinit ces variables de couleur lorsque le thème sombre est actif.

## 3. Analyse Détaillée du `ThemeService`

### 3.1. Initialisation et Rétrocompatibilité

Au démarrage du service, la méthode `initTheme()` est appelée. Elle est conçue pour être robuste et gérer plusieurs cas de figure.

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

  // ... ajout de l'écouteur d'événement ...
}
```
-   **Lecture de la Préférence** : Le service tente d'abord de lire la nouvelle clé `theme` dans le `localStorage`. Si elle n'existe pas, il utilise `'system'` comme valeur par défaut.
-   **Logique de Rétrocompatibilité** : Le service vérifie ensuite la présence de l'ancienne clé `darkMode`. Si elle existe, cela signifie que l'utilisateur vient d'une version précédente de l'application. Le service convertit l'ancienne valeur (`'true'` ou `'false'`) en une nouvelle (`'dark'` ou `'light'`) et supprime l'ancienne clé pour finaliser la migration. Cette attention aux détails assure une transition transparente pour les utilisateurs existants.

### 3.2. Détection du Thème Système en Temps Réel

La fonctionnalité la plus avancée est la capacité de réagir en temps réel aux changements de thème du système d'exploitation. Ceci est réalisé grâce à l'API web `window.matchMedia`.

```typescript
// Dans initTheme()
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
prefersDark.addEventListener('change', (mediaQuery) => {
  const storedTheme = localStorage.getItem('theme') as Theme;
  if (storedTheme === 'system' || !storedTheme) {
    this.applyTheme(mediaQuery.matches);
  }
});
```
-   **`window.matchMedia('(prefers-color-scheme: dark)')`** : Cette API du navigateur permet de vérifier si le document correspond à une "media query" CSS. Ici, on vérifie si le système d'exploitation de l'utilisateur est actuellement en mode sombre.
-   **`addEventListener('change', ...)`** : On attache un écouteur d'événement. Cet événement se déclenchera automatiquement chaque fois que l'utilisateur changera le thème de son OS (par exemple, en passant du mode clair au mode sombre dans les paramètres de Windows ou d'Android), sans qu'il ait besoin de recharger l'application.
-   **Condition de Mise à Jour** : La mise à jour n'est appliquée que si le choix de l'utilisateur est `'system'`. Si l'utilisateur a forcé le thème `'light'` ou `'dark'`, l'application respecte ce choix et ignore le changement du système.

### 3.3. Application du Thème

La méthode `setTheme(theme: Theme)` enregistre le choix de l'utilisateur et appelle `applyTheme()`, qui est la méthode qui effectue le changement visuel.

```typescript
private applyTheme(isDark: boolean): void {
  this.darkMode$.next(isDark);
  document.body.classList.toggle('dark', isDark);
}
```
-   **`this.darkMode$.next(isDark)`** : Le service expose un `BehaviorSubject` `darkMode$` qui émet `true` ou `false`. D'autres composants pourraient potentiellement s'abonner à cet observable s'ils avaient besoin de connaître l'état actuel du thème pour une logique spécifique.
-   **`document.body.classList.toggle('dark', isDark)`** : C'est l'action clé. Elle ajoute ou supprime la classe `dark` de l'élément `<body>` de la page. C'est cette classe qui active les variables CSS du thème sombre dans `variables.scss`.

    ```css
    /* src/theme/variables.scss */
    body.dark {
      --ion-color-primary: #42a5f5;
      --ion-background-color: #121212;
      --ion-text-color: #ffffff;
      /* ... et toutes les autres variables de couleur pour le mode sombre */
    }
    ```

## 4. Interface Utilisateur dans `SettingsPage`

L'interface dans la page des paramètres est simple et intuitive, utilisant un groupe de boutons radio (`ion-radio-group`) pour présenter les trois options.

```html
<!-- settings.page.html -->
<ion-radio-group [value]="currentTheme" (ionChange)="themeChanged($event)">
  <ion-item>
    <ion-radio value="light">Clair</ion-radio>
  </ion-item>
  <ion-item>
    <ion-radio value="dark">Sombre</ion-radio>
  </ion-item>
  <ion-item>
    <ion-radio value="system">Système</ion-radio>
  </ion-item>
</ion-radio-group>
```
-   **`[value]="currentTheme"`** : Le `ion-radio-group` est lié à la variable `currentTheme` du composant, qui est initialisée avec la valeur du `ThemeService`. Cela garantit que le bon bouton radio est coché au chargement de la page.
-   **`(ionChange)="themeChanged($event)"`** : Lorsque l'utilisateur sélectionne une nouvelle option, l'événement `ionChange` est émis. La méthode `themeChanged` est appelée, et elle transmet la nouvelle valeur (`'light'`, `'dark'`, ou `'system'`) au `themeService.setTheme()`, complétant ainsi la boucle.

## 5. Conclusion et Améliorations Futures

La fonctionnalité de thème de l'application ANAM est une implémentation moderne, robuste et conviviale. Elle offre non seulement la personnalisation attendue par les utilisateurs, mais le fait de manière intelligente en s'intégrant avec les préférences du système d'exploitation et en assurant une rétrocompatibilité pour les utilisateurs existants.

**Améliorations futures possibles :**
-   **Plus de Thèmes** : On pourrait étendre le système pour inclure d'autres thèmes, comme un thème "Sépia" pour une lecture confortable, ou des thèmes à fort contraste pour une meilleure accessibilité.
-   **Personnalisation des Couleurs d'Accentuation** : Permettre à l'utilisateur de choisir la couleur primaire de l'application (la couleur des boutons, des en-têtes, etc.) parmi une palette prédéfinie. Cela pourrait être réalisé en définissant dynamiquement des styles CSS via JavaScript.
-   **Synchronisation via le Compte Utilisateur** : Pour les utilisateurs qui se connectent, on pourrait sauvegarder leur préférence de thème dans leur document utilisateur sur Firestore. Cela permettrait de synchroniser leur choix de thème sur tous leurs appareils.