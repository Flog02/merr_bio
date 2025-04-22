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
  DocumentData,
  serverTimestamp} from '@angular/fire/firestore';
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
            }),
            catchError(error => {
              // If image upload fails, attempt to delete the product document
              console.error('Error uploading product images:', error);
              from(deleteDoc(docRef)).subscribe();
              return throwError(() => new Error('Failed to upload product images'));
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
            return throwError(() => new Error('Product not found'));
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
                // Use the current state of existingImages from the data parameter if available
                // Otherwise use the current images from the product document
                const existingImages = data.images || product.images || [];
                finalImages = [...existingImages, ...newImageUrls];
              }
              
              // Create the update data object, including the finalized images array
              const updateData = {
                ...data,
                images: finalImages
              };
              
              // Remove the separate images property if it was in the data
              // to avoid having two image-related fields
              if (data.hasOwnProperty('images')) {
                delete data.images;
              }
              
              // Update the product with all changes
              return from(updateDoc(productRef, updateData));
            })
          );
        }),
        catchError(error => {
          console.error(`Error updating product ${id}:`, error);
          return throwError(() => new Error(`Failed to update product: ${error.message}`));
        })
      );
    }
    
    // If no new images, make sure to update with the correct existing images
    return from(updateDoc(productRef, data)).pipe(
      catchError(error => {
        console.error(`Error updating product ${id}:`, error);
        return throwError(() => new Error(`Failed to update product: ${error.message}`));
      })
    );
  }

  /**
   * Delete a product and its images from storage
   * Improved to ensure complete deletion and better error handling
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
          console.log(`Product with ID ${id} not found, nothing to delete`);
          return of(undefined);
        }
        
        const product = { id: docSnap.id, ...docSnap.data() } as Product;
        const imageUrls = product.images || [];
        
        // If there are no images, just delete the product document
        if (imageUrls.length === 0) {
          return from(deleteDoc(productRef)).pipe(
            map(() => {
              console.log(`Successfully deleted product ${id}`);
              return undefined;
            }),
            catchError(error => {
              console.error(`Error deleting product document ${id}:`, error);
              return throwError(() => new Error(`Failed to delete product document: ${error.message}`));
            })
          );
        }
        
        // Create array of observables for deleting each image
        // Use map + catchError to handle individual image deletion errors
        const deleteImageTasks = imageUrls.map(url => 
          this.fileUploadService.deleteFile(url).pipe(
            catchError(error => {
              console.error(`Error deleting image ${url} for product ${id}:`, error);
              return of(false); // Return false for failed image deletion but continue
            })
          )
        );
        
        // Delete all images first
        return forkJoin(deleteImageTasks).pipe(
          switchMap(results => {
            console.log(`Deleted ${results.filter(Boolean).length}/${imageUrls.length} images for product ${id}`);
            
            // Then delete the product document
            return from(deleteDoc(productRef)).pipe(
              map(() => {
                console.log(`Successfully deleted product document ${id}`);
                return undefined;
              }),
              catchError(error => {
                console.error(`Error deleting product document ${id} after image deletion:`, error);
                return throwError(() => new Error(`Failed to delete product: ${error.message}`));
              })
            );
          })
        );
      }),
      catchError(error => {
        console.error(`Error in product deletion process for ${id}:`, error);
        return throwError(() => new Error(`Failed to delete product: ${error.message}`));
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
   * Improved to ensure complete deletion and better error handling
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
        
        console.log(`Found ${querySnapshot.size} products to delete for farmer ${farmerId}`);
        
        // Create a list of products with their images
        const productsWithImages = querySnapshot.docs.map(docSnapshot => {
          const product = { id: docSnapshot.id, ...docSnapshot.data() } as Product;
          return {
            id: product.id,
            images: product.images || []
          };
        });
        
        // Filter out any products with undefined IDs to prevent the doc() error
        // Use type assertion to tell TypeScript that id is a string after filtering
        const validProducts = productsWithImages.filter(product => !!product.id) as {
          id: string;
          images: string[];
        }[];
        
        if (validProducts.length < productsWithImages.length) {
          console.warn(`Filtered out ${productsWithImages.length - validProducts.length} products with invalid IDs`);
        }
        
        // Create an array for all image deletion tasks
        const allImageDeletionTasks: Observable<boolean>[] = [];
        
        // Populate the array with all image deletion tasks
        validProducts.forEach((product) => {
          product.images.forEach((imageUrl: string) => {
            allImageDeletionTasks.push(
              this.fileUploadService.deleteFile(imageUrl).pipe(
                catchError(error => {
                  console.error(`Error deleting image ${imageUrl} for product ${product.id}:`, error);
                  return of(false); // Continue despite errors
                })
              )
            );
          });
        });
        
        // If there are images to delete, process them first
        if (allImageDeletionTasks.length > 0) {
          return forkJoin(allImageDeletionTasks).pipe(
            switchMap(imageResults => {
              console.log(`Completed image deletions for farmer ${farmerId}`);
              
              // Then delete all product documents
              const productDeletionTasks = validProducts.map((product) => {
                return from(deleteDoc(doc(this.firestore, 'products', product.id))).pipe(
                  catchError(error => {
                    console.error(`Error deleting product document ${product.id}:`, error);
                    return of(false); // Continue despite errors
                  })
                );
              });
              
              return forkJoin(productDeletionTasks).pipe(
                map(productResults => {
                  const successCount = productResults.filter(Boolean).length;
                  console.log(`Successfully deleted ${successCount}/${validProducts.length} products for farmer ${farmerId}`);
                  return undefined;
                })
              );
            })
          );
        } else {
          // If no images, just delete all product documents
          const productDeletionTasks = validProducts.map((product) => {
            return from(deleteDoc(doc(this.firestore, 'products', product.id))).pipe(
              catchError(error => {
                console.error(`Error deleting product document ${product.id}:`, error);
                return of(false); // Continue despite errors
              })
            );
          });
          
          return forkJoin(productDeletionTasks).pipe(
            map(results => {
              const successCount = results.filter(Boolean).length;
              console.log(`Successfully deleted ${successCount}/${validProducts.length} products for farmer ${farmerId}`);
              return undefined;
            })
          );
        }
      }),
      catchError(error => {
        console.error(`Error deleting products for farmer ${farmerId}:`, error);
        return throwError(() => new Error(`Failed to delete farmer products: ${error.message}`));
      })
    );
  }
}