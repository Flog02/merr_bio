import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, TranslatePipe],
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
      <div class="avatar">
        <!-- <ion-icon name="person" *ngIf="!currentUser.photoURL"></ion-icon> -->
        <!-- <img *ngIf="currentUser.photoURL" [src]="currentUser.photoURL" alt="{{ currentUser.displayName }}"> -->
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
      
      <ion-button expand="block" type="submit" [disabled]="!profileForm.valid || !profileForm.dirty">
        {{ 'SAVE' | translate }}
      </ion-button>
    </form>
  </div>
  
  <div *ngIf="!currentUser" class="loading-container fade-in">
    <ion-spinner></ion-spinner>
    <p>{{ 'LOADING' | translate }}</p>
  </div>
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
    
    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid rgba(255, 255, 255, 0.3);
      margin: 0 auto var(--spacing-md);
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      ion-icon {
        font-size: 64px;
        color: rgba(255, 255, 255, 0.8);
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
      
      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0));
        opacity: 0;
        transition: var(--transition);
      }
      
      &:hover:not(:disabled)::before {
        opacity: 1;
      }
      
      &:disabled {
        --background: rgba(var(--ion-color-medium-rgb), 0.3);
        --color: rgba(var(--ion-color-medium-rgb), 0.7);
      }
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
  profileForm!: FormGroup;
  currentUser: User | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService
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