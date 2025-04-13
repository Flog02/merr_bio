import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
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
        <ion-item *ngFor="let user of chatUsers$ | async" [routerLink]="['/chats', user.uid]">
          <ion-avatar slot="start">
            <img *ngIf="user.profileImage" [src]="user.profileImage" alt="{{ user.displayName }}">
            <ion-icon *ngIf="!user.profileImage" name="person"></ion-icon>
          </ion-avatar>
          <ion-label>
            <h2>{{ user.displayName || 'User' }}</h2>
            <p>{{ user.lastMessage || 'Start a conversation' }}</p>
          </ion-label>
          <ion-badge *ngIf="user.unreadCount > 0" slot="end">{{ user.unreadCount }}</ion-badge>
          <ion-note slot="end">{{ user.lastMessageTime | date:'shortTime' }}</ion-note>
        </ion-item>
        
        <ion-item *ngIf="(chatUsers$ | async)?.length === 0">
          <ion-label class="ion-text-center">
            <p>No conversations yet</p>
            <p>Start a chat with a farmer or customer</p>
          </ion-label>
        </ion-item>
      </ion-list>
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
    private userService: UserService
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.loadChats();
      }
    });
  }
  
  loadChats() {
    if (!this.currentUser) return;
    
    // This is a placeholder - you'll need to implement getUserChats in MessageService
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
}