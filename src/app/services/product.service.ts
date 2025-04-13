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
  orderBy
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
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
      map(docRef => docRef.id)
    );
  }

  // Get all products
  getProducts(): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products');
    // Only fetch approved products for regular users
    const q = query(productsRef, where('approved', '==', true), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }

  // Get products by farmer
  getProductsByFarmer(farmerId: string): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products');
    const q = query(productsRef, where('farmerId', '==', farmerId), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }

  // Get all products for admin (including unapproved ones)
  getAllProductsForAdmin(): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }

  // Get product by ID
  getProductById(id: string): Observable<Product> {
    const productRef = doc(this.firestore, 'products', id);
    return from(getDoc(productRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Product;
        } else {
          throw new Error('Product not found');
        }
      })
    );
  }

  // Update product
  updateProduct(id: string, data: Partial<Product>): Observable<void> {
    const productRef = doc(this.firestore, 'products', id);
    return from(updateDoc(productRef, data));
  }

  // Approve product
  approveProduct(id: string): Observable<void> {
    const productRef = doc(this.firestore, 'products', id);
    return from(updateDoc(productRef, { approved: true }));
  }

  // Delete product
  deleteProduct(id: string): Observable<void> {
    const productRef = doc(this.firestore, 'products', id);
    return from(deleteDoc(productRef));
  }
}