import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class ShareService {

  constructor(
    private platform: Platform,
    private toastController: ToastController
  ) { }

  async shareItem({ title, description, images }: { title: string; description: string; images: string[]; }) {
    // Partage sur plateforme native (iOS/Android)
    if (this.platform.is('capacitor')) {
      try {
        // Sur natif, on ne partage que la première image pour une meilleure compatibilité
        const response = await fetch(images[0]);
        const blob = await response.blob();

        const fileName = new Date().getTime() + '.jpeg';
        const { uri } = await Filesystem.writeFile({
          path: fileName,
          data: await this.blobToBase64(blob),
          directory: Directory.Cache,
        });

        await Share.share({
          title: title,
          text: `${title}\n\n${description}`,
          files: [uri],
        });
      } catch (error) {
        console.error('Erreur lors du partage natif:', error);
        // Fallback au partage de texte seul
        await this.shareFallback(title, description);
      }
    } else {
      // Partage sur le Web (texte seul)
      await this.shareFallback(title, description);
    }
  }

  // Méthode de partage pour le web : texte uniquement pour une fiabilité maximale.
  private async shareFallback(title: string, description: string) {
    try {
      await Share.share({
        title: title,
        text: `${title}\n\n${description}`,
      });
    } catch (error) {
      console.error('Erreur de partage fallback final:', error);
      this.showToast('Le partage a échoué.', 'danger');
    }
  }

  private async showToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  // Utilitaire pour convertir un Blob en base64 pour Filesystem.writeFile
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  }
}