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
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

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
    IonButtons,
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
export class SignupPage implements OnInit {
  signupForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

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

  submitSignup() {
    this.signupForm.markAllAsTouched(); // Mark all fields as touched to show errors on submit
    if (this.signupForm.valid) {
      console.log(this.signupForm.value);
    } else {
      console.log('Formulaire invalide');
    }
  }
}
