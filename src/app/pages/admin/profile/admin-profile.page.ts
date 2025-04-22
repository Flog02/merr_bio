import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonInput, IonNote, IonSpinner, IonMenuButton, IonItem, IonLabel,
  IonHeader, IonTitle, IonButton, IonButtons, IonContent, IonToolbar,
  IonIcon, IonAvatar, IonToast
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [
    FormsModule, IonInput, IonNote, IonSpinner, IonMenuButton, IonItem, IonLabel,
    IonHeader, IonTitle, IonButton, IonButtons, IonContent, IonToolbar, IonIcon,
    IonAvatar, IonToast, CommonModule, ReactiveFormsModule, TranslatePipe
  ],
    template: `<ion-header class="ion-no-border">
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-menu-button></ion-menu-button>
    </ion-buttons>
    <ion-title>{{ 'MY_PROFILE' | translate }}</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <div *ngIf="currentUser" class="fade-in">
    <div class="profile-header">
    <div class="avatar-container">
          <div class="avatar" (click)="profileImageInput.click()">
            <img *ngIf="currentUser.profileImage" [src]="currentUser.profileImage" alt="{{ currentUser.displayName }}">
            <ion-icon *ngIf="!currentUser.profileImage" name="person" class="avatar-placeholder"></ion-icon>
            <div class="avatar-edit-overlay">
              <ion-icon name="camera"></ion-icon>
            </div>
          </div>
          <!-- Hidden file input for profile image -->
          <input 
            type="file" 
            #profileImageInput 
            style="display: none" 
            accept="image/*" 
            (change)="onProfileImageSelected($event)"
          >
          <div *ngIf="isUploading" class="upload-progress">
            <ion-spinner name="circles"></ion-spinner>
            <span>{{ 'UPLOADING' | translate }}</span>
          </div>
        </div>
      <h1>{{ currentUser.displayName || 'Customer' }}</h1>
      <p>{{ currentUser.email }}</p>
    </div>
    
    <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
      <ion-item>
        <ion-label position="floating">{{ 'NAME' | translate }}</ion-label>
        <ion-input formControlName="displayName"></ion-input>
        <ion-note slot="error" *ngIf="profileForm.get('displayName')?.touched && profileForm.get('displayName')?.errors?.['required']">
          {{ 'NAME_REQUIRED' | translate }}
        </ion-note>
      </ion-item>
      
      <ion-item>
        <ion-label position="floating">{{ 'EMAIL' | translate }}</ion-label>
        <ion-input formControlName="email" readonly></ion-input>
      </ion-item>
      
      <ion-item>
        <ion-label position="floating">{{ 'PHONE' | translate }}</ion-label>
        <ion-input type="tel" formControlName="phoneNumber"></ion-input>
      </ion-item>
      
      <ion-item>
        <ion-label position="floating">{{ 'LOCATION' | translate }}</ion-label>
        <ion-input formControlName="location"></ion-input>
      </ion-item>
      
      <ion-button expand="block" type="submit" [disabled]="!profileForm.valid || !profileForm.dirty || isUploading">
          {{ 'SAVE' | translate }}
        </ion-button>

        <ion-button 
          *ngIf="currentUser.profileImage" 
          expand="block" 
          fill="outline" 
          color="danger" 
          class="remove-photo-btn"
          [disabled]="isUploading"
          (click)="removeProfileImage()"
        >
          <ion-icon name="trash-outline" slot="start"></ion-icon>
          {{ 'REMOVE_PHOTO' | translate }}
        </ion-button>
    </form>
  </div>
  
  <div *ngIf="!currentUser" class="loading-container fade-in">
    <ion-spinner></ion-spinner>
    <p>{{ 'LOADING' | translate }}</p>
  </div>
   <!-- Toast for notifications -->
   <ion-toast
      [isOpen]="showToast"
      [message]="toastMessage"
      [color]="toastColor"
      [duration]="3000"
      (didDismiss)="showToast = false"
      position="bottom"
    ></ion-toast>
</ion-content>`,
  styles:`

  ion-header {
    ion-toolbar {
      --background: var(--ion-color-primary);
      --color: white;
      
      ion-title {
        font-family: 'Playfair Display', serif;
        font-weight: 600;
      }
      
      ion-menu-button {
        --color: white;
      }
    }
  }
  
  .profile-header {
    background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-primary-shade));
    color: white;
    border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
    text-align: center;
    position: relative;
    
    /* Decorative elements */
    &::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 30px;
      background: white;
      border-radius: 50%;
      box-shadow: var(--box-shadow-light);
    }
    
    .avatar-container {
      position: relative;
      width: 120px;
      height: 120px;
      margin: 0 auto var(--spacing-md);
    }
    .avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid rgba(255, 255, 255, 0.3);
      background-color: rgba(255, 255, 255, 0.1);
      position: relative;
      cursor: pointer;
      transition: all 0.3s ease;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .avatar-placeholder {
        font-size: 64px;
        color: rgba(255, 255, 255, 0.8);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      
      &:hover {
        border-color: rgba(255, 255, 255, 0.6);
        
        .avatar-edit-overlay {
          opacity: 1;
        }
      }
      
      ion-icon {
        font-size: 64px;
        color: rgba(255, 255, 255, 0.8);
      }
    }
    .avatar-edit-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: rgba(0, 0, 0, 0.5);
      height: 40%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      
      ion-icon {
        font-size: 24px;
        color: white;
      }
    }
    
    .upload-progress {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      color: white;
      
      ion-spinner {
        margin-bottom: 8px;
        color: white;
      }
      
      span {
        font-size: 0.8rem;
      }
    }
    
    h1 {
      margin: 0 0 var(--spacing-xs);
      font-size: 1.6rem;
      font-weight: 600;
      font-family: 'Playfair Display', serif;
    }
    
    p {
      margin: 0;
      opacity: 0.9;
      font-family: 'Poppins', sans-serif;
      font-size: 0.95rem;
    }
  }
  
  .profile-form {
    padding: 0 var(--spacing-md) var(--spacing-xl);
    
    ion-item {
      --background: white;
      --border-radius: var(--border-radius-md);
      --border-color: transparent;
      --highlight-color-focused: var(--ion-color-primary);
      margin-bottom: var(--spacing-md);
      box-shadow: var(--box-shadow-light);
      transition: var(--transition);
      
      &:hover, &:focus-within {
        box-shadow: var(--box-shadow-medium);
        --background: rgba(var(--ion-color-light-rgb), 0.5);
      }
      
      ion-label {
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
        --color: var(--ion-color-dark);
        
        &.label-floating {
          color: var(--ion-color-medium);
        }
      }
      
      ion-input {
        --padding-start: var(--spacing-xs);
        font-family: 'Poppins', sans-serif;
        --color: var(--ion-color-dark);
        
        &:disabled, &[readonly] {
          opacity: 0.7;
        }
      }
    }
    
    ion-note {
      color: var(--ion-color-danger);
      font-size: 0.8rem;
      font-family: 'Poppins', sans-serif;
      margin-left: var(--spacing-sm);
    }
    
    ion-button {
      margin-top: var(--spacing-lg);
      --border-radius: var(--border-radius-md);
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      height: 48px;
      letter-spacing: 0.5px;
      
      
      
      &:hover:not(:disabled)::before {
        opacity: 1;
      }
      
      &:disabled {
        --background: rgba(var(--ion-color-medium-rgb), 0.3);
        --color: rgba(var(--ion-color-medium-rgb), 0.7);
      }
    }
    .remove-photo-btn {
      margin-top: var(--spacing-md);
    }
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 50vh;
    
    ion-spinner {
      width: 48px;
      height: 48px;
      margin-bottom: var(--spacing-md);
      color: var(--ion-color-primary);
    }
    
    p {
      color: var(--ion-color-medium);
      font-family: 'Poppins', sans-serif;
    }
  }
  
  /* Animations */
  .slide-up {
    animation: slideUp 0.5s ease-out;
  }
  
  .fade-in {
    animation: fadeIn 0.8s ease-in-out;
  }
  
  @keyframes slideUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  /* Animation delays for form items */
  @for $i from 1 through 5 {
    ion-item:nth-child(#{$i}) {
      animation: slideUp 0.5s ease-out;
      animation-delay: #{0.1 + ($i * 0.1)}s;
      animation-fill-mode: both;
    }
  }`
})
export class AdminProfilePage implements OnInit {
  @ViewChild('profileImageInput') profileImageInput!: ElementRef<HTMLInputElement>;

  profileForm!: FormGroup;
  currentUser: User | null = null;
  isUploading: boolean = false;
  selectedProfileImage: File | null = null;
  showToast: boolean = false;
  toastMessage: string = '';
  toastColor: string = 'success';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.profileForm.patchValue({
          displayName: user.displayName || '',
          email: user.email,
          phoneNumber: user.phoneNumber || '',
          location: user.location || ''
        });
      }
    });
  }

  createForm() {
    this.profileForm = this.formBuilder.group({
      displayName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phoneNumber: [''],
      location: ['']
    });
  }
  
      /**
       * Handle profile image selection from file input
       */
      onProfileImageSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        
        if (input.files && input.files.length > 0) {
          this.selectedProfileImage = input.files[0];
          
          // Validate file type and size
          if (!this.isValidImageFile(this.selectedProfileImage)) {
            // Reset selected file
            this.selectedProfileImage = null;
            return;
          }
          
          // Automatically upload the selected image
          this.uploadProfileImage();
        }
      }
      
      /**
       * Upload the selected profile image to Firebase storage
       */
      uploadProfileImage() {
        if (!this.selectedProfileImage || !this.currentUser) {
          return;
        }
        
        this.isUploading = true;
        
        this.userService.updateProfileImage(this.currentUser.uid, this.selectedProfileImage)
          .pipe(finalize(() => {
            this.isUploading = false;
            this.selectedProfileImage = null;
          }))
          .subscribe({
            next: (downloadUrl) => {
              // Update the local user object to show the new image immediately
              if (this.currentUser) {
                this.currentUser = {
                  ...this.currentUser,
                  profileImage: downloadUrl
                };
              }
              
              // Show success message
              this.showToastMessage('Profile image updated successfully', 'success');
            },
            error: (error) => {
              console.error('Error uploading profile image:', error);
              // Show error message
              this.showToastMessage('Failed to upload profile image. Please try again.', 'danger');
            }
          });
      }
      
      /**
       * Remove the current profile image
       */
      removeProfileImage() {
        if (!this.currentUser || !this.currentUser.profileImage || this.isUploading) {
          return;
        }
        
        this.isUploading = true;
        
        this.userService.deleteProfileImage(this.currentUser.uid, this.currentUser.profileImage)
          .pipe(finalize(() => {
            this.isUploading = false;
          }))
          .subscribe({
            next: (success) => {
              if (success) {
                // Update the local user object
                if (this.currentUser) {
                  this.currentUser = {
                    ...this.currentUser,
                    profileImage: null
                  };
                }
                
                // Show success message
                this.showToastMessage('Profile image removed successfully', 'success');
              } else {
                // Show error message
                this.showToastMessage('Failed to remove profile image. Please try again.', 'danger');
              }
            },
            error: (error) => {
              console.error('Error removing profile image:', error);
              // Show error message
              this.showToastMessage('Failed to remove profile image. Please try again.', 'danger');
            }
          });
      }
      
      /**
       * Validate if the file is an image with acceptable format and size
       */
      private isValidImageFile(file: File): boolean {
        // Check file type
        const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!acceptedImageTypes.includes(file.type)) {
          this.showToastMessage('Invalid file type. Please select an image file (JPEG, PNG, GIF, WEBP).', 'danger');
          return false;
        }
        
        // Check file size (limit to 5MB)
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSizeInBytes) {
          this.showToastMessage('Image too large. Please select an image smaller than 5MB.', 'danger');
          return false;
        }
        
        return true;
      }
      
      /**
       * Show a toast message
       */
       
    private showToastMessage(message: string, color: string = 'success') {
      this.toastMessage = message;
      this.toastColor = color;
      this.showToast = true;
    }

  onSubmit() {
    if (this.profileForm.invalid || !this.currentUser) {
      return;
    }

    const { displayName, phoneNumber, location } = this.profileForm.value;
    
    this.userService.updateUser(this.currentUser.uid, {
      displayName,
      phoneNumber,
      location
    }).subscribe({
      next: () => {
        // Show success message
      },
      error: (error) => {
        console.error('Error updating profile', error);
        // Show error message
      }
    });
  }
}