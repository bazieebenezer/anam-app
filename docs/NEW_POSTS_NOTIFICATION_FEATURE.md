# Documentation de la fonctionnalité : Notifications des nouveaux posts

## 1. Introduction

Cette documentation décrit l'implémentation de la fonctionnalité de notification des nouvelles publications (bulletins et événements) dans l'application. L'objectif est d'informer l'utilisateur des contenus ajoutés depuis sa dernière visite de manière non intrusive, via un badge sur une icône de cloche, et de lui permettre de consulter ces nouveautés rapidement.

Cette fonctionnalité repose sur l'interaction entre trois éléments principaux :
*   **`HomePage`** : La page d'accueil qui affiche l'icône de notification.
*   **`NewPostsSheetComponent`** : Un composant modal (feuille de bas de page) qui liste les nouveaux posts.
*   **`NewPostService`** : Un service Angular qui centralise la logique de détection et de gestion d'état des nouveaux posts.

## 2. Description pas à pas du fonctionnement

Le flux de données et d'interactions suit une logique réactive et bien définie.

**Étape 1 : Initialisation et détection**
1.  Au chargement de la `HomePage` (`ngOnInit`), la page s'abonne à l'observable `newPostsCount$` du `NewPostService`. Cet observable est destiné à émettre le nombre de nouveaux posts.
2.  Le `NewPostService` est initialisé et charge depuis le stockage local (`@ionic/storage-angular`) la liste des identifiants (`ID`) des posts que l'utilisateur a déjà "vus".
3.  Le service fait ensuite appel au `PublicationService` et au `EventService` pour récupérer l'ensemble des bulletins et des événements depuis Firestore.
4.  Il compare la liste de tous les posts avec la liste des posts déjà vus. La différence constitue la liste des "nouveaux posts".
5.  Le service met à jour ses `BehaviorSubject` internes, et l'observable `newPostsCount$` émet le nombre de nouveaux posts.

**Étape 2 : Affichage de la notification**
1.  Grâce au pipe `async` dans le template de la `HomePage` (`home.page.html`), le badge de notification est automatiquement mis à jour avec le dernier nombre émis par `newPostsCount$`.
    ```html
    <!-- home.page.html -->
    <ion-button class="notifications" slot="end" (click)="openNewPostsSheet()">
      <ion-icon name="notifications-outline"></ion-icon>
      <ion-badge
        *ngIf="(newPostsCount$ | async) as count"
        color="danger"
        [class.hidden]="count === 0"
      ><span></span></ion-badge>
    </ion-button>
    ```
2.  Si le nombre est supérieur à zéro, le badge est visible. Sinon, il est masqué via la classe `.hidden`.

**Étape 3 : Interaction de l'utilisateur**
1.  L'utilisateur clique sur l'icône de la cloche, ce qui déclenche la méthode `openNewPostsSheet()` dans `HomePage`.

**Étape 4 : Ouverture du panneau des nouveautés**
1.  La méthode `openNewPostsSheet()` récupère la liste actuelle des nouveaux posts depuis le `NewPostService`.
2.  Elle utilise le `ModalController` d'Ionic pour créer et présenter le `NewPostsSheetComponent`.
3.  La liste des nouveaux posts est passée au composant via la propriété `componentProps`.
    ```typescript
    // home.page.ts
    async openNewPostsSheet() {
      const newPosts = await firstValueFrom(this.newPostService.getNewPosts());
      const modal = await this.modalCtrl.create({
        component: NewPostsSheetComponent,
        componentProps: { newPosts }, // Passage des données
        breakpoints: [0, 0.5, 0.8],
        initialBreakpoint: 0.5,
      });
      await modal.present();
      // ... suite
    }
    ```

**Étape 5 : Consultation et fermeture**
1.  Le `NewPostsSheetComponent` s'affiche et liste les nouveaux posts reçus.
2.  L'utilisateur peut fermer le panneau ou cliquer sur un post spécifique.
3.  Lorsqu'un post est cliqué, le panneau se ferme (`modal.dismiss()`) en retournant les données du post sélectionné.

**Étape 6 : Marquage comme "vu" et navigation**
1.  La `HomePage` attend la fermeture du modal (`modal.onDidDismiss()`).
2.  Si un post a été retourné, elle appelle la méthode `markPostAsSeen(postId)` du `NewPostService`.
3.  Cette méthode ajoute l'ID du post à la liste des posts vus dans le `BehaviorSubject` et persiste cette nouvelle liste dans le stockage local.
4.  Une fois le marquage effectué, l'application navigue vers la page de détail du post concerné.
5.  Comme la liste des posts vus a changé, le `NewPostService` ré-émet automatiquement le nouveau compte de posts (qui a diminué), et le badge sur la `HomePage` se met à jour.

## 3. Interactions entre la page et le composant

*   **`HomePage` -> `NewPostService`** :
    *   S'abonne à `getNewPostsCount()` pour l'affichage du badge.
    *   Appelle `getNewPosts()` pour récupérer la liste à afficher dans le modal.
    *   Appelle `markPostAsSeen()` après qu'un post a été consulté.

*   **`NewPostService` -> `HomePage`** :
    *   Pousse le nombre de nouveaux posts via l'observable `newPostsCount$`.

*   **`HomePage` -> `NewPostsSheetComponent`** :
    *   Crée et affiche le composant via `ModalController`.
    *   Passe la liste des nouveaux posts en tant que `Input` (`componentProps`).

*   **`NewPostsSheetComponent` -> `HomePage`** :
    *   Communique en retour via le `onDidDismiss` du modal, en renvoyant le post sur lequel l'utilisateur a cliqué.

## 4. Choix Techniques

*   **Service de gestion d'état (`NewPostService`)** : Le choix d'un service dédié est crucial. Il permet de **découpler** la `HomePage` du `NewPostsSheetComponent`. Ces deux composants n'ont pas besoin de se connaître directement ; ils communiquent via le service qui agit comme une **source de vérité unique** pour l'état des "nouveaux posts".

*   **Programmation Réactive (RxJS)** : L'utilisation de `BehaviorSubject` et d'observables (via RxJS) est un pilier de cette implémentation. Elle permet un flux de données réactif et efficace. Quand l'état (la liste des posts vus) change dans le service, tous les composants abonnés (comme la `HomePage`) sont notifiés et leur affichage est mis à jour automatiquement, sans manipulation manuelle du DOM.

*   **Persistance des données (`@ionic/storage-angular`)** : Pour que la fonctionnalité soit utile d'une session à l'autre, l'état des "posts vus" est sauvegardé sur l'appareil. `Storage` est une solution simple et efficace pour cette persistance côté client.

*   **Composant d'UI (`ion-modal`)** : L'utilisation d'une feuille modale (`sheet`) est un excellent choix UX. Elle présente les notifications de manière contextuelle sans forcer l'utilisateur à quitter la page d'accueil, offrant une expérience fluide.

## 5. Bonnes Pratiques et Améliorations

**Bonnes pratiques respectées :**
*   **Principe de responsabilité unique** : Chaque service a un rôle clair (`PublicationService` pour les données brutes, `NewPostService` pour la logique métier des "nouveautés").
*   **Découplage des composants** : Les composants sont faiblement couplés grâce au service central.
*   **Gestion d'état réactive** : L'état est géré de manière prédictible et maintenable avec RxJS.

**Améliorations possibles :**
*   **Réinitialisation globale** : Actuellement, les posts sont marqués comme vus un par un. On pourrait ajouter un bouton "Marquer tout comme lu" dans le `NewPostsSheetComponent` qui appellerait une méthode dans le service pour ajouter tous les ID des nouveaux posts à la liste des vus en une seule fois.
*   **Optimisation du stockage** : Pour des milliers de posts, la liste des `seen_posts` pourrait devenir très grande. Une stratégie de nettoyage pourrait être envisagée (par exemple, ne conserver que les ID des 3 derniers mois).
*   **Tests unitaires** : Ajouter des tests pour le `NewPostService` afin de valider la logique de filtrage et de marquage, garantissant ainsi la robustesse de la fonctionnalité lors de futures évolutions.

## 6. Conclusion

L'implémentation de la fonctionnalité de notification des nouveaux posts est un exemple solide d'architecture réactive en Angular. En combinant un service de gestion d'état, la puissance de RxJS pour les flux de données, et la persistance locale, le système offre une expérience utilisateur fluide et fiable. La logique est centralisée, découplée et facilement maintenable, ce qui constitue une base saine pour de futures améliorations.
