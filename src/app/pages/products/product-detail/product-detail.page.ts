import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonSpinner,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonBackButton,
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
    RouterLink,
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
    <!-- Product Image Gallery -->
    <div class="product-image-gallery">
      <!-- When there are multiple images, show as gallery -->
      <div *ngIf="product.images && product.images.length > 0" class="gallery-container">
        <div class="main-image">
          <img [src]="currentImageUrl" alt="{{ product.name }}">
          
          <!-- Navigation arrows (only if multiple images) -->
          <div *ngIf="product.images.length > 1" class="gallery-navigation">
            <button class="nav-button prev" (click)="prevImage()">
              <ion-icon name="chevron-back"></ion-icon>
            </button>
            <button class="nav-button next" (click)="nextImage()">
              <ion-icon name="chevron-forward"></ion-icon>
            </button>
          </div>
          
          <!-- Image indicator dots -->
          <div *ngIf="product.images.length > 1" class="image-indicators">
            <span 
              *ngFor="let image of product.images; let i = index" 
              class="indicator-dot"
              [class.active]="i === currentImageIndex"
              (click)="setCurrentImage(i)">
            </span>
          </div>
        </div>
        
        <!-- Thumbnail strip (when more than 1 image) -->
        <div *ngIf="product.images.length > 1" class="thumbnail-strip">
          <div 
            *ngFor="let image of product.images; let i = index" 
            class="thumbnail"
            [class.active]="i === currentImageIndex"
            (click)="setCurrentImage(i)">
            <img [src]="image" alt="Thumbnail">
          </div>
        </div>
      </div>
      
      <!-- Fallback to placeholder if no images -->
      <div *ngIf="!product.images || product.images.length === 0" class="product-image">
        <img src="assets/product-placeholder.jpg" alt="{{ product.name }}">
      </div>
    </div>
    
    <!-- Product Info -->
    <div class="product-container" style="margin-bottom: 35px;">
      <h1 class="product-title">{{ product.name }}</h1>
      <div class="product-price">{{ product.price }} ALL<span class="unit">/{{ product.unit |uppercase|translate }}</span></div>
      
      <div class="farmer-section" *ngIf="farmer" [routerLink]="['/farmers', farmer.uid]">
        <div class="farmer-avatar">
          <!-- Show farmer profile image if available -->
          <img *ngIf="farmer.profileImage" [src]="farmer.profileImage" alt="{{ farmer.displayName }}">
          <img *ngIf="!farmer.profileImage" src="assets/farmer-placeholder.jpg" alt="{{ farmer.displayName }}">
        </div>
        <div class="farmer-info">
          <div class="farmer-name">{{ farmer.displayName }}</div>
          <div class="farmer-location" *ngIf="farmer.location">{{ farmer.location }}</div>
        </div>
        <ion-icon name="chevron-forward-outline" class="view-profile-icon"></ion-icon>
      </div>
      
      <ion-button expand="block" fill="outline" *ngIf="currentUser?.role === 'customer'" (click)="startChat()">
        <ion-icon name="chatbubbles-outline" slot="start"></ion-icon>
        {{ 'MESSAGE_FARMER' | translate }}
      </ion-button>
      
      <div class="product-details">
        <h3>{{ 'DESCRIPTION' | translate }}</h3>
        <p>{{ product.description }}</p>
        
        <div class="product-meta">
          <div class="meta-item">
            <span class="label">{{ 'AVAILABLE' | translate }}:</span>
            <span class="value">{{ product.quantity }} {{ product.unit|uppercase|translate }}</span>
          </div>
          <div class="meta-item">
            <span class="label">{{ 'CATEGORY' | translate }}:</span>
            <span class="value">{{ product.category | uppercase | translate }}</span>
          </div>
          <div class="meta-item" *ngIf="product.timestamp">
            <span class="label">{{ 'POSTED_ON' | translate }}:</span>
            <span class="value">{{ formatTimestamp(product.timestamp) }}</span>
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
            {{ qty }} {{ product.unit  | uppercase | translate }}
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

  <!-- Admin button  -->
  <div class="action-button" *ngIf="product && currentUser?.role === 'admin'">
    <ion-button expand="block" (click)="editPost(product.id)">
      {{ 'Edit Post' | translate }}
    </ion-button>
  </div>
</ion-content>
`,
  styles: [`
    .product-image-gallery {
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
      
      .gallery-container {
        width: 100%;
        height: 100%;
      }
      
      .main-image {
        width: 100%;
        height: 100%;
        position: relative;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition);
        }
        
        .gallery-navigation {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 var(--spacing-md);
          pointer-events: none;
          
          .nav-button {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.4);
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            pointer-events: auto;
            transition: var(--transition);
            
            &:hover {
              background: rgba(0, 0, 0, 0.7);
            }
            
            ion-icon {
              font-size: 20px;
            }
          }
        }
        
        .image-indicators {
          position: absolute;
          bottom: var(--spacing-md);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 2;
          
          .indicator-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            cursor: pointer;
            transition: var(--transition);
            
            &.active {
              background: white;
              transform: scale(1.2);
            }
          }
        }
      }
      
      .thumbnail-strip {
        position: absolute;
        bottom: var(--spacing-sm);
        left: var(--spacing-md);
        right: var(--spacing-md);
        display: flex;
        gap: 8px;
        z-index: 2;
        overflow-x: auto;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
        
        &::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        
        .thumbnail {
          width: 48px;
          height: 48px;
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          flex-shrink: 0;
          transition: var(--transition);
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          &.active {
            border-color: white;
            transform: scale(1.1);
          }
          
          &:hover:not(.active) {
            border-color: rgba(255, 255, 255, 0.8);
          }
        }
      }
    }
    
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
      
      .view-profile-icon {
        color: var(--ion-color-medium);
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
  
  // Image gallery controls
  currentImageIndex: number = 0;
  get currentImageUrl(): string {
    if (this.product?.images && this.product.images.length > 0) {
      return this.product.images[this.currentImageIndex];
    }
    return 'assets/product-placeholder.jpg';
  }
  
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
      console.log('Current User:', this.currentUser);
    });
    
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProductById(productId).subscribe({
        next: (product) => {
          this.product = product;
          console.log('Product:', this.product);
          
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
  
  // Image gallery navigation methods
  nextImage() {
    if (this.product?.images && this.currentImageIndex < this.product.images.length - 1) {
      this.currentImageIndex++;
    } else {
      this.currentImageIndex = 0; // Loop back to the first image
    }
  }
  
  prevImage() {
    if (this.product?.images && this.currentImageIndex > 0) {
      this.currentImageIndex--;
    } else if (this.product?.images) {
      this.currentImageIndex = this.product.images.length - 1; // Loop to the last image
    }
  }
  
  setCurrentImage(index: number) {
    if (this.product?.images && index >= 0 && index < this.product.images.length) {
      this.currentImageIndex = index;
    }
  }
  
  // Helper method to safely format timestamp
  formatTimestamp(timestamp: Timestamp | null | undefined): string {
    if (!timestamp) {
      return 'Unknown date';
    }
    
    try {
      return timestamp.toDate().toLocaleDateString() + ' ' + timestamp.toDate().toLocaleTimeString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid date';
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
    console.log('Request button clicked');
    
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

  async editPost(productId: any) {
    console.log('Edit button clicked');
    
    try {
      if (!this.currentUser) {
        console.log('No user logged in');
        this.showErrorToast('Please log in to make request');
        return;
      }
      
      console.log('Current user role:', this.currentUser.role);
      if (this.currentUser.role !== 'admin') {
        this.showErrorToast('Only admin can make this requests');
        return;
      }
      
      await this.router.navigate(['/admin/products', productId]);
    } catch (error) {
      console.error('Error in editing post:', error);
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
      createdAt: Timestamp.fromDate(new Date()),
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