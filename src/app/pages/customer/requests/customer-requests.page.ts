import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
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
  selector: 'app-customer-requests',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, TranslatePipe],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ 'MY_REQUESTS' | translate }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item *ngFor="let request of requests$ | async">
          <ion-label>
            <h2>{{ getProductName(request.productId) }}</h2>
            <p>{{ 'QUANTITY' | translate }}: {{ request.quantity }}</p>
            <p>{{ 'FARMER' | translate }}: {{ getFarmerName(request.farmerId) }}</p>
            <p>{{ request.message }}</p>
            <p>{{ request.timestamp.toDate() | date:'medium' }}</p>
          </ion-label>
          <ion-badge slot="end" color="{{ getBadgeColor(request.status) }}">
            {{ getStatusText(request.status) | translate }}
          </ion-badge>
        </ion-item>
      </ion-list>

      <div class="ion-text-center ion-padding" *ngIf="(requests$ | async)?.length === 0">
        <p>{{ 'NO_REQUESTS' | translate }}</p>
        <ion-button routerLink="/products">{{ 'BROWSE_PRODUCTS' | translate }}</ion-button>
      </div>
    </ion-content>
  `
})
export class CustomerRequestsPage implements OnInit {
  requests$!: Observable<PurchaseRequest[]>;
  products: Map<string, string> = new Map();
  farmers: Map<string, string> = new Map();
  customerId: string = '';

  constructor(
    private requestService: PurchaseRequestService,
    private productService: ProductService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.customerId = user.uid;
        this.requests$ = this.requestService.getRequestsByCustomer(this.customerId);
        
        // Pre-load products and farmers for display
        this.requests$.subscribe(requests => {
          // Get unique product IDs
          const productIds = [...new Set(requests.map(r => r.productId))];
          // Get unique farmer IDs
          const farmerIds = [...new Set(requests.map(r => r.farmerId))];
          
          // Load product names
          productIds.forEach(id => {
            this.productService.getProductById(id).subscribe(product => {
              this.products.set(id, product.name);
            });
          });
          
          // Load farmer names
          farmerIds.forEach(id => {
            this.userService.getUserById(id).subscribe(user => {
              this.farmers.set(id, user.displayName || user.email);
            });
          });
        });
      }
    });
  }

  getProductName(productId: string): string {
    return this.products.get(productId) || 'Loading...';
  }

  getFarmerName(farmerId: string): string {
    return this.farmers.get(farmerId) || 'Loading...';
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
}