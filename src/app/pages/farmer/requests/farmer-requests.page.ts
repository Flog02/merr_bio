import { Component, OnInit } from '@angular/core';
import {IonItemOption,IonItemOptions,IonItemSliding,IonBadge,IonMenuButton,IonItem,IonLabel,IonHeader,IonTitle,IonButtons,IonIcon,IonContent,IonList,IonToolbar}from '@ionic/angular/standalone'
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { PurchaseRequest } from '../../../models/request.model';
import { PurchaseRequestService } from '../../../services/purchase-request.service';
import { ProductService } from '../../../services/product.service';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-farmer-requests',
  standalone: true,
  imports: [IonItemOption, IonItemOptions, IonItemSliding, IonBadge, IonMenuButton, IonItem, IonLabel, IonHeader, IonTitle, IonButtons, IonIcon, IonContent, IonList, IonToolbar, CommonModule, RouterModule, TranslatePipe],
  template: `<ion-header class="ion-no-border">
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-menu-button></ion-menu-button>
    </ion-buttons>
    <ion-title>{{ 'PURCHASE_REQUESTS' | translate }}</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-list>
    <ion-item-sliding *ngFor="let request of requests$ | async">
      <ion-item>
        <ion-label>
          <h2>{{ getProductName(request.productId) }}</h2>
          <p>{{ 'QUANTITY' | translate }}: {{ request.quantity }}</p>
          <p>{{ 'CUSTOMER' | translate }}: {{ getCustomerName(request.customerId) }}</p>
          <p>{{ request.message }}</p>
          <p>{{ request.timestamp.toDate() | date:'medium' }}</p>
        </ion-label>
        <ion-badge slot="end" color="{{ getBadgeColor(request.status) }}">
          {{ getStatusText(request.status) | translate }}
        </ion-badge>
      </ion-item>

      <ion-item-options side="end" *ngIf="request.status === 'pending'">
        <ion-item-option color="success" (click)="updateRequestStatus(request.id!, 'accepted')">
          <ion-icon slot="icon-only" name="checkmark"></ion-icon>
        </ion-item-option>
        <ion-item-option color="danger" (click)="updateRequestStatus(request.id!, 'rejected')">
          <ion-icon slot="icon-only" name="close"></ion-icon>
        </ion-item-option>
      </ion-item-options>
    </ion-item-sliding>
  </ion-list>

  <div class="no-requests fade-in " style="    place-items: center;" *ngIf="(requests$ | async)?.length === 0">
    <ion-icon name="notifications-outline"></ion-icon>
    <h3>{{ 'NO_REQUESTS_YET' | translate }}</h3>
    <p>{{ 'NO_REQUESTS' | translate }}</p>
  </div>
</ion-content> `
})
export class FarmerRequestsPage implements OnInit {
  requests$!: Observable<PurchaseRequest[]>;
  products: Map<string, string> = new Map();
  customers: Map<string, string> = new Map();
  farmerId: string = '';

  constructor(
    private requestService: PurchaseRequestService,
    private productService: ProductService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.farmerId = user.uid;
        this.requests$ = this.requestService.getRequestsByFarmer(this.farmerId);
        
        // Pre-load products and customers for display
        this.requests$.subscribe(requests => {
          // Get unique product IDs
          const productIds = [...new Set(requests.map(r => r.productId))];
          // Get unique customer IDs
          const customerIds = [...new Set(requests.map(r => r.customerId))];
          
          // Load product names
          productIds.forEach(id => {
            this.productService.getProductById(id).subscribe(product => {
              this.products.set(id, product.name);
            });
          });
          
          // Load customer names
          customerIds.forEach(id => {
            this.userService.getUserById(id).subscribe(user => {
              this.customers.set(id, user?.displayName || user!.email);
            });
          });
        });
      }
    });
  }

  getProductName(productId: string): string {
    return this.products.get(productId) || 'Loading...';
  }

  getCustomerName(customerId: string): string {
    return this.customers.get(customerId) || 'Loading...';
  }

  getBadgeColor(status: string): string {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'danger';
      default: return 'warning';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'accepted': return 'ACCEPTED';
      case 'rejected': return 'REJECTED';
      default: return 'PENDING';
    }
  }

  updateRequestStatus(requestId: string, status: 'accepted' | 'rejected') {
    this.requestService.updateRequestStatus(requestId, status).subscribe({
      next: () => {
        // Success notification could be added here
      },
      error: (error) => {
        console.error('Error updating request', error);
      }
    });
  }
}