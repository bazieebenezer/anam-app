import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
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
} from 'ionicons/icons';

import { registerLocaleData } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { PublicationService } from './services/publication/publication.service';

register();

registerLocaleData(localeFr);

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'fr-FR',
    },
  ],
})
export class AppComponent implements OnInit {
  constructor(private publicationService: PublicationService) {
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
      arrowForward
    });
  }

  ngOnInit() {
    this.publicationService.deleteExpiredBulletins();
  }
}

