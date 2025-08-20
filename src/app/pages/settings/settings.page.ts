import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonToggle,
  IonRadioGroup,
  IonRadio,
  IonIcon,
  IonList,
} from '@ionic/angular/standalone';
import { ThemeService } from '../../services/theme.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    IonList,
    IonIcon,
    IonRadio,
    IonRadioGroup,
    IonToggle,
    IonItem,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    RouterLink,
  ],
})
export class SettingsPage implements OnInit {
  currentTheme: 'light' | 'dark' = 'light';
  private destroy$ = new Subject<void>();

  constructor(private themeService: ThemeService) {
    // S'abonner aux changements de thème
    this.themeService.isDarkMode
      .pipe(takeUntil(this.destroy$))
      .subscribe((isDark) => {
        this.currentTheme = isDark ? 'dark' : 'light';
      });
  }

  ngOnInit() {
    // Initialiser le thème actuel
    this.themeService.isDarkMode
      .pipe(takeUntil(this.destroy$))
      .subscribe((isDark: boolean) => {
        this.currentTheme = isDark ? 'dark' : 'light';
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  themeChanged(event: any) {
    const isDark = event.detail.value === 'dark';
    this.themeService.setDarkMode(isDark);
  }
}
