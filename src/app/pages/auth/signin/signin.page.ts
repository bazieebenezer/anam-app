import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  IonContent,
  IonImg,
  IonButton,
  IonButtons,
  IonInput,
  ToastController,
} from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonImg,
    IonContent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonInput,
    RouterLink
  ],
})
export class SigninPage implements OnInit {
  signinForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.initSignInForm();
  }

  private initSignInForm() {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  async submitSignin() {
    this.signinForm.markAllAsTouched();
    if (this.signinForm.valid) {
      const { email, password } = this.signinForm.value;
      this.authService.loginWithEmailAndPassword(email, password).subscribe({
        next: async () => {
          const toast = await this.toastController.create({
            message: 'Connexion réussie.',
            duration: 2000,
            color: 'success',
          });
          toast.present();
          this.router.navigate(['/tabs/home']);
        },
        error: async (err) => {
          const toast = await this.toastController.create({
            message: err.message,
            duration: 2000,
            color: 'danger',
          });
          toast.present();
        },
      });
    } else {
      const toast = await this.toastController.create({
        message: 'Formulaire invalide.',
        duration: 2000,
        color: 'warning',
      });
      toast.present();
    }
  }

  async signInWithGoogle() {
    this.authService.loginWithGoogle().subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Connexion réussie.',
          duration: 2000,
          color: 'success',
        });
        toast.present();
        this.router.navigate(['/tabs/home']);
      },
      error: async (err) => {
        const toast = await this.toastController.create({
          message: err.message,
          duration: 2000,
          color: 'danger',
        });
        toast.present();
      },
    });
  }
}

