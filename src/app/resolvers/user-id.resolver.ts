import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { UserService } from '../services/user.service';

export const userIdResolver: ResolveFn<boolean> = (route: ActivatedRouteSnapshot) => {
  // Check if we're resolving a userId or an id parameter
  const paramName = route.routeConfig?.path?.includes('chats') ? 'userId' : 'id';
  const userId = route.paramMap.get(paramName);
  const userService = inject(UserService);
  const router = inject(Router);
  
  if (!userId) {
    // Determine where to redirect based on the route
    const redirectPath = paramName === 'userId' ? '/chats' : '/home';
    router.navigate([redirectPath]);
    return of(false);
  }
  
  return userService.getUserById(userId).pipe(
    map(user => {
      if (user) {
        return true;
      } else {
        // Redirect based on the route type
        const redirectPath = paramName === 'userId' ? '/chats' : '/home';
        router.navigate([redirectPath]);
        return false;
      }
    }),
    catchError(() => {
      // Redirect based on the route type
      const redirectPath = paramName === 'userId' ? '/chats' : '/home';
      router.navigate([redirectPath]);
      return of(false);
    })
  );
};