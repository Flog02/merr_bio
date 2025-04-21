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
  serverTimestamp 
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
            throw new Error('Purchase request not found');
          }
          
          const request = { id: docSnap.id, ...docSnap.data() } as PurchaseRequest;
          const uploadPath = `request-images/${request.customerId}/${id}`;
          
          // Upload the new images
          return this.fileUploadService.uploadMultipleFiles(imageFiles, uploadPath).pipe(
            switchMap(newImageUrls => {
              // Determine the final image URLs array
              let finalImages: string[] = [];
              
              if (replaceImages) {
                // Replace existing images with new ones
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
          return throwError(() => new Error('Failed to update purchase request'));
        })
      );
    }
    
    // If no new images, just update the request data
    return from(updateDoc(requestRef, data)).pipe(
      catchError(error => {
        console.error(`Error updating request ${id}:`, error);
        return throwError(() => new Error('Failed to update purchase request'));
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
          throw new Error('Purchase request not found');
        }
        
        const request = { id: docSnap.id, ...docSnap.data() } as PurchaseRequest;
        const imageUrls = request.images || [];
        
        // Create array of observables for deleting each image
        const deleteImageTasks = imageUrls.map(url => 
          this.fileUploadService.deleteFile(url)
        );
        
        // If there are images to delete
        if (deleteImageTasks.length > 0) {
          // Delete images first, then delete the request
          return forkJoin(deleteImageTasks).pipe(
            switchMap(() => from(deleteDoc(requestRef))),
            catchError(error => {
              console.error(`Error deleting images for request ${id}:`, error);
              // Even if image deletion fails, try to delete the request document
              return from(deleteDoc(requestRef));
            })
          );
        }
        
        // If no images, just delete the request
        return from(deleteDoc(requestRef));
      }),
      catchError(error => {
        console.error(`Error deleting request ${id}:`, error);
        return throwError(() => new Error('Failed to delete purchase request'));
      })
    );
  }
}