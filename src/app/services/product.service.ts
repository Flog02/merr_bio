import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  collectionData, 
  where, 
  query, 
  getDoc, 
  orderBy,
  getDocs,
  QuerySnapshot,
  DocumentSnapshot,
  DocumentData
} from '@angular/fire/firestore';
import { Observable, from, map, catchError, of, throwError, switchMap } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private firestore: Firestore) {}

  // Add a new product
  addProduct(product: Omit<Product, 'id'>): Observable<string> {
    const productsRef = collection(this.firestore, 'products');
    return from(addDoc(productsRef, product)).pipe(
      map(docRef => docRef.id),
      catchError(error => {
        console.error('Error adding product:', error);
        return throwError(() => new Error('Failed to add product'));
      })
    );
  }

  // Get all products (only approved and from existing farmers)
  getProducts(): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products');
    // Only fetch approved products for regular users
    const q = query(productsRef, where('approved', '==', true), orderBy('createdAt', 'desc'));
    
    return collectionData(q, { idField: 'id' }).pipe(
      map((products: any[]) => {
        // Filter out products that might have issues or incomplete data
        return products.filter(product => 
          product && product.id && product.farmerId && product.name && product.price
        ) as Product[];
      }),
      catchError(error => {
        console.error('Error fetching products:', error);
        return of([]);
      })
    );
  }

  // Get products by farmer
  getProductsByFarmer(farmerId: string): Observable<Product[]> {
    if (!farmerId) {
      console.error('Invalid farmerId provided');
      return of([]);
    }
    
    const productsRef = collection(this.firestore, 'products');
    const q = query(productsRef, where('farmerId', '==', farmerId), orderBy('createdAt', 'desc'));
    
    return collectionData(q, { idField: 'id' }).pipe(
      map((products: any[]) => {
        // Filter out products that might have issues
        return products.filter(product => 
          product && product.id && product.name && product.price
        ) as Product[];
      }),
      catchError(error => {
        console.error(`Error fetching products for farmer ${farmerId}:`, error);
        return of([]);
      })
    );
  }

  // Get all products for admin (including unapproved ones)
  getAllProductsForAdmin(): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    
    return collectionData(q, { idField: 'id' }).pipe(
      map((products: any[]) => {
        // Even for admin, filter out corrupted data
        return products.filter(product => 
          product && product.id && product.name !== undefined
        ) as Product[];
      }),
      catchError(error => {
        console.error('Error fetching all products for admin:', error);
        return of([]);
      })
    );
  }

  // Get product by ID with better error handling
  getProductById(id: string): Observable<Product> {
    if (!id) {
      console.error('Invalid product ID provided');
      return throwError(() => new Error('Invalid product ID'));
    }
    
    const productRef = doc(this.firestore, 'products', id);
    return from(getDoc(productRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Product;
        } else {
          console.log(`Product with ID ${id} not found`);
          throw new Error('Product not found');
        }
      }),
      catchError(error => {
        console.error(`Error fetching product ${id}:`, error);
        return throwError(() => new Error('Failed to load product'));
      })
    );
  }

  // Update product
  updateProduct(id: string, data: Partial<Product>): Observable<void> {
    if (!id) {
      return throwError(() => new Error('Invalid product ID'));
    }
    
    const productRef = doc(this.firestore, 'products', id);
    return from(updateDoc(productRef, data)).pipe(
      catchError(error => {
        console.error(`Error updating product ${id}:`, error);
        return throwError(() => new Error('Failed to update product'));
      })
    );
  }

  // Approve product
  approveProduct(id: string): Observable<void> {
    if (!id) {
      return throwError(() => new Error('Invalid product ID'));
    }
    
    const productRef = doc(this.firestore, 'products', id);
    return from(updateDoc(productRef, { approved: true })).pipe(
      catchError(error => {
        console.error(`Error approving product ${id}:`, error);
        return throwError(() => new Error('Failed to approve product'));
      })
    );
  }

  // Delete product
  deleteProduct(id: string): Observable<void> {
    if (!id) {
      return throwError(() => new Error('Invalid product ID'));
    }
    
    const productRef = doc(this.firestore, 'products', id);
    return from(deleteDoc(productRef)).pipe(
      catchError(error => {
        console.error(`Error deleting product ${id}:`, error);
        return throwError(() => new Error('Failed to delete product'));
      })
    );
  }
  
  // Delete all products by a specific farmer (used when deleting a user)
  deleteProductsByFarmer(farmerId: string): Observable<void> {
    if (!farmerId) {
      console.error('Invalid farmerId provided for product deletion');
      return throwError(() => new Error('Invalid farmer ID'));
    }
    
    const productsRef = collection(this.firestore, 'products');
    const q = query(productsRef, where('farmerId', '==', farmerId));
    
    return from(getDocs(q)).pipe(
      switchMap((querySnapshot: QuerySnapshot<DocumentData>) => {
        const deletePromises: Promise<void>[] = [];
        
        querySnapshot.forEach((docSnapshot: DocumentSnapshot<DocumentData>) => {
          deletePromises.push(deleteDoc(doc(this.firestore, 'products', docSnapshot.id)));
        });
        
        if (deletePromises.length === 0) {
          console.log(`No products found for farmer ${farmerId}`);
          return of(undefined);
        }
        
        // Use from() to convert Promise to Observable
        return from(Promise.all(deletePromises)).pipe(
          map(() => undefined) // Convert to void return type
        );
      }),
      catchError(error => {
        console.error(`Error deleting products for farmer ${farmerId}:`, error);
        return throwError(() => new Error('Failed to delete farmer products'));
      })
    );
  }
}