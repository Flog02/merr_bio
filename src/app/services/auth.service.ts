import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, UserCredential } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, Timestamp } from '@angular/fire/firestore';
import { Observable, from, map, of, switchMap, tap } from 'rxjs';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);
  
  user$: Observable<User | null>;

  constructor() {
    this.user$ = user(this.auth).pipe(
      switchMap(firebaseUser => {
        if (firebaseUser) {
          return this.getUserData(firebaseUser.uid);
        } else {
          return of(null);
        }
      })
    );
  }

  // async register(email: string, password: string, role: 'customer' | 'farmer' | 'admin', displayName: string, phoneNumber?: string, location?: string): Promise<void> {
  //   try {
  //     const credential = await createUserWithEmailAndPassword(this.auth, email, password);
  //     const user: User = {
  //       uid: credential.user.uid,
  //       email,
  //       displayName,
  //       phoneNumber: phoneNumber || '',
  //       location: location || '',
  //       role,
  //       createdAt: new Date()
  //     };
  //     await setDoc(doc(this.firestore, 'users', credential.user.uid), user);
      
  //     // Navigate based on role
  //     this.navigateByRole(role);
  //     return;
  //   } catch (error) {
  //     console.error('Registration error:', error);
  //     throw error;
  //   }
  // }
  async register(email: string, password: string, role: 'customer' | 'farmer' | 'admin', displayName: string, phoneNumber?: string, location?: string): Promise<UserCredential> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user: User = {
        uid: credential.user.uid,
        email,
        displayName,
        phoneNumber: phoneNumber || '',
        location: location || '',
        role,
        createdAt: new Date()
      };
      await setDoc(doc(this.firestore, 'users', credential.user.uid), user);
      
      // Navigate based on role
      this.navigateByRole(role);
      return credential; // Now returning the credential
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(credential => this.getUserData(credential.user.uid)),
      tap(user => {
        if (user) {
          this.navigateByRole(user.role);
        }
      })
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        // Navigate to home after logout
        this.router.navigate(['/']);
      })
    );
  }

  private getUserData(uid: string): Observable<User> {
    const userRef = doc(this.firestore, 'users', uid);
    return from(getDoc(userRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return docSnap.data() as User;
        } else {
          throw new Error('User does not exist');
        }
      })
    );
  }

  private navigateByRole(role: string): void {
    switch (role) {
      case 'farmer':
        this.router.navigate(['/farmer/dashboard']);
        break;
      case 'customer':
        this.router.navigate(['/customer/dashboard']);
        break;
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}