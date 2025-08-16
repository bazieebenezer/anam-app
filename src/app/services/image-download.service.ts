import { Injectable } from '@angular/core';
import { Camera, CameraPermissionType } from '@capacitor/camera';
import { Device } from '@capacitor/device';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class ImageDownloadService {
  constructor(private toastController: ToastController) {}

  async downloadImage(
    imageUrl: string,
    fileName: string = 'image.jpg'
  ): Promise<void> {
    try {
      // Vérifier si on est sur un appareil mobile
      const info = await Device.getInfo();

      // Pour les émulateurs et le développement, utiliser toujours le téléchargement web
      if (info.platform === 'web' || this.isEmulator()) {
        await this.downloadImageWeb(imageUrl, fileName);
        return;
      }

      console.log('Plateforme mobile détectée:', info.platform);

      // Sur mobile réel, vérifier et demander les permissions
      const hasPermission = await this.checkAndRequestPermissions();

      if (!hasPermission) {
        await this.showToast(
          'Permission refusée pour accéder à la galerie',
          'warning'
        );
        return;
      }

      // Télécharger l'image
      await this.downloadImageToGallery(imageUrl, fileName);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      await this.showToast(
        "Erreur lors du téléchargement de l'image",
        'danger'
      );
    }
  }

  private isEmulator(): boolean {
    // Détecter si on est dans un émulateur
    const userAgent = navigator.userAgent.toLowerCase();
    const isEmulator =
      userAgent.includes('emulator') ||
      userAgent.includes('android sdk') ||
      (userAgent.includes('chrome') && userAgent.includes('mobile'));

    return isEmulator;
  }

  private async checkAndRequestPermissions(): Promise<boolean> {
    try {
      // Vérifier les permissions actuelles
      const permissions = await Camera.checkPermissions();

      if (permissions.photos === 'granted') {
        return true;
      }

      // Demander les permissions
      const requestResult = await Camera.requestPermissions({
        permissions: ['photos'],
      });

      return requestResult.photos === 'granted';
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      return false;
    }
  }

  private async downloadImageToGallery(
    imageUrl: string,
    fileName: string
  ): Promise<void> {
    try {
      // Convertir l'URL en blob
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error("Impossible de récupérer l'image");
      }

      const blob = await response.blob();

      // Utiliser l'API de partage native si disponible
      if ('share' in navigator && navigator.canShare) {
        try {
          const file = new File([blob], fileName, {
            type: blob.type || 'image/jpeg',
          });

          const shareData = {
            files: [file],
            title: 'Image téléchargée',
            text: "Image sauvegardée depuis l'application ANAM",
          };

          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            await this.showToast('Image partagée avec succès', 'success');
            return;
          }
        } catch (shareError) {
          console.log(
            'Erreur lors du partage, utilisation du fallback:',
            shareError
          );
        }
      }

      // Fallback pour les appareils qui ne supportent pas l'API de partage
      await this.saveImageFallback(blob, fileName);
    } catch (error) {
      throw error;
    }
  }

  private async saveImageFallback(blob: Blob, fileName: string): Promise<void> {
    try {
      // Créer un objet URL pour le blob
      const blobUrl = URL.createObjectURL(blob);

      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      link.target = '_blank';

      // Ajouter au DOM et déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Nettoyer l'URL du blob
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        console.log('Blob URL nettoyée');
      }, 1000);

      await this.showToast('Image téléchargée avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors du fallback de téléchargement:', error);
      throw error;
    }
  }

  private async downloadImageWeb(
    imageUrl: string,
    fileName: string
  ): Promise<void> {
    try {
      // Récupérer l'image et créer un blob
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error("Impossible de récupérer l'image");
      }

      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.target = '_blank';
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Nettoyer l'URL du blob
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        console.log('Blob URL nettoyée');
      }, 1000);

      await this.showToast(
        `Image téléchargée avec succès !\n ${fileName}\n`,
        'success'
      );
    } catch (error) {
      console.error('Erreur lors du téléchargement web:', error);
      throw error;
    }
  }

  private async showToast(
    message: string,
    color: 'success' | 'warning' | 'danger' = 'success'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'bottom',
      buttons: [
        {
          text: 'OK',
          role: 'Fermer',
        },
      ],
    });
    await toast.present();
  }
}
