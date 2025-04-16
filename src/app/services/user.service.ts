import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc, deleteDoc, QuerySnapshot, DocumentData } from '@angular/fire/firestore';
import { Observable, from, map, catchError, of, switchMap } from 'rxjs';
import { User } from '../models/user.model';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private productService = inject(ProductService);

  getUserById(uid: string): Observable<User | null> {
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

  updateUser(uid: string, data: Partial<User>): Observable<void> {
    const userRef = doc(this.firestore, 'users', uid);
    return from(updateDoc(userRef, data)).pipe(
      catchError(error => {
        console.error('Update error:', error);
        throw error;
      })
    );
  }

  getUsersByRole(role: 'customer' | 'farmer' | 'admin'): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('role', '==', role));
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => 
        querySnapshot.docs.map(doc => this.parseUserDoc(doc))
      ),
      catchError(error => {
        console.error(`Error fetching users with role ${role}:`, error);
        return of([]);
      })
    );
  }
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

  deleteUser(uid: string): Observable<void> {
    if (!uid) {
      console.error('Invalid user ID provided for deletion');
      return from(Promise.reject(new Error('Invalid user ID')));
    }
    
    // First, get the user to check their role
    return this.getUserById(uid).pipe(
      switchMap(user => {
        if (!user) {
          console.log(`User with ID ${uid} not found, proceeding with deletion anyway`);
          // Even if user not found, try to delete any products just in case
          return this.productService.deleteProductsByFarmer(uid).pipe(
            switchMap(() => {
              // Then try to delete the user document (which might not exist)
              const userRef = doc(this.firestore, 'users', uid);
              return from(deleteDoc(userRef)).pipe(
                catchError(error => {
                  // If the document doesn't exist, consider it a success
                  console.log('User document might not exist, continuing:', error);
                  return of(undefined);
                })
              );
            })
          );
        }
        
        // If user is a farmer, first delete all their products
        if (user.role === 'farmer') {
          return this.productService.deleteProductsByFarmer(uid).pipe(
            switchMap(() => {
              // Then delete the user document
              const userRef = doc(this.firestore, 'users', uid);
              return from(deleteDoc(userRef));
            }),
            catchError(error => {
              console.error(`Error during deletion cascade for user ${uid}:`, error);
              throw error;
            })
          );
        } else {
          // For non-farmers, just delete the user document
          const userRef = doc(this.firestore, 'users', uid);
          return from(deleteDoc(userRef));
        }
      }),
      catchError(error => {
        console.error('Error deleting user:', error);
        throw error;
      })
    );
  }

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