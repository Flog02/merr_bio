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
  orderBy, 
  getDoc,
  serverTimestamp, 
  getDocs
} from '@angular/fire/firestore';
import { Observable, from, map, catchError, throwError, of, switchMap, forkJoin } from 'rxjs';
import { PurchaseRequest } from '../models/request.model';
import { FileUploadService } from './file-upload.service';

@Injectable({
  providedIn: 'root'
})
export class PurchaseRequestService {
  private firestore = inject(Firestore);
  private fileUploadService = inject(FileUploadService);

  /**
   * Create a new purchase request with optional images
   * @param request The purchase request data
   * @param imageFiles Optional image files to attach
   * @returns Observable<string> - ID of the created request
   */
  createRequest(
    request: Omit<PurchaseRequest, 'id'>, 
    imageFiles?: File[]
  ): Observable<string> {
    const requestsRef = collection(this.firestore, 'requests');
    
    // Add timestamp if not provided
    const requestWithTimestamp = {
      ...request,
      timestamp: request.timestamp || serverTimestamp()
    };
    
    return from(addDoc(requestsRef, requestWithTimestamp)).pipe(
      switchMap(docRef => {
        const requestId = docRef.id;
        
        // If there are images to upload
        if (imageFiles && imageFiles.length > 0) {
          const uploadPath = `request-images/${request.customerId}/${requestId}`;
          
          return this.fileUploadService.uploadMultipleFiles(imageFiles, uploadPath).pipe(
            switchMap(imageUrls => {
              // Update the request with image URLs
              return from(updateDoc(docRef, { images: imageUrls })).pipe(
                map(() => requestId)
              );
            }),
            catchError(error => {
              // If image upload fails, attempt to delete the request document
              console.error('Error uploading request images:', error);
              from(deleteDoc(docRef)).subscribe();
              return throwError(() => new Error('Failed to upload request images'));
            })
          );
        }
        
        // If no images, just return the request ID
        return of(requestId);
      }),
      catchError(error => {
        console.error('Error creating purchase request:', error);
        return throwError(() => new Error('Failed to create purchase request'));
      })
    );
  }

  /**
   * Update a purchase request with new images
   * @param id Request ID
   * @param data Partial request data to update
   * @param imageFiles Optional new image files
   * @param replaceImages Whether to replace existing images (true) or append (false)
   * @returns Observable<void>
   */
  updateRequest(
    id: string, 
    data: Partial<PurchaseRequest>,
    imageFiles?: File[],
    replaceImages: boolean = false
  ): Observable<void> {
    if (!id) {
      return throwError(() => new Error('Invalid request ID'));
    }
    
    const requestRef = doc(this.firestore, 'requests', id);
    
    // If there are image files to upload
    if (imageFiles && imageFiles.length > 0) {
      return from(getDoc(requestRef)).pipe(
        switchMap(docSnap => {
          if (!docSnap.exists()) {
            return throwError(() => new Error('Purchase request not found'));
          }
          
          const request = { id: docSnap.id, ...docSnap.data() } as PurchaseRequest;
          const uploadPath = `request-images/${request.customerId}/${id}`;
          
          // Upload the new images
          return this.fileUploadService.uploadMultipleFiles(imageFiles, uploadPath).pipe(
            switchMap(newImageUrls => {
              let finalImages: string[] = [];
              
              if (replaceImages) {
                // If replacing, we should first delete any existing images
                const existingImages = request.images || [];
                if (existingImages.length > 0) {
                  const deleteImageTasks = existingImages.map(url => 
                    this.fileUploadService.deleteFile(url).pipe(
                      catchError(error => {
                        console.error(`Error deleting image ${url}:`, error);
                        return of(false);
                      })
                    )
                  );
                  
                  return forkJoin(deleteImageTasks).pipe(
                    switchMap(() => {
                      // After deleting old images, update with new ones
                      return from(updateDoc(requestRef, { 
                        ...data,
                        images: newImageUrls
                      }));
                    })
                  );
                }
                
                finalImages = newImageUrls;
              } else {
                // Append new images to existing ones
                const existingImages = request.images || [];
                finalImages = [...existingImages, ...newImageUrls];
              }
              
              // Update the request with all changes
              return from(updateDoc(requestRef, { 
                ...data,
                images: finalImages
              }));
            })
          );
        }),
        catchError(error => {
          console.error(`Error updating request ${id}:`, error);
          return throwError(() => new Error(`Failed to update purchase request: ${error.message}`));
        })
      );
    }
    
    // If no new images, just update the request data
    return from(updateDoc(requestRef, data)).pipe(
      catchError(error => {
        console.error(`Error updating request ${id}:`, error);
        return throwError(() => new Error(`Failed to update purchase request: ${error.message}`));
      })
    );
  }

  /**
   * Get a purchase request by ID
   * @param id Request ID
   * @returns Observable<PurchaseRequest>
   */
  getRequestById(id: string): Observable<PurchaseRequest> {
    if (!id) {
      return throwError(() => new Error('Invalid request ID'));
    }
    
    const requestRef = doc(this.firestore, 'requests', id);
    return from(getDoc(requestRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as PurchaseRequest;
        } else {
          throw new Error('Purchase request not found');
        }
      }),
      catchError(error => {
        console.error(`Error fetching purchase request ${id}:`, error);
        return throwError(() => new Error('Failed to load purchase request'));
      })
    );
  }

  /**
   * Get all purchase requests for a customer
   * @param customerId Customer ID
   * @returns Observable<PurchaseRequest[]>
   */
  getRequestsByCustomer(customerId: string): Observable<PurchaseRequest[]> {
    if (!customerId) {
      console.error('Invalid customer ID provided');
      return of([]);
    }
    
    const requestsRef = collection(this.firestore, 'requests');
    const q = query(requestsRef, where('customerId', '==', customerId), orderBy('timestamp', 'desc'));
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(requests => requests as PurchaseRequest[]),
      catchError(error => {
        console.error(`Error fetching requests for customer ${customerId}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Get all purchase requests for a farmer
   * @param farmerId Farmer ID
   * @returns Observable<PurchaseRequest[]>
   */
  getRequestsByFarmer(farmerId: string): Observable<PurchaseRequest[]> {
    if (!farmerId) {
      console.error('Invalid farmer ID provided');
      return of([]);
    }
    
    const requestsRef = collection(this.firestore, 'requests');
    const q = query(requestsRef, where('farmerId', '==', farmerId), orderBy('timestamp', 'desc'));
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(requests => requests as PurchaseRequest[]),
      catchError(error => {
        console.error(`Error fetching requests for farmer ${farmerId}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Update the status of a purchase request
   * @param id Request ID
   * @param status New status ('accepted' or 'rejected')
   * @returns Observable<void>
   */
  updateRequestStatus(id: string, status: 'accepted' | 'rejected'): Observable<void> {
    if (!id) {
      return throwError(() => new Error('Invalid request ID'));
    }
    
    const requestRef = doc(this.firestore, 'requests', id);
    return from(updateDoc(requestRef, { status })).pipe(
      catchError(error => {
        console.error(`Error updating request status ${id}:`, error);
        return throwError(() => new Error('Failed to update request status'));
      })
    );
  }

  /**
   * Delete a purchase request and its images
   * Improved to ensure complete deletion and better error handling
   * @param id Request ID
   * @returns Observable<void>
   */
  deleteRequest(id: string): Observable<void> {
    if (!id) {
      return throwError(() => new Error('Invalid request ID'));
    }
    
    const requestRef = doc(this.firestore, 'requests', id);
    
    // First get the request to access image URLs
    return from(getDoc(requestRef)).pipe(
      switchMap(docSnap => {
        if (!docSnap.exists()) {
          console.log(`Purchase request ${id} not found, nothing to delete`);
          return of(undefined);
        }
        
        const request = { id: docSnap.id, ...docSnap.data() } as PurchaseRequest;
        const imageUrls = request.images || [];
        
        // If no images, just delete the request document
        if (imageUrls.length === 0) {
          return from(deleteDoc(requestRef)).pipe(
            map(() => {
              console.log(`Successfully deleted request ${id}`);
              return undefined;
            }),
            catchError(error => {
              console.error(`Error deleting request document ${id}:`, error);
              return throwError(() => new Error(`Failed to delete request document: ${error.message}`));
            })
          );
        }
        
        // Create array of observables for deleting each image
        // Using map + catchError to handle individual image deletion errors
        const deleteImageTasks = imageUrls.map(url => 
          this.fileUploadService.deleteFile(url).pipe(
            catchError(error => {
              console.error(`Error deleting image ${url} for request ${id}:`, error);
              return of(false); // Return false for failed deletion but continue
            })
          )
        );
        
        // Delete all images first
        return forkJoin(deleteImageTasks).pipe(
          switchMap(results => {
            console.log(`Deleted ${results.filter(Boolean).length}/${imageUrls.length} images for request ${id}`);
            
            // Then delete the request document
            return from(deleteDoc(requestRef)).pipe(
              map(() => {
                console.log(`Successfully deleted request document ${id}`);
                return undefined;
              }),
              catchError(error => {
                console.error(`Error deleting request document ${id}:`, error);
                return throwError(() => new Error(`Failed to delete request: ${error.message}`));
              })
            );
          })
        );
      }),
      catchError(error => {
        console.error(`Error in request deletion process for ${id}:`, error);
        return throwError(() => new Error(`Failed to delete request: ${error.message}`));
      })
    );
  }
  
  /**
   * Delete all requests for a specific customer, including their images
   * @param customerId Customer ID
   * @returns Observable<void>
   */
  deleteRequestsByCustomer(customerId: string): Observable<void> {
    if (!customerId) {
      console.error('Invalid customer ID provided');
      return throwError(() => new Error('Invalid customer ID'));
    }
    
    const requestsRef = collection(this.firestore, 'requests');
    const q = query(requestsRef, where('customerId', '==', customerId));
    
    return from(getDocs(q)).pipe(
      switchMap(querySnapshot => {
        if (querySnapshot.empty) {
          console.log(`No requests found for customer ${customerId}`);
          return of(undefined);
        }
        
        console.log(`Found ${querySnapshot.size} requests to delete for customer ${customerId}`);
        
        // Create deletion tasks for each request
        const deletionTasks = querySnapshot.docs.map(docSnapshot => {
          const requestId = docSnapshot.id;
          return this.deleteRequest(requestId).pipe(
            catchError(error => {
              console.error(`Error deleting request ${requestId}:`, error);
              return of(undefined); // Continue with other deletions
            })
          );
        });
        
        // Execute all deletions
        return forkJoin(deletionTasks).pipe(
          map(() => {
            console.log(`Completed deletion of requests for customer ${customerId}`);
            return undefined;
          })
        );
      }),
      catchError(error => {
        console.error(`Error deleting requests for customer ${customerId}:`, error);
        return throwError(() => new Error(`Failed to delete customer requests: ${error.message}`));
      })
    );
  }
}