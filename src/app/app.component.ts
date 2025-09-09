import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import localeFr from '@angular/common/locales/fr';
import { register } from 'swiper/element/bundle';

import {
  add,
  addOutline,
  appsOutline,
  arrowDownOutline,
  arrowForward,
  calendarOutline,
  chevronForwardOutline,
  close,
  closeCircle,
  downloadOutline,
  filterOutline,
  homeOutline,
  homeSharp,
  image,
  newspaper,
  newspaperOutline,
  newspaperSharp,
  notificationsOutline,
  refresh,
  remove,
  settings,
  settingsOutline,
  shareSharp,
  shareSocial,
  trash,
  logInOutline,
  wifi,
  removeCircleOutline,
  checkmarkOutline,
} from 'ionicons/icons';

import { PublicationService } from './services/publication/publication.service';
import { FcmService } from './services/fcm/fcm.service';
import { ThemeService } from './services/theme.service';
import { ConnectivityService } from './services/connectivity/connectivity.service';

register();
registerLocaleData(localeFr);

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, CommonModule],
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
    private fcmService: FcmService,
    private themeService: ThemeService,
    private connectivityService: ConnectivityService
  ) {
    this.addIcons();
    this.initializeApp();
  }

  initializeApp() {
    this.fcmService.initPush();
    this.connectivityService.initialize();
  }

  ngOnInit() {
    this.publicationService.deleteExpiredBulletins();
  }

  private addIcons() {
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
      logInOutline,
      wifi,
      removeCircleOutline,
      checkmarkOutline,
    });
  }
}
