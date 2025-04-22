import { Router, Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';
import { inject } from '@angular/core';
import { take } from 'rxjs';
import { AuthService } from './services/auth.service';
import { productIdResolver } from './resolvers/product-id.resolver';
import { userIdResolver } from './resolvers/user-id.resolver';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'farmers/:id',
    resolve: { valid: userIdResolver },
    loadComponent: () => import('./pages/farmer-profile/farmer-profile.component')
      .then(m => m.FarmerPublicProfilePage)
  },

  {
    path: 'products',
    loadComponent: () => import('./pages/products/product-list/product-list.page').then(m => m.ProductListPage)
  },
  {
    path: 'products/:id',
    resolve: { valid: productIdResolver },
    loadComponent: () => import('./pages/products/product-detail/product-detail.page').then(m => m.ProductDetailPage)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/farmer/profile/farmer-profile.page').then(m => m.FarmerProfilePage)
  },
  {
    path: 'farmer',
    canActivate: [authGuard, roleGuard],
    canLoad: [authGuard, roleGuard], // Added canLoad for lazy-loaded modules
    data: { roles: ['farmer'] },
    loadChildren: () => import('./pages/farmer/farmer.routes').then(m => m.FARMER_ROUTES)
  },
  {
    path: 'customer',
    canActivate: [authGuard, roleGuard],
    canLoad: [authGuard, roleGuard], // Added canLoad for lazy-loaded modules
    data: { roles: ['customer'] },
    loadChildren: () => import('./pages/customer/customer.routes').then(m => m.CUSTOMER_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    canLoad: [authGuard, roleGuard], // Added canLoad for lazy-loaded modules
    data: { roles: ['admin'] },
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  // Chat routes
  {
    path: 'customer/chats',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['customer'] },
    loadComponent: () => import('./pages/chat/chat-list.component').then(m => m.ChatListComponent)
  },
  {
    path: 'customer/chats/:userId',
    canActivate: [authGuard, roleGuard],
    resolve: { valid: userIdResolver },
    data: { roles: ['customer'] },
    loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatComponent)
  },
  {
    path: 'farmer/chats',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['farmer'] },
    loadComponent: () => import('./pages/chat/chat-list.component').then(m => m.ChatListComponent)
  },
  {
    path: 'farmer/chats/:userId',
    canActivate: [authGuard, roleGuard],
    resolve: { valid: userIdResolver },
    data: { roles: ['farmer'] },
    loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatComponent)
  },
  {
    path: 'chats',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        resolve: {
          role: () => {
            const authService = inject(AuthService);
            const router = inject(Router);
            
            authService.user$.pipe(
              take(1)
            ).subscribe(user => {
              if (user) {
                router.navigate([`/${user.role}/chats`]);
              } else {
                router.navigate(['/login']);
              }
            });
            
            return true;
          }
        },
        loadComponent: () => import('./pages/chat/chat-list.component').then(m => m.ChatListComponent)
      },
      {
        path: ':userId',
        redirectTo: '/:userId',
        pathMatch: 'full'
      }
    ]
  },
  // Added route for unauthorized access
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/errors/unathorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];