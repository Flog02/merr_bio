import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {IonTextarea,IonSelect,IonSelectModal,IonInput,IonNote,IonBackButton,IonItem,IonLabel,IonSelectOption,IonHeader,IonTitle,IonButton,IonButtons,IonContent,IonToolbar}from '@ionic/angular/standalone'
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { Product } from '../../../models/product.model';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TranslatePipe } from "../../../pipes/translate.pipe";

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [IonTextarea, IonSelect, IonSelectModal, IonInput, IonNote, IonBackButton, IonItem, IonLabel, IonSelectOption, IonHeader, IonTitle, IonButton, IonButtons, IonContent, IonToolbar, CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/farmer/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEditMode ? 'Edit Product' : 'Add New Product' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
        <ion-item>
          <ion-label position="floating">{{ 'PRODUCT_NAME' | translate }}</ion-label>
          <ion-input formControlName="name"></ion-input>
          <ion-note slot="error" *ngIf="errorControl['name'].touched && errorControl['name'].errors?.['required']">
          {{ 'PRODUCT_REQUIRED' | translate }}
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="floating">{{ 'DESCRIPTION' | translate }}
          </ion-label>
          <ion-textarea rows="4" formControlName="description"></ion-textarea>
          <ion-note slot="error" *ngIf="errorControl['description'].touched && errorControl['description'].errors?.['required']">
                {{ 'DESCRIPTION_REQUIRED' | translate }}

          </ion-note>
        </ion-item>

        <ion-item>
  <ion-label position="floating">{{ 'CATEGORY' | translate }}</ion-label>
  <ion-select formControlName="category">
    <ion-select-option value="fruits">{{ 'FRUITS' | translate }}</ion-select-option>
    <ion-select-option value="vegetables">{{ 'VEGETABLES' | translate }}</ion-select-option>
    <ion-select-option value="dairy">{{ 'DAIRY' | translate }}</ion-select-option>
    <ion-select-option value="honey">{{ 'HONEY' | translate }}</ion-select-option>
    <ion-select-option value="wine">{{ 'WINE' | translate }}</ion-select-option>
    <ion-select-option value="oil">{{ 'OIL' | translate }}</ion-select-option>
    <ion-select-option value="other">{{ 'OTHER' | translate }}</ion-select-option>
  </ion-select>

  <ion-note slot="error" *ngIf="errorControl['category'].touched && errorControl['category'].errors?.['required']">
    {{ 'CATEGORY_REQUIRED' | translate }}
  </ion-note>
</ion-item>


<ion-item>
  <ion-label position="floating">{{ 'PRICE_ALL' | translate }}</ion-label>
  <ion-input type="number" formControlName="price"></ion-input>
  <ion-note slot="error" *ngIf="errorControl['price'].touched && errorControl['price'].errors?.['required']">
    {{ 'PRICE_REQUIRED' | translate }}
  </ion-note>
  <ion-note slot="error" *ngIf="errorControl['price'].touched && errorControl['price'].errors?.['min']">
    {{ 'PRICE_MIN' | translate }}
  </ion-note>
</ion-item>

<ion-item>
  <ion-label position="floating">{{ 'QUANTITY' | translate }}</ion-label>
  <ion-input type="number" formControlName="quantity"></ion-input>
  <ion-note slot="error" *ngIf="errorControl['quantity'].touched && errorControl['quantity'].errors?.['required']">
    {{ 'QUANTITY_REQUIRED' | translate }}
  </ion-note>
  <ion-note slot="error" *ngIf="errorControl['quantity'].touched && errorControl['quantity'].errors?.['min']">
    {{ 'QUANTITY_MIN' | translate }}
  </ion-note>
</ion-item>

<ion-item>
  <ion-label position="floating">{{ 'UNIT' | translate }}</ion-label>
  <ion-select formControlName="unit">
    <ion-select-option value="kg">{{ 'KG' | translate }}</ion-select-option>
    <ion-select-option value="liter">{{ 'LITER' | translate }}</ion-select-option>
    <ion-select-option value="piece">{{ 'PIECE' | translate }}</ion-select-option>
    <ion-select-option value="bunch">{{ 'BUNCH' | translate }}</ion-select-option>
  </ion-select>
  <ion-note slot="error" *ngIf="errorControl['unit'].touched && errorControl['unit'].errors?.['required']">
    {{ 'UNIT_REQUIRED' | translate }}
  </ion-note>
</ion-item>

<ion-button expand="block" type="submit" [disabled]="!productForm.valid" class="ion-margin-top">
  {{ isEditMode ? ('UPDATE_PRODUCT' | translate) : ('ADD_PRODUCT' | translate) }}
</ion-button>

      </form>
    </ion-content>
  `
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode = false;
  productId: string = '';
  farmerId: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.createForm();

    this.authService.user$.subscribe(user => {
      if (user) {
        this.farmerId = user.uid;
      }
    });

    this.route.params.pipe(
      switchMap(params => {
        if (params['id'] && params['id'] !== 'new') {
          this.isEditMode = true;
          this.productId = params['id'];
          return this.productService.getProductById(this.productId);
        }
        return of(null);
      })
    ).subscribe(product => {
      if (product) {
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          quantity: product.quantity,
          unit: product.unit
        });
      }
    });
  }

  createForm() {
    this.productForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      category: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(1)]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      unit: ['', [Validators.required]]
    });
  }

  get errorControl() {
    return this.productForm.controls;
  }

  onSubmit() {
    if (this.productForm.invalid) {
      return;
    }

    const productData: Partial<Product> = {
      ...this.productForm.value,
      farmerId: this.farmerId
    };

    if (this.isEditMode) {
      this.productService.updateProduct(this.productId, productData).subscribe({
        next: () => {
          this.router.navigate(['/farmer/dashboard']);
        },
        error: (error) => {
          console.error('Error updating product', error);
        }
      });
    } else {
      const newProduct = {
        ...productData,
        createdAt: new Date(),
        approved: false
      } as Omit<Product, 'id'>;

      this.productService.addProduct(newProduct).subscribe({
        next: () => {
          this.router.navigate(['/farmer/dashboard']);
        },
        error: (error) => {
          console.error('Error adding product', error);
        }
      });
    }
  }
}