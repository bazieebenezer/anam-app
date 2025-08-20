import { Routes } from '@angular/router';
// import { AuthGuard } from './guards/auth.guard';
// import { onboardingGuard } from './guards/onboarding.guard';

export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'bulletin-details/:id',
        loadComponent: () =>
          import('./pages/bulletin-details/bulletin-details.page').then(
            (m) => m.BulletinDetailsPage
          ),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./pages/events/events.page').then((m) => m.EventsPage),
      },
      {
        path: 'event-details/:id',
        loadComponent: () =>
          import('./pages/event-details/event-details.page').then(
            (m) => m.EventDetailsPage
          ),
      },
      {
        path: 'add',
        loadComponent: () =>
          import('./pages/add/add.page').then((m) => m.AddPage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings.page').then((m) => m.SettingsPage),
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/onboarding/onboarding.page').then(
        (m) => m.OnboardingPage
      ),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/auth/signup/signup.page').then((m) => m.SignupPage),
  },
  {
    path: 'signin',
    loadComponent: () =>
      import('./pages/auth/signin/signin.page').then((m) => m.SigninPage),
  },
];
