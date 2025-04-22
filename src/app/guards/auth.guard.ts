import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, CanLoadFn, Router, RouterStateSnapshot } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Rate limiting implementation (can be moved to a separate service for production)
const loginAttempts = new Map<string, { count: number, timestamp: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 10 * 60 * 1000; // 10 minutes

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
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
    take(1),
    map(user => {
      if (user) {
        return true;
      } else {
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
    })
  );
};

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data?.['roles'] as string[];

  return authService.user$.pipe(
    take(1),
    map(user => {
      if (user && allowedRoles.includes(user.role)) {
        return true;
      } else if (user) {
        // User is logged in but doesn't have the required role
        console.warn(`User ${user.uid} with role ${user.role} attempted to access route requiring roles: ${allowedRoles}`);
        router.navigate(['/unauthorized']);
        return false;
      } else {
        // Not logged in, handled by authGuard
        router.navigate(['/login']);
        return false;
      }
    })
  );
};

// Add a canLoad guard for lazy-loaded modules
export const canLoadGuard: CanLoadFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data?.['roles'] as string[];
  
  return authService.user$.pipe(
    take(1),
    map(user => {
      if (user) {
        if (!allowedRoles || allowedRoles.includes(user.role)) {
          return true;
        } else {
          router.navigate(['/unauthorized']);
          return false;
        }
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};