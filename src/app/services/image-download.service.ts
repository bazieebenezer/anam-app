import { Injectable } from '@angular/core';
import { Filesystem, Directory, WriteFileResult } from '@capacitor/filesystem';
import { Platform, ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class ImageDownloadService {
  constructor(
    private platform: Platform,
    private toastController: ToastController
  ) {}

  async downloadImage(
    imageUrl: string,
    fileName: string = 'image.jpg'
  ): Promise<void> {
    try {
      if (this.platform.is('capacitor')) {
        // Logique pour les plateformes natives (iOS/Android)
        await this.saveImageNative(imageUrl, fileName);
      } else {
        // Logique pour le Web
        await this.saveImageWeb(imageUrl, fileName);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      await this.showToast(
        "Erreur lors du téléchargement de l'image",
        'danger'
      );
    }
  }

  private async saveImageNative(
    imageUrl: string,
    fileName: string
  ): Promise<void> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const base64Data = await this.blobToBase64(blob);

      const result: WriteFileResult = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents, // Sauvegarde dans le dossier Documents
      });

      console.log('Image sauvegardée sur le natif:', result.uri);
      await this.showToast('Image sauvegardée dans vos documents', 'success');
    } catch (error) {
      console.error("Erreur lors de l'enregistrement natif:", error);
      // Tenter de sauvegarder dans la galerie comme fallback
      await this.showToast(
        "Impossible de sauvegarder dans les documents. L'enregistrement dans la galerie n'est pas encore implémenté.",
        'warning'
      );
      throw error; // Propage l'erreur pour le gestionnaire global
    }
  }

  private async saveImageWeb(
    imageUrl: string,
    fileName: string
  ): Promise<void> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error("Impossible de récupérer l'image");
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000); // Nettoyage

      await this.showToast('Image téléchargée avec succès!', 'success');
    } catch (error) {
      console.error('Erreur lors du téléchargement web:', error);
      throw error; // Propage l'erreur
    }
  }

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
          role: 'cancel',
        },
      ],
    });
    await toast.present();
  }
}
