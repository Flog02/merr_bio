import { Component, OnInit, Input } from '@angular/core';
import { ModalController,  } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import{IonItem,IonLabel,IonHeader,IonTitle,IonButton,IonButtons,IonIcon,IonContent,IonList,IonAvatar,IonToolbar}from '@ionic/angular/standalone'
import { TranslatePipe } from "../../pipes/translate.pipe";


@Component({
  selector: 'app-user-select-modal',
  standalone: true,
  imports: [CommonModule, CommonModule, IonItem, IonLabel, IonHeader, IonTitle, IonButton, IonButtons, IonIcon, IonContent, IonList, IonAvatar, IonToolbar, TranslatePipe],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>  {{ 'SELECT' | translate }} {{ (userType === 'farmer' ? 'FARMER' : 'CUSTOMER') | translate }}
</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item *ngFor="let user of users$ | async" (click)="selectUser(user.uid)">
          <ion-avatar slot="start">
            <img *ngIf="user.profileImage" [src]="user.profileImage">
            <ion-icon *ngIf="!user.profileImage" name="person"></ion-icon>
          </ion-avatar>
          <ion-label>
            <h2>{{ user.displayName || 'User' }}</h2>
            <p *ngIf="user.location">{{ user.location }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `
})
export class UserSelectModalComponent implements OnInit {
  @Input() userType: 'farmer' | 'customer' = 'farmer';
  users$!: Observable<User[]>;
  
  constructor(
    private userService: UserService,
    private modalController: ModalController
  ) {}
  
  ngOnInit() {
    this.users$ = this.userService.getUsersByRole(this.userType);
  }
  
  selectUser(userId: string) {
    this.modalController.dismiss({
      userId: userId
    });
  }
  
  dismiss() {
    this.modalController.dismiss();
  }
}