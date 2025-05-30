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
  checkActionCode,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  getDoc, 
  setDoc, 
  Timestamp, 
  deleteDoc,
  updateDoc
} from '@angular/fire/firestore';
import { 
  Observable, 
  from, 
  map, 
  of, 
  switchMap, 
  tap, 
  timer, 
  BehaviorSubject, 
  catchError, 
  throwError,
  finalize,
  take,
  firstValueFrom
} from 'rxjs';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  auth: Auth = inject(Auth); // Changed to public for components that need access
  private firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);
  
  user$: Observable<User | null>;
  
  // Add these new BehaviorSubjects to track verification status
  private isVerifying = new BehaviorSubject<boolean>(false);
  isVerifying$ = this.isVerifying.asObservable();
  
  private verificationError = new BehaviorSubject<string | null>(null);
  verificationError$ = this.verificationError.asObservable();

  constructor() {
    this.user$ = user(this.auth).pipe(
      switchMap(firebaseUser => {
        if (firebaseUser) {
          return this.getUserData(firebaseUser.uid).pipe(
            // Check on every login if email is verified
            tap(userData => {
              // If Firebase says email is verified but our database doesn't show it,
              // update the database record
              if (firebaseUser.emailVerified && userData && !userData.isVerified) {
                this.updateUserVerificationStatus(userData.uid, true);
              }
            })
          );
        } else {
          return of(null);
        }
      })
    );
  }

  /**
   * Register a new user with email verification
   */
  async register(email: string, password: string, role: 'customer' | 'farmer' | 'admin', 
    displayName: string, phoneNumber?: string, location?: string): Promise<UserCredential> {
    try {
      // Create the user in Firebase Authentication
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Set up the user document with verification status
      const user: User = {
        uid: credential.user.uid,
        email,
        displayName,
        phoneNumber: phoneNumber || '',
        location: location || '',
        role,
        createdAt: new Date(),
        isVerified: false, // Default to not verified
        verificationSentAt: new Date() // Track when verification was sent
      };
      
      // Save the user document to Firestore
      await setDoc(doc(this.firestore, 'users', credential.user.uid), user);
      
      // Send verification email
      await this.sendVerificationEmail(credential.user);
      
      // Schedule user deletion if not verified within time limit
      this.scheduleUserDeletion(credential.user.uid, 20); // 20 minutes
      
      return credential;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login with email and password, checking verification status
   */
  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(credential => {
        // Check if email is verified in Firebase Auth
        const isFirebaseVerified = credential.user.emailVerified;
        
        return this.getUserData(credential.user.uid).pipe(
          switchMap(userData => {
            if (!userData) {
              return throwError(() => new Error('User data not found'));
            }
            
            // If Firebase says verified but our database doesn't, update database
            if (isFirebaseVerified && !userData.isVerified) {
              return from(this.updateUserVerificationStatus(userData.uid, true)).pipe(
                map(() => ({...userData, isVerified: true}))
              );
            }
            
            // If not verified in both places, throw an error
            if (!isFirebaseVerified && !userData.isVerified) {
              // Resend verification email if needed
              this.sendVerificationEmail(credential.user);
              return throwError(() => new Error('EMAIL_NOT_VERIFIED'));
            }
            
            return of(userData);
          })
        );
      }),
      tap(user => {
        if (user) {
          this.navigateByRole(user.role);
        }
      }),
      catchError(error => {
        if (error.message === 'EMAIL_NOT_VERIFIED') {
          return throwError(() => ({
            code: 'auth/email-not-verified',
            message: 'Please verify your email address before logging in. Check your inbox for the verification link.'
          }));
        }
        return throwError(() => error);
      })
    );
  }

  
/**
 * Get the current Firebase Auth user
 * @returns The current Firebase user or null
 */
getCurrentUser(): any {
  return this.auth.currentUser;
}

/**
 * Send or resend verification email
 */
async sendVerificationEmail(user: any): Promise<void> {
  this.isVerifying.next(true);
  this.verificationError.next(null);
  
  try {
    // Get user data to determine role for redirect
    const userData = await firstValueFrom(this.getUserData(user.uid).pipe(take(1)));
    const role = userData?.role || 'customer';
    
    // Create a redirect URL that includes the role for proper navigation after verification
    const redirectUrl = `${window.location.origin}/auth/verified?role=${role}`;
    
    // Send the verification email with the proper redirect URL
    await sendEmailVerification(user, {
      url: redirectUrl,
      handleCodeInApp: true
    });
    
    // Update the verification sent time in Firestore
    const userRef = doc(this.firestore, 'users', user.uid);
    await updateDoc(userRef, { verificationSentAt: new Date() });
    
  } catch (error) {
    console.error('Error sending verification email:', error);
    this.verificationError.next('Failed to send verification email. Please try again later.');
    throw error;
  } finally {
    this.isVerifying.next(false);
  }
}

  /**
   * Schedule user deletion if not verified within timeLimit minutes
   */
  private scheduleUserDeletion(uid: string, timeLimit: number): void {
    // Set a timer to check verification status after the time limit
    timer(timeLimit * 60 * 1000).pipe(
      switchMap(() => this.getUserData(uid)),
      take(1)
    ).subscribe(userData => {
      // If user exists and is still not verified, delete them
      if (userData && !userData.isVerified) {
        console.log(`User ${uid} not verified within ${timeLimit} minutes. Deleting account.`);
        this.deleteUnverifiedUser(uid);
      }
    });
  }

  /**
   * Delete an unverified user
   */
  private async deleteUnverifiedUser(uid: string): Promise<void> {
    try {
      // First, delete the user document from Firestore
      const userRef = doc(this.firestore, 'users', uid);
      await deleteDoc(userRef);
      
      // We can't delete the Auth user from here, so admin functions would be needed
      // This would typically be handled by a Firebase Function trigger
      console.log(`User document ${uid} deleted due to non-verification.`);
    } catch (error) {
      console.error(`Error deleting unverified user ${uid}:`, error);
    }
  }

  /**
   * Update user verification status in Firestore
   */
  async updateUserVerificationStatus(uid: string, isVerified: boolean): Promise<void> {
    const userRef = doc(this.firestore, 'users', uid);
    return updateDoc(userRef, { isVerified });
  }

 /**
 * Process verification from link
 */
/**
 * Process verification from link
 */
verifyEmail(actionCode: string): Observable<boolean> {
  this.isVerifying.next(true);
  this.verificationError.next(null);
  
  return from(applyActionCode(this.auth, actionCode)).pipe(
    switchMap(() => {
      // Force reload the user to update emailVerified property
      if (this.auth.currentUser) {
        return from(this.auth.currentUser.reload()).pipe(
          switchMap(() => {
            const currentUser = this.auth.currentUser;
            if (currentUser) {
              return from(this.updateUserVerificationStatus(currentUser.uid, true)).pipe(
                switchMap(() => {
                  // Get the user's role to navigate correctly
                  return this.getUserData(currentUser.uid);
                }),
                tap(userData => {
                  if (userData && userData.role) {
                    // Navigate based on user role instead of reloading
                    this.navigateByRole(userData.role);
                  }
                }),
                map(() => true)
              );
            }
            return of(true);
          })
        );
      }
      return of(true);
    }),
    catchError(error => {
      console.error('Error verifying email:', error);
      this.verificationError.next('Failed to verify email. The link may have expired or been used already.');
      return of(false);
    }),
    finalize(() => {
      this.isVerifying.next(false);
    })
  );
}

/**
 * Send password reset email with correctly configured settings
 * @param email User's email address
 * @returns Promise<void>
 */
sendPasswordResetEmail(email: string): Promise<void> {
  console.log('[AuthService] Sending password reset email to:', email);
  
  // Use just the origin URL without any path, consistent with email verification
  const actionCodeSettings = {
    url: window.location.origin, // Do NOT append any paths to the origin
    handleCodeInApp: false // Standard email link approach works more reliably
  };
  
  console.log('[AuthService] Using password reset settings:', actionCodeSettings);
  
  return sendPasswordResetEmail(this.auth, email, actionCodeSettings)
    .then(() => {
      console.log('[AuthService] Password reset email sent successfully');
      return Promise.resolve();
    })
    .catch(error => {
      console.error('[AuthService] Error sending password reset email:', error);
      return Promise.reject(error);
    });
}

/**
 * Complete the password reset process
 * @param oobCode The action code from the password reset email
 * @param newPassword The new password
 * @returns Promise<void>
 */
confirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
  console.log('[AuthService] Confirming password reset');
  
  return confirmPasswordReset(this.auth, oobCode, newPassword)
    .then(() => {
      console.log('[AuthService] Password reset successful');
      return Promise.resolve();
    })
    .catch(error => {
      console.error('[AuthService] Error confirming password reset:', error);
      return Promise.reject(error);
    });
}

/**
 * Verify the password reset code is valid before showing the password reset form
 * @param oobCode The action code from the password reset email
 * @returns Promise<string> The email address associated with the code
 */
verifyPasswordResetCode(oobCode: string): Promise<string> {
  console.log('[AuthService] Verifying password reset code');
  
  return verifyPasswordResetCode(this.auth, oobCode)
    .then(email => {
      console.log('[AuthService] Password reset code valid for email:', email);
      return email;
    })
    .catch(error => {
      console.error('[AuthService] Invalid or expired password reset code:', error);
      return Promise.reject(error);
    });
}

  /**
   * Logout the current user
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
  private getUserData(uid: string): Observable<User | null> {
    const userRef = doc(this.firestore, 'users', uid);
    return from(getDoc(userRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return docSnap.data() as User;
        } else {
          return null;
        }
      }),
      catchError(error => {
        console.error(`Error fetching user data for ${uid}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Navigate based on user role
   */
  navigateByRole(role: string): void {
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