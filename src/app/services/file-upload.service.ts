import { Injectable, inject } from '@angular/core';
import { 
  Storage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  listAll
} from '@angular/fire/storage';
import { Observable, from, finalize, of, switchMap, catchError, forkJoin, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private storage = inject(Storage);

  /**
   * Upload a file to Firebase Storage with improved error handling
   * @param file The file to upload
   * @param path The path in storage (e.g., 'product-images', 'profile-images')
   * @param fileName Optional custom filename, if not provided will use a timestamp + original name
   * @returns An Observable that emits the download URL when complete
   */
  uploadFile(file: File, path: string, fileName?: string): Observable<string> {
    if (!file) {
      console.error('Invalid file provided to uploadFile');
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
          // Track progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done for ${filePath}`);
        },
        (error) => {
          // Handle errors
          console.error(`Upload error for ${filePath}:`, error);
          observer.error(error);
        },
        () => {
          // Upload completed successfully, get download URL
          getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
            console.log(`Successfully uploaded file to ${filePath} with URL: ${downloadURL}`);
            observer.next(downloadURL);
            observer.complete();
          }).catch(error => {
            console.error(`Error getting download URL for ${filePath}:`, error);
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
   * Upload multiple files to Firebase Storage with improved error handling
   * @param files Array of files to upload
   * @param path The storage path
   * @returns Observable that emits an array of download URLs
   */
  uploadMultipleFiles(files: File[], path: string): Observable<string[]> {
    if (!files || files.length === 0) {
      console.log('No files provided to uploadMultipleFiles');
      return of([]);
    }

    // Create an array of observables for each file upload
    const uploads = files.map(file => this.uploadFile(file, path));

    // Use forkJoin to wait for all uploads to complete
    return from(Promise.all(uploads.map(upload => 
      new Promise<string>((resolve, reject) => {
        upload.subscribe({
          next: url => resolve(url),
          error: err => {
            console.error('Error in upload promise:', err);
            reject(err);
          }
        });
      })
    ))).pipe(
      catchError(error => {
        console.error('Error in multiple file upload operation:', error);
        return of([]);
      })
    );
  }
  
  /**
   * Upload a profile image for a user with improved error handling
   * @param file The image file to upload
   * @param userId The user's ID to use in the file path
   * @returns Observable that emits the profile image URL
   */
  uploadProfileImage(file: File, userId: string): Observable<string> {
    if (!file) {
      console.error('Invalid file provided to uploadProfileImage');
      return of('');
    }
    
    if (!userId) {
      console.error('Invalid userId provided to uploadProfileImage');
      return of('');
    }
    
    // Use a standard naming convention for profile images
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile_${new Date().getTime()}.${fileExtension}`;
    const path = `profile-images/${userId}`;
    
    return this.uploadFile(file, path, fileName);
  }
  
  /**
   * Upload product images with improved error handling
   * @param files Array of image files to upload
   * @param productId The product ID
   * @param farmerId The farmer's ID
   * @returns Observable that emits an array of image URLs
   */
  uploadProductImages(files: File[], productId: string, farmerId: string): Observable<string[]> {
    if (!files || files.length === 0) {
      console.log('No files provided to uploadProductImages');
      return of([]);
    }
    
    if (!productId || !farmerId) {
      console.error('Invalid productId or farmerId provided to uploadProductImages');
      return of([]);
    }
    
    const path = `product-images/${farmerId}/${productId}`;
    return this.uploadMultipleFiles(files, path);
  }

  /**
   * Delete a file from Firebase Storage by its URL with improved error handling
   * @param downloadUrl The file's download URL
   * @returns Observable<boolean> - true if successfully deleted
   */
  deleteFile(downloadUrl: string): Observable<boolean> {
    if (!downloadUrl) {
      console.log('No download URL provided to deleteFile');
      return of(false);
    }

    try {
      // Extract the path from the download URL
      const path = this.getPathFromURL(downloadUrl);
      
      if (!path) {
        console.error('Could not extract valid path from URL:', downloadUrl);
        return of(false);
      }
      
      const storageRef = ref(this.storage, path);
      
      // Delete the file
      return from(deleteObject(storageRef)).pipe(
        map(() => {
          console.log(`Successfully deleted file at path: ${path}`);
          return true;
        }),
        catchError(error => {
          console.error(`Error deleting file at path ${path}:`, error);
          return of(false); // Return false on error but don't break the chain
        })
      );
    } catch (error) {
      console.error('Error in deleteFile operation:', error);
      return of(false);
    }
  }

  /**
   * Delete all files in a directory
   * @param path Directory path in storage
   * @returns Observable<boolean> - true if all files were deleted successfully
   */
  deleteDirectory(path: string): Observable<boolean> {
    if (!path) {
      console.error('Invalid path provided to deleteDirectory');
      return of(false);
    }
    
    const dirRef = ref(this.storage, path);
    
    // List all items in the directory
    return from(listAll(dirRef)).pipe(
      switchMap(result => {
        // If directory is empty, return true
        if (result.items.length === 0 && result.prefixes.length === 0) {
          console.log(`Directory ${path} is empty, nothing to delete`);
          return of(true);
        }
        
        console.log(`Found ${result.items.length} files and ${result.prefixes.length} subdirectories in ${path}`);
        
        // Create tasks to delete all files
        const fileDeletionTasks = result.items.map(itemRef => 
          from(deleteObject(itemRef)).pipe(
            map(() => {
              console.log(`Successfully deleted file: ${itemRef.fullPath}`);
              return true;
            }),
            catchError(error => {
              console.error(`Error deleting file ${itemRef.fullPath}:`, error);
              return of(false);
            })
          )
        );
        
        // Create tasks to recursively delete all subdirectories
        const subDirDeletionTasks = result.prefixes.map(prefix => 
          this.deleteDirectory(prefix.fullPath)
        );
        
        // Combine all tasks
        const allTasks = [...fileDeletionTasks, ...subDirDeletionTasks];
        
        // If no tasks, return true
        if (allTasks.length === 0) {
          return of(true);
        }
        
        // Execute all tasks and return true only if all succeeded
        return forkJoin(allTasks).pipe(
          map(results => results.every(result => result === true)),
          catchError(error => {
            console.error(`Error in directory deletion for ${path}:`, error);
            return of(false);
          })
        );
      }),
      catchError(error => {
        console.error(`Error listing directory contents for ${path}:`, error);
        return of(false);
      })
    );
  }

  /**
   * Helper method to extract the path from a download URL
   * Improved version with better error handling
   */
  private getPathFromURL(url: string): string {
    if (!url) return '';
    
    // Extract the path from the Firebase Storage URL
    // Example URL: https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/path%2Fto%2Ffile.jpg?alt=media&token=...
    try {
      const decodedUrl = decodeURIComponent(url);
      const startIndex = decodedUrl.indexOf('/o/') + 3;
      
      if (startIndex < 3) {
        // '/o/' not found in URL
        console.error('Invalid Firebase Storage URL format:', url);
        return '';
      }
      
      const endIndex = decodedUrl.indexOf('?alt=media');
      
      if (endIndex === -1) {
        // No query parameters, try to get everything after '/o/'
        return decodedUrl.substring(startIndex);
      }
      
      return decodedUrl.substring(startIndex, endIndex);
    } catch (error) {
      console.error('Error extracting path from URL:', error, url);
      return '';
    }
  }}