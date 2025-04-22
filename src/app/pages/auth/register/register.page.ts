import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { FileUploadService } from '../../../services/file-upload.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import {
  IonRadio, IonRadioGroup, IonListHeader, IonBackButton, IonItem, IonLabel,
  IonHeader, IonTitle, IonButton, IonButtons, IonContent, IonToolbar,
  IonInput, IonAvatar, IonIcon, IonSpinner, IonProgressBar, IonText
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular/standalone';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    IonRadio, IonRadioGroup, IonListHeader, IonBackButton, IonItem, IonLabel,
    IonHeader, IonTitle, IonInput, IonButton, IonButtons, IonContent, IonToolbar,
    IonAvatar, IonIcon, IonSpinner, IonProgressBar, IonText,
    CommonModule, ReactiveFormsModule, TranslatePipe
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ 'REGISTER' | translate }}</ion-title>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/"></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Progress bar for registration steps -->
      <div class="progress-container">
        <ion-progress-bar [value]="registrationStep / 2"></ion-progress-bar>
        <div class="step-labels">
          <div class="step-label" [class.active]="registrationStep >= 1">{{ 'STEP_1' | translate }}</div>
          <div class="step-label" [class.active]="registrationStep >= 2">{{ 'STEP_2' | translate }}</div>
        </div>
      </div>

      <!-- Step 1: Initial Information Form -->
      <div *ngIf="registrationStep === 1">
        <h2 class="form-title">{{ 'PERSONAL_INFO' | translate }}</h2>
        
        <form [formGroup]="registrationForm" (ngSubmit)="requestVerificationCode()">
          <!-- Profile Image Upload -->
          <div class="profile-image-upload">
            <div class="avatar-container" (click)="profileImageInput.click()">
              <div class="avatar">
                <img *ngIf="imagePreview" [src]="imagePreview" alt="Profile Preview">
                <ion-icon *ngIf="!imagePreview" name="person"></ion-icon>
                <div class="avatar-edit-overlay">
                  <ion-icon name="camera"></ion-icon>
                </div>
              </div>
              <div *ngIf="isUploading" class="upload-progress">
                <ion-spinner name="circles"></ion-spinner>
              </div>
            </div>
            
            <!-- Hidden file input -->
            <input
              type="file"
              #profileImageInput
              style="display: none"
              accept="image/*"
              (change)="onProfileImageSelected($event)"
            >
            
            <p class="upload-hint">{{ 'PROFILE_IMAGE_HINT' | translate }}</p>
          </div>

          <!-- Email field with enhanced validation -->
          <ion-item class="custom-input" [class.ion-valid]="isFieldValid('email')" [class.ion-invalid]="isFieldInvalid('email')">
            <ion-label position="floating">{{ 'EMAIL' | translate }} *</ion-label>
            <ion-input #emailInput type="email" formControlName="email" inputmode="email"></ion-input>
            <ion-icon class="validation-icon" *ngIf="isFieldValid('email')" name="checkmark-circle" slot="end" color="success"></ion-icon>
            <ion-icon class="validation-icon" *ngIf="isFieldInvalid('email')" name="alert-circle" slot="end" color="danger"></ion-icon>
          </ion-item>
          <div class="error-message" *ngIf="isFieldInvalid('email')">
            <span *ngIf="errorControl['email'].errors?.['required']">{{ 'EMAIL_REQUIRED' | translate }}</span>
            <span *ngIf="errorControl['email'].errors?.['email']">{{ 'EMAIL_INVALID' | translate }}</span>
            <span *ngIf="errorControl['email'].errors?.['pattern']">{{ 'EMAIL_INVALID_FORMAT' | translate }}</span>
          </div>

          <!-- Password field with enhanced validation -->
          <ion-item class="custom-input" [class.ion-valid]="isFieldValid('password')" [class.ion-invalid]="isFieldInvalid('password')">
            <ion-label position="floating">{{ 'PASSWORD' | translate }} *</ion-label>
            <ion-input #passwordInput type="password" formControlName="password"></ion-input>
            <ion-icon class="validation-icon" *ngIf="isFieldValid('password')" name="checkmark-circle" slot="end" color="success"></ion-icon>
            <ion-icon class="validation-icon" *ngIf="isFieldInvalid('password')" name="alert-circle" slot="end" color="danger"></ion-icon>
          </ion-item>
          <div class="error-message" *ngIf="isFieldInvalid('password')">
            <span *ngIf="errorControl['password'].errors?.['required']">{{ 'PASSWORD_REQUIRED' | translate }}</span>
            <span *ngIf="errorControl['password'].errors?.['minlength']">{{ 'PASSWORD_MIN_LENGTH' | translate }}</span>
            <span *ngIf="errorControl['password'].errors?.['pattern']">{{ 'PASSWORD_PATTERN' | translate }}</span>
          </div>
          
          <!-- Password strength meter -->
          <div class="password-strength" *ngIf="registrationForm.get('password')?.value">
            <div class="strength-meter">
              <div class="strength-bar" [ngClass]="passwordStrengthClass"></div>
            </div>
            <div class="strength-text" [ngClass]="passwordStrengthClass">
              {{ passwordStrengthText | translate }}
            </div>
          </div>

          <!-- Display name field -->
          <ion-item class="custom-input" [class.ion-valid]="isFieldValid('displayName')" [class.ion-invalid]="isFieldInvalid('displayName')">
            <ion-label position="floating">{{ 'NAME' | translate }} *</ion-label>
            <ion-input type="text" formControlName="displayName"></ion-input>
            <ion-icon class="validation-icon" *ngIf="isFieldValid('displayName')" name="checkmark-circle" slot="end" color="success"></ion-icon>
            <ion-icon class="validation-icon" *ngIf="isFieldInvalid('displayName')" name="alert-circle" slot="end" color="danger"></ion-icon>
          </ion-item>
          <div class="error-message" *ngIf="isFieldInvalid('displayName')">
            <span *ngIf="errorControl['displayName'].errors?.['required']">{{ 'NAME_REQUIRED' | translate }}</span>
            <span *ngIf="errorControl['displayName'].errors?.['minlength']">{{ 'NAME_MIN_LENGTH' | translate }}</span>
          </div>

          <!-- Phone number field with country code -->
          <ion-item class="custom-input" [class.ion-valid]="isFieldValid('phoneNumber')" [class.ion-invalid]="isFieldInvalid('phoneNumber')">
            <ion-label position="floating">{{ 'PHONE' | translate }}</ion-label>
            <div class="phone-input-container">
              <div class="country-code">+355</div>
              <ion-input type="tel" formControlName="phoneNumber" inputmode="tel" maxlength="10" placeholder="69 XXX XXXX"></ion-input>
            </div>
            <ion-icon class="validation-icon" *ngIf="isFieldValid('phoneNumber')" name="checkmark-circle" slot="end" color="success"></ion-icon>
            <ion-icon class="validation-icon" *ngIf="isFieldInvalid('phoneNumber')" name="alert-circle" slot="end" color="danger"></ion-icon>
          </ion-item>
          <div class="error-message" *ngIf="isFieldInvalid('phoneNumber')">
            <span *ngIf="errorControl['phoneNumber'].errors?.['pattern']">{{ 'PHONE_INVALID' | translate }}</span>
          </div>

          <!-- Location field -->
          <ion-item class="custom-input" [class.ion-valid]="isFieldValid('location')" [class.ion-invalid]="isFieldInvalid('location')">
            <ion-label position="floating">{{ 'LOCATION' | translate }}</ion-label>
            <ion-input type="text" formControlName="location"></ion-input>
            <ion-icon class="validation-icon" *ngIf="isFieldValid('location')" name="checkmark-circle" slot="end" color="success"></ion-icon>
          </ion-item>

          <!-- Role selection -->
          <ion-radio-group formControlName="role" class="role-group">
            <ion-list-header>
              <ion-label>{{ 'ROLE' | translate }} *</ion-label>
            </ion-list-header>

            <div class="role-options">
              <ion-item lines="none" class="role-item">
                <ion-label>{{ 'CUSTOMER' | translate }}</ion-label>
                <ion-radio slot="start" value="customer"></ion-radio>
              </ion-item>

              <ion-item lines="none" class="role-item">
                <ion-label>{{ 'FARMER' | translate }}</ion-label>
                <ion-radio slot="start" value="farmer"></ion-radio>
              </ion-item>
            </div>
          </ion-radio-group>

          <!-- Security notice -->
          <div class="security-notice">
            <ion-icon name="shield-checkmark"></ion-icon>
            <p>{{ 'VERIFICATION_NOTICE' | translate }}</p>
          </div>

          <ion-button expand="block" type="submit" [disabled]="!registrationForm.valid || isSubmitting" class="ion-margin-top">
            <ion-spinner *ngIf="isSubmitting" name="circles" class="submit-spinner"></ion-spinner>
            <span *ngIf="!isSubmitting">{{ 'CONTINUE' | translate }}</span>
          </ion-button>
        </form>
      </div>

      <!-- Step 2: Verification Code Form -->
      <div *ngIf="registrationStep === 2">
        <h2 class="form-title">{{ 'VERIFY_EMAIL' | translate }}</h2>
        
        <div class="verification-info">
          <ion-icon name="mail"></ion-icon>
          <p>{{ 'VERIFICATION_CODE_SENT' | translate }} <strong>{{ registrationForm.get('email')?.value }}</strong></p>
        </div>
        
        <form [formGroup]="verificationForm" (ngSubmit)="completeRegistration()">
          <!-- Verification code input -->
          <ion-item class="custom-input verification-code-item" [class.ion-invalid]="isVerificationCodeInvalid()">
            <ion-label position="floating">{{ 'VERIFICATION_CODE' | translate }} *</ion-label>
            <ion-input type="text" formControlName="verificationCode" inputmode="numeric" maxlength="6"></ion-input>
          </ion-item>
          <div class="error-message" *ngIf="isVerificationCodeInvalid()">
            <span *ngIf="verificationForm.get('verificationCode')?.errors?.['required']">{{ 'CODE_REQUIRED' | translate }}</span>
            <span *ngIf="verificationForm.get('verificationCode')?.errors?.['pattern']">{{ 'CODE_INVALID' | translate }}</span>
            <span *ngIf="verificationForm.get('verificationCode')?.errors?.['invalidCode']">{{ 'CODE_INCORRECT' | translate }}</span>
          </div>
          
          <div class="code-timer" *ngIf="resendCountdown > 0">
            {{ 'RESEND_CODE_IN' | translate }} {{ resendCountdown }} {{ 'SECONDS' | translate }}
          </div>
          
          <div class="verification-actions">
            <ion-button expand="block" type="submit" [disabled]="!verificationForm.valid || isSubmitting" class="ion-margin-top">
              <ion-spinner *ngIf="isSubmitting" name="circles" class="submit-spinner"></ion-spinner>
              <span *ngIf="!isSubmitting">{{ 'COMPLETE_REGISTRATION' | translate }}</span>
            </ion-button>
            
            <ion-button expand="block" fill="outline" [disabled]="resendCountdown > 0 || isSubmitting" (click)="resendVerificationCode()" class="ion-margin-top">
              <ion-spinner *ngIf="isResending" name="circles" class="submit-spinner"></ion-spinner>
              <span *ngIf="!isResending">{{ 'RESEND_CODE' | translate }}</span>
            </ion-button>
            
            <ion-button expand="block" fill="clear" (click)="goBackToStep1()" class="ion-margin-top">
              {{ 'BACK_TO_FORM' | translate }}
            </ion-button>
          </div>
        </form>
      </div>

      <div class="ion-text-center ion-padding-top">
        <p>{{ 'ALREADY_HAVE_ACCOUNT' | translate }} <a href="/login">{{ 'LOGIN' | translate }}</a></p>
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
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      color: var(--ion-color-dark);
      text-align: center;
    }
    
    .profile-image-upload {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .avatar-container {
      position: relative;
      width: 120px;
      height: 120px;
      margin-bottom: 10px;
      cursor: pointer;
    }
    
    .avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
      background-color: var(--ion-color-light);
      border: 2px solid var(--ion-color-primary);
      position: relative;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      ion-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 64px;
        color: var(--ion-color-medium);
      }
    }
    
    .avatar-edit-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40%;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
      
      ion-icon {
        font-size: 24px;
        color: white;
      }
    }
    
    .avatar-container:hover .avatar-edit-overlay {
      opacity: 1;
    }
    
    .upload-progress {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      
      ion-spinner {
        color: white;
      }
    }
    
    .upload-hint {
      font-size: 12px;
      color: var(--ion-color-medium);
      text-align: center;
      margin-top: 5px;
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
    
    .validation-icon {
      font-size: 20px;
      margin-right: 8px;
    }
    
    .error-message {
      color: var(--ion-color-danger);
      font-size: 12px;
      margin: 0 0 16px 16px;
    }
    
    .phone-input-container {
      display: flex;
      align-items: center;
      width: 100%;
      
      .country-code {
        flex-shrink: 0;
        margin-right: 8px;
        padding: 0 8px;
        background-color: var(--ion-color-light-shade);
        border-radius: 4px;
        height: 32px;
        line-height: 32px;
        font-size: 14px;
      }
      
      ion-input {
        flex-grow: 1;
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
    
    .role-group {
      margin-bottom: 16px;
      
      ion-list-header {
        padding-left: 0;
        min-height: auto;
      }
    }
    
    .role-options {
      display: flex;
      gap: 16px;
      
      .role-item {
        flex: 1;
        --background: var(--ion-color-light);
        border-radius: 8px;
        margin: 8px 0 16px;
        
        ion-radio {
          margin-right: 8px;
        }
      }
    }
    
    .security-notice {
      display: flex;
      align-items: center;
      background-color: rgba(var(--ion-color-success-rgb), 0.1);
      padding: 12px;
      border-radius: 8px;
      margin: 16px 0;
      
      ion-icon {
        font-size: 24px;
        color: var(--ion-color-success);
        margin-right: 12px;
      }
      
      p {
        font-size: 14px;
        color: var(--ion-color-dark);
        margin: 0;
      }
    }
    
    .submit-spinner {
      margin-right: 8px;
    }
    
    .verification-info {
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
    
    .verification-code-item {
      --padding-start: 16px;
      
      ion-input {
        --text-align: center;
        font-size: 20px;
        letter-spacing: 4px;
      }
    }
    
    .code-timer {
      text-align: center;
      color: var(--ion-color-medium);
      font-size: 14px;
      margin: 16px 0;
    }
    
    .verification-actions {
      margin-top: 24px;
    }
  `
})
export class RegisterPage implements OnInit {
  @ViewChild('emailInput') emailInput!: IonInput;
  @ViewChild('passwordInput') passwordInput!: IonInput;
  @ViewChild('profileImageInput') profileImageInput!: ElementRef<HTMLInputElement>;
  
  registrationStep = 1;
  registrationForm!: FormGroup;
  verificationForm!: FormGroup;
  
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  isUploading: boolean = false;
  isSubmitting: boolean = false;
  isResending: boolean = false;
  pendingRegistrationId: string | null = null;
  
  resendCountdown = 0;
  countdownInterval: any;

  constructor(
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private authService: AuthService,
    private userService: UserService,
    private fileUploadService: FileUploadService,
    private router: Router,
    private toastController: ToastController
  ) {
    // Create the registration form
    this.registrationForm = this.formBuilder.group({
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d\\W_]{8,}$')

      ]],
      displayName: ['', [Validators.required, Validators.minLength(3)]],
      phoneNumber: ['', [Validators.pattern('^[6-9][0-9]{7,8}')]], // Albanian mobile format (69XXXXXXX)
      location: [''],
      role: ['customer', [Validators.required]]
    });
    
    // Create the verification form
    this.verificationForm = this.formBuilder.group({
      verificationCode: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{6}')
      ]]
    });
  }

  ngOnInit() {
    // Watch for password changes to update strength
    this.registrationForm.get('password')?.valueChanges.subscribe(
      (password) => this.checkPasswordStrength(password)
    );
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  get errorControl() {
    return this.registrationForm.controls;
  }

  /**
   * Password strength calculation
   */
  get passwordStrengthClass(): string {
    const password = this.registrationForm.get('password')?.value;
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
   * Check password strength and set feedback
   */
  checkPasswordStrength(password: string) {
    // Logic is handled by getters
  }

  /**
   * Field validation helpers
   */
  isFieldValid(field: string): boolean {
    const control = this.registrationForm.get(field);
    return control !== null && control.valid && control.touched;
  }
  
  isFieldInvalid(field: string): boolean {
    const control = this.registrationForm.get(field);
    return control !== null && control.invalid && control.touched;
  }
  
  isVerificationCodeInvalid(): boolean {
    const control = this.verificationForm.get('verificationCode');
    return control !== null && control.invalid && control.touched;
  }

  /**
   * Profile image selection
   */
  onProfileImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
      
      // Validate file
      if (!this.isValidImageFile(this.selectedImage)) {
        this.selectedImage = null;
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }
  
  /**
   * Image validation
   */
  private isValidImageFile(file: File): boolean {
    // Check file type
    const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!acceptedImageTypes.includes(file.type)) {
      this.presentToast('Invalid file type. Please select an image (JPEG, PNG, GIF, WEBP).', 'danger');
      return false;
    }
    
    // Check file size (limit to 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      this.presentToast('Image too large. Please select an image smaller than 5MB.', 'danger');
      return false;
    }
    
    return true;
  }

  /**
   * Request verification code (step 1)
   */
  requestVerificationCode() {
    if (this.registrationForm.invalid) {
      // Mark all fields as touched to trigger validation error messages
      Object.keys(this.registrationForm.controls).forEach(key => {
        const control = this.registrationForm.get(key);
        control?.markAsTouched();
      });
      
      this.presentToast('Please fix the form errors before continuing', 'danger');
      return;
    }

    this.isSubmitting = true;
    
    const userData = {
      ...this.registrationForm.value,
      // Format phone number with country code if provided
      phoneNumber: this.registrationForm.value.phoneNumber ? 
        `+355${this.registrationForm.value.phoneNumber}` : ''
    };
    
    // Request verification code from server
    this.authService.initiateRegistration(userData.email, userData)
      .subscribe({
        next: (registrationId) => {
          this.isSubmitting = false;
          this.pendingRegistrationId = registrationId;
          this.registrationStep = 2;
          
          // Start resend cooldown
          this.startResendCooldown();
          
          this.presentToast('Verification code sent to your email', 'success');
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error sending verification code:', error);
          
          if (error.message?.includes('already')) {
            this.presentAlert('Email Already in Use', 'This email address is already registered. Please try a different one.');
          } else {
            this.presentAlert('Verification Error', error.message || 'Failed to send verification code. Please try again.');
          }
        }
      });
  }
  
  /**
   * Resend verification code
   */
  resendVerificationCode() {
    if (!this.registrationForm.value.email || this.isResending) {
      return;
    }
    
    this.isResending = true;
    
    // Re-request verification code
    const userData = {
      ...this.registrationForm.value,
      phoneNumber: this.registrationForm.value.phoneNumber ? 
        `+355${this.registrationForm.value.phoneNumber}` : ''
    };
    
    this.authService.initiateRegistration(userData.email, userData)
      .subscribe({
        next: (registrationId) => {
          this.isResending = false;
          this.pendingRegistrationId = registrationId;
          
          // Reset the verification code field
          this.verificationForm.get('verificationCode')?.reset();
          
          // Start resend cooldown
          this.startResendCooldown();
          
          this.presentToast('New verification code sent to your email', 'success');
        },
        error: (error) => {
          this.isResending = false;
          console.error('Error resending verification code:', error);
          this.presentToast('Failed to resend verification code. Please try again.', 'danger');
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
   * Complete registration with verification code
   */
  completeRegistration() {
    if (this.verificationForm.invalid || !this.pendingRegistrationId) {
      return;
    }
    
    this.isSubmitting = true;
    
    const { email, password } = this.registrationForm.value;
    const { verificationCode } = this.verificationForm.value;
    
    this.authService.completeRegistration(
      this.pendingRegistrationId,
      email,
      password,
      verificationCode
    ).subscribe({
      next: (credential) => {
        // If there's a profile image, upload it
        if (this.selectedImage && credential.user) {
          this.isUploading = true;
          
          this.fileUploadService.uploadProfileImage(this.selectedImage, credential.user.uid)
            .pipe(
              finalize(() => {
                this.isUploading = false;
                this.isSubmitting = false;
              })
            )
            .subscribe({
              next: (downloadUrl) => {
                // Update the user profile with the image URL
                this.userService.updateUser(credential.user.uid, {
                  profileImage: downloadUrl
                }).subscribe({
                  next: () => {
                    this.presentToast('Registration successful!', 'success');
                    this.router.navigate(['/']);
                  },
                  error: (error) => {
                    console.error('Error updating profile with image:', error);
                    // Still navigate to home as the account was created
                    this.router.navigate(['/']);
                  }
                });
              },
              error: (error) => {
                console.error('Error uploading profile image:', error);
                // Still complete registration as the account was created
                this.presentToast('Registration successful but image upload failed', 'warning');
                this.router.navigate(['/']);
              }
            });
        } else {
          // No image to upload, just complete registration
          this.isSubmitting = false;
          this.presentToast('Registration successful!', 'success');
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Registration error:', error);
        
        if (error.message?.includes('Invalid verification code')) {
          // Add validation error to the verification code field
          this.verificationForm.get('verificationCode')?.setErrors({ invalidCode: true });
          this.verificationForm.get('verificationCode')?.markAsTouched();
        } else if (error.message?.includes('expired')) {
          this.presentAlert('Code Expired', 'Your verification code has expired. Please request a new one.');
        } else {
          this.presentAlert('Registration Error', error.message || 'An error occurred during registration. Please try again.');
        }
      }
    });
  }
  
  /**
   * Go back to step 1
   */
  goBackToStep1() {
    this.registrationStep = 1;
    this.verificationForm.reset();
    
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
      buttons: ['OK'],
      cssClass: 'registration-alert'
    });

    await alert.present();
  }
}