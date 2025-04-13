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
  template: `<ion-header class="ion-no-border">
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-menu-button></ion-menu-button>
    </ion-buttons>
    <ion-title>{{ 'MY_REQUESTS' | translate }}</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-list>
    <ion-item *ngFor="let request of requests$ | async; let i = index" class="slide-in" [style.animation-delay]="(i * 0.05) + 's'">
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

  <div class="no-requests fade-in" *ngIf="(requests$ | async)?.length === 0">
    <ion-icon name="cart-outline"></ion-icon>
    <h3>{{ 'NO_REQUESTS_YET' | translate }}</h3>
    <p>{{ 'NO_REQUESTS' | translate }}</p>
    <ion-button routerLink="/products">
      <ion-icon name="grid-outline" slot="start"></ion-icon>
      {{ 'BROWSE_PRODUCTS' | translate }}
    </ion-button>
  </div>
</ion-content>`,
  styles:`/* Customer Requests styling with Ancker-inspired elegant design */

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
  
  ion-list {
    background: transparent;
    padding: var(--spacing-md) 0;
  }
  
  ion-item {
    --background: white;
    --border-radius: var(--border-radius-md);
    margin: 0 var(--spacing-md) var(--spacing-sm);
    box-shadow: var(--box-shadow-light);
    transition: var(--transition);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--box-shadow-medium);
    }
    
    ion-label {
      padding: var(--spacing-sm) 0;
      
      h2 {
        font-family: 'Playfair Display', serif;
        font-weight: 600;
        font-size: 1.1rem;
        color: var(--ion-color-dark);
        margin-bottom: var(--spacing-xs);
      }
      
      p {
        font-family: 'Poppins', sans-serif;
        margin: var(--spacing-xs) 0;
        color: var(--ion-color-medium);
        font-size: 0.9rem;
        
        &:first-of-type {
          color: var(--ion-color-dark);
          font-weight: 500;
        }
      }
    }
    
    ion-badge {
      padding: 8px 12px;
      border-radius: 16px;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
  
  .no-requests {
    padding: var(--spacing-xl) var(--spacing-md);
    text-align: center;
    color: var(--ion-color-medium);
    font-family: 'Poppins', sans-serif;
    
    ion-icon {
      font-size: 64px;
      color: rgba(var(--ion-color-primary-rgb), 0.15);
      margin-bottom: var(--spacing-md);
    }
    
    h3 {
      font-family: 'Playfair Display', serif;
      margin: var(--spacing-sm) 0;
      color: var(--ion-color-dark);
      font-size: 1.4rem;
    }
    
    p {
      color: var(--ion-color-medium);
      max-width: 280px;
      margin: 0 auto var(--spacing-md);
      line-height: 1.5;
    }
    
    ion-button {
      --background: transparent;
      --background-hover: var(--ion-color-primary);
      --color: var(--ion-color-primary);
      --border-color: var(--ion-color-primary);
      --border-style: solid;
      --border-width: 2px;
      --box-shadow: none;
      --padding-top: 10px;
      --padding-bottom: 10px;
      --padding-start: 20px;
      --padding-end: 20px;
      font-family: 'Poppins', sans-serif;
      font-weight: 500;
      letter-spacing: 0.5px;
      margin-top: var(--spacing-md);
      
      &:hover {
        --background: var(--ion-color-primary);
        --color: white;
      }
    }
  }
  
  /* Animations */
  .fade-in {
    animation: fadeIn 0.8s ease-in-out;
  }
  
  .slide-in {
    animation: slideIn 0.5s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideIn {
    from { 
      opacity: 0;
      transform: translateX(-20px);
    }
    to { 
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  /* Animation delays for list items */
  @for $i from 1 through 20 {
    ion-item:nth-child(#{$i}) {
      animation: slideIn 0.5s ease-out;
      animation-delay: #{$i * 0.05}s;
      animation-fill-mode: both;
    }
  }`
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