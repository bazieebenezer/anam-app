import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import localeFr from '@angular/common/locales/fr';

import {
  add,
  addOutline,
  arrowDownOutline,
  calendarOutline,
  close,
  downloadOutline,
  filterOutline,
  homeOutline,
  homeSharp,
  newspaper,
  newspaperOutline,
  newspaperSharp,
  notificationsOutline,
  refresh,
  remove,
  settingsOutline,
  shareSharp,
  shareSocial,
  settings,
  closeCircle,
  image,
  arrowDownRightBox,
  chevronForwardOutline,
  trash,
  arrowForward,
  appsOutline,
} from 'ionicons/icons';

import { registerLocaleData } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { PublicationService } from './services/publication/publication.service';
import { NotificationService } from './services/notification.service';

register();

registerLocaleData(localeFr);

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
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
    private notificationService: NotificationService,
    private platform: Platform
  ) {
    addIcons({
      homeOutline,
      newspaperOutline,
      newspaperSharp,
      addOutline,
      settingsOutline,
      notificationsOutline,
      filterOutline,
      shareSharp,
      shareSocial,
      arrowDownOutline,
      homeSharp,
      downloadOutline,
      close,
      add,
      remove,
      refresh,
      calendarOutline,
      newspaper,
      settings,
      closeCircle,
      image,
      chevronForwardOutline,
      trash,
      arrowForward,
      appsOutline,
    });
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.notificationService.initOneSignal();

      // For best user experience, it's recommended to prompt for notifications
      // at a more appropriate time, like after login or from a settings page.
      // We are calling it here on startup for simplicity of testing.
      this.notificationService.promptForPushNotifications();
    });
  }

  ngOnInit() {
    this.publicationService.deleteExpiredBulletins();
  }
}