import { Injectable, inject } from '@angular/core';
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
  DocumentData,
  serverTimestamp
} from '@angular/fire/firestore';
import { Observable, from, map, catchError, of, throwError, switchMap, forkJoin } from 'rxjs';
import { Product } from '../models/product.model';
import { FileUploadService } from './file-upload.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private firestore = inject(Firestore);
  private fileUploadService = inject(FileUploadService);

  /**
   * Add a new product with optional images
   * @param product Product data without ID
   * @param imageFiles Optional array of image files
   * @returns Observable<string> - The new product ID
   */
  addProduct(
    product: Omit<Product, 'id'>, 
    imageFiles?: File[]
  ): Observable<string> {
    const productsRef = collection(this.firestore, 'products');
    
    // First add the product to get an ID
    return from(addDoc(productsRef, {
      ...product,
      createdAt: serverTimestamp()
    })).pipe(
      switchMap(docRef => {
        const productId = docRef.id;
        
        // If there are images, upload them
        if (imageFiles && imageFiles.length > 0) {
          return this.fileUploadService.uploadProductImages(
            imageFiles, 
            productId, 
            product.farmerId
          ).pipe(
            switchMap(imageUrls => {
              // Update the product with image URLs
              return from(updateDoc(docRef, { images: imageUrls })).pipe(
                map(() => productId)
              );
            })
          );
        }
        
        // If no images, just return the product ID
        return of(productId);
      }),
      catchError(error => {
        console.error('Error adding product:', error);
        return throwError(() => new Error('Failed to add product'));
      })
    );
  }

  /**
   * Update product with optional new images
   * @param id Product ID
   * @param data Partial product data
   * @param imageFiles Optional new image files
   * @param replaceImages Whether to replace existing images (true) or append (false)
   * @returns Observable<void>
   */
  updateProduct(
    id: string, 
    data: Partial<Product>,
    imageFiles?: File[],
    replaceImages: boolean = false
  ): Observable<void> {
    if (!id) {
      return throwError(() => new Error('Invalid product ID'));
    }
    
    const productRef = doc(this.firestore, 'products', id);
    
    // If there are image files to upload
    if (imageFiles && imageFiles.length > 0) {
      return from(getDoc(productRef)).pipe(
        switchMap(docSnap => {
          if (!docSnap.exists()) {
            throw new Error('Product not found');
          }
          
          const product = { id: docSnap.id, ...docSnap.data() } as Product;
          
          // Upload the new images
          return this.fileUploadService.uploadProductImages(
            imageFiles, 
            id, 
            product.farmerId
          ).pipe(
            switchMap(newImageUrls => {
              // Determine the final image URLs array
              let finalImages: string[] = [];
              
              if (replaceImages) {
                // Replace existing images with new ones
                finalImages = newImageUrls;
              } else {
                // Append new images to existing ones
                const existingImages = product.images || [];
                finalImages = [...existingImages, ...newImageUrls];
              }
              
              // Update the product with all changes
              return from(updateDoc(productRef, { 
                ...data,
                images: finalImages
              }));
            })
          );
        }),
        catchError(error => {
          console.error(`Error updating product ${id}:`, error);
          return throwError(() => new Error('Failed to update product'));
        })
      );
    }
    
    // If no new images, just update the product data
    return from(updateDoc(productRef, data)).pipe(
      catchError(error => {
        console.error(`Error updating product ${id}:`, error);
        return throwError(() => new Error('Failed to update product'));
      })
    );
  }

  /**
   * Delete a product and its images from storage
   * @param id Product ID
   * @returns Observable<void>
   */
  deleteProduct(id: string): Observable<void> {
    if (!id) {
      return throwError(() => new Error('Invalid product ID'));
    }
    
    const productRef = doc(this.firestore, 'products', id);
    
    // First get the product to have access to image URLs
    return from(getDoc(productRef)).pipe(
      switchMap(docSnap => {
        if (!docSnap.exists()) {
          throw new Error('Product not found');
        }
        
        const product = { id: docSnap.id, ...docSnap.data() } as Product;
        const imageUrls = product.images || [];
        
        // Create array of observables for deleting each image
        const deleteImageTasks = imageUrls.map(url => 
          this.fileUploadService.deleteFile(url)
        );
        
        // If there are images to delete
        if (deleteImageTasks.length > 0) {
          // Delete images first, then delete the product
          return forkJoin(deleteImageTasks).pipe(
            switchMap(() => from(deleteDoc(productRef)))
          );
        }
        
        // If no images, just delete the product
        return from(deleteDoc(productRef));
      }),
      catchError(error => {
        console.error(`Error deleting product ${id}:`, error);
        return throwError(() => new Error('Failed to delete product'));
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

  /**
   * Delete all products for a given farmer, including their images
   * @param farmerId Farmer ID
   * @returns Observable<void>
   */
  deleteProductsByFarmer(farmerId: string): Observable<void> {
    if (!farmerId) {
      console.error('Invalid farmerId provided for product deletion');
      return throwError(() => new Error('Invalid farmer ID'));
    }
    
    const productsRef = collection(this.firestore, 'products');
    const q = query(productsRef, where('farmerId', '==', farmerId));
    
    return from(getDocs(q)).pipe(
      switchMap((querySnapshot: QuerySnapshot<DocumentData>) => {
        // If no products found, return completed Observable
        if (querySnapshot.empty) {
          console.log(`No products found for farmer ${farmerId}`);
          return of(undefined);
        }
        
        // Convert the docs array to an Observable
        const docs = querySnapshot.docs;
        
        // Process each product sequentially (delete images, then delete product)
        return docs.reduce(
          (acc$: Observable<unknown>, docSnapshot) => 
            acc$.pipe(
              switchMap(() => {
                const productId = docSnapshot.id;
                const product = { id: productId, ...docSnapshot.data() } as Product;
                console.log(`Deleting product: ${productId}`);
                
                // If product has images, delete them first
                if (product.images && product.images.length > 0) {
                  const deleteImageTasks = product.images.map(url => 
                    this.fileUploadService.deleteFile(url)
                  );
                  
                  return forkJoin(deleteImageTasks).pipe(
                    switchMap(() => from(deleteDoc(doc(this.firestore, 'products', productId)))),
                    catchError(error => {
                      console.error(`Error deleting images for product ${productId}:`, error);
                      // Even if images deletion fails, try to delete the product document
                      return from(deleteDoc(doc(this.firestore, 'products', productId)));
                    })
                  );
                } else {
                  // If no images, just delete the product
                  return from(deleteDoc(doc(this.firestore, 'products', productId)));
                }
              })
            ),
          of(undefined) // Start with an empty Observable
        ) as Observable<void>;
      }),
      catchError(error => {
        console.error(`Error deleting products for farmer ${farmerId}:`, error);
        return throwError(() => new Error(`Failed to delete farmer products: ${error.message}`));
      })
    );
  }
}