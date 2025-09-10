import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed,
} from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class FcmService {
  constructor(private toastController: ToastController) {}

  async initPush() {
    if (Capacitor.getPlatform() !== 'web') {
      await this.registerPush();
    }
  }

  private async registerPush() {
    try {
      await this.addListeners();
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      }

      await PushNotifications.register();
    } catch (e) {
      console.error('Error registering for push notifications', e);
      await this.presentToast(
        'Error registering for push notifications',
        'danger'
      );
    }
  }

  async presentToast(
    message: string,
    color: 'success' | 'warning' | 'danger' | 'primary'
  ) {
    const toast = await this.toastController.create({
      message: message,
      duration: 8000,
      color: color,
      position: 'top',
      cssClass: 'top-toast',
    });
    toast.present();
  }

  private async addListeners() {
    // On success, we should be able to receive notifications
    await PushNotifications.addListener(
      'registration',
      async (token: Token) => {
        console.log('Push registration success, token: ' + token.value);
        // Subscription logic will now be handled by the AuthService
        // to allow for dynamic topic subscription based on user profile.
      }
    );

    // Some issue with our setup and push will not work
    await PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    await PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push received: ' + JSON.stringify(notification));
        this.presentToast(`${notification.title}`, 'primary');
      }
    );

    // Method called when user taps on notification
    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
        // Here you can add navigation logic based on the notification data
      }
    );
  }

  async subscribeToTopic(topic: string) {
    if (Capacitor.getPlatform() === 'web') return;
    try {
      await FCM.subscribeTo({ topic });
      console.log(`Subscribed to topic: ${topic}`);
      // await this.presentToast(`Subscribed to ${topic}`, 'success');
    } catch (e) {
      console.error(`Error subscribing to topic ${topic}`, e);
      // await this.presentToast(`Error subscribing to ${topic}`, 'danger');
    }
  }

  async unsubscribeFromTopic(topic: string) {
    if (Capacitor.getPlatform() === 'web') return;
    try {
      await FCM.unsubscribeFrom({ topic });
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (e) {
      console.error(`Error unsubscribing from topic ${topic}`, e);
    }
  }
}
