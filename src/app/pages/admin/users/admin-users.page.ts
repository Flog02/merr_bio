import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, combineLatest, map } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/admin/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ 'MANAGE_USERS' | translate }}</ion-title>
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
        <ion-item *ngFor="let user of filteredUsers$ | async">
          <ion-avatar slot="start">
            <img src="https://ionicframework.com/docs/img/demos/avatar.svg" />
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

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.customers$ = this.userService.getUsersByRole('customer');
    this.farmers$ = this.userService.getUsersByRole('farmer');
    this.admins$ = this.userService.getUsersByRole('admin');
    
    this.allUsers$ = combineLatest([this.customers$, this.farmers$, this.admins$]).pipe(
      map(([customers, farmers, admins]) => [...customers, ...farmers, ...admins])
    );
    
    this.filteredUsers$ = combineLatest([
      this.allUsers$,
      this.searchControl.valueChanges,
      this.roleControl.valueChanges
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
            user.displayName?.toLowerCase().includes(searchTermLower) ||
            user.email.toLowerCase().includes(searchTermLower) ||
            user.phoneNumber?.toLowerCase().includes(searchTermLower) ||
            user.location?.toLowerCase().includes(searchTermLower)
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
}