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
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ 'PRODUCTS' | translate }}</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar [formControl]="searchControl" placeholder="{{ 'SEARCH_PRODUCTS' | translate }}" animated></ion-searchbar>
      </ion-toolbar>
      <ion-toolbar>
        <div class="categories-scroller">
          <ion-chip [class.active]="categoryControl.value === 'all'" (click)="categoryControl.setValue('all')">
            <ion-label>{{ 'ALL' | translate }}</ion-label>
          </ion-chip>
          <ion-chip [class.active]="categoryControl.value === 'vegetables'" (click)="categoryControl.setValue('vegetables')">
            <ion-icon name="leaf"></ion-icon>
            <ion-label>{{ 'VEGETABLES' | translate }}</ion-label>
          </ion-chip>
          <ion-chip [class.active]="categoryControl.value === 'fruits'" (click)="categoryControl.setValue('fruits')">
            <ion-icon name="nutrition"></ion-icon>
            <ion-label>{{ 'FRUITS' | translate }}</ion-label>
          </ion-chip>
          <ion-chip [class.active]="categoryControl.value === 'dairy'" (click)="categoryControl.setValue('dairy')">
            <ion-icon name="water"></ion-icon>
            <ion-label>{{ 'DAIRY' | translate }}</ion-label>
          </ion-chip>
          <ion-chip [class.active]="categoryControl.value === 'other'" (click)="categoryControl.setValue('other')">
            <ion-icon name="grid"></ion-icon>
            <ion-label>{{ 'OTHER' | translate }}</ion-label>
          </ion-chip>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ng-container *ngIf="(filteredProducts$ | async) as products; else loading">
        <ion-grid>
          <ion-row>
            <ion-col size="12" size-sm="6" size-md="4" size-lg="3" *ngFor="let product of products">
              <ion-card class="product-card" [routerLink]="['/products', product.id]">
                <div class="card-img-container">
                  <img src="assets/product-placeholder.jpg" alt="{{ product.name }}">
                </div>
                <ion-card-content>
                  <div class="product-title">{{ product.name }}</div>
                  <div class="price">{{ product.price }} ALL <span class="unit">/ {{ product.unit }}</span></div>
                  <div class="availability">
                    {{ product.quantity }} {{ product.unit }} {{ 'AVAILABLE' | translate }}
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <div *ngIf="products?.length === 0" class="no-products ion-text-center ion-padding">
          <ion-icon name="basket-outline" size="large"></ion-icon>
          <h3>{{ 'NO_PRODUCTS_FOUND' | translate }}</h3>
          <p>{{ 'TRY_DIFFERENT_FILTER' | translate }}</p>
        </div>
      </ng-container>

      <ng-template #loading>
        <ion-grid>
          <ion-row>
            <ion-col size="12" size-sm="6" size-md="4" size-lg="3" *ngFor="let _ of [1,2,3,4,5,6]">
              <ion-card class="product-card">
                <ion-skeleton-text animated style="width: 100%; height: 160px;"></ion-skeleton-text>
                <ion-card-content>
                  <ion-skeleton-text animated style="width: 80%; height: 20px; margin-bottom: 10px;"></ion-skeleton-text>
                  <ion-skeleton-text animated style="width: 50%; height: 20px; margin-bottom: 10px;"></ion-skeleton-text>
                  <ion-skeleton-text animated style="width: 40%; height: 16px;"></ion-skeleton-text>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ng-template>
    </ion-content>
  `,
  styles: [`
    .categories-scroller {
      display: flex;
      overflow-x: auto;
      padding: 10px 16px;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
      
      ion-chip {
        margin-right: 8px;
        flex: 0 0 auto;
        --background: #f5f5f5;
        --color: var(--ion-color-dark);
        
        &.active {
          --background: var(--ion-color-primary);
          --color: white;
          font-weight: 500;
          
          ion-icon {
            color: white;
          }
        }
        
        ion-icon {
          color: var(--ion-color-primary);
          margin-right: 4px;
        }
      }
    }
    
    .product-card {
      margin: 12px 8px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      height: 100%;
      transition: transform 0.2s;
      
      &:active {
        transform: scale(0.98);
      }
      
      .card-img-container {
        height: 160px;
        overflow: hidden;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
      }
      
      &:hover .card-img-container img {
        transform: scale(1.05);
      }
      
      .product-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--ion-color-dark);
      }
      
      .price {
        font-size: 18px;
        font-weight: 700;
        color: var(--ion-color-primary);
        margin-bottom: 6px;
        
        .unit {
          font-size: 14px;
          font-weight: 400;
          color: var(--ion-text-color);
          opacity: 0.7;
        }
      }
      
      .availability {
        font-size: 14px;
        color: var(--ion-text-color);
        opacity: 0.7;
      }
    }
    
    .no-products {
      padding-top: 64px;
      
      ion-icon {
        font-size: 64px;
        color: var(--ion-color-medium);
      }
      
      h3 {
        margin-top: 16px;
        font-weight: 600;
      }
      
      p {
        color: var(--ion-color-medium);
      }
    }
  `]
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