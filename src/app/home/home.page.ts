import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
  IonButtons, IonButton, IonIcon, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol,
  IonChip, IonLabel, IonAvatar, IonItem, IonBadge, IonMenuButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { leaf, nutrition, people, globe, basket, chatbubbles, person, arrowForward, water, grid, search } from 'ionicons/icons';
import { TranslatePipe } from '../pipes/translate.pipe';
import { AuthService } from '../services/auth.service';
import { ProductService } from '../services/product.service';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { User } from '../models/user.model'; 
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonMenuButton,
    
]
})
export class HomePage {
  currentUser: User | null = null;
  featuredProducts$: Observable<Product[]>;
  
  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private auth: Auth
  ) {
    addIcons({arrowForward,leaf,nutrition,water,grid,search,basket,chatbubbles,people,globe,person});
    
    this.featuredProducts$ = this.productService.getProducts();
    
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }
  
}