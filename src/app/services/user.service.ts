import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc, setDoc } from '@angular/fire/firestore';
import { Observable, from, map, catchError } from 'rxjs';
import { User } from '../models/user.model';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private auth :Auth
  ){

  }
  private firestore = inject(Firestore);

  getUserById(uid: string): Observable<User> {
    const userRef = doc(this.firestore, 'users', uid);
    return from(getDoc(userRef)).pipe(
      map(docSnap => {
        try {
          return this.parseUserDoc(docSnap);
        } catch (error) {
          console.error('Error fetching user:', error);
          // Return a default user or throw an error as needed
          throw error;
        }
      }),
      catchError(error => {
        console.error('Error in getUserById:', error);
        // You could return a default user instead of throwing an error
        // return of({ uid: 'unknown', email: 'unknown', role: 'unknown' } as User);
        throw error;
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
  // Add these methods to your UserService

  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      this.auth.onAuthStateChanged(user => {
        if (user) {
          this.getUserById(user.uid).subscribe({
            next: userData => {
              resolve(userData);
            },
            error: error => {
              console.error('Error getting current user data:', error);
              resolve(null);
            }
          });
        } else {
          resolve(null);
        }
      });
    });
  }

async deleteUser(uid: string): Promise<void> {
  // First delete the user document
  const userRef = doc(this.firestore, 'users', uid);
  await deleteDoc(userRef);
  
  // You'll need to add Firebase Admin SDK to delete the auth user
  // For now, we'll just delete the document
  return Promise.resolve();
}

async createAdminUser(email: string, password: string, displayName: string): Promise<void> {
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
}

  getUsersByRole(role: 'customer' | 'farmer' | 'admin'): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('role', '==', role));
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => 
        querySnapshot.docs.map(doc => this.parseUserDoc(doc))
      )
    );
  }

  private parseUserDoc(doc: any): User {
    if (!doc.exists()) {
      throw new Error('Document not found');
    }
    
    const data = doc.data();
    return {
      uid: doc.id,
      email: data.email,
      displayName: data.displayName,
      phoneNumber: data.phoneNumber,
      location: data.location,
      role: data.role,
      createdAt: data.createdAt,
      profileImage: data.profileImage
    };
  }
}