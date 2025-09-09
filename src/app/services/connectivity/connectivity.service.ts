import { Injectable } from '@angular/core';
import { ConnectionStatus, Network } from '@capacitor/network';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ConnectivityService {
  private offlineToast: HTMLIonToastElement | null = null;

  constructor(private toastController: ToastController) {}

  public async initialize() {
    const status = await Network.getStatus();
    if (!status.connected) {
      this.presentOfflineToast();
    }

    Network.addListener('networkStatusChange', async (status: ConnectionStatus) => {
      if (status.connected) {
        this.presentOnlineToast();
      } else {
        this.presentOfflineToast();
      }
    });
  }

  private async presentOfflineToast() {
    if (this.offlineToast) {
      return; // Already showing
    }

    this.offlineToast = await this.toastController.create({
      message: "Vous n'êtes pas connecté à Internet",
      color: 'warning',
      position: 'top',
      duration: 0, // Persistent
      buttons: [
        {
          side: 'start',
          icon: 'wifi',
        },
        {
          side: 'end',
          icon: 'remove-circle-outline',
          role: 'cancel',
        },
      ],
    });

    await this.offlineToast.present();

    this.offlineToast.onDidDismiss().then(() => {
      this.offlineToast = null;
    });
  }

  private async presentOnlineToast() {
    if (this.offlineToast) {
      await this.offlineToast.dismiss();
    }

    const onlineToast = await this.toastController.create({
      message: 'Vous êtes connecté à Internet',
      color: 'success',
      position: 'top',
      duration: 3000,
      buttons: [
        {
          side: 'start',
          icon: 'wifi',
        },
        {
          side: 'end',
          icon: 'checkmark-outline',
          role: 'cancel',
        },
      ],
    });

    await onlineToast.present();
  }
}
