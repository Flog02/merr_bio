// src/app/pages/products/product-detail/product-detail.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
    IonSpinner,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonButtons,
  IonBackButton,
  IonBadge,
  IonLabel,
  IonItem,
  IonFooter,
  IonChip,
  IonImg,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { UserService } from '../../../services/user.service';
import { PurchaseRequestService } from '../../../services/purchase-request.service';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    IonFooter,
    IonSpinner,
    CommonModule,
    TranslatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonButtons,
    IonBackButton,
    IonBadge,
    IonChip,
    IonImg
],
  template: `<ion-header>
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-back-button defaultHref="/products"></ion-back-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content>
  <div *ngIf="product">
    <!-- Product Image -->
    <div class="product-image">
      <img src="assets/images/product-placeholder.jpg" alt="{{ product.name }}">
    </div>
    
    <!-- Product Info -->
    <div class="product-container">
      <h1 class="product-title">{{ product.name }}</h1>
      <div class="product-price">{{ product.price }} ALL<span class="unit">/{{ product.unit }}</span></div>
      
      <div class="farmer-section" *ngIf="farmer">
        <div class="farmer-avatar">
          <img src="assets/images/farmer-placeholder.jpg" alt="{{ farmer.displayName }}">
        </div>
        <div class="farmer-info">
          <div class="farmer-name">{{ farmer.displayName }}</div>
          <div class="farmer-location" *ngIf="farmer.location">{{ farmer.location }}</div>
        </div>
        <div class="rating" *ngIf="farmer.rating">
          <ion-icon name="star"></ion-icon>
          <span>{{ farmer.rating }}</span>
        </div>
      </div>
      
      <div class="product-details">
        <h3>{{ 'DESCRIPTION' | translate }}</h3>
        <p>{{ product.description }}</p>
        
        <div class="product-meta">
          <div class="meta-item">
            <span class="label">{{ 'AVAILABLE' | translate }}:</span>
            <span class="value">{{ product.quantity }} {{ product.unit }}</span>
          </div>
          <div class="meta-item">
            <span class="label">{{ 'CATEGORY' | translate }}:</span>
            <span class="value">{{ product.category }}</span>
          </div>
        </div>
      </div>
      
      <div *ngIf="currentUser?.role === 'customer'">
        <h3>{{ 'SELECT_QUANTITY' | translate }}</h3>
        <div class="quantity-selector">
          <div 
            *ngFor="let qty of quantityOptions" 
            class="quantity-option" 
            [class.active]="selectedQuantity === qty"
            (click)="selectQuantity(qty)">
            {{ qty }} {{ product.unit }}
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div *ngIf="!product" class="loading-container">
    <ion-spinner></ion-spinner>
    <p>{{ 'LOADING_PRODUCT_DETAILS' | translate }}</p>
  </div>
  
  <!-- Action Button (Fixed at bottom) -->
  <div class="action-button" *ngIf="product && currentUser?.role === 'customer'">
    <ion-button expand="block" (click)="requestToBuy()">
      {{ 'ADD_TO_CART' | translate }} | {{ product.price * selectedQuantity }} ALL
    </ion-button>
  </div>
</ion-content>

<ion-footer *ngIf="product && currentUser?.role === 'customer'" class="ion-no-border"></ion-footer>`,
  styles: [`/* Product detail page styles */

    .product-image {
      width: 100%;
      height: 280px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .product-container {
      padding: var(--spacing-md);
      background: white;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      margin-top: -20px;
      position: relative;
      z-index: 10;
      min-height: calc(100vh - 280px + 20px); /* Full remaining height considering the overlap */
    }
    
    .product-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #222222;
      margin: var(--spacing-md) 0 var(--spacing-xs);
    }
    
    .product-price {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--ion-color-primary);
      margin-bottom: var(--spacing-md);
      
      .unit {
        font-size: 1rem;
        font-weight: 400;
        color: var(--ion-color-medium);
        margin-left: 2px;
      }
    }
    
    .farmer-section {
      display: flex;
      align-items: center;
      padding: var(--spacing-md);
      border: 1px solid #f0f0f0;
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-md);
      
      .farmer-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: var(--spacing-md);
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .farmer-info {
        flex: 1;
        
        .farmer-name {
          font-weight: 600;
          font-size: 0.95rem;
          color: #222222;
        }
        
        .farmer-location {
          font-size: 0.8rem;
          color: var(--ion-color-medium);
        }
      }
      
      .rating {
        display: flex;
        align-items: center;
        font-weight: 600;
        color: #FFC107;
        
        ion-icon {
          margin-right: 2px;
        }
      }
    }
    
    .product-details {
      margin-bottom: var(--spacing-lg);
      
      h3 {
        font-size: 1.1rem;
        font-weight: 600;
        color: #222222;
        margin-bottom: var(--spacing-sm);
      }
      
      p {
        color: #555555;
        line-height: 1.5;
        margin-bottom: var(--spacing-md);
      }
      
      .product-meta {
        border-top: 1px solid #f0f0f0;
        padding-top: var(--spacing-md);
        
        .meta-item {
          display: flex;
          margin-bottom: var(--spacing-sm);
          
          .label {
            font-weight: 500;
            color: #666666;
            width: 100px;
          }
          
          .value {
            font-weight: 600;
            color: #222222;
          }
        }
      }
    }
    
    .quantity-selector {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: var(--spacing-xl);
      
      .quantity-option {
        background: white;
        border: 1px solid #e0e0e0;
        padding: var(--spacing-sm) var(--spacing-md);
        margin-right: var(--spacing-sm);
        margin-bottom: var(--spacing-sm);
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 500;
        color: #333333;
        
        &.active {
          background: var(--ion-color-primary);
          border-color: var(--ion-color-primary);
          color: white;
        }
      }
    }
    
    .action-button {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      padding: var(--spacing-md);
      box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.05);
      z-index: 10;
      
      ion-button {
        margin: 0;
        --border-radius: var(--border-radius-md);
        font-weight: 600;
        height: 48px;
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
      }
    }
    
    ion-footer {
      height: calc(var(--spacing-md) * 2 + 48px); /* Same as action button height */
    }`]
})
export class ProductDetailPage implements OnInit {
  product: Product | null = null;
  farmer: User | null = null;
  currentUser: User | null = null;
  
  selectedQuantity: number = 1;
  quantityOptions: number[] = [1, 2, 3, 4, 5];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private authService: AuthService,
    private userService: UserService,
    private purchaseRequestService: PurchaseRequestService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
    
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProductById(productId).subscribe({
        next: (product) => {
          this.product = product;
          
          // Load farmer info
          if (product.farmerId) {
            this.userService.getUserById(product.farmerId).subscribe({
              next: (farmer) => {
                this.farmer = farmer;
              },
              error: (error) => {
                console.error('Error fetching farmer:', error);
                this.showErrorToast('Error loading farmer details.');
              }
            });
          }
        },
        error: (error) => {
          console.error('Error fetching product:', error);
          this.showErrorToast('Error loading product details.');
        }
      });
    }
  }

  selectQuantity(qty: number) {
    this.selectedQuantity = qty;
  }

  async requestToBuy() {
    if (!this.currentUser) {
      this.showErrorToast('Please log in to make a purchase request');
      return;
    }
    
    if (this.currentUser.role !== 'customer') {
      this.showErrorToast('Only customers can make purchase requests');
      return;
    }
    
    await this.showPurchaseConfirmation();
  }

  async showPurchaseConfirmation() {
    const alert = await this.alertController.create({
      header: 'Purchase Request',
      message: 'Are you sure you want to send a purchase request for this product?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: () => {
            this.submitPurchaseRequest();
          }
        }
      ]
    });

    await alert.present();
  }

  async showSuccessToast(message: string = 'Your request has been sent successfully!') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: 'success'
    });

    await toast.present();
  }

  async showErrorToast(message: string = 'An error occurred. Please try again.') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    });

    await toast.present();
  }

  submitPurchaseRequest() {
    if (!this.product || !this.currentUser) return;
    
    const request = {
      productId: this.product.id!,
      customerId: this.currentUser.uid,
      farmerId: this.product.farmerId,
      quantity: this.selectedQuantity,
      status: 'pending' as 'pending', // Type assertion to literal type
      timestamp: Timestamp.fromDate(new Date()),
      message: `I would like to purchase ${this.selectedQuantity} ${this.product.unit} of ${this.product.name}.`
    };
    
    this.purchaseRequestService.createRequest(request).subscribe({
      next: () => {
        this.showSuccessToast();
      },
      error: (error) => {
        this.showErrorToast('Error sending request. Please try again.');
        console.error('Error creating request', error);
      }
    });
  }

  startChat() {
    if (!this.product || !this.currentUser || !this.farmer) return;
    
    // For now, just show a message
    this.showErrorToast('Chat feature coming soon!');
  }
}