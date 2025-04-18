import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonButtons, IonToolbar, IonMenuButton, IonTitle, IonContent,
  IonList, IonItem, IonAvatar, IonIcon, IonLabel, IonBadge, IonNote,
  IonFab, IonFabButton, IonItemSliding, IonItemOptions, IonItemOption,
  AlertController, ToastController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { UserSelectModalComponent } from 'src/app/components/user-select-modal/user-select-modal.component';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, add, trash } from 'ionicons/icons';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [
    IonFab, IonNote, IonBadge, IonFabButton, IonMenuButton, IonItem, 
    IonLabel, IonHeader, IonTitle, IonButtons, IonIcon, IonContent, 
    IonList, IonAvatar, IonToolbar, CommonModule, RouterModule,
    IonItemSliding, IonItemOptions, IonItemOption
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Messages</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item-sliding *ngFor="let user of chatUsers$ | async">
          <ion-item [routerLink]="['/' + currentUser?.role + '/chats', user.uid]">
            <ion-avatar slot="start">
              <img *ngIf="user.profileImage" [src]="user.profileImage" alt="{{ user.displayName }}">
              <ion-icon *ngIf="!user.profileImage" name="person"></ion-icon>
            </ion-avatar>
            <ion-label>
              <h2>{{ user.displayName || 'User_NOT_FOUND' }}</h2>
              <p>{{ user.lastMessage || 'Start a conversation' }}</p>
            </ion-label>
            <ion-badge *ngIf="user.unreadCount > 0" slot="end">{{ user.unreadCount }}</ion-badge>
            <ion-note slot="end">
              {{ user.lastMessageTime ? (user.lastMessageTime.toDate() | date:'shortTime') : 'Not Available' }}
            </ion-note>
          </ion-item>
          
          <ion-item-options side="end">
            <ion-item-option color="danger" (click)="confirmDeleteChat(user)">
              <ion-icon slot="icon-only" name="trash"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
        
        <ion-item *ngIf="(chatUsers$ | async)?.length === 0">
          <ion-label class="ion-text-center">
            <p>No conversations yet</p>
            <p>Start a chat with a farmer or customer</p>
          </ion-label>
        </ion-item>
      </ion-list>
      
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="startNewChat()">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    ion-avatar {
      width: 40px;
      height: 40px;
      
      ion-icon {
        font-size: 24px;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--ion-color-medium);
        color: white;
      }
    }
    
    ion-badge {
      margin-right: 10px;
    }
  `]
})
export class ChatListComponent implements OnInit {
  chatUsers$: Observable<any[]> = of([]);
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private userService: UserService,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router
  ) {
    // Register icons
    addIcons({
      person,
      add,
      trash
    });
  }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.loadChats();
      }
    });
  }
  
  async startNewChat() {
    const modal = await this.modalController.create({
      component: UserSelectModalComponent,
      componentProps: {
        userType: this.currentUser?.role === 'customer' ? 'farmer' : 'customer'
      }
    });
  
    await modal.present();
    
    const { data } = await modal.onDidDismiss();
    if (data?.userId) {
      this.router.navigate([`/${this.currentUser?.role}/chats/${data.userId}`]);
    }
  }
  
  loadChats() {
    if (!this.currentUser) return;
    
    this.chatUsers$ = this.messageService.getUserConversations(this.currentUser.uid).pipe(
      switchMap(chats => {
        const userIds = chats.map(chat => chat.userId);
        
        if (userIds.length === 0) {
          return of([]);
        }
        
        // Fetch user details for each chat
        return combineLatest(
          userIds.map(userId => this.userService.getUserById(userId))
        ).pipe(
          map(users => {
            return users.map((user, index) => ({
              ...user,
              lastMessage: chats[index].lastMessage,
              lastMessageTime: chats[index].lastMessageTime,
              unreadCount: chats[index].unreadCount
            }));
          })
        );
      })
    );
  }
  
  async confirmDeleteChat(user: any) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete your conversation with ${user.displayName || 'this user'}? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteChat(user.uid);
          }
        }
      ]
    });

    await alert.present();
  }
  
  deleteChat(otherUserId: string) {
    if (!this.currentUser || !otherUserId) return;
    
    this.messageService.deleteConversation(this.currentUser.uid, otherUserId)
      .subscribe({
        next: () => {
          this.presentToast('Conversation deleted successfully');
          this.loadChats(); // Refresh the chat list
        },
        error: (error) => {
          console.error('Error deleting conversation:', error);
          this.presentToast('Failed to delete conversation', 'danger');
        }
      });
  }
  
  async presentToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: color
    });

    await toast.present();
  }
}