import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  user, 
  UserCredential, 
  sendEmailVerification,
  applyActionCode,
  checkActionCode
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
  serverTimestamp
} from '@angular/fire/firestore';
import { Observable, from, map, of, switchMap, tap, catchError } from 'rxjs';
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
          // Check if email is verified when required
          if (firebaseUser.emailVerified) {
            return this.getUserData(firebaseUser.uid);
          } else {
            // Check if the user is in the verification process
            return this.getUserData(firebaseUser.uid).pipe(
              map(userData => {
                if (userData && userData.emailVerificationRequired && !userData.emailVerified) {
                  // User exists but needs to verify email
                  return {...userData, pendingEmailVerification: true};
                }
                return userData;
              })
            );
          }
        } else {
          return of(null);
        }
      })
    );
  }

  /**
   * Step 1 of registration - Create user account and send verification email
   */
  async register(
    email: string, 
    password: string, 
    role: 'customer' | 'farmer' | 'admin', 
    displayName: string, 
    phoneNumber?: string, 
    location?: string
  ): Promise<UserCredential> {
    try {
      // Create the Firebase Auth account
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Send verification email
      await sendEmailVerification(credential.user);
      
      // Create user document with verified=false
      const user: User = {
        uid: credential.user.uid,
        email,
        displayName,
        phoneNumber: phoneNumber || '',
        location: location || '',
        role,
        createdAt: new Date(),
        emailVerified: false,
        emailVerificationRequired: true,
        status: 'pending' // Account status until verified
      };
      
      // Save to Firestore
      await setDoc(doc(this.firestore, 'users', credential.user.uid), user);
      
      // After registration, direct to verification page
      this.router.navigate(['/verify-email']);
      
      return credential;
    } catch (error) {
      console.error('Registration error:', error);
      
      // If there's an error after creating the user, try to clean up
      try {
        // If the user was created in Auth but the document creation failed
        if (this.auth.currentUser) {
          await this.auth.currentUser.delete();
        }
      } catch (deleteError) {
        console.error('Error cleaning up after failed registration:', deleteError);
      }
      
      throw error;
    }
  }

  /**
   * Verify email using action code from email link
   */
  verifyEmail(actionCode: string): Observable<boolean> {
    return from(applyActionCode(this.auth, actionCode)).pipe(
      switchMap(() => {
        // After verification with Firebase Auth, update our Firestore record
        if (this.auth.currentUser) {
          const userRef = doc(this.firestore, 'users', this.auth.currentUser.uid);
          return from(updateDoc(userRef, { 
            emailVerified: true,
            status: 'active',
            updatedAt: serverTimestamp()
          })).pipe(
            map(() => true),
            catchError(error => {
              console.error('Error updating verification status:', error);
              return of(false);
            })
          );
        }
        return of(false);
      }),
      catchError(error => {
        console.error('Error verifying email:', error);
        return of(false);
      })
    );
  }

  /**
   * Resend verification email to current user
   */
  resendVerificationEmail(): Observable<boolean> {
    if (!this.auth.currentUser) {
      return of(false);
    }
    
    return from(sendEmailVerification(this.auth.currentUser)).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error sending verification email:', error);
        return of(false);
      })
    );
  }

  /**
   * Check if the current user's email is verified
   */
  checkEmailVerified(): Observable<boolean> {
    if (!this.auth.currentUser) {
      return of(false);
    }
    
    // Reload the user to get fresh verification status
    return from(this.auth.currentUser.reload()).pipe(
      map(() => {
        return this.auth.currentUser?.emailVerified || false;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * Login with email and password
   */
 /**
 * Login with email and password
 */
login(email: string, password: string): Observable<any> {
  return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
    switchMap(userCredential => { // Change 'credential' to 'userCredential'
      // Now use userCredential throughout this method
      return this.getUserData(userCredential.user.uid).pipe(
        switchMap(user => {
          if (user) {
            // Check if email verification is required but not completed
            if (user.emailVerificationRequired && !user.emailVerified) {
              if (!userCredential.user.emailVerified) { // Use userCredential here
                // Email verification is pending
                this.router.navigate(['/verify-email']);
                return of({...user, pendingEmailVerification: true});
              } else {
                // Firebase Auth shows verified, but our DB doesn't - update it
                const userRef = doc(this.firestore, 'users', user.uid);
                return from(updateDoc(userRef, { 
                  emailVerified: true,
                  status: 'active',
                  updatedAt: serverTimestamp()
                })).pipe(
                  map(() => ({...user, emailVerified: true}))
                );
              }
            } else {
              // User is verified or verification not required
              this.navigateByRole(user.role);
              return of(user);
            }
          } else {
            throw new Error('User data not found');
          }
        })
      );
    }),
    catchError(error => {
      console.error('Login error:', error);
      throw error;
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
   * Clean up unverified accounts (could be run on a schedule)
   * This helps prevent accumulation of unverified accounts
   */
  cleanupUnverifiedAccounts(olderThanDays: number = 7): Observable<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const usersRef = collection(this.firestore, 'users');
    const q = query(
      usersRef, 
      where('emailVerified', '==', false),
      where('status', '==', 'pending'),
      where('createdAt', '<', cutoffDate)
    );
    
    return from(getDocs(q)).pipe(
      switchMap(snapshot => {
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        return from(Promise.all(deletePromises)).pipe(
          map(() => snapshot.size)
        );
      })
    );
  }
}