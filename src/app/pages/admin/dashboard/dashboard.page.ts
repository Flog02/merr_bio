import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, map } from 'rxjs';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, TranslatePipe,FormsModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ 'ADMIN_DASHBOARD' | translate }}</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment [(ngModel)]="currentSegment" (ionChange)="segmentChanged()">
          <ion-segment-button value="pending">
            <ion-label>{{ 'PENDING_APPROVAL' | translate }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="all">
            <ion-label>{{ 'ALL_PRODUCTS' | translate }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item-sliding *ngFor="let product of filteredProducts$ | async">
          <ion-item [routerLink]="['/admin/products', product.id]">
            <ion-label>
              <h2>{{ product.name }}</h2>
              <p>{{ product.price }} ALL - {{ product.quantity }} {{ product.unit }}</p>
              <p>{{ 'CATEGORY' | translate }}: {{ product.category }}</p>
              <p>{{ 'FARMER_ID' | translate }}: {{ product.farmerId }}</p>
            </ion-label>
            <ion-note slot="end" color="{{ product.approved ? 'success' : 'warning' }}">
              {{ product.approved ? ('APPROVED' | translate) : ('PENDING' | translate) }}
            </ion-note>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option *ngIf="!product.approved" color="success" (click)="approveProduct(product.id!)">
              <ion-icon slot="icon-only" name="checkmark"></ion-icon>
            </ion-item-option>
            <ion-item-option color="danger" (click)="deleteProduct(product.id!)">
              <ion-icon slot="icon-only" name="trash"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" routerLink="/admin/users">
        <ion-fab-button>
          <ion-icon name="people"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `
})
export class AdminDashboardPage implements OnInit {
  products$!: Observable<Product[]>;
  filteredProducts$!: Observable<Product[]>;
  currentSegment: 'pending' | 'all' = 'pending';

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.products$ = this.productService.getAllProductsForAdmin();
    this.segmentChanged();
  }

  segmentChanged() {
    if (this.currentSegment === 'pending') {
      this.filteredProducts$ = this.products$.pipe(
        map(products => products.filter(product => !product.approved))
      );
    } else {
      this.filteredProducts$ = this.products$;
    }
  }

  approveProduct(id: string) {
    this.productService.approveProduct(id).subscribe({
      next: () => {
        // Show success message
      },
      error: (error) => {
        console.error('Error approving product', error);
        // Show error message
      }
    });
  }

  deleteProduct(id: string) {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        // Show success message
      },
      error: (error) => {
        console.error('Error deleting product', error);
        // Show error message
      }
    });
  }
}