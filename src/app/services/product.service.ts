// src/app/services/product.service.ts
import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  docData, 
  query, 
  where, 
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  DocumentReference
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private firestore: Firestore = inject(Firestore);
  
  constructor() {}
  
  // Get approved products ordered by creation date
  getProducts(): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products');
    const q = query(
      productsRef, 
      where('approved', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }
  
  // Get all products for admin (no filtering)
  getAllProductsForAdmin(): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products');
    const q = query(
      productsRef, 
      orderBy('createdAt', 'desc')
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }
  
  // Get a specific product by ID
  getProductById(id: string): Observable<Product> {
    const productRef = doc(this.firestore, `products/${id}`);
    return docData(productRef, { idField: 'id' }) as Observable<Product>;
  }
  
  // Get products by farmer ID
  getProductsByFarmerId(farmerId: string): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products');
    const q = query(
      productsRef, 
      where('farmerId', '==', farmerId),
      orderBy('createdAt', 'desc')
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }
  
  // Alias for getProductsByFarmerId to match usage in code
  getProductsByFarmer(farmerId: string): Observable<Product[]> {
    return this.getProductsByFarmerId(farmerId);
  }
  
  // Create a new product (alias for createProduct to match usage)
  addProduct(product: Omit<Product, 'id'>): Observable<string> {
    return this.createProduct(product);
  }
  
  // Create a new product
  createProduct(product: Omit<Product, 'id'>): Observable<string> {
    const productsRef = collection(this.firestore, 'products');
    
    return new Observable<string>(observer => {
      addDoc(productsRef, product)
        .then(docRef => {
          observer.next(docRef.id);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }
  
  // Update an existing product
  updateProduct(id: string, data: Partial<Product>): Observable<void> {
    const productRef = doc(this.firestore, `products/${id}`);
    
    return new Observable<void>(observer => {
      updateDoc(productRef, data)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }
  
  // Specifically approve a product (for admin)
  approveProduct(id: string): Observable<void> {
    return this.updateProduct(id, { approved: true });
  }
  
  // Delete a product
  deleteProduct(id: string): Observable<void> {
    const productRef = doc(this.firestore, `products/${id}`);
    
    return new Observable<void>(observer => {
      deleteDoc(productRef)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }
}