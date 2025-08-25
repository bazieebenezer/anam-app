# Fonctionnalité de Thème : Clair, Sombre et Système

Ce document détaille l'implémentation de la fonctionnalité de gestion du thème, qui permet à l'utilisateur de choisir entre un thème clair, un thème sombre, ou de synchroniser le thème avec les paramètres de son appareil.

## Contexte

La version précédente de l'application permettait à l'utilisateur de choisir manuellement entre un thème clair et un thème sombre. Cependant, le thème ne s'adaptait pas automatiquement aux préférences du système d'exploitation de l'utilisateur (Windows, macOS, Android, iOS).

Cette mise à jour introduit l'option "Système", qui offre une expérience utilisateur plus fluide et intégrée.

## Modifications apportées

### 1. `theme.service.ts`

Le service de gestion du thème a été revu pour intégrer la logique de détection du thème système.

#### Ajouts

-   **Type `Theme`**: Un nouveau type a été ajouté pour représenter les trois états possibles : `'light'`, `'dark'`, et `'system'`.
-   **Méthode `initTheme()`**: Cette méthode est appelée au démarrage du service pour initialiser le thème. Elle vérifie la préférence de l'utilisateur dans le `localStorage` et, si aucune n'est définie, utilise le thème du système par défaut.
-   **Méthode `setTheme(theme: Theme)`**: Cette nouvelle méthode publique permet de changer le thème. Elle sauvegarde le choix de l'utilisateur dans le `localStorage`.
-   **Méthode `getTheme(): Theme`**: Retourne le thème actuellement sélectionné.
-   **Écouteur d'événement `prefers-color-scheme`**: Le service écoute désormais les changements de thème du système d'exploitation et met à jour l'interface de l'application en temps réel si l'option "Système" est sélectionnée.
-   **Rétrocompatibilité**: Une logique a été ajoutée pour migrer en douceur les utilisateurs de l'ancienne configuration (`localStorage` avec la clé `darkMode`) vers la nouvelle (clé `theme`), sans perdre leur préférence de thème.

#### Extrait de code (`theme.service.ts`)

```typescript
// ...
  private initTheme(): void {
    let initialTheme = (localStorage.getItem('theme') as Theme) || 'system';

    // Backward compatibility
    const legacyDarkMode = localStorage.getItem('darkMode');
    if (legacyDarkMode) {
      initialTheme = legacyDarkMode === 'true' ? 'dark' : 'light';
      localStorage.removeItem('darkMode');
    }
    
    this.setTheme(initialTheme);

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDark.addEventListener('change', (mediaQuery) => {
      const storedTheme = localStorage.getItem('theme') as Theme;
      if (storedTheme === 'system' || !storedTheme) {
        this.applyTheme(mediaQuery.matches);
      }
    });
  }

  setTheme(theme: Theme): void {
    localStorage.setItem('theme', theme);
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      this.applyTheme(prefersDark.matches);
    } else {
      this.applyTheme(theme === 'dark');
    }
  }
// ...
```

### 2. `settings.page.html`

L'interface de la page des paramètres a été mise à jour pour inclure la nouvelle option de thème.

#### Ajouts

-   **Bouton radio "Système"**: Un troisième bouton radio a été ajouté pour permettre à l'utilisateur de sélectionner le mode "Système".

#### Extrait de code (`settings.page.html`)

```html
<!-- ... -->
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
        <ion-radio value="system" labelPlacement="start">Système</ion-radio><br />
      </ion-item>
    </ion-radio-group>
  </div>
<!-- ... -->
```

### 3. `settings.page.ts`

La logique du composant de la page des paramètres a été adaptée pour interagir avec le `ThemeService` mis à jour.

#### Modifications

-   La variable `currentTheme` peut maintenant être de type `'light' | 'dark' | 'system'`.
-   Au chargement de la page (`ngOnInit`), la valeur de `currentTheme` est initialisée avec la valeur retournée par `themeService.getTheme()`.
-   La méthode `themeChanged($event)` appelle maintenant `themeService.setTheme()` avec la nouvelle valeur sélectionnée par l'utilisateur.

#### Extrait de code (`settings.page.ts`)

```typescript
// ...
export class SettingsPage implements OnInit {
  currentTheme: Theme = 'system';
  // ...

  ngOnInit() {
    // ...
    this.currentTheme = this.themeService.getTheme();
  }

  // ...

  themeChanged(event: any) {
    const selectedTheme = event.detail.value as Theme;
    this.themeService.setTheme(selectedTheme);
  }
// ...
}
```

## Justification des changements

Ces modifications étaient nécessaires pour offrir une expérience utilisateur plus moderne et attendue. La détection automatique du thème système est une fonctionnalité standard dans de nombreuses applications aujourd'hui.

L'ajout de l'option "Système" explicite donne à l'utilisateur un contrôle total sur l'apparence de l'application, tout en conservant la possibilité de forcer un thème spécifique si désiré.

La gestion de la rétrocompatibilité assure une transition transparente pour les utilisateurs existants, sans qu'ils aient à reconfigurer leur thème préféré après la mise à jour.
