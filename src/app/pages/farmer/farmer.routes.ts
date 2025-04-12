import { Routes } from '@angular/router';

export const FARMER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.page').then(m => m.FarmerDashboardPage)
  },
  {
    path: 'products/new',
    loadComponent: () => import('./product-form/product-form.component').then(m => m.ProductFormComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./product-form/product-form.component').then(m => m.ProductFormComponent)
  },
  {
    path: 'requests',
    loadComponent: () => import('./requests/farmer-requests.page').then(m => m.FarmerRequestsPage)
  }
];