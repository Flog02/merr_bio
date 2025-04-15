import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, from, map, catchError, of } from 'rxjs';
import { User } from '../models/user.model';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

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

  async deleteUser(uid: string): Promise<void> {
    try {
      // Delete user document in Firestore
      const userRef = doc(this.firestore, 'users', uid);
      await deleteDoc(userRef);
      
      // Note: To fully delete a user from Firebase Auth,
      // you would need to use Firebase Admin SDK or Cloud Functions
      return Promise.resolve();
    } catch (error) {
      console.error('Error deleting user:', error);
      return Promise.reject(error);
    }
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