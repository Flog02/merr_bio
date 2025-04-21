import { Injectable, inject } from '@angular/core';
import { 
  Storage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from '@angular/fire/storage';
import { Observable, from, finalize, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private storage = inject(Storage);

  /**
   * Upload a file to Firebase Storage
   * @param file The file to upload
   * @param path The path in storage (e.g., 'product-images', 'profile-images')
   * @param fileName Optional custom filename, if not provided will use a timestamp + original name
   * @returns An Observable that emits the download URL when complete
   */
  uploadFile(file: File, path: string, fileName?: string): Observable<string> {
    if (!file) {
      return of('');
    }

    // Create a unique filename if not provided
    const name = fileName || `${new Date().getTime()}_${file.name}`;
    const filePath = `${path}/${name}`;
    const storageRef = ref(this.storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Monitor the upload and return the download URL when complete
    return new Observable<string>(observer => {
      uploadTask.on('state_changed',
        (snapshot) => {
          // Optional: track progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          // Handle errors
          console.error('Upload error:', error);
          observer.error(error);
        },
        () => {
          // Upload completed successfully, get download URL
          getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
            observer.next(downloadURL);
            observer.complete();
          }).catch(error => {
            console.error('Error getting download URL:', error);
            observer.error(error);
          });
        }
      );

      // Return unsubscribe function
      return () => {
        // Can't cancel an upload in progress with Firebase v9, but we can clean up our Observable
      };
    });
  }

  /**
   * Upload multiple files to Firebase Storage
   * @param files Array of files to upload
   * @param path The storage path
   * @returns Observable that emits an array of download URLs
   */
  uploadMultipleFiles(files: File[], path: string): Observable<string[]> {
    if (!files || files.length === 0) {
      return of([]);
    }

    // Create an array of observables for each file upload
    const uploads = files.map(file => this.uploadFile(file, path));

    // Use forkJoin to wait for all uploads to complete
    return from(Promise.all(uploads.map(upload => 
      new Promise<string>((resolve, reject) => {
        upload.subscribe({
          next: url => resolve(url),
          error: err => reject(err)
        });
      })
    )));
  }
  
  /**
   * Upload a profile image for a user
   * @param file The image file to upload
   * @param userId The user's ID to use in the file path
   * @returns Observable that emits the profile image URL
   */
  uploadProfileImage(file: File, userId: string): Observable<string> {
    if (!file) {
      return of('');
    }
    
    // Use a standard naming convention for profile images
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile_${new Date().getTime()}.${fileExtension}`;
    const path = `profile-images/${userId}`;
    
    return this.uploadFile(file, path, fileName);
  }
  
  /**
   * Upload product images
   * @param files Array of image files to upload
   * @param productId The product ID
   * @param farmerId The farmer's ID
   * @returns Observable that emits an array of image URLs
   */
  uploadProductImages(files: File[], productId: string, farmerId: string): Observable<string[]> {
    if (!files || files.length === 0) {
      return of([]);
    }
    
    const path = `product-images/${farmerId}/${productId}`;
    return this.uploadMultipleFiles(files, path);
  }

  /**
   * Delete a file from Firebase Storage by its URL
   * @param downloadUrl The file's download URL
   * @returns Observable<boolean> - true if successfully deleted
   */
  deleteFile(downloadUrl: string): Observable<boolean> {
    if (!downloadUrl) {
      return of(false);
    }

    try {
      // Extract the path from the download URL
      const storageRef = ref(this.storage, this.getPathFromURL(downloadUrl));
      
      // Delete the file
      return from(deleteObject(storageRef)).pipe(
        switchMap(() => of(true)),
        finalize(() => console.log('Delete operation completed'))
      );
    } catch (error) {
      console.error('Error deleting file:', error);
      return of(false);
    }
  }

  /**
   * Helper method to extract the path from a download URL
   * This is a basic implementation and might need to be adjusted based on your Firebase config
   */
  private getPathFromURL(url: string): string {
    // Extract the path from the Firebase Storage URL
    // Example URL: https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/path%2Fto%2Ffile.jpg?alt=media&token=...
    try {
      const decodedUrl = decodeURIComponent(url);
      const startIndex = decodedUrl.indexOf('/o/') + 3;
      const endIndex = decodedUrl.indexOf('?alt=media');
      return decodedUrl.substring(startIndex, endIndex !== -1 ? endIndex : undefined);
    } catch (error) {
      console.error('Error extracting path from URL:', error);
      return '';
    }
  }
}