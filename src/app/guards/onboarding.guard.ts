import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OnboardingService } from '../services/onboarding.service';

export const onboardingGuard: CanActivateFn = async () => {
  const onboardingService = inject(OnboardingService);
  const router = inject(Router);

  const hasSeenOnboarding = await onboardingService.hasSeenOnboarding();

  if (!hasSeenOnboarding) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
