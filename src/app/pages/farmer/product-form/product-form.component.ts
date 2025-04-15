import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {IonNote,IonBackButton,IonItem,IonLabel,IonSelectOption,IonHeader,IonTitle,IonButton,IonButtons,IonContent,IonToolbar}from '@ionic/angular/standalone'
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { Product } from '../../../models/product.model';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [IonNote, IonBackButton, IonItem, IonLabel, IonSelectOption, IonHeader, IonTitle, IonButton, IonButtons, IonContent, IonToolbar, CommonModule, ReactiveFormsModule],
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
          <ion-label position="floating">Product Name</ion-label>
          <ion-input formControlName="name"></ion-input>
          <ion-note slot="error" *ngIf="errorControl['name'].touched && errorControl['name'].errors?.['required']">
            Product name is required
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Description</ion-label>
          <ion-textarea rows="4" formControlName="description"></ion-textarea>
          <ion-note slot="error" *ngIf="errorControl['description'].touched && errorControl['description'].errors?.['required']">
            Description is required
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Category</ion-label>
          <ion-select formControlName="category">
            <ion-select-option value="fruits">Fruits</ion-select-option>
            <ion-select-option value="vegetables">Vegetables</ion-select-option>
            <ion-select-option value="dairy">Dairy</ion-select-option>
            <ion-select-option value="honey">Honey</ion-select-option>
            <ion-select-option value="wine">Wine</ion-select-option>
            <ion-select-option value="oil">Oil</ion-select-option>
            <ion-select-option value="other">Other</ion-select-option>
          </ion-select>
          <ion-note slot="error" *ngIf="errorControl['category'].touched && errorControl['category'].errors?.['required']">
            Category is required
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Price (ALL)</ion-label>
          <ion-input type="number" formControlName="price"></ion-input>
          <ion-note slot="error" *ngIf="errorControl['price'].touched && errorControl['price'].errors?.['required']">
            Price is required
          </ion-note>
          <ion-note slot="error" *ngIf="errorControl['price'].touched && errorControl['price'].errors?.['min']">
            Price must be greater than 0
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Quantity</ion-label>
          <ion-input type="number" formControlName="quantity"></ion-input>
          <ion-note slot="error" *ngIf="errorControl['quantity'].touched && errorControl['quantity'].errors?.['required']">
            Quantity is required
          </ion-note>
          <ion-note slot="error" *ngIf="errorControl['quantity'].touched && errorControl['quantity'].errors?.['min']">
            Quantity must be greater than 0
          </ion-note>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Unit</ion-label>
          <ion-select formControlName="unit">
            <ion-select-option value="kg">Kg</ion-select-option>
            <ion-select-option value="liter">Liter</ion-select-option>
            <ion-select-option value="piece">Piece</ion-select-option>
            <ion-select-option value="bunch">Bunch</ion-select-option>
          </ion-select>
          <ion-note slot="error" *ngIf="errorControl['unit'].touched && errorControl['unit'].errors?.['required']">
            Unit is required
          </ion-note>
        </ion-item>

        <ion-button expand="block" type="submit" [disabled]="!productForm.valid" class="ion-margin-top">
          {{ isEditMode ? 'Update Product' : 'Add Product' }}
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