import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ProductService } from '../services/product.service';

export const productIdResolver: ResolveFn<boolean> = (route: ActivatedRouteSnapshot) => {
  const productId = route.paramMap.get('id');
  const productService = inject(ProductService);
  const router = inject(Router);
  
  if (!productId) {
    router.navigate(['/products']);
    return of(false);
  }
  
  return productService.getProductById(productId).pipe(
    map(product => {
      if (product) {
        return true;
      } else {
        router.navigate(['/products']);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/products']);
      return of(false);
    })
  );
};

