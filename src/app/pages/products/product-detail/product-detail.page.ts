import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonInput,
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
    IonInput,
    IonSpinner,
    CommonModule,
    TranslatePipe,
    IonHeader,
    IonToolbar,
    IonContent,
    IonButton,
    IonButtons,
    IonBackButton,
    IonIcon
],
  template: `<ion-header class="ion-no-border">
  <ion-toolbar class="header-transparent">
    <ion-buttons slot="start">
      <ion-back-button defaultHref="/products" color="light"></ion-back-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content>
  <div *ngIf="product">
    <!-- Product Image -->
    <div class="product-image">
      <img src="assets/product-placeholder.jpg" alt="{{ product.name }}">
    </div>
    
    <!-- Product Info -->
    <div class="product-container" style="margin-bottom: 35px;">
      <h1 class="product-title">{{ product.name }}</h1>
      <div class="product-price">{{ product.price }} ALL<span class="unit">/{{ product.unit }}</span></div>
      
      <div class="farmer-section" *ngIf="farmer">
        <div class="farmer-avatar">
          <img src="assets/farmer-placeholder.jpg" alt="{{ farmer.displayName }}">
        </div>
        <div class="farmer-info">
          <div class="farmer-name">{{ farmer.displayName }}</div>
          <div class="farmer-location" *ngIf="farmer.location">{{ farmer.location }}</div>
        </div>
      </div>
      <ion-button expand="block" fill="outline" *ngIf="currentUser?.role === 'customer'" (click)="startChat()">
  <ion-icon name="chatbubbles-outline" slot="start"></ion-icon>
  Message Farmer
</ion-button>
      
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
  <ion-button expand="block" (click)="requestToBuy(); ">
    {{ 'ADD_TO_CART' | translate }} | {{ product.price * selectedQuantity }} ALL
  </ion-button>
</div>


</ion-content>

<!-- <ion-footer *ngIf="product && currentUser?.role === 'customer'" class="ion-no-border"></ion-footer> -->
`,
  styles: [`
    .product-image {
      width: 100%;
      height: 320px;
      position: relative;
      overflow: hidden;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent);
      }
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: var(--transition);
      }
    }
    
    .product-container {
      padding: var(--spacing-md);
      background: white;
      border-top-left-radius: 24px;
      border-top-right-radius: 24px;
      margin-top: -24px;
      position: relative;
      z-index: 10;
      min-height: calc(100vh - 320px + 24px);
      box-shadow: 0 -10px 20px rgba(0, 0, 0, 0.1);
    }
    
    .product-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.8rem;
      font-weight: 700;
      color: #222222;
      margin: var(--spacing-md) 0 var(--spacing-xs);
      line-height: 1.2;
    }
    
    .product-price {
      font-family: 'Poppins', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--ion-color-primary);
      margin-bottom: var(--spacing-md);
      display: flex;
      align-items: baseline;
      
      .unit {
        font-size: 1rem;
        font-weight: 400;
        color: var(--ion-color-medium);
        margin-left: 4px;
      }
      
      &::after {
        content: '';
        display: block;
        width: 40px;
        height: 2px;
        background-color: var(--ion-color-primary);
        margin-left: var(--spacing-md);
        opacity: 0.5;
      }
    }
    
    .farmer-section {
      display: flex;
      align-items: center;
      padding: var(--spacing-md);
      border: 1px solid rgba(0, 0, 0, 0.05);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-md);
      transition: var(--transition);
      
      &:hover {
        box-shadow: var(--box-shadow-light);
        transform: translateY(-2px);
      }
      
      .farmer-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: var(--spacing-md);
        border: 2px solid rgba(var(--ion-color-primary-rgb), 0.2);
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition);
        }
      }
      
      .farmer-info {
        flex: 1;
        
        .farmer-name {
          font-family: 'Playfair Display', serif;
          font-weight: 600;
          font-size: 1.1rem;
          color: #222222;
          margin-bottom: 4px;
        }
        
        .farmer-location {
          font-size: 0.85rem;
          color: var(--ion-color-medium);
          display: flex;
          align-items: center;
          
          &::before {
            content: '';
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: var(--ion-color-primary);
            margin-right: 8px;
            opacity: 0.5;
          }
        }
      }
      
      .rating {
        display: flex;
        align-items: center;
        font-weight: 600;
        color: var(--secondary-color, #d4af37);
        
        ion-icon {
          margin-right: 4px;
        }
      }
    }
    
    .product-details {
      margin-bottom: var(--spacing-lg);
      
      h3 {
        font-family: 'Playfair Display', serif;
        font-size: 1.2rem;
        font-weight: 600;
        color: #222222;
        margin-bottom: var(--spacing-sm);
        position: relative;
        display: inline-block;
        
        &::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 30px;
          height: 2px;
          background-color: var(--ion-color-primary);
        }
      }
      
      p {
        color: #555555;
        line-height: 1.6;
        margin-bottom: var(--spacing-md);
        font-family: 'Poppins', sans-serif;
        font-size: 0.95rem;
      }
      
      .product-meta {
        background: rgba(var(--ion-color-light-rgb), 0.5);
        border-radius: var(--border-radius-md);
        padding: var(--spacing-md);
        
        .meta-item {
          display: flex;
          margin-bottom: var(--spacing-sm);
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .label {
            font-weight: 500;
            color: #666666;
            width: 130px;
            font-family: 'Poppins', sans-serif;
          }
          
          .value {
            font-weight: 600;
            color: #222222;
            font-family: 'Poppins', sans-serif;
          }
        }
      }
    }
    
    .quantity-selector {
      display: flex;
      flex-wrap: wrap;
      margin: var(--spacing-md) 0 var(--spacing-xl);
      
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
        transition: var(--transition);
        font-family: 'Poppins', sans-serif;
        
        &.active {
          background: var(--ion-color-primary);
          border-color: var(--ion-color-primary);
          color: white;
        }
        
        &:not(.active):hover {
          border-color: var(--ion-color-primary);
          transform: translateY(-2px);
          box-shadow: var(--box-shadow-light);
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
      box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.08);
      z-index: 10;
      
      
      
      ion-button {
        margin: 0;
        --border-radius: var(--border-radius-md);
        font-weight: 600;
        height: 52px;
        font-family: 'Poppins', sans-serif;
        letter-spacing: 0.5px;
        text-transform: none;
        
        
        
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
        
        &:hover::before {
          opacity: 1;
        }
      }
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60vh;
      
      ion-spinner {
        width: 60px;
        height: 60px;
        margin-bottom: var(--spacing-md);
        color: var(--ion-color-primary);
      }
      
      p {
        color: var(--ion-color-medium);
        font-family: 'Poppins', sans-serif;
        font-size: 1rem;
      }
    }
    
    ion-footer {
      height: calc(var(--spacing-md) * 2 + 52px); /* Same as action button height */
    }
    
    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    .product-title, .product-price {
      animation: slideUp 0.6s ease-out;
    }
    
    .farmer-section {
      animation: fadeIn 0.8s ease-in-out;
    }
    
    .product-details, .quantity-selector {
      animation: fadeIn 1s ease-in-out;
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
    private toastController: ToastController,
    private router: Router,
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      console.log('Current User:', this.currentUser);  // Debugging line
    });
    
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProductById(productId).subscribe({
        next: (product) => {
          this.product = product;
          console.log('Product:', this.product);  // Debugging line
          
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

  startChat() {
    if (!this.farmer || !this.currentUser) return;
    
    // Navigate to chat with this farmer
    this.router.navigate([`/customer/chats/${this.farmer.uid}`]);
  }

  async requestToBuy() {
    console.log('Request button clicked');  // Keep this debug line
    
    try {
      if (!this.currentUser) {
        console.log('No user logged in');
        this.showErrorToast('Please log in to make a purchase request');
        return;
      }
      
      console.log('Current user role:', this.currentUser.role);
      if (this.currentUser.role !== 'customer') {
        this.showErrorToast('Only customers can make purchase requests');
        return;
      }
      
      await this.showPurchaseConfirmation();
    } catch (error) {
      console.error('Error in requestToBuy:', error);
      this.showErrorToast('An unexpected error occurred');
    }
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
    console.log('Submitting purchase request');
    
    if (!this.product || !this.currentUser) {
      console.log('Missing product or user data');
      return;
    }
    
    const request = {
      productId: this.product.id!,
      customerId: this.currentUser.uid,
      farmerId: this.product.farmerId,
      quantity: this.selectedQuantity,
      status: 'pending' as 'pending',
      timestamp: Timestamp.fromDate(new Date()),
      createdAt: Timestamp.fromDate(new Date()),  // Add this line
      message: `I would like to purchase ${this.selectedQuantity} ${this.product.unit} of ${this.product.name}.`
    };
    
    console.log('Request object:', request);
    
    this.purchaseRequestService.createRequest(request).subscribe({
      next: (id) => {
        console.log('Request created with ID:', id);
        this.showSuccessToast();
      },
      error: (error) => {
        console.error('Error creating request:', error);
        this.showErrorToast('Error sending request. Please try again.');
      }
    });
  }


}