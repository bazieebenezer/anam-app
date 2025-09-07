# Documentation Technique Approfondie de la Fonctionnalité de Téléchargement d'Images

## 1. Vue d'ensemble et Architecture

La fonctionnalité de téléchargement d'images est une composante cruciale de l'expérience utilisateur au sein de l'application ANAM. Elle permet aux utilisateurs de sauvegarder des contenus visuels importants, tels que des cartes météorologiques ou des photos d'événements, directement sur leur appareil. L'architecture de cette fonctionnalité a été conçue pour être robuste, multiplateforme et résiliente, en s'adaptant intelligemment aux capacités et aux contraintes de chaque environnement d'exécution : navigateur web, émulateur de développement, ou appareil mobile natif (iOS/Android).

L'architecture repose sur une séparation claire des préoccupations, incarnée par deux éléments principaux :

1.  **`ImageDownloadService`**: Un service Angular injectable qui centralise et encapsule toute la logique complexe du téléchargement. Il est le cerveau de l'opération, responsable de :
    -   La détection de la plateforme.
    -   La gestion des permissions natives (accès à la galerie de photos).
    -   Le téléchargement effectif des données de l'image via des requêtes réseau.
    -   La sélection de la stratégie de sauvegarde appropriée (API de partage, écriture dans la galerie, téléchargement via le navigateur).
    -   La communication avec l'utilisateur via des notifications (toasts) pour fournir un retour sur l'état de l'opération.

2.  **`ImageViewerModalComponent`**: Un composant d'interface utilisateur qui affiche une image en plein écran et utilise le `ImageDownloadService`. Il agit comme la couche de présentation, fournissant le bouton de téléchargement, gérant l'état de l'interface (par exemple, en affichant un indicateur de chargement) et interceptant les erreurs pour les afficher à l'utilisateur. La communication se fait dans un seul sens : le composant demande au service de télécharger une image, et le service s'occupe de toute la complexité sous-jacente.

Cette séparation est fondamentale : le composant reste simple et focalisé sur l'UI, tandis que le service, complexe mais réutilisable, peut être injecté dans n'importe quelle autre partie de l'application qui nécessiterait une fonctionnalité de téléchargement.

## 2. Analyse Approfondie du `ImageDownloadService`

Ce service est le cœur de la fonctionnalité. Il orchestre l'ensemble du processus.

### 2.1. Point d'Entrée : La Méthode Publique `downloadImage`

C'est la seule méthode publique du service, servant de façade pour toute la logique interne. Elle prend en entrée l'URL de l'image et un nom de fichier optionnel.

```typescript
async downloadImage(imageUrl: string, fileName: string = 'image.jpg'): Promise<void> {
  try {
    const info = await Device.getInfo();

    if (info.platform === 'web' || this.isEmulator()) {
      await this.downloadImageWeb(imageUrl, fileName);
      return;
    }

    // ... Logique pour appareil mobile réel

  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    await this.showToast("Erreur lors du téléchargement de l'image", 'danger');
  }
}
```

**Analyse détaillée de la stratégie de détection :**
-   **Détection de la plateforme** : La première étape cruciale est d'appeler `Device.getInfo()` du plugin Capacitor `@capacitor/device`. Cela retourne des informations fiables sur l'appareil, notamment la plateforme (`platform`: "web", "android", "ios").
-   **Gestion des Émulateurs (`isEmulator()`)**: Une vérification supplémentaire `this.isEmulator()` est effectuée. C'est une étape importante pour l'expérience de développement. Les émulateurs Android et iOS, bien que simulant un environnement mobile, n'ont pas toujours un accès complet ou fiable aux API de la galerie de photos ou de partage. En les traitant comme une plateforme web, on garantit que le développeur peut tester la fonctionnalité de téléchargement de base sans avoir besoin d'un appareil physique pour chaque test.
-   **Gestion des erreurs globale** : La méthode est entièrement enveloppée dans un bloc `try...catch`. Toute erreur inattendue durant le processus (problème réseau, permission refusée, etc.) sera interceptée ici, enregistrée dans la console pour le débogage, et un message d'erreur clair sera affiché à l'utilisateur via un toast.

### 2.2. Gestion des Permissions sur Appareils Mobiles

Sur un appareil mobile réel, l'accès à la galerie de photos est une fonctionnalité protégée qui requiert une permission explicite de l'utilisateur. Cette logique est gérée de manière propre et séquentielle par `checkAndRequestPermissions()`.

```typescript
private async checkAndRequestPermissions(): Promise<boolean> {
  try {
    // 1. Vérifier d'abord sans déranger l'utilisateur
    const permissions = await Camera.checkPermissions();
    if (permissions.photos === 'granted') {
      return true;
    }

    // 2. Si la permission n'est pas accordée, la demander
    const requestResult = await Camera.requestPermissions({ permissions: ['photos'] });
    return requestResult.photos === 'granted';
  } catch (error) {
    // ...
    return false;
  }
}
```

**Analyse détaillée du flux de permission :**
-   **Plugin `@capacitor/camera`** : Le service utilise le plugin Camera de Capacitor, qui fournit une API unifiée pour interagir avec la caméra et la galerie de photos sur iOS et Android.
-   **Vérification Discrète (`checkPermissions`)** : La méthode vérifie d'abord l'état actuel de la permission sans déclencher de popup. Si la permission a déjà été accordée par le passé, la méthode retourne `true` immédiatement, offrant une expérience fluide et sans interruption.
-   **Demande Explicite (`requestPermissions`)** : Ce n'est que si la permission n'est pas déjà accordée que cette méthode est appelée. Elle déclenche la boîte de dialogue native du système d'exploitation demandant à l'utilisateur d'autoriser l'accès. C'est une bonne pratique UX de ne demander les permissions qu'au moment où elles sont réellement nécessaires.

### 2.3. La Stratégie de Téléchargement sur Mobile : `downloadImageToGallery`

Cette méthode a été conçue pour privilégier l'expérience utilisateur la plus moderne et la plus intégrée possible, en utilisant l'API de partage web.

```typescript
private async downloadImageToGallery(imageUrl: string, fileName: string): Promise<void> {
  const response = await fetch(imageUrl);
  const blob = await response.blob();

  if ('share' in navigator && navigator.canShare) {
    // ... Logique de l'API Web Share
  } else {
    // Fallback pour les appareils qui ne supportent pas l'API de partage
    await this.saveImageFallback(blob, fileName);
  }
}
```

**Analyse détaillée de la stratégie :**
1.  **`fetch` et `blob`** : L'image est d'abord téléchargée depuis son URL en utilisant l'API `fetch`. La réponse est ensuite convertie en un `Blob` (Binary Large Object), qui est une représentation des données brutes de l'image en mémoire.
2.  **Priorité à l'API Web Share (`navigator.share`)** : Le code vérifie si le navigateur ou la WebView de l'appareil supporte l'API de partage. Si c'est le cas, il tente de l'utiliser. Cela ouvre la feuille de partage native du système d'exploitation (iOS ou Android), qui est une interface familière pour l'utilisateur. Elle lui permet non seulement d'"Enregistrer l'image" dans sa galerie, mais aussi de la partager directement sur WhatsApp, par e-mail, etc. C'est la méthode la plus flexible et la plus puissante.
3.  **Mécanisme de Secours (`saveImageFallback`)** : Si `navigator.share` n'est pas disponible ou si son utilisation échoue, le code se rabat sur `saveImageFallback`, une méthode qui simule un téléchargement de fichier standard.

### 2.4. Les Méthodes de Secours : `saveImageFallback` et `downloadImageWeb`

Ces deux méthodes utilisent la même technique, qui est la méthode standard pour déclencher un téléchargement de fichier dans un navigateur web.

```typescript
private async saveImageFallback(blob: Blob, fileName: string): Promise<void> {
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => { URL.revokeObjectURL(blobUrl); }, 1000);
  // ...
}
```

**Analyse détaillée de la technique :**
1.  **`URL.createObjectURL(blob)`** : Une URL locale temporaire et unique est créée pour le `Blob` qui est en mémoire.
2.  **Création d'un lien (`<a>`) invisible** : Un élément de lien HTML (`<a>`) est créé dynamiquement en JavaScript.
3.  **Configuration du lien** : L'attribut `href` du lien est défini sur l'URL du blob, et, de manière cruciale, l'attribut `download` est défini sur le nom de fichier souhaité. C'est cet attribut `download` qui indique au navigateur de télécharger le fichier lié par l'URL plutôt que d'y naviguer.
4.  **Déclenchement du clic par programme** : Le lien est ajouté au DOM, un clic est simulé avec `link.click()`, puis le lien est immédiatement retiré du DOM pour ne pas polluer la page.
5.  **Nettoyage de la mémoire** : `URL.revokeObjectURL(blobUrl)` est appelé après un court délai pour libérer les ressources mémoire utilisées par l'URL du blob. C'est une étape importante pour éviter les fuites de mémoire.

## 3. Intégration et Configuration Native

Pour que la fonctionnalité soit complète, une configuration est nécessaire au niveau des projets natifs.

-   **Android (`android/app/src/main/AndroidManifest.xml`)**: Il est crucial d'ajouter les permissions nécessaires pour que l'application puisse accéder au stockage externe ou à la galerie. Typiquement, cela inclut `<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />` et `<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />` (bien que les exigences puissent changer avec les nouvelles versions d'Android et l'API Scoped Storage).

-   **iOS (`ios/App/App/Info.plist`)**: Apple exige une justification pour l'accès aux données de l'utilisateur. Une clé comme `NSPhotoLibraryAddUsageDescription` doit être ajoutée, avec une chaîne de caractères expliquant clairement à l'utilisateur pourquoi l'application a besoin d'enregistrer des photos dans sa galerie (par exemple, "Pour sauvegarder les bulletins et les cartes météorologiques pour une consultation hors ligne."). Sans cette description, l'application sera rejetée par l'App Store.

Cette configuration est la colle qui lie le code Capacitor, qui s'exécute dans une WebView, à la plateforme native sous-jacente, lui permettant d'accéder aux fonctionnalités protégées du système.