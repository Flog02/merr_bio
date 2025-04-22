import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { EMPTY, Observable, catchError, map, of } from 'rxjs';
import { UserService } from '../services/user.service';

export const userIdResolver: ResolveFn<boolean> = (route: ActivatedRouteSnapshot) => {
  const userId = route.paramMap.get('userId');
  const userService = inject(UserService);
  const router = inject(Router);
  
  if (!userId) {
    router.navigate(['/chats']);
    return of(false);
  }
  
  return userService.getUserById(userId).pipe(
    map(user => {
      if (user) {
        return true;
      } else {
        router.navigate(['/chats']);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/chats']);
      return of(false);
    })
  );
};