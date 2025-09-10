import { Injectable } from '@angular/core';
import { ConnectionStatus, Network } from '@capacitor/network';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ConnectivityService {
  private offlineToast: HTMLIonToastElement | null = null;
  private wasOffline = false; // <-- nouvel indicateur

  constructor(private toastController: ToastController) {}

  public async initialize() {
    const status = await Network.getStatus();
    this.wasOffline = !status.connected;

    if (this.wasOffline) {
      this.presentOfflineToast();
    }

    Network.addListener(
      'networkStatusChange',
      async (status: ConnectionStatus) => {
        if (status.connected) {
          if (this.wasOffline) {
            // <-- seulement si on était offline avant
            this.presentOnlineToast();
            this.wasOffline = false;
          }
          if (this.offlineToast) {
            await this.offlineToast.dismiss();
          }
        } else {
          if (!this.wasOffline) {
            // <-- seulement si on était online avant
            this.presentOfflineToast();
            this.wasOffline = true;
          }
        }
      }
    );
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
      cssClass: 'top-toast',
      buttons: [
        { side: 'start', icon: 'wifi' },
        { side: 'end', icon: 'remove-circle-outline', role: 'cancel' },
      ],
    });

    await this.offlineToast.present();

    this.offlineToast.onDidDismiss().then(() => {
      this.offlineToast = null;
    });
  }

  private async presentOnlineToast() {
    const onlineToast = await this.toastController.create({
      message: 'Vous êtes connecté à Internet',
      color: 'success',
      position: 'top',
      duration: 3000,
      cssClass: 'top-toast',
      buttons: [
        { side: 'start', icon: 'wifi' },
        { side: 'end', icon: 'checkmark-outline', role: 'cancel' },
      ],
    });
    await onlineToast.present();
  }
}
