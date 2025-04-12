import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-admin-product-detail',
  standalone: true,
  imports: [IonicModule, CommonModule, TranslatePipe],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/admin/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ 'PRODUCT_DETAILS' | translate }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" *ngIf="product">
      <ion-img 
        src="https://via.placeholder.com/800x400?text=Product+Image" 
        alt="{{ product.name }}">
      </ion-img>

      <ion-card>
        <ion-card-header>
          <ion-card-title>{{ product.name }}</ion-card-title>
          <ion-card-subtitle>
            {{ product.price }} ALL per {{ product.unit }}
            <ion-badge color="{{ product.approved ? 'success' : 'warning' }}">
              {{ product.approved ? ('APPROVED' | translate) : ('PENDING' | translate) }}
            </ion-badge>
          </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <p><strong>{{ 'DESCRIPTION' | translate }}:</strong> {{ product.description }}</p>
          <p><strong>{{ 'AVAILABILITY' | translate }}:</strong> {{ product.quantity }} {{ product.unit }}</p>
          <p><strong>{{ 'CATEGORY' | translate }}:</strong> {{ product.category }}</p>
          <p><strong>{{ 'CREATED_AT' | translate }}:</strong> {{ product.timestamp.toDate() | date:'medium' }}</p>
        </ion-card-content>
      </ion-card>

      <ion-card *ngIf="farmer">
        <ion-card-header>
          <ion-card-title>{{ 'FARMER_INFORMATION' | translate }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p><strong>{{ 'NAME' | translate }}:</strong> {{ farmer.displayName }}</p>
          <p><strong>{{ 'EMAIL' | translate }}:</strong> {{ farmer.email }}</p>
          <p><strong>{{ 'PHONE' | translate }}:</strong> {{ farmer.phoneNumber }}</p>
          <p><strong>{{ 'LOCATION' | translate }}:</strong> {{ farmer.location }}</p>
        </ion-card-content>
      </ion-card>

      <div class="ion-padding">
        <ion-button expand="block" color="success" *ngIf="!product.approved" (click)="approveProduct()">
          {{ 'APPROVE_PRODUCT' | translate }}
        </ion-button>
        <ion-button expand="block" color="danger" (click)="deleteProduct()">
          {{ 'DELETE_PRODUCT' | translate }}
        </ion-button>
      </div>
    </ion-content>
  `
})
export class AdminProductDetailPage implements OnInit {
  product: Product | null = null;
  farmer: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private userService: UserService
  ) {}

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProductById(productId).subscribe(product => {
        this.product = product;
        
        if (product.farmerId) {
          this.userService.getUserById(product.farmerId).subscribe(farmer => {
            this.farmer = farmer;
          });
        }
      });
    }
  }

  approveProduct() {
    if (!this.product?.id) return;
    
    this.productService.approveProduct(this.product.id).subscribe({
      next: () => {
        this.product!.approved = true;
        // Show success message
      },
      error: (error) => {
        console.error('Error approving product', error);
        // Show error message
      }
    });
  }

  deleteProduct() {
    if (!this.product?.id) return;
    
    this.productService.deleteProduct(this.product.id).subscribe({
      next: () => {
        this.router.navigate(['/admin/dashboard']);
        // Show success message
      },
      error: (error) => {
        console.error('Error deleting product', error);
        // Show error message
      }
    });
  }
}