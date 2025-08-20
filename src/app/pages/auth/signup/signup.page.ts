import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ValidationErrors,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  IonContent,
  IonImg,
  IonButton,
  IonInput,
  IonButtons,
  IonTabButton,
  ToastController,
} from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

// Custom validator to check if passwords match
export function passwordsMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const passwordConfirm = control.get('passwordConfirm')?.value;

  // Return an error if passwords do not match
  return password && passwordConfirm && password !== passwordConfirm
    ? { passwordsMismatch: true }
    : null;
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonImg,
    IonContent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonInput,
    RouterLink,
  ],
})
export class SignupPage implements OnInit {
  signupForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.initSignUpForm();
  }

  private initSignUpForm() {
    this.signupForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        passwordConfirm: ['', [Validators.required]],
      },
      { validators: passwordsMatchValidator }
    );
  }

  async submitSignup() {
    this.signupForm.markAllAsTouched();
    if (this.signupForm.valid) {
      const { email, password } = this.signupForm.value;
      this.authService
        .createUserWithEmailAndPassword(email, password)
        .subscribe({
          next: async () => {
            const toast = await this.toastController.create({
              message: 'Inscription réussie.',
              duration: 2000,
              color: 'success',
            });
            toast.present();
            this.router.navigate(['/tabs/home']);
          },
          error: async (err) => {
            let message = 'Une erreur est survenue.';
            let color = 'danger';
            if (err.code === 'auth/email-already-in-use') {
              message = 'Cet email existe déjà.';
              color = 'warning';
            }
            const toast = await this.toastController.create({
              message,
              duration: 2000,
              color,
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

  async signUpWithGoogle() {
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
