import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonButton,
  IonIcon,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { AuthService } from '../../../services/auth.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { take, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-verification-success',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonSpinner,
    TranslatePipe
  ],
  template: `
    <ion-content class="ion-padding">
      <div class="verification-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <span *ngIf="isProcessing">{{ 'VERIFYING_EMAIL' | translate }}</span>
              <span *ngIf="!isProcessing && isVerified">{{ 'VERIFICATION_SUCCESS' | translate }}</span>
              <span *ngIf="!isProcessing && !isVerified">{{ 'VERIFICATION_FAILED' | translate }}</span>
            </ion-card-title>
          </ion-card-header>
          
          <ion-card-content>
            <!-- Loading state -->
            <div *ngIf="isProcessing" class="verification-status processing">
              <ion-spinner name="circles"></ion-spinner>
              <p>{{ 'PROCESSING_VERIFICATION' | translate }}</p>
            </div>
            
            <!-- Success state -->
            <div *ngIf="!isProcessing && isVerified" class="verification-status success">
              <div class="success-icon">
                <ion-icon name="checkmark-circle"></ion-icon>
              </div>
              <h3>{{ 'VERIFICATION_SUCCESS_MESSAGE' | translate }}</h3>
              <p class="redirect-message">You will be redirected to your dashboard in {{ redirectCountdown }} seconds</p>
              <ion-button expand="block" (click)="navigateToDashboard()">
                {{ 'GO_TO_DASHBOARD_NOW' | translate }}
              </ion-button>
            </div>
            
            <!-- Error state -->
            <div *ngIf="!isProcessing && !isVerified" class="verification-status error">
              <div class="error-icon">
                <ion-icon name="alert-circle"></ion-icon>
              </div>
              <h3>{{ 'VERIFICATION_FAILED' | translate }}</h3>
              <p>{{ verificationError || ('VERIFICATION_ERROR_MESSAGE' | translate) }}</p>
              <div class="action-buttons">
                <ion-button expand="block" (click)="navigateToLogin()">
                  {{ 'GO_TO_LOGIN' | translate }}
                </ion-button>
                <ion-button expand="block" color="secondary" (click)="retryVerification()">
                  Retry Verification
                </ion-button>
                <ion-button expand="block" color="tertiary" (click)="forceRefresh()">
                  Force Page Refresh
                </ion-button>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: `
    .verification-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 20px;
    }
    
    ion-card {
      max-width: 450px;
      width: 100%;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      overflow: hidden;
    }
    
    ion-card-header {
      text-align: center;
      padding: 24px 20px 0;
      background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-primary-shade));
    }
    
    ion-card-title {
      font-size: 24px;
      font-weight: 600;
      color: white;
      padding-bottom: 16px;
    }
    
    ion-card-content {
      padding: 24px;
    }
    
    .verification-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 0;
      text-align: center;
    }
    
    .success-icon, .error-icon {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
    }
    
    .success-icon {
      background: linear-gradient(135deg, var(--ion-color-success-tint), var(--ion-color-success));
      box-shadow: 0 8px 16px rgba(var(--ion-color-success-rgb), 0.3);
    }
    
    .error-icon {
      background: linear-gradient(135deg, var(--ion-color-danger-tint), var(--ion-color-danger));
      box-shadow: 0 8px 16px rgba(var(--ion-color-danger-rgb), 0.3);
    }
    
    .verification-status ion-icon {
      font-size: 54px;
      color: white;
    }
    
    .verification-status h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--ion-color-dark);
    }
    
    .verification-status p {
      font-size: 16px;
      line-height: 1.5;
      color: var(--ion-color-medium);
      margin-bottom: 24px;
    }
    
    .redirect-message {
      font-weight: 500;
      color: var(--ion-color-success-shade) !important;
    }
    
    .verification-status.processing {
      padding: 40px 0;
    }
    
    .verification-status.processing ion-spinner {
      width: 48px;
      height: 48px;
      margin-bottom: 24px;
    }
    
    .action-buttons {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    ion-button {
      --border-radius: 10px;
      --box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.4);
      margin-top: 8px;
      height: 48px;
      font-size: 16px;
      font-weight: 500;
    }
  `
})
export class VerificationSuccessPage implements OnInit, OnDestroy {
  isProcessing: boolean = true;
  isVerified: boolean = false;
  verificationError: string | null = null;
  redirectCountdown: number = 3; // Countdown for auto-redirect in seconds
  private countdownInterval: any; // For storing interval reference
  private actionCode: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) {}
  
  ngOnInit() {
    console.log('[VerificationSuccess] Page initialized');
    // Get oobCode (action code) from URL
    this.route.queryParams.subscribe(params => {
      this.actionCode = params['oobCode'];
      console.log('[VerificationSuccess] Verification code from URL:', this.actionCode);
      
      if (!this.actionCode) {
        this.isProcessing = false;
        this.verificationError = 'Invalid verification link. Please try again or request a new verification email.';
        return;
      }
      
      // Process the verification
      this.processVerification(this.actionCode);
    });
  }
  
  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
  
  processVerification(actionCode: string) {
    console.log('[VerificationSuccess] Processing verification code:', actionCode);
    this.authService.verifyEmail(actionCode).pipe(
      catchError(error => {
        console.error('[VerificationSuccess] Error during verification:', error);
        return of(false);
      })
    ).subscribe({
      next: (success) => {
        console.log('[VerificationSuccess] Verification result:', success);
        this.isProcessing = false;
        this.isVerified = success;
        
        if (success) {
          // Start countdown for auto-redirect
          this.startRedirectCountdown();
          
          // Check if we need to manually enforce the verification in the database
          this.checkAndUpdateDatabaseStatus();
        } else {
          this.verificationError = 'Failed to verify your email. The link may have expired or been used already.';
        }
      },
      error: (error) => {
        console.error('[VerificationSuccess] Unexpected error in verification subscription:', error);
        this.isProcessing = false;
        this.isVerified = false;
        this.verificationError = 'An error occurred during verification. Please try again later.';
      }
    });
  }
  
  // Make sure the database status is actually updated
  checkAndUpdateDatabaseStatus() {
    // If we have a current user, double check their status in the database
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.emailVerified) {
      console.log('[VerificationSuccess] Double-checking database status for user:', currentUser.uid);
      
      // Get the user data from Firestore to verify status
      this.authService.user$.pipe(take(1)).subscribe(userData => {
        console.log('[VerificationSuccess] User data from Firestore:', userData);
        
        if (userData && !userData.isVerified) {
          console.log('[VerificationSuccess] Firebase verified but database not updated, forcing update...');
          
          // Force update the database
          this.authService.updateUserVerificationStatus(currentUser.uid, true).then(() => {
            console.log('[VerificationSuccess] Database update successful');
            this.showToast('Verification status updated successfully');
          }).catch(error => {
            console.error('[VerificationSuccess] Error updating database:', error);
          });
        }
      });
    }
  }
  
  // Start countdown for automatic redirect
  startRedirectCountdown() {
    console.log('[VerificationSuccess] Starting redirect countdown');
    this.redirectCountdown = 3; // Reset to 3 seconds
    
    // Clear any existing interval
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    
    // Start new countdown
    this.countdownInterval = setInterval(() => {
      this.redirectCountdown--;
      
      if (this.redirectCountdown <= 0) {
        clearInterval(this.countdownInterval);
        this.navigateToDashboard();
      }
    }, 1000);
  }
  
  navigateToDashboard() {
    console.log('[VerificationSuccess] Navigating to dashboard');
    // Force page reload first to ensure the auth state is refreshed
    window.location.href = '/';
  }
  
  navigateToLogin() {
    console.log('[VerificationSuccess] Navigating to login page');
    this.router.navigate(['/login']);
  }
  
  forceRefresh() {
    console.log('[VerificationSuccess] Forcing page refresh');
    window.location.reload();
  }
  
  retryVerification() {
    console.log('[VerificationSuccess] Retrying verification');
    if (this.actionCode) {
      this.isProcessing = true;
      this.processVerification(this.actionCode);
    } else {
      this.showToast('No verification code available. Please use the link in your email again.');
    }
  }
  
  async showToast(message: string, duration: number = 2000) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom',
      color: 'primary'
    });
    
    await toast.present();
  }
}