import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
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
    ],
  },
];
