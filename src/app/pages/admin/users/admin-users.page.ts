import { Component, OnInit } from '@angular/core';
import {  AlertController, ToastController, ActionSheetController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, combineLatest, map, startWith } from 'rxjs';
import { FormControl, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
// import{IonInput,IonSearchbar,IonBackButton,IonItemOption,IonItemOptions,IonItemSliding,IonBadge,IonSegmentButton,IonItem,IonLabel,IonHeader,IonTitle,IonButton,IonButtons,IonIcon,IonContent,IonList,IonAvatar,IonToolbar}from '@ionic/angular/standalone'
import{IonHeader,IonToolbar,IonButtons,IonBackButton,IonTitle,IonSearchbar,IonSegment,IonSegmentButton,IonLabel,IonContent,IonList,IonItemSliding,IonItem,IonAvatar,IonBadge,IonItemOption,IonItemOptions,IonIcon,IonInput,IonButton}from '@ionic/angular/standalone'
@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslatePipe,IonSegment,IonInput,IonSearchbar, CommonModule, RouterModule, ReactiveFormsModule, TranslatePipe, IonBackButton, IonItemOption, IonItemOptions, IonItemSliding, IonBadge, IonSegmentButton, IonItem, IonLabel, IonHeader, IonTitle, IonButton, IonButtons, IonIcon, IonContent, IonList, IonAvatar, IonToolbar],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/admin/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ 'MANAGE_USERS' | translate }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="openAddAdminModal()">
            <ion-icon slot="icon-only" name="person-add"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar [formControl]="searchControl" placeholder="{{ 'SEARCH_USERS' | translate }}"></ion-searchbar>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment [formControl]="roleControl">
          <ion-segment-button value="all">
            <ion-label>{{ 'ALL' | translate }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="customer">
            <ion-label>{{ 'CUSTOMERS' | translate }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="farmer">
            <ion-label>{{ 'FARMERS' | translate }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="admin">
            <ion-label>{{ 'ADMINS' | translate }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item-sliding *ngFor="let user of filteredUsers$ | async">
          <ion-item >
            <ion-avatar slot="start" *ngIf="user.role==='farmer'"[routerLink]="['/farmers', user.uid]" style="cursor: pointer;">
              <img [src]="user.profileImage || 'https://ionicframework.com/docs/img/demos/avatar.svg'" />
            </ion-avatar>
            <ion-avatar slot="start" *ngIf="user.role !=='farmer'">
              <img [src]="user.profileImage || 'https://ionicframework.com/docs/img/demos/avatar.svg'" />
            </ion-avatar>
            <ion-label>
              <h2>{{ user.displayName || 'No Name' }}</h2>
              <p>{{ user.email }}</p>
              <p *ngIf="user.phoneNumber">{{ user.phoneNumber }}</p>
              <p *ngIf="user.location">{{ user.location }}</p>
            </ion-label>
            <ion-badge slot="end" color="{{ getRoleBadgeColor(user.role) }}">
              {{ user.role | uppercase }}
            </ion-badge>
          </ion-item>
          
          <ion-item-options side="end">
            <ion-item-option color="primary" (click)="showUserOptions(user)">
              <ion-icon slot="icon-only" name="ellipsis-vertical"></ion-icon>
            </ion-item-option>
            <ion-item-option color="danger" (click)="confirmDeleteUser(user)">
              <ion-icon slot="icon-only" name="trash"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
        
        <ion-item *ngIf="(filteredUsers$ | async)?.length === 0">
          <ion-label class="ion-text-center">
            <p>{{ 'NO_USERS_FOUND' | translate }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `
})
export class AdminUsersPage implements OnInit {
  customers$!: Observable<User[]>;
  farmers$!: Observable<User[]>;
  admins$!: Observable<User[]>;
  allUsers$!: Observable<User[]>;
  filteredUsers$!: Observable<User[]>;

  searchControl = new FormControl('');
  roleControl = new FormControl('all');
  addAdminForm!: FormGroup;

  constructor(
    private userService: UserService,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private formBuilder: FormBuilder
  ) {
    this.createAddAdminForm();
  }

  ngOnInit() {
    this.loadUsers();
  }
  
  createAddAdminForm() {
    this.addAdminForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      displayName: ['', [Validators.required]]
    });
  }
  
  loadUsers() {
    this.customers$ = this.userService.getUsersByRole('customer');
    this.farmers$ = this.userService.getUsersByRole('farmer');
    this.admins$ = this.userService.getUsersByRole('admin');
    
    this.allUsers$ = combineLatest([this.customers$, this.farmers$, this.admins$]).pipe(
      map(([customers, farmers, admins]) => [...customers, ...farmers, ...admins])
    );
    
    this.filteredUsers$ = combineLatest([
      this.allUsers$,
      this.searchControl.valueChanges.pipe(startWith('')),
      this.roleControl.valueChanges.pipe(startWith('all'))
    ]).pipe(
      map(([users, searchTerm, role]) => {
        return users.filter(user => {
          // Filter by role
          if (role !== 'all' && user.role !== role) {
            return false;
          }
          
          // Filter by search term
          if (!searchTerm) {
            return true;
          }
          
          const searchTermLower = searchTerm.toLowerCase();
          return (
            (user.displayName?.toLowerCase().includes(searchTermLower) || false) ||
            (user.email?.toLowerCase().includes(searchTermLower) || false) ||
            (user.phoneNumber?.toLowerCase().includes(searchTermLower) || false) ||
            (user.location?.toLowerCase().includes(searchTermLower) || false)
          );
        });
      })
    );
  }

  getRoleBadgeColor(role: string): string {
    switch (role) {
      case 'admin': return 'danger';
      case 'farmer': return 'success';
      case 'customer': return 'primary';
      default: return 'medium';
    }
  }
  
  async confirmDeleteUser(user: User) {
    // Don't allow deleting yourself
    const currentUser = await this.userService.getCurrentUser();
    if (user.uid === currentUser?.uid) {
      this.showToast('You cannot delete your own account', 'danger');
      return;
    }
    
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete ${user.displayName || user.email}? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteUser(user);
          }
        }
      ]
    });
    
    await alert.present();
  }
  
  async deleteUser(user: User) {
    try {
      await this.userService.deleteUser(user.uid);
      this.showToast(`User ${user.displayName || user.email} deleted successfully`, 'success');
      // Reload users
      this.loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      this.showToast('Failed to delete user', 'danger');
    }
  }
  
  async showUserOptions(user: User) {
    // Don't allow changing your own role
    const currentUser = await this.userService.getCurrentUser();
    const isCurrentUser = user.uid === currentUser?.uid;
    
    const buttons: any[] = [
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ];
    
    // Add role change options if not current user
    if (!isCurrentUser) {
      if (user.role !== 'admin') {
        buttons.unshift({
          text: 'Make Admin',
          handler: () => {
            this.changeUserRole(user, 'admin');
          }
        });
      }
      
      if (user.role !== 'farmer') {
        buttons.unshift({
          text: 'Make Farmer',
          handler: () => {
            this.changeUserRole(user, 'farmer');
          }
        });
      }
      
      if (user.role !== 'customer') {
        buttons.unshift({
          text: 'Make Customer',
          handler: () => {
            this.changeUserRole(user, 'customer');
          }
        });
      }
    }
    
    const actionSheet = await this.actionSheetController.create({
      header: `Options for ${user.displayName || user.email}`,
      buttons
    });
    
    await actionSheet.present();
  }
  
  async changeUserRole(user: User, newRole: 'admin' | 'farmer' | 'customer') {
    try {
      await this.userService.updateUser(user.uid, { role: newRole });
      this.showToast(`User role changed to ${newRole}`, 'success');
      // Reload users
      this.loadUsers();
    } catch (error) {
      console.error('Error changing user role:', error);
      this.showToast('Failed to change user role', 'danger');
    }
  }
  
  async openAddAdminModal() {
    const alert = await this.alertController.create({
      header: 'Add Admin User',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email'
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Password'
        },
        {
          name: 'displayName',
          type: 'text',
          placeholder: 'Name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: (data) => {
            if (!data.email || !data.password || !data.displayName) {
              this.showToast('All fields are required', 'danger');
              return false;
            }
            
            this.addAdminUser(data.email, data.password, data.displayName);
            return true;
          }
        }
      ]
    });
    
    await alert.present();
  }
  
  async addAdminUser(email: string, password: string, displayName: string) {
    try {
      await this.userService.createAdminUser(email, password, displayName);
      this.showToast('Admin user created successfully', 'success');
      // Reload users
      this.loadUsers();
    } catch (error) {
      console.error('Error creating admin user:', error);
      this.showToast('Failed to create admin user', 'danger');
    }
  }
  
  async showToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    
    await toast.present();
  }
}