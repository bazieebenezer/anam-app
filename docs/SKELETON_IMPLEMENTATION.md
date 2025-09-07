# Documentation de l'Implémentation du Chargement Squelette (Skeleton Loading)

## 1. Introduction : Améliorer la Performance Perçue

Le chargement squelette (ou "skeleton screen") est une technique de conception d'interface utilisateur (UI) visant à améliorer de manière significative la **performance perçue** d'une application. Plutôt que d'afficher un écran vide ou un indicateur de chargement générique (spinner) pendant que les données sont récupérées depuis un serveur, l'application affiche une version simplifiée, filaire et désaturée de l'interface à venir. Cette structure visuelle imite la mise en page du contenu final.

Cette approche offre plusieurs avantages psychologiques et techniques :

-   **Réduction de l'Anxiété de l'Utilisateur** : Un écran vide peut donner l'impression que l'application a planté. Un spinner, bien que meilleur, ne donne aucune information sur ce qui est en train de charger. Un écran squelette, en revanche, montre que l'application fonctionne et prépare activement le contenu, ce qui est rassurant.
-   **Prévisibilité et Contexte** : Il donne à l'utilisateur un aperçu de la structure de l'information qui va apparaître, rendant le chargement final moins déconcertant. Le passage de l'état squelette à l'état final est fluide, car les éléments apparaissent là où l'utilisateur s'attend déjà à les voir.
-   **Prévention du Décalage de Mise en Page (Layout Shift)** : En dimensionnant correctement les éléments du squelette pour qu'ils correspondent aux dimensions du contenu réel, on évite les sauts de mise en page lorsque les données arrivent. C'est un facteur important pour le score de performance web (Core Web Vitals) et pour le confort visuel.

Ce document détaille l'implémentation du chargement squelette dans la page `home` de l'application ANAM et fournit un guide pour étendre ce modèle à d'autres pages.

## 2. Implémentation du Squelette sur la Page d'Accueil (`HomePage`)

La page d'accueil, qui affiche la liste des bulletins, est la première page riche en contenu que l'utilisateur voit. L'implémentation d'un chargement squelette y est donc particulièrement pertinente.

### 2.1. La Logique de Contrôle (`home.page.ts`)

La visibilité des chargeurs squelettes est contrôlée par un simple drapeau booléen, `isLoading`, dans la classe du composant.

```typescript
// home.page.ts
export class HomePage implements OnInit {
  // ...
  isLoading: boolean = true; // Initialisé à true par défaut

  async ngOnInit() {
    this.isLoading = true; // S'assurer qu'il est true au début de chaque récupération de données
    // ... logique de récupération des données ...
    this.bulletinService.getPublications().subscribe((bulletins) => {
      // ... traitement des données ...
      this.isLoading = false; // Défini sur false uniquement lorsque les données sont prêtes à être affichées
    });
  }
}
```
-   **Initialisation** : `isLoading` est initialisé à `true` pour que le squelette s'affiche dès que le composant est créé.
-   **Cycle de Vie** : Il est explicitement mis à `true` au début de `ngOnInit` pour gérer les cas où la page pourrait être rechargée (par exemple, en revenant d'une autre page). Il n'est passé à `false` qu'à l'intérieur de la souscription à l'observable, garantissant que le contenu réel ne s'affiche que lorsque les données sont arrivées et ont été traitées.

### 2.2. Le Rendu Conditionnel dans le Template (`home.page.html`)

Le template `home.page.html` utilise la nouvelle syntaxe de contrôle de flux d'Angular (`@if` et `@for`) pour rendre conditionnellement soit les cartes squelettes, soit les cartes de contenu réel.

```html
<!-- Squelettes de chargement -->
@if (isLoading) {
  @for (item of [1, 2, 3]; track item) {
    <ion-card class="skeleton-card">
      <!-- ... contenu du squelette ... -->
    </ion-card>
  }
}

<!-- Contenu réel -->
@if (!isLoading) {
  @for (bulletin of filteredBulletins; track bulletin.id) {
    <ion-card>
      <!-- ... contenu réel du bulletin ... -->
    </ion-card>
  }
  // ... affichage du message "Aucun résultat" ...
}
```
-   **Exclusivité Mutuelle** : La structure `@if (isLoading)` / `@if (!isLoading)` garantit que les deux blocs ne peuvent jamais être affichés simultanément.
-   **Répétition du Squelette** : La boucle `@for (item of [1, 2, 3]; track item)` affiche trois cartes squelettes. Cela simule une liste de contenu et donne une meilleure impression de ce à quoi s'attendre qu'une seule carte squelette.

### 2.3. Structure et Style du Squelette (`home.page.html` et `home.page.scss`)

La clé d'un bon écran squelette est de faire en sorte que sa structure et ses dimensions correspondent le plus possible au contenu réel.

-   **Structure de la Carte Squelette** : Chaque `ion-card` avec la classe `.skeleton-card` imite la mise en page d'une carte de bulletin réelle, en utilisant des `div` comme conteneurs et le composant `ion-skeleton-text` d'Ionic pour les espaces réservés.

    ```html
    <ion-card class="skeleton-card">
      <div class="skeleton-image-wrapper">
        <ion-skeleton-text [animated]="true"></ion-skeleton-text>
      </div>
      <ion-card-header>
        <div class="skeleton-title-wrapper">
          <ion-skeleton-text [animated]="true"></ion-skeleton-text>
        </div>
      </ion-card-header>
      <ion-card-content>
        <div class="skeleton-line-wrapper">...</div>
      </ion-card-content>
    </ion-card>
    ```
    L'attribut `[animated]="true"` sur `ion-skeleton-text` active une animation de pulsation subtile qui renforce l'idée que quelque chose est en cours de chargement.

-   **Style (`home.page.scss`)** : Le fichier SCSS est crucial pour dimensionner les éléments du squelette.

    ```scss
    .skeleton-image-wrapper {
      width: 100%;
      height: 300px; // Doit correspondre à la hauteur de l'image réelle
      ...
    }

    .skeleton-title-wrapper {
      width: 80%;
      height: 20px; // Doit correspondre à la taille de la police du titre
      ...
    }

    .skeleton-line-wrapper {
      height: 16px; // Doit correspondre à la hauteur d'une ligne de texte
      &.short { width: 90%; } // Simule des lignes de texte de longueur variable
      &.shortest { width: 70%; }
    }
    ```
    En définissant des hauteurs et des largeurs fixes qui reflètent le contenu final, on s'assure que la transition du squelette au contenu réel se fait sans aucun saut ou redimensionnement de la page.

## 3. Guide d'Implémentation pour d'Autres Pages (Ex: `EventDetailsPage`)

Actuellement, la page `event-details` n'a **pas** de chargement squelette. Pour offrir une expérience utilisateur cohérente, il est fortement recommandé de l'implémenter. Voici un guide pratique pour le faire.

1.  **Ajouter le drapeau `isLoading`** à `event-details.page.ts`.
    ```typescript
    export class EventDetailsPage implements OnInit {
      isLoading: boolean = true;
      // ...

      ngOnInit() {
        this.isLoading = true;
        // ... Dans la souscription au service pour récupérer les détails de l'événement
        this.eventService.getEventById(id).subscribe(event => {
          this.event = event;
          this.isLoading = false;
        });
      }
    }
    ```

2.  **Modifier `event-details.page.html`** pour afficher conditionnellement les espaces réservés.
    ```html
    <ion-content>
      <!-- Squelette -->
      @if (isLoading) {
        <div class="skeleton-wrapper">
          <ion-skeleton-text [animated]="true" class="skeleton-image"></ion-skeleton-text>
          <ion-skeleton-text [animated]="true" class="skeleton-title"></ion-skeleton-text>
          <ion-skeleton-text [animated]="true" class="skeleton-subtitle"></ion-skeleton-text>
          <ion-skeleton-text [animated]="true" class="skeleton-line"></ion-skeleton-text>
          <ion-skeleton-text [animated]="true" class="skeleton-line"></ion-skeleton-text>
        </div>
      }

      <!-- Contenu Réel -->
      @if (!isLoading && event) {
        <!-- ... affichage des détails de l'événement ... -->
      }
    </ion-content>
    ```

3.  **Ajouter les styles correspondants** à `event-details.page.scss`.
    ```scss
    .skeleton-wrapper {
      padding: 16px;
    }
    .skeleton-image { width: 100%; height: 400px; margin-bottom: 16px; }
    .skeleton-title { width: 75%; height: 28px; margin-bottom: 8px; }
    .skeleton-subtitle { width: 50%; height: 18px; margin-bottom: 24px; }
    .skeleton-line { width: 100%; height: 16px; margin-bottom: 8px; }
    ```

## 4. Considérations d'Accessibilité (a11y)

Bien que les écrans squelettes soient excellents pour l'UX visuelle, il faut s'assurer qu'ils n'dégradent pas l'expérience pour les utilisateurs de lecteurs d'écran.

-   Les éléments `ion-skeleton-text` sont généralement ignorés par les lecteurs d'écran, ce qui est le comportement souhaité.
-   Il est recommandé d'ajouter un attribut `aria-busy="true"` au conteneur principal pendant que le contenu charge. Cela indique aux technologies d'assistance que le contenu de cette section est en cours de mise à jour.

    ```html
    <div [attr.aria-busy]="isLoading ? 'true' : 'false'">
      <!-- Squelette ou contenu réel -->
    </div>
    ```

## 5. Conclusion

Le chargement squelette est un moyen efficace et moderne de créer une expérience utilisateur plus fluide et plus engageante lors de la récupération de données. En fournissant un retour visuel immédiat et contextuel, il réduit les temps d'attente perçus et rend l'application plus professionnelle et réactive. L'implémentation actuelle sur la page `home` sert d'excellent modèle, et l'extension de ce pattern à d'autres pages gourmandes en données comme `event-details` est une étape logique pour améliorer encore l'utilisabilité globale de l'application.