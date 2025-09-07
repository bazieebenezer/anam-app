import { Component, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonRadioGroup,
  IonRadio,
  IonIcon,
  IonList,
  ToastController,
  AlertController,
  IonCard,
  IonCardContent,
  IonAvatar,
  IonText } from '@ionic/angular/standalone';
import { ThemeService } from '../../services/theme.service';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { AuthService, AppUser } from '../../services/auth/auth.service';
import { firstValueFrom } from 'rxjs';

type Theme = 'light' | 'dark' | 'system';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [ IonText, IonAvatar, IonCardContent, IonCard, 
    IonList,
    IonIcon,
    IonRadio,
    IonRadioGroup,
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
  currentTheme: Theme = 'system';
  private destroy$ = new Subject<void>();
  public currentUser$!: Observable<AppUser | null>;
  private authService!: AuthService;

  constructor(
    private themeService: ThemeService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private injector: Injector
  ) {}

  ngOnInit() {
    this.authService = this.injector.get(AuthService);
    this.currentUser$ = this.authService.currentUser$;
    this.currentTheme = this.themeService.getTheme();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  themeChanged(event: any) {
    const selectedTheme = event.detail.value as Theme;
    this.themeService.setTheme(selectedTheme);
  }

  async promptBecomeAdmin() {
    const alert = await this.alertController.create({
      header: 'Devenir administrateur',
      message: 'Veuillez entrer le code de vérification.',
      inputs: [
        {
          name: 'code',
          type: 'text',
          placeholder: 'Code de vérification',
        },
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'Valider',
          handler: async (data) => {
            if (data.code === '02112') {
              try {
                const setUserAdminPromise = this.authService.setUserAsAdmin();
                if (setUserAdminPromise) {
                  await firstValueFrom(setUserAdminPromise);
                  const toast = await this.toastController.create({
                    message: 'Vous êtes maintenant un administrateur.',
                    duration: 2000,
                    color: 'success',
                  });
                  toast.present();
                } else {
                  this.showErrorToast('Utilisateur non connecté.');
                }
              } catch (error) {
                this.showErrorToast('Une erreur est survenue.');
              }
            } else {
              this.showErrorToast('Code de vérification incorrect.');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'danger',
    });
    toast.present();
  }

  async promptBecomeInstitution() {
    const user = await firstValueFrom(this.currentUser$);
    if (user && user.isInstitution) {
      this.router.navigate(['/tabs/home']);
      return;
    }

    const alert = await this.alertController.create({
      header: 'Devenir une institution',
      message: 'Veuillez entrer le code de vérification pour les institutions.',
      inputs: [
        {
          name: 'code',
          type: 'text',
          placeholder: 'Code de vérification',
        },
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'Valider',
          handler: async (data) => {
            if (data.code === '95160') {
              try {
                const setUserInstitutionPromise = this.authService.setUserAsInstitution();
                if (setUserInstitutionPromise) {
                  await firstValueFrom(setUserInstitutionPromise);
                  const toast = await this.toastController.create({
                    message: 'Vous êtes maintenant une institution.',
                    duration: 2000,
                    color: 'success',
                  });
                  toast.present();
                  this.router.navigate(['/tabs/home']);
                } else {
                  this.showErrorToast('Utilisateur non connecté.');
                }
              } catch (error) {
                this.showErrorToast('Une erreur est survenue.');
              }
            } else {
              this.showErrorToast('Code de vérification incorrect.');
            }
          },
        },
      ],
    });
    await alert.present();
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
