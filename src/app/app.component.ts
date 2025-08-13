import { Component, LOCALE_ID } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import localeFr from '@angular/common/locales/fr';
import {
  addOutline,
  arrowDownOutline,
  filterOutline,
  homeOutline,
  homeSharp,
  newspaperOutline,
  newspaperSharp,
  notificationsOutline,
  settingsOutline,
  shareSharp,
  shareSocial,
} from 'ionicons/icons';
import { registerLocaleData } from '@angular/common';

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
export class AppComponent {
  constructor() {
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
    });
  }
}
