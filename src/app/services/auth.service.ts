import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  user, 
  UserCredential,
  sendPasswordResetEmail
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  addDoc,
  DocumentReference
} from '@angular/fire/firestore';
import { Observable, from, map, of, switchMap, tap, catchError, throwError } from 'rxjs';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

  /**
   * Generate a random 6-digit verification code
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private sendVerificationEmail(email: string, code: string): Observable<boolean> {
    // The email will be sent by the Cloud Function when the document is created
    // We just need to return success here
    console.log(`Verification code generated for ${email}. Email will be sent by Cloud Function.`);
    return of(true);
  }

  /**
   * Initiate registration by sending verification code
   * Step 1 of the registration process
   */
  initiateRegistration(email: string, userData: any): Observable<string> {
    // Generate verification code
    const verificationCode = this.generateVerificationCode();
    
    // Store pending registration in Firestore
    const pendingRegistrationsRef = collection(this.firestore, 'pendingRegistrations');
    
    // Set expiration time (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    // Create pending registration record
    return from(addDoc(pendingRegistrationsRef, {
      email,
      verificationCode,
      userData,
      expiresAt,
      createdAt: serverTimestamp(),
      attempts: 0
    })).pipe(
      switchMap((docRef: DocumentReference) => {
        // Send verification email with code
        return this.sendVerificationEmail(email, verificationCode).pipe(
          map(() => docRef.id) // Return the document ID for future reference
        );
      }),
      catchError(error => {
        console.error('Error initiating registration:', error);
        return throwError(() => new Error('Failed to initiate registration'));
      })
    );
  }

  /**
   * Complete registration with verification code
   * Step 2 of the registration process
   */
  completeRegistration(
    pendingId: string, 
    email: string, 
    password: string, 
    verificationCode: string
  ): Observable<UserCredential> {
    const pendingRef = doc(this.firestore, 'pendingRegistrations', pendingId);
    
    return from(getDoc(pendingRef)).pipe(
      switchMap(docSnap => {
        if (!docSnap.exists()) {
          return throwError(() => new Error('Registration request not found or expired'));
        }
        
        const data = docSnap.data();
        
        // Check if code has expired
        const expiresAt = data['expiresAt'].toDate();
        if (new Date() > expiresAt) {
          return throwError(() => new Error('Verification code has expired'));
        }
        
        // Check if too many attempts
        const attempts = data['attempts'] || 0;
        if (attempts >= 5) {
          return throwError(() => new Error('Too many failed attempts. Please request a new code.'));
        }
        
        // Verify the code
        if (data['verificationCode'] !== verificationCode) {
          // Increment attempts counter
          from(updateDoc(pendingRef, { attempts: attempts + 1 })).subscribe();
          return throwError(() => new Error('Invalid verification code'));
        }
        
        // Verification successful, create the user account
        return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
          switchMap(credential => {
            const userData = data['userData'];
            
            // Create the user document in Firestore
            const user: User = {
              uid: credential.user.uid,
              email,
              displayName: userData.displayName,
              phoneNumber: userData.phoneNumber || '',
              location: userData.location || '',
              role: userData.role,
              createdAt: new Date(),
              status: 'active'
            };
            
            // Save user to Firestore
            return from(setDoc(doc(this.firestore, 'users', credential.user.uid), user)).pipe(
              switchMap(() => {
                // Delete the pending registration
                return from(deleteDoc(pendingRef)).pipe(
                  map(() => credential)
                );
              })
            );
          })
        );
      }),
      catchError(error => {
        console.error('Error completing registration:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Login with email and password
   */
  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(userCredential => this.getUserData(userCredential.user.uid)),
      tap(user => {
        if (user) {
          this.navigateByRole(user.role);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout current user
   */
  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        // Navigate to home after logout
        this.router.navigate(['/']);
      })
    );
  }

  /**
   * Initiate password reset by sending verification code
   */
  initiatePasswordReset(email: string): Observable<string> {
    // Generate verification code
    const verificationCode = this.generateVerificationCode();
    
    // Store reset request in Firestore
    const resetRequestsRef = collection(this.firestore, 'passwordResetRequests');
    
    // Set expiration time (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    // Create reset request record
    return from(addDoc(resetRequestsRef, {
      email,
      verificationCode,
      expiresAt,
      createdAt: serverTimestamp(),
      attempts: 0
    })).pipe(
      switchMap((docRef: DocumentReference) => {
        // Send verification email with code
        return this.sendVerificationEmail(email, verificationCode).pipe(
          map(() => docRef.id) // Return the document ID for future reference
        );
      }),
      catchError(error => {
        console.error('Error initiating password reset:', error);
        return throwError(() => new Error('Failed to initiate password reset'));
      })
    );
  }

  /**
   * Complete password reset with verification code
   */
  completePasswordReset(
    resetId: string,
    email: string,
    newPassword: string,
    verificationCode: string
  ): Observable<boolean> {
    const resetRef = doc(this.firestore, 'passwordResetRequests', resetId);
    
    return from(getDoc(resetRef)).pipe(
      switchMap(docSnap => {
        if (!docSnap.exists()) {
          return throwError(() => new Error('Reset request not found or expired'));
        }
        
        const data = docSnap.data();
        
        // Check if code has expired
        const expiresAt = data['expiresAt'].toDate();
        if (new Date() > expiresAt) {
          return throwError(() => new Error('Verification code has expired'));
        }
        
        // Check if too many attempts
        const attempts = data['attempts'] || 0;
        if (attempts >= 5) {
          return throwError(() => new Error('Too many failed attempts. Please request a new code.'));
        }
        
        // Verify the code
        if (data['verificationCode'] !== verificationCode) {
          // Increment attempts counter
          from(updateDoc(resetRef, { attempts: attempts + 1 })).subscribe();
          return throwError(() => new Error('Invalid verification code'));
        }
        
        // Verification successful, reset the password
        return from(sendPasswordResetEmail(this.auth, email)).pipe(
          switchMap(() => {
            // Delete the reset request
            return from(deleteDoc(resetRef)).pipe(
              map(() => true)
            );
          })
        );
      }),
      catchError(error => {
        console.error('Error completing password reset:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get user data from Firestore
   */
  private getUserData(uid: string): Observable<User> {
    const userRef = doc(this.firestore, 'users', uid);
    return from(getDoc(userRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return { ...docSnap.data(), uid: docSnap.id } as User;
        } else {
          throw new Error('User does not exist');
        }
      })
    );
  }

  /**
   * Navigate based on user role
   */
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

  /**
   * Clean up expired verification codes and password reset requests
   * This could be run periodically by your application
   */
  cleanupExpiredRequests(): Observable<number> {
    const now = new Date();
    
    // Clean up pending registrations
    const pendingQuery = query(
      collection(this.firestore, 'pendingRegistrations'),
      where('expiresAt', '<', now)
    );
    
    // Clean up password reset requests
    const resetQuery = query(
      collection(this.firestore, 'passwordResetRequests'),
      where('expiresAt', '<', now)
    );
    
    // Execute both cleanup operations
    return from(Promise.all([getDocs(pendingQuery), getDocs(resetQuery)])).pipe(
      switchMap(([pendingSnapshot, resetSnapshot]) => {
        const deletePromises: Promise<void>[] = [];
        
        // Delete expired pending registrations
        pendingSnapshot.docs.forEach(doc => {
          deletePromises.push(deleteDoc(doc.ref));
        });
        
        // Delete expired password reset requests
        resetSnapshot.docs.forEach(doc => {
          deletePromises.push(deleteDoc(doc.ref));
        });
        
        // Execute all deletions
        return from(Promise.all(deletePromises)).pipe(
          map(() => deletePromises.length)
        );
      })
    );
  }
}