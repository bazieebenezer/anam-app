import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private readonly ONBOARDING_KEY = 'hasSeenOnboarding';

  constructor() { }

  async hasSeenOnboarding(): Promise<boolean> {
    const { value } = await Preferences.get({ key: this.ONBOARDING_KEY });
    return value === 'true' || false;
  }

  async setOnboardingComplete(): Promise<void> {
    await Preferences.set({
      key: this.ONBOARDING_KEY,
      value: 'true'
    });
  }
}
