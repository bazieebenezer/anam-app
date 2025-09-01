import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth/auth.service';
import { environment } from '../../environments/environment';
import { Capacitor } from '@capacitor/core';

declare const OneSignal: any; // Declare global OneSignal for web SDK

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private authService: AuthService, private http: HttpClient) {}

  initOneSignal() {
    if (Capacitor.getPlatform() === 'web') {
      this.registerWebOneSignal();
    } else {
      this.registerNativeOneSignal();
    }
  }

  private registerWebOneSignal() {
    console.log('Initializing OneSignal for Web...');

    // Use the OneSignalDeferred pattern for web initialization
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      await OneSignal.init({
        appId: 'a301deef-9c27-47b2-8f7f-a1b7ee7889ee',
        allowLocalhostAsSecureOrigin: true,
      });

      OneSignal.on('subscriptionChange', (isSubscribed: boolean) => {
        if (isSubscribed) {
          OneSignal.getUserId().then((userId: string) => {
            console.log('Web OneSignal Player ID:', userId);
            this.authService.updateUserPlayerId(userId);
          });
        } else {
          console.log('Web user unsubscribed from notifications.');
        }
      });

      OneSignal.on('notificationDisplay', (event: any) => {
        console.log('Web notification displayed:', event);
      });

      // Prompt for push notifications (optional, can be called later)
      OneSignal.showSlidedownPrompt();
    });
  }

  private registerNativeOneSignal() {
    console.log('Initializing OneSignal for Native...');
    OneSignal.setAppId('a301deef-9c27-47b2-8f7f-a1b7ee7889ee');

    OneSignal.getDeviceState((state: any) => {
      if (state?.userId) {
        console.log('Native OneSignal Player ID:', state.userId);
        this.authService.updateUserPlayerId(state.userId);
      }
    });

    OneSignal.addSubscriptionObserver((event: any) => {
      if (event.to.isSubscribed) {
        console.log('Native OneSignal Player ID from observer:', event.to.userId);
        this.authService.updateUserPlayerId(event.to.userId);
      }
    });

    // Optional: Handle notification opened
    OneSignal.setNotificationOpenedHandler((jsonData: any) => {
      console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
    });
  }

  sendPushNotification(notificationData: { title: string; description: string; recipientId?: string }) {
    return this.http.post(environment.functionUrl, notificationData);
  }

  promptForPushNotifications() {
    // This method is called from app.component.ts
    // For native, it will prompt immediately.
    // For web, you might want to use OneSignal.showSlidedownPrompt() or a custom UI.
    if (Capacitor.getPlatform() === 'web') {
      // The actual prompt is now handled inside registerWebOneSignal after init
      console.log('Web: Prompting for push notifications via OneSignal SDK (handled internally).');
    } else {
      OneSignal.promptForPushNotificationsWithUserResponse();
    }
  }
}