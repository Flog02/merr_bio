import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
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
  IonInput, IonAvatar, IonIcon, IonSpinner
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular/standalone';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    IonRadio, IonRadioGroup, IonListHeader, IonBackButton, IonItem, IonLabel,
    IonHeader, IonTitle, IonInput, IonButton, IonButtons, IonContent, IonToolbar,
    IonAvatar, IonIcon, IonSpinner, CommonModule, ReactiveFormsModule, TranslatePipe
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
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
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

        <!-- Email field with error message -->
        <ion-item [class.ion-invalid]="isEmailInvalid()">
          <ion-label position="floating">{{ 'EMAIL' | translate }}</ion-label>
          <ion-input #emailInput type="email" formControlName="email"></ion-input>
        </ion-item>
        <div class="error-message" *ngIf="isEmailInvalid()">
          {{ 'EMAIL_INVALID' | translate }}
        </div>

        <!-- Password field with error message -->
        <ion-item [class.ion-invalid]="isPasswordTooShort()">
          <ion-label position="floating">{{ 'PASSWORD' | translate }}</ion-label>
          <ion-input #passwordInput type="password" formControlName="password"></ion-input>
        </ion-item>
        <div class="error-message" *ngIf="isPasswordTooShort()">
          {{ 'PASSWORD_MIN_LENGTH' | translate }}
        </div>

        <!-- Other fields remain unchanged -->
        <ion-item>
          <ion-label position="floating">{{ 'NAME' | translate }}</ion-label>
          <ion-input type="text" formControlName="displayName"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">{{ 'PHONE' | translate }}</ion-label>
          <ion-input type="tel" formControlName="phoneNumber"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">{{ 'LOCATION' | translate }}</ion-label>
          <ion-input type="text" formControlName="location"></ion-input>
        </ion-item>

        <ion-radio-group formControlName="role">
          <ion-list-header>
            <ion-label>{{ 'ROLE' | translate }}</ion-label>
          </ion-list-header>

          <ion-item>
            <ion-label>{{ 'CUSTOMER' | translate }}</ion-label>
            <ion-radio slot="start" value="customer"></ion-radio>
          </ion-item>

          <ion-item>
            <ion-label>{{ 'FARMER' | translate }}</ion-label>
            <ion-radio slot="start" value="farmer"></ion-radio>
          </ion-item>
        </ion-radio-group>

        <ion-button expand="block" type="submit" [disabled]="!registerForm.valid || isUploading" class="ion-margin-top">
          <ion-spinner *ngIf="isSubmitting" name="circles" class="submit-spinner"></ion-spinner>
          <span *ngIf="!isSubmitting">{{ 'REGISTER' | translate }}</span>
        </ion-button>
      </form>

      <div class="ion-text-center ion-padding-top">
        <p>{{ 'ALREADY_HAVE_ACCOUNT' | translate }} <a href="/login">{{ 'LOGIN' | translate }}</a></p>
      </div>
    </ion-content>
  `,
  styles: `
    .profile-image-upload {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 20px;
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
    
    .error-message {
      color: var(--ion-color-danger);
      font-size: 12px;
      margin: 5px 0 15px 16px;
    }

    ion-item.ion-invalid {
      --highlight-color: var(--ion-color-danger);
    }
    
    .submit-spinner {
      margin-right: 8px;
    }
  `
})
export class RegisterPage {
  @ViewChild('emailInput') emailInput!: IonInput;
  @ViewChild('passwordInput') passwordInput!: IonInput;
  @ViewChild('profileImageInput') profileImageInput!: ElementRef<HTMLInputElement>;
  
  registerForm: FormGroup;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  isUploading: boolean = false;
  isSubmitting: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private authService: AuthService,
    private userService: UserService,
    private fileUploadService: FileUploadService,
    private router: Router,
    private toastController: ToastController
  ) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      displayName: ['', [Validators.required]],
      phoneNumber: [''],
      location: [''],
      role: ['customer', [Validators.required]]
    });
  }

  get errorControl() {
    return this.registerForm.controls;
  }

  // Profile image selection
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
  
  // Image validation
  private isValidImageFile(file: File): boolean {
    // Check file type
    const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!acceptedImageTypes.includes(file.type)) {
      this.presentToast('Invalid file type. Please select an image (JPEG, PNG, GIF, WEBP).', 'danger');
      return false;
    }
    
    // Check file size (limit to 2MB)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      this.presentToast('Image too large. Please select an image smaller than 5MB.', 'danger');
      return false;
    }
    
    return true;
  }

  // Simple methods to check specific validation errors
  isEmailInvalid(): boolean {
    const control = this.registerForm.get('email');
    return control?.touched && (control?.hasError('required') || control?.hasError('email')) || false;
  }

  isPasswordTooShort(): boolean {
    const control = this.registerForm.get('password');
    return control?.touched && control?.hasError('minlength') || false;
  }

  // Focus the first invalid input
  focusFirstInvalidControl() {
    if (this.isEmailInvalid() && this.emailInput) {
      this.emailInput.setFocus();
      return;
    }
    
    if (this.isPasswordTooShort() && this.passwordInput) {
      this.passwordInput.setFocus();
      return;
    }
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      // Mark all fields as touched to trigger validation error messages
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      
      // Focus the first invalid input
      setTimeout(() => this.focusFirstInvalidControl(), 100);
      
      // Show a toast with an error message
      this.presentToast('Please fix the form errors before submitting', 'danger');
      return;
    }

    this.isSubmitting = true;
    const { email, password, displayName, phoneNumber, location, role } = this.registerForm.value;

    try {
      // First register the user (creates auth account)
      const userCredential = await this.authService.register(email, password, role, displayName, phoneNumber, location);
      
      // If there's a profile image selected, upload it
      if (this.selectedImage && userCredential.user) {
        this.isUploading = true;
        
        // Upload the image and update the user profile
        this.fileUploadService.uploadProfileImage(this.selectedImage, userCredential.user.uid)
          .pipe(
            finalize(() => {
              this.isUploading = false;
              this.isSubmitting = false;
            })
          )
          .subscribe({
            next: (downloadUrl) => {
              // Update the user profile with the image URL
              this.userService.updateUser(userCredential.user.uid, {
                profileImage: downloadUrl
              }).subscribe({
                next: () => {
                  this.presentToast('Registration successful with profile image', 'success');
                  this.router.navigate(['/']);
                },
                error: (error) => {
                  console.error('Error updating profile with image:', error);
                  // Still navigate home as the account was created
                  this.router.navigate(['/']);
                }
              });
            },
            error: (error) => {
              console.error('Error uploading profile image:', error);
              // Still navigate home as the account was created
              this.presentToast('Registration successful but image upload failed', 'warning');
              this.router.navigate(['/']);
            }
          });
      } else {
        // No image to upload, just complete registration
        this.isSubmitting = false;
        this.presentToast('Registration successful', 'success');
        this.router.navigate(['/']);
      }
    } catch (error: any) {
      this.isSubmitting = false;
      console.error('Registration error', error);
      
      // Check for specific Firebase error codes
      if (error.code === 'auth/email-already-in-use') {
        this.presentAlert('Email Already Exists', 'This email address is already registered. Please try a different one.');
      } else {
        // Generic error handling for other errors
        this.presentAlert('Registration Error', error.message || 'An error occurred during registration. Please try again.');
      }
    }
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    
    await toast.present();
  }
  
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