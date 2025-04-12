import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ 'MY_PROFILE' | translate }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" *ngIf="currentUser">
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

        <ion-button expand="block" type="submit" [disabled]="!profileForm.valid || !profileForm.dirty" class="ion-margin-top">
          {{ 'SAVE' | translate }}
        </ion-button>
      </form>

      <div *ngIf="!currentUser" class="ion-text-center ion-padding">
        <ion-spinner></ion-spinner>
        <p>{{ 'LOADING' | translate }}</p>
      </div>
    </ion-content>
  `
})
export class CustomerProfilePage implements OnInit {
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