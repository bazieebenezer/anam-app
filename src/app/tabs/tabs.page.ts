import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonIcon,
  IonTabBar,
  IonTabs,
  IonTabButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonTabs,
    CommonModule,
    FormsModule,
    IonTabButton,
    IonTabBar,
  ],
})
export class TabsPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
