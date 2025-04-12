import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Observable, from, map, catchError } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);

  getUserById(uid: string): Observable<User> {
    const userRef = doc(this.firestore, 'users', uid);
    return from(getDoc(userRef)).pipe(
      map(docSnap => this.parseUserDoc(docSnap)),
      catchError(error => {
        console.error('Error fetching user:', error);
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
    if (!doc.exists()) throw new Error('Document not found');
    const data = doc.data();
    return {
      uid: doc.id,
      email: data.email,
      displayName: data.displayName,
      phoneNumber: data.phoneNumber,
      location: data.location,
      role: data.role,
      createdAt: data.createdAt
    };
  }
}