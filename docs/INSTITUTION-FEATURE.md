# Documentation Technique Approfondie de la Fonctionnalité "Institution"

## 1. Introduction : Segmentation de Contenu et Contrôle d'Accès

La fonctionnalité "Institution" est une implémentation sophistiquée de contrôle d'accès et de diffusion de contenu ciblé au sein de l'application ANAM. Son objectif principal est de créer une distinction claire et sécurisée entre les utilisateurs standards et les comptes d'"Institution" (par exemple, des organisations gouvernementales, des municipalités, des services d'urgence, des entreprises partenaires). Ce statut spécial permet à ces entités de recevoir des bulletins d'information qui leur sont spécifiquement adressés, en plus des bulletins publics accessibles à tous.

Cette fonctionnalité est un exemple concret de **Contrôle d'Accès Basé sur les Rôles (RBAC)** et de **segmentation des données**. Elle ne se contente pas de modifier l'interface utilisateur ; elle met en place une architecture complète qui s'étend de la base de données aux notifications push, garantissant que les informations sensibles ou spécifiques ne sont accessibles qu'aux destinataires prévus.

Ce document technique couvre l'ensemble de la fonctionnalité, de la modification des modèles de données à la logique de l'interface utilisateur, en passant par les mécanismes de sécurité et de notification qui en sont les piliers.

## 2. Architecture et Extension des Modèles de Données

L'implémentation de la fonctionnalité a nécessité l'extension des modèles de données existants pour supporter le concept d'institution et de ciblage de contenu.

### 2.1. Modèle Utilisateur (`AppUser`)

L'interface `AppUser` (dans `src/app/services/auth/auth.service.ts`) a été étendue avec un champ booléen `isInstitution`. C'est le pivot central de la fonctionnalité. La présence de ce champ `true` sur un document utilisateur dans Firestore lui confère son statut spécial.

```typescript
export interface AppUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isAdmin?: boolean;
  isInstitution?: boolean; // Champ clé de la fonctionnalité
}
```

### 2.2. Modèle Bulletin (`WeatherBulletin`)

L'interface `WeatherBulletin` (dans `src/app/model/bulletin.model.ts`) a été étendue pour permettre le ciblage d'un bulletin vers une institution spécifique. Le champ `targetInstitutionId` stocke l'UID de l'utilisateur de l'institution cible.

```typescript
export interface WeatherBulletin {
  id?: string;
  // ... autres champs
  targetInstitutionId?: string | null; // Stocke l'UID de l'institution cible
}
```
-   Si `targetInstitutionId` est `null` ou `undefined`, le bulletin est considéré comme **public**.
-   Si `targetInstitutionId` contient un UID, il est considéré comme **privé** et destiné uniquement à l'institution correspondante.

## 3. Flux de Données Complet : De la Création à la Réception

Pour bien comprendre la fonctionnalité, il est utile de suivre le parcours d'un bulletin ciblé à travers le système.

**Étape 1 : Élévation de Rôle (Devient une Institution)**
-   Un utilisateur standard, via la `SettingsPage`, clique sur "Devenir une institution".
-   La méthode `promptBecomeInstitution()` demande un code secret (`95160`).
-   Si le code est correct, `authService.setUserAsInstitution()` est appelé.
-   Cette méthode met à jour le document de l'utilisateur dans Firestore : `updateDoc(userDocRef, { isInstitution: true })`.

**Étape 2 : Création d'un Bulletin Ciblé par un Admin**
-   Un administrateur se rend sur la `AddPage`.
-   Dans `ngOnInit`, la page appelle `authService.getInstitutionUsers()` pour récupérer la liste de tous les utilisateurs où `isInstitution === true`.
-   Cette liste est utilisée pour peupler un menu déroulant `<ion-select>` permettant de choisir une cible.
-   L'administrateur remplit le formulaire, sélectionne une institution cible dans le menu déroulant, et clique sur "Publier".
-   La méthode `submitAlert()` récupère la valeur du formulaire. Si la cible n'est pas "all", elle assigne l'UID de l'institution sélectionnée au champ `targetInstitutionId` de l'objet bulletin.
-   `publicationService.addAlert()` est appelé, et le nouveau document de bulletin est écrit dans Firestore avec le `targetInstitutionId`.

**Étape 3 : Déclenchement de la Notification Ciblée**
-   Le serveur backend `anam-server`, qui écoute la collection `bulletins` avec `onSnapshot`, détecte l'ajout du nouveau document.
-   Il inspecte le champ `targetInstitutionId`. Comme il n'est pas nul, le serveur détermine que le topic de notification est `institution_` suivi de l'UID de la cible (ex: `institution_xyz123`).
-   Le serveur envoie une notification push via FCM à ce topic spécifique.

**Étape 4 : Réception et Affichage par l'Utilisateur de l'Institution**
-   L'utilisateur de l'institution ouvre l'application et arrive sur la `HomePage`.
-   Dans `ngOnInit`, la page récupère l'utilisateur actuel via `authService.currentUser$`. Elle voit que `user.isInstitution` est `true`.
-   La page s'abonne à `bulletinService.getPublications()` et applique un filtre : `bulletins.filter(b => !b.targetInstitutionId || b.targetInstitutionId === user.uid)`.
-   Cette logique garantit que l'utilisateur voit **les bulletins publics ET les bulletins qui lui sont spécifiquement destinés**.
-   Simultanément, l'appareil de l'utilisateur, qui est abonné au topic `institution_xyz123`, reçoit la notification push envoyée par le serveur.

## 4. Notifications Push Ciblées : Le Rôle Clé de `AuthService`

Un avantage majeur du statut d'institution est la réception de notifications push ciblées. Ceci est réalisé grâce à une gestion dynamique des abonnements aux topics de Firebase Cloud Messaging (FCM), orchestrée par `AuthService`.

La méthode privée `handleInstitutionSubscription` est appelée chaque fois que l'état de l'utilisateur est chargé ou mis à jour, assurant une gestion réactive des abonnements.

```typescript
// Dans src/app/services/auth/auth.service.ts
private async handleInstitutionSubscription(user: AppUser) {
  const newTopic = user.isInstitution ? `institution_${user.uid}` : null;

  if (this.institutionTopic !== newTopic) {
    if (this.institutionTopic) {
      this.fcmService.unsubscribeFromTopic(this.institutionTopic);
    }
    if (newTopic) {
      this.fcmService.subscribeToTopic(newTopic);
    }
    this.institutionTopic = newTopic;
  }
}
```

**Analyse détaillée de la logique :**
1.  **Création du Topic Unique**: Si l'utilisateur est une institution, un nom de topic unique est généré en préfixant son UID : `institution_xxxxxxxx`. Ce nom est prévisible et peut être reconstruit par le serveur.
2.  **Gestion des Changements d'État**: Le service compare le `newTopic` avec celui auquel il est actuellement abonné (`this.institutionTopic`). Cette comparaison est cruciale pour éviter des abonnements/désabonnements inutiles.
3.  **Désabonnement Intelligent**: Si l'ancien topic existe (l'utilisateur était une institution mais ne l'est plus, ou l'utilisateur se déconnecte), le service se désabonne de ce topic pour ne plus recevoir de notifications ciblées.
4.  **Abonnement Intelligent**: Si un nouveau topic est défini (l'utilisateur vient de devenir une institution), le service abonne l'appareil à ce topic unique.

Ce mécanisme garantit que seuls les appareils de l'utilisateur de l'institution recevront les notifications envoyées à ce topic spécifique, assurant ainsi la confidentialité.

## 5. Considérations de Sécurité : Les Règles Firestore

L'implémentation côté client est robuste, mais pour une sécurité à toute épreuve, la segmentation des données doit également être appliquée au niveau de la base de données via les **Règles de Sécurité Firestore**. Sans elles, un utilisateur malveillant pourrait potentiellement contourner la logique du client pour lire des bulletins qui ne lui sont pas destinés.

Voici un exemple de règles de sécurité qui pourraient être implémentées pour la collection `bulletins` :

```json
// dans firestore.rules
match /bulletins/{bulletinId} {
  // Tout le monde peut lire les bulletins publics.
  allow read: if resource.data.targetInstitutionId == null;

  // Un utilisateur peut lire un bulletin si son UID correspond au targetInstitutionId.
  allow read: if request.auth.uid == resource.data.targetInstitutionId;

  // Seuls les administrateurs peuvent créer, mettre à jour ou supprimer des bulletins.
  allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
}
```

Ces règles garantissent que :
-   La lecture d'un bulletin n'est autorisée que s'il est public ou si l'UID de l'utilisateur demandeur correspond à l'ID de la cible.
-   L'écriture (création, modification) est réservée aux administrateurs.

## 6. Conclusion et Prochaines Étapes

La fonctionnalité "Institution" est un système robuste et bien intégré qui permet une segmentation efficace des utilisateurs et une diffusion ciblée de l'information. Elle est sécurisée, s'appuie sur des pratiques de code solides et offre une expérience utilisateur cohérente.

**Améliorations futures recommandées :**
1.  **Tableau de Bord Institution**: Créer une page ou un tableau de bord dédié où les utilisateurs d'une institution peuvent voir un historique de tous les bulletins qui leur ont été spécifiquement adressés, séparément du flux public.
2.  **Gestion des Institutions par les Admins**: Développer une interface d'administration où les administrateurs peuvent voir la liste des institutions, leur assigner ce statut manuellement (plutôt que par un code secret), ou le révoquer.
3.  **Tests Unitaires et d'Intégration**: Renforcer la couverture de tests pour les nouvelles logiques dans `AuthService`, `HomePage`, `AddPage` et les règles de sécurité Firestore pour garantir la non-régression et la robustesse du système.