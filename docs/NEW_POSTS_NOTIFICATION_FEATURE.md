# Documentation Approfondie de la Fonctionnalité : Notification des Nouveaux Posts

## 1. Introduction et Objectifs

Dans une application riche en contenu comme ANAM, il est crucial d'informer les utilisateurs des nouvelles publications (bulletins et événements) de manière efficace et non intrusive. La fonctionnalité de notification des nouveaux posts a été conçue pour répondre à ce besoin. Son objectif est d'alerter discrètement l'utilisateur des contenus ajoutés depuis sa dernière visite, de lui permettre de les consulter rapidement, et de marquer ces contenus comme "vus" pour ne pas les lui présenter à nouveau.

Cette fonctionnalité améliore considérablement l'engagement et la rétention des utilisateurs en s'assurant qu'ils ne manquent jamais les informations importantes. Elle repose sur une architecture réactive et découplée, orchestrée par un service central qui agit comme la source de vérité.

Les composants clés de cette architecture sont :
*   **`NewPostService`**: Un service Angular qui centralise toute la logique de détection, de filtrage et de gestion d'état des nouveaux posts.
*   **`HomePage`** : La page d'accueil qui affiche l'indicateur de notification (un badge sur une icône de cloche) et qui orchestre l'affichage des nouveautés.
*   **`NewPostsSheetComponent`** : Un composant d'interface utilisateur (une feuille modale) qui liste les nouveaux posts de manière claire et concise.
*   **`@ionic/storage-angular`**: Le mécanisme de persistance qui permet de se souvenir des posts déjà consultés par l'utilisateur entre les sessions.

## 2. Architecture Réactive et Flux de Données

Le système est construit sur les principes de la programmation réactive avec RxJS, ce qui le rend efficace et facile à maintenir. Le flux de données est unidirectionnel et facile à suivre.

### Étape 1 : Initialisation et Persistance (`NewPostService`)

Au démarrage de l'application, le `NewPostService` est instancié. Son constructeur appelle `initStorage()`.

```typescript
// Dans NewPostService
constructor(...) {
  this.initStorage();
}

async initStorage() {
  await this.storage.create(); // Initialise le driver de stockage
  const seenPosts = await this.storage.get(SEEN_POSTS_KEY);
  this.seenPosts.next(seenPosts || []);
}
```
-   Le service utilise `@ionic/storage-angular` pour récupérer la liste des identifiants (`ID`) des posts que l'utilisateur a déjà "vus" lors de sessions précédentes. Cette liste est stockée sous la clé `SEEN_POSTS_KEY`.
-   Cette liste d'IDs est ensuite poussée dans un `BehaviorSubject` nommé `seenPosts`. Un `BehaviorSubject` est un type spécial d'Observable RxJS qui conserve la dernière valeur émise et la fournit immédiatement à tout nouvel abonné. C'est la "source de vérité" de l'état des posts vus.

### Étape 2 : Combinaison des Sources de Données (`NewPostService`)

Le service doit considérer à la fois les bulletins et les événements comme des "posts". Pour cela, il utilise l'opérateur `combineLatest` de RxJS. C'est un point clé de l'architecture.

```typescript
// Dans getNewPosts() de NewPostService
getNewPosts() {
  const bulletins$ = this.publicationService.getPublications()...;
  const events$ = this.eventService.getEventsFromFirebase()...;

  return combineLatest([bulletins$, events$, this.seenPosts]).pipe(
    map(([bulletins, events, seen]) => {
      // ... logique de filtrage et de tri
    })
  );
}
```
-   `combineLatest` prend un tableau d'Observables en entrée. Il attend que chaque Observable ait émis au moins une valeur.
-   Ensuite, chaque fois que **l'un des Observables sources émet une nouvelle valeur**, `combineLatest` émet un nouveau tableau contenant les dernières valeurs de chaque source.
-   Cela signifie que si un nouveau bulletin est ajouté, si un nouvel événement est ajouté, OU si l'utilisateur marque un post comme vu (ce qui change l'émission de `this.seenPosts`), le pipeline entier est ré-exécuté automatiquement.

### Étape 3 : Filtrage et Tri (`NewPostService`)

À l'intérieur de l'opérateur `map`, la logique métier est appliquée :
1.  Les tableaux de bulletins et d'événements sont fusionnés en un seul tableau `allPosts`.
2.  Ce tableau est filtré : `allPosts.filter(post => post.id && !seen.includes(post.id))`. On ne garde que les posts dont l'ID n'est **pas** présent dans le tableau `seen`.
3.  Les posts restants (les "nouveaux" posts) sont triés par date de création pour que les plus récents apparaissent en premier.

### Étape 4 : Affichage de la Notification (`HomePage`)

La `HomePage` s'abonne à l'observable `newPostsCount$`, qui est simplement `getNewPosts().pipe(map(posts => posts.length))`.

```html
<!-- home.page.html -->
<ion-button class="notifications" (click)="openNewPostsSheet()">
  <ion-icon name="notifications-outline"></ion-icon>
  <ion-badge *ngIf="(newPostsCount$ | async) as count" [class.hidden]="count === 0">
    {{ count }}
  </ion-badge>
</ion-button>
```
-   Le pipe `async` gère l'abonnement et la désinscription automatiquement.
-   Le badge `ion-badge` s'affiche conditionnellement et est masqué si le compteur est à zéro.

### Étape 5 : Interaction Utilisateur et Communication entre Composants

1.  **Ouverture du Modal (`HomePage`)**: L'utilisateur clique sur la cloche, ce qui déclenche `openNewPostsSheet()`.
    ```typescript
    async openNewPostsSheet() {
      const newPosts = await firstValueFrom(this.newPostService.getNewPosts());
      const modal = await this.modalCtrl.create({
        component: NewPostsSheetComponent,
        componentProps: { newPosts }, // 1. Passage des données en entrée
        // ...
      });
      await modal.present();
      // ...
    }
    ```
    -   La liste des nouveaux posts est passée au `NewPostsSheetComponent` via la propriété `componentProps`. C'est le mécanisme d'**Input** pour les modaux.

2.  **Affichage et Sélection (`NewPostsSheetComponent`)**: Le composant modal reçoit les données via une propriété décorée avec `@Input()`. Lorsqu'un utilisateur clique sur un post, la méthode `dismiss()` du modal est appelée.
    ```typescript
    // Dans NewPostsSheetComponent
    @Input() newPosts: Post[] = [];

    dismiss(post?: Post) {
      this.modalCtrl.dismiss({ post }); // 2. Renvoi des données en sortie
    }
    ```
    -   `modalCtrl.dismiss()` ferme le modal et peut renvoyer des données à la page qui l'a appelé.

3.  **Réception du Résultat et Action (`HomePage`)**: La `HomePage` attend la fermeture du modal avec `modal.onDidDismiss()`.
    ```typescript
    // Dans openNewPostsSheet() de HomePage
    const { data } = await modal.onDidDismiss(); // 3. Récupération des données de sortie
    if (data && data.post) {
      const post: Post = data.post;
      this.newPostService.markPostAsSeen(post.id!).subscribe(() => {
        // Navigation vers la page de détail
      });
    }
    ```
    -   Si un post a été retourné, la page appelle `newPostService.markPostAsSeen(postId)`.

### Étape 6 : Mise à Jour de l'État (`NewPostService`)

La méthode `markPostAsSeen(postId)` est la dernière pièce du puzzle.

```typescript
markPostAsSeen(postId: string) {
  const currentSeen = this.seenPosts.value;
  if (!currentSeen.includes(postId)) {
    const newSeen = [...currentSeen, postId];
    this.seenPosts.next(newSeen); // Émet la nouvelle liste de posts vus
    return from(this.storage.set(SEEN_POSTS_KEY, newSeen)); // Sauvegarde en persistance
  }
  return from(Promise.resolve());
}
```
-   Elle ajoute le nouvel ID à la liste des posts vus.
-   Elle pousse cette nouvelle liste dans le `BehaviorSubject` `seenPosts`.
-   **C'est cette émission qui déclenche la magie de RxJS** : `combineLatest` dans `getNewPosts()` reçoit cette nouvelle liste, ré-exécute le filtrage, et émet une nouvelle liste de nouveaux posts (avec un élément en moins). Par conséquent, `newPostsCount$` émet un nouveau nombre, et le badge sur la `HomePage` se met à jour automatiquement.
-   Enfin, la nouvelle liste est sauvegardée dans le stockage persistant.

## 3. Bonnes Pratiques et Améliorations Possibles

**Bonnes pratiques respectées :**
*   **Principe de responsabilité unique** : Chaque service et composant a un rôle clair et défini.
*   **Découplage des composants** : `HomePage` et `NewPostsSheetComponent` ne communiquent que via l'API du `ModalController`, ils n'ont pas de dépendance directe l'un envers l'autre.
*   **Gestion d'état réactive et centralisée** : L'état est géré de manière prédictible et maintenable dans le `NewPostService` avec RxJS, qui agit comme une source de vérité unique.

**Améliorations possibles :**
*   **Marquer tout comme lu** : Ajouter un bouton "Marquer tout comme lu" dans le `NewPostsSheetComponent`. Ce bouton appellerait une nouvelle méthode dans le service qui ajouterait tous les ID des nouveaux posts actuels à la liste des vus en une seule fois.
*   **Optimisation du stockage** : Pour une application avec des milliers de posts, la liste des `seen_posts` dans le stockage pourrait devenir très grande. Une stratégie de nettoyage pourrait être envisagée (par exemple, ne conserver que les ID des 3 ou 6 derniers mois) pour éviter de surcharger le stockage local de l'utilisateur.
*   **Feedback Visuel Amélioré** : Lors du clic sur un post dans la feuille modale, on pourrait afficher un spinner pendant que le post est marqué comme vu et que la navigation s'effectue, pour une meilleure expérience sur les connexions lentes.
*   **Tests unitaires** : Ajouter des tests pour le `NewPostService` est crucial. On pourrait mocker les services de publication et d'événements, ainsi que le service de stockage, pour valider la logique de filtrage, de tri et de marquage de manière isolée.

## 4. Conclusion

L'implémentation de la fonctionnalité de notification des nouveaux posts est un exemple solide d'architecture réactive en Angular. En combinant un service de gestion d'état centralisé, la puissance de RxJS (`BehaviorSubject`, `combineLatest`) pour les flux de données, et la persistance locale pour la continuité entre les sessions, le système offre une expérience utilisateur fluide, fiable et engageante. La logique est découplée, maintenable et constitue une base saine pour de futures améliorations.