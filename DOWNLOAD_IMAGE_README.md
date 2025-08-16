# Fonctionnalité de Téléchargement d'Images

## Description

Cette fonctionnalité permet aux utilisateurs de télécharger et sauvegarder des images dans leur galerie photos sur les appareils mobiles (Android et iOS) et sur le web.

## Fonctionnalités

### Sur Mobile (Android/iOS)

- **Première utilisation** : Demande automatique d'autorisation d'accès à la galerie photos
- **Utilisations suivantes** : Téléchargement direct sans nouvelle demande d'autorisation
- **API de partage native** : Utilise l'API de partage native du système pour une meilleure expérience utilisateur
- **Fallback** : Méthode de téléchargement alternative si l'API de partage n'est pas disponible

### Sur Web

- Téléchargement direct via le navigateur
- Pas de demande d'autorisation nécessaire

## Permissions Requises

### Android

Les permissions suivantes sont configurées dans `android/app/src/main/AndroidManifest.xml` :

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

### iOS

Les permissions suivantes sont configurées dans `ios/App/App/Info.plist` :

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>Cette application nécessite l'accès à votre galerie photos pour sauvegarder les images téléchargées.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Cette application nécessite l'accès à votre galerie photos pour sauvegarder les images téléchargées.</string>
```

## Utilisation

### Dans un composant Angular

```typescript
import { ImageDownloadService } from "../services/image-download.service";

export class MonComposant {
  constructor(private imageDownloadService: ImageDownloadService) {}

  async downloadImage() {
    try {
      await this.imageDownloadService.downloadImage("https://example.com/image.jpg", "mon_image.jpg");
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
    }
  }
}
```

### Dans le template HTML

```html
<ion-button (click)="downloadImage()" [disabled]="isDownloading">
  <ion-icon [name]="isDownloading ? 'hourglass-outline' : 'arrow-down-outline'" [class.spinning]="isDownloading"> </ion-icon>
</ion-button>
```

## Flux d'Utilisation

1. **Premier clic** : L'utilisateur clique sur le bouton de téléchargement
2. **Demande d'autorisation** : Le système demande l'autorisation d'accès à la galerie
3. **Confirmation** : L'utilisateur accepte l'autorisation
4. **Téléchargement** : L'image est automatiquement sauvegardée dans la galerie
5. **Utilisations suivantes** : Plus de demande d'autorisation, téléchargement direct

## Messages Utilisateur

- **Succès** : "Image téléchargée avec succès" ou "Image partagée avec succès"
- **Permission refusée** : "Permission refusée pour accéder à la galerie"
- **Erreur** : "Erreur lors du téléchargement de l'image"

## Dépendances

- `@capacitor/camera` : Pour la gestion des permissions
- `@capacitor/device` : Pour la détection de la plateforme
- `@ionic/angular` : Pour les composants UI et les toasts

## Notes Techniques

- L'API de partage native est utilisée en priorité sur iOS et Android moderne
- Un fallback est disponible pour les appareils plus anciens
- Les images sont converties en blob avant le téléchargement
- La gestion des erreurs est complète avec des messages utilisateur appropriés
