// src/app/pages/products/product-list/product-list.page.ts
import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, combineLatest, map, startWith } from 'rxjs';
import { addIcons } from 'ionicons';
import { leaf, nutrition, water, grid, search, basketOutline, filterOutline } from 'ionicons/icons';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonMenuButton,
  IonSkeletonText,
  IonChip
} from '@ionic/angular/standalone';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    TranslatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonLabel,
    IonButtons,
    IonButton,
    IonIcon,
    IonMenuButton,
    IonSkeletonText,
    IonChip
],
  template: `<ion-header>
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-menu-button></ion-menu-button>
    </ion-buttons>
    <ion-title>{{ 'PRODUCTS' | translate }}</ion-title>
  </ion-toolbar>
  
  <ion-toolbar>
    <ion-searchbar [formControl]="searchControl" placeholder="{{ 'SEARCH_PRODUCTS' | translate }}" mode="ios" class="product-search"></ion-searchbar>
  </ion-toolbar>
</ion-header>

<ion-content>
  <!-- Categories -->
  <div class="categories-container">
    <div class="category-button" [class.active]="categoryControl.value === 'all'" (click)="categoryControl.setValue('all')">
      <div class="category-icon">
        <ion-icon name="apps-outline"></ion-icon>
      </div>
      <div class="category-name">{{ 'ALL' | translate }}</div>
    </div>
    
    <div class="category-button" [class.active]="categoryControl.value === 'vegetables'" (click)="categoryControl.setValue('vegetables')">
      <div class="category-icon">
        <ion-icon name="leaf-outline"></ion-icon>
      </div>
      <div class="category-name">{{ 'VEGETABLES' | translate }}</div>
    </div>
    
    <div class="category-button" [class.active]="categoryControl.value === 'fruits'" (click)="categoryControl.setValue('fruits')">
      <div class="category-icon">
        <ion-icon name="nutrition-outline"></ion-icon>
      </div>
      <div class="category-name">{{ 'FRUITS' | translate }}</div>
    </div>
    
    <div class="category-button" [class.active]="categoryControl.value === 'dairy'" (click)="categoryControl.setValue('dairy')">
      <div class="category-icon">
        <ion-icon name="water-outline"></ion-icon>
      </div>
      <div class="category-name">{{ 'DAIRY' | translate }}</div>
    </div>
    
    <div class="category-button" [class.active]="categoryControl.value === 'honey'" (click)="categoryControl.setValue('honey')">
      <div class="category-icon">
        <ion-icon name="color-fill-outline"></ion-icon>
      </div>
      <div class="category-name">{{ 'HONEY' | translate }}</div>
    </div>
    
    <div class="category-button" [class.active]="categoryControl.value === 'other'" (click)="categoryControl.setValue('other')">
      <div class="category-icon">
        <ion-icon name="grid-outline"></ion-icon>
      </div>
      <div class="category-name">{{ 'OTHER' | translate }}</div>
    </div>
  </div>

  <!-- Products Grid -->
  <div class="section-header">
    <h2>{{ 'PRODUCTS' | translate }}</h2>
  </div>

  <ng-container *ngIf="(filteredProducts$ | async) as products; else loading">
    <ion-grid>
      <ion-row>
        <ion-col size="6" *ngFor="let product of products">
          <ion-card class="product-card" [routerLink]="['/products', product.id]">
            <div class="card-img-container">
              <img src="assets/images/product-placeholder.jpg" alt="{{ product.name }}">
            </div>
            <ion-card-content>
              <div class="product-title">{{ product.name }}</div>
              <div class="price">{{ product.price }} ALL<span class="unit">/{{ product.unit }}</span></div>
              <div class="availability">{{ product.quantity }} {{ product.unit }} {{ 'AVAILABLE' | translate }}</div>
            </ion-card-content>
          </ion-card>
        </ion-col>
      </ion-row>
    </ion-grid>

    <div *ngIf="products?.length === 0" class="empty-state">
      <ion-icon name="basket-outline"></ion-icon>
      <h3>{{ 'NO_PRODUCTS_FOUND' | translate }}</h3>
      <p>{{ 'TRY_DIFFERENT_FILTER' | translate }}</p>
      <ion-button fill="outline" (click)="categoryControl.setValue('all')">
        {{ 'VIEW_ALL_PRODUCTS' | translate }}
      </ion-button>
    </div>
  </ng-container>

  <ng-template #loading>
    <ion-grid>
      <ion-row>
        <ion-col size="6" *ngFor="let _ of [1,2,3,4]">
          <ion-card class="skeleton-card">
            <ion-skeleton-text animated class="skeleton-image"></ion-skeleton-text>
            <ion-card-content>
              <ion-skeleton-text animated style="width: 85%; height: 16px; margin-bottom: 8px;"></ion-skeleton-text>
              <ion-skeleton-text animated style="width: 60%; height: 16px; margin-bottom: 8px;"></ion-skeleton-text>
              <ion-skeleton-text animated style="width: 40%; height: 14px;"></ion-skeleton-text>
            </ion-card-content>
          </ion-card>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ng-template>
</ion-content>`,
  styles: [`/* Additional styles for product list page */

    .custom-searchbar {
      --box-shadow: none;
      --border-radius: var(--border-radius-lg);
      --background: var(--ion-color-light);
      --color: var(--ion-color-dark);
      --placeholder-color: var(--ion-color-medium);
      --icon-color: var(--ion-color-primary);
      margin: 0 var(--spacing-sm);
      padding: 0;
    }
    
    .categories-scroller {
      display: flex;
      overflow-x: auto;
      padding: var(--spacing-sm) var(--spacing-md);
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      
      &::-webkit-scrollbar {
        display: none;
      }
      
      ion-chip {
        margin-right: var(--spacing-sm);
        flex: 0 0 auto;
        --background: rgba(var(--ion-color-light-rgb), 0.7);
        --color: var(--ion-color-dark);
        font-weight: 500;
        transition: all var(--transition-fast);
        
        &.active {
          --background: var(--ion-color-primary);
          --color: white;
          box-shadow: 0 2px 8px rgba(var(--ion-color-primary-rgb), 0.25);
          
          ion-icon {
            color: white;
          }
        }
        
        ion-icon {
          color: var(--ion-color-primary);
          font-size: 16px;
          margin-right: 4px;
        }
        
        &:active {
          transform: scale(0.95);
        }
      }
    }
    
    .product-card {
      margin: var(--spacing-sm);
      border-radius: var(--border-radius-lg);
      overflow: hidden;
      box-shadow: var(--box-shadow-soft);
      height: 100%;
      transition: transform var(--transition-medium), box-shadow var(--transition-medium);
      background: white;
      
      &:active {
        transform: scale(0.98);
      }
      
      .card-img-container {
        height: 180px;
        overflow: hidden;
        position: relative;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-medium);
        }
        
        .product-category-tag {
          position: absolute;
          top: var(--spacing-sm);
          right: var(--spacing-sm);
          background: rgba(var(--ion-color-primary-rgb), 0.9);
          color: white;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 100px;
          text-transform: capitalize;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      }
      
      &:hover .card-img-container img {
        transform: scale(1.05);
      }
      
      ion-card-content {
        padding: var(--spacing-md);
      }
      
      .product-title {
        font-size: 1.05rem;
        font-weight: 600;
        margin-bottom: var(--spacing-sm);
        color: var(--ion-color-dark);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;  
        overflow: hidden;
        min-height: 42px;
      }
      
      .price {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--ion-color-primary);
        margin-bottom: var(--spacing-xs);
        
        .unit {
          font-size: 0.9rem;
          font-weight: 400;
          color: var(--ion-text-color);
          opacity: 0.7;
        }
      }
      
      .availability {
        font-size: 0.9rem;
        color: var(--ion-color-medium);
      }
    }
    
    .skeleton-card {
      ion-skeleton-text {
        border-radius: var(--border-radius-md);
      }
    }
    
    .no-products {
      padding: var(--spacing-xl) var(--spacing-md);
      max-width: 500px;
      margin: 0 auto;
      
      ion-icon {
        font-size: 64px;
        color: var(--ion-color-medium);
        margin-bottom: var(--spacing-md);
      }
      
      h3 {
        margin-top: var(--spacing-md);
        font-weight: 600;
        color: var(--ion-color-dark);
        font-size: 1.3rem;
      }
      
      p {
        color: var(--ion-color-medium);
        margin: var(--spacing-md) auto;
        max-width: 300px;
        font-size: 1rem;
      }
      
      ion-button {
        margin-top: var(--spacing-md);
        --border-radius: var(--border-radius-md);
        font-weight: 500;
      }
    }
    
    /* Animation delays for list items */
    @for $i from 1 through 20 {
      .fade-in:nth-child(#{$i}) {
        animation-delay: #{$i * 0.05}s;
      }
    } `]
})
export class ProductListPage implements OnInit {
  products$!: Observable<Product[]>;
  filteredProducts$!: Observable<Product[]>;
  searchControl = new FormControl('');
  categoryControl = new FormControl('all');

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    addIcons({ leaf, nutrition, water, grid, search, basketOutline, filterOutline });
  }

  ngOnInit() {
    // Check for category query param
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.categoryControl.setValue(params['category']);
      }
    });
    
    this.products$ = this.productService.getProducts();

    this.filteredProducts$ = combineLatest([
      this.products$,
      this.searchControl.valueChanges.pipe(startWith('')),
      this.categoryControl.valueChanges.pipe(startWith('all'))
    ]).pipe(
      map(([products, searchTerm, category]) => {
        return products
          .filter(product => {
            // Filter by category
            if (category !== 'all' && product.category !== category) {
              return false;
            }
            
            // Filter by search term
            if (!searchTerm) {
              return true;
            }
            
            const search = searchTerm.toLowerCase();
            return product.name.toLowerCase().includes(search) ||
                   product.description.toLowerCase().includes(search);
          });
      })
    );
  }
}