import { Routes } from '@angular/router';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/customer-dashboard.page').then(m => m.CustomerDashboardPage)
  },
  {
    path: 'requests',
    loadComponent: () => import('./requests/customer-requests.page').then(m => m.CustomerRequestsPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/customer-profile.page').then(m => m.CustomerProfilePage)
  }
];