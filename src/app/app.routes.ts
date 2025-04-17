import { Router, Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';
import { inject } from '@angular/core';
import { take, tap } from 'rxjs';
import { AuthService } from './services/auth.service';

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
    loadComponent: () => import('./pages/farmer-profile/farmer-profile.component')
      .then(m => m.FarmerPublicProfilePage)
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/product-list/product-list.page').then(m => m.ProductListPage)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./pages/products/product-detail/product-detail.page').then(m => m.ProductDetailPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/farmer/profile/farmer-profile.page').then(m => m.FarmerProfilePage)
  },
  {
    path: 'farmer',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['farmer'] },
    loadChildren: () => import('./pages/farmer/farmer.routes').then(m => m.FARMER_ROUTES)
  },
  {
    path: 'customer',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['customer'] },
    loadChildren: () => import('./pages/customer/customer.routes').then(m => m.CUSTOMER_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  // Chat routes
  {
    path: 'customer/chats',
    loadComponent: () => import('./pages/chat/chat-list.component').then(m => m.ChatListComponent)
  },
  {
    path: 'customer/chats/:userId',
    loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatComponent)
  },
  {
    path: 'farmer/chats',
    loadComponent: () => import('./pages/chat/chat-list.component').then(m => m.ChatListComponent)
  },
  {
    path: 'farmer/chats/:userId',
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
  }
  ,
  
  {
    path: '**',
    redirectTo: ''
  }
];