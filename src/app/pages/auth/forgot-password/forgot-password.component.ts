import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { TranslatePipe } from 'src/app/pipes/translate.pipe';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonBackButton,
  IonButtons, IonItem, IonLabel, IonInput, IonIcon, IonSpinner, IonProgressBar
} from '@ionic/angular/standalone';
import { ToastController, AlertController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    TranslatePipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonBackButton,
    IonButtons, IonItem, IonLabel, IonInput, IonIcon, IonSpinner, IonProgressBar
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/login"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ 'FORGOT_PASSWORD' | translate }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Progress bar for reset steps -->
      <div class="progress-container">
        <ion-progress-bar [value]="resetStep / 2"></ion-progress-bar>
        <div class="step-labels">
          <div class="step-label" [class.active]="resetStep >= 1">{{ 'STEP_1' | translate }}</div>
          <div class="step-label" [class.active]="resetStep >= 2">{{ 'STEP_2' | translate }}</div>
        </div>
      </div>

      <!-- Step 1: Email Entry -->
      <div *ngIf="resetStep === 1">
        <h2 class="form-title">{{ 'RESET_PASSWORD' | translate }}</h2>
        
        <div class="reset-info">
          <ion-icon name="lock-open"></ion-icon>
          <p>{{ 'RESET_PASSWORD_INFO' | translate }}</p>
        </div>
        
        <form [formGroup]="emailForm" (ngSubmit)="requestVerificationCode()">
          <ion-item class="custom-input" [class.ion-invalid]="isEmailInvalid()">
            <ion-label position="floating">{{ 'EMAIL' | translate }}</ion-label>
            <ion-input type="email" formControlName="email" inputmode="email"></ion-input>
            <ion-icon *ngIf="isEmailInvalid()" name="alert-circle" slot="end" color="danger"></ion-icon>
          </ion-item>
          <div class="error-message" *ngIf="isEmailInvalid()">
            <span *ngIf="emailForm.get('email')?.errors?.['required']">{{ 'EMAIL_REQUIRED' | translate }}</span>
            <span *ngIf="emailForm.get('email')?.errors?.['email']">{{ 'EMAIL_INVALID' | translate }}</span>
          </div>
          
          <ion-button expand="block" type="submit" [disabled]="emailForm.invalid || isSubmitting" class="ion-margin-top">
            <ion-spinner *ngIf="isSubmitting" name="circles" class="submit-spinner"></ion-spinner>
            <span *ngIf="!isSubmitting">{{ 'SEND_RESET_CODE' | translate }}</span>
          </ion-button>
        </form>
      </div>

      <!-- Step 2: Verification Code and New Password -->
      <div *ngIf="resetStep === 2">
        <h2 class="form-title">{{ 'VERIFY_AND_RESET' | translate }}</h2>
        
        <div class="verification-info">
          <ion-icon name="mail"></ion-icon>
          <p>{{ 'VERIFICATION_CODE_SENT' | translate }} <strong>{{ emailForm.get('email')?.value }}</strong></p>
        </div>
        
        <form [formGroup]="resetForm" (ngSubmit)="resetPassword()">
          <!-- Verification code input -->
          <ion-item class="custom-input verification-code-item" [class.ion-invalid]="isFieldInvalid('verificationCode')">
            <ion-label position="floating">{{ 'VERIFICATION_CODE' | translate }}</ion-label>
            <ion-input type="text" formControlName="verificationCode" inputmode="numeric" maxlength="6"></ion-input>
            <ion-icon *ngIf="isFieldInvalid('verificationCode')" name="alert-circle" slot="end" color="danger"></ion-icon>
          </ion-item>
          <div class="error-message" *ngIf="isFieldInvalid('verificationCode')">
            <span *ngIf="resetForm.get('verificationCode')?.errors?.['required']">{{ 'CODE_REQUIRED' | translate }}</span>
            <span *ngIf="resetForm.get('verificationCode')?.errors?.['pattern']">{{ 'CODE_INVALID' | translate }}</span>
            <span *ngIf="resetForm.get('verificationCode')?.errors?.['invalidCode']">{{ 'CODE_INCORRECT' | translate }}</span>
          </div>
          
          <!-- New Password input -->
          <ion-item class="custom-input" [class.ion-invalid]="isFieldInvalid('newPassword')">
            <ion-label position="floating">{{ 'NEW_PASSWORD' | translate }}</ion-label>
            <ion-input type="password" formControlName="newPassword"></ion-input>
            <ion-icon *ngIf="isFieldInvalid('newPassword')" name="alert-circle" slot="end" color="danger"></ion-icon>
          </ion-item>
          <div class="error-message" *ngIf="isFieldInvalid('newPassword')">
            <span *ngIf="resetForm.get('newPassword')?.errors?.['required']">{{ 'PASSWORD_REQUIRED' | translate }}</span>
            <span *ngIf="resetForm.get('newPassword')?.errors?.['minlength']">{{ 'PASSWORD_MIN_LENGTH' | translate }}</span>
            <span *ngIf="resetForm.get('newPassword')?.errors?.['pattern']">{{ 'PASSWORD_PATTERN' | translate }}</span>
          </div>
          
          <!-- Password strength meter -->
          <div class="password-strength" *ngIf="resetForm.get('newPassword')?.value">
            <div class="strength-meter">
              <div class="strength-bar" [ngClass]="passwordStrengthClass"></div>
            </div>
            <div class="strength-text" [ngClass]="passwordStrengthClass">
              {{ passwordStrengthText | translate }}
            </div>
          </div>
          
          <!-- Confirm Password input -->
          <ion-item class="custom-input" [class.ion-invalid]="isFieldInvalid('confirmPassword')">
            <ion-label position="floating">{{ 'CONFIRM_PASSWORD' | translate }}</ion-label>
            <ion-input type="password" formControlName="confirmPassword"></ion-input>
            <ion-icon *ngIf="isFieldInvalid('confirmPassword')" name="alert-circle" slot="end" color="danger"></ion-icon>
          </ion-item>
          <div class="error-message" *ngIf="isFieldInvalid('confirmPassword')">
            <span *ngIf="resetForm.get('confirmPassword')?.errors?.['required']">{{ 'CONFIRM_PASSWORD_REQUIRED' | translate }}</span>
            <span *ngIf="resetForm.get('confirmPassword')?.errors?.['passwordMismatch']">{{ 'PASSWORDS_DONT_MATCH' | translate }}</span>
          </div>
          
          <div class="code-timer" *ngIf="resendCountdown > 0">
            {{ 'RESEND_CODE_IN' | translate }} {{ resendCountdown }} {{ 'SECONDS' | translate }}
          </div>
          
          <div class="reset-actions">
            <ion-button expand="block" type="submit" [disabled]="resetForm.invalid || isSubmitting" class="ion-margin-top">
              <ion-spinner *ngIf="isSubmitting" name="circles" class="submit-spinner"></ion-spinner>
              <span *ngIf="!isSubmitting">{{ 'RESET_PASSWORD' | translate }}</span>
            </ion-button>
            
            <ion-button expand="block" fill="outline" [disabled]="resendCountdown > 0 || isSubmitting" (click)="resendVerificationCode()" class="ion-margin-top">
              <ion-spinner *ngIf="isResending" name="circles" class="submit-spinner"></ion-spinner>
              <span *ngIf="!isResending">{{ 'RESEND_CODE' | translate }}</span>
            </ion-button>
            
            <ion-button expand="block" fill="clear" (click)="goBackToStep1()" class="ion-margin-top">
              {{ 'BACK' | translate }}
            </ion-button>
          </div>
        </form>
      </div>
    </ion-content>
  `,
  styles: `
    .progress-container {
      margin-bottom: 24px;
      
      .step-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        
        .step-label {
          font-size: 12px;
          color: var(--ion-color-medium);
          
          &.active {
            color: var(--ion-color-primary);
            font-weight: 500;
          }
        }
      }
    }
    
    .form-title {
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 20px;
      color: var(--ion-color-dark);
      text-align: center;
    }
    
    .reset-info, .verification-info {
      display: flex;
      align-items: center;
      background-color: rgba(var(--ion-color-primary-rgb), 0.1);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      
      ion-icon {
        font-size: 32px;
        color: var(--ion-color-primary);
        margin-right: 16px;
      }
      
      p {
        font-size: 14px;
        color: var(--ion-color-dark);
        margin: 0;
      }
    }
    
    .custom-input {
      margin-bottom: 4px;
      --border-color: var(--ion-color-medium);
      --border-radius: 8px;
      --background: var(--ion-color-light);
      --padding-start: 12px;
      
      &.ion-valid {
        --border-color: var(--ion-color-success);
        --border-width: 2px;
      }
      
      &.ion-invalid {
        --border-color: var(--ion-color-danger);
        --border-width: 2px;
      }
    }
    
    .error-message {
      color: var(--ion-color-danger);
      font-size: 12px;
      margin: 0 0 16px 16px;
    }
    
    .verification-code-item {
      --padding-start: 16px;
      
      ion-input {
        --text-align: center;
        font-size: 20px;
        letter-spacing: 4px;
      }
    }
    
    .password-strength {
      margin: 0 0 16px 16px;
      
      .strength-meter {
        height: 4px;
        background-color: var(--ion-color-light-shade);
        border-radius: 2px;
        margin-bottom: 4px;
        
        .strength-bar {
          height: 100%;
          border-radius: 2px;
          
          &.weak {
            width: 25%;
            background-color: var(--ion-color-danger);
          }
          
          &.medium {
            width: 50%;
            background-color: var(--ion-color-warning);
          }
          
          &.strong {
            width: 75%;
            background-color: var(--ion-color-success-shade);
          }
          
          &.very-strong {
            width: 100%;
            background-color: var(--ion-color-success);
          }
        }
      }
      
      .strength-text {
        font-size: 12px;
        
        &.weak {
          color: var(--ion-color-danger);
        }
        
        &.medium {
          color: var(--ion-color-warning);
        }
        
        &.strong, &.very-strong {
          color: var(--ion-color-success);
        }
      }
    }
    
    .code-timer {
      text-align: center;
      color: var(--ion-color-medium);
      font-size: 14px;
      margin: 16px 0;
    }
    
    .reset-actions {
      margin-top: 24px;
    }
    
    .submit-spinner {
      margin-right: 8px;
    }
  `
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  resetStep = 1;
  emailForm!: FormGroup;
  resetForm!: FormGroup;
  
  isSubmitting = false;
  isResending = false;
  pendingResetId: string | null = null;
  
  resendCountdown = 0;
  countdownInterval: any;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    // Create the email form
    this.emailForm = this.formBuilder.group({
      email: ['', [
        Validators.required, 
        Validators.email
      ]]
    });
    
    // Create the reset form
    this.resetForm = this.formBuilder.group({
      verificationCode: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{6}')
      ]],
      newPassword: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d\\W_]{8,}')
      ]],
      confirmPassword: ['', [
        Validators.required
      ]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Watch for password changes to update strength
    this.resetForm.get('newPassword')?.valueChanges.subscribe(
      (password) => this.checkPasswordStrength(password)
    );
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  /**
   * Custom validator to check if passwords match
   */
  passwordMatchValidator(formGroup: FormGroup): ValidationErrors | null {
    const password = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      return null;
    }
  }

  /**
   * Password strength calculation
   */
  get passwordStrengthClass(): string {
    const password = this.resetForm.get('newPassword')?.value;
    if (!password) return '';
    
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[^\w\d\s]/.test(password);
    const length = password.length;
    
    const score = [hasLowerCase, hasUpperCase, hasDigit, hasSpecial]
      .filter(Boolean).length + (length >= 10 ? 1 : 0);
      
    if (score <= 1) return 'weak';
    if (score === 2) return 'medium';
    if (score === 3) return 'strong';
    return 'very-strong';
  }
  
  get passwordStrengthText(): string {
    const strengthClass = this.passwordStrengthClass;
    switch(strengthClass) {
      case 'weak': return 'PASSWORD_STRENGTH_WEAK';
      case 'medium': return 'PASSWORD_STRENGTH_MEDIUM';
      case 'strong': return 'PASSWORD_STRENGTH_STRONG';
      case 'very-strong': return 'PASSWORD_STRENGTH_VERY_STRONG';
      default: return '';
    }
  }
  
  /**
   * Check password strength
   */
  checkPasswordStrength(password: string) {
    // Logic is handled by getters
  }

  /**
   * Email form validation
   */
  isEmailInvalid(): boolean {
    const emailControl = this.emailForm.get('email');
    return !!emailControl && emailControl.invalid && emailControl.touched;
  }
  
  /**
   * Reset form validation
   */
  isFieldInvalid(fieldName: string): boolean {
    const control = this.resetForm.get(fieldName);
    return !!control && control.invalid && control.touched;
  }

  /**
   * Request verification code (Step 1)
   */
  requestVerificationCode() {
    if (this.emailForm.invalid || this.isSubmitting) {
      return;
    }
    
    this.isSubmitting = true;
    const email = this.emailForm.get('email')?.value;
    
    this.authService.initiatePasswordReset(email).subscribe({
      next: (resetId) => {
        this.isSubmitting = false;
        this.pendingResetId = resetId;
        this.resetStep = 2;
        
        // Start resend cooldown
        this.startResendCooldown();
        
        this.presentToast('Verification code sent to your email', 'success');
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error requesting password reset:', error);
        
        if (error.message?.includes('not found')) {
          this.presentAlert('Email Not Found', 'We couldn\'t find an account with that email address.');
        } else {
          this.presentAlert('Reset Error', error.message || 'Failed to send verification code. Please try again.');
        }
      }
    });
  }
  
  /**
   * Resend verification code
   */
  resendVerificationCode() {
    if (this.isResending) {
      return;
    }
    
    this.isResending = true;
    const email = this.emailForm.get('email')?.value;
    
    this.authService.initiatePasswordReset(email).subscribe({
      next: (resetId) => {
        this.isResending = false;
        this.pendingResetId = resetId;
        
        // Reset verification code field
        this.resetForm.get('verificationCode')?.reset();
        
        // Start resend cooldown
        this.startResendCooldown();
        
        this.presentToast('New verification code sent to your email', 'success');
      },
      error: (error) => {
        this.isResending = false;
        console.error('Error resending verification code:', error);
        this.presentToast('Failed to resend code. Please try again.', 'danger');
      }
    });
  }
  
  /**
   * Start cooldown for resend button
   */
  startResendCooldown() {
    this.resendCountdown = 60; // 60 seconds cooldown
    
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    
    this.countdownInterval = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }
  
  /**
   * Reset password with verification code (Step 2)
   */
  resetPassword() {
    if (this.resetForm.invalid || !this.pendingResetId || this.isSubmitting) {
      return;
    }
    
    this.isSubmitting = true;
    
    const email = this.emailForm.get('email')?.value;
    const verificationCode = this.resetForm.get('verificationCode')?.value;
    const newPassword = this.resetForm.get('newPassword')?.value;
    
    this.authService.completePasswordReset(
      this.pendingResetId,
      email,
      newPassword,
      verificationCode
    ).subscribe({
      next: (success) => {
        this.isSubmitting = false;
        
        if (success) {
          this.presentToast('Password reset successful! You can now log in with your new password.', 'success');
          this.router.navigate(['/login']);
        } else {
          this.presentAlert('Reset Error', 'Failed to reset password. Please try again.');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Password reset error:', error);
        
        if (error.message?.includes('Invalid verification code')) {
          this.resetForm.get('verificationCode')?.setErrors({ invalidCode: true });
          this.resetForm.get('verificationCode')?.markAsTouched();
        } else if (error.message?.includes('expired')) {
          this.presentAlert('Code Expired', 'Your verification code has expired. Please request a new one.');
        } else {
          this.presentAlert('Reset Error', error.message || 'An error occurred during password reset. Please try again.');
        }
      }
    });
  }
  
  /**
   * Go back to step 1
   */
  goBackToStep1() {
    this.resetStep = 1;
    this.resetForm.reset();
    
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.resendCountdown = 0;
    }
  }
  
  /**
   * Toast message
   */
  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    
    await toast.present();
  }
  
  /**
   * Alert message
   */
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }
}