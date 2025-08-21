import { Component, OnInit, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonIcon,
  IonTabBar,
  IonTabs,
  IonTabButton,
} from '@ionic/angular/standalone';
import { AuthService, AppUser } from '../services/auth/auth.service';
import { Observable } from 'rxjs';

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
  tabs = viewChild<IonTabs>('tabs');
  selectedTab = signal<string | null>(null);
  public currentUser$: Observable<AppUser | null>;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {}

  setCurrentTab() {
    this.selectedTab.set(this.tabs()?.getSelected()!);
  }
}

