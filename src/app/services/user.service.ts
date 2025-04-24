import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  QuerySnapshot, 
  DocumentData,
  writeBatch
} from '@angular/fire/firestore';
import { 
  Observable, 
  from, 
  map, 
  catchError, 
  of, 
  switchMap, 
  throwError,
  forkJoin
} from 'rxjs';
import { User } from '../models/user.model';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { ProductService } from './product.service';
import { FileUploadService } from './file-upload.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private productService = inject(ProductService);
  private fileUploadService = inject(FileUploadService);

  /**
   * Get user by ID
   * @param uid User ID
   * @returns Observable<User | null>
   */
  getUserById(uid: string): Observable<User | null> {
    if (!uid) {
      console.error('Invalid user ID provided to getUserById');
      return of(null);
    }

    const userRef = doc(this.firestore, 'users', uid);
    return from(getDoc(userRef)).pipe(
      map(docSnap => {
        if (!docSnap.exists()) {
          console.log(`User with ID ${uid} not found in database`);
          return null; // Return null for non-existent users
        }
        return this.parseUserDoc(docSnap);
      }),
      catchError(error => {
        console.error(`Error fetching user ${uid}:`, error);
        return of(null); // Return null on any error
      })
    );
  }

  /**
   * Update user profile data
   * @param uid User ID
   * @param data Partial user data to update
   * @returns Observable<void>
   */
  updateUser(uid: string, data: Partial<User>): Observable<void> {
    if (!uid) {
      return throwError(() => new Error('Invalid user ID'));
    }
    
    const userRef = doc(this.firestore, 'users', uid);
    return from(updateDoc(userRef, data)).pipe(
      catchError(error => {
        console.error(`Error updating user ${uid}:`, error);
        return throwError(() => new Error('Failed to update user profile'));
      })
    );
  }

  /**
   * Upload and update user profile image
   * @param userId User ID
   * @param file Image file to upload
   * @returns Observable<string> - The download URL
   */
  updateProfileImage(userId: string, file: File): Observable<string> {
    if (!userId || !file) {
      return throwError(() => new Error('Invalid user ID or file'));
    }
    
    return this.fileUploadService.uploadProfileImage(file, userId).pipe(
      switchMap(downloadURL => {
        // Update the user profile with the new image URL
        return this.updateUser(userId, { profileImage: downloadURL }).pipe(
          map(() => downloadURL)
        );
      }),
      catchError(error => {
        console.error('Error updating profile image:', error);
        return throwError(() => new Error('Failed to update profile image'));
      })
    );
  }

  /**
   * Delete user profile image
   * @param userId User ID
   * @param imageUrl URL of the profile image to delete
   * @returns Observable<boolean>
   */
  deleteProfileImage(userId: string, imageUrl: string): Observable<boolean> {
    if (!userId || !imageUrl) {
      console.error('Invalid user ID or image URL provided to deleteProfileImage');
      return of(false);
    }
    
    // First delete the file from storage
    return this.fileUploadService.deleteFile(imageUrl).pipe(
      switchMap(success => {
        if (success) {
          // Then update the user document to remove the profile image URL
          return this.updateUser(userId, { profileImage: null }).pipe(
            map(() => true),
            catchError(error => {
              console.error(`Error updating user profile after image deletion:`, error);
              return of(false);
            })
          );
        }
        console.log(`Failed to delete profile image from storage for user ${userId}`);
        return of(false);
      }),
      catchError(error => {
        console.error(`Error in profile image deletion process:`, error);
        return of(false);
      })
    );
  }

  /**
   * Get users by role
   * @param role User role
   * @returns Observable<User[]>
   */
  getUsersByRole(role: 'customer' | 'farmer' | 'admin'): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('role', '==', role));
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => 
        querySnapshot.docs
          .filter(doc => doc.exists())
          .map(doc => this.parseUserDoc(doc))
      ),
      catchError(error => {
        console.error(`Error fetching users with role ${role}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Get all users
   * @returns Observable<User[]>
   */
  getAllUsers(): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    return from(getDocs(usersRef)).pipe(
      map((querySnapshot: QuerySnapshot<DocumentData>) => 
        querySnapshot.docs
          .filter(doc => doc.exists()) // Filter out non-existent documents
          .map(doc => this.parseUserDoc(doc))
      ),
      catchError(error => {
        console.error('Error fetching all users:', error);
        return of([]);
      })
    );
  }

  /**
   * Get the currently authenticated user
   * @returns Promise<User | null>
   */
  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = this.auth.onAuthStateChanged(user => {
        unsubscribe(); // Important: prevent memory leaks
        if (user) {
          this.getUserById(user.uid).subscribe({
            next: userData => resolve(userData),
            error: () => resolve(null)
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * Delete a user and their data
   * Improved implementation with proper error handling and complete deletion
   * @param uid User ID
   * @returns Observable<void>
   */
  deleteUser(uid: string): Observable<void> {
    if (!uid) {
      console.error('Invalid user ID provided for deletion');
      return throwError(() => new Error('Invalid user ID'));
    }
    
    console.log(`Starting deletion process for user ${uid}`);
    
    // First, get the user to check their role and get their profile image if any
    return this.getUserById(uid).pipe(
      switchMap(user => {
        // Collection of deletion tasks to perform
        const deletionTasks: Observable<unknown>[] = [];
        
        // If user is a farmer, delete all their products first
        if (user?.role === 'farmer') {
          deletionTasks.push(
            this.productService.deleteProductsByFarmer(uid).pipe(
              catchError(error => {
                console.error(`Error deleting farmer products for ${uid}:`, error);
                return of(null); // Continue deletion process despite error
              })
            )
          );
        }
        
        // If user has a profile image, delete it
        if (user?.profileImage) {
          deletionTasks.push(
            this.fileUploadService.deleteFile(user.profileImage).pipe(
              catchError(error => {
                console.error(`Error deleting profile image for ${uid}:`, error);
                return of(null); // Continue deletion process despite error
              })
            )
          );
        }
        
        // If no user found or no special deletion tasks, just attempt to delete the user document
        if (!user || deletionTasks.length === 0) {
          console.log(`User with ID ${uid} not found or no related data to clean up. Proceeding with document deletion.`);
          const userRef = doc(this.firestore, 'users', uid);
          return from(deleteDoc(userRef)).pipe(
            map(() => {
              console.log(`Successfully deleted user document ${uid}`);
              return undefined;
            }),
            catchError(error => {
              console.error(`Error deleting user document ${uid}:`, error);
              return throwError(() => new Error(`Failed to delete user: ${error.message}`));
            })
          );
        }
        
        // Execute all related data deletion tasks first
        return forkJoin(deletionTasks).pipe(
          switchMap(() => {
            console.log(`Completed related data cleanup for user ${uid}. Proceeding with user document deletion.`);
            
            // Then delete the user document
            const userRef = doc(this.firestore, 'users', uid);
            return from(deleteDoc(userRef)).pipe(
              map(() => {
                console.log(`Successfully deleted user document ${uid}`);
                return undefined;
              }),
              catchError(error => {
                console.error(`Error deleting user document ${uid}:`, error);
                return throwError(() => new Error(`Failed to delete user document: ${error.message}`));
              })
            );
          })
        );
      }),
      catchError(error => {
        console.error(`Complete error in user deletion process for ${uid}:`, error);
        return throwError(() => new Error(`Failed to delete user: ${error.message}`));
      })
    );
  }

  /**
   * Create an admin user
   * @param email Admin email
   * @param password Admin password
   * @param displayName Admin display name
   * @returns Promise<void>
   */
  async createAdminUser(email: string, password: string, displayName: string): Promise<void> {
    try {
      // Create the auth user
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Create the user document
      const user: User = {
        uid: userCredential.user.uid,
        email,
        displayName,
        role: 'admin',
        createdAt: new Date()
      };
      
      const userRef = doc(this.firestore, 'users', userCredential.user.uid);
      await setDoc(userRef, user);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error creating admin user:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Parse a Firestore document into a User object
   * @param doc Firestore document
   * @returns User object
   */
  private parseUserDoc(doc: any): User {
    if (!doc.exists()) {
      throw new Error('Document not found');
    }
    
    const data = doc.data();
    
    // Create a user object with default values for optional fields
    return {
      uid: doc.id,
      email: data.email || '',
      displayName: data.displayName || '',
      phoneNumber: data.phoneNumber || '',
      location: data.location || '',
      role: data.role || 'customer',
      createdAt: data.createdAt || new Date(),
      profileImage: data.profileImage || ''
    };
  }
}