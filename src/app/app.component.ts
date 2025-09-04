import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import localeFr from '@angular/common/locales/fr';
import { register } from 'swiper/element/bundle';

import {
  add, addOutline, appsOutline, arrowDownOutline, arrowForward, calendarOutline, chevronForwardOutline, close, closeCircle, downloadOutline, filterOutline, homeOutline, homeSharp, image, newspaper, newspaperOutline, newspaperSharp, notificationsOutline, refresh, remove, settings, settingsOutline, shareSharp, shareSocial, trash
} from 'ionicons/icons';

import { PublicationService } from './services/publication/publication.service';
import { FcmService } from './services/fcm/fcm.service';

register();
registerLocaleData(localeFr);

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true, // Flag to mark component as standalone
  imports: [IonApp, IonRouterOutlet, CommonModule], // Import necessary modules
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'fr-FR',
    },
  ],
})
export class AppComponent implements OnInit {
  constructor(
    private publicationService: PublicationService,
    private fcmService: FcmService // Inject the FCM service
  ) {
    this.addIcons();
    this.initializeApp(); // Initialize the app
  }

  initializeApp() {
    // Initialize push notifications
    this.fcmService.initPush();
  }

  ngOnInit() {
    this.publicationService.deleteExpiredBulletins();
  }

  private addIcons() {
    addIcons({
      homeOutline, newspaperOutline, newspaperSharp, addOutline, settingsOutline, notificationsOutline, filterOutline, shareSharp, shareSocial, arrowDownOutline, homeSharp, downloadOutline, close, add, remove, refresh, calendarOutline, newspaper, settings, closeCircle, image, chevronForwardOutline, trash, arrowForward, appsOutline
    });
  }
}

