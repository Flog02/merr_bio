import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.page').then(m => m.AdminDashboardPage)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./products/admin-product-detail.page').then(m => m.AdminProductDetailPage)
  },
  {
    path: 'users',
    loadComponent: () => import('./users/admin-users.page').then(m => m.AdminUsersPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/admin-profile.page').then(m => m.AdminProfilePage)
  }
];