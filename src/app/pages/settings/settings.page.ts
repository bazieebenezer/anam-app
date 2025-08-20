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
  ToastController, IonGrid, IonFab } from '@ionic/angular/standalone';
import { ThemeService } from '../../services/theme.service';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonFab, IonGrid, 
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
  public isAuthenticated$: Observable<any>;

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
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

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/signin']);
    const toast = await this.toastController.create({
      message: 'Vous avez été déconnecté.',
      duration: 2000,
      color: 'success',
    });
    toast.present();
  }
}
