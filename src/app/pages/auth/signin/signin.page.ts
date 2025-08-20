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
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
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
  ],
})
export class SigninPage implements OnInit {
  signinForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initSignInForm();
  }

  private initSignInForm() {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  submitSignin() {
    this.signinForm.markAllAsTouched();
    if (this.signinForm.valid) {
      console.log(this.signinForm.value);
    } else {
      console.log('Formulaire invalide');
    }
  }
}
