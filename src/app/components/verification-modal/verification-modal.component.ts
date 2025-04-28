import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonButton,
  IonSpinner, 
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonAlert,
  ModalController
} from '@ionic/angular/standalone';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { interval, Subject, timer } from 'rxjs';
import { takeUntil, take, map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verification-modal',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonSpinner,
    IonIcon,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonAlert,
    TranslatePipe
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ 'EMAIL_VERIFICATION' | translate }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="closeModal()" [disabled]="isExiting">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="verification-container">
        <!-- When loading/checking verification status -->
        <div *ngIf="isVerifying" class="checking-status">
          <ion-spinner name="circles"></ion-spinner>
          <p>{{ 'CHECKING_VERIFICATION_STATUS' | translate }}</p>
        </div>

        <!-- When waiting for user to verify email -->
        <div *ngIf="!isVerifying && !isExiting && !isVerified" class="pending-verification">
          <div class="email-icon">
            <ion-icon name="mail-open-outline"></ion-icon>
          </div>
          
          <h2>{{ 'VERIFY_YOUR_EMAIL' | translate }}</h2>
          
          <p class="verification-message">
            {{ 'VERIFICATION_EMAIL_SENT' | translate }} <strong>{{ email }}</strong>.
            {{ 'PLEASE_CHECK_INBOX' | translate }}
          </p>
          
          <div class="timer-container">
            <div class="timer-header">
              <ion-icon name="alarm-outline"></ion-icon>
              <span>{{ 'ACCOUNT_DELETION_WARNING' | translate }}</span>
            </div>
            <div class="countdown">{{ timeRemaining | async }}</div>
          </div>
          
          <div class="action-buttons">
            <ion-button expand="block" class="email-button" (click)="openEmail()">
              <ion-icon name="mail" slot="start"></ion-icon>
              {{ 'OPEN_EMAIL_APP' | translate }}
            </ion-button>
            
            <ion-button expand="block" class="resend-button" (click)="resendVerification()" [disabled]="resendDisabled">
              <ion-icon name="refresh" slot="start"></ion-icon>
              {{ 'RESEND_EMAIL' | translate }}
              <span *ngIf="resendCountdown > 0">({{ resendCountdown }}s)</span>
            </ion-button>
            
            <ion-button expand="block" class="check-button" (click)="checkVerificationStatus()" [disabled]="isCheckingStatus">
              <ion-icon name="checkmark-circle" slot="start"></ion-icon>
              <ion-spinner name="dots" *ngIf="isCheckingStatus"></ion-spinner>
              <span *ngIf="!isCheckingStatus">{{ 'CHECK_STATUS' | translate }}</span>
            </ion-button>
          </div>
          
          <div class="auto-verification-notice">
            <ion-icon name="information-circle-outline"></ion-icon>
            <p>Verification status is checked automatically every second.</p>
          </div>
        </div>

        <!-- Exiting verification process confirmation -->
        <div *ngIf="isExiting" class="exiting-verification">
          <ion-icon name="warning" color="danger"></ion-icon>
          <h2>{{ 'WARNING' | translate }}</h2>
          <p>{{ 'EXIT_VERIFICATION_WARNING' | translate }}</p>
          
          <div class="action-buttons">
            <ion-button expand="block" color="danger" (click)="confirmExit()">
              {{ 'CONFIRM_EXIT' | translate }}
            </ion-button>
            
            <ion-button expand="block" color="medium" (click)="cancelExit()">
              {{ 'CANCEL' | translate }}
            </ion-button>
          </div>
        </div>
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
      text-align: center;
      padding: 16px;
      max-width: 500px;
      margin: 0 auto;
    }
    
    .checking-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    
    .email-icon {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--ion-color-primary-tint), var(--ion-color-primary));
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      box-shadow: 0 6px 16px rgba(var(--ion-color-primary-rgb), 0.3);
    }
    
    .email-icon ion-icon {
      font-size: 48px;
      color: white;
    }
    
    h2 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--ion-color-dark);
    }
    
    .verification-message {
      margin: 16px 0 24px;
      font-size: 16px;
      line-height: 1.6;
      color: var(--ion-color-medium);
    }
    
    .timer-container {
      margin: 20px 0;
      padding: 20px;
      background-color: rgba(var(--ion-color-warning-rgb), 0.1);
      border-radius: 12px;
      border-left: 4px solid var(--ion-color-warning);
      width: 100%;
    }
    
    .timer-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      margin-bottom: 10px;
      color: var(--ion-color-warning-shade);
    }
    
    .timer-header ion-icon {
      font-size: 20px;
    }
    
    .countdown {
      font-size: 32px;
      font-weight: bold;
      color: var(--ion-color-danger);
      margin-top: 8px;
      font-family: monospace;
    }
    
    .action-buttons {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 24px;
    }
    
    .email-button {
      --background: var(--ion-color-primary);
      --background-hover: var(--ion-color-primary-shade);
      --box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.4);
    }
    
    .resend-button {
      --background: var(--ion-color-secondary);
      --background-hover: var(--ion-color-secondary-shade);
      --box-shadow: 0 4px 12px rgba(var(--ion-color-secondary-rgb), 0.4);
    }
    
    .check-button {
      --background: var(--ion-color-tertiary);
      --background-hover: var(--ion-color-tertiary-shade);
      --box-shadow: 0 4px 12px rgba(var(--ion-color-tertiary-rgb), 0.4);
    }
    
    .auto-verification-notice {
      margin-top: 24px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background-color: rgba(var(--ion-color-primary-rgb), 0.1);
      border-radius: 8px;
      width: 100%;
    }
    
    .auto-verification-notice ion-icon {
      font-size: 20px;
      color: var(--ion-color-primary);
    }
    
    .auto-verification-notice p {
      margin: 0;
      font-size: 14px;
      color: var(--ion-color-medium);
      text-align: left;
    }
    
    .exiting-verification {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      animation: fadeIn 0.3s ease-out;
    }
    
    .exiting-verification ion-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `
})
export class VerificationModalComponent implements OnInit, OnDestroy {
  @Input() email: string = '';
  
  isVerifying: boolean = false;
  isVerified: boolean = false;
  isExiting: boolean = false;
  isCheckingStatus: boolean = false;
  
  resendDisabled: boolean = false;
  resendCountdown: number = 0;
  
  timeRemaining: any;
  private destroy$ = new Subject<void>();
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private modalController: ModalController
  ) {}
  
  ngOnInit() {
    console.log('Verification modal initialized with email:', this.email);
    // Initialize countdown timer for account deletion (20 minutes)
    this.startDeletionCountdown();
    
    // Check verification status periodically and auto-reload on success
    this.startAutoVerificationCheck();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private startDeletionCountdown() {
    // 20 minutes in milliseconds
    const deletionTime = 20 * 60 * 1000;
    const startTime = new Date().getTime();
    const endTime = startTime + deletionTime;
    
    this.timeRemaining = interval(1000).pipe(
      takeUntil(this.destroy$),
      map(() => {
        const now = new Date().getTime();
        const timeLeft = endTime - now;
        
        if (timeLeft <= 0) {
          return 'Time expired';
        }
        
        // Format time remaining as MM:SS
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      })
    );
  }
  
  private startAutoVerificationCheck() {
    console.log('Starting automatic verification checks');
    // Check every second for better responsiveness
    interval(1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.checkVerificationStatus(true);
    });
  }
  
  checkVerificationStatus(silent: boolean = false) {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      if (!silent) {
        console.log('No current user found during verification check');
      }
      return;
    }
    
    if (!silent) {
      this.isCheckingStatus = true;
      console.log('Manually checking verification status');
    }
    
    // Force refresh the token to check the latest verification status
    currentUser.getIdToken(true).then(() => {
      if (currentUser.emailVerified) {
        console.log('Email verified detected!');
        this.isVerified = true;
        
        // Update the database status if needed
        this.authService.updateUserVerificationStatus(currentUser.uid, true)
          .then(() => {
            console.log('User verification status updated in database, reloading page');
            // Auto-reload page to complete verification and login
            window.location.reload();
          });
      } else if (!silent) {
        console.log('Email not verified yet');
      }
    }).catch((error: any) => {
      if (!silent) {
        console.error('Error refreshing token:', error);
      }
    }).finally(() => {
      if (!silent) {
        this.isCheckingStatus = false;
      }
    });
  }
  
  resendVerification() {
    console.log('Resending verification email');
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      console.log('No current user found, cannot resend verification');
      return;
    }
    
    this.authService.sendVerificationEmail(currentUser)
      .then(() => {
        console.log('Verification email resent successfully');
        // Disable resend button for 60 seconds
        this.resendDisabled = true;
        this.resendCountdown = 60;
        
        const countdownInterval = setInterval(() => {
          this.resendCountdown--;
          
          if (this.resendCountdown <= 0) {
            this.resendDisabled = false;
            clearInterval(countdownInterval);
          }
        }, 1000);
      })
      .catch(error => {
        console.error('Error resending verification email:', error);
      });
  }
  
  openEmail() {
    console.log('Opening email client for', this.email);
    // Try to detect email provider from address
    const emailDomain = this.email.split('@')[1]?.toLowerCase();
    
    let emailUrl = '';
    
    if (emailDomain?.includes('gmail.com')) {
      emailUrl = 'https://mail.google.com/mail/';
    } else if (emailDomain?.includes('yahoo.com')) {
      emailUrl = 'https://mail.yahoo.com/';
    } else if (emailDomain?.includes('outlook.com') || emailDomain?.includes('hotmail.com')) {
      emailUrl = 'https://outlook.live.com/mail/';
    } else {
      // Default to Gmail
      emailUrl = 'https://mail.google.com/mail/';
    }
    
    // Open email provider in new tab
    window.open(emailUrl, '_blank');
  }
  
  closeModal() {
    this.isExiting = true;
  }
  
  confirmExit() {
    console.log('User confirmed exit, abandoning verification');
    // User decided to abandon verification
    this.authService.logout().subscribe(() => {
      this.modalController.dismiss({ abandoned: true });
      this.router.navigate(['/']);
    });
  }
  
  cancelExit() {
    this.isExiting = false;
  }
}