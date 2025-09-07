import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonImg, IonButton } from '@ionic/angular/standalone';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [IonButton, IonImg, IonContent, CommonModule, FormsModule],
})
export class OnboardingPage {
  constructor(
    private router: Router,
    private onboardingService: OnboardingService
  ) {}

  

  async finishOnboarding() {
    await this.onboardingService.setOnboardingComplete();
    this.router.navigate(['/tabs']);
  }
}
