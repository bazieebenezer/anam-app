# Documentation Technique Complète de la Fonctionnalité de Notifications Push

## 1. Introduction et Architecture Globale

Les notifications push sont un canal de communication vital pour l'application ANAM. Elles permettent d'engager les utilisateurs de manière proactive en les informant en temps réel de la publication de nouveaux contenus (bulletins, événements), qu'ils soient publics ou ciblés. Ce document fournit une analyse technique approfondie de l'architecture de cette fonctionnalité, couvrant à la fois l'implémentation côté client (l'application Ionic/Angular) et côté serveur (le backend Node.js `anam-server`).

L'architecture est un système robuste et découplé qui s'appuie sur **Firebase Cloud Messaging (FCM)** comme service de messagerie. Le flux de communication est basé sur un modèle de **publication/abonnement (Pub/Sub)** utilisant les **topics FCM**.

Les trois acteurs principaux de cette architecture sont :

1.  **Le Client (Application ANAM)** : Responsable de l'enregistrement de l'appareil auprès de FCM, de la gestion des permissions utilisateur, et de l'abonnement aux topics pertinents en fonction du statut de l'utilisateur (standard ou institution).
2.  **Le Serveur (`anam-server`)** : Un service backend Node.js qui écoute en temps réel les changements dans la base de données Firestore. Lorsqu'un nouveau contenu est créé, le serveur est responsable de la construction et de l'envoi de la notification au topic FCM approprié.
3.  **Firebase Cloud Messaging (FCM)** : Le service de Google qui agit comme un pont, recevant les requêtes de notification du serveur et les acheminant de manière fiable vers les appareils des utilisateurs abonnés aux topics ciblés.

Cette approche par topics est particulièrement puissante car elle découple l'expéditeur (le serveur) des destinataires (les clients). Le serveur n'a pas besoin de connaître les jetons d'appareil individuels de chaque utilisateur ; il lui suffit de publier un message sur un topic (par exemple, `newPosts`), et FCM se charge de le distribuer à tous les abonnés.

## 2. Implémentation Côté Serveur (`anam-server`)

Le serveur backend est le déclencheur des notifications. Son rôle est de surveiller la base de données et d'agir en conséquence.

### 2.1. Configuration et Initialisation

Le serveur utilise le **SDK Admin Firebase** pour s'authentifier et interagir avec les services Firebase. L'initialisation se fait dans `index.js` à l'aide d'une clé de compte de service (`serviceAccountKey.json`), qui accorde des privilèges d'administration au serveur.

```javascript
// anam-server/index.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
```
**Note de sécurité importante** : Le fichier `serviceAccountKey.json` est extrêmement sensible. Il est correctement listé dans le `.gitignore` du serveur pour ne jamais être exposé dans un dépôt de code. En production (sur des plateformes comme Render), son contenu est stocké dans une variable d'environnement sécurisée.

### 2.2. Écoute des Changements Firestore avec `onSnapshot`

Le cœur de la logique du serveur réside dans les listeners `onSnapshot` de Firestore. Ces listeners établissent une connexion persistante avec la base de données et sont notifiés en temps réel de chaque changement.

Deux listeners sont actifs :

1.  **Écouteur sur la collection `events`** : Surveille l'ajout de nouveaux événements.
2.  **Écouteur sur la collection `bulletins`** : Surveille l'ajout de nouveaux bulletins.

```javascript
// Écouteur pour les nouveaux BULLETINS
db.collection('bulletins').onSnapshot((snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'added') {
      const bulletin = change.doc.data();
      console.log('Nouveau bulletin détecté :', bulletin.title);

      let topic;
      // Logique de détermination du topic
      if (bulletin.targetInstitutionId && bulletin.targetInstitutionId !== 'all') {
        topic = `institution_${bulletin.targetInstitutionId}`;
      } else {
        topic = 'newPosts';
      }

      const title = `Nouveau bulletin : ${bulletin.title}`;
      const body = bulletin.description.substring(0, 100) + '...';

      sendNotification(topic, title, body);
    }
  });
});
```

### 2.3. Logique de Détermination du Topic

La logique de ciblage est simple et efficace :
-   Si un bulletin a un `targetInstitutionId` défini, la notification est envoyée à un topic **privé et unique** à cette institution (ex: `institution_l'UID_de_l'institution`). Seuls les utilisateurs de cette institution seront abonnés à ce topic.
-   Si le bulletin est public (pas de `targetInstitutionId`) ou si un nouvel événement est créé, la notification est envoyée au topic **public** `newPosts`. Tous les utilisateurs de l'application sont abonnés à ce topic.

### 2.4. Envoi de la Notification

La fonction `sendNotification` utilise `admin.messaging().send()` pour envoyer le payload à FCM. Le payload est simple et contient un titre et un corps de message.

```javascript
async function sendNotification(topic, title, body) {
  if (!topic) { /* ... */ return; }

  const payload = {
    notification: {
      title: title,
      body: body,
    },
    topic: topic,
  };

  try {
    const response = await admin.messaging().send(payload);
    console.log(`Notification envoyée avec succès au topic "${topic}"`);
  } catch (error) {
    console.error(`Erreur lors de l'envoi...`);
  }
}
```

## 3. Implémentation Côté Client (Application Ionic/Angular)

Le client a deux responsabilités principales : obtenir la permission de l'utilisateur et gérer les abonnements aux topics.

### 3.1. Le Service `FcmService` : La Couche Technique

Le `src/app/services/fcm/fcm.service.ts` est la couche d'abstraction technique pour les notifications push. Il utilise deux plugins Capacitor clés :
-   `@capacitor/push-notifications` : Pour la gestion de base (demande de permission, enregistrement de l'appareil).
-   `@capacitor-community/fcm` : Un plugin communautaire spécifiquement pour interagir avec les fonctionnalités de FCM, comme l'abonnement aux topics.

**Méthodes clés dans `FcmService` :**
-   `initPush()`: Point d'entrée pour démarrer le processus d'enregistrement.
-   `registerPush()`: Gère le flux de demande de permission et l'enregistrement de l'appareil auprès de FCM.
-   `addListeners()`: Attache des écouteurs pour les événements importants (`registration`, `registrationError`, `pushNotificationReceived`, `pushNotificationActionPerformed`).
-   `subscribeToTopic(topic)`: Encapsule l'appel à `FCM.subscribeTo({ topic })`.
-   `unsubscribeFromTopic(topic)`: Encapsule l'appel à `FCM.unsubscribeFrom({ topic })`.

Lorsqu'une notification est reçue alors que l'application est au premier plan, l'écouteur `pushNotificationReceived` déclenche un toast pour informer l'utilisateur de manière non intrusive.

### 3.2. Le Service `AuthService` : L'Orchestrateur Logique

Le `src/app/services/auth/auth.service.ts` est responsable de la **logique métier** des abonnements. Il utilise le `FcmService` pour exécuter les actions techniques.

**Stratégie d'abonnement :**

1.  **Abonnement Public Permanent** : Dans le constructeur de `AuthService`, le service abonne immédiatement l'utilisateur au topic `newPosts`. Cela garantit que tous les utilisateurs, qu'ils soient connectés ou non, recevront les notifications publiques dès que l'application sera lancée.

    ```typescript
    // Dans le constructeur de AuthService
    constructor(private auth: Auth, private firestore: Firestore, private fcmService: FcmService) {
      this.fcmService.subscribeToTopic('newPosts');
      // ...
    }
    ```

2.  **Abonnement Dynamique aux Topics d'Institution** : La logique la plus complexe se trouve dans la gestion de l'observable `currentUser$`. À chaque fois que l'état de l'utilisateur change (connexion, déconnexion, mise à jour du profil), la méthode privée `handleInstitutionSubscription` est appelée.

    ```typescript
    // Dans AuthService
    private async handleInstitutionSubscription(user: AppUser) {
      const newTopic = user.isInstitution ? `institution_${user.uid}` : null;

      if (this.institutionTopic !== newTopic) {
        // Se désabonner de l'ancien topic s'il existe
        if (this.institutionTopic) {
          this.fcmService.unsubscribeFromTopic(this.institutionTopic);
        }
        // S'abonner au nouveau topic s'il est défini
        if (newTopic) {
          this.fcmService.subscribeToTopic(newTopic);
        }
        this.institutionTopic = newTopic; // Mémoriser le topic actuel
      }
    }
    ```
    Cette méthode garantit que :
    -   Si un utilisateur devient une institution, il est abonné à son topic `institution_{uid}`.
    -   Si un utilisateur cesse d'être une institution (ou si son rôle est révoqué), il est désabonné de son topic.
    -   Lors de la déconnexion, l'utilisateur est également désabonné de tout topic d'institution auquel il était abonné.

Cette architecture garantit une gestion précise et sécurisée des canaux de notification, en s'assurant que seuls les utilisateurs concernés reçoivent les notifications ciblées.

### 3.3. Retour Visuel pour l'Utilisateur (Toasts)

Pour améliorer l'expérience utilisateur et faciliter le débogage, le `FcmService` avait été enrichi pour fournir un retour visuel direct lors des opérations d'abonnement et de désabonnement aux topics. Bien que cette fonctionnalité soit actuellement commentée dans le code source, elle reste une amélioration pertinente. Elle utilise le `ToastController` d'Ionic pour afficher des messages non intrusifs.

**Fonctionnement :**

-   **En cas de succès :** Lorsqu'un abonnement ou un désabonnement à un topic réussit, un "toast" de couleur verte apparaît brièvement en haut de l'écran, confirmant l'action (par exemple, "Subscribed to newPosts").
-   **En cas d'erreur :** Si une erreur se produit pendant l'opération, un toast de couleur rouge (danger) est affiché. Cela alerte immédiatement l'utilisateur ou le développeur d'un problème potentiel, sans qu'il soit nécessaire de consulter la console de débogage.

Cette boucle de rétroaction immédiate offre à l'utilisateur l'assurance que ses actions sont bien prises en compte et simplifie grandement le diagnostic en cas de problème de communication avec les services FCM.

## 4. Tests et Dépannage

Tester les notifications push peut être complexe. Voici quelques conseils :
-   **Utiliser la Console Firebase** : L'outil de composition de notifications de la console FCM est le meilleur moyen de tester la réception côté client. Vous pouvez envoyer des messages à des topics spécifiques pour vérifier que les abonnements fonctionnent.
-   **Surveiller les Logs** : Vérifiez les logs de la console de votre navigateur (pour le PWA), de Logcat (pour Android Studio) ou de la Console (pour Xcode) pour les messages de `FcmService`. Côté serveur, surveillez la console de `anam-server` pour les confirmations d'envoi ou les erreurs de FCM.
-   **Problèmes Courants** :
    -   **Permissions Refusées** : Assurez-vous que l'utilisateur a accordé les permissions.
    -   **Configuration Firebase** : Vérifiez que les fichiers `google-services.json` (Android) et `GoogleService-Info.plist` (iOS) sont corrects et à jour.
    -   **Serveur en Veille** : Si vous hébergez `anam-server` sur une plateforme gratuite, assurez-vous qu'il ne se met pas en veille. Utilisez un service comme UptimeRobot pour le maintenir actif.

## 5. Conclusion

La fonctionnalité de notifications push de l'application ANAM est un système bien architecturé qui utilise efficacement les topics FCM pour une communication ciblée et de masse. La séparation claire des responsabilités entre le serveur (déclencheur), le client (gestionnaire d'abonnements) et FCM (distributeur) rend le système robuste, scalable et maintenable. La logique dynamique de gestion des abonnements dans `AuthService` est particulièrement notable, car elle assure que la diffusion de l'information est à la fois pertinente et sécurisée.