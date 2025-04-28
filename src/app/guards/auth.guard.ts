import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, CanLoadFn, Router, RouterStateSnapshot } from '@angular/router';
import { map, take, filter } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ModalController } from '@ionic/angular/standalone';
import { VerificationModalComponent } from '../components/verification-modal/verification-modal.component';

// Rate limiting implementation (can be moved to a separate service for production)
const loginAttempts = new Map<string, { count: number, timestamp: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 10 * 60 * 1000; // 10 minutes

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const modalController = inject(ModalController);
  
  // Simple client identifier - in production, use a more robust approach
  const clientId = state.url;
  
  // Basic rate limiting check
  const attempts = loginAttempts.get(clientId);
  if (attempts && attempts.count >= MAX_ATTEMPTS) {
    const timeDiff = Date.now() - attempts.timestamp;
    if (timeDiff < LOCKOUT_TIME) {
      console.warn(`Rate limit exceeded for path: ${clientId}`);
      router.navigate(['/login'], {
        queryParams: {
          error: 'Too many attempts. Please try again later.'
        }
      });
      return false;
    } else {
      // Reset after lockout period
      loginAttempts.delete(clientId);
    }
  }

  return authService.user$.pipe(
    filter(user => user !== undefined), // Wait until we have a definitive null or user object
    take(1),
    map(user => {
      if (!user) {
        // Track login attempts for rate limiting
        if (!loginAttempts.has(clientId)) {
          loginAttempts.set(clientId, { count: 1, timestamp: Date.now() });
        } else {
          const current = loginAttempts.get(clientId)!;
          loginAttempts.set(clientId, {
            count: current.count + 1,
            timestamp: Date.now()
          });
        }
        
        // Redirect to login with return URL
        router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      }
      
      // Check if email is verified
      if (!user.isVerified) {
        console.log('User not verified, showing verification modal');
        
        // Present the verification modal
        presentVerificationModal(modalController, user.email);
        
        // Block access to the requested route
        return false;
      }
      
      // User is logged in and verified, allow access
      return true;
    })
  );
};

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const modalController = inject(ModalController);
  const allowedRoles = route.data?.['roles'] as string[] || ['admin', 'farmer'];
  
  return authService.user$.pipe(
    filter(user => user !== undefined), // Wait until we have a definitive null or user object
    take(1),
    map(user => {
      if (!user) {
        // Not logged in, redirect to login
        router.navigate(['/login']);
        return false;
      }
      
      // Check if email is verified first
      if (!user.isVerified) {
        console.log('User not verified, showing verification modal');
        
        // Present the verification modal
        presentVerificationModal(modalController, user.email);
        
        // Block access to the requested route
        return false;
      }
      
      // Check user role
      if (allowedRoles.includes(user.role)) {
        return true;
      } else {
        // User is logged in but doesn't have the required role
        console.warn(`User ${user.uid} with role ${user.role} attempted to access route requiring roles: ${allowedRoles}`);
        router.navigate(['/unauthorized']);
        return false;
      }
    })
  );
};

// Add a canLoad guard for lazy-loaded modules
export const canLoadGuard: CanLoadFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const modalController = inject(ModalController);
  const allowedRoles = route.data?.['roles'] as string[];
  
  return authService.user$.pipe(
    filter(user => user !== undefined), // Wait until we have a definitive null or user object
    take(1),
    map(user => {
      if (!user) {
        router.navigate(['/login']);
        return false;
      }
      
      // Check if email is verified first
      if (!user.isVerified) {
        console.log('User not verified, showing verification modal');
        
        // Present the verification modal
        presentVerificationModal(modalController, user.email);
        
        // Block access to the requested route
        return false;
      }
      
      // Check user role if specified
      if (!allowedRoles || allowedRoles.includes(user.role)) {
        return true;
      } else {
        router.navigate(['/unauthorized']);
        return false;
      }
    })
  );
};

// Helper function to present the verification modal
async function presentVerificationModal(modalController: ModalController, email: string) {
  const modal = await modalController.create({
    component: VerificationModalComponent,
    componentProps: { email },
    backdropDismiss: false,
    cssClass: 'verification-modal'
  });
  
  await modal.present();
  
  const { data } = await modal.onDidDismiss();
  
  if (data?.verified) {
    // User has verified their email, continue
    return true;
  }
  
  return false;
}