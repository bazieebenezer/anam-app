# Implémentation du Chargement Squelette

## Introduction
Le chargement squelette est une technique utilisée pour améliorer la perception de performance d'une application en affichant une version simplifiée, filaire de l'interface utilisateur pendant le chargement du contenu. Cela fournit un retour visuel immédiat à l'utilisateur, indiquant que le contenu est en cours de chargement, plutôt que d'afficher un écran vide ou un indicateur de chargement traditionnel.

Ce document détaille l'implémentation du chargement squelette dans la page `home` et discute de son absence et de son implémentation potentielle dans la page `event-details`.

## Implémentation du Squelette sur la Page d'Accueil

La page d'accueil (`home.page.ts`, `home.page.html`, `home.page.scss`) utilise le chargement squelette pour améliorer l'expérience utilisateur lors de la récupération des données de bulletin.

### Logique (`home.page.ts`)

Le drapeau booléen `isLoading` dans `home.page.ts` contrôle la visibilité des chargeurs squelettes.
-   `isLoading` est initialisé à `true` lorsque le composant commence à récupérer des données (dans `ngOnInit`).
-   Une fois la récupération des données terminée et les `bulletins` chargés, `isLoading` est défini sur `false`, masquant les squelettes et affichant le contenu réel.

```typescript
// home.page.ts
export class HomePage implements OnInit {
  isLoading: boolean = true; // Initialisé à true

  async ngOnInit() {
    this.isLoading = true; // S'assurer qu'il est true au début de la récupération des données
    // ... logique de récupération des données ...
    this.bulletinService.getPublications().subscribe((bulletins) => {
      // ... traitement des données ...
      this.isLoading = false; // Défini sur false lorsque les données sont chargées
    });
  }
}
```

### Modèle (`home.page.html`)

Le modèle `home.page.html` utilise les directives `@if` et `@for` d'Angular pour rendre conditionnellement les cartes squelettes.

-   **Rendu Conditionnel :**
    ```html
    <!-- Squelettes de chargement -->
    @if (isLoading) {
      @for (item of [1, 2, 3]; track item) {
        <ion-card class="skeleton-card">
          <!-- Contenu du squelette ici -->
        </ion-card>
      }
    }

    <!-- Contenu réel -->
    @if (!isLoading) {
      @for (bulletin of filteredBulletins; track bulletin.id) {
        <ion-card>
          <!-- Contenu réel du bulletin ici -->
        </ion-card>
      }
    }
    ```
    Cette structure garantit que soit les chargeurs squelettes, soit les cartes de bulletin réelles sont affichés, mais jamais les deux simultanément. Trois cartes squelettes sont rendues pour simuler le chargement de plusieurs éléments.

-   **Structure de la Carte Squelette (`ion-card.skeleton-card`) :**
    Chaque carte squelette imite la mise en page d'une carte de bulletin réelle, en utilisant des wrappers `div` et des composants `ion-skeleton-text`.

    ```html
    <ion-card class="skeleton-card">
      <!-- Squelette d'Image -->
      <div class="skeleton-image-wrapper">
        <ion-skeleton-text [animated]="true"></ion-skeleton-text>
      </div>

      <div class="header">
        <ion-card-header>
          <!-- Squelette de Titre -->
          <h3 class="title">
            <div class="skeleton-title-wrapper">
              <ion-skeleton-text [animated]="true"></ion-skeleton-text>
            </div>
          </h3>

          <!-- Squelette de Sous-titre -->
          <span class="subtitle">
            <div class="skeleton-subtitle-wrapper">
              <ion-skeleton-text [animated]="true"></ion-skeleton-text>
            </div>
          </span>
        </ion-card-header>
      </div>

      <!-- Squelettes de Contenu (Lignes de Description) -->
      <ion-card-content>
        <div class="skeleton-line-wrapper">
          <ion-skeleton-text [animated]="true"></ion-skeleton-text>
        </div>
        <div class="skeleton-line-wrapper short">
          <ion-skeleton-text [animated]="true"></ion-skeleton-text>
        </div>
        <div class="skeleton-line-wrapper shortest">
          <ion-skeleton-text [animated]="true"></ion-skeleton-text>
        </div>
      </ion-card-content>
    </ion-card>
    ```
    Chaque `ion-skeleton-text` a `[animated]="true"` pour un effet de pulsation. Les wrappers `div` (`skeleton-image-wrapper`, `skeleton-title-wrapper`, etc.) sont cruciaux pour contrôler les dimensions et la disposition des éléments squelettes.

### Style (`home.page.scss`)

Le fichier `home.page.scss` fournit le style des composants squelettes, garantissant qu'ils correspondent visuellement à la mise en page et aux dimensions du contenu réel.

-   **`.skeleton-card` :** Style la carte squelette globale, y compris `border-radius`, `box-shadow` et `margin` pour correspondre à la vraie `ion-card`. `overflow: hidden` est important pour appliquer `border-radius` aux éléments enfants.

-   **`.skeleton-image-wrapper` :**
    ```scss
    .skeleton-image-wrapper {
      width: 100%;
      height: 300px; /* Correspond à la hauteur attendue de l'image réelle */
      background: var(--ion-color-very-light-gray); /* Arrière-plan de l'espace réservé */
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 12px 12px 0 0; /* Rayon de bordure supérieur pour correspondre à l'image */

      ion-skeleton-text {
        width: 100%;
        height: 100%;
        border-radius: 0; /* Réinitialiser le rayon de bordure pour le texte squelette lui-même */
      }
    }
    ```
    Ce wrapper garantit que le squelette d'image prend toute la largeur et une hauteur fixe, avec le `ion-skeleton-text` remplissant son conteneur.

-   **Squelettes de Texte (`.skeleton-title-wrapper`, `.skeleton-subtitle-wrapper`, `.skeleton-line-wrapper`) :**
    Ces wrappers définissent la `width` et la `height` pour les squelettes de texte, les faisant apparaître comme des espaces réservés réalistes pour le contenu textuel. Le `ion-skeleton-text` à l'intérieur prend `100%` des dimensions de son parent.e.

    ```scss
    .title {
      .skeleton-title-wrapper {
        width: 80%; /* Largeur exemple, ajuster si nécessaire */
        height: 20px; /* Hauteur exemple, ajuster si nécessaire */
        ion-skeleton-text { /* ... */ }
      }
    }

    .subtitle {
      .skeleton-subtitle-wrapper {
        width: 60%; /* Largeur exemple, ajuster si nécessaire */
        height: 14px; /* Hauteur exemple, ajuster si nécessaire */
        ion-skeleton-text { /* ... */ }
      }
    }

    ion-card-content {
      .skeleton-line-wrapper {
        height: 16px; /* Hauteur exemple, ajuster si nécessaire */
        margin: 8px 0;
        ion-skeleton-text { /* ... */ }

        &.short {
          width: 90%; /* Ligne plus courte */
        }
        &.shortest {
          width: 70%; /* Ligne encore plus courte */
        }
      }
    }
    ```
    Les largeurs variables (`100%`, `90%`, `70%`) pour les lignes de description (`skeleton-line-wrapper`, `.short`, `.shortest`) simulent un flux de texte naturel.

## Implémentation du Squelette sur la Page de Détails de l'Événement

Actuellement, la page `event-details` (`event-details.page.ts`, `event-details.page.html`, `event-details.page.scss`) n'a **pas** de chargement squelette implémenté. Lorsqu'un événement est en cours de récupération, la page reste vide jusqu'à ce que les données soient entièrement chargées et rendues.

### Recommandation

Pour offrir une expérience utilisateur cohérente et améliorée à travers l'application, il est fortement recommandé d'implémenter le chargement squelette pour la page `event-details`. Cela impliquerait :

1.  **Ajouter un drapeau `isLoading`** à `event-details.page.ts`, similaire à `home.page.ts`.
2.  **Modifier `event-details.page.html`** pour afficher conditionnellement des espaces réservés squelettes pour :
    *   L'image principale de l'événement (imitant sa `height: 400px`).
    *   Le titre de l'événement (`h2`).
    *   La date de l'événement (`span`).
    *   La description de l'événement (`p`).
    *   Le carrousel d'images (`swiper-container`).
    *   Le titre "Liens utiles" (`h3`) et les liens individuels (`li`).
3.  **Ajouter les styles correspondants** à `event-details.page.scss` pour ces éléments squelettes, en garantissant que leurs dimensions et leur mise en page correspondent au contenu réel.

L'implémentation de squelettes sur cette page améliorerait considérablement la vitesse de chargement perçue et la satisfaction globale de l'utilisateur.

## Conclusion

Le chargement squelette est un moyen efficace de créer une expérience utilisateur plus fluide et plus engageante lors de la récupération de données. En fournissant un retour visuel immédiat, il réduit les temps d'attente perçus et rend l'application plus réactive. L'implémentation actuelle sur la page `home` sert de bon exemple, et l'extension de ce modèle à d'autres pages gourmandes en données comme `event-details` améliorerait encore l'utilisabilité de l'application.