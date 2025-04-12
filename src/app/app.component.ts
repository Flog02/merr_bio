import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { User } from './models/user.model';
import { 
  IonApp, 
  IonRouterOutlet, 
  IonSplitPane,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonMenuToggle,
  IonItem,
  IonIcon,
  IonLabel,
  IonButton,
  IonButtons
} from '@ionic/angular/standalone';
import { RouterLinkActive } from '@angular/router';
import { TranslatePipe } from "./pipes/translate.pipe";
import { LanguageSelectorComponent } from "./components/language-selector/language-selector.component";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [RouterLinkActive,
    CommonModule,
    RouterLink,
    IonApp,
    IonRouterOutlet,
    IonSplitPane,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonButton,
    IonButtons
    // Add any other components you need
    ,
    TranslatePipe,
    LanguageSelectorComponent
]
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        // Redirect handled by auth guard
      },
      error: (error) => {
        console.error('Logout error', error);
      }
    });
  }
}